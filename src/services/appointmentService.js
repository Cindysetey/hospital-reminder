import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  getPendingAppointments: async () => {
    const response = await api.get('/appointments/pending');
    return response.data;
  },

  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor/schedule');
    return response.data;
  },

  confirmAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/confirm`);
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  getAppointmentById: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },
};

