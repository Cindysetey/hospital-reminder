import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/pa-dashboard.css';

const PADashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'

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
    if (processing) return;
    
    setProcessing(true);
    try {
      const response = await appointmentService.confirmAppointment(appointmentId);
      if (response.success) {
        // Show success animation
        document.querySelector(`[data-appointment-id="${appointmentId}"]`)?.classList.add('confirmed-animation');
        setTimeout(() => loadAppointments(), 500);
      } else {
        alert(response.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm appointment');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      if (processing) return;
      
      setProcessing(true);
      try {
        const response = await appointmentService.cancelAppointment(appointmentId);
        if (response.success) {
          // Show cancellation animation
          document.querySelector(`[data-appointment-id="${appointmentId}"]`)?.classList.add('cancelled-animation');
          setTimeout(() => loadAppointments(), 500);
        } else {
          alert(response.message || 'Failed to cancel appointment');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel appointment');
      } finally {
        setProcessing(false);
      }
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  if (loading) {
    return (
      <div className="dashboard pa-dashboard">
        <Header />
        <Loading message="Loading pending appointments..." />
      </div>
    );
  }

  return (
    <div className="dashboard pa-dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome, {user?.name}</h1>
          <p className="welcome-subtitle">Physician Assistant Dashboard</p>
          <div className="welcome-message">
            <p>Review and manage pending appointments. Confirm appointments to add them to doctor schedules.</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon urgent">⚠️</div>
              <h3 className="stat-number">{appointments.length}</h3>
              <p className="stat-label">Pending Review</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon today">📅</div>
              <h3 className="stat-number">
                {appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length}
              </h3>
              <p className="stat-label">Today's Appointments</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon upcoming">⏰</div>
              <h3 className="stat-number">
                {appointments.filter(a => new Date(a.appointmentDate) > new Date()).length}
              </h3>
              <p className="stat-label">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="appointments-section">
          <div className="section-header">
            <h2>Pending Appointments</h2>
            <div className="filter-controls">
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setFilter('confirmed')}
                >
                  Confirmed
                </button>
                <button 
                  className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          <div className="section-description">
            <p>Review appointment requests and take action. Confirmed appointments will appear in doctors' schedules.</p>
            <div className="urgency-indicator">
              <span className="urgent-dot"></span>
              <span>Red border indicates urgent appointments</span>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No {filter === 'all' ? '' : filter} appointments</h3>
              <p>All appointment requests have been processed.</p>
            </div>
          ) : (
            <div className="appointments-content">
              <AppointmentList
                appointments={filteredAppointments}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                showActions={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PADashboard;