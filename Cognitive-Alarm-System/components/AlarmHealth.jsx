import React, { useState, useEffect } from 'react';
import '../styles/AlarmHealth.css';

function AlarmHealth({ alarms }) {
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchHealthData();
  }, [alarms]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const data = {};
      
      for (const alarm of alarms) {
        try {
          const response = await fetch(`${API_BASE}/analytics/alarm/${alarm.id}/health`);
          if (response.ok) {
            const healthInfo = await response.json();
            data[alarm.id] = healthInfo;
          }
        } catch (error) {
          console.error(`Failed to fetch health for alarm ${alarm.id}:`, error);
        }
      }
      
      setHealthData(data);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 0.8) return '#4ade80';
    if (score >= 0.6) return '#fbbf24';
    return '#f87171';
  };

  const getRecommendationEmoji = (recommendation) => {
    const map = {
      optimal: '✓',
      increase_intensity: '⬆',
      can_reduce_intensity: '⬇',
    };
    return map[recommendation] || '→';
  };

  if (alarms.length === 0) {
    return (
      <div className="alarm-health-container">
        <p className="empty-message">No alarms to analyze</p>
      </div>
    );
  }

  return (
    <div className="alarm-health-container">
      <div className="health-header">
        <h2>🏥 Alarm Health Analysis</h2>
        <button className="btn btn-refresh" onClick={fetchHealthData}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="loading">Analyzing alarms...</div>}

      <div className="health-grid">
        {alarms.map(alarm => {
          const health = healthData[alarm.id] || null;

          if (!health) {
            return (
              <div key={alarm.id} className="health-card placeholder">
                <h3>{alarm.title}</h3>
                <p>No data available</p>
              </div>
            );
          }

          return (
            <div key={alarm.id} className="health-card">
              <div className="health-header-card">
                <h3>{alarm.title}</h3>
                <span className="health-badge" style={{ backgroundColor: getHealthColor(health.effectiveness_score) }}>
                  {(health.effectiveness_score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-label">Dismissed on time:</span>
                  <span className="metric-value">{health.dismissed_count}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Snoozed:</span>
                  <span className="metric-value">{health.snoozed_count}</span>
                </div>
              </div>

              <div className="health-score-bar">
                <div
                  className="health-score-fill"
                  style={{
                    width: `${health.effectiveness_score * 100}%`,
                    backgroundColor: getHealthColor(health.effectiveness_score),
                  }}
                ></div>
              </div>

              <div className="recommendation">
                <span className="rec-emoji">
                  {getRecommendationEmoji(health.recommendation)}
                </span>
                <span className="rec-text">
                  {health.recommendation === 'optimal'
                    ? 'Alarm is working perfectly'
                    : health.recommendation === 'increase_intensity'
                    ? 'Consider increasing intensity'
                    : 'Can reduce intensity'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="health-footer">
        <p>💡 Health scores are based on your interaction patterns with alarms over the last 7 days.</p>
      </div>
    </div>
  );
}

export default AlarmHealth;
