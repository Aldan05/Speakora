import React from 'react';
import { Clock, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopicCard = ({ topic }) => {
  const navigate = useNavigate();

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

  const formatDuration = (seconds) => {
    if (!seconds) return '1 minute';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    return `${secs} seconds`;
  };

  return (
    <div className="topic-card">
      <div className="topic-card-header">
        <span className="topic-category">
          <Layers size={14} /> {topic.category}
        </span>
        {getDifficultyBadge(topic.difficulty)}
      </div>

      <h3 className="topic-title" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{topic.title}</h3>
      <p className="topic-description" style={{ wordBreak: 'break-word' }}>{topic.description}</p>

      <div className="topic-meta">
        <span className="meta-item">
          <Clock size={15} color="var(--primary)" /> ⏱ {formatDuration(topic.recommendedDuration)}
        </span>
        {topic.preparationTime > 0 && (
          <span className="meta-item">
            <HelpCircle size={15} color="var(--text-muted)" /> Prep: {topic.preparationTime}s
          </span>
        )}
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: '16px', padding: '10px' }}
        onClick={() => navigate(`/topics/${topic._id}`)}
      >
        <Sparkles size={16} /> Select & View Details
      </button>
    </div>
  );
};

export default TopicCard;
