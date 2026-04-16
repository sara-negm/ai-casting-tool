import { useEffect, useState } from 'react';
import type { Talent } from '../types';
import { Check, X } from 'lucide-react';

interface Props {
  recipients: Talent[];
  onClose: () => void;
  onSent: () => void;
}

export default function ContactModal({ recipients, onClose, onSent }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onSent();
      }, 900);
    }, 500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Contact creators</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="modal-recipients">
          <p className="modal-label">To</p>
          <div className="recipient-chips">
            {recipients.map(r => (
              <span key={r.id} className="recipient-chip">{r.name} <span className="recipient-handle">{r.handle}</span></span>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor="contact-subject" className="modal-label">Subject</label>
          <input
            id="contact-subject"
            type="text"
            placeholder="Collab opportunity with [Brand]"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={sending || sent}
          />
        </div>

        <div className="modal-field">
          <label htmlFor="contact-message" className="modal-label">Message</label>
          <textarea
            id="contact-message"
            rows={6}
            placeholder="Hi! We'd love to work with you on…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending || sent}
          />
        </div>

        <div className="modal-footer">
          {sent ? (
            <p className="modal-success"><Check size={14} /> Message sent to {recipients.length} creator{recipients.length === 1 ? '' : 's'}</p>
          ) : (
            <>
              <button className="modal-cancel" onClick={onClose} disabled={sending}>Cancel</button>
              <button
                className="modal-send"
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
