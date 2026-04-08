import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Clinic ID: {user?.clinicId?.substring(user.clinicId.length - 6)}</div>
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
