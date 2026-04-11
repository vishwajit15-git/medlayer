import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Users, UserRoundCog, Settings, LogOut, Clock, Database, Activity, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: 'Appointments', path: '/dashboard', icon: <CalendarDays size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Dr. Schedule', path: '/dashboard/schedule', icon: <Clock size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Patients', path: '/dashboard/patients', icon: <Users size={20} />, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Doctors', path: '/dashboard/doctors', icon: <UserRoundCog size={20} />, roles: ['admin', 'receptionist'] },
    { name: 'Audit Logs', path: '/dashboard/audit-logs', icon: <Database size={20} />, roles: ['admin'] },
    { name: 'Staff Management', path: '/dashboard/staff', icon: <ShieldCheck size={20} />, roles: ['admin'] },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} />, roles: ['admin'] },
  ];

  return (
    <aside style={{ 
      width: '260px', 
      background: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>MedLayer</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.filter(item => item.roles.includes(user?.role)).map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'var(--transition)'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem', 
            background: 'transparent',
            border: 'none',
            color: 'var(--error)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--error-bg)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
