// src/api/jobs.api.js
import api from './axios';

export const submitJob  = (data)   => api.post('/jobs', data);
export const listJobs   = (params) => api.get('/jobs', { params });
export const getJob     = (id)     => api.get(`/jobs/${id}`);
export const cancelJob  = (id)     => api.delete(`/jobs/${id}`);

// Admin
export const adminListJobs = (params) => api.get('/admin/jobs', { params });
export const adminGetStats = ()        => api.get('/admin/stats');
export const adminRetryJob = (id)      => api.post(`/admin/jobs/${id}/retry`);
