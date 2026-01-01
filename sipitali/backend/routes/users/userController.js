const User = require('../../models/User');
const { sendResponse } = require('../../utils/helpers');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Users retrieved successfully', { users });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Super Admin)
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    sendResponse(res, 201, true, 'User created successfully', {
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Super Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    sendResponse(res, 200, true, 'User updated successfully', { user });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('name email phone')
      .sort({ name: 1 });
    sendResponse(res, 200, true, 'Doctors retrieved successfully', { doctors });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

