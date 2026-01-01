import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import '../../styles/pages/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await userService.createUser(formData);
      if (response.success) {
        setSuccess('User created successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'doctor',
          phone: '',
          address: '',
        });
        setShowForm(false);
        loadUsers();
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        if (response.success) {
          loadUsers();
        } else {
          alert(response.message || 'Failed to delete user');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  const doctors = users.filter((u) => u.role === 'doctor');
  const pas = users.filter((u) => u.role === 'pa');
  const patients = users.filter((u) => u.role === 'patient');
  const admins = users.filter((u) => u.role === 'super_admin');

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : 'Create New User'}
        </Button>
      </div>

      {showForm && (
        <div className="user-form-container">
          <form onSubmit={handleSubmit} className="user-form">
            <h3>Create New User</h3>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="doctor">Doctor</option>
                  <option value="pa">PA (Physician Assistant)</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="full-width">
              Create User
            </Button>
          </form>
        </div>
      )}

      <div className="user-stats">
        <div className="stat-card">
          <h3>Doctors</h3>
          <p className="stat-number">{doctors.length}</p>
        </div>
        <div className="stat-card">
          <h3>PAs</h3>
          <p className="stat-number">{pas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Patients</h3>
          <p className="stat-number">{patients.length}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p className="stat-number">{admins.length}</p>
        </div>
      </div>

      <div className="users-list">
        <div className="users-section">
          <h3>Doctors ({doctors.length})</h3>
          <div className="users-grid">
            {doctors.map((user) => (
              <div key={user._id} className="user-card">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <p>{user.phone}</p>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="users-section">
          <h3>PAs ({pas.length})</h3>
          <div className="users-grid">
            {pas.map((user) => (
              <div key={user._id} className="user-card">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <p>{user.phone}</p>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

