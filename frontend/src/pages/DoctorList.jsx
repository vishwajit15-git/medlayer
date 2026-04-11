import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { UserRoundCog, Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', specialiaztion: '', availability: [{ startTime: '09:00', endTime: '12:00' }]
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/doctors');
      setDoctors(res.data.doctors || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.delete(`/auth/doctors/${id}`);
      setDoctors(doctors.filter(d => d._id !== id));
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleAddShift = () => {
    setFormData({
      ...formData,
      availability: [...formData.availability, { startTime: '13:00', endTime: '18:00' }]
    });
  };

  const handleShiftChange = (index, field, value) => {
    const newAvail = [...formData.availability];
    newAvail[index][field] = value;
    setFormData({ ...formData, availability: newAvail });
  };

  const handleRemoveShift = (index) => {
    const newAvail = formData.availability.filter((_, i) => i !== index);
    setFormData({ ...formData, availability: newAvail });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        specialization: formData.specialization, // fixed typo from state
        availability: formData.availability
      };
      await api.post('/auth/doctors', payload);
      setShowModal(false);
      setFormData({ name: '', specialization: '', availability: [{ startTime: '09:00', endTime: '12:00' }] });
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserRoundCog size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Doctor Management</h1>
        </div>
        
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Doctor
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>Loading records...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {doctors.map(doctor => (
            <div key={doctor._id} className="panel" style={{ position: 'relative' }}>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(doctor._id)}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
                    border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem'
                  }}
                  title="Remove Doctor"
                >
                  <Trash2 size={18} className="text-error" />
                </button>
              )}
              
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{doctor.name}</h3>
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <MapPin size={16} /> {doctor.specialization}
              </p>

              <div>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> Shifts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {doctor.availability.map((shift, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shift {i + 1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{shift.startTime} - {shift.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
              No doctors found. Please add one to begin.
            </div>
          )}
        </div>
      )}

      {/* Basic Custom Modal Implementation */}
      {showModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Deploy New Doctor</h2>
            
            {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Dr. Gregory House" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Specialization</label>
                  <input type="text" value={formData.specialization || ''} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required placeholder="Diagnostic Medicine" />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Availability Shifts</label>
                  <button type="button" onClick={handleAddShift} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                    <Plus size={14} /> Add Shift
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.availability.map((shift, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Start Time</label>
                        <input type="time" value={shift.startTime} onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>End Time</label>
                        <input type="time" value={shift.endTime} onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)} required />
                      </div>
                      {formData.availability.length > 1 && (
                        <button type="button" onClick={() => handleRemoveShift(index)} className="btn btn-secondary" style={{ padding: '0.75rem', color: 'var(--error)' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Saving...' : 'Save Doctor'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DoctorList;
