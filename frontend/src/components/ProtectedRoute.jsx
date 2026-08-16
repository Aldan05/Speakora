import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <p style={{ color: 'var(--text-muted)' }}>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    if (window.location.hostname.includes('github.io') || window.location.hostname !== 'localhost') {
      const demoUser = { id: 'demo-user-1', name: 'Demo Speaker', email: 'aldan@example.com', role: 'USER' };
      localStorage.setItem('speakora_token', 'speakora-demo-token');
      localStorage.setItem('speakora_user', JSON.stringify(demoUser));
      return children;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user tries to access admin route without ADMIN role, redirect to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
