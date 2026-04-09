import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

const CustomTimePicker = ({ value, onChange, placeholder = "HH:MM", placement = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerId = useRef(Math.random().toString(36).slice(2));

  // Close when another picker opens
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.id !== pickerId.current) setIsOpen(false);
    };
    window.addEventListener('picker-open', handler);
    return () => window.removeEventListener('picker-open', handler);
  }, []);

  const openPicker = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      window.dispatchEvent(new CustomEvent('picker-open', { detail: { id: pickerId.current } }));
    }
  };

  // Parse value into hours/minutes
  const parseTime = (val) => {
    const dH = 9, dM = 0;
    if (!val) return { hours: dH, minutes: dM, hourOffset: 240 + dH, minOffset: 200 };
    const [h, m] = val.split(':').map(Number);
    const hrs = h || 0, mins = m || 0;
    return { hours: hrs, minutes: mins, hourOffset: 240 + hrs, minOffset: 200 + (mins === 30 ? 1 : 0) };
  };

  const [selected, setSelected] = useState(parseTime(value));
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const hourColRef = useRef(null);
  const minColRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  // Sync external value changes
  useEffect(() => {
    setSelected(parseTime(value));
  }, [value]);

  // Position popup
  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8, // Position above the trigger
        left: rect.left
      });
    }
  }, [isOpen, placement]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        (!popupRef.current || !popupRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  const adjustHour = (dir) => {
    setSelected(prev => ({
      ...prev,
      hours: (prev.hours + dir + 24) % 24,
      hourOffset: (prev.hourOffset || 240 + prev.hours) + dir
    }));
  };

  const adjustMinute = (dir) => {
    setSelected(prev => {
      let newMin = prev.minutes + (dir * 30);
      if (newMin >= 60) newMin = 0;
      if (newMin < 0) newMin = 30;
      return { ...prev, minutes: newMin, minOffset: (prev.minOffset || 200 + (prev.minutes === 30 ? 1 : 0)) + dir };
    });
  };

  const wheelHourAcc = useRef(0);
  const wheelMinAcc = useRef(0);
  const WHEEL_THRESHOLD = 80;

  // Store latest adjust functions in refs so native listeners always use current state
  const adjustHourRef = useRef(adjustHour);
  const adjustMinuteRef = useRef(adjustMinute);
  useEffect(() => { adjustHourRef.current = adjustHour; }, [selected]);
  useEffect(() => { adjustMinuteRef.current = adjustMinute; }, [selected]);

  // Attach non-passive native wheel listeners to prevent page scroll
  useEffect(() => {
    const hourEl = hourColRef.current;
    const minEl = minColRef.current;
    if (!hourEl || !minEl) return;

    const onHourWheel = (e) => {
      e.preventDefault();
      wheelHourAcc.current += e.deltaY;
      if (wheelHourAcc.current > WHEEL_THRESHOLD) {
        adjustHourRef.current(1);
        wheelHourAcc.current = 0;
      } else if (wheelHourAcc.current < -WHEEL_THRESHOLD) {
        adjustHourRef.current(-1);
        wheelHourAcc.current = 0;
      }
    };

    const onMinWheel = (e) => {
      e.preventDefault();
      wheelMinAcc.current += e.deltaY;
      if (wheelMinAcc.current > WHEEL_THRESHOLD) {
        adjustMinuteRef.current(1);
        wheelMinAcc.current = 0;
      } else if (wheelMinAcc.current < -WHEEL_THRESHOLD) {
        adjustMinuteRef.current(-1);
        wheelMinAcc.current = 0;
      }
    };

    hourEl.addEventListener('wheel', onHourWheel, { passive: false });
    minEl.addEventListener('wheel', onMinWheel, { passive: false });
    return () => {
      hourEl.removeEventListener('wheel', onHourWheel);
      minEl.removeEventListener('wheel', onMinWheel);
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onChange(`${pad(selected.hours)}:${pad(selected.minutes)}`);
    setIsOpen(false);
  };

  const displayValue = value || '';

  // Generate quick-pick time slots (every 30 min from 08:00 to 20:00)
  const quickSlots = [];
  for (let h = 8; h <= 20; h++) {
    quickSlots.push(`${pad(h)}:00`);
    if (h < 20) quickSlots.push(`${pad(h)}:30`);
  }

  // Lists for slider animation (long arrays to simulate infinite scroll)
  const hoursList = React.useMemo(() => Array.from({ length: 480 }, (_, i) => pad(i % 24)), []);
  const minutesList = React.useMemo(() => Array.from({ length: 400 }, (_, i) => (i % 2 === 0 ? '00' : '30')), []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Trigger — mirrors CustomDatePicker trigger exactly */}
      <div
        onClick={openPicker}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span>{displayValue || placeholder}</span>
        <Clock size={18} color="var(--text-secondary)" />
      </div>

      {/* Popup — same portal pattern & visual language as CustomDatePicker */}
      {isOpen && createPortal(
        <div ref={popupRef} style={{
          position: 'fixed',
          bottom: `${window.innerHeight - coords.top}px`,
          left: `${coords.left}px`,
          minWidth: '200px',
          width: 'max-content',
          background: '#343438',
          borderRadius: '14px',
          padding: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          color: '#ffffff'
        }}>
          {/* Spinner Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Clock size={14} style={{ opacity: 0.6 }} />
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Select Time</span>
          </div>

          {/* Hour : Minute Spinners */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {/* Hour Column */}
            <div 
              ref={hourColRef}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}
            >
              <button type="button" onClick={() => adjustHour(-1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronUp size={18} />
              </button>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                height: '44px',
                width: '60px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  transform: `translateY(-${(selected.hourOffset !== undefined ? selected.hourOffset : 240 + selected.hours) * 44}px)`,
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}>
                  {hoursList.map((h, i) => (
                    <div key={i} style={{
                      height: '44px', minHeight: '44px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums'
                    }}>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => adjustHour(1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Colon Separator */}
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9ca3af', paddingBottom: '2px' }}>:</span>

            {/* Minute Column */}
            <div 
              ref={minColRef}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}
            >
              <button type="button" onClick={() => adjustMinute(-1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronUp size={18} />
              </button>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                height: '44px',
                width: '60px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  transform: `translateY(-${(selected.minOffset !== undefined ? selected.minOffset : 200 + (selected.minutes === 30 ? 1 : 0)) * 44}px)`,
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}>
                  {minutesList.map((m, i) => (
                    <div key={i} style={{
                      height: '44px', minHeight: '44px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums'
                    }}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => adjustMinute(1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <button type="button" onClick={handleConfirm}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Confirm {pad(selected.hours)}:{pad(selected.minutes)}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomTimePicker;
