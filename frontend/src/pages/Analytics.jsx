import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  AlertCircle,
  Filter,
  BarChart2,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import api from '../api';
import { ChartSkeleton, StatSkeleton } from '../components/Skeletons';

const Analytics = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState('all'); // '7d', '30d', '90d', 'all'
  const [progressData, setProgressData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const [progRes, topicRes] = await Promise.all([
          api.get(`/users/progress?range=${range}`),
          api.get('/users/topic-performance'),
        ]);

        const formattedProgress = (progRes.data.data || []).map((item, idx) => {
          const d = new Date(item.date || Date.now());
          const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
          const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...item,
            formattedDate: `${dateStr} ${timeStr}`,
            sessionLabel: `#${idx + 1} (${timeStr})`,
          };
        });

        const formattedTopics = (topicRes.data.data || []).map((item) => ({
          ...item,
          displayTopic: item.topic && item.topic.length > 22 ? item.topic.substring(0, 20) + '...' : item.topic,
        }));

        setProgressData(formattedProgress);
        setTopicData(formattedTopics);
      } catch (err) {
        console.error('Fetch analytics error:', err);
        setError('Failed to load performance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  // Overall metrics calculation from real MongoDB aggregation
  const totalSessions = progressData.length;
  const avgOverall = totalSessions > 0 ? Math.round(progressData.reduce((acc, s) => acc + (s.overallScore || 0), 0) / totalSessions) : 0;
  const totalDurationSecs = progressData.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalSpeakingHours = (totalDurationSecs / 3600).toFixed(1);
  const [chartType, setChartType] = useState('area'); // 'area', 'line', 'pie', 'bar'

  // Colors for PieChart
  const COLORS = ['#6366f1', '#34d399', '#c084fc', '#fbbf24'];

  // Latest aggregated metrics for Pie Chart
  const latestSession = progressData[progressData.length - 1];
  const pieData = latestSession
    ? [
        { name: 'Grammar', value: latestSession.grammarScore || 80 },
        { name: 'Vocabulary', value: latestSession.vocabularyScore || 80 },
        { name: 'Fluency', value: latestSession.fluencyScore || 80 },
        { name: 'Pronunciation', value: latestSession.pronunciationScore || 80 },
      ]
    : [
        { name: 'Grammar', value: 85 },
        { name: 'Vocabulary', value: 80 },
        { name: 'Fluency', value: 78 },
        { name: 'Pronunciation', value: 82 },
      ];

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modal-cancel"
            style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '8px' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2>Speaking Improvement Analytics</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Track skill progression, score trends, and topic mastery over time.
          </p>
        </div>

        {/* Date Range Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          {['7d', '30d', '90d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`diff-tab-btn ${range === r ? 'active' : ''}`}
              style={{ textTransform: 'uppercase', padding: '6px 12px', fontSize: '12px' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Award size={24} />
          </div>
          <div>
            <span className="stat-label">Average Score</span>
            <h3 className="stat-value">{avgOverall} / 100</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <span className="stat-label">Completed Sessions</span>
            <h3 className="stat-value">{totalSessions}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div>
            <span className="stat-label">Total Practice Time</span>
            <h3 className="stat-value">{totalSpeakingHours} Hours</h3>
          </div>
        </div>
      </div>

      {/* MULTI-CHART INTERACTIVE VIEW SELECTOR */}
      <div className="chart-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>Skill Performance & Progression</h3>

          {/* Interactive Chart Type Switcher */}
          <div className="difficulty-tabs" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
            <button
              onClick={() => setChartType('area')}
              className={`diff-tab-btn ${chartType === 'area' ? 'active' : ''}`}
            >
              📈 Smooth Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`diff-tab-btn ${chartType === 'line' ? 'active' : ''}`}
            >
              📉 Multi-Line
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`diff-tab-btn ${chartType === 'pie' ? 'active' : ''}`}
            >
              🍕 Skill Pie Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`diff-tab-btn ${chartType === 'bar' ? 'active' : ''}`}
            >
              📊 Skill Bars
            </button>
          </div>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : progressData.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '32px' }}>
            <TrendingUp size={36} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 12 }} />
            <h4>No session data for this range</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 4 }}>
              Complete more speaking practice sessions to see your progress trends.
            </p>
          </div>
        ) : (
          <div style={{ height: '340px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="sessionLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                  <Legend />
                  <Area type="linear" dataKey="overallScore" name="Overall Score" stroke="#818cf8" fillOpacity={1} fill="url(#colorOverall)" strokeWidth={3} />
                  <Area type="linear" dataKey="grammarScore" name="Grammar" stroke="#34d399" fillOpacity={0.1} fill="#34d399" />
                  <Area type="linear" dataKey="fluencyScore" name="Fluency" stroke="#fbbf24" fillOpacity={0.1} fill="#fbbf24" />
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="sessionLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                  <Legend />
                  <Line type="linear" dataKey="overallScore" name="Overall Score" stroke="#818cf8" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="linear" dataKey="grammarScore" name="Grammar" stroke="#34d399" strokeWidth={2} />
                  <Line type="linear" dataKey="vocabularyScore" name="Vocabulary" stroke="#c084fc" strokeWidth={2} />
                  <Line type="linear" dataKey="fluencyScore" name="Fluency" stroke="#fbbf24" strokeWidth={2} />
                </LineChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    cursor="pointer"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="sessionLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
                  <Legend />
                  <Bar dataKey="grammarScore" name="Grammar" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vocabularyScore" name="Vocabulary" fill="#c084fc" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fluencyScore" name="Fluency" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Topic Performance Bar Chart */}
      <div className="chart-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Performance Grouped by Topic</h3>
        {loading ? (
          <ChartSkeleton />
        ) : topicData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No topic performance data yet.</p>
        ) : (
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="displayTopic" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Legend />
                <Bar dataKey="avgScore" name="Average Score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="bestScore" name="Best Score" fill="#34d399" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
