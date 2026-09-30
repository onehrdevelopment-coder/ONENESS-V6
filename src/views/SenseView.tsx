import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, Mail, CalendarDays, RefreshCw } from 'lucide-react';
import { store } from '../services/store';
import * as google from '../services/google';
import { SampleDoc } from '../types';

interface SenseViewProps {
  onBack: () => void;
  onSenseFile: (file: File) => void;
  onSenseText: (text: string, name?: string) => void;
  live?: {
    onSenseGmail: (messageId: string) => void;
    onSenseEvent: (ev: google.CalendarEvent) => void;
    onError: (e: unknown) => void;
  };
}

const DEFAULT_GMAIL_QUERY = 'in:inbox newer_than:14d';

const GoogleInputs: React.FC<{ live: NonNullable<SenseViewProps['live']> }> = ({ live }) => {
  const [tab, setTab] = useState<'gmail' | 'calendar'>('gmail');
  const [query, setQuery] = useState(DEFAULT_GMAIL_QUERY);
  const [mails, setMails] = useState<google.MailSummary[] | null>(null);
  const [events, setEvents] = useState<google.CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (which: 'gmail' | 'calendar') => {
    setLoading(true);
    try {
      if (which === 'gmail') setMails(await google.listMessages(query.trim() || DEFAULT_GMAIL_QUERY));
      else setEvents(await google.listUpcomingEvents(14));
    } catch (e) {
      live.onError(e);
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (id: 'gmail' | 'calendar', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        setTab(id);
        if (id === 'gmail' ? !mails : !events) load(id);
      }}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
        tab === id ? 'bg-[#1d1d1f] text-white' : 'bg-gray-100 text-[#1d1d1f] hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const rowCls =
    'p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md transition-all group';

  return (
    <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">FROM GOOGLE WORKSPACE</h2>
        <div className="flex gap-2">
          {tabBtn('gmail', 'Gmail', <Mail className="w-3.5 h-3.5" />)}
          {tabBtn('calendar', 'Calendar', <CalendarDays className="w-3.5 h-3.5" />)}
        </div>
      </div>

      {tab === 'gmail' && (
        <form
          className="flex gap-2 mb-3"
          onSubmit={e => {
            e.preventDefault();
            load('gmail');
          }}
        >
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 rounded-full border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            placeholder="Gmail search, e.g. label:hr newer_than:7d has:attachment"
          />
          <button type="submit" className="btn-ghost" disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      )}

      {loading && <div className="text-xs text-[#86868b] py-3">Loading…</div>}

      {!loading && tab === 'gmail' && (
        <div className="space-y-2">
          {!mails && (
            <button onClick={() => load('gmail')} className="btn-ghost">
              Load inbox
            </button>
          )}
          {mails?.length === 0 && <div className="text-xs text-[#86868b]">No emails match this search.</div>}
          {mails?.map(m => (
            <div key={m.id} className={rowCls} onClick={() => live.onSenseGmail(m.id)}>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600">{m.subject}</div>
                <div className="text-xs text-[#86868b] truncate mt-0.5">
                  {m.from} · {m.snippet}
                </div>
              </div>
              <span className="text-[11px] text-[#86868b] flex-none">{m.date.replace(/:\d\d [+-]\d{4}.*$/, '')}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'calendar' && (
        <div className="space-y-2">
          {events?.length === 0 && <div className="text-xs text-[#86868b]">No events in the next 14 days.</div>}
          {events?.map(ev => (
            <div key={ev.id} className={rowCls} onClick={() => live.onSenseEvent(ev)}>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600">{ev.summary}</div>
                <div className="text-xs text-[#86868b] truncate mt-0.5">
                  {ev.organizer} {ev.description ? `· ${ev.description}` : ''}
                </div>
              </div>
              <span className="text-[11px] text-[#86868b] flex-none">{ev.start.slice(0, 16).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-[#86868b] mt-4">
        Click an item to Sense it. Email attachments (PDF, Word, images) are saved to Drive and read with OCR. Nothing is created until you confirm.
      </div>
    </div>
  );
};

export const SenseView: React.FC<SenseViewProps> = ({
  onBack,
  onSenseFile,
  onSenseText,
  live,
}) => {
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const samples = store.samples;

  const handleSampleClick = (s: SampleDoc) => {
    setPastedText(s.text);
    onSenseText(s.text, s.filename);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSenseFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">
        Sense
      </h1>
      <p className="text-sm text-[#86868b] mb-8 leading-relaxed max-w-2xl">
        Drop a file anywhere on the screen, paste text, or try a test scenario. Oneness shows what it thinks happened before creating anything.
      </p>

      {/* Drop / Choose File Card */}
      <div className="p-8 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs text-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={live ? '.pdf,.txt,.eml,.csv,.md,.doc,.docx,.png,.jpg,.jpeg' : '.pdf,.txt,.eml,.csv,.md'}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-lg sm:text-xl font-bold text-[#1d1d1f] mb-3">
          Drop a PDF anywhere, or
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary mb-3"
        >
          <Upload className="w-4 h-4 mr-1" />
          Choose a file
        </button>
        <div className="text-xs text-[#86868b]">
          {live
            ? 'PDF, Word, scans/images, TXT or EML. Saved to your Drive (Oneness/Inbox), scans read with Google OCR.'
            : 'PDF (with text), TXT or EML. Scanned images need OCR (later).'}
        </div>
      </div>

      {live && <GoogleInputs live={live} />}

      {/* Paste Text Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-8">
        <textarea
          rows={5}
          className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-blue-400 font-sans resize-none mb-3"
          placeholder="Or paste the document text here..."
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={() => onSenseText(pastedText, 'pasted text')}
            disabled={!pastedText.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Sense this
          </button>
        </div>
      </div>

      {/* Test scenarios (25 samples) */}
      {samples.length > 0 && (
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          TEST SCENARIOS (SYNTHETIC)
        </h2>

        <div className="space-y-2">
          {samples.map(s => (
            <div
              key={s.id}
              onClick={() => handleSampleClick(s)}
              className="p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600 transition-colors">
                  {s.id}: {s.label}
                </div>
                <div className="text-xs text-[#86868b] truncate mt-0.5 font-mono">
                  {s.filename}
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium flex-none">
                {s.scenario}
              </span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};
