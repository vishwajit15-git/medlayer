import React, { useState } from 'react';
import api from '../api/axios';
import { Users, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const StaffManagement = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'receptionist'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/users', formData);
      setMessage(`Successfully registered new ${formData.role} account: ${formData.email}`);
      setFormData({ ...formData, email: '', password: '' }); // keep role
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register staff account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Users size={28} style={{ color: 'var(--accent-primary)' }} />
        <h1>Staff Management</h1>
      </div>

      <div className="panel">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <UserPlus size={20} style={{ color: 'var(--accent-primary)' }} /> Register New {formData.role === 'doctor' ? 'Doctor' : 'Receptionist'}
          </h2>
          <p className="text-muted">Create certified access accounts for front-desk clinical operators.</p>
        </div>

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

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Mail size={16} /> Official Email
              </label>
              <input 
                type="email" 
                required 
                placeholder={formData.role === 'doctor' ? "doctor@clinic.com" : "receptionist@clinic.com"}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Lock size={16} /> Secure Password
              </label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                minLength="6"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <ShieldCheck size={16} /> Assigned Protocol Role
              </label>
              <div style={{ height: '54px' }}>
                <CustomSelect 
                  value={formData.role}
                  onChange={(val) => setFormData({...formData, role: val})}
                  options={[
                    { value: 'receptionist', label: 'Clinical Receptionist' },
                    { value: 'doctor', label: 'Medical Doctor' }
                  ]}
                  triggerStyle={{ padding: '0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.875rem 2rem' }}>
              {loading ? 'Generating Encrypted Account...' : 'Register Access Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;
