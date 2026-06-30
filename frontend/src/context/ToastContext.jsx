import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="var(--success)" />;
      case 'error': return <AlertCircle size={20} color="var(--error)" />;
      default: return <Info size={20} color="var(--accent-primary)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 99999
        }}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="animate-fade-in"
              style={{
                background: 'var(--bg-elevated)',
                borderLeft: `4px solid var(--${toast.type === 'error' ? 'error' : toast.type === 'success' ? 'success' : 'accent-primary'})`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: '300px',
                maxWidth: '400px',
                color: 'var(--text-primary)',
                // No border-radius to match Medicenter flat UI
                borderRadius: '0px'
              }}
            >
              {getIcon(toast.type)}
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
