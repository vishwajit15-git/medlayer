import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { Calendar, Plus, Clock, FileText, CheckCircle2, XCircle, LogIn, CalendarClock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomSelect from '../components/CustomSelect';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [markedDates, setMarkedDates] = useState([]);
  const [calendarView, setCalendarView] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

  // Booking Modal State
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({ doctorId: '', patientId: '', date: '', time: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Notes Modal State
  const [showNotes, setShowNotes] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notesText, setNotesText] = useState('');

  // Reschedule Modal State
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchMarkedDates = useCallback(async (year, month) => {
    setCalendarView({ year, month });
    try {
      const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // If logged in as a doctor, strictly filter to display only their own calendar dots
      let queryStr = `?startDate=${startStr}&endDate=${endStr}`;
      if (user?.role === 'doctor' && user?.doctorId) {
        queryStr += `&doctorId=${user.doctorId}`;
      }

      const res = await api.get(`/auth/appointments/bulk${queryStr}`);
      const apps = res.data.appointments || res.data || [];
      const activeApps = apps.filter(a => ['BOOKED', 'CHECKED_IN'].includes(a.status));

      const uniqueDates = [...new Set(activeApps.map(a => {
        const d = new Date(a.appointmentDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }))];

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Only hide dots for past dates; correctly show dots for all future months
      const futureDates = uniqueDates.filter(d => d >= todayStr);
      setMarkedDates(futureDates);
    } catch (err) {
      console.error("Failed to fetch marked dates", err);
    }
  }, [user]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      let query = `?date=${filterDate}`;
      if (filterStatus) query += `&status=${filterStatus}`;
      if (user?.role === 'doctor' && user?.doctorId) {
        query += `&doctorId=${user.doctorId}`;
      }
      let res = await api.get(`/auth/appointments${query}`);

      let fetched = res.data.appointments || res.data;
      // Sort chronologically by time
      if (Array.isArray(fetched)) {
        fetched.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
      }
      setAppointments(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStatus, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Initial fetch for marked dates
  useEffect(() => {
    fetchMarkedDates(new Date(filterDate).getFullYear(), new Date(filterDate).getMonth() + 1);
  }, []);

  // Load prerequisites for booking
  const loadPrerequisites = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        api.get('/auth/doctors'),
        api.get('/auth/patients?limit=1000')
      ]);
      setDoctors(docRes.data.doctors || docRes.data || []);
      setPatients(patRes.data.patients || patRes.data || []);
    } catch (err) {
      console.error("Failed loading requirements", err);
    }
  };

  useEffect(() => {
    if (showBooking) {
      loadPrerequisites();
    }
  }, [showBooking]);

  const handleDateOrDoctorChange = async (doctorId, date) => {
    setBookingData({ ...bookingData, doctorId, date, time: '' });
    if (doctorId && date) {
      try {
        const res = await api.get(`/auth/doctors/${doctorId}/available-slots?date=${date}`);
        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);
    try {
      await api.post('/auth/appointments', {
        doctorId: bookingData.doctorId,
        patientId: bookingData.patientId,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time
      });
      setShowBooking(false);
      setBookingData({ doctorId: '', patientId: '', date: '', time: '' });
      fetchAppointments();

      // Always refresh the currently viewed calendar month
      fetchMarkedDates(calendarView.year, calendarView.month);

      // Also refresh the booked appointment's month if it's different
      // (handles booking 2-3 months ahead while viewing a different month)
      if (bookingData.date) {
        const [bYear, bMonth] = bookingData.date.split('-').map(Number);
        if (bYear !== calendarView.year || bMonth !== calendarView.month) {
          fetchMarkedDates(bYear, bMonth);
        }
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment. Please check availability.');
    } finally {
      setBookingLoading(false);
    }
  };

  const openRescheduleModal = async (apt) => {
    setRescheduleAppt(apt);
    const initialDate = filterDate || new Date().toISOString().split('T')[0];
    setRescheduleData({ date: initialDate, time: '' });
    setShowReschedule(true);
    setRescheduleError('');

    // Auto fetch slots
    try {
      const res = await api.get(`/auth/doctors/${apt.doctorId._id || apt.doctorId}/available-slots?date=${initialDate}`);
      setRescheduleSlots(res.data.availableSlots || []);
    } catch (err) {
      setRescheduleSlots([]);
    }
  };

  const handleRescheduleDateChange = async (date) => {
    setRescheduleData({ ...rescheduleData, date, time: '' });
    if (date && rescheduleAppt) {
      try {
        const res = await api.get(`/auth/doctors/${rescheduleAppt.doctorId._id || rescheduleAppt.doctorId}/available-slots?date=${date}`);
        setRescheduleSlots(res.data.availableSlots || []);
      } catch (err) {
        setRescheduleSlots([]);
      }
    } else {
      setRescheduleSlots([]);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    setRescheduleLoading(true);
    try {
      await api.patch(`/auth/appointments/${rescheduleAppt._id}/reschedule`, {
        appointmentDate: rescheduleData.date,
        appointmentTime: rescheduleData.time
      });
      setShowReschedule(false);
      setRescheduleAppt(null);
      fetchAppointments();
      fetchMarkedDates(calendarView.year, calendarView.month);
    } catch (err) {
      setRescheduleError(err.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Lifecycle Actions
  const handleAction = async (id, actionStr) => {
    try {
      await api.patch(`/auth/appointments/${id}/${actionStr}`);
      fetchAppointments();
      fetchMarkedDates(calendarView.year, calendarView.month);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionStr}`);
    }
  };

  const submitNotes = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/auth/appointments/${selectedAppt._id}/notes`, { notes: notesText });
      setShowNotes(false);
      setSelectedAppt(null);
      setNotesText('');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit notes');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED': return { bg: 'var(--booked-bg)', color: 'var(--booked-color)' };
      case 'CHECKED_IN': return { bg: 'var(--checkin-bg)', color: 'var(--checkin-color)' };
      case 'COMPLETED': return { bg: 'var(--completed-bg)', color: 'var(--completed-color)' };
      case 'CANCELLED': case 'NO_SHOW': return { bg: 'var(--cancelled-bg)', color: 'var(--cancelled-color)' };
      default: return { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Appointments</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', height: '40px' }}>
          <div style={{ width: '200px', height: '100%' }}>
            <CustomDatePicker
              value={filterDate}
              onChange={(val) => setFilterDate(val)}
              onMonthChange={fetchMarkedDates}
              markedDates={markedDates}
              placeholder="Filter Date"
            />
          </div>
          <div style={{ width: '200px', height: '100%' }}>
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              placeholder="All Statuses"
              options={[
                { value: 'BOOKED', label: 'Booked' },
                { value: 'CHECKED_IN', label: 'Checked In' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
              triggerStyle={{ borderRadius: '2rem', textAlign: 'center' }}
            />
          </div>

          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <button className="btn btn-primary" onClick={() => setShowBooking(true)} style={{ width: '200px', height: '100%', margin: 0, padding: 0, boxSizing: 'border-box', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '2rem', fontSize: '0.9rem' }}>
              <Plus size={18} /> Book Slot
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        {loading ? (
          <div className="flex-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>Loading schedule...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Time</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Patient</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Doctor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => {
                const sColor = getStatusColor(apt.status);
                // Ensure correct population objects
                const patientName = apt.patientId?.name || 'Unknown';
                const doctorName = apt.doctorId?.name || 'Unknown';

                return (
                  <tr key={apt._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{apt.appointmentTime}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'var(--text-on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                        {patientName.charAt(0).toUpperCase()}
                      </div>
                      {patientName}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{doctorName}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: sColor.bg, color: sColor.color, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>

                      {apt.status === 'BOOKED' && user?.role !== 'doctor' && (
                        <>
                          <button className="btn" style={{ padding: '0.5rem', color: 'var(--checkin-color)' }} onClick={() => handleAction(apt._id, 'check-in')} title="Check In">
                            <LogIn size={18} />
                          </button>
                          <button className="btn" style={{ padding: '0.5rem', color: 'var(--reschedule-color)' }} onClick={() => openRescheduleModal(apt)} title="Reschedule">
                            <CalendarClock size={18} />
                          </button>
                          <button className="btn" style={{ padding: '0.5rem', color: 'var(--error)' }} onClick={() => handleAction(apt._id, 'cancel')} title="Cancel Appt">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}

                      {apt.status === 'BOOKED' && user?.role === 'doctor' && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                          <Clock size={14} /> Awaiting Arrival
                        </div>
                      )}

                      {apt.status === 'CHECKED_IN' && (
                        <button className="btn" style={{ padding: '0.5rem', color: 'var(--success)' }} onClick={() => handleAction(apt._id, 'complete')} title="Mark Completed">
                          <CheckCircle2 size={18} />
                        </button>
                      )}

                      {apt.status === 'COMPLETED' && (
                        <button className="btn" style={{ padding: '0.5rem', color: 'var(--accent-primary)' }} onClick={() => { setSelectedAppt(apt); setNotesText(apt.notes || ''); setShowNotes(true); }} title="Consultation Notes">
                          <FileText size={18} />
                        </button>
                      )}

                      {(apt.status === 'CANCELLED' || (apt.status === 'NO_SHOW')) && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                          {apt.status === 'CANCELLED' ? 'Cancelled' : 'No Show'}
                        </div>
                      )}

                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!loading && appointments.length === 0 && (
          <div className="flex-center" style={{ padding: '4rem', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
            <Calendar size={48} opacity={0.3} />
            <p>No appointments found for this date.</p>
          </div>
        )}
      </div>

      {/* Booking Constraints Modal */}
      {showBooking && createPortal(
        <div onClick={() => setShowBooking(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} className="panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={24} style={{ color: 'var(--accent-primary)' }} /> Book New Appointment
            </h2>

            {bookingError && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{bookingError}</div>}

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Patient</label>
                <CustomSelect
                  value={bookingData.patientId}
                  onChange={(val) => setBookingData({ ...bookingData, patientId: val })}
                  placeholder="Select Patient"
                  options={patients.map(p => ({ value: p._id, label: p.name }))}
                  triggerStyle={{ borderRadius: 'var(--radius-md)' }}
                  searchable
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Doctor</label>
                <CustomSelect
                  value={bookingData.doctorId}
                  onChange={(val) => handleDateOrDoctorChange(val, bookingData.date)}
                  placeholder="Select Doctor"
                  options={doctors.map(d => ({ value: d._id, label: `${d.name} (${d.specialization})` }))}
                  triggerStyle={{ borderRadius: 'var(--radius-md)' }}
                  searchable
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Date</label>
                <CustomDatePicker
                  value={bookingData.date}
                  onChange={(val) => handleDateOrDoctorChange(bookingData.doctorId, val)}
                  placeholder="Select Appointment Date"
                  placement="right"
                />
              </div>

              {bookingData.doctorId && bookingData.date && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Available Times</label>
                  {availableSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {availableSlots.map(slot => (
                        <div
                          key={slot}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                          style={{
                            padding: '0.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'var(--transition)',
                            background: bookingData.time === slot ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: bookingData.time === slot ? 'var(--text-on-accent)' : 'var(--text-primary)',
                            border: `1px solid ${bookingData.time === slot ? 'var(--accent-primary)' : 'var(--border-subtle)'}`
                          }}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>No available slots on this date.</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowBooking(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookingLoading || !bookingData.time}>
                  {bookingLoading ? 'Reserving...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Notes Modal */}
      {showNotes && createPortal(
        <div onClick={() => setShowNotes(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} className="panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: 'var(--accent-primary)' }} /> Clinical Notes
            </h2>
            <form onSubmit={submitNotes} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                rows="5"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Diagnostic observations and prescription directives..."
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowNotes(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Notes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Reschedule Modal */}
      {showReschedule && createPortal(
        <div onClick={() => setShowReschedule(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} className="panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={24} style={{ color: 'var(--accent-primary)' }} /> Reschedule
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              Rescheduling appointment for <strong>{rescheduleAppt?.patientId?.name || 'Unknown Patient'}</strong> with <strong>Dr. {rescheduleAppt?.doctorId?.name || 'Unknown Doctor'}</strong>.
            </p>

            {rescheduleError && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{rescheduleError}</div>}

            <form onSubmit={handleReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Date</label>
                <CustomDatePicker
                  value={rescheduleData.date}
                  onChange={(val) => handleRescheduleDateChange(val)}
                  placeholder="Select New Date"
                  placement="right"
                />
              </div>

              {rescheduleData.date && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Available Times</label>
                  {rescheduleSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {rescheduleSlots.map(slot => (
                        <div
                          key={slot}
                          onClick={() => setRescheduleData({ ...rescheduleData, time: slot })}
                          style={{
                            padding: '0.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'var(--transition)',
                            background: rescheduleData.time === slot ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: rescheduleData.time === slot ? 'var(--text-on-accent)' : 'var(--text-primary)',
                            border: `1px solid ${rescheduleData.time === slot ? 'var(--accent-primary)' : 'var(--border-subtle)'}`
                          }}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>No slots available on this date.</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowReschedule(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={rescheduleLoading || !rescheduleData.time}>
                  {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Appointments;
