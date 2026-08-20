import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';

function Analytics() {
  const [systemData, setSystemData] = useState(null);
  const [modelStatus, setModelStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, modelsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/overview`),
        fetch(`${API_BASE}/status/models`),
      ]);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        setSystemData(overview);
      }

      if (modelsRes.ok) {
        const models = await modelsRes.json();
        setModelStatus(models);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📈 System Analytics</h2>
        <button className="btn btn-refresh" onClick={fetchAnalytics}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {systemData && (
            <div className="analytics-grid">
              <div className="stat-card">
                <h3>Total Alarms</h3>
                <div className="stat-value">{systemData.total_alarms}</div>
              </div>

              <div className="stat-card">
                <h3>Active Alarms</h3>
                <div className="stat-value">{systemData.active_alarms}</div>
              </div>

              <div className="stat-card">
                <h3>User Interactions</h3>
                <div className="stat-value">{systemData.total_behaviors_recorded}</div>
              </div>

              <div className="stat-card">
                <h3>Anomalies Detected</h3>
                <div className="stat-value">{systemData.total_anomalies_detected}</div>
              </div>
            </div>
          )}

          <div className="models-section">
            <h3>🧠 AI Models Status</h3>
            <div className="models-list">
              {modelStatus.map((model, idx) => (
                <div key={idx} className="model-card">
                  <div className="model-info">
                    <h4>{model.model_type}</h4>
                    <p>
                      Status:{' '}
                      <span className={model.is_fitted ? 'fitted' : 'not-fitted'}>
                        {model.is_fitted ? '✓ Trained' : '○ Not Trained'}
                      </span>
                    </p>
                    {model.training_samples > 0 && (
                      <p>Training Samples: {model.training_samples}</p>
                    )}
                  </div>
                  <div className="model-status-indicator">
                    <div
                      className={`indicator ${model.is_fitted ? 'active' : 'inactive'}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {systemData && (
            <div className="system-status">
              <h3>System Status</h3>
              <p>Status: <strong>{systemData.system_status}</strong></p>
              <p>Last Update: <strong>{new Date(systemData.timestamp).toLocaleString()}</strong></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
