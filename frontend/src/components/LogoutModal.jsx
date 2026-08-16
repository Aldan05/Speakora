import React from 'react';
import { LogOut, ShieldAlert, X, Sparkles } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm, role }) => {
  if (!isOpen) return null;

  const isAdmin = role === 'ADMIN';

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{
          maxWidth: '420px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: isAdmin ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: isAdmin ? '0 25px 50px -12px rgba(245, 158, 11, 0.25)' : '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
        }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div
          className="modal-icon-wrapper"
          style={{
            background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            borderColor: isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <LogOut size={28} color={isAdmin ? '#fbbf24' : '#818cf8'} />
        </div>

        <h3 className="modal-title" style={{ fontSize: '22px', fontWeight: 800 }}>
          {isAdmin ? 'Sign Out of Admin Center?' : 'Log Out of Speakora?'}
        </h3>

        <p className="modal-message" style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '8px' }}>
          {isAdmin
            ? 'You are about to sign out of your Admin Command Center session.'
            : 'Are you sure you want to log out? Your speaking practice history and scores are safely saved.'}
        </p>

        <div className="modal-actions" style={{ marginTop: '24px', gap: '12px' }}>
          <button className="btn-modal-cancel" onClick={onClose} style={{ padding: '12px 18px', fontSize: '14px' }}>
            Stay Logged In
          </button>
          <button
            className="btn-modal-logout"
            onClick={onConfirm}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              background: isAdmin
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: isAdmin ? '0 4px 14px rgba(245, 158, 11, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <LogOut size={16} /> Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
