// src/App.jsx
// Purpose: Root component — routing, auth guards, layout

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobSubmit from './pages/JobSubmit';
import JobHistory from './pages/JobHistory';

// ── Protected route wrapper ───────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Navigation bar ────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logoutUser } = useAuth();
  if (!user) return null;
  return (
    <nav style={{ background: '#1B2A4A', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>⚡ JobSystem</span>
        <Link to="/dashboard" style={navLink}>Dashboard</Link>
        <Link to="/submit"    style={navLink}>Submit Job</Link>
        <Link to="/history"   style={navLink}>History</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.name} ({user.role})</span>
        <button onClick={logoutUser} style={{ padding: '0.4rem 1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const navLink = { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' };

// ── App ───────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <Navbar />
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 50px)' }}>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/submit"    element={<ProtectedRoute><JobSubmit /></ProtectedRoute>} />
        <Route path="/history"   element={<ProtectedRoute><JobHistory /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
