import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={40} className="text-accent-primary" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h2>Welcome Back</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            {loginRole === 'admin' ? 'Login to your Clinic Admin Dashboard' :
              loginRole === 'receptionist' ? 'Login to your Front Desk Reception Portal' :
                'Login to your Doctor Portal'}
          </p>
        </div>

        <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', padding: '0.25rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setLoginRole('admin')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: loginRole === 'admin' ? 'var(--bg-secondary)' : 'transparent',
              color: loginRole === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginRole('receptionist')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: loginRole === 'receptionist' ? 'var(--bg-secondary)' : 'transparent',
              color: loginRole === 'receptionist' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '0',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Receptionist
          </button>
          <button
            type="button"
            onClick={() => setLoginRole('doctor')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: loginRole === 'doctor' ? 'var(--bg-secondary)' : 'transparent',
              color: loginRole === 'doctor' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Doctor
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                loginRole === 'admin' ? "admin@clinic.com" :
                  loginRole === 'receptionist' ? "receptionist@clinic.com" :
                    "doctor@clinic.com"
              }
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', paddingRight: '2.5rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span className="text-muted">Don't have a clinic? </span>
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
