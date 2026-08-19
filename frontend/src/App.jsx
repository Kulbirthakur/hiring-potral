import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PublicJobPortal from './components/PublicJobPortal';
import CandidateModal from './components/CandidateModal';
import LinkGeneratorModal from './components/LinkGeneratorModal';
import LoginModal from './components/LoginModal';
import { Briefcase, LayoutDashboard, UserPlus, Sun, Moon, Key, LogOut } from 'lucide-react';
import { getApiUrl, fetchJsonWithRetry, sanitizeError } from './apiConfig';

export default function App() {
  // ALL STATE HOOK DECLARATIONS AT VERY TOP
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('hirepulse_auth_token'));
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('hirepulse_auth_user') || 'admin';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Check if URL is public applicant view (/apply or ?view=apply or #apply)
  const isPublicOnly = 
    window.location.pathname.includes('/apply') || 
    window.location.search.includes('view=apply') || 
    window.location.hash.includes('apply');

  const handleLogout = () => {
    localStorage.removeItem('hirepulse_auth_token');
    localStorage.removeItem('hirepulse_auth_user');
    setIsAuthenticated(false);
  };

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const data = await fetchJsonWithRetry(getApiUrl('/api/links/generate'), { method: 'POST' });
      const liveLink = data.one_time_link || `${window.location.origin}/?view=apply&token=${data.token}`;
      setGeneratedLink(liveLink);
      setIsLinkModalOpen(true);
    } catch (err) {
      alert('Could not generate single-use link. Make sure backend is running.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const fetchApplications = async () => {
    if (isPublicOnly) return; // Don't fetch admin dashboard data if applicant view

    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (departmentFilter !== 'All') queryParams.append('department', departmentFilter);

      const [appData, statsData] = await Promise.all([
        fetchJsonWithRetry(getApiUrl(`/api/applications?${queryParams.toString()}`)),
        fetchJsonWithRetry(getApiUrl('/api/stats'))
      ]);

      setApplications(appData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(sanitizeError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter, departmentFilter]);

  // Automatic poller to resolve Render free-tier cold starts
  useEffect(() => {
    if (!error) return;
    const interval = setInterval(() => {
      fetchApplications();
    }, 5000);
    return () => clearInterval(interval);
  }, [error]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleUpdateStatus = async (id, updateData) => {
    try {
      const response = await fetch(getApiUrl(`/api/applications/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update application');
      const updatedItem = await response.json();

      setApplications(prev => prev.map(item => item.application_id === id ? updatedItem : item));
      if (selectedCandidate && selectedCandidate.application_id === id) {
        setSelectedCandidate(updatedItem);
      }
      fetchApplications();
    } catch (err) {
      alert(sanitizeError(err));
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate application?')) return;

    try {
      const response = await fetch(getApiUrl(`/api/applications/${id}`), {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete application');

      setApplications(prev => prev.filter(item => item.application_id !== id));
      setSelectedCandidate(null);
      fetchApplications();
    } catch (err) {
      alert(sanitizeError(err));
    }
  };

  // IF PUBLIC APPLICANT ONLY VIEW
  if (isPublicOnly) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Briefcase size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem' }} className="gradient-text">Careers Portal</span>
          </div>
          <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
          </button>
        </div>

        {/* Form Only */}
        <PublicJobPortal onApplicationSubmitted={() => {}} />
      </div>
    );
  }

  // IF NOT AUTHENTICATED AND NOT APPLICANT VIEW, SHOW LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <LoginModal 
        onLoginSuccess={(user, token) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  // RECRUITER / ADMIN FULL MODE
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={{
        margin: '1.25rem 1.5rem', padding: '0.85rem 1.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)',
        position: 'sticky', top: '1rem', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: 'var(--accent-glow)'
          }}>
            <Briefcase size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">
              HirePulse
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="glow-dot" style={{ backgroundColor: '#34d399' }}></span> PostgreSQL Connected
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-glass)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.55rem 1.25rem', border: 'none', borderRadius: 'var(--radius-sm)',
              background: activeTab === 'dashboard' ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <LayoutDashboard size={16} /> Recruiter Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('portal')}
            style={{
              padding: '0.55rem 1.25rem', border: 'none', borderRadius: 'var(--radius-sm)',
              background: activeTab === 'portal' ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === 'portal' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <UserPlus size={16} /> Job Application Portal
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handleGenerateLink} 
            disabled={isGeneratingLink}
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Generate Single-Use 1-Time Candidate Link"
          >
            <Key size={16} /> {isGeneratingLink ? 'Generating...' : '1-Time Link'}
          </button>
          <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>
          <button 
            onClick={handleLogout} 
            className="btn-secondary" 
            style={{ padding: '0.5rem 0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
            title="Sign Out"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '0 1.5rem 2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {error && (
          <div style={{
            padding: '1rem 1.5rem', background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc',
            borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 500,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>⏳ Connecting to cloud database server (waking up free tier server)...</span>
            <button onClick={fetchApplications} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>Retry Now</button>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <Dashboard 
            applications={applications}
            stats={stats}
            onSelectCandidate={setSelectedCandidate}
            onRefresh={fetchApplications}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
          />
        ) : (
          <PublicJobPortal 
            onApplicationSubmitted={() => {
              fetchApplications();
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteCandidate={handleDeleteCandidate}
        />
      )}

      <LinkGeneratorModal 
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        linkType="single"
        generatedLink={generatedLink}
      />
    </div>
  );
}
