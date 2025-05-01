const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Owner = require('../models/Owner');
const auth = require('../middleware/auth');

// User Registration
router.post('/register/user', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Owner Registration
router.post('/register/owner', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('businessName').notEmpty().withMessage('Business name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, businessName } = req.body;

    // Check if owner already exists
    let owner = await Owner.findOne({ email });
    if (owner) {
      return res.status(400).json({ message: 'Owner already exists' });
    }

    // Create new owner
    owner = new Owner({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      businessName
    });

    await owner.save();

    res.status(201).json({ message: 'Owner registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user/owner data
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role === 'user') {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ ...user.toObject(), role: 'user' });
    } else {
      const owner = await Owner.findById(req.user.ownerId).select('-password');
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      return res.json({ ...owner.toObject(), role: 'owner' });
    }
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['user', 'owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    if (role === 'user') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const userData = { ...user.toObject(), role: 'user' };
      delete userData.password;
      res.json({ token, user: userData });
    } else {
      const owner = await Owner.findOne({ email });
      if (!owner) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, owner.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { ownerId: owner._id, role: 'owner' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const ownerData = { ...owner.toObject(), role: 'owner' };
      delete ownerData.password;
      res.json({ token, user: ownerData });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 