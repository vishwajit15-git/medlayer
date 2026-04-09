import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, AlertCircle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/auth/audit-logs');
      // Backend returns { logs: [...] }
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load audit logs. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => filterAction ? log.action === filterAction : true);

  // Derive unique actions for the filter dropdown
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const getActionColor = (action = '') => {
    if (action.includes('CREATE') || action.includes('ADD')) return '#10b981';
    if (action.includes('DELETE') || action.includes('CANCEL')) return '#ef4444';
    if (action.includes('UPDATE') || action.includes('RESCHEDULE') || action.includes('COMPLETE')) return '#f59e0b';
    return 'var(--accent-primary)';
  };

  const formatActionLabel = (actionStr) => {
    if (!actionStr) return '';
    const mapping = {
      'CREATE_APPOINTMENT': 'Create Apt.',
      'RESCHEDULE_APPOINTMENT': 'Reschedule Apt.',
      'CHECKIN_APPOINTMENT': 'CheckIn Apt.',
      'CANCEL_APPOINTMENT': 'Cancel Apt.',
      'COMPLETE_APPOINTMENT': 'Complete Apt.',
      'ADD_NOTES': 'Add Notes'
    };
    return mapping[actionStr] || actionStr.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={28} style={{ color: 'var(--accent-primary)' }} />
          <h1>Audit Logs</h1>
        </div>

        <div style={{ width: '200px', height: '40px' }}>
          <CustomSelect
            value={filterAction}
            onChange={(val) => setFilterAction(val)}
            placeholder="All Actions"
            options={uniqueActions.map(a => ({ value: a, label: formatActionLabel(a) }))}
            triggerStyle={{ borderRadius: '2rem', textAlign: 'center' }}
            optionStyle={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      <div className="panel" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        {loading ? (
          <div className="flex-center" style={{ flex: 1, color: 'var(--text-secondary)' }}>Loading audit logs...</div>
        ) : error ? (
          <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--error)' }}>
            <AlertCircle size={36} />
            <p style={{ fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchLogs}>Retry</button>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Actor Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr
                    key={log._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', fontFamily: 'monospace' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                        {(log.role || 'SYSTEM').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: getActionColor(log.action), fontWeight: 600 }}>
                      {formatActionLabel(log.action)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>
                      {log.description || `${formatActionLabel(log.action)} on ${log.entity}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && !loading && (
              <div className="flex-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>
                No audit logs found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

