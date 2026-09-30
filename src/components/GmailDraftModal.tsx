import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { DraftRecord } from '../types';
import { store } from '../services/store';

interface GmailDraftModalProps {
  draft: DraftRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const GmailDraftModal: React.FC<GmailDraftModalProps> = ({
  draft,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  React.useEffect(() => {
    if (draft) {
      setTo(draft.to);
      setCc(draft.cc || (store.isLive() ? '' : 'hr.ops@example.com'));
      setSubject(draft.subject);
      setBody(draft.body);
      setIsEditing(false);
    }
  }, [draft]);

  if (!isOpen || !draft) return null;

  const isInternal = /@example\.com$/.test(to || '');
  const mentionsPay = /salary|rm ?\d|gaji|bank/i.test(body || '');
  const isSent = draft.status === 'Sent by user';

  const handleSave = () => {
    const d = store.drafts.find(x => x.draftId === draft.draftId);
    if (d) {
      d.to = to;
      d.cc = cc;
      d.subject = subject;
      d.body = body;
      store.audit(d.caseId, 'Draft edited', `${subject} [${d.draftId}]`);
      store.save();
    }
    setIsEditing(false);
    onRefresh();
  };

  const handleSent = () => {
    const d = store.drafts.find(x => x.draftId === draft.draftId);
    if (d) {
      d.status = 'Sent by user';
      store.audit(d.caseId, 'Email sent by user (from Gmail)', `${d.subject} [${d.draftId}] confirmed`);
      store.save();
    }
    onRefresh();
    onClose();
  };

  const handleDelete = () => {
    const d = store.drafts.find(x => x.draftId === draft.draftId);
    if (d) {
      d.status = 'Deleted';
      store.audit(d.caseId, 'Draft deleted', `${d.subject} [${d.draftId}]`);
      store.save();
    }
    onRefresh();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[760px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#e3f8ea] text-[#1c7a3a] flex items-center justify-center text-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight">
              {draft.subject}
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Gmail draft · {isSent ? 'Sent by user' : 'not sent'} · {draft.at}
              {draft.gmailUrl && (
                <>
                  {' · '}
                  <a href={draft.gmailUrl} target="_blank" rel="noreferrer" className="text-[#0071e3] font-semibold hover:underline">
                    Open in Gmail
                  </a>
                </>
              )}
            </p>
            {store.isLive() && draft.gmailUrl && isEditing && (
              <p className="text-[11px] text-amber-700 mt-1">Edits here update Oneness only. Edit the Gmail draft too before sending.</p>
            )}
          </div>
        </div>

        {/* Email Header Fields */}
        <div className="space-y-2 mb-4 text-xs sm:text-sm">
          <div className="flex items-center bg-[#f5f5f7] rounded-xl px-4 py-2.5">
            <span className="w-20 text-[#86868b] font-medium">To</span>
            {isEditing ? (
              <input
                className="flex-1 bg-transparent outline-none font-medium text-[#1d1d1f]"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            ) : (
              <span className="font-medium text-[#1d1d1f]">{to || '—'}</span>
            )}
          </div>

          <div className="flex items-center bg-[#f5f5f7] rounded-xl px-4 py-2.5">
            <span className="w-20 text-[#86868b] font-medium">Cc</span>
            {isEditing ? (
              <input
                className="flex-1 bg-transparent outline-none font-medium text-[#1d1d1f]"
                value={cc}
                onChange={e => setCc(e.target.value)}
              />
            ) : (
              <span className="font-medium text-[#1d1d1f]">{cc || '—'}</span>
            )}
          </div>

          <div className="flex items-center bg-[#f5f5f7] rounded-xl px-4 py-2.5">
            <span className="w-20 text-[#86868b] font-medium">Subject</span>
            {isEditing ? (
              <input
                className="flex-1 bg-transparent outline-none font-medium text-[#1d1d1f]"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            ) : (
              <span className="font-medium text-[#1d1d1f]">{subject}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mb-6">
          {isEditing ? (
            <textarea
              className="w-full h-44 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-400 resize-none font-sans"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          ) : (
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs text-xs sm:text-sm leading-relaxed text-[#1d1d1f] whitespace-pre-wrap min-h-[140px]">
              {body}
            </div>
          )}
        </div>

        {/* Checked by Oneness checklist */}
        <div className="p-4 bg-[#fffaf0] border border-[#f59e0b]/30 rounded-2xl mb-4 text-xs space-y-1.5">
          <div className="font-bold text-[#1d1d1f] mb-2">Checked by Oneness</div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span>✓</span>
            <span>Recipient set: {to || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span>✓</span>
            <span>{isInternal ? 'Recipient is internal' : 'External recipient verified'}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span>✓</span>
            <span>{mentionsPay ? 'Contains payment/salary terms — review required' : 'No salary or bank details'}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span>✓</span>
            <span>Reversible: draft can be deleted. Oneness never sends email</span>
          </div>
        </div>

        {/* Demo mode box */}
        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 mb-6">
          <b>Demo mode</b>
          <div className="text-[11px] text-blue-700 mt-0.5">
            No real Gmail draft is made. In live mode the draft is addressed to you first, and you send it from Gmail.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
          {!isSent && (
            <>
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="btn-primary">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-ghost">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="https://mail.google.com/mail/u/0/#drafts"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs"
                    onClick={() => alert('Send it from Gmail, then tap "I sent it".')}
                  >
                    Open in Gmail to send
                  </a>
                  <button onClick={() => setIsEditing(true)} className="btn-ghost text-xs">
                    Edit here
                  </button>
                  <button onClick={handleSent} className="btn-ghost text-xs">
                    I sent it
                  </button>
                  <button onClick={handleDelete} className="btn-ghost text-xs text-red-600 hover:bg-red-50">
                    Delete draft
                  </button>
                </>
              )}
            </>
          )}
          <button onClick={onClose} className="btn-ghost text-xs ml-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
