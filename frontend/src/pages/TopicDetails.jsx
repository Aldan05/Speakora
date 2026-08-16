import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Layers, HelpCircle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/topics/${id}`);
        setTopic(res.data.topic);
      } catch (err) {
        console.error('Fetch topic detail error:', err);
        setError(err.response?.data?.message || 'Unable to load topic details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [id]);

  const formatDuration = (seconds) => {
    if (!seconds) return '1 minute';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    return `${secs} seconds`;
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BEGINNER':
        return <span className="badge badge-beginner">Beginner</span>;
      case 'INTERMEDIATE':
        return <span className="badge badge-intermediate">Intermediate</span>;
      case 'ADVANCED':
        return <span className="badge badge-advanced">Advanced</span>;
      default:
        return <span className="badge badge-user">{diff}</span>;
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <button
        onClick={() => navigate('/topics')}
        className="btn-modal-cancel"
        style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '20px' }}
      >
        <ArrowLeft size={14} /> Back to Topics Library
      </button>

      {error ? (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading topic details...</p>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="topic-category">
              <Layers size={16} /> {topic.category}
            </span>
            {getDifficultyBadge(topic.difficulty)}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>{topic.title}</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            {topic.description}
          </p>

          <div
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h4 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--primary)' }}>Instructions for Speaking:</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {topic.instructions || 'Speak naturally, maintain steady pacing, and attempt to cover your main ideas clearly.'}
            </p>
          </div>

          <div className="stats-grid" style={{ marginBottom: '32px' }}>
            <div className="stat-card">
              <Clock size={24} color="var(--primary)" />
              <div>
                <span className="stat-label">Recommended Duration</span>
                <h4 className="stat-value" style={{ fontSize: '18px' }}>
                  {formatDuration(topic.recommendedDuration)}
                </h4>
              </div>
            </div>

            <div className="stat-card">
              <HelpCircle size={24} color="#fbbf24" />
              <div>
                <span className="stat-label">Preparation Time</span>
                <h4 className="stat-value" style={{ fontSize: '18px' }}>
                  {topic.preparationTime ? `${topic.preparationTime} Seconds` : 'None'}
                </h4>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '16px', fontSize: '16px' }}
            onClick={() => navigate(`/practice/${topic._id}`)}
          >
            <Sparkles size={20} /> Start Speaking Practice
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicDetails;
