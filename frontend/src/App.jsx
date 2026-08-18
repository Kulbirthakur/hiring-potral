import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PublicJobPortal from './components/PublicJobPortal';
import CandidateModal from './components/CandidateModal';
import { Briefcase, LayoutDashboard, UserPlus, Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Check if URL is public applicant view (/apply or ?view=apply or #apply)
  const isPublicOnly = 
    window.location.pathname.includes('/apply') || 
    window.location.search.includes('view=apply') || 
    window.location.hash.includes('apply');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchApplications = async () => {
    if (isPublicOnly) return; // Don't fetch admin dashboard data if applicant view

    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (departmentFilter !== 'All') queryParams.append('department', departmentFilter);

      const [appRes, statsRes] = await Promise.all([
        fetch(`/api/applications?${queryParams.toString()}`),
        fetch('/api/stats')
      ]);

      if (!appRes.ok || !statsRes.ok) {
        throw new Error('Failed to connect to Node.js backend & PostgreSQL database.');
      }

      const appData = await appRes.json();
      const statsData = await statsRes.json();

      setApplications(appData);
      setStats(statsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter, departmentFilter]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleUpdateStatus = async (id, updateData) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
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
      console.error('Update error:', err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete application');

      setApplications(prev => prev.filter(item => item.application_id !== id));
      fetchApplications();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete candidate.');
    }
  };

  // IF PUBLIC CANDIDATE ONLY MODE (/apply or ?view=apply)
  if (isPublicOnly) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
        {/* Simple Candidate Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '0 1.5rem 2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {error && (
          <div style={{
            padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171',
            borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 500,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchApplications} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>Retry</button>
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
    </div>
  );
}
