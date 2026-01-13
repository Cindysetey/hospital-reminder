import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import Header from '../components/common/Header';
import '../styles/pages/Signup.css';

const Signup = () => {
  return (
    <div className="signup-page">
      <Header />
      <div className="signup-container">
        <SignupForm />
        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;