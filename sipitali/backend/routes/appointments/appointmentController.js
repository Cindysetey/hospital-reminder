const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const { sendResponse } = require('../../utils/helpers');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    // Validation
    if (!doctor || !appointmentDate || !appointmentTime || !reason) {
      return sendResponse(res, 400, false, 'Please provide all required fields');
    }

    // Check if doctor exists
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || doctorExists.role !== 'doctor') {
      return sendResponse(res, 400, false, 'Invalid doctor');
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      status: APPOINTMENT_STATUS.PENDING,
    });

    // Populate patient and doctor details
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email');

    sendResponse(res, 201, true, 'Appointment created successfully. Waiting for PA confirmation.', {
      appointment,
    });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private (Super Admin)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Appointments retrieved successfully', { appointments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('doctor', 'name email')
      .populate('confirmedBy', 'name email');

    if (!appointment) {
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    sendResponse(res, 200, true, 'Appointment retrieved successfully', { appointment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Confirm appointment (PA)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (PA)
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return sendResponse(res, 400, false, 'Appointment is not pending');
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    appointment.confirmedBy = req.user.id;
    appointment.confirmedAt = new Date();

    await appointment.save();

    // Populate details
    await appointment.populate('patient', 'name email phone dateOfBirth address medicalHistory');
    await appointment.populate('doctor', 'name email');
    await appointment.populate('confirmedBy', 'name email');

    sendResponse(res, 200, true, 'Appointment confirmed successfully', { appointment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    // Check if user has permission to cancel
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Not authorized to cancel this appointment');
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    sendResponse(res, 200, true, 'Appointment cancelled successfully', { appointment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .populate('confirmedBy', 'name email')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    sendResponse(res, 200, true, 'Appointments retrieved successfully', { appointments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get doctor's appointments (confirmed)
// @route   GET /api/appointments/doctor/schedule
// @access  Private (Doctor)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.user.id,
      status: APPOINTMENT_STATUS.CONFIRMED,
    })
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('confirmedBy', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    sendResponse(res, 200, true, 'Schedule retrieved successfully', { appointments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get pending appointments (PA)
// @route   GET /api/appointments/pending
// @access  Private (PA)
exports.getPendingAppointments = async (req, res) => {
  try {
    // Get appointments for doctors that this PA is associated with
    // For now, we'll get all pending appointments
    // You can filter by doctorId if PAs are assigned to specific doctors
    const appointments = await Appointment.find({ status: APPOINTMENT_STATUS.PENDING })
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('doctor', 'name email')
      .sort({ createdAt: 1 });

    sendResponse(res, 200, true, 'Pending appointments retrieved successfully', { appointments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

