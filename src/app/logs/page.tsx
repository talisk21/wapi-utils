'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ApiLog {
  id: string | number;
  time?: string | null;
  created_at?: string;
  method?: string | null;
  path?: string | null;
  status?: number | null;
  duration_ms?: number | null;
  user_agent?: string | null;
  ip?: string | null;
  req?: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ffn' | 'shopify'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [expandedLogId, setExpandedLogId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/logs?filter=${filter}&limit=150`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load logs');
      }
      setLogs(data.logs || []);
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map((l) => l.id)));
    }
  };

  const deleteSingleLog = async (id: string | number) => {
    if (!window.confirm(`Are you sure you want to delete log #${id}?`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/logs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete log');
      }
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (expandedLogId === id) setExpandedLogId(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelectedLogs = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected log row(s)?`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to batch delete logs');
      }
      setLogs((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
      if (expandedLogId && selectedIds.has(expandedLogId)) {
        setExpandedLogId(null);
      }
    } catch (err: any) {
      alert('Batch delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const copyPayload = (id: string | number, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceBadge = (path?: string | null) => {
    if (!path) return { label: 'OTHER', bg: '#4a5568', color: '#fff' };
    if (path.includes('/api/ffn')) {
      return { label: 'FFN', bg: '#6b46c1', color: '#fff' };
    }
    if (path.includes('/callback')) {
      return { label: 'SHOPIFY', bg: '#2b6cb0', color: '#fff' };
    }
    return { label: 'API', bg: '#4a5568', color: '#fff' };
  };

  const getStatusBadge = (status?: number | null) => {
    if (!status) return { bg: '#718096', color: '#fff' };
    if (status >= 200 && status < 300) return { bg: '#276749', color: '#c6f6d5' };
    if (status >= 300 && status < 400) return { bg: '#b7791f', color: '#fefcbf' };
    if (status >= 400 && status < 500) return { bg: '#9b2c2c', color: '#fed7d7' };
    return { bg: '#742a2a', color: '#fed7d7' };
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '-';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  const getLogTimestamp = (log: ApiLog) => {
    return log.time || log.created_at || log.req?.timestamp || (log as any).timestamp || (log as any).date || (log as any).inserted_at;
  };

  return (
    <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ marginBottom: '6px' }}>
            <Link href="/" style={{ color: '#90cdf4', fontSize: '14px', textDecoration: 'none' }}>
              &larr; Back to Home
            </Link>
          </div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Callback & API Logs</h1>
          <p style={{ color: '#a0aec0', fontSize: '14px', marginTop: '4px' }}>
            Inspect incoming requests, responses, and manage log rows from Supabase.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchLogs} 
            disabled={loading || deleting}
            style={{ padding: '8px 16px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={deleteSelectedLogs}
              disabled={deleting}
              style={{
                padding: '8px 16px',
                background: '#e53e3e',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {deleting ? 'Deleting...' : `🗑️ Delete Selected (${selectedIds.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #2d3748', paddingBottom: '12px' }}>
        {(
          [
            { key: 'all', label: 'All Logs' },
            { key: 'ffn', label: 'FFN Callback (/api/ffn/callback)' },
            { key: 'shopify', label: 'Shopify Callback (/callback)' },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 16px',
                background: isActive ? '#3182ce' : '#1a202c',
                border: isActive ? '1px solid #63b3ed' : '1px solid #2d3748',
                borderRadius: '6px',
                color: isActive ? '#fff' : '#a0aec0',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ width: '100%', padding: '14px', background: '#742a2a', color: '#fed7d7', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table Section */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#171923', borderRadius: '10px', border: '1px solid #2d3748' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#1a202c', borderBottom: '1px solid #2d3748', color: '#a0aec0' }}>
              <th style={{ padding: '12px 14px', width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={logs.length > 0 && selectedIds.size === logs.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '12px 14px', width: '160px' }}>Timestamp</th>
              <th style={{ padding: '12px 14px', width: '90px' }}>Source</th>
              <th style={{ padding: '12px 14px', width: '70px' }}>Method</th>
              <th style={{ padding: '12px 14px' }}>Path</th>
              <th style={{ padding: '12px 14px', width: '80px' }}>Status</th>
              <th style={{ padding: '12px 14px', width: '120px' }}>IP</th>
              <th style={{ padding: '12px 14px', width: '80px' }}>Duration</th>
              <th style={{ padding: '12px 14px', width: '160px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px 14px', textAlign: 'center', color: '#718096' }}>
                  {loading ? 'Loading logs from Supabase...' : 'No logs found for this filter.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isSelected = selectedIds.has(log.id);
                const isExpanded = expandedLogId === log.id;
                const source = getSourceBadge(log.path);
                const status = getStatusBadge(log.status);

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #2d3748',
                      background: isSelected ? '#233044' : isExpanded ? '#1c2433' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(log.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>

                    {/* Timestamp */}
                    <td style={{ padding: '12px 14px', color: '#cbd5e0', whiteSpace: 'nowrap' }}>
                      {formatDate(getLogTimestamp(log))}
                    </td>

                    {/* Source Badge */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: source.bg,
                          color: source.color,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {source.label}
                      </span>
                    </td>

                    {/* Method */}
                    <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>
                      <span style={{ color: log.method === 'POST' ? '#f6ad55' : '#63b3ed' }}>
                        {log.method || '-'}
                      </span>
                    </td>

                    {/* Path */}
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>
                      {log.path || '-'}
                    </td>

                    {/* Status Code */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: status.bg,
                          color: status.color,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {log.status ?? '-'}
                      </span>
                    </td>

                    {/* IP */}
                    <td style={{ padding: '12px 14px', color: '#a0aec0', fontFamily: 'monospace' }}>
                      {log.ip || '-'}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '12px 14px', color: '#a0aec0' }}>
                      {log.duration_ms != null ? `${log.duration_ms}ms` : '-'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{
                          padding: '4px 10px',
                          marginRight: '8px',
                          background: isExpanded ? '#4a5568' : '#2b6cb0',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                      <button
                        onClick={() => deleteSingleLog(log.id)}
                        disabled={deleting}
                        style={{
                          padding: '4px 10px',
                          background: '#742a2a',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fed7d7',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                        title="Delete this row"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Inspector Drawer / Modal */}
      {expandedLogId && (
        (() => {
          const activeLog = logs.find((l) => l.id === expandedLogId);
          if (!activeLog) return null;
          return (
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                background: '#1a202c',
                borderRadius: '10px',
                border: '1px solid #4a5568',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#e2e8f0' }}>
                    Log #{activeLog.id} Details
                  </h3>
                  <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                    {activeLog.method} {activeLog.path} &bull; Received at {formatDate(getLogTimestamp(activeLog))}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => copyPayload(activeLog.id, activeLog.req)}
                    style={{
                      padding: '6px 14px',
                      background: '#2b6cb0',
                      border: 'none',
                      borderRadius: '5px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === activeLog.id ? '✓ Copied!' : '📋 Copy JSON'}
                  </button>
                  <button
                    onClick={() => setExpandedLogId(null)}
                    style={{
                      padding: '6px 14px',
                      background: '#4a5568',
                      border: 'none',
                      borderRadius: '5px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Payload representation */}
              <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #2d3748' }}>
                <pre style={{ margin: 0, color: '#68d391', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5' }}>
                  {activeLog.req ? JSON.stringify(activeLog.req, null, 2) : '// No req payload recorded'}
                </pre>
              </div>

              {activeLog.user_agent && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#a0aec0' }}>
                  <strong>User Agent:</strong> {activeLog.user_agent}
                </div>
              )}
            </div>
          );
        })()
      )}
    </main>
  );
}
