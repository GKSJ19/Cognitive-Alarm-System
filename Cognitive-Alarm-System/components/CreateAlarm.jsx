import React, { useState } from 'react';
import '../styles/CreateAlarm.css';

function CreateAlarm({ onCreateAlarm }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '09:00',
    frequency: 'daily',
    enabled: true,
    intensity: 5,
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an alarm title');
      return;
    }

    onCreateAlarm(formData);
    
    setFormData({
      title: '',
      description: '',
      time: '09:00',
      frequency: 'daily',
      enabled: true,
      intensity: 5,
    });
    
    setIsOpen(false);
  };

  return (
    <div className="create-alarm-container">
      <button
        className="btn btn-primary btn-create"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕ Close' : '+ Create New Alarm'}
      </button>

      {isOpen && (
        <form className="create-alarm-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Alarm Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Morning Workout"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Add notes about this alarm..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="intensity">
              Alarm Intensity: <span className="intensity-value">{formData.intensity}/10</span>
            </label>
            <input
              type="range"
              id="intensity"
              name="intensity"
              min="1"
              max="10"
              value={formData.intensity}
              onChange={handleChange}
              className="intensity-slider"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
            />
            <label htmlFor="enabled">Enable alarm immediately</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Alarm
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateAlarm;
