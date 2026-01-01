import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import AppointmentList from '../../components/appointments/AppointmentList';
import Loading from '../../components/common/Loading';
import Header from '../../components/common/Header';
import '../../styles/pages/Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Welcome, Dr. {user?.name}</h1>
        <p className="dashboard-subtitle">Doctor Dashboard</p>

        <div className="appointments-section">
          <h2>My Schedule</h2>
          <p className="section-description">
            View your confirmed appointments and patient details.
          </p>
          <AppointmentList appointments={appointments} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

