import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import api from '../api';

const UserFeedback = () => {
  const navigate = useNavigate();

  const [type, setType] = useState('GENERAL');
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [myFeedback, setMyFeedback] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyFeedback = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/feedback/my');
      setMyFeedback(res.data.feedbackList || []);
    } catch (err) {
      console.error('Fetch feedback history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleConfirmDeleteFeedback = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await api.delete(`/feedback/${deleteTargetId}`);
      fetchMyFeedback();
      setDeleteTargetId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete feedback entry.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || !message) {
      setError('Please provide a subject and details message.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/feedback', {
        type,
        rating,
        subject,
        message,
      });

      setSuccess(res.data.message || 'Feedback submitted successfully!');
      setSubject('');
      setMessage('');
      setRating(5);
      fetchMyFeedback();
    } catch (err) {
      console.error('Submit feedback error:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ marginTop: '20px' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modal-cancel"
            style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Feedback & Support</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Rate your Speakora experience, report bugs, suggest features, or request help.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'flex-start', marginBottom: '16px' }}>
        {/* SUBMIT FEEDBACK FORM */}
        <div className="topic-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" /> Submit Your Feedback
          </h3>

          {success && (
            <div className="alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {success}
            </div>
          )}

          {error && (
            <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Feedback Category</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="custom-select">
                <option value="GENERAL">📝 General Feedback</option>
                <option value="BUG">🐛 Report a Bug</option>
                <option value="FEATURE_REQUEST">💡 Suggest a Feature</option>
                <option value="SUPPORT">❓ Report a Problem / Support</option>
              </select>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <Star
                      size={24}
                      color={star <= rating ? '#fbbf24' : '#475569'}
                      fill={star <= rating ? '#fbbf24' : 'transparent'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                placeholder="e.g. AI Grammar suggestions feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="custom-textarea"
                style={{ height: '44px' }}
                required
              />
            </div>

            <div className="form-group">
              <label>Message Details</label>
              <textarea
                placeholder="Share your detailed feedback or describe the problem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="custom-textarea"
                rows={4}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <Send size={16} /> {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* FEEDBACK HISTORY & ADMIN RESPONSES */}
        <div>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} color="#34d399" /> Your Feedback & Admin Responses
          </h3>

          {historyLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
          ) : myFeedback.length === 0 ? (
            <div className="empty-state-card" style={{ padding: '32px' }}>
              <HelpCircle size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <h4>No feedback submitted yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 6 }}>
                Submit a rating or feature request to get responses from administrators.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myFeedback.map((fb) => (
                <div key={fb._id} className="topic-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-user" style={{ fontSize: '11px' }}>{fb.type}</span>
                      <span className={`badge ${fb.status === 'RESOLVED' ? 'badge-beginner' : fb.status === 'REVIEWING' ? 'badge-intermediate' : 'badge-admin'}`}>
                        {fb.status}
                      </span>
                    </div>

                    <button
                      onClick={() => setDeleteTargetId(fb._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fca5a5',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete Feedback"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '4px' }}>{fb.subject}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>"{fb.message}"</p>

                  {/* Rating Stars */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                    {[...Array(fb.rating)].map((_, i) => (
                      <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
                    ))}
                  </div>

                  {/* Admin Response Box */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '14px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🛡️ Admin Status:
                      </span>
                      <span className={`badge ${fb.status === 'RESOLVED' ? 'badge-beginner' : fb.status === 'REVIEWING' ? 'badge-intermediate' : fb.status === 'REJECTED' ? 'badge-advanced' : 'badge-user'}`}>
                        {fb.status === 'RESOLVED' ? '🟢 Resolved' : fb.status === 'REVIEWING' ? '🟡 Under Review' : fb.status === 'REJECTED' ? '🔴 Rejected' : '⚪ New'}
                      </span>
                    </div>

                    {fb.adminResponse ? (
                      <p style={{ fontSize: '13px', color: '#ffffff', margin: 0, lineHeight: '1.5' }}>
                        <strong>Official Reply:</strong> "{fb.adminResponse}"
                      </p>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, italic: 'true' }}>
                        Waiting for administrator review...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTargetId}
        title="Delete Feedback Entry?"
        message="Are you sure you want to delete this feedback submission? This will permanently remove it from your history."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDeleteFeedback}
        loading={deleting}
      />
    </div>
  );
};

export default UserFeedback;
