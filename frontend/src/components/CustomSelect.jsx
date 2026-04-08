import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = "Select an option", triggerStyle = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999, width: 0 });

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          padding: '0.65rem 1rem',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.2s',
          height: '100%',
          boxSizing: 'border-box',
          ...triggerStyle
        }}
        onMouseOver={(e) => e.currentTarget.style.border = '1px solid var(--accent-primary)'}
        onMouseOut={(e) => e.currentTarget.style.border = triggerStyle.border || '1px solid var(--border-subtle)'}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>}
        </span>
        <ChevronDown size={18} color="var(--text-secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && createPortal(
        <>
          <style>
            {`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <div 
            ref={dropdownRef}
            className="animate-fade-in no-scrollbar"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              background: '#202022', // Darker background for depth
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 9999,
              maxHeight: '320px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
          {/* Always provide a way to clear selection or matching native behavior */}
          <div 
            onClick={() => handleSelect('')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'background 0.2s',
              fontSize: '0.875rem',
              background: value === '' ? 'var(--bg-tertiary)' : 'transparent'
            }}
            onMouseOver={(e) => { if (value !== '') e.currentTarget.style.background = 'var(--bg-tertiary)' }}
            onMouseOut={(e) => { if (value !== '') e.currentTarget.style.background = 'transparent' }}
          >
            {placeholder}
          </div>

          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div 
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.2s',
                  fontSize: '0.875rem',
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
