import React from 'react';
import '../styles/AlarmList.css';

function AlarmList({ alarms, onDeleteAlarm, onUpdateAlarm }) {
  const handleToggle = (alarm) => {
    onUpdateAlarm(alarm.id, { ...alarm, enabled: !alarm.enabled });
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  return (
    <div className="alarm-list-container">
      <h2>Your Alarms</h2>
      
      {alarms.length === 0 ? (
        <div className="empty-state">
          <p>No alarms yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="alarm-grid">
          {alarms.map(alarm => (
            <div key={alarm.id} className={`alarm-card ${alarm.enabled ? 'active' : 'inactive'}`}>
              <div className="alarm-header">
                <h3>{alarm.title}</h3>
                <div className="alarm-status">
                  <span className={`status-badge ${alarm.enabled ? 'enabled' : 'disabled'}`}>
                    {alarm.enabled ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>

              {alarm.description && (
                <p className="alarm-description">{alarm.description}</p>
              )}

              <div className="alarm-details">
                <div className="detail">
                  <span className="label">Time:</span>
                  <span className="value">{formatTime(alarm.time)}</span>
                </div>
                <div className="detail">
                  <span className="label">Frequency:</span>
                  <span className="value">{alarm.frequency.toUpperCase()}</span>
                </div>
                <div className="detail">
                  <span className="label">Intensity:</span>
                  <div className="intensity-bar">
                    <div className="intensity-fill" style={{ width: `${(alarm.intensity / 10) * 100}%` }}></div>
                  </div>
                  <span className="value">{alarm.intensity}/10</span>
                </div>
              </div>

              <div className="alarm-actions">
                <button
                  className="btn btn-toggle"
                  onClick={() => handleToggle(alarm)}
                  title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                >
                  {alarm.enabled ? '⏸ Disable' : '▶ Enable'}
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => onDeleteAlarm(alarm.id)}
                  title="Delete alarm"
                >
                  🗑 Delete
                </button>
              </div>

              <div className="alarm-meta">
                <small>Created: {new Date(alarm.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlarmList;
