import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  X,
  BookOpen,
} from 'lucide-react';
import api from '../api';
import { TableSkeleton } from '../components/Skeletons';

const CATEGORIES = [
  'General',
  'Self Introduction',
  'Education',
  'Career',
  'Technology',
  'Communication',
  'Debate',
  'Interview',
  'Daily Life',
  'Social Issues',
];

const AdminTopics = () => {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: 'General',
    difficulty: 'BEGINNER',
    recommendedDuration: 120,
    preparationTime: 30,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Modal State
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchAdminTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { all: 'true' };
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (difficultyFilter !== 'All') params.difficulty = difficultyFilter;

      const res = await api.get('/topics', { params });
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error('Fetch admin topics error:', err);
      setError('Unable to load speaking topics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminTopics();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, difficultyFilter]);

  const handleOpenCreateModal = () => {
    setEditingTopic(null);
    setFormData({
      title: '',
      description: '',
      instructions: '',
      category: 'General',
      difficulty: 'BEGINNER',
      recommendedDuration: 120,
      preparationTime: 30,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description,
      instructions: topic.instructions || '',
      category: topic.category,
      difficulty: topic.difficulty,
      recommendedDuration: topic.recommendedDuration,
      preparationTime: topic.preparationTime || 0,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.title.length < 5 || formData.title.length > 150) {
      setFormError('Title must be between 5 and 150 characters.');
      return;
    }

    if (formData.description.length < 10) {
      setFormError('Description must be at least 10 characters.');
      return;
    }

    if (formData.recommendedDuration <= 0) {
      setFormError('Recommended duration must be greater than 0.');
      return;
    }

    if (formData.preparationTime < 0) {
      setFormError('Preparation time cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTopic) {
        await api.put(`/topics/${editingTopic._id}`, formData);
      } else {
        await api.post('/topics', formData);
      }

      setShowModal(false);
      fetchAdminTopics();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/topics/${id}/status`);
      fetchAdminTopics();
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopic) return;
    setDeleteError('');
    try {
      await api.delete(`/topics/${deletingTopic._id}`);
      setDeletingTopic(null);
      fetchAdminTopics();
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteError(err.response.data.message);
      } else {
        setDeleteError(err.response?.data?.message || 'Failed to delete topic.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn-modal-cancel"
            style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '8px' }}
          >
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </button>
          <h2>Speaking Topics Management</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Create, edit, activate, deactivate, and manage platform practice prompts.
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          <Plus size={18} /> Create Topic
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-container" style={{ marginBottom: '24px' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="All">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchAdminTopics} className="btn-retry">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Topics Table */}
      {loading ? (
        <TableSkeleton />
      ) : topics.length === 0 ? (
        <div className="empty-state-card">
          <BookOpen size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 16 }} />
          <h3>No topics created yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Start by creating speaking topics for your platform users.
          </p>
          <button onClick={handleOpenCreateModal} className="btn-primary" style={{ width: 'auto', marginTop: 20 }}>
            Create Topic
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Topic Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t._id}>
                  <td>
                    <strong>{t.title}</strong>
                  </td>
                  <td>{t.category}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.difficulty === 'BEGINNER'
                          ? 'badge-beginner'
                          : t.difficulty === 'INTERMEDIATE'
                          ? 'badge-intermediate'
                          : 'badge-advanced'
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </td>
                  <td>{Math.floor(t.recommendedDuration / 60)}m</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(t._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: t.isActive ? '#34d399' : '#fca5a5',
                      }}
                      title="Click to toggle status"
                    >
                      {t.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="btn-modal-cancel"
                        style={{ padding: '6px', borderRadius: '8px' }}
                        title="Edit Topic"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingTopic(t);
                          setDeleteError('');
                        }}
                        className="btn-modal-cancel"
                        style={{ padding: '6px', borderRadius: '8px', color: '#ef4444' }}
                        title="Delete Topic"
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

      {/* Create / Edit Topic Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '540px', textAlignment: 'left' }}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>
            <h3 className="modal-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
              {editingTopic ? 'Edit Speaking Topic' : 'Create New Speaking Topic'}
            </h3>

            {formError && <div className="alert-error">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Topic Title</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="e.g. Tell me about yourself"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Description</label>
                <div className="input-wrapper">
                  <textarea
                    rows="3"
                    className="custom-textarea"
                    placeholder="Briefly explain what the user should talk about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Instructions (Optional)</label>
                <div className="input-wrapper">
                  <textarea
                    rows="2"
                    className="custom-textarea"
                    placeholder="Specific tips, structure, or guidelines..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Category</label>
                  <select
                    className="custom-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Difficulty</label>
                  <select
                    className="custom-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Duration (Seconds)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      min="1"
                      value={formData.recommendedDuration}
                      onChange={(e) => setFormData({ ...formData, recommendedDuration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Preparation Time (Sec)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      min="0"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTopic && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close-btn" onClick={() => setDeletingTopic(null)}>
              <X size={18} />
            </button>
            <h3 className="modal-title">Confirm Topic Deletion</h3>
            <p className="modal-message">
              Are you sure you want to delete <strong>"{deletingTopic.title}"</strong>?
            </p>

            {deleteError && <div className="alert-error" style={{ fontSize: '13px', textAlign: 'left' }}>{deleteError}</div>}

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setDeletingTopic(null)}>
                Cancel
              </button>
              <button className="btn-modal-logout" onClick={handleDeleteConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;
