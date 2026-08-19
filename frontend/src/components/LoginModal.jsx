import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    if (cleanUser === 'admin' && cleanPass === 'password123') {
      const sessionToken = 'hirepulse_admin_authenticated_session_2026';
      localStorage.setItem('hirepulse_auth_token', sessionToken);
      localStorage.setItem('hirepulse_auth_user', 'admin');
      onLoginSuccess('admin', sessionToken);
      setIsLoading(false);
    } else {
      setError('Invalid username or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#1e293b',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem auto', boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Recruiter Login
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Enter your credentials to access the HirePulse Management Suite.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5',
            borderRadius: '10px', marginBottom: '1.5rem',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#cbd5e1' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username" 
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.95rem', outline: 'none'
                }}
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#cbd5e1' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" 
                style={{
                  width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                  background: '#0f172a', border: '1px solid #334155', borderRadius: '10px',
                  color: '#ffffff', fontSize: '0.95rem', outline: 'none'
                }}
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.85rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isLoading ? 'Authenticating...' : <><LogIn size={18} /> Sign In to Dashboard</>}
          </button>
        </form>
      </div>
    </div>
  );
}
