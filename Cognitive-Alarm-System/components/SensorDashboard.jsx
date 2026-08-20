import React, { useState, useEffect } from 'react';
import '../styles/SensorDashboard.css';

function SensorDashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [anomalies, setAnomalies] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    // Simulate sensor data
    const mockSensors = [
      { id: 'sensor_1', name: 'Temperature', value: 22.5, unit: '°C' },
      { id: 'sensor_2', name: 'Humidity', value: 65, unit: '%' },
      { id: 'sensor_3', name: 'Pressure', value: 1013, unit: 'mb' },
      { id: 'sensor_4', name: 'Motion', value: 0.3, unit: 'm/s' },
    ];
    setSensorData(mockSensors);
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const data = {};
      const sensorIds = ['sensor_1', 'sensor_2', 'sensor_3', 'sensor_4'];
      
      for (const sensorId of sensorIds) {
        try {
          const response = await fetch(`${API_BASE}/sensors/${sensorId}/anomalies?days=1`);
          if (response.ok) {
            const anomalyData = await response.json();
            data[sensorId] = anomalyData;
          }
        } catch (error) {
          console.error(`Failed to fetch anomalies for ${sensorId}:`, error);
        }
      }
      
      setAnomalies(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sensor-dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Sensor Monitoring</h2>
        <button className="btn btn-refresh" onClick={fetchAnomalies}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="loading">Loading sensor data...</div>}

      <div className="sensor-grid">
        {sensorData.map(sensor => {
          const anomalyInfo = anomalies[sensor.id];
          const hasAnomalies = anomalyInfo && anomalyInfo.total_anomalies > 0;

          return (
            <div key={sensor.id} className={`sensor-card ${hasAnomalies ? 'anomaly' : 'normal'}`}>
              <div className="sensor-header">
                <h3>{sensor.name}</h3>
                {hasAnomalies && <span className="anomaly-badge">⚠ Anomaly Detected</span>}
              </div>

              <div className="sensor-value">
                <span className="value">{sensor.value}</span>
                <span className="unit">{sensor.unit}</span>
              </div>

              {anomalyInfo && (
                <div className="sensor-stats">
                  <div className="stat">
                    <span className="stat-label">Anomalies (24h):</span>
                    <span className="stat-value">{anomalyInfo.total_anomalies}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Rate:</span>
                    <span className="stat-value">
                      {(anomalyInfo.anomaly_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="sensor-status">
                <span className={`status-indicator ${hasAnomalies ? 'warning' : 'normal'}`}>
                  {hasAnomalies ? '⚠ Warning' : '✓ Normal'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sensor-info">
        <p>🤖 AI is continuously monitoring sensor data for anomalies and patterns.</p>
      </div>
    </div>
  );
}

export default SensorDashboard;
