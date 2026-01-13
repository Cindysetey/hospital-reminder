import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Header from '../components/common/Header';
import '../styles/pages/Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <LoginForm />
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;