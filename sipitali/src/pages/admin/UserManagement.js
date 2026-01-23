import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Loading from '../../components/common/Loading';
import '../../styles/pages/Dashboard.css';
import '../../styles/pages/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    address: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, searchTerm]);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

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
          specialization: '',
        });
        setShowForm(false);
        loadUsers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?\nThis action cannot be undone.')) {
      return;
    }

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        setSuccess('User deleted successfully');
        loadUsers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password for this user:');
    if (newPassword && newPassword.length >= 6) {
      try {
        const response = await userService.resetPassword(userId, { password: newPassword });
        if (response.success) {
          alert('Password reset successfully');
        } else {
          alert(response.message || 'Failed to reset password');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reset password');
      }
    } else if (newPassword) {
      alert('Password must be at least 6 characters');
    }
  };

  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show current password
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        specialization: user.specialization || '',
      });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'doctor': return '👨‍⚕️';
      case 'pa': return '👩‍⚕️';
      case 'patient': return '👨‍🦱';
      case 'super_admin': return '🛡️';
      default: return '👤';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'doctor': return 'Doctor';
      case 'pa': return 'Physician Assistant';
      case 'patient': return 'Patient';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      doctors: users.filter((u) => u.role === 'doctor').length,
      pas: users.filter((u) => u.role === 'pa').length,
      patients: users.filter((u) => u.role === 'patient').length,
      admins: users.filter((u) => u.role === 'super_admin').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-content">
          <h2>User Management</h2>
          <p className="header-description">Manage system users, create new accounts, and assign roles</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary create-user-btn"
        >
          {showForm ? '✕ Cancel' : '➕ Create New User'}
        </button>
      </div>

      {showForm && (
        <div className="user-form-container slide-in">
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-header">
              <h3>Create New User</h3>
              <p>Fill in the details to create a new user account</p>
            </div>
            
            {(error || success) && (
              <div className={`alert-message ${error ? 'error' : 'success'}`}>
                <span className="alert-icon">{error ? '⚠️' : '✅'}</span>
                {error || success}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength="6"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  Role <span className="required">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="doctor">Doctor 👨‍⚕️</option>
                  <option value="pa">Physician Assistant 👩‍⚕️</option>
                  <option value="patient">Patient 👨‍🦱</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="form-input"
                />
              </div>

              {formData.role === 'doctor' && (
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Cardiology, Neurology, etc."
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows="3"
                  className="form-textarea"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary submit-btn">
                Create User Account
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'doctor',
                    phone: '',
                    address: '',
                    specialization: '',
                  });
                }}
              >
                Cancel & Clear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="user-stats">
        <div className="stats-cards">
          <div className="stat-card total-users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.total}</h3>
              <p className="stat-label">Total Users</p>
            </div>
          </div>
          <div className="stat-card doctors">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.doctors}</h3>
              <p className="stat-label">Doctors</p>
            </div>
          </div>
          <div className="stat-card pas">
            <div className="stat-icon">👩‍⚕️</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.pas}</h3>
              <p className="stat-label">PAs</p>
            </div>
          </div>
          <div className="stat-card patients">
            <div className="stat-icon">😷</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.patients}</h3>
              <p className="stat-label">Patients</p>
            </div>
          </div>
          <div className="stat-card admins">
            <div className="stat-icon">🛡️</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.admins}</h3>
              <p className="stat-label">Admins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="role-filters">
          <button 
            className={`role-filter ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRole('all')}
          >
            All Users
          </button>
          <button 
            className={`role-filter ${selectedRole === 'doctor' ? 'active' : ''}`}
            onClick={() => setSelectedRole('doctor')}
          >
            Doctors
          </button>
          <button 
            className={`role-filter ${selectedRole === 'pa' ? 'active' : ''}`}
            onClick={() => setSelectedRole('pa')}
          >
            PAs
          </button>
          <button 
            className={`role-filter ${selectedRole === 'patient' ? 'active' : ''}`}
            onClick={() => setSelectedRole('patient')}
          >
            Patients
          </button>
          <button 
            className={`role-filter ${selectedRole === 'super_admin' ? 'active' : ''}`}
            onClick={() => setSelectedRole('super_admin')}
          >
            Admins
          </button>
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No Users Found</h3>
            <p>Try adjusting your search or filters</p>
            {searchTerm && (
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="users-header">
              <h3>Users ({filteredUsers.length})</h3>
              <div className="users-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  📄 Export List
                </button>
              </div>
            </div>
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="user-info">
                      <h4 className="user-name">{user.name}</h4>
                      <div className="user-role">
                        <span className={`role-badge ${user.role}`}>
                          {getRoleLabel(user.role)} {getRoleIcon(user.role)}
                        </span>
                        {user.specialization && (
                          <span className="user-specialization">{user.specialization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="detail-item">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{user.address}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {user.updatedAt !== user.createdAt && (
                      <div className="detail-item">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">
                          {new Date(user.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="user-actions">
                    <button 
                      onClick={() => handleResetPassword(user._id)}
                      className="btn-action reset-password"
                      title="Reset Password"
                    >
                      🔑 Reset Password
                    </button>
                    <button 
                      onClick={() => handleEditUser(user._id)}
                      className="btn-action edit-user"
                      title="Edit User"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="btn-action delete-user"
                      title="Delete User"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {filteredUsers.length > 0 && (
        <div className="users-footer">
          <p>Showing {filteredUsers.length} of {users.length} users</p>
          <div className="pagination-controls">
            <button className="btn btn-secondary" disabled>← Previous</button>
            <span className="page-info">Page 1 of 1</span>
            <button className="btn btn-secondary" disabled>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;