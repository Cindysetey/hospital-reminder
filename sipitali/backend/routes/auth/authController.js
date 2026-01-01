const User = require('../../models/User');
const { generateToken, sendResponse } = require('../../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, dateOfBirth, address } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return sendResponse(res, 400, false, 'Please provide all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, 'User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      address,
    });

    // Generate token
    const token = generateToken(user._id);

    sendResponse(res, 201, true, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    sendResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

