const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDoctors,
} = require('./userController');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/roleCheck');

// All routes are protected
router.use(protect);

// Get all doctors (for patient to select when booking)
router.get('/doctors', getDoctors);

// Admin routes
router.get('/', authorize('super_admin'), getUsers);
router.post('/', authorize('super_admin'), createUser);
router.get('/:id', authorize('super_admin', 'doctor', 'pa'), getUserById);
router.put('/:id', authorize('super_admin'), updateUser);
router.delete('/:id', authorize('super_admin'), deleteUser);

module.exports = router;

