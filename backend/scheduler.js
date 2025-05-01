const bookingService = require('./services/bookingService');

// Run every minute
const CHECK_INTERVAL = 60 * 1000;

async function checkAndCompleteBookings() {
  try {
    const completedCount = await bookingService.completeExpiredBookings();
    if (completedCount > 0) {
      console.log(`Completed ${completedCount} expired bookings`);
    }
  } catch (error) {
    console.error('Error in booking completion scheduler:', error);
  }
}

// Start the scheduler
function startScheduler() {
  // Run immediately on startup
  checkAndCompleteBookings();
  
  // Then run every minute
  setInterval(checkAndCompleteBookings, CHECK_INTERVAL);
}

module.exports = {
  startScheduler
}; 