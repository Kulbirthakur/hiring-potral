import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { getApiUrl, fetchJsonWithRetry, sanitizeError } from '../apiConfig';

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchJsonWithRetry(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (data.success && data.token) {
        localStorage.setItem('hirepulse_auth_token', data.token);
        localStorage.setItem('hirepulse_auth_user', data.username);
        onLoginSuccess(data.username, data.token);
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError(sanitizeError(err) || 'Invalid username or password. Default is admin / password123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        maxWidth: '440px', width: '100%', borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem', border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: 'var(--accent-glow)'
          }}>
            <Lock size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Recruiter Login
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Enter your credentials to access the HirePulse Management Suite.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171',
            borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (default: admin)" 
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: password123)" 
                className="input-field"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Default Credentials Hint */}
          <div style={{
            padding: '0.75rem', background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', color: '#a5b4fc', textAlign: 'center'
          }}>
            🔑 Default Credentials: Username <strong>admin</strong> | Password <strong>password123</strong>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}
          >
            {isLoading ? 'Authenticating...' : <><LogIn size={18} /> Sign In to Dashboard</>}
          </button>
        </form>
      </div>
    </div>
  );
}
