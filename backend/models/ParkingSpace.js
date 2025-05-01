const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  totalSpots: {
    type: Number,
    required: true,
    default: 1
  },
  availableSpots: {
    type: Number,
    required: true,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema); 