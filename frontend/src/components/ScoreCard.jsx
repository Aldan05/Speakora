import React from 'react';
import { Award } from 'lucide-react';

const ScoreCard = ({ title, score, isEstimated }) => {
  if (score === null || score === undefined) return null;

  const getScoreColor = (val) => {
    if (val >= 80) return '#34d399';
    if (val >= 60) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: getScoreColor(score) }}>
        <Award size={24} />
      </div>
      <div>
        <span className="stat-label">
          {title} {isEstimated && <small style={{ color: 'var(--text-muted)' }}>(Estimated)</small>}
        </span>
        <h3 className="stat-value" style={{ color: getScoreColor(score) }}>
          {score} / 100
        </h3>
      </div>
    </div>
  );
};

export default ScoreCard;
