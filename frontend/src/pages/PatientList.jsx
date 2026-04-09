import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Users, Plus, Trash2, Search, ActivitySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Simple debounce utility hook could be placed here
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PatientList = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchPatients = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const endpoint = query ? `/auth/patients/search?query=${encodeURIComponent(query)}` : '/auth/patients';
      const res = await api.get(endpoint);
      setPatients(res.data.patients || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(debouncedSearch);
  }, [debouncedSearch, fetchPatients]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient?')) return;
    try {
      await api.delete(`/auth/patients/${id}`);
      setPatients(patients.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete patient');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/auth/patients', { name: formData.name, age: Number(formData.age) });
      setShowModal(false);
      setFormData({ name: '', age: '' });
      fetchPatients(debouncedSearch);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Patient Registry</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '300px' }}
            />
          </div>
          
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} /> Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {loading && patients.length === 0 ? (
          <div className="flex-center" style={{ flex: 1 }}>Loading database...</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Global ID</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Age</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>...{patient._id.substring(18)}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      {patient.name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{patient.age}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      {(user?.role === 'admin' || user?.role === 'receptionist') && (
                        <button 
                          onClick={() => handleDelete(patient._id)}
                          className="btn"
                          style={{ padding: '0.5rem', color: 'var(--error)' }}
                          title="Remove Patient"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {patients.length === 0 && (
              <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-secondary)', gap: '1rem' }}>
                <ActivitySquare size={40} opacity={0.5} />
                <p>No query results dynamically matched.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Register Patient</h2>
            
            {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Patient Canonical Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Jane Doe" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Biological Age</label>
                <input type="number" min="0" max="150" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required placeholder="34" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Committing...' : 'Commit Protocol'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PatientList;
