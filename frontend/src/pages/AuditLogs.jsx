import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Search } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => filterAction ? log.action === filterAction : true);

  // Derive unique actions for the filter dropout
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>System Audit Ledger</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="">All Immutable Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {loading ? (
          <div className="flex-center" style={{ flex: 1 }}>Parsing blockchain ledgers...</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Actor Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Action Hash</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Entity Target</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Trace ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', fontFamily: 'monospace' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        {log.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{log.entity}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="flex-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>
                No operations logged in immutable state.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
