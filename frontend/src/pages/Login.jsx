import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      // Validate Admin Mode requirement
      if (isAdminMode && user.role !== 'ADMIN') {
        setError('Access Denied. This account does not have Admin privileges.');
        setLoading(false);
        return;
      }

      loginUser(token, user);

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Auth Mode Toggle Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${!isAdminMode ? 'active' : ''}`}
            onClick={() => {
              setIsAdminMode(false);
              setError('');
            }}
          >
            <UserCheck size={16} /> User Portal
          </button>
          <button
            type="button"
            className={`tab-btn admin-tab ${isAdminMode ? 'active' : ''}`}
            onClick={() => {
              setIsAdminMode(true);
              setError('');
            }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>
        </div>

        <div className="auth-header">
          <h1 className="brand-title">SPEAKORA</h1>
          <p className="auth-subtitle">
            {isAdminMode ? 'Administrator Portal Sign In' : 'Welcome Back'}
          </p>
        </div>

        {successMessage && !error && (
          <div className="alert-success">{successMessage}</div>
        )}

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder={isAdminMode ? "Enter admin email" : "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn-primary ${isAdminMode ? 'btn-admin' : ''}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isAdminMode ? 'Sign In as Admin' : 'Sign In'}
          </button>
        </form>

        {/* Demo Account Quick Login Box */}
        <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed var(--card-border)', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            ⚡ <strong>One-Touch Demo Credentials</strong>
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-modal-cancel"
              style={{ flex: 1, padding: '8px', fontSize: '12px' }}
              onClick={() => {
                setIsAdminMode(false);
                setEmail('aldan@example.com');
                setPassword('password123');
              }}
            >
              👤 Demo User
            </button>
            <button
              type="button"
              className="btn-modal-cancel"
              style={{ flex: 1, padding: '8px', fontSize: '12px', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.3)' }}
              onClick={() => {
                setIsAdminMode(true);
                setEmail('admin@speakora.com');
                setPassword('Admin@123');
              }}
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          {!isAdminMode ? (
            <>
              Don't have an account? <Link to="/register">Register</Link>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Restricted portal for authorized Speakora administrators only.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
