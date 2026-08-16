import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  FileText,
  TrendingUp,
  Award,
  BookOpen,
  ThumbsUp,
  Target,
  MessageSquare,
  Activity,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../api';
import AudioPlayer from '../components/AudioPlayer';
import ScoreCard from '../components/ScoreCard';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [selectedWordAlt, setSelectedWordAlt] = useState(null);

  const fetchSessionDetails = async () => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      const s = res.data.session;
      setSession(s);
      setError('');
      return s;
    } catch (err) {
      console.error('Fetch session error:', err);
      if (err.response?.status === 403) {
        setError('Access Denied. You do not have permission to view this session.');
      } else {
        setError(err.response?.data?.message || 'Unable to load session results.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let pollInterval;

    fetchSessionDetails().then((s) => {
      if (s && (s.processingStatus === 'pending' || s.processingStatus === 'processing')) {
        pollInterval = setInterval(async () => {
          const updated = await fetchSessionDetails();
          if (updated && (updated.processingStatus === 'completed' || updated.processingStatus === 'failed')) {
            clearInterval(pollInterval);
          }
        }, 300);
      }
    });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId]);

  const handleCopyTranscript = () => {
    if (session?.transcript) {
      navigator.clipboard.writeText(session.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '700px', textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving speaking session results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '700px' }}>
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  const isProcessing = session.processingStatus === 'pending' || session.processingStatus === 'processing';
  const isFailed = session.processingStatus === 'failed';
  const audioStreamUrl = `http://localhost:5000/api/sessions/${session._id}/audio`;

  // Recharts bar/radar data built from real MongoDB scores
  const radarData = [
    { subject: 'Grammar', score: session.grammarScore || 0 },
    { subject: 'Vocabulary', score: session.vocabularyScore || 0 },
    { subject: 'Fluency', score: session.fluencyScore || 0 },
    { subject: 'Pace', score: session.paceScore || (session.wordsPerMinute ? (session.wordsPerMinute >= 130 && session.wordsPerMinute <= 150 ? 100 : 75) : 75) },
    { subject: 'Pronunciation', score: session.pronunciationScore || 0 },
  ];

  const getScoreCategory = (val) => {
    if (val >= 90) return { label: 'Excellent', color: '#34d399' };
    if (val >= 75) return { label: 'Good', color: '#818cf8' };
    if (val >= 60) return { label: 'Needs Improvement', color: '#fbbf24' };
    return { label: 'Needs Attention', color: '#ef4444' };
  };

  const overallCategory = session.overallScore !== null ? getScoreCategory(session.overallScore) : null;
  const paceVal = session.paceScore || (session.wordsPerMinute ? (session.wordsPerMinute >= 130 && session.wordsPerMinute <= 150 ? 100 : 75) : 75);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modal-cancel"
            style={{ padding: '6px 12px', fontSize: '13px', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Speaking Analysis Results</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
            Topic: <strong>{session.topic}</strong> • Recorded on {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => navigate(`/practice/${session.topicId?._id || session.topicId}`)}
          className="btn-primary"
          style={{ width: 'auto', padding: '10px 20px', alignSelf: 'center' }}
        >
          <Sparkles size={16} /> Practice Again
        </button>
      </div>

      {/* Processing Pipeline Stages */}
      <div
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
      >
        <h4 style={{ fontSize: '15px', marginBottom: '14px' }}>AI Processing Pipeline</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
            <CheckCircle2 size={16} /> Recording Uploaded
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
            <CheckCircle2 size={16} /> Whisper STT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
            <CheckCircle2 size={16} /> LanguageTool Grammar
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: session.overallScore !== null ? '#34d399' : '#fbbf24' }}>
            {session.overallScore !== null ? <CheckCircle2 size={16} /> : <Clock size={16} className="pulse" />}
            {session.overallScore !== null ? 'AI Analysis Complete' : 'Calculating Metrics...'}
          </div>
        </div>
      </div>

      {/* OVERALL SCORE BANNER & RADAR CHART */}
      {session.overallScore !== null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Main Score Hero Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span className="stat-label" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⭐ Overall Speaking Score
            </span>
            <div style={{ fontSize: '64px', fontWeight: 800, color: overallCategory.color, margin: '8px 0' }}>
              {session.overallScore} <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <span
              className="badge"
              style={{
                background: `${overallCategory.color}22`,
                color: overallCategory.color,
                border: `1px solid ${overallCategory.color}55`,
                fontSize: '14px',
                padding: '6px 16px',
                marginBottom: '12px',
              }}
            >
              {overallCategory.label}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Weighted: Grammar (25%) + Vocab (20%) + Fluency (25%) + Pace (10%) + Pronunciation (20%)
            </p>
          </div>

          {/* Recharts Skill Bar Chart */}
          <div className="chart-card" style={{ height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Skills Performance Comparison
            </h4>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={radarData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', color: '#ffffff' }} />
                <Bar dataKey="score" name="Score" fill="#6366f1" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DETAILED SCORE CARDS & EXPLANATIONS ("Why points were given") */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Detailed Skill Breakdown & Explanations</h3>
        {session.overallScore !== null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <ScoreCard title="📝 Grammar (25%)" score={session.grammarScore} />
              <ScoreCard title="📚 Vocabulary (20%)" score={session.vocabularyScore} />
              <ScoreCard title="🗣️ Fluency (25%)" score={session.fluencyScore} />
              <ScoreCard title="⚡ Pace (10%)" score={paceVal} />
              <ScoreCard title="🔊 Pronunciation (20%)" score={session.pronunciationScore} isEstimated />
            </div>

            {/* Score Explanation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginTop: '8px' }}>
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '6px' }}>📝 Grammar — {session.grammarScore}/100</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {session.grammarIssues?.length > 0
                    ? `Detected ${session.grammarIssues.length} minor grammar error(s). Review corrections below.`
                    : 'Your sentences were clear, well-constructed, and grammatically sound!'}
                </p>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '6px' }}>📚 Vocabulary — {session.vocabularyScore}/100</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {session.vocabularyRichness >= 0.5
                    ? `Good vocabulary variety using ${session.uniqueWordCount || 0} unique words.`
                    : 'Basic vocabulary detected. Try incorporating more descriptive adjectives and synonyms.'}
                </p>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '6px' }}>🗣️ Fluency — {session.fluencyScore}/100</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {session.fillerWordCount > 0
                    ? `Your speech was mostly smooth, but you used ${session.fillerWordCount} filler sound(s).`
                    : 'Speech flow was smooth and natural with zero filler word interruptions!'}
                </p>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '6px' }}>⚡ Speaking Pace — {paceVal}/100</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {session.wordsPerMinute >= 130 && session.wordsPerMinute <= 150
                    ? `Optimal speaking pace of ${session.wordsPerMinute} WPM for crisp articulation.`
                    : `Recorded pace of ${session.wordsPerMinute || 0} WPM. Target 130–150 WPM for maximum clarity.`}
                </p>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '6px' }}>🔊 Pronunciation — {session.pronunciationScore}/100 (Estimated)</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Estimated from acoustic duration, sentence structure, and fluency signals.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state-card" style={{ padding: '32px' }}>
            <Sparkles size={36} color="var(--primary)" style={{ opacity: 0.7, marginBottom: 12 }} />
            <h4>AI Analysis Processing...</h4>
          </div>
        )}
      </div>

      {/* SPEAKING STATISTICS CARD GRID */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Speaking Metrics & Pace</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Clock size={24} />
            </div>
            <div>
              <span className="stat-label">Duration</span>
              <h3 className="stat-value">{session.duration} sec</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <FileText size={24} />
            </div>
            <div>
              <span className="stat-label">Words Spoken</span>
              <h3 className="stat-value">{session.wordsSpoken || 0}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Zap size={24} />
            </div>
            <div>
              <span className="stat-label">Speaking Rate (WPM)</span>
              <h3 className="stat-value">{session.wordsPerMinute || 0} WPM</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
              <Activity size={24} />
            </div>
            <div>
              <span className="stat-label">Filler Words</span>
              <h3 className="stat-value">{session.fillerWordCount || 0}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span className="stat-label">Unique Words</span>
              <h3 className="stat-value">{session.uniqueWordCount || 0}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="stat-label">Vocabulary Richness</span>
              <h3 className="stat-value">{session.vocabularyRichness ? `${Math.round(session.vocabularyRichness * 100)}%` : '0%'}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIO PLAYBACK PLAYER */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Original Audio Recording</h3>
        <AudioPlayer src={audioStreamUrl} fallbackDuration={session.duration} />
      </div>

      {/* REAL WHISPER TRANSCRIPT SECTION */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px' }}>Your AI Speech Transcript</h3>
          {session.transcript && (
            <button onClick={handleCopyTranscript} className="btn-modal-cancel" style={{ padding: '6px 12px', fontSize: '12px' }}>
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Transcript'}
            </button>
          )}
        </div>

        <div
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          {session.transcript ? (
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              "{session.transcript}"
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No speech transcript available.</p>
          )}
        </div>
      </div>

      {/* PERSONALIZED INTERACTIVE LEARNING & COACHING TOOL */}
      {session.overallScore !== null && (
        <div style={{ marginBottom: '32px' }}>
          {/* 🎯 YOUR TOP PRIORITIES BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Target size={22} color="#fbbf24" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>🎯 YOUR TOP PRIORITIES</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Speakora personal coach identified the top areas for your immediate practice focus:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {session.learningDetails?.topPriorities ? (
                session.learningDetails.topPriorities.map((item, idx) => {
                  const colors = ['#ef4444', '#f97316', '#eab308'];
                  const color = colors[idx] || '#818cf8';
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--input-bg)',
                        border: `1px solid ${color}44`,
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                            {idx + 1}. {item.title}
                          </span>
                          <span className="badge" style={{ background: `${color}22`, color: color, border: `1px solid ${color}55`, fontWeight: 800 }}>
                            {item.score}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{item.tag}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Processing top priorities...</div>
              )}
            </div>
          </div>

          {/* DETAILED INTERACTIVE LEARNING CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            
            {/* 📝 CARD 1: GRAMMAR & SPELLING */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '18px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#818cf8" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>📝 Grammar & Spelling</h3>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#818cf8' }}>
                  {session.grammarScore}/100
                </span>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#fca5a5', marginBottom: '14px', fontWeight: 700 }}>
                {session.grammarIssues?.length || session.learningDetails?.grammar?.issuesCount || 0} issue(s) detected in your recording
              </div>

              {/* Sample / Detected Sentence Snippet */}
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#e2e8f0', marginBottom: '16px', fontStyle: 'italic' }}>
                "{session.transcript ? (session.transcript.length > 70 ? session.transcript.substring(0, 70) + '...' : session.transcript) : 'I am studing computer science and I goes to college every day.'}"
              </div>

              {/* Clickable Corrections */}
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Interactive Corrections (Click to view details):
              </h4>
              
              {session.learningDetails?.grammar?.corrections?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {session.learningDetails.grammar.corrections.map((corr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCorrection(selectedCorrection === idx ? null : idx)}
                      style={{
                        background: selectedCorrection === idx ? 'rgba(99, 102, 241, 0.2)' : 'var(--input-bg)',
                        border: selectedCorrection === idx ? '1px solid #818cf8' : '1px solid var(--card-border)',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: '#fca5a5', textDecoration: 'line-through', marginRight: '8px' }}>❌ {corr.original}</span>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>✅ {corr.correction}</span>
                        </div>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '10px' }}>
                          Type: {corr.type}
                        </span>
                      </div>

                      {selectedCorrection === idx && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px stroke rgba(255,255,255,0.1)', fontSize: '12px', color: '#e2e8f0' }}>
                          💡 <strong>Explanation:</strong> {corr.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: '#34d399', marginBottom: '16px' }}>
                  ✅ Zero grammar or spelling mistakes detected in your recording!
                </div>
              )}

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#818cf8' }}>
                <strong>Practice Tip:</strong> {session.learningDetails?.grammar?.practiceTip || 'Practice subject–verb agreement with I, You, He, She, They.'}
              </div>
            </div>

            {/* 📚 CARD 2: VOCABULARY VARIETY */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '18px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="#38bdf8" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>📚 Vocabulary Variety</h3>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                  {session.vocabularyScore}/100
                </span>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#fcd34d', marginBottom: '14px', fontWeight: 700 }}>
                {session.vocabularyRichness >= 0.6 ? 'Good variety detected' : 'Word repetition & basic descriptors detected'}
              </div>

              {/* Repeated Words Alert if detected */}
              {session.learningDetails?.vocabulary?.repeatedWords?.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', fontSize: '12px', color: '#fca5a5' }}>
                  <strong>🔄 Word Repetition Warning:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {session.learningDetails.vocabulary.repeatedWords.map((rw, idx) => (
                      <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: '#f87171', fontWeight: 700 }}>
                        "{rw.word}" (used {rw.count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Click Better Vocabulary Alternatives:
              </h4>

              {/* Interactive Alternative Word Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {(session.learningDetails?.vocabulary?.alternatives || ['useful', 'beneficial', 'effective', 'valuable']).map((word, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSelectedWordAlt(selectedWordAlt === word ? null : word)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: selectedWordAlt === word ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)',
                      color: selectedWordAlt === word ? '#0f172a' : '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedWordAlt === word ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none',
                    }}
                  >
                    • {word}
                  </span>
                ))}
              </div>

              {/* Before vs After Example Box built dynamically from user's actual transcript */}
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
                <p style={{ color: '#fca5a5', margin: '0 0 8px 0', lineHeight: '1.6' }}>
                  ❌ <strong>Original Speech:</strong> {session.learningDetails?.vocabulary?.exampleBefore || `"${session.transcript ? session.transcript.substring(0, 60) : 'Sample speech'}"`}
                </p>
                <p style={{ color: '#34d399', margin: 0, lineHeight: '1.6' }}>
                  ✅ <strong>Enriched Speech:</strong> {(() => {
                    const rawAfter = session.learningDetails?.vocabulary?.exampleAfter || `"${session.transcript ? session.transcript.substring(0, 60) : 'Sample speech'}"`;
                    let currentText = rawAfter;
                    if (selectedWordAlt && currentText.includes('**')) {
                      currentText = currentText.replace(/\*\*(.*?)\*\*/g, `**${selectedWordAlt}**`);
                    }
                    const parts = currentText.split(/(\*\*.*?\*\*)/g);
                    return parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        const cleanWord = part.slice(2, -2);
                        return (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(52, 211, 153, 0.25)',
                              color: '#34d399',
                              border: '1px solid rgba(52, 211, 153, 0.5)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              margin: '0 3px',
                              display: 'inline-block',
                            }}
                          >
                            {cleanWord}
                          </span>
                        );
                      }
                      return part;
                    });
                  })()}
                </p>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#38bdf8' }}>
                <strong>Practice Tip:</strong> {session.learningDetails?.vocabulary?.practiceTip || 'Incorporate descriptive synonyms to enhance speech richness.'}
              </div>
            </div>

            {/* 🗣️ CARD 3: FLUENCY & FILLERS */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '18px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#c084fc" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>🗣️ Fluency & Flow</h3>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#c084fc' }}>
                  {session.fluencyScore}/100
                </span>
              </div>

              {/* Detected Counters Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ background: 'var(--input-bg)', padding: '10px 6px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pauses</span>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc', margin: '2px 0 0' }}>
                    ⏸️ {session.learningDetails?.fluency?.longPauses ?? 0}
                  </p>
                </div>
                <div style={{ background: 'var(--input-bg)', padding: '10px 6px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Repeats</span>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc', margin: '2px 0 0' }}>
                    🔄 {session.learningDetails?.fluency?.repeatedPhrases ?? 0}
                  </p>
                </div>
                <div style={{ background: 'var(--input-bg)', padding: '10px 6px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fillers</span>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#fcd34d', margin: '2px 0 0' }}>
                    🟡 {session.fillerWordCount || 0}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#e2e8f0', marginBottom: '16px' }}>
                <strong>Detected Example Snippet:</strong>
                <p style={{ color: '#fcd34d', margin: '4px 0 0', fontStyle: 'italic' }}>
                  {session.learningDetails?.fluency?.snippet || (session.transcript ? `"${session.transcript.substring(0, 50)}..."` : '"Speech audio recorded."')}
                </p>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px dashed rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#c084fc' }}>
                <strong>How to improve:</strong> {session.learningDetails?.fluency?.advice || 'Replace filler words with a short natural pause and organize your sentence before speaking.'}
              </div>
            </div>

            {/* ⚡ CARD 4: SPEAKING PACE */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '18px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} color="#fbbf24" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>⚡ Speaking Pace</h3>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>
                  {session.paceScore || 80}/100
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recorded Pace</span>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
                    {session.wordsPerMinute || 120} WPM
                  </p>
                </div>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }}>
                  {session.wordsPerMinute >= 125 && session.wordsPerMinute <= 155 ? '🟢 Ideal Target' : (session.wordsPerMinute > 155 ? '🟠 Slightly Fast' : '🟠 Slightly Slow')}
                </span>
              </div>

              <div style={{ background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Target Range: <strong style={{ color: '#34d399' }}>130–155 WPM</strong> for clear, professional delivery.
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#fbbf24' }}>
                <strong>How to improve:</strong> {session.learningDetails?.pace?.advice || (session.wordsPerMinute >= 125 && session.wordsPerMinute <= 155 ? 'Your pace is right in the optimal zone (125–155 WPM)! Maintain this clear articulation.' : 'Practice reading aloud with timed prompts to build speed toward 125–155 WPM.')}
              </div>
            </div>

            {/* 🔊 CARD 5: PRONUNCIATION (ESTIMATED) */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '18px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="#34d399" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>🔊 Pronunciation</h3>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
                  {session.pronunciationScore}/100
                </span>
              </div>

              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '14px', display: 'inline-block' }}>
                ⚠️ Estimated from audio cadence & text signals
              </span>

              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Words That May Need Attention:
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {(session.learningDetails?.pronunciation?.attentionWords?.length > 0
                  ? session.learningDetails.pronunciation.attentionWords
                  : (session.transcript ? session.transcript.split(/\s+/).filter(w => w.length >= 4).slice(0, 3) : ['Speech', 'Clarity', 'Delivery'])
                ).map((w, idx) => (
                  <span key={idx} style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                    🗣️ {w.replace(/[^a-zA-Z]/g, '')}
                  </span>
                ))}
              </div>

              <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px dashed rgba(52, 211, 153, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#34d399' }}>
                <strong>How to improve:</strong> Practice difficult words slowly, then repeat them at normal speaking speed.
              </div>
            </div>

          </div>

          {/* NEXT PRACTICE ACTION PLAN BOX */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8' }}>
              <Sparkles size={24} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>🚀 Your Next Practice Session</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <span className="stat-label" style={{ fontSize: '11px' }}>Focus Skill</span>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#6366f1', margin: '4px 0 0' }}>
                  {session.learningDetails?.topPriorities?.[0]?.title || 'Speaking Pace'}
                </p>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <span className="stat-label" style={{ fontSize: '11px' }}>Target Goal</span>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#34d399', margin: '4px 0 0' }}>
                  {session.wordsPerMinute ? (session.wordsPerMinute < 125 ? 'Target: 125–155 WPM' : 'Zero Filler Words') : '130–150 WPM'}
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
              <span className="stat-label" style={{ fontSize: '12px' }}>Recommended Practice Topic</span>
              <p style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, margin: '6px 0 12px' }}>
                "Describe your favorite technology and explain why you like it."
              </p>
              <button
                onClick={() => navigate('/topics')}
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}
              >
                <Sparkles size={16} /> Start Practice Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRONUNCIATION DISCLAIMER */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid var(--card-border)',
          borderRadius: '14px',
          padding: '16px 20px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <AlertCircle size={18} color="#818cf8" style={{ flexShrink: 0 }} />
        <span>
          Pronunciation ({session.pronunciationScore || 0}/100) is currently estimated from speech clarity, cadence, and fluency metrics.
        </span>
      </div>

      {/* QUICK SESSION AI FEEDBACK BOX */}
      <div className="topic-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%)' }}>
        <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '8px' }}>How helpful was this AI speaking analysis?</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Rate this AI session output to help us improve your speaking analysis precision.</p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/feedback')}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }}
          >
            <MessageSquare size={16} /> Rate & Leave Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
