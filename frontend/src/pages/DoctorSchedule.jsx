import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Calendar, Clock, AlertTriangle, Coffee, Palmtree, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomSelect from '../components/CustomSelect';
import CustomTimePicker from '../components/CustomTimePicker';

const DoctorSchedule = () => {
  const { user } = useAuth();
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

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/auth/doctors');
      const docs = res.data.doctors || res.data || [];
      setDoctors(docs);
      if (docs.length > 0) setSelectedDoctor(docs[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply override');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'var(--bg-tertiary)', border: 'var(--border-subtle)', color: 'var(--text-primary)' };
      case 'BOOKED': return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', color: '#3b82f6' };
      case 'BREAK': return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', color: '#ef4444' };
      default: return { bg: 'var(--bg-tertiary)', border: 'var(--border-subtle)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Diagnostic Grid</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '40px' }}>
          <div style={{ width: '180px', height: '100%' }}>
            <CustomSelect
              value={selectedDoctor}
              onChange={(val) => setSelectedDoctor(val)}
              placeholder="Select Doctor"
              options={doctors.map(d => ({ value: d._id, label: d.name }))}
              triggerStyle={{ borderRadius: '2rem' }}
            />
          </div>
          <div style={{ width: '180px', height: '100%' }}>
            <CustomDatePicker
              value={targetDate}
              onChange={(val) => setTargetDate(val)}
              placeholder="Select Date"
            />
          </div>
          {(user?.role === 'admin' || user?.role === 'doctor') && (
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

      {showOverride && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowOverride(false); }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowOverride(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      color: overrideType === 'BREAK' ? '#fff' : 'var(--text-secondary)',
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
                      color: overrideType === 'HOLIDAY' ? '#fff' : 'var(--text-secondary)',
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
