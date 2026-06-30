import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Users, UserPlus, Mail, Lock, ShieldCheck, Trash2, RefreshCw, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const StaffManagement = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'receptionist',
    doctorId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unlinkedDoctors, setUnlinkedDoctors] = useState([]);

  // Staff list state
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchStaffData = useCallback(async () => {
    setStaffLoading(true);
    try {
      const [docsRes, usersRes] = await Promise.all([
        api.get('/auth/doctors'),
        api.get('/auth/users')
      ]);

      const doctors = docsRes.data.doctors || docsRes.data || [];
      const users = usersRes.data.users || usersRes.data || [];

      // Build staff list enriched with doctor name if applicable
      const enriched = users
        .filter(u => u.role !== 'admin')
        .map(u => {
          const linkedDoc = u.doctorId ? doctors.find(d => d._id === (u.doctorId?._id || u.doctorId)?.toString()) : null;
          return { ...u, linkedDoctorName: linkedDoc?.name || null };
        });
      setStaffList(enriched);

      // Unlinked doctors = doctors that have NO user account
      const linkedDoctorIds = users
        .filter(u => u.doctorId)
        .map(u => (u.doctorId?._id || u.doctorId)?.toString());

      setUnlinkedDoctors(doctors.filter(d => !linkedDoctorIds.includes(d._id.toString())));
    } catch (err) {
      console.error('Failed to fetch staff data', err);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Re-fetch unlinked doctors when switching to doctor role
  useEffect(() => {
    if (formData.role === 'doctor') {
      fetchStaffData();
    }
  }, [formData.role, fetchStaffData]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/users', formData);
      setMessage(`Successfully registered new ${formData.role} account: ${formData.email}`);
      setFormData({ ...formData, email: '', password: '', doctorId: '' });
      await fetchStaffData(); // Refresh both list and dropdowns
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register staff account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (!window.confirm(`Revoke access for "${userEmail}"? This cannot be undone.`)) return;
    setDeleteLoadingId(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      setMessage(`Access revoked for ${userEmail}`);
      await fetchStaffData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke access.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'doctor') return { background: 'var(--success-bg)', color: 'var(--success)' };
    return { background: 'var(--accent-subtle)', color: 'var(--accent-primary)' };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Users size={28} style={{ color: 'var(--accent-primary)' }} />
        <h1>Staff Management</h1>
      </div>

      {/* Register Form */}
      <div className="panel">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <UserPlus size={20} style={{ color: 'var(--accent-primary)' }} />
            Register New {formData.role === 'doctor' ? 'Doctor' : 'Receptionist'} Account
          </h2>
          <p className="text-muted">Create certified access accounts for clinical staff.</p>
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
                placeholder={formData.role === 'doctor' ? 'doctor@clinic.com' : 'receptionist@clinic.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Lock size={16} /> Secure Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  minLength="6"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '0.875rem', paddingRight: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ gridColumn: formData.role === 'doctor' ? 'span 1' : 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <ShieldCheck size={16} /> Role
              </label>
              <div style={{ height: '54px' }}>
                <CustomSelect
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val, doctorId: '' })}
                  options={[
                    { value: 'receptionist', label: 'Clinical Receptionist' },
                    { value: 'doctor', label: 'Medical Doctor' }
                  ]}
                  triggerStyle={{ padding: '0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>

            {formData.role === 'doctor' && (
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Users size={16} /> Link Doctor Profile
                </label>
                <div style={{ height: '54px' }}>
                  <CustomSelect
                    value={formData.doctorId}
                    onChange={(val) => setFormData({ ...formData, doctorId: val })}
                    options={unlinkedDoctors.map(doc => ({ value: doc._id, label: doc.name }))}
                    placeholder="Select Doctor Profile"
                    searchable
                    triggerStyle={{ padding: '0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (formData.role === 'doctor' && !formData.doctorId)}
              style={{ padding: '0.875rem 2rem' }}
            >
              {loading ? 'Registering...' : 'Register Access Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Staff Access List */}
      <div className="panel" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <UserCheck size={20} style={{ color: 'var(--accent-primary)' }} />
            Active Access Accounts
          </h2>
          <button
            className="btn"
            onClick={fetchStaffData}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {staffLoading ? (
          <div className="flex-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>Loading staff...</div>
        ) : staffList.length === 0 ? (
          <div className="flex-center" style={{ padding: '3rem', color: 'var(--text-secondary)', flexDirection: 'column', gap: '0.5rem' }}>
            <UserX size={32} style={{ opacity: 0.4 }} />
            <span>No staff accounts found</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Role</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Linked Profile</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Created</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr
                  key={staff._id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'var(--text-on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>
                        {staff.email.charAt(0).toUpperCase()}
                      </div>
                      {staff.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ ...getRoleBadgeStyle(staff.role), padding: '0.2rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {staff.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {staff.role === 'doctor'
                      ? (staff.linkedDoctorName || <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ Not linked</span>)
                      : <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(staff.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      className="btn"
                      onClick={() => handleDelete(staff._id, staff.email)}
                      disabled={deleteLoadingId === staff._id}
                      title="Revoke Access"
                      style={{ padding: '0.4rem 0.75rem', color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', opacity: deleteLoadingId === staff._id ? 0.5 : 1 }}
                    >
                      <Trash2 size={14} />
                      {deleteLoadingId === staff._id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
