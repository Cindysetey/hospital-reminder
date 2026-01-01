import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';

const PADashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getPendingAppointments();
      if (response.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      const response = await appointmentService.confirmAppointment(appointmentId);
      if (response.success) {
        loadAppointments(); // Reload to update the list
      } else {
        alert(response.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await appointmentService.cancelAppointment(appointmentId);
        if (response.success) {
          loadAppointments();
        } else {
          alert(response.message || 'Failed to cancel appointment');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Welcome, {user?.name}</h1>
        <p className="dashboard-subtitle">PA Dashboard</p>

        <div className="appointments-section">
          <h2>Pending Appointments</h2>
          <p className="section-description">
            Review and confirm pending appointments. Once confirmed, they will appear in the
            doctor's schedule.
          </p>
          <AppointmentList
            appointments={appointments}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PADashboard;

