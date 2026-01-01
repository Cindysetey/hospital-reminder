import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import Button from '../common/Button';
import '../../styles/components/AppointmentForm.css';

const AppointmentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await userService.getDoctors();
      if (response.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await appointmentService.createAppointment(formData);
      if (response.success) {
        setSuccess('Appointment booked successfully! Waiting for PA confirmation.');
        setFormData({
          doctor: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="appointment-form">
      <h2>Book Appointment</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="form-group">
        <label htmlFor="doctor">Select Doctor</label>
        <select
          id="doctor"
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} - {doctor.email}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="appointmentDate">Date</label>
        <input
          type="date"
          id="appointmentDate"
          name="appointmentDate"
          value={formData.appointmentDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="appointmentTime">Time</label>
        <input
          type="time"
          id="appointmentTime"
          name="appointmentTime"
          value={formData.appointmentTime}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="reason">Reason for Appointment</label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>
      <Button type="submit" variant="primary" disabled={loading} className="full-width">
        {loading ? 'Booking...' : 'Book Appointment'}
      </Button>
    </form>
  );
};

export default AppointmentForm;

