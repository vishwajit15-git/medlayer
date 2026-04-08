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
    if (!val) return { hours: 9, minutes: 0 };
    const [h, m] = val.split(':').map(Number);
    return { hours: h || 0, minutes: m || 0 };
  };

  const [selected, setSelected] = useState(parseTime(value));
  const containerRef = useRef(null);
  const popupRef = useRef(null);
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
      hours: (prev.hours + dir + 24) % 24
    }));
  };

  const adjustMinute = (dir) => {
    setSelected(prev => {
      let newMin = prev.minutes + (dir * 30);
      let newHour = prev.hours;
      if (newMin >= 60) { newMin = 0; newHour = (newHour + 1) % 24; }
      if (newMin < 0) { newMin = 30; newHour = (newHour - 1 + 24) % 24; }
      return { hours: newHour, minutes: newMin };
    });
  };

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
              <button type="button" onClick={() => adjustHour(1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronUp size={18} />
              </button>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                minWidth: '48px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {pad(selected.hours)}
              </div>
              <button type="button" onClick={() => adjustHour(-1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Colon Separator */}
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9ca3af', paddingBottom: '2px' }}>:</span>

            {/* Minute Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
              <button type="button" onClick={() => adjustMinute(1)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.15rem', display: 'flex' }}>
                <ChevronUp size={18} />
              </button>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                minWidth: '48px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {pad(selected.minutes)}
              </div>
              <button type="button" onClick={() => adjustMinute(-1)}
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
