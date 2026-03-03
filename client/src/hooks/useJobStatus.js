// src/hooks/useJobStatus.js
// Purpose: Subscribe to real-time job updates for a specific job ID

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const useJobStatus = (jobId, initialStatus = 'pending') => {
  const { socket } = useSocket();
  const [status, setStatus]   = useState(initialStatus);
  const [progress, setProgress] = useState(0);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!socket || !jobId) return;

    // Subscribe to this specific job's room
    socket.emit('subscribe:job', jobId);

    const onProcessing = ({ mongoJobId }) => {
      if (mongoJobId === jobId) { setStatus('processing'); setProgress(0); }
    };
    const onProgress = ({ mongoJobId, progress }) => {
      if (mongoJobId === jobId) setProgress(progress);
    };
    const onCompleted = ({ mongoJobId, result }) => {
      if (mongoJobId === jobId) { setStatus('completed'); setResult(result); setProgress(100); }
    };
    const onFailed = ({ mongoJobId, reason }) => {
      if (mongoJobId === jobId) { setStatus('failed'); setError(reason); }
    };

    socket.on('job:processing', onProcessing);
    socket.on('job:progress',   onProgress);
    socket.on('job:completed',  onCompleted);
    socket.on('job:failed',     onFailed);

    return () => {
      socket.emit('unsubscribe:job', jobId);
      socket.off('job:processing', onProcessing);
      socket.off('job:progress',   onProgress);
      socket.off('job:completed',  onCompleted);
      socket.off('job:failed',     onFailed);
    };
  }, [socket, jobId]);

  return { status, progress, result, error };
};

export default useJobStatus;
