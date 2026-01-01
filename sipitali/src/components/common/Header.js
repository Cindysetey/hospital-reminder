import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'pa':
        return '/pa/dashboard';
      case 'patient':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to={isAuthenticated ? getDashboardPath() : '/'} className="logo">
          <h2>Hospital Reminder</h2>
        </Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <span className="user-info">Welcome, {user.name}</span>
              <span className="user-role">({user.role.replace('_', ' ')})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

