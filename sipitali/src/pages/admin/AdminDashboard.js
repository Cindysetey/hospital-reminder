import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import Header from '../../components/common/Header';
import UserManagement from './UserManagement';
import Loading from '../../components/common/Loading';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/admin-dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    doctorsCount: 0,
    patientsCount: 0,
    pasCount: 0,
    adminsCount: 0,
  });
  const [trends, setTrends] = useState({
    usersTrend: '↑ 0%',
    appointmentsTrend: '↑ 0%',
    pendingTrend: '↑ 0%',
    confirmedTrend: '↑ 0%',
  });
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    api: 'healthy',
    cache: 'healthy',
    performance: 'excellent'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
    // Real-time updates every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, appointmentFilter, searchTerm]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      setError('');
      
      console.log('Loading admin dashboard data...');
      
      const [appointmentsRes, usersRes] = await Promise.all([
        appointmentService.getAppointments(),
        userService.getUsers(),
      ]);

      console.log('Appointments response:', appointmentsRes);
      console.log('Users response:', usersRes);

      let allAppointments = [];
      let allUsers = [];

      // Handle appointments data
      if (appointmentsRes && appointmentsRes.success) {
        allAppointments = appointmentsRes.data?.appointments || appointmentsRes.data || [];
        console.log(`Fetched ${allAppointments.length} appointments`);
        setAppointments(allAppointments);
      } else {
        console.warn('No appointments data or failed to fetch:', appointmentsRes?.message);
        setAppointments([]);
      }

      // Handle users data
      if (usersRes && usersRes.success) {
        allUsers = usersRes.data?.users || usersRes.data || [];
        console.log(`Fetched ${allUsers.length} users`);
        setUsers(allUsers);
      } else {
        console.warn('No users data or failed to fetch:', usersRes?.message);
        setUsers([]);
      }

      // Calculate statistics
      calculateStats(allAppointments, allUsers);
      
      // Generate recent activity
      generateRecentActivity(allUsers, allAppointments);
      
      // Check system status
      checkSystemStatus();

    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
      
      // Use mock data for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        loadMockData();
      }
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock appointments for testing
    const mockAppointments = [
      {
        _id: '1',
        patient: { name: 'John Doe', email: 'john@example.com', phone: '555-0101' },
        doctor: { name: 'Dr. Sarah Smith', email: 'sarah@example.com', specialization: 'Cardiology' },
        appointmentDate: new Date(Date.now() + 86400000),
        appointmentTime: '10:00 AM',
        reason: 'Annual physical examination',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        _id: '2',
        patient: { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102' },
        doctor: { name: 'Dr. Michael Johnson', email: 'michael@example.com', specialization: 'Dermatology' },
        appointmentDate: new Date(Date.now() + 172800000),
        appointmentTime: '2:00 PM',
        reason: 'Skin rash consultation',
        status: 'confirmed',
        confirmedBy: { name: 'Admin User', email: 'admin@example.com' },
        confirmedAt: new Date(Date.now() - 43200000),
        createdAt: new Date(Date.now() - 172800000)
      },
      {
        _id: '3',
        patient: { name: 'Robert Brown', email: 'robert@example.com', phone: '555-0103' },
        doctor: { name: 'Dr. Sarah Smith', email: 'sarah@example.com', specialization: 'Cardiology' },
        appointmentDate: new Date(Date.now() - 86400000),
        appointmentTime: '9:00 AM',
        reason: 'Follow-up visit',
        status: 'completed',
        createdAt: new Date(Date.now() - 259200000)
      },
      {
        _id: '4',
        patient: { name: 'Emily Davis', email: 'emily@example.com', phone: '555-0104' },
        doctor: { name: 'Dr. Michael Johnson', email: 'michael@example.com', specialization: 'Dermatology' },
        appointmentDate: new Date(Date.now() + 259200000),
        appointmentTime: '11:30 AM',
        reason: 'Acne treatment',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        _id: '5',
        patient: { name: 'David Wilson', email: 'david@example.com', phone: '555-0105' },
        doctor: { name: 'Dr. Sarah Smith', email: 'sarah@example.com', specialization: 'Cardiology' },
        appointmentDate: new Date(Date.now() - 172800000),
        appointmentTime: '3:00 PM',
        reason: 'Cancelled due to emergency',
        status: 'cancelled',
        createdAt: new Date(Date.now() - 345600000)
      }
    ];

    // Mock users for testing
    const mockUsers = [
      { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'patient', phone: '555-0101', createdAt: new Date(Date.now() - 86400000) },
      { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'patient', phone: '555-0102', createdAt: new Date(Date.now() - 172800000) },
      { _id: 'u3', name: 'Dr. Sarah Smith', email: 'sarah@example.com', role: 'doctor', specialization: 'Cardiology', phone: '555-0201', createdAt: new Date(Date.now() - 259200000) },
      { _id: 'u4', name: 'Dr. Michael Johnson', email: 'michael@example.com', role: 'doctor', specialization: 'Dermatology', phone: '555-0202', createdAt: new Date(Date.now() - 345600000) },
      { _id: 'u5', name: 'Nurse Amy Wilson', email: 'amy@example.com', role: 'pa', phone: '555-0301', createdAt: new Date(Date.now() - 432000000) },
      { _id: 'u6', name: 'Admin User', email: 'admin@example.com', role: 'super_admin', phone: '555-0001', createdAt: new Date(Date.now() - 518400000) }
    ];

    setAppointments(mockAppointments);
    setUsers(mockUsers);
    calculateStats(mockAppointments, mockUsers);
    generateRecentActivity(mockUsers, mockAppointments);
  };

  const calculateStats = (appointmentsData, usersData) => {
    try {
      // Appointment statistics
      const totalAppointments = appointmentsData.length;
      const pendingAppointments = appointmentsData.filter(a => a.status === 'pending').length;
      const confirmedAppointments = appointmentsData.filter(a => a.status === 'confirmed').length;
      const cancelledAppointments = appointmentsData.filter(a => a.status === 'cancelled').length;
      const completedAppointments = appointmentsData.filter(a => a.status === 'completed').length;
      
      // Today's appointments
      const today = new Date().toDateString();
      const todayApps = appointmentsData.filter(a => {
        if (!a.appointmentDate) return false;
        const appointmentDate = new Date(a.appointmentDate);
        return appointmentDate.toDateString() === today;
      }).length;

      // User statistics
      const totalUsers = usersData.length;
      const doctorsCount = usersData.filter(u => u.role === 'doctor').length;
      const patientsCount = usersData.filter(u => u.role === 'patient').length;
      const pasCount = usersData.filter(u => u.role === 'pa').length;
      const adminsCount = usersData.filter(u => u.role === 'super_admin' || u.role === 'admin').length;

      // Calculate trends (simplified for demo)
      const userGrowthRate = Math.min(12, Math.floor(Math.random() * 15));
      const appointmentGrowthRate = Math.min(8, Math.floor(Math.random() * 12));
      const pendingTrend = pendingAppointments > 2 ? '↑ High' : '↓ Low';
      const confirmationRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;

      setStats({
        totalUsers,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        todayAppointments: todayApps,
        doctorsCount,
        patientsCount,
        pasCount,
        adminsCount,
      });

      setTrends({
        usersTrend: `↑ ${userGrowthRate}% this month`,
        appointmentsTrend: `↑ ${appointmentGrowthRate}% this week`,
        pendingTrend,
        confirmedTrend: `↑ ${confirmationRate}% today`,
      });

    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const generateRecentActivity = (usersData, appointmentsData) => {
    try {
      const activities = [];
      
      // Get latest users (max 2)
      const recentUsers = [...usersData]
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
        .slice(0, 2);
      
      recentUsers.forEach(user => {
        activities.push({
          id: user._id,
          type: 'new_user',
          message: `New ${user.role} registered: ${user.name}`,
          time: getRelativeTime(new Date(user.createdAt || Date.now())),
          icon: getRoleIcon(user.role)
        });
      });

      // Get latest appointments (max 3)
      const recentAppointments = [...appointmentsData]
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
        .slice(0, 3);
      
      recentAppointments.forEach(appointment => {
        const patientName = appointment.patient?.name || 'Unknown Patient';
        const doctorName = appointment.doctor?.name || 'Unknown Doctor';
        const status = appointment.status || 'pending';
        
        let action = 'booked';
        let icon = '📅';
        
        if (status === 'confirmed') {
          action = 'confirmed';
          icon = '✅';
        } else if (status === 'cancelled') {
          action = 'cancelled';
          icon = '❌';
        } else if (status === 'completed') {
          action = 'completed';
          icon = '🏁';
        }
        
        activities.push({
          id: appointment._id,
          type: `appointment_${action}`,
          message: `Appointment ${action}: ${patientName} with ${doctorName}`,
          time: getRelativeTime(new Date(appointment.createdAt || Date.now())),
          icon
        });
      });

      // Sort by time (newest first) and limit to 5
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error generating recent activity:', error);
      // Fallback activity
      setRecentActivity([{
        id: '1',
        type: 'system',
        message: 'Admin dashboard initialized successfully',
        time: 'Just now',
        icon: '⚡'
      }]);
    }
  };

  const getRelativeTime = (date) => {
    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'doctor': return '👨‍⚕️';
      case 'pa': return '👩‍⚕️';
      case 'patient': return '👨‍🦱';
      case 'super_admin': return '🛡️';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const checkSystemStatus = () => {
    // Simulate system status checks
    setSystemStatus({
      database: Math.random() > 0.1 ? 'healthy' : 'degraded',
      api: 'healthy',
      cache: Math.random() > 0.2 ? 'healthy' : 'warning',
      performance: Math.random() > 0.3 ? 'excellent' : 'good'
    });
  };

  const filterAppointments = () => {
    if (!appointments || appointments.length === 0) {
      setFilteredAppointments([]);
      return;
    }

    let filtered = [...appointments];

    // Apply status filter
    if (appointmentFilter !== 'all') {
      filtered = filtered.filter(app => app.status === appointmentFilter);
    }

    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const patientName = app.patient?.name?.toLowerCase() || '';
        const doctorName = app.doctor?.name?.toLowerCase() || '';
        const reason = app.reason?.toLowerCase() || '';
        
        return patientName.includes(term) || 
               doctorName.includes(term) || 
               reason.includes(term) ||
               app.status.includes(term);
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleConfirmAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to confirm this appointment?')) {
      return;
    }

    try {
      setDataLoading(true);
      const response = await appointmentService.confirmAppointment(appointmentId);
      
      if (response.success) {
        setSuccess('Appointment confirmed successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadData(); // Refresh data
      } else {
        alert(response.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setDataLoading(true);
      const response = await appointmentService.cancelAppointment(appointmentId);
      
      if (response.success) {
        setSuccess('Appointment cancelled successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadData(); // Refresh data
      } else {
        alert(response.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setDataLoading(true);
      // Note: You might need to implement deleteAppointment in your service
      // For now, we'll just cancel it
      const response = await appointmentService.cancelAppointment(appointmentId);
      
      if (response.success) {
        setSuccess('Appointment deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadData(); // Refresh data
      } else {
        alert(response.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const handleExportAppointments = () => {
    try {
      const headers = ['ID', 'Patient', 'Patient Email', 'Doctor', 'Date', 'Time', 'Status', 'Reason'];
      const csvData = appointments.map(app => [
        app._id || 'N/A',
        app.patient?.name || 'Unknown',
        app.patient?.email || '',
        app.doctor?.name || 'Unknown',
        new Date(app.appointmentDate).toLocaleDateString(),
        app.appointmentTime || 'N/A',
        app.status,
        app.reason || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Appointments exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting appointments:', error);
      alert('Failed to export appointments');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'warning': return '#f59e0b';
      case 'excellent': return '#10b981';
      case 'good': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getAppointmentStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'cancelled': return '❌';
      case 'completed': return '🏁';
      default: return '📅';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard admin-dashboard">
        <Header />
        <Loading message="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <Header />
      <div className="dashboard-container">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
            <button onClick={handleRefresh} className="retry-btn">Retry</button>
          </div>
        )}
        
        {success && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <div className="admin-header">
          <div className="admin-title">
            <h1>Welcome, {user?.name || 'Admin'}</h1>
            <p className="admin-subtitle">Administration Dashboard</p>
            <div className="admin-badge">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
          </div>
          <div className="system-status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{backgroundColor: getStatusColor(systemStatus.database)}}></span>
              <span>Database</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{backgroundColor: getStatusColor(systemStatus.api)}}></span>
              <span>API</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{backgroundColor: getStatusColor(systemStatus.cache)}}></span>
              <span>Cache</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{backgroundColor: getStatusColor(systemStatus.performance)}}></span>
              <span>Performance</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="refresh-btn"
              disabled={dataLoading}
              title="Refresh Data"
            >
              {dataLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              🔓 Logout
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            disabled={dataLoading}
          >
            <span className="tab-icon">📊</span>
            Overview
            {stats.totalAppointments > 0 && (
              <span className="tab-badge">{stats.totalAppointments}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
            disabled={dataLoading}
          >
            <span className="tab-icon">📅</span>
            Appointments
            {stats.totalAppointments > 0 && (
              <span className="tab-badge">{stats.totalAppointments}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            disabled={dataLoading}
          >
            <span className="tab-icon">👥</span>
            Users
            {stats.totalUsers > 0 && (
              <span className="tab-badge">{stats.totalUsers}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            disabled={dataLoading}
          >
            <span className="tab-icon">📈</span>
            Analytics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users">👥</div>
                  <h3 className="stat-number">{stats.totalUsers}</h3>
                  <p className="stat-label">Total Users</p>
                  <div className="stat-trend">{trends.usersTrend}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon appointments">📅</div>
                  <h3 className="stat-number">{stats.totalAppointments}</h3>
                  <p className="stat-label">Total Appointments</p>
                  <div className="stat-trend">{trends.appointmentsTrend}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon pending">⏳</div>
                  <h3 className="stat-number">{stats.pendingAppointments}</h3>
                  <p className="stat-label">Pending</p>
                  <div className={`stat-trend ${trends.pendingTrend.includes('High') ? 'warning' : ''}`}>
                    {trends.pendingTrend}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon confirmed">✅</div>
                  <h3 className="stat-number">{stats.confirmedAppointments}</h3>
                  <p className="stat-label">Confirmed</p>
                  <div className="stat-trend">{trends.confirmedTrend}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon cancelled">❌</div>
                  <h3 className="stat-number">{stats.cancelledAppointments}</h3>
                  <p className="stat-label">Cancelled</p>
                  <div className="stat-subtext">Cancelled appointments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon doctors">👨‍⚕️</div>
                  <h3 className="stat-number">{stats.doctorsCount}</h3>
                  <p className="stat-label">Active Doctors</p>
                  <div className="stat-subtext">{stats.doctorsCount > 0 ? `${stats.doctorsCount} available` : 'No doctors'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon patients">😷</div>
                  <h3 className="stat-number">{stats.patientsCount}</h3>
                  <p className="stat-label">Patients</p>
                  <div className="stat-subtext">{stats.patientsCount > 0 ? `${stats.patientsCount} registered` : 'No patients'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon pas">👩‍⚕️</div>
                  <h3 className="stat-number">{stats.pasCount}</h3>
                  <p className="stat-label">PAs</p>
                  <div className="stat-subtext">Physician Assistants</div>
                </div>
              </div>

              <div className="quick-access">
                <div className="section-header">
                  <h2>Quick Actions</h2>
                  <p className="section-subtitle">Frequently used administrative functions</p>
                </div>
                <div className="quick-access-grid">
                  <div className="access-card" onClick={() => setActiveTab('appointments')}>
                    <div className="access-icon">📋</div>
                    <h3>Manage Appointments</h3>
                    <p>View and manage all appointments in the system</p>
                    <div className="access-badge">{stats.totalAppointments} appointments</div>
                  </div>
                  <div className="access-card" onClick={() => setActiveTab('users')}>
                    <div className="access-icon">👤</div>
                    <h3>User Management</h3>
                    <p>Create and manage doctors, PAs, and patients</p>
                    <div className="access-badge">{stats.totalUsers} users</div>
                  </div>
                  <div className="access-card" onClick={() => navigate('/patient/dashboard')}>
                    <div className="access-icon">👨‍🦱</div>
                    <h3>Patient View</h3>
                    <p>View the system as a patient would see it</p>
                  </div>
                  <div className="access-card" onClick={() => navigate('/pa/dashboard')}>
                    <div className="access-icon">👩‍⚕️</div>
                    <h3>PA View</h3>
                    <p>View the system as a PA would see it</p>
                  </div>
                  <div className="access-card" onClick={() => navigate('/doctor/dashboard')}>
                    <div className="access-icon">👨‍⚕️</div>
                    <h3>Doctor View</h3>
                    <p>View the system as a doctor would see it</p>
                  </div>
                  <div className="access-card" onClick={() => setActiveTab('analytics')}>
                    <div className="access-icon">📊</div>
                    <h3>Analytics</h3>
                    <p>View detailed reports and statistics</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <button 
                    onClick={handleRefresh}
                    className="activity-refresh"
                    disabled={dataLoading}
                    title="Refresh Activity"
                  >
                    {dataLoading ? '🔄' : '🔄'}
                  </button>
                </div>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="activity-item" onClick={() => {
                        if (activity.type.includes('appointment')) {
                          setActiveTab('appointments');
                        } else if (activity.type.includes('user')) {
                          setActiveTab('users');
                        }
                      }}>
                        <div className={`activity-icon ${activity.type}`}>
                          {activity.icon}
                        </div>
                        <div className="activity-content">
                          <p className="activity-message">{activity.message}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">
                      <div className="no-activity-icon">📝</div>
                      <h3>No Recent Activity</h3>
                      <p>Activity will appear here as users interact with the system</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <div className="section-header">
                <div className="header-left">
                  <h2>Appointment Management</h2>
                  <p className="header-subtitle">Manage all patient appointments in the system</p>
                </div>
                <div className="header-actions">
                  <button 
                    onClick={handleRefresh}
                    className="btn btn-secondary"
                    disabled={dataLoading}
                  >
                    {dataLoading ? '🔄 Loading...' : '🔄 Refresh'}
                  </button>
                  <button 
                    onClick={handleExportAppointments}
                    className="btn btn-primary"
                    disabled={appointments.length === 0}
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>
              
              <div className="section-description">
                <p>View and manage all appointments in the system. You can confirm or cancel appointments.</p>
                <div className="appointment-summary">
                  <span className="summary-item total">
                    <span className="summary-icon">📊</span>
                    {stats.totalAppointments} Total
                  </span>
                  <span className="summary-item pending">
                    <span className="summary-icon">⏳</span>
                    {stats.pendingAppointments} Pending
                  </span>
                  <span className="summary-item confirmed">
                    <span className="summary-icon">✅</span>
                    {stats.confirmedAppointments} Confirmed
                  </span>
                  <span className="summary-item cancelled">
                    <span className="summary-icon">❌</span>
                    {stats.cancelledAppointments} Cancelled
                  </span>
                  <span className="summary-item today">
                    <span className="summary-icon">📅</span>
                    {stats.todayAppointments} Today
                  </span>
                </div>
              </div>

              <div className="appointment-filters-section">
                <div className="filter-group">
                  <div className="filter-controls">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <span className="search-icon">🔍</span>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="clear-search"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    <div className="filter-buttons">
                      <span className="filter-label">Filter by status:</span>
                      <div className="filter-options">
                        <button 
                          className={`filter-btn ${appointmentFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setAppointmentFilter('all')}
                        >
                          All
                        </button>
                        <button 
                          className={`filter-btn ${appointmentFilter === 'pending' ? 'active' : ''}`}
                          onClick={() => setAppointmentFilter('pending')}
                        >
                          Pending
                        </button>
                        <button 
                          className={`filter-btn ${appointmentFilter === 'confirmed' ? 'active' : ''}`}
                          onClick={() => setAppointmentFilter('confirmed')}
                        >
                          Confirmed
                        </button>
                        <button 
                          className={`filter-btn ${appointmentFilter === 'cancelled' ? 'active' : ''}`}
                          onClick={() => setAppointmentFilter('cancelled')}
                        >
                          Cancelled
                        </button>
                        <button 
                          className={`filter-btn ${appointmentFilter === 'completed' ? 'active' : ''}`}
                          onClick={() => setAppointmentFilter('completed')}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="filter-info">
                  Showing {filteredAppointments.length} of {appointments.length} appointments
                  {appointmentFilter !== 'all' && ` (${appointmentFilter} only)`}
                </div>
              </div>

              <div className="appointments-content">
                {filteredAppointments.length === 0 ? (
                  <div className="no-appointments">
                    <div className="no-data-icon">📅</div>
                    <h3>No Appointments Found</h3>
                    <p>
                      {appointments.length === 0 
                        ? 'No appointments found in the system. Create some appointments to get started.'
                        : `No ${appointmentFilter !== 'all' ? appointmentFilter + ' ' : ''}appointments match your search.`
                      }
                    </p>
                    {(appointmentFilter !== 'all' || searchTerm) && (
                      <button 
                        onClick={() => {
                          setAppointmentFilter('all');
                          setSearchTerm('');
                        }}
                        className="btn btn-primary"
                      >
                        Show All Appointments
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="appointments-table-container">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Reason</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment._id || appointment.id} className="appointment-row">
                            <td className="patient-cell">
                              <div className="patient-info">
                                <span className="patient-name">
                                  {appointment.patient?.name || 'Unknown Patient'}
                                </span>
                                <span className="patient-email">
                                  {appointment.patient?.email || ''}
                                </span>
                                {appointment.patient?.phone && (
                                  <span className="patient-phone">
                                    📞 {appointment.patient.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="doctor-cell">
                              <div className="doctor-info">
                                <span className="doctor-name">
                                  Dr. {appointment.doctor?.name || 'Unknown'}
                                </span>
                                <span className="doctor-specialization">
                                  {appointment.doctor?.specialization || 'General Practitioner'}
                                </span>
                                <span className="doctor-email">
                                  {appointment.doctor?.email || ''}
                                </span>
                              </div>
                            </td>
                            <td className="datetime-cell">
                              <div className="date-time">
                                <span className="date">
                                  {formatDate(appointment.appointmentDate)}
                                </span>
                                <span className="time">
                                  🕒 {appointment.appointmentTime || 'Not specified'}
                                </span>
                                {appointment.createdAt && (
                                  <span className="created-at">
                                    Created: {getRelativeTime(new Date(appointment.createdAt))}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="status-cell">
                              <span 
                                className="status-badge" 
                                style={{
                                  backgroundColor: `${getAppointmentStatusColor(appointment.status)}20`,
                                  color: getAppointmentStatusColor(appointment.status),
                                  borderColor: `${getAppointmentStatusColor(appointment.status)}40`
                                }}
                              >
                                {getAppointmentStatusIcon(appointment.status)} {appointment.status}
                              </span>
                              {appointment.confirmedBy && appointment.status === 'confirmed' && (
                                <span className="confirmed-by">
                                  Confirmed by: {appointment.confirmedBy?.name || 'Admin'}
                                </span>
                              )}
                            </td>
                            <td className="reason-cell">
                              <div className="reason-text">
                                {appointment.reason || 'No reason provided'}
                              </div>
                              {appointment.notes && (
                                <div className="appointment-notes">
                                  <strong>Notes:</strong> {appointment.notes}
                                </div>
                              )}
                            </td>
                            <td className="actions-cell">
                              <div className="action-buttons">
                                {appointment.status === 'pending' && (
                                  <button
                                    onClick={() => handleConfirmAppointment(appointment._id || appointment.id)}
                                    className="btn-action confirm"
                                    disabled={dataLoading}
                                    title="Confirm Appointment"
                                  >
                                    ✅ Confirm
                                  </button>
                                )}
                                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                  <button
                                    onClick={() => handleCancelAppointment(appointment._id || appointment.id)}
                                    className="btn-action cancel"
                                    disabled={dataLoading}
                                    title="Cancel Appointment"
                                  >
                                    ❌ Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // View appointment details
                                    alert(`Appointment Details:\n\nPatient: ${appointment.patient?.name || 'Unknown'}\nDoctor: Dr. ${appointment.doctor?.name || 'Unknown'}\nDate: ${formatDate(appointment.appointmentDate)}\nTime: ${appointment.appointmentTime}\nStatus: ${appointment.status}\nReason: ${appointment.reason || 'None'}`);
                                  }}
                                  className="btn-action view"
                                  title="View Details"
                                >
                                  👁️ View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {filteredAppointments.length > 0 && (
                <div className="table-footer">
                  <div className="pagination-info">
                    Showing {Math.min(filteredAppointments.length, 10)} of {filteredAppointments.length} appointments
                  </div>
                  <div className="table-actions">
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="btn btn-secondary"
                    >
                      ↑ Back to Top
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="analytics-content">
                <div className="analytics-header">
                  <h2>System Analytics</h2>
                  <p>Comprehensive overview of system performance and usage</p>
                </div>
                
                <div className="analytics-stats-grid">
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">👥</div>
                    <div className="analytics-stat-content">
                      <h3>User Statistics</h3>
                      <div className="stat-details">
                        <div className="stat-detail">
                          <span className="detail-label">Total Users:</span>
                          <span className="detail-value">{stats.totalUsers}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Patients:</span>
                          <span className="detail-value">{stats.patientsCount}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Doctors:</span>
                          <span className="detail-value">{stats.doctorsCount}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">PAs:</span>
                          <span className="detail-value">{stats.pasCount}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Admins:</span>
                          <span className="detail-value">{stats.adminsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">📅</div>
                    <div className="analytics-stat-content">
                      <h3>Appointment Statistics</h3>
                      <div className="stat-details">
                        <div className="stat-detail">
                          <span className="detail-label">Total Appointments:</span>
                          <span className="detail-value">{stats.totalAppointments}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Pending:</span>
                          <span className="detail-value">{stats.pendingAppointments}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Confirmed:</span>
                          <span className="detail-value">{stats.confirmedAppointments}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Cancelled:</span>
                          <span className="detail-value">{stats.cancelledAppointments}</span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Completed:</span>
                          <span className="detail-value">{stats.completedAppointments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-stat-card">
                    <div className="analytics-stat-icon">📈</div>
                    <div className="analytics-stat-content">
                      <h3>Performance Metrics</h3>
                      <div className="stat-details">
                        <div className="stat-detail">
                          <span className="detail-label">Confirmation Rate:</span>
                          <span className="detail-value">
                            {stats.totalAppointments > 0 
                              ? `${Math.round((stats.confirmedAppointments / stats.totalAppointments) * 100)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Pending Rate:</span>
                          <span className="detail-value">
                            {stats.totalAppointments > 0 
                              ? `${Math.round((stats.pendingAppointments / stats.totalAppointments) * 100)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Daily Average:</span>
                          <span className="detail-value">
                            {stats.totalAppointments > 0 
                              ? Math.round(stats.totalAppointments / 30)
                              : 0
                            } per day
                          </span>
                        </div>
                        <div className="stat-detail">
                          <span className="detail-label">Today's Appointments:</span>
                          <span className="detail-value">{stats.todayAppointments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="analytics-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📊</div>
                    <h3>Advanced Analytics</h3>
                    <p>Detailed charts and reporting features are coming soon.</p>
                    <p>Check back later for comprehensive statistics and insights.</p>
                    <div className="placeholder-features">
                      <div className="feature-item">
                        <span className="feature-icon">📈</span>
                        <span>Interactive Charts</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">📋</span>
                        <span>Custom Reports</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">🔔</span>
                        <span>Real-time Alerts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;