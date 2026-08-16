import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Sparkles,
  FileText,
  Activity,
  Award,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PlayCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already authenticated, allow quick navigation to dashboard
  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-main)', paddingBottom: '60px' }}>
      {/* Top Navbar */}
      <nav
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Mic size={22} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: '#ffffff' }}>SPEAKORA</h1>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="btn-modal-cancel"
              style={{ padding: '10px 22px', fontSize: '14px' }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '60px auto 80px',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <span
          className="badge"
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '8px 18px',
            fontSize: '13px',
            marginBottom: '20px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={15} /> AI-Powered English Speaking Intelligence
        </span>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 900,
            lineHeight: '1.2',
            color: '#ffffff',
            margin: '16px 0 24px',
            letterSpacing: '-0.5px',
          }}
        >
          Improve Your English. <br />
          <span style={{ color: '#818cf8' }}>Speak with Confidence.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
          }}
        >
          Practice speaking naturally, receive instant AI-powered feedback on your grammar, vocabulary, and fluency, and visualize your communication progress.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetStarted}
            className="btn-primary"
            style={{ width: 'auto', padding: '14px 36px', fontSize: '16px', borderRadius: '14px' }}
          >
            Start Speaking Now <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-modal-cancel"
            style={{ padding: '14px 28px', fontSize: '16px', borderRadius: '14px' }}
          >
            Existing User Login
          </button>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
            Why Practice with Speakora?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Everything you need to transform your spoken English fluency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', marginBottom: '16px' }}>
              <Mic size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>🎙️ AI Speaking Practice</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Practice real-world interview, career, and debate topics with live voice recording visualizers.
            </p>
          </div>

          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', marginBottom: '16px' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>📝 Automatic Transcription</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              OpenAI Whisper speech recognition transcribes your exact words instantly into text.
            </p>
          </div>

          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', marginBottom: '16px' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>🧠 Grammar & Vocabulary Analysis</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Automated LanguageTool NLP detects grammatical mistakes and calculates vocabulary richness.
            </p>
          </div>

          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', marginBottom: '16px' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>📊 Progress Analytics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Interactive Recharts line and bar graphs track your speaking score progression over time.
            </p>
          </div>

          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', marginBottom: '16px' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>💬 Personalized Feedback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Receive targeted suggestions highlighting your speaking strengths and exact areas for improvement.
            </p>
          </div>

          <div className="topic-card" style={{ padding: '28px' }}>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', marginBottom: '16px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>📈 Track Your Improvement</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Review past audio recordings, monitor speaking pace (WPM), and filler word counts over time.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
            How Speakora Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            A simple 5-step journey to English speaking confidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center' }}>
          {[
            { step: '1', title: 'Choose a Topic', desc: 'Select from Beginner, Intermediate or Advanced topics.' },
            { step: '2', title: 'Record Your Voice', desc: 'Use live microphone recorder with waveform visualizer.' },
            { step: '3', title: 'AI Analyzes Speech', desc: 'Whisper STT & LanguageTool analyze your recording.' },
            { step: '4', title: 'Get Your Results', desc: 'View grammar, vocabulary & fluency score breakdowns.' },
            { step: '5', title: 'Improve & Repeat', desc: 'Track progress analytics and practice again.' },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                {item.step}
              </div>
              <h4 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '6px' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer style={{ borderTop: '1px solid var(--card-border)', paddingTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        <p>© 2026 Speakora. AI-Powered English Communication Platform.</p>
      </footer>
    </div>
  );
};

export default Landing;
