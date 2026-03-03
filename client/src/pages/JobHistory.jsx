// src/pages/JobHistory.jsx
// Purpose: Paginated job history with status filter

import { useState, useEffect } from 'react';
import { listJobs } from '../api/jobs.api';

const STATUS_COLORS = {
  pending: '#d97706', processing: '#2563eb',
  completed: '#16a34a', failed: '#dc2626', cancelled: '#6b7280',
};

const JobHistory = () => {
  const [jobs, setJobs]         = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await listJobs({ page, limit: 10, status: status || undefined });
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page, status]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#1B2A4A', margin: 0 }}>Job History</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['pending', 'processing', 'completed', 'failed', 'cancelled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={fetchJobs} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
          No jobs found. Submit a job to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {jobs.map((job) => (
            <div key={job._id} style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1B2A4A', marginBottom: '0.2rem' }}>{job.type}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  ID: {job._id} · Created: {new Date(job.createdAt).toLocaleString()}
                  {job.duration && ` · Duration: ${(job.duration / 1000).toFixed(2)}s`}
                </div>
                {job.errorMessage && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>Error: {job.errorMessage}</div>}
              </div>
              <span style={{ background: STATUS_COLORS[job.status] || '#6b7280', color: '#fff', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>{page} / {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default JobHistory;
