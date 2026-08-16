import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, title, message, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{
          maxWidth: '420px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div
          className="modal-icon-wrapper"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <Trash2 size={28} color="#ef4444" />
        </div>

        <h3 className="modal-title" style={{ fontSize: '22px', fontWeight: 800 }}>
          {title || 'Confirm Deletion'}
        </h3>

        <p className="modal-message" style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '8px' }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>

        <div className="modal-actions" style={{ marginTop: '24px', gap: '12px' }}>
          <button className="btn-modal-cancel" onClick={onClose} style={{ padding: '12px 18px', fontSize: '14px' }}>
            Cancel
          </button>
          <button
            className="btn-modal-logout"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Trash2 size={16} /> {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
