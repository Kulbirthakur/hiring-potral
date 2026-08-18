import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, ExternalLink, Trash2 } from 'lucide-react';

export default function CandidateModal({ candidate, onClose, onUpdateStatus, onDeleteCandidate }) {
  if (!candidate) return null;

  const [status, setStatus] = useState(candidate.application_status || 'Applied');
  const [recruiterNotes, setRecruiterNotes] = useState(candidate.recruiter_notes || '');
  const [interviewDate, setInterviewDate] = useState(
    candidate.interview_date ? new Date(candidate.interview_date).toISOString().slice(0, 16) : ''
  );
  const [interviewerName, setInterviewerName] = useState(candidate.interviewer_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await onUpdateStatus(candidate.application_id, {
        application_status: status,
        recruiter_notes: recruiterNotes,
        interview_date: interviewDate || null,
        interviewer_name: interviewerName
      });
      setMessage('Candidate record updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating record.');
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeClass = (st) => {
    const s = (st || 'applied').toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${s}`;
  };

  const selectDropdownStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderColor: '#6366f1',
    fontWeight: 700,
    fontSize: '0.95rem',
    padding: '0.65rem 1rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
  };

  const optionItemStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '0.6rem',
    fontWeight: 700
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '2rem', borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{candidate.candidate_name}</h2>
              <span className={getBadgeClass(status)}>{status}</span>
            </div>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
              {candidate.job_title} <span style={{ color: 'var(--text-muted)' }}>• {candidate.department || 'General'}</span>
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
            backgroundColor: message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: message.includes('Error') ? '#f87171' : '#34d399', marginBottom: '1.5rem', fontWeight: 500
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'var(--bg-glass)', padding: '1.25rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Mail size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{candidate.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{candidate.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{candidate.location || 'Remote'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Briefcase size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{candidate.experience_years || 0} Yrs Experience</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Professional Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current Role:</span>
                  <p style={{ fontWeight: 500 }}>{candidate.current_job_title || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Education:</span>
                  <p style={{ fontWeight: 500 }}>{candidate.education || 'N/A'}</p>
                </div>
              </div>
            </div>

            {candidate.skills && (
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Skills & Expertise
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {candidate.skills.split(',').map((skill, idx) => (
                    <span key={idx} style={{
                      padding: '0.35rem 0.75rem', background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)', color: '#a5b4fc',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500
                    }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.resume_file_url && (
              <div>
                <a href={candidate.resume_file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={16} /> View Candidate Resume ({candidate.resume_file_name || 'Attachment'})
                </a>
              </div>
            )}
          </div>

          <div style={{
            background: 'var(--bg-glass)', padding: '1.25rem', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Recruiter Controls
            </h3>

            {/* HIGH CONTRAST CLEAR DROPDOWN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: 700 }}>
                Hiring Pipeline Stage *
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectDropdownStyle}>
                <option value="Applied" style={optionItemStyle}>🔹 Applied</option>
                <option value="Screening" style={optionItemStyle}>🔸 Screening</option>
                <option value="Interview Scheduled" style={optionItemStyle}>💜 Interview Scheduled</option>
                <option value="Offered" style={optionItemStyle}>💖 Offered</option>
                <option value="Hired" style={optionItemStyle}>🟢 Hired</option>
                <option value="Rejected" style={optionItemStyle}>🔴 Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                Interview Schedule
              </label>
              <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="input-field" style={{ marginBottom: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff' }} />
              <input type="text" placeholder="Interviewer Name" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} className="input-field" style={{ backgroundColor: '#1e293b', color: '#ffffff' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                Internal Recruiter Notes
              </label>
              <textarea rows="4" placeholder="Add evaluation feedback..." value={recruiterNotes} onChange={(e) => setRecruiterNotes(e.target.value)} className="input-field" style={{ resize: 'vertical', backgroundColor: '#1e293b', color: '#ffffff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ justifyContent: 'center', fontWeight: 700 }}>
                {isSaving ? 'Saving...' : 'Update Application'}
              </button>

              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this candidate record?')) {
                    onDeleteCandidate(candidate.application_id);
                    onClose();
                  }
                }}
                className="btn-secondary" 
                style={{ justifyContent: 'center', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={16} /> Delete Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
