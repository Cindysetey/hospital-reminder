import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import Header from '../../components/common/Header';
import AppointmentList from '../../components/appointments/AppointmentList';
import UserManagement from './UserManagement';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsRes, usersRes] = await Promise.all([
        appointmentService.getAppointments(),
        userService.getUsers(),
      ]);

      if (appointmentsRes.success) {
        const allAppointments = appointmentsRes.data.appointments;
        setAppointments(allAppointments);
        setStats((prev) => ({
          ...prev,
          totalAppointments: allAppointments.length,
          pendingAppointments: allAppointments.filter((a) => a.status === 'pending').length,
          confirmedAppointments: allAppointments.filter((a) => a.status === 'confirmed').length,
        }));
      }

      if (usersRes.success) {
        setStats((prev) => ({
          ...prev,
          totalUsers: usersRes.data.users.length,
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const response = await appointmentService.confirmAppointment(appointmentId);
      if (response.success) {
        loadData();
      } else {
        alert(response.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await appointmentService.cancelAppointment(appointmentId);
        if (response.success) {
          loadData();
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
    <div className="dashboard admin-dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Welcome, {user?.name}</h1>
        <p className="dashboard-subtitle">Super Admin Dashboard</p>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            All Appointments
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Appointments</h3>
                  <p className="stat-number">{stats.totalAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Appointments</h3>
                  <p className="stat-number">{stats.pendingAppointments}</p>
                </div>
                <div className="stat-card">
                  <h3>Confirmed Appointments</h3>
                  <p className="stat-number">{stats.confirmedAppointments}</p>
                </div>
              </div>

              <div className="quick-access">
                <h2>Quick Access</h2>
                <div className="quick-access-grid">
                  <div className="access-card" onClick={() => setActiveTab('appointments')}>
                    <h3>View All Appointments</h3>
                    <p>Manage and view all appointments in the system</p>
                  </div>
                  <div className="access-card" onClick={() => setActiveTab('users')}>
                    <h3>User Management</h3>
                    <p>Create and manage doctors, PAs, and patients</p>
                  </div>
                  <div className="access-card" onClick={() => navigate('/patient/dashboard')}>
                    <h3>Patient View</h3>
                    <p>View the system as a patient would see it</p>
                  </div>
                  <div className="access-card" onClick={() => navigate('/pa/dashboard')}>
                    <h3>PA View</h3>
                    <p>View the system as a PA would see it</p>
                  </div>
                  <div className="access-card" onClick={() => navigate('/doctor/dashboard')}>
                    <h3>Doctor View</h3>
                    <p>View the system as a doctor would see it</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <h2>All Appointments</h2>
              <p className="section-description">
                View and manage all appointments in the system. You can confirm or cancel appointments.
              </p>
              <AppointmentList
                appointments={appointments}
                onConfirm={handleConfirmAppointment}
                onCancel={handleCancelAppointment}
                showActions={true}
              />
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
