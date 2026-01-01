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
} = require('./appointmentController');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/roleCheck');

// All routes are protected
router.use(protect);

// Patient routes
router.post('/', authorize('patient', 'super_admin'), createAppointment);
router.get('/my-appointments', authorize('patient', 'super_admin'), getPatientAppointments);

// PA routes
router.get('/pending', authorize('pa', 'super_admin'), getPendingAppointments);
router.put('/:id/confirm', authorize('pa', 'super_admin'), confirmAppointment);

// Doctor routes
router.get('/doctor/schedule', authorize('doctor', 'super_admin'), getDoctorAppointments);

// Admin routes
router.get('/', authorize('super_admin'), getAppointments);
router.get('/:id', authorize('super_admin', 'doctor', 'pa'), getAppointmentById);
router.put('/:id/cancel', authorize('patient', 'pa', 'super_admin'), cancelAppointment);

module.exports = router;

