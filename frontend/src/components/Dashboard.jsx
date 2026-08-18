import React, { useState } from 'react';
import { Search, RefreshCw, LayoutGrid, List, CheckCircle2, UserX, Clock, Eye } from 'lucide-react';

export default function Dashboard({ 
  applications, 
  stats, 
  onSelectCandidate, 
  onRefresh, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter
}) {
  const [viewMode, setViewMode] = useState('table');
  const [activeCategory, setActiveCategory] = useState('All'); // 'All', 'Selected', 'Rejected', 'In Review'

  const stages = [
    { name: 'Applied', color: '#60a5fa' },
    { name: 'Screening', color: '#fbbf24' },
    { name: 'Interview Scheduled', color: '#c084fc' },
    { name: 'Offered', color: '#f472b6' },
    { name: 'Hired', color: '#34d399' },
    { name: 'Rejected', color: '#f87171' }
  ];

  // Calculate counts for 3 main candidate categories
  const selectedCount = (stats?.hired || 0) + (stats?.offered || 0);
  const rejectedCount = stats?.rejected || 0;
  const inReviewCount = (stats?.applied || 0) + (stats?.screening || 0) + (stats?.interview_scheduled || 0);

  // Filter candidates based on top 3 categories + dropdown filters + search
  const filteredApplications = applications.filter((app) => {
    const status = app.application_status || 'Applied';

    // Top Category Filter
    if (activeCategory === 'Selected' && !['Hired', 'Offered'].includes(status)) return false;
    if (activeCategory === 'Rejected' && status !== 'Rejected') return false;
    if (activeCategory === 'In Review' && ['Hired', 'Offered', 'Rejected'].includes(status)) return false;

    return true;
  });

  const getBadgeClass = (st) => {
    const s = (st || 'applied').toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${s}`;
  };

  // High contrast dropdown style for dark mode visibility
  const selectDropdownStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderColor: '#6366f1',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  };

  const optionItemStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '0.5rem',
    fontWeight: 600
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      {/* TOP 3 PRIMARY CATEGORY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* 1. SELECTED CANDIDATES */}
        <div 
          onClick={() => setActiveCategory(activeCategory === 'Selected' ? 'All' : 'Selected')}
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            cursor: 'pointer',
            borderLeft: '5px solid #34d399',
            background: activeCategory === 'Selected' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
            borderColor: activeCategory === 'Selected' ? '#34d399' : 'var(--border-color)',
            transition: 'all 0.2s ease',
            boxShadow: activeCategory === 'Selected' ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'var(--shadow-main)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Selected Candidates
            </span>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle2 size={24} color="#34d399" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>{selectedCount}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hired & Offered</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: activeCategory === 'Selected' ? '#34d399' : 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
            {activeCategory === 'Selected' ? '✓ Currently Filtered' : 'Click to view selected candidates'}
          </p>
        </div>

        {/* 2. REJECTED CANDIDATES */}
        <div 
          onClick={() => setActiveCategory(activeCategory === 'Rejected' ? 'All' : 'Rejected')}
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            cursor: 'pointer',
            borderLeft: '5px solid #f87171',
            background: activeCategory === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-card)',
            borderColor: activeCategory === 'Rejected' ? '#f87171' : 'var(--border-color)',
            transition: 'all 0.2s ease',
            boxShadow: activeCategory === 'Rejected' ? '0 0 20px rgba(239, 68, 68, 0.25)' : 'var(--shadow-main)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Rejected Candidates
            </span>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)' }}>
              <UserX size={24} color="#f87171" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f87171' }}>{rejectedCount}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not Selected</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: activeCategory === 'Rejected' ? '#f87171' : 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
            {activeCategory === 'Rejected' ? '✓ Currently Filtered' : 'Click to view rejected candidates'}
          </p>
        </div>

        {/* 3. IN REVIEW CANDIDATES */}
        <div 
          onClick={() => setActiveCategory(activeCategory === 'In Review' ? 'All' : 'In Review')}
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            cursor: 'pointer',
            borderLeft: '5px solid #fbbf24',
            background: activeCategory === 'In Review' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
            borderColor: activeCategory === 'In Review' ? '#fbbf24' : 'var(--border-color)',
            transition: 'all 0.2s ease',
            boxShadow: activeCategory === 'In Review' ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'var(--shadow-main)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. In Review
            </span>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)' }}>
              <Clock size={24} color="#fbbf24" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24' }}>{inReviewCount}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Evaluation</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: activeCategory === 'In Review' ? '#fbbf24' : 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
            {activeCategory === 'In Review' ? '✓ Currently Filtered' : 'Click to view candidates in review'}
          </p>
        </div>

      </div>

      {/* Control & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {activeCategory !== 'All' && (
          <button 
            onClick={() => setActiveCategory('All')} 
            className="btn-secondary"
            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
          >
            ← Show All Candidates ({applications.length})
          </button>
        )}

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search candidate name, email, skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        {/* HIGH CONTRAST DROPDOWN FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Stage Dropdown Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="All" style={optionItemStyle}>📋 All Pipeline Stages</option>
            <option value="Applied" style={optionItemStyle}>🔹 Applied</option>
            <option value="Screening" style={optionItemStyle}>🔸 Screening</option>
            <option value="Interview Scheduled" style={optionItemStyle}>💜 Interview Scheduled</option>
            <option value="Offered" style={optionItemStyle}>💖 Offered</option>
            <option value="Hired" style={optionItemStyle}>🟢 Hired</option>
            <option value="Rejected" style={optionItemStyle}>🔴 Rejected</option>
          </select>

          {/* Department Dropdown Filter */}
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="All" style={optionItemStyle}>🏢 All Departments</option>
            <option value="Engineering" style={optionItemStyle}>💻 Engineering</option>
            <option value="Product" style={optionItemStyle}>🎨 Product</option>
            <option value="Analytics" style={optionItemStyle}>📊 Analytics</option>
          </select>

          <button onClick={onRefresh} className="btn-secondary" title="Refresh Applications">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* VIEW SWITCHER: TABLE VS PIPELINE BOARD */}
        <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewMode('table')} 
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600
            }}
          >
            <List size={16} /> Table View
          </button>
          <button 
            onClick={() => setViewMode('kanban')} 
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'kanban' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'kanban' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600
            }}
          >
            <LayoutGrid size={16} /> Pipeline Board
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'table' ? (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {filteredApplications.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No candidate applications match your current selection ({activeCategory}).
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Candidate</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Target Position</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Experience</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Applied Date</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Stage</th>
                    <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr 
                      key={app.application_id} 
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{app.candidate_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500 }}>{app.job_title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.department || 'Engineering'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {app.experience_years ? `${app.experience_years} Yrs` : 'Fresh'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={getBadgeClass(app.application_status)}>
                          {app.application_status || 'Applied'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => onSelectCandidate(app)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* PIPELINE BOARD VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', overflowX: 'auto' }}>
          {stages.map((stage) => {
            const stageApps = filteredApplications.filter(a => (a.application_status || 'Applied') === stage.name);
            return (
              <div key={stage.name} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stage.color }}></span>
                    {stage.name}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}>
                    {stageApps.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {stageApps.map((app) => (
                    <div 
                      key={app.application_id}
                      onClick={() => onSelectCandidate(app)}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{app.candidate_name}</h4>
                      <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>{app.job_title}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
