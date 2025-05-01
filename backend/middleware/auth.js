const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Owner = require('../models/Owner');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user/owner from payload
    req.user = decoded;
    
    // Verify user/owner exists based on role
    if (decoded.role === 'user') {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }
      req.userData = user;
    } else if (decoded.role === 'owner') {
      const owner = await Owner.findById(decoded.ownerId);
      if (!owner) {
        return res.status(401).json({ msg: 'Owner not found' });
      }
      req.userData = owner;
    } else {
      return res.status(401).json({ msg: 'Invalid role' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
}; 