import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Calendar, Clock, AlertTriangle, Coffee, Palmtree, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomSelect from '../components/CustomSelect';
import CustomTimePicker from '../components/CustomTimePicker';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Break / Holiday Modal States
  const [showOverride, setShowOverride] = useState(false);
  const [overrideType, setOverrideType] = useState('BREAK'); // 'BREAK' or 'HOLIDAY'
  const [overrideData, setOverrideData] = useState({ startTime: '', endTime: '' });
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');

  // Manage Holidays States
  const [holidays, setHolidays] = useState([]);
  const [showManageHolidays, setShowManageHolidays] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, range: null, mode: 'ENTIRE' });
  const [selectedDaysForDelete, setSelectedDaysForDelete] = useState([]);
  useEffect(() => {
    const initDoctors = async () => {
      if (user?.role === 'doctor' && user?.doctorId) {
        setSelectedDoctor(user.doctorId);
        return;
      }
      try {
        const res = await api.get('/auth/doctors');
        const docs = res.data.doctors || res.data || [];
        setDoctors(docs);
        if (docs.length > 0) setSelectedDoctor(docs[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      initDoctors();
    }
  }, [user]);

  const fetchSchedule = useCallback(async () => {
    if (!selectedDoctor || !targetDate) return;
    try {
      setLoading(true);
      const res = await api.get(`/auth/doctors/${selectedDoctor}/schedule?date=${targetDate}`);
      setSchedule(res.data.schedule || []);
    } catch (err) {
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, targetDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const fetchHolidays = useCallback(async () => {
    if (!selectedDoctor) return;
    try {
      const res = await api.get(`/auth/doctor-holidays?doctorId=${selectedDoctor}`);
      const list = res.data.holidays || [];

      const grouped = [];
      let currentGroup = [];

      list.forEach((h) => {
        if (currentGroup.length === 0) {
          currentGroup.push(h);
        } else {
          const prevDate = new Date(currentGroup[currentGroup.length - 1].date);
          const currDate = new Date(h.date);
          const diff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            currentGroup.push(h);
          } else {
            grouped.push(currentGroup);
            currentGroup = [h];
          }
        }
      });
      if (currentGroup.length > 0) grouped.push(currentGroup);
      setHolidays(grouped);
    } catch (err) {
      console.error(err);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleBulkDelete = async () => {
    try {
      let idsToDelete = [];
      if (deleteModal.mode === 'ENTIRE') {
        idsToDelete = deleteModal.range.map(h => h._id);
      } else {
        idsToDelete = selectedDaysForDelete;
      }

      if (idsToDelete.length === 0) return showToast('No days selected', 'warning');

      await api.post('/auth/doctor-holidays/bulk-delete', { ids: idsToDelete });
      setDeleteModal({ show: false, range: null, mode: 'ENTIRE' });
      setSelectedDaysForDelete([]);
      fetchSchedule();
      fetchHolidays();
      showToast('Holidays deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete holidays', 'error');
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    try {
      if (overrideType === 'BREAK') {
        await api.post('/auth/doctor-breaks', {
          doctorId: selectedDoctor,
          date: targetDate,
          startTime: overrideData.startTime,
          endTime: overrideData.endTime
        });
      } else {
        await api.post('/auth/doctor-holidays', {
          doctorId: selectedDoctor,
          date: holidayStart || targetDate,
          ...(holidayEnd && { endDate: holidayEnd })
        });
      }
      setShowOverride(false);
      setOverrideData({ startTime: '', endTime: '' });
      setHolidayStart('');
      setHolidayEnd('');
      fetchSchedule(); // Refresh grid
      fetchHolidays(); // Refresh holidays
      showToast('Override applied successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply override', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'var(--bg-tertiary)', border: 'var(--border-subtle)', color: 'var(--text-primary)' };
      case 'BOOKED': return { bg: 'var(--booked-bg)', border: 'var(--booked-color)', color: 'var(--booked-color)' };
      case 'BREAK': return { bg: 'var(--error-bg)', border: 'var(--error)', color: 'var(--error)' };
      default: return { bg: 'var(--bg-tertiary)', border: 'var(--border-subtle)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Dr. Availability</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '40px' }}>
          {user?.role !== 'doctor' && (
            <div style={{ width: '200px', height: '100%' }}>
              <CustomSelect
                value={selectedDoctor}
                onChange={(val) => setSelectedDoctor(val)}
                placeholder="Select Doctor"
                options={doctors.map(d => ({ value: d._id, label: d.name }))}
                triggerStyle={{ borderRadius: '2rem' }}
              />
            </div>
          )}
          <div style={{ width: '200px', height: '100%' }}>
            <CustomDatePicker
              value={targetDate}
              onChange={(val) => setTargetDate(val)}
              placeholder="Select Date"
            />
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowOverride(true)} style={{ width: '200px', height: '100%', margin: 0, padding: 0, boxSizing: 'border-box', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '2rem', fontSize: '0.9rem' }}>
              <Plus size={18} />Add Holiday / Break
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex-center" style={{ height: '100%' }}>Generating Grid Matrix...</div>
        ) : schedule.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {schedule.map((slot, i) => {
              const style = getStatusStyle(slot.status);
              return (
                <div key={i} style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  transition: 'var(--transition)'
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{slot.time}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: style.color, letterSpacing: '1px' }}>{slot.status}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-secondary)' }}>
            <Calendar size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
            <p>No canonical shifts assigned or Grid overrides (Holidays) detected.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setShowManageHolidays(!showManageHolidays)}
          style={{ width: '100%', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, transition: 'var(--transition)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palmtree size={20} color="var(--accent-primary)" />
            {user?.role === 'admin' ? 'Manage Holidays' : 'Upcoming Holidays'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{holidays.length} Range(s)</span>
            {showManageHolidays ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {showManageHolidays && (
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', maxHeight: '300px', overflowY: 'auto' }}>
            {holidays.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '1rem 0' }}>No holidays found for this doctor.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {holidays.map((range, idx) => {
                  const start = new Date(range[0].date).toLocaleDateString();
                  const end = new Date(range[range.length - 1].date).toLocaleDateString();
                  return (
                    <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{start} {range.length > 1 ? `- ${end}` : ''}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{range.length} day(s)</div>
                      </div>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => setDeleteModal({ show: true, range, mode: 'ENTIRE' })}
                          style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {deleteModal.show && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '400px', maxWidth: '90vw', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Delete Holiday</h2>
              <button
                onClick={() => setDeleteModal({ show: false, range: null, mode: 'ENTIRE' })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              ><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setDeleteModal(prev => ({ ...prev, mode: 'ENTIRE' })); setSelectedDaysForDelete([]); }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: deleteModal.mode === 'ENTIRE' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: deleteModal.mode === 'ENTIRE' ? 'var(--text-on-accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--transition)' }}
              >Entire Range</button>
              <button
                onClick={() => setDeleteModal(prev => ({ ...prev, mode: 'PARTIAL' }))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: deleteModal.mode === 'PARTIAL' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: deleteModal.mode === 'PARTIAL' ? 'var(--text-on-accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--transition)' }}
              >Select Days</button>
            </div>

            {deleteModal.mode === 'PARTIAL' && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                {deleteModal.range.map(h => (
                  <label key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={selectedDaysForDelete.includes(h._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDaysForDelete(prev => [...prev, h._id]);
                        else setSelectedDaysForDelete(prev => prev.filter(id => id !== h._id));
                      }}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    {new Date(h.date).toLocaleDateString()}
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteModal({ show: false, range: null, mode: 'ENTIRE' })} className="btn" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
              <button
                onClick={handleBulkDelete}
                disabled={deleteModal.mode === 'PARTIAL' && selectedDaysForDelete.length === 0}
                className="btn"
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'var(--danger-button-bg)', color: 'var(--text-on-accent)', border: 'none', opacity: (deleteModal.mode === 'PARTIAL' && selectedDaysForDelete.length === 0) ? 0.5 : 1, cursor: (deleteModal.mode === 'PARTIAL' && selectedDaysForDelete.length === 0) ? 'not-allowed' : 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showOverride && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowOverride(false); }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowOverride(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="panel animate-fade-in"
            style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
          >

            {/* Modal Header */}
            <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--booked-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Manage Availability</h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '2.6rem' }}>
                {overrideType === 'BREAK' ? 'Block a time range for a doctor break' : 'Mark this day as a holiday for the doctor'}
              </p>
            </div>

            <form onSubmit={handleOverrideSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Type Toggle Card */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</div>
                <div style={{ display: 'flex', borderRadius: '8px', background: 'var(--bg-secondary)', padding: '3px' }}>
                  <button
                    type="button" onClick={() => setOverrideType('BREAK')}
                    style={{
                      flex: 1, padding: '0.6rem 0.5rem', border: 'none',
                      background: overrideType === 'BREAK' ? 'var(--accent-primary)' : 'transparent',
                      color: overrideType === 'BREAK' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                      borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.4rem', transition: 'all 0.2s', fontSize: '0.8rem'
                    }}
                  >
                    <Coffee size={14} /> Break
                  </button>
                  <button
                    type="button" onClick={() => setOverrideType('HOLIDAY')}
                    style={{
                      flex: 1, padding: '0.6rem 0.5rem', border: 'none',
                      background: overrideType === 'HOLIDAY' ? 'var(--accent-primary)' : 'transparent',
                      color: overrideType === 'HOLIDAY' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                      borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.4rem', transition: 'all 0.2s', fontSize: '0.8rem'
                    }}
                  >
                    <Palmtree size={14} /> Holiday
                  </button>
                </div>
              </div>

              {/* Time Range Card (Break Only) */}
              {overrideType === 'BREAK' && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Range</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From</label>
                      <CustomTimePicker
                        value={overrideData.startTime}
                        onChange={(val) => setOverrideData({ ...overrideData, startTime: val })}
                        placeholder="Start"
                      />
                    </div>
                    <div style={{ paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>→</div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>To</label>
                      <CustomTimePicker
                        value={overrideData.endTime}
                        onChange={(val) => setOverrideData({ ...overrideData, endTime: val })}
                        placeholder="End"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Holiday Date Range */}
              {overrideType === 'HOLIDAY' && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Range</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From</label>
                      <CustomDatePicker
                        value={holidayStart}
                        onChange={(val) => setHolidayStart(val)}
                        placeholder="Start"
                        placement="left"
                      />
                    </div>
                    <div style={{ paddingBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>→</div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>To</label>
                      <CustomDatePicker
                        value={holidayEnd}
                        onChange={(val) => setHolidayEnd(val)}
                        placeholder="End"
                        placement="right"
                      />
                    </div>
                  </div>
                  {holidayStart && holidayEnd && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Palmtree size={14} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {(() => {
                          const days = Math.round((new Date(holidayEnd) - new Date(holidayStart)) / (1000 * 60 * 60 * 24)) + 1;
                          return days > 0 ? `${days} day${days > 1 ? 's' : ''} will be blocked` : 'Invalid range';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowOverride(false)} className="btn" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem' }}>Apply Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DoctorSchedule;
