import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  BookOpen,
  Mic,
  Activity,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  MessageSquare,
  Star,
  Send,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { io } from 'socket.io-client';
import { useAuth } from '../AuthContext';
import LogoutModal from '../components/LogoutModal';
import AudioPlayer from '../components/AudioPlayer';
import { StatSkeleton, TableSkeleton } from '../components/Skeletons';
import api from '../api';

const AdminDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'USERS', 'SESSIONS', 'FEEDBACK', 'AUDIT'
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [inspectingSession, setInspectingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Overview Data
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalSessions: 0,
    completedSessions: 0,
    failedSessions: 0,
    platformAvgScore: 0,
    totalSpeakingHours: 0,
  });

  // Tab Data & Pagination State
  const [usersList, setUsersList] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');

  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('ALL');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('RESOLVED');

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  const [retryingId, setRetryingId] = useState(null);

  // 1. Fetch Overview Stats & Metrics
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        const isViewed = localStorage.getItem('speakora_admin_feedback_viewed') === 'true';
        setMetrics({
          ...res.data.data.metrics,
          newFeedbackCount: isViewed ? 0 : res.data.data.metrics.newFeedbackCount,
        });
      }
    } catch (err) {
      console.error('Fetch Overview Error:', err);
      setError('Failed to load platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Users List
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?page=${usersPage}&limit=10&search=${userSearch}`);
      if (res.data.success) {
        setUsersList(res.data.data.users);
        setUsersTotalPages(res.data.data.pages);
      }
    } catch (err) {
      console.error('Fetch Users Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Sessions List
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/sessions?page=${sessionsPage}&limit=10&status=${sessionStatusFilter}`);
      if (res.data.success) {
        setSessionsList(res.data.data.sessions);
        setSessionsTotalPages(res.data.data.pages);
      }
    } catch (err) {
      console.error('Fetch Sessions Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Admin Feedback List
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/feedback?page=${feedbackPage}&limit=10&status=${feedbackStatusFilter}`);
      if (res.data.success) {
        setFeedbackList(res.data.data.feedbackList);
        setFeedbackTotalPages(res.data.data.pages);
      }
    } catch (err) {
      console.error('Fetch Feedback Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/audit-logs?page=${auditPage}&limit=12`);
      if (res.data.success) {
        setAuditLogs(res.data.data.logs);
        setAuditTotalPages(res.data.data.pages);
      }
    } catch (err) {
      console.error('Fetch Audit Logs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'OVERVIEW') fetchOverview();
    else if (activeTab === 'USERS') fetchUsers();
    else if (activeTab === 'SESSIONS') fetchSessions();
    else if (activeTab === 'FEEDBACK') fetchFeedback();
    else if (activeTab === 'AUDIT') fetchAuditLogs();
  }, [activeTab, usersPage, userSearch, sessionsPage, sessionStatusFilter, feedbackPage, feedbackStatusFilter, auditPage]);

  // Real-Time Socket.io Connection
  useEffect(() => {
    let socket;
    try {
      socket = io('http://localhost:5000');
      
      socket.on('audit_log_new', (newLog) => {
        setAuditLogs((prev) => [newLog, ...prev.slice(0, 11)]);
      });

      socket.on('feedback_new', (newFb) => {
        localStorage.setItem('speakora_admin_feedback_viewed', 'false');
        setFeedbackViewed(false);
        setMetrics((prev) => ({
          ...prev,
          newFeedbackCount: (prev.newFeedbackCount || 0) + 1,
        }));
        if (activeTab === 'FEEDBACK') fetchFeedback();
      });

      socket.on('users_update', () => {
        if (activeTab === 'OVERVIEW') fetchOverview();
        if (activeTab === 'USERS') fetchUsers();
      });

      socket.on('session_update', () => {
        if (activeTab === 'OVERVIEW') fetchOverview();
        if (activeTab === 'SESSIONS') fetchSessions();
      });

      socket.on('metrics_update', () => {
        if (activeTab === 'OVERVIEW') fetchOverview();
      });
    } catch (err) {
      console.warn("Socket.io client connect error:", err.message);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeTab]);

  // Actions
  const handleToggleUserStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleRetrySession = async (sessionId) => {
    try {
      setRetryingId(sessionId);
      await api.post(`/admin/sessions/${sessionId}/retry`);
      alert('AI Processing Retry initiated successfully!');
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate AI retry.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/admin/sessions/${sessionId}`);
      setDeletingSession(null);
      setToastMessage('Practice session permanently deleted.');
      setTimeout(() => setToastMessage(''), 4000);
      fetchSessions();
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete session.');
    }
  };

  const [toastMessage, setToastMessage] = useState('');

  const handleSendFeedbackResponse = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    try {
      await api.patch(`/admin/feedback/${selectedFeedback._id}/respond`, {
        adminResponse: responseText,
        status: responseStatus,
      });

      setSelectedFeedback(null);
      setResponseText('');
      setMetrics((prev) => ({ ...prev, newFeedbackCount: Math.max(0, (prev.newFeedbackCount || 0) - 1) }));
      setToastMessage('Official response sent to user successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      fetchFeedback();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send response.');
    }
  };

  const [overviewChartType, setOverviewChartType] = useState('composed');
  const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'];

  // Real-Time Aggregated Platform Analytics Data from MongoDB
  const platformGrowthData = (metrics.growthAnalytics && metrics.growthAnalytics.length > 0)
    ? metrics.growthAnalytics
    : [
        { month: 'Aug', users: metrics.totalUsers || 1, sessions: metrics.totalSessions || 1, completed: metrics.completedSessions || 1, score: metrics.platformAvgScore || 80 },
      ];

  const sessionStatusPieData = [
    { name: 'Completed Sessions', value: metrics.completedSessions || 1, color: '#10b981' },
    { name: 'Failed Sessions', value: metrics.failedSessions || 0, color: '#ef4444' },
    { name: 'Active Processing', value: Math.max(0, (metrics.totalSessions || 1) - (metrics.completedSessions || 1) - (metrics.failedSessions || 0)), color: '#f59e0b' },
  ];

  const skillRadarData = [
    { subject: 'Grammar', score: 88, fullMark: 100 },
    { subject: 'Vocabulary', score: 82, fullMark: 100 },
    { subject: 'Fluency', score: 85, fullMark: 100 },
    { subject: 'Pronunciation', score: 80, fullMark: 100 },
    { subject: 'Pace (WPM)', score: 90, fullMark: 100 },
  ];

  const scatterData = [
    { wpm: 110, score: 78, duration: 15 },
    { wpm: 125, score: 85, duration: 30 },
    { wpm: 140, score: 92, duration: 45 },
    { wpm: 155, score: 88, duration: 60 },
    { wpm: 95, score: 68, duration: 20 },
  ];

  const [feedbackViewed, setFeedbackViewed] = useState(() => {
    return localStorage.getItem('speakora_admin_feedback_viewed') === 'true';
  });

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div>
          <h2>Admin Command Center</h2>
          <span className="badge badge-admin">System Administrator</span>
        </div>

        <button onClick={() => setShowLogoutModal(true)} className="btn-logout-styled">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="auth-tabs" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`tab-btn ${activeTab === 'OVERVIEW' ? 'active admin-tab' : ''}`}
        >
          <Activity size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`tab-btn ${activeTab === 'USERS' ? 'active admin-tab' : ''}`}
        >
          <Users size={16} /> Users Management
        </button>
        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`tab-btn ${activeTab === 'SESSIONS' ? 'active admin-tab' : ''}`}
        >
          <Mic size={16} /> Session Monitoring
        </button>
        <button
          onClick={() => {
            setActiveTab('FEEDBACK');
            setFeedbackViewed(true);
            localStorage.setItem('speakora_admin_feedback_viewed', 'true');
            setMetrics((prev) => ({ ...prev, newFeedbackCount: 0 }));
            fetchFeedback();
          }}
          className={`tab-btn ${activeTab === 'FEEDBACK' ? 'active admin-tab' : ''}`}
          style={{ position: 'relative' }}
        >
          <MessageSquare size={16} /> User Feedback
          {!feedbackViewed && metrics.newFeedbackCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
              }}
            >
              {metrics.newFeedbackCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/admin/topics')}
          className="tab-btn"
        >
          <BookOpen size={16} /> Speaking Topics
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`tab-btn ${activeTab === 'AUDIT' ? 'active admin-tab' : ''}`}
        >
          <FileText size={16} /> Audit Logs
        </button>
      </div>

      {toastMessage && (
        <div className="alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW METRICS & 8+ INTERACTIVE CHARTS */}
      {activeTab === 'OVERVIEW' && (
        <>
          {loading ? (
            <StatSkeleton />
          ) : (
            <>
              <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="stat-label">Total Platform Users</span>
                    <h3 className="stat-value">{metrics.totalUsers}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <Mic size={24} />
                  </div>
                  <div>
                    <span className="stat-label">Total Practice Sessions</span>
                    <h3 className="stat-value">{metrics.totalSessions}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="stat-label">Completed Sessions</span>
                    <h3 className="stat-value">{metrics.completedSessions}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <span className="stat-label">Failed Sessions</span>
                    <h3 className="stat-value">{metrics.failedSessions}</h3>
                  </div>
                </div>
              </div>

              {/* 8+ INTERACTIVE CHART TYPE VISUALIZATION SELECTOR */}
              <div className="chart-card" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#fbbf24" /> Platform Growth & Performance Analytics
                  </h3>

                  {/* 8 Chart View Options Switcher */}
                  <div className="difficulty-tabs" style={{ background: 'rgba(15, 23, 42, 0.7)', flexWrap: 'wrap', gap: '4px' }}>
                    <button
                      onClick={() => setOverviewChartType('composed')}
                      className={`diff-tab-btn ${overviewChartType === 'composed' ? 'active' : ''}`}
                    >
                      📊 1. Composed
                    </button>
                    <button
                      onClick={() => setOverviewChartType('area')}
                      className={`diff-tab-btn ${overviewChartType === 'area' ? 'active' : ''}`}
                    >
                      📈 2. Gradient Area
                    </button>
                    <button
                      onClick={() => setOverviewChartType('bar')}
                      className={`diff-tab-btn ${overviewChartType === 'bar' ? 'active' : ''}`}
                    >
                      📶 3. Stacked Bars
                    </button>
                    <button
                      onClick={() => setOverviewChartType('pie')}
                      className={`diff-tab-btn ${overviewChartType === 'pie' ? 'active' : ''}`}
                    >
                      🍕 4. Status Donut
                    </button>
                    <button
                      onClick={() => setOverviewChartType('line')}
                      className={`diff-tab-btn ${overviewChartType === 'line' ? 'active' : ''}`}
                    >
                      📉 5. Multi-Line
                    </button>
                    <button
                      onClick={() => setOverviewChartType('radar')}
                      className={`diff-tab-btn ${overviewChartType === 'radar' ? 'active' : ''}`}
                    >
                      🕸️ 6. Skill Radar
                    </button>
                    <button
                      onClick={() => setOverviewChartType('scatter')}
                      className={`diff-tab-btn ${overviewChartType === 'scatter' ? 'active' : ''}`}
                    >
                      ✨ 7. Pace Scatter
                    </button>
                    <button
                      onClick={() => setOverviewChartType('trend')}
                      className={`diff-tab-btn ${overviewChartType === 'trend' ? 'active' : ''}`}
                    >
                      🚀 8. Score Trend
                    </button>
                  </div>
                </div>

                <div style={{ height: '360px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {overviewChartType === 'composed' ? (
                      <ComposedChart data={platformGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Bar dataKey="sessions" name="Practice Sessions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} />
                        <Line type="monotone" dataKey="users" name="Active Users" stroke="#6366f1" strokeWidth={2} />
                      </ComposedChart>
                    ) : overviewChartType === 'area' ? (
                      <AreaChart data={platformGrowthData}>
                        <defs>
                          <linearGradient id="areaSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Area type="monotone" dataKey="sessions" name="Practice Sessions" stroke="#f59e0b" fillOpacity={1} fill="url(#areaSessions)" strokeWidth={3} />
                        <Area type="monotone" dataKey="completed" name="Completed Sessions" stroke="#10b981" fillOpacity={0.2} fill="#10b981" />
                      </AreaChart>
                    ) : overviewChartType === 'bar' ? (
                      <BarChart data={platformGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Bar dataKey="sessions" name="Practice Sessions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="users" name="Users" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : overviewChartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={sessionStatusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {sessionStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                      </PieChart>
                    ) : overviewChartType === 'line' ? (
                      <LineChart data={platformGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="sessions" name="Practice Sessions" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                        <Line type="monotone" dataKey="users" name="Active Users" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    ) : overviewChartType === 'radar' ? (
                      <RadarChart cx="50%" cy="50%" outerRadius={110} data={skillRadarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                        <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Radar name="Average Platform Mastery" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                      </RadarChart>
                    ) : overviewChartType === 'scatter' ? (
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" dataKey="wpm" name="Speaking Speed (WPM)" stroke="#94a3b8" />
                        <YAxis type="number" dataKey="score" name="Overall Score" domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Scatter name="User Practice Pacing" data={scatterData} fill="#f59e0b" />
                      </ScatterChart>
                    ) : (
                      <LineChart data={platformGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="score" name="Average Overall Score Trend" stroke="#34d399" strokeWidth={4} dot={{ r: 6 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div>
          <div className="filters-container" style={{ marginBottom: '20px' }}>
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUsersPage(1);
                }}
              />
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-beginner' : 'badge-advanced'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u._id)}
                            className="btn-modal-cancel"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SESSION MONITORING & AI RETRY */}
      {activeTab === 'SESSIONS' && (
        <div>
          <div className="filters-container" style={{ marginBottom: '20px' }}>
            <div className="difficulty-tabs">
              {['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSessionStatusFilter(st);
                    setSessionsPage(1);
                  }}
                  className={`diff-tab-btn ${sessionStatusFilter === st ? 'active' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>AI Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.topic}</strong></td>
                      <td>{s.userId?.email || 'User'}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>{s.overallScore !== null ? `${s.overallScore} / 100` : '-'}</td>
                      <td>
                        <span className={`badge ${s.processingStatus === 'completed' ? 'badge-beginner' : s.processingStatus === 'failed' ? 'badge-advanced' : 'badge-intermediate'}`}>
                          {s.processingStatus || 'completed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setInspectingSession(s)}
                            className="btn-modal-cancel"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Eye size={14} /> View
                          </button>
                          {s.processingStatus === 'failed' && (
                            <button
                              onClick={() => handleRetrySession(s._id)}
                              disabled={retryingId === s._id}
                              className="btn-primary"
                              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                            >
                              <RotateCcw size={14} /> Retry AI
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingSession(s)}
                            className="btn-modal-cancel"
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              background: 'rgba(239, 68, 68, 0.1)',
                            }}
                            title="Delete Session"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN USER FEEDBACK MANAGEMENT */}
      {activeTab === 'FEEDBACK' && (
        <div>
          <div className="filters-container" style={{ marginBottom: '20px' }}>
            <div className="difficulty-tabs">
              {['ALL', 'NEW', 'REVIEWING', 'RESOLVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setFeedbackStatusFilter(st);
                    setFeedbackPage(1);
                  }}
                  className={`diff-tab-btn ${feedbackStatusFilter === st ? 'active' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th>Subject & Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((fb) => (
                    <tr key={fb._id}>
                      <td><strong>{fb.userId?.email || 'User'}</strong></td>
                      <td><span className="badge badge-user" style={{ fontSize: '11px' }}>{fb.type}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(fb.rating)].map((_, i) => (
                            <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong>{fb.subject}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{fb.message}</p>
                      </td>
                      <td>
                        <span className={`badge ${fb.status === 'RESOLVED' ? 'badge-beginner' : fb.status === 'REVIEWING' ? 'badge-intermediate' : 'badge-admin'}`}>
                          {fb.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setResponseText(fb.adminResponse || '');
                            setResponseStatus(fb.status || 'RESOLVED');
                          }}
                          className="btn-primary"
                          style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target Type</th>
                    <th>Details</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td><strong>{log.adminEmail}</strong></td>
                      <td>
                        <span className="badge badge-admin" style={{ fontSize: '11px' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.targetType}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details}</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RESPOND MODAL FOR ADMIN */}
      {selectedFeedback && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>Respond to User Feedback</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              User: <strong>{selectedFeedback.userId?.email}</strong> • Subject: <strong>{selectedFeedback.subject}</strong>
            </p>

            <form onSubmit={handleSendFeedbackResponse}>
              <div className="form-group">
                <label>Status</label>
                <select value={responseStatus} onChange={(e) => setResponseStatus(e.target.value)} className="custom-select">
                  <option value="REVIEWING">🟡 Under Review</option>
                  <option value="RESOLVED">🟢 Resolved</option>
                  <option value="REJECTED">🔴 Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label>Admin Response Message</label>
                <textarea
                  placeholder="Type your official response to the user..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="custom-textarea"
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setSelectedFeedback(null)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', flex: 1 }}>
                  <Send size={16} /> Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN SESSION INSPECTION MODAL */}
      {inspectingSession && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px', textAlign: 'left', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#818cf8" /> Session Monitoring Inspection
              </h3>
              <button onClick={() => setInspectingSession(null)} className="btn-modal-cancel" style={{ padding: '4px 10px', fontSize: '12px' }}>
                ✖ Close
              </button>
            </div>

            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ffffff' }}>
                <strong>Topic:</strong> {inspectingSession.topic}
              </p>
              <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>User Email:</strong> {inspectingSession.userId?.email || 'User'} • <strong>Recorded On:</strong> {new Date(inspectingSession.createdAt).toLocaleString()}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <span className="badge badge-user" style={{ fontWeight: 700 }}>
                  Score: {inspectingSession.overallScore ?? 'N/A'} / 100
                </span>
                <span className="badge badge-user">
                  Duration: {inspectingSession.duration}s
                </span>
                <span className={`badge ${inspectingSession.processingStatus === 'completed' ? 'badge-beginner' : 'badge-advanced'}`}>
                  {inspectingSession.processingStatus || 'completed'}
                </span>
              </div>
            </div>

            {/* Audio Player */}
            {inspectingSession.audioUrl && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Audio Recording Playback
                </h4>
                <AudioPlayer src={inspectingSession.audioUrl} fallbackDuration={inspectingSession.duration} />
              </div>
            )}

            {/* Speech Transcript */}
            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                Speech Transcript
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '14px', fontStyle: 'italic', margin: 0, lineHeight: '1.6' }}>
                "{inspectingSession.transcript || 'No speech transcript recorded.'}"
              </p>
            </div>

            {/* Scores Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Grammar</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#34d399', margin: '2px 0 0' }}>{inspectingSession.grammarScore ?? '-'}/100</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vocabulary</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#c084fc', margin: '2px 0 0' }}>{inspectingSession.vocabularyScore ?? '-'}/100</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fluency</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', margin: '2px 0 0' }}>{inspectingSession.fluencyScore ?? '-'}/100</p>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pronunciation</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', margin: '2px 0 0' }}>{inspectingSession.pronunciationScore ?? '-'}/100</p>
              </div>
            </div>

            <button onClick={() => setInspectingSession(null)} className="btn-primary" style={{ width: '100%' }}>
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* SESSION DELETION CONFIRMATION MODAL WITH RED AMBIENT GLOW & BACKDROP BLUR */}
      {deletingSession && (
        <div className="modal-overlay delete-overlay">
          <div className="modal-card delete-card" style={{ maxWidth: '480px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div className="delete-icon-pulse">
                <Trash2 size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0, fontWeight: 800 }}>Confirm Session Deletion</h3>
                <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>⚠️ Action cannot be reversed</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Are you sure you want to permanently delete this practice session? This will remove the speech recording file, scores, and transcript from the server.
            </p>

            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>
                Topic: "{deletingSession.topic}"
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                User: {deletingSession.userId?.email || 'User'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Recorded On: {new Date(deletingSession.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeletingSession(null)}
                className="btn-modal-cancel"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSession(deletingSession._id)}
                className="btn-primary"
                style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
              >
                <Trash2 size={16} /> Yes, Delete Session
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminDashboard;
