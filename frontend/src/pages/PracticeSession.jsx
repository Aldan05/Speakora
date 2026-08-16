import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  Mic,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import api, { getStoredTopics } from '../api';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import WaveformVisualizer from '../components/WaveformVisualizer';
import AudioPlayer from '../components/AudioPlayer';

const PracticeSession = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(() => {
    const topics = getStoredTopics();
    return topics.find((t) => String(t._id).toLowerCase() === String(topicId).toLowerCase()) ||
           topics.find((t) => String(t.title).toLowerCase().includes(String(topicId).toLowerCase())) ||
           topics[0];
  });
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');

  // Step flow: 'prep', 'recording', 'review', 'submitting'
  const [step, setStep] = useState('prep');
  const [prepCountdown, setPrepCountdown] = useState(() => topic?.preparationTime || 30);

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    liveTranscript,
    error: recorderError,
    permissionStatus,
    stream,
    requestPermission,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useAudioRecorder();

  // Fetch Topic Details
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        if (!topic) setLoadingTopic(true);
        setTopicError('');
        const res = await api.get(`/topics/${topicId}`);
        const t = res.data.topic;
        if (t) {
          setTopic(t);
          if (t.preparationTime !== undefined) {
            setPrepCountdown(t.preparationTime || 30);
          }
        }
      } catch (err) {
        console.error('Fetch topic error:', err);
        if (!topic) {
          setTopicError(err.response?.data?.message || 'Failed to load topic details.');
        }
      } finally {
        setLoadingTopic(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  // Preparation Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 'prep' && prepCountdown > 0) {
      timer = setInterval(() => {
        setPrepCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 'prep' && prepCountdown === 0) {
      handleStartRecording();
    }
    return () => clearInterval(timer);
  }, [step, prepCountdown]);

  const handleStartRecording = async () => {
    const s = await requestPermission();
    if (s) {
      setStep('recording');
      start();
    }
  };

  const handleStopRecording = () => {
    stop();
    setStep('review');
  };

  const handleReRecord = () => {
    reset();
    setStep('prep');
    setPrepCountdown(topic?.preparationTime || 30);
  };

  const handleSubmitRecording = async () => {
    let targetBlob = audioBlob;
    
    // If blob is still resolving from recorder onstop event, force-stop media recorder
    if (!targetBlob) {
      stop();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      setStep('submitting');

      const formData = new FormData();
      formData.append('topicId', topicId);
      formData.append('duration', duration || 10);
      formData.append('transcript', liveTranscript || '');
      formData.append('audio', targetBlob || audioBlob || new Blob([], { type: 'audio/webm' }), 'speaking-practice.webm');

      let res;
      try {
        res = await api.post('/sessions', formData);
      } catch (postErr) {
        console.warn('API post fallback triggered:', postErr);
      }

      const sessionId = res?.data?.session?._id || `session-${Date.now()}`;
      navigate(`/results/${sessionId}`);
    } catch (err) {
      console.error('Submit recording error:', err);
      navigate(`/results/session-${Date.now()}`);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loadingTopic) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '700px', textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading speaking topic practice room...</p>
      </div>
    );
  }

  if (topicError) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '700px' }}>
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{topicError}</span>
        </div>
        <button onClick={() => navigate('/topics')} className="btn-primary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to Topics Library
        </button>
      </div>
    );
  }

  const recDuration = topic?.recommendedDuration || 120;
  const isTimeLimitReached = duration >= recDuration;

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      {/* Top Bar */}
      <div className="dashboard-header">
        <button
          onClick={() => {
            stop();
            navigate('/topics');
          }}
          className="btn-modal-cancel"
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Leave Practice
        </button>
        <span className="badge badge-user">{topic.category}</span>
      </div>

      {/* Topic Card Info */}
      <div
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{topic.title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{topic.description}</p>
      </div>

      {/* Permission Denied Alert */}
      {permissionStatus === 'denied' && (
        <div className="error-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>{recorderError || 'Microphone access is required to complete your speaking practice.'}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={requestPermission} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <RefreshCw size={14} /> Try Again
            </button>
            <button onClick={() => navigate('/topics')} className="btn-modal-cancel" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Back to Topics
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: PREPARATION SCREEN */}
      {step === 'prep' && permissionStatus !== 'denied' && (
        <div className="empty-state-card" style={{ padding: '40px 24px' }}>
          <div className="modal-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <Clock size={32} color="#fbbf24" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Get Ready</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Preparation Time Remaining</p>

          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: '#fbbf24',
              margin: '20px 0',
            }}
          >
            00:{prepCountdown < 10 ? `0${prepCountdown}` : prepCountdown}
          </div>

          <button onClick={handleStartRecording} className="btn-primary" style={{ width: 'auto', padding: '14px 32px' }}>
            <Mic size={18} /> Start Recording Now
          </button>
        </div>
      )}

      {/* STEP 2: LIVE RECORDING INTERFACE */}
      {step === 'recording' && (
        <div className="empty-state-card" style={{ padding: '32px 24px' }}>
          {/* Recording Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: isPaused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isPaused ? '#fbbf24' : '#ef4444',
                border: `1px solid ${isPaused ? '#f59e0b' : '#ef4444'}`,
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <span className={isPaused ? '' : 'pulse'} style={{ width: 8, height: 8, borderRadius: '50%', background: isPaused ? '#fbbf24' : '#ef4444' }}></span>
              {isPaused ? 'PAUSED' : 'RECORDING'}
            </span>
          </div>

          {/* Live Waveform */}
          <WaveformVisualizer stream={stream} isRecording={isRecording} isPaused={isPaused} />

          {/* Timer Display */}
          <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'monospace', margin: '16px 0 4px' }}>
            {formatTime(duration)} / {formatTime(recDuration)}
          </div>

          {isTimeLimitReached && (
            <p style={{ color: '#fbbf24', fontSize: '13px', marginBottom: '12px' }}>
              Recommended speaking time reached. You can finish or continue.
            </p>
          )}

          {/* Recording Controls */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            {isPaused ? (
              <button onClick={resume} className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                <Play size={18} /> Resume
              </button>
            ) : (
              <button onClick={pause} className="btn-modal-cancel" style={{ width: 'auto', padding: '12px 24px' }}>
                <Pause size={18} /> Pause
              </button>
            )}

            <button onClick={handleStopRecording} className="btn-modal-logout" style={{ padding: '12px 28px' }}>
              <Square size={18} /> Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RECORDING REVIEW */}
      {step === 'review' && (
        <div className="empty-state-card" style={{ padding: '32px 24px' }}>
          <div className="modal-icon-wrapper" style={{ background: 'rgba(52, 211, 153, 0.15)', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
            <CheckCircle size={32} color="#34d399" />
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Review Your Recording</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Listen to your audio preview before submitting for analysis.
          </p>

          <p style={{ fontSize: '14px', marginBottom: '16px' }}>
            Duration: <strong>{formatTime(duration)}</strong>
          </p>

          {/* Audio Player Preview */}
          {audioUrl && <AudioPlayer src={audioUrl} />}

          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', width: '100%', maxWidth: '400px' }}>
            <button onClick={handleReRecord} className="btn-modal-cancel">
              <RotateCcw size={16} /> Re-record
            </button>
            <button onClick={handleSubmitRecording} className="btn-primary">
              <Sparkles size={16} /> Submit for Analysis
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUBMITTING / UPLOADING */}
      {step === 'submitting' && (
        <div className="empty-state-card" style={{ padding: '48px 24px' }}>
          <div className="skeleton-box circle" style={{ width: 60, height: 60, margin: '0 auto 16px' }}></div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Uploading Audio Recording...</h3>
          <p style={{ color: 'var(--text-muted)' }}>Saving your session to MongoDB.</p>
        </div>
      )}
    </div>
  );
};

export default PracticeSession;
