const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const { sendResponse } = require('../../utils/helpers');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    console.log('Creating appointment:', req.body);
    console.log('User:', req.user.id, req.user.role);
    
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    // Validation
    if (!doctor || !appointmentDate || !appointmentTime || !reason) {
      console.log('Missing required fields');
      return sendResponse(res, 400, false, 'Please provide all required fields');
    }

    // Check if doctor exists
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || doctorExists.role !== 'doctor') {
      console.log('Invalid doctor:', doctor);
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
    await appointment.populate('doctor', 'name email specialization');

    console.log('Appointment created successfully:', appointment._id);
    
    sendResponse(res, 201, true, 'Appointment created successfully. Waiting for PA confirmation.', {
      appointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private (Admin/Super Admin)
exports.getAppointments = async (req, res) => {
  try {
    console.log('Fetching all appointments. User:', req.user.id, req.user.role);
    
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${appointments.length} appointments`);
    
    // Debug: Log first appointment if exists
    if (appointments.length > 0) {
      console.log('Sample appointment:', {
        id: appointments[0]._id,
        patient: appointments[0].patient?.name,
        doctor: appointments[0].doctor?.name,
        date: appointments[0].appointmentDate,
        status: appointments[0].status
      });
    }

    sendResponse(res, 200, true, 'Appointments retrieved successfully', { 
      appointments,
      count: appointments.length 
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    console.log('Fetching appointment by ID:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('doctor', 'name email specialization')
      .populate('confirmedBy', 'name email');

    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    console.log('Appointment found:', appointment._id);
    
    sendResponse(res, 200, true, 'Appointment retrieved successfully', { appointment });
  } catch (error) {
    console.error('Error getting appointment by ID:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Confirm appointment (PA)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (PA/Admin)
exports.confirmAppointment = async (req, res) => {
  try {
    console.log('Confirming appointment:', req.params.id);
    console.log('User confirming:', req.user.id, req.user.name);
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      console.log('Appointment not found for confirmation:', req.params.id);
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    console.log('Current appointment status:', appointment.status);
    
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return sendResponse(res, 400, false, 'Appointment is not pending');
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    appointment.confirmedBy = req.user.id;
    appointment.confirmedAt = new Date();

    await appointment.save();

    // Populate details
    await appointment.populate('patient', 'name email phone dateOfBirth address medicalHistory');
    await appointment.populate('doctor', 'name email specialization');
    await appointment.populate('confirmedBy', 'name email');

    console.log('Appointment confirmed successfully:', appointment._id);
    
    sendResponse(res, 200, true, 'Appointment confirmed successfully', { appointment });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    console.log('Cancelling appointment:', req.params.id);
    console.log('User cancelling:', req.user.id, req.user.role);
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      console.log('Appointment not found for cancellation:', req.params.id);
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    // Check if user has permission to cancel
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      console.log('Patient not authorized to cancel this appointment');
      return sendResponse(res, 403, false, 'Not authorized to cancel this appointment');
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    appointment.updatedAt = new Date();
    
    await appointment.save();

    console.log('Appointment cancelled successfully:', appointment._id);
    
    sendResponse(res, 200, true, 'Appointment cancelled successfully', { appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
exports.getPatientAppointments = async (req, res) => {
  try {
    console.log('Getting appointments for patient:', req.user.id);
    
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email specialization')
      .populate('confirmedBy', 'name email')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    console.log(`Found ${appointments.length} appointments for patient`);
    
    sendResponse(res, 200, true, 'Appointments retrieved successfully', { appointments });
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get doctor's appointments (confirmed)
// @route   GET /api/appointments/doctor/schedule
// @access  Private (Doctor)
exports.getDoctorAppointments = async (req, res) => {
  try {
    console.log('Getting schedule for doctor:', req.user.id);
    
    const appointments = await Appointment.find({
      doctor: req.user.id,
      status: APPOINTMENT_STATUS.CONFIRMED,
    })
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('confirmedBy', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    console.log(`Found ${appointments.length} confirmed appointments for doctor`);
    
    sendResponse(res, 200, true, 'Schedule retrieved successfully', { appointments });
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get pending appointments (PA)
// @route   GET /api/appointments/pending
// @access  Private (PA)
exports.getPendingAppointments = async (req, res) => {
  try {
    console.log('Getting pending appointments for PA:', req.user.id);
    
    const appointments = await Appointment.find({ status: APPOINTMENT_STATUS.PENDING })
      .populate('patient', 'name email phone dateOfBirth address medicalHistory')
      .populate('doctor', 'name email specialization')
      .sort({ createdAt: 1 });

    console.log(`Found ${appointments.length} pending appointments`);
    
    sendResponse(res, 200, true, 'Pending appointments retrieved successfully', { appointments });
  } catch (error) {
    console.error('Error getting pending appointments:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Debug/test appointments (Temporary for testing)
// @route   GET /api/appointments/debug/test
// @access  Public (for debugging only)
exports.testAppointments = async (req, res) => {
  try {
    console.log('Debug: Testing appointments endpoint');
    
    // Count all appointments
    const totalCount = await Appointment.countDocuments();
    
    // Get sample appointments
    const sampleAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .limit(5)
      .sort({ createdAt: -1 });

    // Get by status
    const pendingCount = await Appointment.countDocuments({ status: 'pending' });
    const confirmedCount = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledCount = await Appointment.countDocuments({ status: 'cancelled' });
    const completedCount = await Appointment.countDocuments({ status: 'completed' });

    console.log('Appointment counts:', {
      totalCount,
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount
    });

    sendResponse(res, 200, true, 'Appointment debug info', {
      totalCount,
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount,
      sampleAppointments: sampleAppointments.map(app => ({
        id: app._id,
        patient: app.patient?.name || 'No patient',
        doctor: app.doctor?.name || 'No doctor',
        date: app.appointmentDate,
        time: app.appointmentTime,
        status: app.status,
        reason: app.reason,
        createdAt: app.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in testAppointments:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private (Admin/PA)
exports.updateAppointment = async (req, res) => {
  try {
    console.log('Updating appointment:', req.params.id);
    console.log('Update data:', req.body);
    
    const { appointmentDate, appointmentTime, reason, status } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found for update:', req.params.id);
      return sendResponse(res, 404, false, 'Appointment not found');
    }

    // Update fields if provided
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (reason) appointment.reason = reason;
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      appointment.status = status;
    }
    
    appointment.updatedAt = new Date();
    
    await appointment.save();
    
    // Populate details
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialization');
    
    console.log('Appointment updated successfully:', appointment._id);
    
    sendResponse(res, 200, true, 'Appointment updated successfully', { appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private (Admin)
exports.getAppointmentStats = async (req, res) => {
  try {
    console.log('Getting appointment statistics');
    
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get weekly appointments
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7); // End of week
    
    const weeklyAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: weekStart,
        $lt: weekEnd
      }
    });
    
    // Get monthly appointments
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const monthlyAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: monthStart,
        $lt: nextMonthStart
      }
    });
    
    const stats = {
      total: totalAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      cancelled: cancelledAppointments,
      completed: completedAppointments,
      today: todayAppointments,
      weekly: weeklyAppointments,
      monthly: monthlyAppointments,
      confirmationRate: totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0,
      cancellationRate: totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0
    };
    
    console.log('Appointment statistics:', stats);
    
    sendResponse(res, 200, true, 'Appointment statistics retrieved successfully', { stats });
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    sendResponse(res, 500, false, error.message);
  }
};