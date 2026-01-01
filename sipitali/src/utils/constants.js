// Constants

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DOCTOR: 'doctor',
  PA: 'pa',
  PATIENT: 'patient',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

