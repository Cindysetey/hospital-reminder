import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/patient-dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(true);

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

  const handleDismissConfirmation = () => {
    setConfirmationVisible(false);
  };

  if (loading) {
    return (
      <div className="dashboard patient-dashboard">
        <Header />
        <Loading message="Loading your appointments..." />
      </div>
    );
  }

  // Filter confirmed appointments for confirmation message
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === 'confirmed' && !apt.viewed
  );

  return (
    <div className="dashboard patient-dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome, {user?.name}</h1>
          <p className="welcome-subtitle">Patient Dashboard</p>
          <div className="welcome-message">
            <p>Manage your appointments, view your medical history, and book new consultations.</p>
          </div>
        </div>

        {confirmationVisible && confirmedAppointments.length > 0 && (
          <div className="confirmation-message">
            <div className="confirmation-content">
              <div className="confirmation-icon">✓</div>
              <div className="confirmation-text">
                <h3>Appointment Confirmed!</h3>
                <p>
                  You have {confirmedAppointments.length} confirmed appointment
                  {confirmedAppointments.length > 1 ? 's' : ''}. Please check the details below.
                </p>
              </div>
              <button 
                className="confirmation-dismiss" 
                onClick={handleDismissConfirmation}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary book-appointment-btn"
          >
            <span className="btn-icon">+</span>
            <span>{showForm ? 'Cancel Booking' : 'Book New Appointment'}</span>
          </button>
        </div>

        {showForm && (
          <div className="appointment-form-container slide-in">
            <div className="form-header">
              <h2>New Appointment Booking</h2>
              <p>Please fill in the details for your appointment</p>
            </div>
            <AppointmentForm onSuccess={handleAppointmentCreated} />
          </div>
        )}

        <div className="appointments-section">
          <div className="section-header">
            <h2>My Appointments</h2>
            <div className="appointment-stats">
              <span className="stat-badge total">{appointments.length} Total</span>
              <span className="stat-badge confirmed">
                {appointments.filter(a => a.status === 'confirmed').length} Confirmed
              </span>
              <span className="stat-badge pending">
                {appointments.filter(a => a.status === 'pending').length} Pending
              </span>
            </div>
          </div>
          
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Appointments Yet</h3>
              <p>Book your first appointment to get started with our healthcare services.</p>
              <button 
                onClick={() => setShowForm(true)} 
                className="btn btn-secondary"
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="appointments-content fade-in">
              <AppointmentList appointments={appointments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;