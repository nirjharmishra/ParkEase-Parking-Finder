const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const ParkingSpace = require('../models/ParkingSpace');
const Booking = require('../models/Booking');
const Owner = require('../models/Owner');

// Middleware to check if user is an owner
const isOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.user.ownerId);
    if (!owner) {
      return res.status(403).json({ msg: 'Access denied. Owner privileges required.' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add a new parking space
router.post('/parking-spaces', [auth, isOwner], async (req, res) => {
  try {
    const { name, address, coordinates, price, description, totalSpots } = req.body;

    const parkingSpace = new ParkingSpace({
      owner: req.user.ownerId,
      name,
      address,
      coordinates,
      price,
      description,
      totalSpots,
      availableSpots: totalSpots,
      isAvailable: true
    });

    await parkingSpace.save();
    res.json(parkingSpace);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get owner's parking spaces
router.get('/parking-spaces', [auth, isOwner], async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.find({ owner: req.user.ownerId });
    res.json(parkingSpaces);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update parking space
router.put('/parking-spaces/:id', [auth, isOwner], async (req, res) => {
  try {
    const { name, address, price, description, totalSpots } = req.body;

    // Validate required fields
    if (!name || !address || !price || !totalSpots) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Find the parking space
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ msg: 'Parking space not found' });
    }

    // Check if the owner owns this parking space
    if (parkingSpace.owner.toString() !== req.user.ownerId) {
      return res.status(403).json({ msg: 'Not authorized to update this parking space' });
    }

    // Get the number of active bookings
    const activeBookings = await Booking.find({
      parkingSpace: req.params.id,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    // Check if new totalSpots is less than active bookings
    if (totalSpots < activeBookings.length) {
      return res.status(400).json({ 
        msg: `Cannot reduce total spots below ${activeBookings.length} as there are active bookings` 
      });
    }

    // Calculate new available spots
    const currentBookedSpots = parkingSpace.totalSpots - parkingSpace.availableSpots;
    const newAvailableSpots = Math.max(0, totalSpots - currentBookedSpots);

    // Update the parking space
    const updatedSpace = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        address, 
        price, 
        description,
        totalSpots,
        availableSpots: newAvailableSpots,
        isAvailable: newAvailableSpots > 0
      },
      { new: true }
    );

    res.json(updatedSpace);
  } catch (err) {
    console.error('Error updating parking space:', err);
    res.status(500).json({ msg: 'Server error while updating parking space' });
  }
});

// Get bookings for owner's parking spaces
router.get('/bookings', [auth, isOwner], async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.find({ owner: req.user.ownerId });
    const parkingSpaceIds = parkingSpaces.map(ps => ps._id);
    
    const bookings = await Booking.find({ 
      parkingSpace: { $in: parkingSpaceIds }
    })
    .populate('user', 'name email phone')
    .populate('parkingSpace', 'name address price coordinates totalSpots availableSpots')
    .sort({ 
      status: 1, // Sort by status (active/confirmed first)
      startTime: -1 // Then by startTime in descending order
    });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete parking space
router.delete('/parking-spaces/:id', [auth, isOwner], async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ msg: 'Parking space not found' });
    }

    if (parkingSpace.owner.toString() !== req.user.ownerId) {
      return res.status(403).json({ msg: 'Not authorized to delete this parking space' });
    }

    // Check if there are any active bookings
    const activeBookings = await Booking.find({
      parkingSpace: req.params.id,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        msg: 'Cannot delete parking space with active bookings' 
      });
    }

    await ParkingSpace.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Parking space deleted successfully' });
  } catch (err) {
    console.error('Error deleting parking space:', err);
    res.status(500).json({ msg: 'Server error while deleting parking space' });
  }
});

// Cancel a booking
router.patch('/bookings/:id/cancel', [auth, isOwner], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the booking is for one of the owner's parking spaces
    const parkingSpace = await ParkingSpace.findById(booking.parkingSpace);
    if (!parkingSpace || parkingSpace.owner.toString() !== req.user.ownerId) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    }

    // Check if the booking can be cancelled
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
    parkingSpace.availableSpots = parkingSpace.availableSpots + 1;
    parkingSpace.isAvailable = true;
    await parkingSpace.save();

    res.json({ msg: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Toggle parking space active status
router.patch('/parking-spaces/:id/toggle-active', [auth, isOwner], async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ msg: 'Parking space not found' });
    }

    // Check if the owner owns this parking space
    if (parkingSpace.owner.toString() !== req.user.ownerId) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Check if there are any active bookings
    const activeBookings = await Booking.find({
      parkingSpace: req.params.id,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    if (activeBookings.length > 0 && parkingSpace.isActive) {
      return res.status(400).json({ 
        msg: 'Cannot deactivate parking space with active bookings' 
      });
    }

    // Toggle the active status
    parkingSpace.isActive = !parkingSpace.isActive;
    await parkingSpace.save();

    res.json({ 
      msg: `Parking space ${parkingSpace.isActive ? 'activated' : 'deactivated'} successfully`,
      parkingSpace 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 