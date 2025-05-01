const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const ParkingSpace = require('../models/ParkingSpace');
const Booking = require('../models/Booking');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get available parking spaces
router.get('/parking-spaces', auth, async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.find({ isActive: true });
    res.json(parkingSpaces);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a booking
router.post('/bookings', auth, async (req, res) => {
  try {
    console.log('Received booking request:', req.body);
    const { parkingSpaceId, startTime, endTime, vehicleNumber } = req.body;

    // Validate required fields
    if (!parkingSpaceId || !startTime || !endTime || !vehicleNumber) {
      console.log('Missing required fields:', { parkingSpaceId, startTime, endTime, vehicleNumber });
      return res.status(400).json({ 
        msg: 'Missing required fields',
        missing: {
          parkingSpaceId: !parkingSpaceId,
          startTime: !startTime,
          endTime: !endTime,
          vehicleNumber: !vehicleNumber
        }
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log('Invalid date format:', { startTime, endTime });
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    const parkingSpace = await ParkingSpace.findById(parkingSpaceId);
    if (!parkingSpace) {
      console.log('Parking space not found:', parkingSpaceId);
      return res.status(404).json({ msg: 'Parking space not found' });
    }

    if (parkingSpace.availableSpots <= 0) {
      console.log('No available spots in parking space:', parkingSpaceId);
      return res.status(400).json({ msg: 'No available spots in this parking space' });
    }

    // Check for active bookings with the same vehicle number
    const activeBookings = await Booking.find({
      vehicleNumber: vehicleNumber,
      status: { $in: ['confirmed', 'in-progress'] },
      endTime: { $gt: new Date() } // Only check bookings that haven't ended yet
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        msg: 'This vehicle already has an active booking. Please complete or cancel the existing booking before creating a new one.' 
      });
    }

    // Calculate duration in hours
    const durationInHours = (end - start) / (1000 * 60 * 60);
    if (durationInHours <= 0) {
      console.log('Invalid duration:', durationInHours);
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    const totalPrice = durationInHours * parkingSpace.price;

    const booking = new Booking({
      user: req.user.userId,
      parkingSpace: parkingSpaceId,
      startTime: start,
      endTime: end,
      vehicleNumber,
      totalPrice,
      status: 'confirmed'
    });

    console.log('Creating booking:', booking);
    await booking.save();
    
    // Update parking space availability
    parkingSpace.availableSpots = parkingSpace.availableSpots - 1;
    parkingSpace.isAvailable = parkingSpace.availableSpots > 0;
    await parkingSpace.save();

    console.log('Booking created successfully:', booking._id);
    res.json(booking);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ 
      msg: 'Server Error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get user's bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate({
        path: 'parkingSpace',
        select: 'name address price coordinates',
        model: 'ParkingSpace'
      })
      .sort({ startTime: -1 });

    // Filter out any bookings where parkingSpace is null (deleted)
    const validBookings = bookings.filter(booking => booking.parkingSpace !== null);
    
    res.json(validBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ 
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Cancel a booking
router.patch('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the booking belongs to the user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    }

    // Check if the booking can be cancelled (e.g., not already cancelled or completed)
    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel a completed booking' });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Update parking space availability
    const parkingSpace = await ParkingSpace.findById(booking.parkingSpace);
    if (parkingSpace) {
      parkingSpace.availableSpots = parkingSpace.availableSpots + 1;
      parkingSpace.isAvailable = true;
      await parkingSpace.save();
    }

    res.json({ msg: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add this route after the cancel booking route
router.patch('/bookings/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if user is authorized
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update booking status
    booking.status = 'completed';
    await booking.save();

    // Update parking space availability
    const parkingSpace = await ParkingSpace.findById(booking.parkingSpace);
    if (parkingSpace) {
      parkingSpace.availableSpots = parkingSpace.availableSpots + 1;
      parkingSpace.isAvailable = true;
      await parkingSpace.save();
    }

    res.json({ msg: 'Booking completed successfully', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 