import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCircle, Sun, Moon } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Format role string nicely
  const formattedRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  return (
    <header style={{ 
      height: '70px', 
      background: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2rem',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            width: '40px',
            height: '40px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--hover-overlay)' }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div style={{
            position: 'absolute',
            display: 'flex',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDark ? 'rotate(0deg) scale(1) translateY(0)' : 'rotate(90deg) scale(0) translateY(10px)',
            opacity: isDark ? 1 : 0
          }}>
            <Moon size={20} />
          </div>
          <div style={{
            position: 'absolute',
            display: 'flex',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: !isDark ? 'rotate(0deg) scale(1) translateY(0)' : 'rotate(-90deg) scale(0) translateY(-10px)',
            opacity: !isDark ? 1 : 0
          }}>
            <Sun size={20} />
          </div>
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Clinic ID: {user?.clinicId?.substring(user.clinicId.length - 6)}</div>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {formattedRole} Access
          </div>
        </div>
        <UserCircle size={36} color="var(--text-secondary)" />
      </div>
    </header>
  );
};

export default Header;
