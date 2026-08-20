import React, { useState, useEffect } from 'react';
import './App.css';
import AlarmList from './components/AlarmList';
import CreateAlarm from './components/CreateAlarm';
import AlarmHealth from './components/AlarmHealth';
import SensorDashboard from './components/SensorDashboard';
import Analytics from './components/Analytics';

function App() {
  const [alarms, setAlarms] = useState([]);
  const [activeTab, setActiveTab] = useState('alarms');
  const [systemStatus, setSystemStatus] = useState('loading');
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:8000';

  // Fetch alarms on mount
  useEffect(() => {
    fetchAlarms();
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        setSystemStatus('healthy');
      }
    } catch (error) {
      setSystemStatus('error');
      console.error('Health check failed:', error);
    }
  };

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/alarms`);
      if (response.ok) {
        const data = await response.json();
        setAlarms(data);
      }
    } catch (error) {
      console.error('Failed to fetch alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlarm = async (alarmData) => {
    try {
      const response = await fetch(`${API_BASE}/alarms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alarmData),
      });

      if (response.ok) {
        const newAlarm = await response.json();
        setAlarms([...alarms, newAlarm]);
      }
    } catch (error) {
      console.error('Failed to create alarm:', error);
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    try {
      const response = await fetch(`${API_BASE}/alarms/${alarmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlarms(alarms.filter(alarm => alarm.id !== alarmId));
      }
    } catch (error) {
      console.error('Failed to delete alarm:', error);
    }
  };

  const handleUpdateAlarm = async (alarmId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/alarms/${alarmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updated = await response.json();
        setAlarms(alarms.map(alarm => alarm.id === alarmId ? updated : alarm));
      }
    } catch (error) {
      console.error('Failed to update alarm:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'alarms':
        return (
          <>
            <CreateAlarm onCreateAlarm={handleCreateAlarm} />
            <AlarmList
              alarms={alarms}
              onDeleteAlarm={handleDeleteAlarm}
              onUpdateAlarm={handleUpdateAlarm}
            />
          </>
        );
      case 'health':
        return <AlarmHealth alarms={alarms} />;
      case 'sensors':
        return <SensorDashboard />;
      case 'analytics':
        return <Analytics />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 Cognitive Alarm System</h1>
        <div className="status-indicator">
          <span className={`status-dot ${systemStatus}`}></span>
          <span className="status-text">{systemStatus}</span>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'alarms' ? 'active' : ''}`}
          onClick={() => setActiveTab('alarms')}
        >
          ⏰ Alarms
        </button>
        <button
          className={`nav-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          💪 Alarm Health
        </button>
        <button
          className={`nav-btn ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          📊 Sensors
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      <main className="app-main">
        {loading && activeTab === 'alarms' ? (
          <div className="loading">Loading alarms...</div>
        ) : (
          renderContent()
        )}
      </main>

      <footer className="app-footer">
        <p>Cognitive Alarm System v1.0 | AI-Powered Intelligent Alarms</p>
      </footer>
    </div>
  );
}

export default App;