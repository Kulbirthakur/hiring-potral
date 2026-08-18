import React, { useState } from 'react';
import { X, Zap, Send, CheckCircle, HelpCircle, Code, Server, ArrowRight } from 'lucide-react';

export default function N8nSettingsModal({ n8nUrl, onClose, onSaveUrl }) {
  const [url, setUrl] = useState(n8nUrl || 'http://localhost:5678/webhook/hiring-event');
  const [testResult, setTestResult] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSave = () => {
    onSaveUrl(url);
    setTestResult('Saved n8n Webhook URL!');
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleSendTest = async () => {
    setIsSending(true);
    setTestResult('');
    try {
      // First save URL
      onSaveUrl(url);

      const res = await fetch('/api/n8n/test', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to send test payload.');
      const data = await res.json();

      setTestResult(`✅ Test payload successfully dispatched to n8n at ${url}`);
    } catch (err) {
      setTestResult('⚠️ Could not connect to n8n. Make sure your n8n Webhook node is active.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(236, 72, 153, 0.15)'
            }}>
              <Zap size={24} color="#f472b6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>n8n Workflow Integration</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Connect webpage events directly to your n8n automation pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {testResult && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: testResult.includes('⚠️') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: testResult.includes('⚠️') ? '#f87171' : '#34d399',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            {testResult}
          </div>
        )}

        {/* Form Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              n8n Webhook Target URL
            </label>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:5678/webhook/hiring-event"
              className="input-field"
              style={{ fontFamily: 'monospace' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
              Paste your n8n Webhook Node URL here (Test or Production URL).
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Save Webhook URL
            </button>
            <button onClick={handleSendTest} disabled={isSending} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', borderColor: '#f472b6', color: '#f472b6' }}>
              <Send size={16} /> {isSending ? 'Sending...' : 'Send Test Payload'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'var(--bg-glass)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={16} color="var(--accent-primary)" /> How your n8n workflow connects:
          </h4>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ background: 'var(--accent-primary)', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
              <span><strong>Shared PostgreSQL Database:</strong> Submissions from your n8n hiring form write to table <code style={{ color: '#a5b4fc' }}>job_applications</code> on <code style={{ color: '#a5b4fc' }}>localhost:5432</code>, which automatically show up on this dashboard.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ background: 'var(--accent-primary)', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
              <span><strong>Outgoing Events:</strong> When a candidate applies on this portal or a recruiter changes status (e.g. to <em>Interview Scheduled</em>), a JSON event payload is POSTed to your n8n Webhook URL above.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ background: 'var(--accent-primary)', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
              <span><strong>n8n Trigger Node setup:</strong> In n8n (<code style={{ color: '#a5b4fc' }}>http://localhost:5678</code>), add a <strong>Webhook Trigger</strong> node set to <em>POST</em> HTTP Method.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
