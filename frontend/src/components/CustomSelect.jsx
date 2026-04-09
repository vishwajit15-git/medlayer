import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = "Select an option", triggerStyle = {}, searchable = false, optionStyle = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999, width: 0 });

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropWidth = Math.max(rect.width, 200);
      // Right-align dropdown to the trigger if it would overflow the viewport
      let left = rect.right - dropWidth;
      if (left < 8) left = 8;
      setCoords({
        top: rect.bottom + 8,
        left,
        width: dropWidth
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e) => {
      // Don't close if scrolling inside the dropdown itself
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Use capture: true to catch scroll events on any internal scrollable container
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;
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

            {/* Search Input */}
            {searchable && (
              <div style={{
                margin: '-0.5rem -0.5rem 0.25rem -0.5rem', /* Pull over container padding */
                padding: '0.75rem 0.75rem 0.5rem 0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky', top: '-0.5rem', /* Stick to absolute top */
                background: '#202022',
                zIndex: 2,
                borderRadius: '12px 12px 0 0', /* Match container rounding */
                display: 'flex', alignItems: 'center', gap: '0.6rem'
              }}>
                <Search size={14} color="#6b7280" style={{ flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search..."
                  autoFocus
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#e5e7eb', fontSize: '0.95rem', width: '100%',
                    padding: 0, fontFamily: 'inherit', boxShadow: 'none',
                    caretColor: '#fff'
                  }}
                />
              </div>
            )}
            {/* Clear selection option — hidden when searchable (search bar replaces it) */}
            {!searchable && (
              <div
                onClick={() => handleSelect('')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'background 0.2s',
                  fontSize: '0.875rem',
                  background: value === '' ? 'var(--bg-tertiary)' : 'transparent',
                  ...optionStyle
                }}
                onMouseOver={(e) => { if (value !== '') e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                onMouseOut={(e) => { if (value !== '') e.currentTarget.style.background = 'transparent' }}
              >
                {placeholder}
              </div>
            )}

            {filteredOptions.map((opt) => {
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
                    alignItems: 'center',
                    ...optionStyle
                  }}
                  onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                  onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  {opt.label}
                </div>
              );
            })}

            {searchable && searchTerm && filteredOptions.length === 0 && (
              <div style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>
                No results for "{searchTerm}"
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
