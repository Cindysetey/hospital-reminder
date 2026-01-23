const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  updateAppointment,
  getAppointmentStats,
  testAppointments
} = require('./appointmentController');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/roleCheck');

// All routes are protected
router.use(protect);

// Debug/test route (temporary - remove in production)
router.get('/debug/test', testAppointments);

// Patient routes
router.post('/', authorize('patient', 'super_admin', 'admin'), createAppointment);
router.get('/my-appointments', authorize('patient', 'super_admin', 'admin'), getPatientAppointments);

// PA routes
router.get('/pending', authorize('pa', 'super_admin', 'admin'), getPendingAppointments);
router.put('/:id/confirm', authorize('pa', 'super_admin', 'admin'), confirmAppointment);

// Doctor routes
router.get('/doctor/schedule', authorize('doctor', 'super_admin', 'admin'), getDoctorAppointments);

// Admin routes
router.get('/', authorize('super_admin', 'admin'), getAppointments);
router.get('/stats', authorize('super_admin', 'admin'), getAppointmentStats);
router.get('/:id', authorize('super_admin', 'admin', 'doctor', 'pa'), getAppointmentById);
router.put('/:id', authorize('super_admin', 'admin', 'pa'), updateAppointment);
router.put('/:id/cancel', authorize('patient', 'pa', 'super_admin', 'admin'), cancelAppointment);

module.exports = router;