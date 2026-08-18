import React, { useState } from 'react';
import { Copy, Check, X, Link as LinkIcon, ShieldCheck, Mail, Send, ExternalLink, Key } from 'lucide-react';

export default function LinkGeneratorModal({ isOpen, onClose, linkType = 'single', generatedLink = '' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Please submit your job application using this official link: ' + generatedLink)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent('Job Application Link - Join Our Team')}&body=${encodeURIComponent('Hello,\n\nPlease fill out your job application using the following single-use link:\n\n' + generatedLink + '\n\nNote: This link will expire after one submission.\n\nBest regards,\nHR Recruitment Team')}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        maxWidth: '550px', width: '100%', borderRadius: 'var(--radius-lg)',
        padding: '2rem', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: linkType === 'single' ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {linkType === 'single' ? <Key size={22} color="#fff" /> : <LinkIcon size={22} color="#fff" />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {linkType === 'single' ? 'Single-Use 1-Time Candidate Link' : 'Public Candidate Portal Link'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {linkType === 'single' ? 'This link will automatically expire once submitted.' : 'Reusable application portal link for candidate postings.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.35rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Link Box */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Generated Application URL:
          </label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#0f172a', border: '1px solid #6366f1', borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem', overflow: 'hidden'
          }}>
            <input 
              type="text" 
              readOnly 
              value={generatedLink} 
              style={{
                flex: 1, background: 'transparent', border: 'none', color: '#60a5fa',
                fontWeight: 600, fontSize: '0.9rem', outline: 'none', textOverflow: 'ellipsis'
              }}
            />
            <button 
              onClick={handleCopy}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div style={{
          padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#a5b4fc'
        }}>
          <ShieldCheck size={20} color="#818cf8" style={{ flexShrink: 0 }} />
          <span>
            {linkType === 'single' 
              ? '🔒 Candidate security enabled: Once the applicant fills out this form, the link locks out permanently.' 
              : '👥 Standard portal link: Candidates can use this link on your Wi-Fi or office network.'}
          </span>
        </div>

        {/* Action Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <a 
            href={whatsappShareUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary"
            style={{ justifyContent: 'center', borderColor: '#25D366', color: '#25D366', textDecoration: 'none', fontWeight: 700 }}
          >
            <Send size={16} /> Share via WhatsApp
          </a>
          <a 
            href={emailShareUrl} 
            className="btn-secondary"
            style={{ justifyContent: 'center', borderColor: '#3b82f6', color: '#60a5fa', textDecoration: 'none', fontWeight: 700 }}
          >
            <Mail size={16} /> Send via Email
          </a>
        </div>
      </div>
    </div>
  );
}
