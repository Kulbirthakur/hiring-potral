import React, { useState, useEffect } from 'react';
import { Briefcase, Send, CheckCircle, User, Mail, Phone, MapPin, DollarSign, Clock, FileText, Sparkles, AlertCircle, Lock } from 'lucide-react';
import { getApiUrl } from '../apiConfig';

export default function PublicJobPortal({ onApplicationSubmitted }) {
  const [formData, setFormData] = useState({
    candidate_name: '',
    email: '',
    phone: '',
    location: '',
    job_title: 'Software Engineer',
    department: 'Engineering',
    employment_type: 'Full-time',
    experience_years: '2',
    current_job_title: '',
    skills: 'React, Node.js, PostgreSQL',
    education: "Bachelor's in Computer Science",
    expected_salary: '95000',
    notice_period: 'Immediate',
    resume_file_name: 'Resume_2026.pdf',
    resume_file_url: 'https://example.com/resumes/candidate.pdf',
    cover_letter: '',
    candidate_source: 'Company Careers Portal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Token validation state
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState({ isValidating: true, isValid: true, reason: '' });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      fetch(getApiUrl(`/api/links/validate?token=${encodeURIComponent(urlToken)}`))
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            setTokenStatus({ isValidating: false, isValid: false, reason: data.reason });
          } else {
            setTokenStatus({ isValidating: false, isValid: true, reason: '' });
          }
        })
        .catch(() => {
          setTokenStatus({ isValidating: false, isValid: true, reason: '' });
        });
    } else {
      setTokenStatus({ isValidating: false, isValid: true, reason: '' });
    }
  }, []);

  // High contrast dropdown style for dark mode visibility
  const selectDropdownStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderColor: '#6366f1',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  };

  const optionItemStyle = {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '0.6rem',
    fontWeight: 600
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = { ...formData };
      if (token) payload.token = token;

      const response = await fetch(getApiUrl('/api/applications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed.');
      }

      const newApp = await response.json();
      setSubmitted(true);
      if (onApplicationSubmitted) onApplicationSubmitted(newApp);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // LINK EXPIRED OR ALREADY USED SCREEN
  if (!tokenStatus.isValidating && !tokenStatus.isValid) {
    return (
      <div style={{ maxWidth: '650px', margin: '3rem auto' }} className="animate-fade-in">
        <div className="glass-panel" style={{
          padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(239, 68, 68, 0.4)', background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto'
          }}>
            <Lock size={36} color="#f87171" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem' }}>
            Application Link Expired
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {tokenStatus.reason === 'ALREADY_USED' ? (
              <>This <strong>single-use application link</strong> has already been used and submitted. Each invitation link can only be filled out once.</>
            ) : (
              <>This invitation link is invalid or has expired. Each candidate link can only be used once.</>
            )}
          </p>
          <div style={{
            padding: '1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)'
          }}>
            ℹ️ If you need to submit a new application, please request a new invitation link from the HR Recruitment Team.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Briefcase size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }} className="gradient-text">
            Join Our Growing Team
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
            Submit your application directly to our recruitment pipeline.
          </p>

          {/* ONE RESPONSE PER PERSON NOTICE BADGE */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginTop: '1rem'
          }}>
            <AlertCircle size={15} color="#818cf8" />
            {token ? '🔒 Single-Use Invitation Link (Expires Upon Submission)' : 'Note: Only 1 application per person is allowed.'}
          </div>
        </div>

        {submitted ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)'
          }} className="animate-fade-in">
            <CheckCircle size={64} color="#34d399" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.75rem', color: '#34d399', fontWeight: 700 }}>Application Received!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
              Thank you, <strong style={{ color: 'var(--text-primary)' }}>{formData.candidate_name}</strong>! Your application for <strong style={{ color: 'var(--accent-primary)' }}>{formData.job_title}</strong> has been logged into our PostgreSQL database.
            </p>
            {token ? (
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                🔒 This single-use invitation link is now deactivated and closed.
              </div>
            ) : (
              <button 
                onClick={() => setSubmitted(false)} 
                className="btn-primary" 
                style={{ marginTop: '2rem' }}
              >
                Submit Another Application
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {errorMessage && (
              <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#f87171',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle size={22} color="#f87171" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Position & Department Select */}
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff', fontSize: '1.05rem' }}>
                Applying For Position & Department *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Select Target Position *
                  </label>
                  <select 
                    name="job_title" 
                    value={formData.job_title} 
                    onChange={handleChange}
                    style={selectDropdownStyle}
                    required
                  >
                    <option value="Software Engineer" style={optionItemStyle}>💻 Software Engineer</option>
                    <option value="Senior Backend Engineer" style={optionItemStyle}>⚙️ Senior Backend Engineer</option>
                    <option value="Frontend React Developer" style={optionItemStyle}>⚛️ Frontend React Developer</option>
                    <option value="Product Manager" style={optionItemStyle}>🎨 Product Manager</option>
                    <option value="Data Analyst" style={optionItemStyle}>📊 Data Analyst</option>
                    <option value="DevOps & Cloud Engineer" style={optionItemStyle}>☁️ DevOps & Cloud Engineer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Select Department *
                  </label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange}
                    style={selectDropdownStyle}
                  >
                    <option value="Engineering" style={optionItemStyle}>🏢 Engineering</option>
                    <option value="Product" style={optionItemStyle}>🎨 Product</option>
                    <option value="Analytics" style={optionItemStyle}>📊 Analytics</option>
                    <option value="Design" style={optionItemStyle}>✏️ Design</option>
                    <option value="Sales" style={optionItemStyle}>🚀 Sales & Marketing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                1. Personal & Contact Info
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Full Name *</label>
                  <input type="text" name="candidate_name" value={formData.candidate_name} onChange={handleChange} className="input-field" required placeholder="e.g. Sarah Jenkins" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Email Address * (1 submission per email)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required placeholder="sarah@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 019-2834" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Location / City</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="San Francisco, CA / Remote" />
                </div>
              </div>
            </div>

            {/* Experience & Qualifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                2. Experience & Background
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Years of Experience</label>
                  <input type="number" step="0.5" name="experience_years" value={formData.experience_years} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Current Job Title</label>
                  <input type="text" name="current_job_title" value={formData.current_job_title} onChange={handleChange} className="input-field" placeholder="Full Stack Dev" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Notice Period</label>
                  <select name="notice_period" value={formData.notice_period} onChange={handleChange} style={selectDropdownStyle}>
                    <option value="Immediate" style={optionItemStyle}>⚡ Immediate</option>
                    <option value="15 Days" style={optionItemStyle}>📅 15 Days</option>
                    <option value="1 Month" style={optionItemStyle}>🗓️ 1 Month</option>
                    <option value="2 Months" style={optionItemStyle}>⌛ 2 Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Key Skills (comma separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="Node.js, React, PostgreSQL, Docker, AWS" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Education / Degree</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} className="input-field" placeholder="B.S. Computer Science / Self-taught" />
              </div>
            </div>

            {/* Resume & Cover Letter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                3. Application Links & Cover Letter
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Resume File Name</label>
                  <input type="text" name="resume_file_name" value={formData.resume_file_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Resume URL / LinkedIn</label>
                  <input type="url" name="resume_file_url" value={formData.resume_file_url} onChange={handleChange} className="input-field" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>Cover Letter / Why You're a Great Fit</label>
                <textarea rows="4" name="cover_letter" value={formData.cover_letter} onChange={handleChange} className="input-field" placeholder="Tell us about your background and achievements..." />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', marginTop: '1rem', fontWeight: 700 }}>
              <Send size={20} /> {isSubmitting ? 'Submitting Application...' : 'Submit Job Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
