// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ Job System</h1>
        <h2 style={styles.subtitle}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f4ff' },
  card: { background:'#fff', padding:'2rem', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'360px' },
  title: { textAlign:'center', color:'#1B2A4A', marginBottom:'0.25rem' },
  subtitle: { textAlign:'center', color:'#6B7280', fontWeight:'normal', marginBottom:'1.5rem' },
  input: { width:'100%', padding:'0.75rem', marginBottom:'1rem', border:'1px solid #ddd', borderRadius:'8px', fontSize:'1rem', boxSizing:'border-box' },
  button: { width:'100%', padding:'0.75rem', background:'#2563EB', color:'#fff', border:'none', borderRadius:'8px', fontSize:'1rem', cursor:'pointer' },
  error: { background:'#fee2e2', color:'#dc2626', padding:'0.75rem', borderRadius:'8px', marginBottom:'1rem', fontSize:'0.9rem' },
  link: { textAlign:'center', marginTop:'1rem', color:'#6B7280' },
};

export default Login;
