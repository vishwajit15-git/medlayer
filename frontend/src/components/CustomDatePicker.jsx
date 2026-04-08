import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, placeholder = "YYYY/MM/DD", placement = "bottom" }) => {
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
  // Parse incoming value or default to current date
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  // Update Coords when opening (useLayoutEffect prevents flicker)
  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (placement === 'left') {
        setCoords({
          top: rect.top + rect.height / 2 - 150,
          left: rect.left - 296 // calendar width (~280) + gap (16)
        });
      } else if (placement === 'right') {
        setCoords({
          top: rect.top + rect.height / 2 - 150,
          left: rect.right + 16
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left
        });
      }
    }
  }, [isOpen, placement]);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both button container AND the portal popup
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

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format YYYY-MM-DD
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const currentYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const totalDays = daysInMonth(currentYear, monthIndex);
  const startingDay = startDayOfMonth(currentYear, monthIndex);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Grid Generation
  const blanks = Array(startingDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const grid = [...blanks, ...days];

  // Helper to format display value
  const displayValue = value ? value.replace(/-/g, '/') : '';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Input Field (Matching app buttons) */}
      <div 
        onClick={openPicker}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          padding: '0.65rem 1rem',
          borderRadius: '2rem', /* matches select filter */
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span>{displayValue || placeholder}</span>
        <CalendarIcon size={20} color="var(--text-secondary)" />
      </div>

      {/* Popup Calendar rendered via Portal to escape modal overflow constraints */}
      {isOpen && createPortal(
        <div ref={popupRef} style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          minWidth: '280px',
          width: 'max-content',
          background: '#343438', /* Dark gray from image */
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          color: '#ffffff'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button 
              type="button"
              onClick={handlePrevMonth} 
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>
              {monthNames[monthIndex]} {currentYear}
            </span>
            <button 
              type="button"
              onClick={handleNextMonth} 
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of week */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.75rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>
            {dayNames.map(d => <div key={d}>{d}</div>)}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
            {grid.map((d, index) => {
              if (!d) return <div key={`blank-${index}`} style={{ padding: '0.5rem' }}></div>;
              
              // Check if selected
              const isSelected = value && new Date(value).getDate() === d && new Date(value).getMonth() === monthIndex && new Date(value).getFullYear() === currentYear;

              return (
                <div 
                  key={d} 
                  onClick={() => handleDateSelect(d)}
                  style={{
                    padding: '0.45rem',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#000000' : '#ffffff',
                    fontWeight: isSelected ? 600 : 400,
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    margin: 'auto',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDatePicker;
