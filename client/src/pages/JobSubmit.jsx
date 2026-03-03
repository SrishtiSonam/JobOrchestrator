// src/pages/JobSubmit.jsx
// Purpose: Form to submit new jobs and track real-time status after submission

import { useState } from 'react';
import { submitJob } from '../api/jobs.api';
import useJobStatus from '../hooks/useJobStatus';

const JOB_TYPES = ['PDF_GENERATION', 'IMAGE_COMPRESSION', 'REPORT_GENERATION'];

const JobCard = ({ jobId, type }) => {
  const { status, progress, result, error } = useJobStatus(jobId);

  const statusColor = {
    pending: '#d97706', processing: '#2563eb', completed: '#16a34a', failed: '#dc2626',
  }[status] || '#6b7280';

  return (
    <div style={{ border: `2px solid ${statusColor}`, borderRadius: '10px', padding: '1rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{type}</strong>
        <span style={{ background: statusColor, color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
          {status.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Job ID: {jobId}</div>

      {status === 'processing' && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden', height: '10px' }}>
            <div style={{ width: `${progress}%`, background: '#2563eb', height: '100%', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '0.25rem' }}>{progress}% complete</div>
        </div>
      )}

      {status === 'completed' && result && (
        <div style={{ marginTop: '0.75rem', background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
          ✅ Result: <a href={result.fileUrl} target="_blank" rel="noreferrer">{result.filename}</a>
        </div>
      )}

      {status === 'failed' && error && (
        <div style={{ marginTop: '0.75rem', background: '#fef2f2', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', color: '#dc2626' }}>
          ❌ Error: {error}
        </div>
      )}
    </div>
  );
};

const JobSubmit = () => {
  const [type, setType]         = useState(JOB_TYPES[0]);
  const [payload, setPayload]   = useState('{ "title": "My Document", "content": "Hello world" }');
  const [submittedJobs, setSubmittedJobs] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const parsedPayload = JSON.parse(payload);
      const res = await submitJob({ type, payload: parsedPayload });
      setSubmittedJobs([{ id: res.data.data._id, type }, ...submittedJobs]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit job. Check JSON payload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#1B2A4A' }}>Submit New Job</h2>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <label style={styles.label}>Job Type</label>
        <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label style={styles.label}>Payload (JSON)</label>
        <textarea
          style={{ ...styles.input, height: '120px', fontFamily: 'Consolas, monospace', fontSize: '0.9rem' }}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          required
        />

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Submitting...' : '🚀 Submit Job'}
        </button>
      </form>

      {submittedJobs.map(({ id, type }) => (
        <JobCard key={id} jobId={id} type={type} />
      ))}
    </div>
  );
};

const styles = {
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
};

export default JobSubmit;
