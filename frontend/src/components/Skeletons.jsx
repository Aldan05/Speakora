import React from 'react';

export const StatSkeleton = () => (
  <div className="stat-card skeleton-pulse">
    <div className="skeleton-box circle" style={{ width: 48, height: 48 }}></div>
    <div style={{ flex: 1 }}>
      <div className="skeleton-box" style={{ width: '60%', height: 12, marginBottom: 8 }}></div>
      <div className="skeleton-box" style={{ width: '40%', height: 24 }}></div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="table-responsive skeleton-pulse" style={{ padding: 20 }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div className="skeleton-box" style={{ flex: 2, height: 20 }}></div>
        <div className="skeleton-box" style={{ flex: 2, height: 20 }}></div>
        <div className="skeleton-box" style={{ flex: 1, height: 20 }}></div>
        <div className="skeleton-box" style={{ flex: 1, height: 20 }}></div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="stat-card skeleton-pulse" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="skeleton-box" style={{ width: '80%', height: '70%' }}></div>
  </div>
);
