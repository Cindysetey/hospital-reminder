import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/doctor-dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getDoctorAppointments();
      if (response.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's appointments
  const todayAppointments = appointments.filter(
    apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  );

  // Get upcoming appointments (excluding today)
  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.appointmentDate) > new Date() && 
    new Date(apt.appointmentDate).toDateString() !== new Date().toDateString()
  );

  const handleAppointmentComplete = async (appointmentId) => {
    // Implementation for marking appointment as complete
    console.log('Mark appointment as complete:', appointmentId);
  };

  const handleAddNotes = (appointmentId) => {
    // Implementation for adding notes
    console.log('Add notes for appointment:', appointmentId);
  };

  if (loading) {
    return (
      <div className="dashboard doctor-dashboard">
        <Header />
        <Loading message="Loading your schedule..." />
      </div>
    );
  }

  return (
    <div className="dashboard doctor-dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome, Dr. {user?.name}</h1>
          <p className="welcome-subtitle">Doctor Dashboard</p>
          <div className="welcome-message">
            <p>View your confirmed appointments, patient details, and manage your daily schedule.</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon today">📅</div>
              <h3 className="stat-number">{todayAppointments.length}</h3>
              <p className="stat-label">Today's Patients</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon upcoming">⏰</div>
              <h3 className="stat-number">{upcomingAppointments.length}</h3>
              <p className="stat-label">Upcoming</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon waiting">⏳</div>
              <h3 className="stat-number">{appointments.filter(a => a.status === 'waiting').length}</h3>
              <p className="stat-label">Waiting Room</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon completed">✅</div>
              <h3 className="stat-number">{appointments.filter(a => a.status === 'completed').length}</h3>
              <p className="stat-label">Completed Today</p>
            </div>
          </div>
        </div>

        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="view-icon">📋</span>
              List View
            </button>
            <button 
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <span className="view-icon">📅</span>
              Calendar View
            </button>
          </div>
          <div className="date-selector">
            <button className="date-nav" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
              ◀
            </button>
            <span className="current-date">{selectedDate.toDateString()}</span>
            <button className="date-nav" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
              ▶
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="appointments-section">
            <div className="section-header">
              <h2>My Schedule</h2>
              <div className="schedule-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Today</button>
                <button className="filter-btn">This Week</button>
              </div>
            </div>

            <div className="section-description">
              <p>View your confirmed appointments and patient details. Click on appointments for more options.</p>
            </div>

            {todayAppointments.length > 0 && (
              <div className="appointment-group">
                <h3 className="group-title">
                  <span className="today-indicator">●</span>
                  Today's Appointments ({todayAppointments.length})
                </h3>
                <AppointmentList 
                  appointments={todayAppointments}
                  showDoctorActions={true}
                  onComplete={handleAppointmentComplete}
                  onAddNotes={handleAddNotes}
                />
              </div>
            )}

            {upcomingAppointments.length > 0 && (
              <div className="appointment-group">
                <h3 className="group-title">
                  <span className="upcoming-indicator">●</span>
                  Upcoming Appointments ({upcomingAppointments.length})
                </h3>
                <AppointmentList 
                  appointments={upcomingAppointments}
                  showDoctorActions={true}
                  onComplete={handleAppointmentComplete}
                  onAddNotes={handleAddNotes}
                />
              </div>
            )}

            {appointments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👨‍⚕️</div>
                <h3>No Appointments Scheduled</h3>
                <p>Your schedule is clear for now. New appointments will appear here once confirmed by PAs.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-section">
            <div className="calendar-placeholder">
              <div className="calendar-icon">📅</div>
              <h3>Calendar View</h3>
              <p>Calendar view is coming soon. Currently showing list view.</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => setViewMode('list')}
              >
                Switch to List View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;