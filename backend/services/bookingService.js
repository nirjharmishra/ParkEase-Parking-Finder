const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');

const bookingService = {
  // Automatically complete bookings that have ended
  async completeExpiredBookings() {
    try {
      const now = new Date();
      const expiredBookings = await Booking.find({
        status: 'confirmed',
        endTime: { $lt: now }
      });

      for (const booking of expiredBookings) {
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
      }

      return expiredBookings.length;
    } catch (error) {
      console.error('Error completing expired bookings:', error);
      throw error;
    }
  },

  // Get booking status
  async getBookingStatus(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking.status;
    } catch (error) {
      console.error('Error getting booking status:', error);
      throw error;
    }
  }
};

module.exports = bookingService; 