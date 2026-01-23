import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/patient/PatientDashboard';
import PADashboard from './pages/pa/PADashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Common Components
import Loading from './components/common/Loading';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/pa/dashboard"
              element={
                <ProtectedRoute allowedRoles={['pa']}>
                  <PADashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect based on auth status will be handled by AuthContext */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;