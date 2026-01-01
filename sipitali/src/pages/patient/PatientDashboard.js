import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      if (response.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentCreated = () => {
    loadAppointments();
    setShowForm(false);
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  // Filter confirmed appointments for confirmation message
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === 'confirmed' && !apt.viewed
  );

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Welcome, {user?.name}</h1>
        <p className="dashboard-subtitle">Patient Dashboard</p>

        {confirmedAppointments.length > 0 && (
          <div className="confirmation-message">
            <h3>✓ Appointment Confirmed!</h3>
            <p>
              You have {confirmedAppointments.length} confirmed appointment
              {confirmedAppointments.length > 1 ? 's' : ''}. Check your appointments below.
            </p>
          </div>
        )}

        <div className="dashboard-actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Book New Appointment'}
          </button>
        </div>

        {showForm && (
          <div className="appointment-form-container">
            <AppointmentForm onSuccess={handleAppointmentCreated} />
          </div>
        )}

        <div className="appointments-section">
          <h2>My Appointments</h2>
          <AppointmentList appointments={appointments} />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

