import React, { useState } from 'react';
import api from '../api/axios';
import { Settings, Clock, CalendarDays } from 'lucide-react';
import CustomTimePicker from '../components/CustomTimePicker';

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const ClinicSettings = () => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [workingDays, setWorkingDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        workingHours: {
          startTime,
          endTime
        },
        settings: {
          workingDays
        }
      };

      await api.patch('/auth/clinic/settings', payload);
      setMessage('Clinic settings have been successfully updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Settings size={28} style={{ color: 'var(--accent-primary)' }} />
        <h1>Clinic Configuration</h1>
      </div>

      <div className="panel">
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Configure global clinic operating parameters affecting all subordinate doctors.</p>

        {message && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Clock size={20} /> Operational Hours
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Opening Time</label>
                <CustomTimePicker
                  value={startTime}
                  onChange={(val) => setStartTime(val)}
                  placeholder="Start"
                />
              </div>
              <div style={{ paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>→</div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Closing Time</label>
                <CustomTimePicker
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                  placeholder="End"
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CalendarDays size={20} /> Working Days
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${workingDays.includes(day) ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: workingDays.includes(day) ? 'var(--accent-primary)' : 'transparent',
                    color: workingDays.includes(day) ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'var(--transition)'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
            {workingDays.length === 0 && (
              <p style={{ color: 'var(--warning)', marginTop: '1rem', fontSize: '0.875rem' }}>Warning: You must select at least one working day.</p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || workingDays.length === 0}>
              {loading ? 'Saving Parameters...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicSettings;
