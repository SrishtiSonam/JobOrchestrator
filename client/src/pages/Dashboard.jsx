// src/pages/Dashboard.jsx
// Purpose: Main dashboard — shows stats and quick links

import { useState, useEffect } from 'react';
import { listJobs } from '../api/jobs.api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</div>
    <div style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.9rem' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    listJobs({ limit: 5 }).then((res) => {
      const jobs = res.data.jobs || [];
      setRecentJobs(jobs);
      const s = { total: res.data.pagination?.total || 0, pending: 0, processing: 0, completed: 0, failed: 0 };
      jobs.forEach((j) => { if (s[j.status] !== undefined) s[j.status]++; });
      setStats(s);
    }).catch(console.error);
  }, []);

  // Listen for real-time job notifications
  useEffect(() => {
    if (!socket) return;
    const addNotif = (type, data) => {
      setNotifications((prev) => [{ type, data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    };
    socket.on('job:completed', (data) => addNotif('✅ Completed', data));
    socket.on('job:failed',    (data) => addNotif('❌ Failed', data));
    return () => { socket.off('job:completed'); socket.off('job:failed'); };
  }, [socket]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#1B2A4A', margin: 0 }}>Welcome, {user?.name} 👋</h2>
          <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time notifications: <span style={{ color: connected ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{connected ? '● Connected' : '○ Disconnected'}</span>
          </div>
        </div>
        <Link to="/submit" style={{ padding: '0.75rem 1.5rem', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          + New Job
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Jobs"  value={stats.total}      color="#1B2A4A" />
        <StatCard label="Pending"     value={stats.pending}    color="#d97706" />
        <StatCard label="Processing"  value={stats.processing} color="#2563eb" />
        <StatCard label="Completed"   value={stats.completed}  color="#16a34a" />
        <StatCard label="Failed"      value={stats.failed}     color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>Recent Jobs</h3>
          {recentJobs.length === 0 ? <p style={{ color: '#9ca3af' }}>No jobs yet</p> : recentJobs.map((j) => (
            <div key={j._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
              <span style={{ color: '#374151' }}>{j.type}</span>
              <span style={{ color: { completed:'#16a34a', failed:'#dc2626', pending:'#d97706', processing:'#2563eb' }[j.status] || '#6b7280', fontWeight: '600' }}>
                {j.status}
              </span>
            </div>
          ))}
          <Link to="/history" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#2563eb', fontSize: '0.9rem' }}>View all jobs →</Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>Live Notifications</h3>
          {notifications.length === 0 ? <p style={{ color: '#9ca3af' }}>No notifications yet</p> : notifications.map((n, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
              <span>{n.type}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
