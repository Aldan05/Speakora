import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Sparkles } from 'lucide-react';
import api from '../api';

const PracticePlaceholder = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);

  useEffect(() => {
    if (topicId) {
      api.get(`/topics/${topicId}`)
        .then((res) => setTopic(res.data.topic))
        .catch((err) => console.error("Error fetching topic for practice:", err));
    }
  }, [topicId]);

  return (
    <div className="dashboard-container" style={{ maxWidth: '600px', textAlign: 'center', padding: '48px 32px' }}>
      <div className="modal-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <Mic size={32} color="var(--primary)" />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
        Practice Session Ready
      </h2>

      {topic && (
        <div style={{ margin: '16px 0', padding: '12px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Selected Topic:</p>
          <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>{topic.title}</strong>
        </div>
      )}

      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
        Speaking practice audio recording, AI pitch analyzer, and live speech-to-text feedback will be available in <strong>Phase 5: Audio Recording</strong>.
      </p>

      <button onClick={() => navigate('/dashboard')} className="btn-primary">
        <ArrowLeft size={16} /> Return to User Dashboard
      </button>
    </div>
  );
};

export default PracticePlaceholder;
