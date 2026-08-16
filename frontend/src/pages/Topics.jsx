import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';
import TopicCard from '../components/TopicCard';
import TopicFilters from '../components/TopicFilters';
import { StatSkeleton } from '../components/Skeletons';

const Topics = () => {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [difficulty, setDifficulty] = useState('All');

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All Categories') params.category = category;
      if (difficulty && difficulty !== 'All') params.difficulty = difficulty;

      const res = await api.get('/topics', { params });
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error('Fetch topics error:', err);
      setError('Unable to load speaking topics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopics();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, difficulty]);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-modal-cancel" style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2>Speaking Topics Library</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Select an active speaking topic to practice your English fluency and pronunciation.
          </p>
        </div>
      </div>

      {/* Filters */}
      <TopicFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchTopics} className="btn-retry">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Topics Grid or Empty State */}
      {loading ? (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : topics.length === 0 ? (
        <div className="empty-state-card" style={{ marginTop: '32px' }}>
          <BookOpen size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 16 }} />
          <h3>No speaking topics available</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, maxWidth: 400 }}>
            New speaking topics will appear here when they are published by administrators.
          </p>
        </div>
      ) : (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '24px' }}>
          {topics.map((t) => (
            <TopicCard key={t._id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Topics;
