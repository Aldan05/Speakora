import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Award,
  BookOpen,
  Clock,
  LogOut,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PlayCircle,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import LogoutModal from '../components/LogoutModal';
import TopicCard from '../components/TopicCard';
import { StatSkeleton, TableSkeleton } from '../components/Skeletons';
import api from '../api';

const UserDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalSessions: 0,
    avgOverallScore: 0,
    bestScore: 0,
    totalSpeakingTime: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [recommendedTopics, setRecommendedTopics] = useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashRes, sessRes, topicRes] = await Promise.all([
        api.get('/users/dashboard'),
        api.get('/sessions'),
        api.get('/topics?limit=3'),
      ]);

      if (dashRes.data.success) {
        setDashboardData(dashRes.data.data);
      }
      setRecentSessions((sessRes.data.sessions || []).slice(0, 5));
      setRecommendedTopics(topicRes.data.topics || []);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Unable to load dashboard data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalHours = (dashboardData.totalSpeakingTime / 3600).toFixed(1);

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="dashboard-header">
        <div>
          <h2>User Dashboard</h2>
          <span className="badge badge-user">Standard User</span>
        </div>

        <button onClick={() => setShowLogoutModal(true)} className="btn-logout-styled">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: 4 }}>
            Welcome back, {user?.name || 'Speaker'}! 👋
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Ready to practice your English speaking today? Select a topic or view your progress analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/feedback')} className="btn-modal-cancel" style={{ padding: '10px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#fbbf24" /> Feedback & Support
          </button>
          <button onClick={() => navigate('/analytics')} className="btn-modal-cancel" style={{ padding: '10px 18px', fontSize: '14px' }}>
            <BarChart2 size={16} /> Analytics
          </button>
          <button onClick={() => navigate('/topics')} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
            <Mic size={16} /> Start Practice
          </button>
        </div>
      </div>

      {/* Error Retry Banner */}
      {error && (
        <div className="error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboard} className="btn-retry">
            Retry Loading
          </button>
        </div>
      )}

      {/* Real Statistics Grid */}
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span className="stat-label">Total Practice Sessions</span>
              <h3 className="stat-value">{dashboardData.totalSessions}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Award size={24} />
            </div>
            <div>
              <span className="stat-label">Average Score</span>
              <h3 className="stat-value">{dashboardData.avgOverallScore} / 100</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="stat-label">Best Score</span>
              <h3 className="stat-value">{dashboardData.bestScore} / 100</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Clock size={24} />
            </div>
            <div>
              <span className="stat-label">Total Speaking Time</span>
              <h3 className="stat-value">{totalHours} Hours</h3>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Topics Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recommended Speaking Topics</h3>
          <button onClick={() => navigate('/topics')} className="btn-modal-cancel" style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All Topics <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {recommendedTopics.map((topic) => (
            <TopicCard key={topic._id} topic={topic} onSelect={(id) => navigate(`/topics/${id}`)} />
          ))}
        </div>
      </div>

      {/* Session History Table */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Practice Sessions</h3>
          <button onClick={() => navigate('/history')} className="btn-modal-cancel" style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Full History <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : recentSessions.length === 0 ? (
          <div className="empty-state-card">
            <PlayCircle size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 16 }} />
            <h3>No practice sessions completed yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
              Start your first speaking practice from the topics library.
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
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Overall Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/results/${s._id}`)}>
                    <td>
                      <strong>{s.topic}</strong>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>{s.duration}s</td>
                    <td>
                      {s.overallScore !== null ? (
                        <span className="badge badge-user" style={{ fontWeight: 700 }}>
                          {s.overallScore} / 100
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-user">{s.processingStatus || 'completed'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logoutUser();
          navigate('/login');
        }}
        role={user?.role}
      />
    </div>
  );
};

export default UserDashboard;
