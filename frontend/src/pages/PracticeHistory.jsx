import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, AlertCircle, Eye, Search, Filter, Trash2 } from 'lucide-react';
import api from '../api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { TableSkeleton } from '../components/Skeletons';

import { useAuth } from '../AuthContext';

const PracticeHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError('Unable to load practice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeleting(true);
      await api.delete(`/sessions/${deleteTargetId}`);
      setSessions((prev) => prev.filter((s) => s._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Delete session error:', err);
      alert(err.response?.data?.message || 'Failed to delete practice session.');
    } finally {
      setDeleting(false);
    }
  };

  // Safe Filtered Sessions
  const filteredSessions = (sessions || []).filter((s) => {
    if (!s) return false;
    const topicStr = String(s.topic || '').toLowerCase();
    const searchStr = String(search || '').toLowerCase();
    const matchesSearch = topicStr.includes(searchStr);
    const matchesTopic = filterTopic === 'ALL' || s.topic === filterTopic;
    return matchesSearch && matchesTopic;
  });

  const uniqueTopics = Array.from(new Set((sessions || []).map((s) => s?.topic))).filter(Boolean);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modal-cancel"
            style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '8px' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2>Speaking Practice History</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Review past speaking attempts, audio recordings, and performance metrics.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-container" style={{ marginBottom: '24px' }}>
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by topic title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
            <option value="ALL">All Speaking Topics</option>
            {uniqueTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state-card" style={{ marginTop: '16px' }}>
          <BookOpen size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 16 }} />
          <h3>No matching speaking practice history</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Start a practice session from the topics library to record your first attempt.
          </p>
          <button onClick={() => navigate('/topics')} className="btn-primary" style={{ width: 'auto', marginTop: 20 }}>
            Browse Topics
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Overall Score</th>
                <th>Grammar</th>
                <th>Fluency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((s) => (
                <tr key={s._id}>
                  <td>
                    <strong>{s.topic}</strong>
                  </td>
                  <td>
                    {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>{s.duration}s</td>
                  <td>
                    {s.overallScore !== null ? (
                      <span className="badge badge-user" style={{ fontWeight: 800 }}>
                        {s.overallScore} / 100
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pending</span>
                    )}
                  </td>
                  <td>{s.grammarScore !== null ? `${s.grammarScore}` : '-'}</td>
                  <td>{s.fluencyScore !== null ? `${s.fluencyScore}` : '-'}</td>
                  <td>
                    <span className="badge badge-user">{s.processingStatus || 'completed'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/results/${s._id}`)}
                        className="btn-modal-cancel"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(s._id);
                        }}
                        className="btn-modal-cancel"
                        style={{ padding: '6px 10px', fontSize: '13px', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Delete Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTargetId}
        title="Delete Practice Session?"
        message="Are you sure you want to delete this speaking practice recording? This will permanently remove its transcript, scores, and audio file."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default PracticeHistory;
