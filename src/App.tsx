import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { EmergencyStop } from './components/EmergencyStop';
import { DropOverlay } from './components/DropOverlay';
import { SenseModal } from './components/SenseModal';
import { CommandPalette } from './components/CommandPalette';
import { MenuStyleModal } from './components/MenuStyleModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { GmailDraftModal } from './components/GmailDraftModal';
import { DriveFolderModal } from './components/DriveFolderModal';

import { LandingView } from './views/LandingView';
import { ChooseAccountView } from './views/ChooseAccountView';
import { HomeView } from './views/HomeView';
import { ModulesView } from './views/ModulesView';
import { CasesListView } from './views/CasesListView';
import { CaseDetailView } from './views/CaseDetailView';
import { SenseView } from './views/SenseView';
import { PeopleView } from './views/PeopleView';
import { PersonProfileView } from './views/PersonProfileView';
import { ImproveView } from './views/ImproveView';
import { ProcessDetailView } from './views/ProcessDetailView';
import { InboxView } from './views/InboxView';
import { ControlRoomView } from './views/ControlRoomView';

import { store, LABELS, SideEffect } from './services/store';
import * as google from './services/google';
import { FileRecord, DraftRecord, SenseResult, MenuStyle, User, ModuleType } from './types';

export type SyncStatus = 'saved' | 'saving' | 'error' | 'reauth';

const TEXT_FILE = /\.(txt|eml|csv|md)$/i;

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewArg, setViewArg] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [readingPill, setReadingPill] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [senseResult, setSenseResult] = useState<SenseResult | null>(null);
  const [isSenseModalOpen, setIsSenseModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [previewDraft, setPreviewDraft] = useState<DraftRecord | null>(null);
  const [driveCaseId, setDriveCaseId] = useState<string | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMenuStyleOpen, setIsMenuStyleOpen] = useState(false);

  // Version tick for re-rendering
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const dragCounter = useRef(0);

  // Live (real Google) workspace
  const [isLive, setIsLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const pendingSave = useRef<any>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGoogleError = (e: unknown, what: string) => {
    if (e instanceof google.GoogleAuthExpired) {
      setSyncStatus('reauth');
      showToast('Google session expired. Click Reconnect at the top.');
    } else {
      showToast(`${what} failed: ${(e as Error).message}`);
    }
  };

  const flushSave = async () => {
    const data = pendingSave.current;
    if (!data) return;
    pendingSave.current = null;
    setSyncStatus('saving');
    try {
      await google.saveData(data);
      setSyncStatus(pendingSave.current ? 'saving' : 'saved');
    } catch (e) {
      // Keep the newest snapshot so a reconnect can retry it.
      pendingSave.current = pendingSave.current || data;
      setSyncStatus(e instanceof google.GoogleAuthExpired ? 'reauth' : 'error');
    }
  };

  // Debounced write of the whole workspace to Oneness/oneness-data.json in Drive.
  const queueDriveSave = (data: any) => {
    pendingSave.current = data;
    setSyncStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, 1500);
  };

  // Real Gmail drafts and Calendar events for automatic tasks.
  const runSideEffect = async (e: SideEffect) => {
    if (store.isEmergencyStop()) {
      store.audit('', 'Google action blocked', 'Emergency stop is active', 'Oneness');
      return;
    }
    try {
      if (e.kind === 'draft') {
        const d = store.drafts.find(x => x.draftId === e.draftId);
        if (!d) return;
        const r = await google.createDraft({ to: d.to, cc: d.cc, subject: d.subject, body: d.body });
        d.gmailUrl = r.url;
        store.audit(d.caseId, 'Gmail draft created', `${d.subject} [${d.draftId}] (not sent)`, 'Oneness');
      } else {
        const c = store.cases.find(x => x.caseId === e.caseId);
        const r = await google.createAllDayEvent({
          date: e.date,
          summary: e.summary,
          description: `Oneness case ${e.caseId}${c ? `: ${c.title}` : ''}`,
        });
        store.addEvidence(e.caseId, '', `Calendar event on ${e.date}`, 'Google Calendar', r.link, 'Oneness');
        store.audit(e.caseId, 'Calendar event created', `${e.summary} on ${e.date}`, 'Oneness');
      }
      refresh();
    } catch (err) {
      store.audit(e.kind === 'draft' ? '' : e.caseId, `Google ${e.kind} failed`, (err as Error).message, 'Oneness');
      handleGoogleError(err, e.kind === 'draft' ? 'Gmail draft' : 'Calendar event');
    }
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setSigningIn(true);
    try {
      await google.requestAccess();
      const profile = await google.getProfile();
      google.resetSession();
      const data = await google.loadData();
      store.onLiveSave = queueDriveSave;
      store.onSideEffect = runSideEffect;
      store.startLive(profile, data);
      setIsLive(true);
      setSyncStatus('saved');
      handleNavigate('home');
      showToast(data ? `Signed in as ${profile.email}. Workspace loaded from Drive.` : `Signed in as ${profile.email}. New workspace created in Drive.`);
    } catch (e) {
      google.signOut();
      setSignInError((e as Error).message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleReconnect = async () => {
    try {
      await google.requestAccess({ prompt: '', hint: store.liveEmail });
      setSyncStatus(pendingSave.current ? 'saving' : 'saved');
      await flushSave();
      showToast('Reconnected to Google.');
    } catch (e) {
      showToast(`Reconnect failed: ${(e as Error).message}`);
    }
  };

  const handleSignOut = async () => {
    if (isLive) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await flushSave();
      google.signOut();
      google.resetSession();
      store.startDemo();
      setIsLive(false);
      handleNavigate('landing');
      return;
    }
    handleNavigate('demo');
  };

  // Keyboard shortcut Ctrl/Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSenseModalOpen(false);
        setPreviewFile(null);
        setPreviewDraft(null);
        setDriveCaseId(null);
        setIsStopModalOpen(false);
        setIsPaletteOpen(false);
        setIsMenuStyleOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Drag and Drop listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileProcessing(files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Live: file goes to Drive (Oneness/Inbox) first, then text is read locally or via Drive OCR.
  const senseBlobLive = async (blob: Blob, name: string, extraText = '') => {
    setReadingPill(`Uploading ${name} to Drive...`);
    const f = await google.uploadFile(blob, name, ['Inbox']);
    let text = '';
    if (blob.type.startsWith('text/') || TEXT_FILE.test(name)) {
      text = await blob.text();
    } else {
      setReadingPill(`Reading ${name} (OCR)...`);
      text = await google.extractText(f.id);
    }
    store.audit('', 'File received into Drive', `${name} -> Oneness/Inbox`);
    return { text: [extraText, text].filter(Boolean).join('\n\n'), url: f.webViewLink || '', driveFileId: f.id };
  };

  const openSense = (text: string, name: string, extra?: { url?: string; driveFileId?: string }) => {
    const res = store.sense({ text, name });
    res.source = { name, text, ...extra };
    setSenseResult(res);
    setIsSenseModalOpen(true);
  };

  const handleLiveFile = async (file: File) => {
    if (store.isEmergencyStop()) {
      showToast('Emergency stop is active. Nothing is uploaded.');
      return;
    }
    try {
      const r = await senseBlobLive(file, file.name);
      if (!r.text.trim()) showToast('No readable text found in this file.');
      openSense(r.text, file.name, { url: r.url, driveFileId: r.driveFileId });
    } catch (e) {
      handleGoogleError(e, 'Reading file');
    } finally {
      setReadingPill(null);
    }
  };

  const handleSenseGmail = async (messageId: string) => {
    try {
      setReadingPill('Reading email...');
      const m = await google.getMessage(messageId);
      const mailText = `From: ${m.from}\nDate: ${m.date}\nSubject: ${m.subject}\n\n${m.body}`;
      const att = m.attachments.find(a => /pdf|word|image|text/i.test(a.mimeType));
      if (att) {
        const blob = await google.getAttachment(m.id, att);
        const r = await senseBlobLive(blob, att.filename, mailText);
        openSense(r.text, att.filename, { url: r.url, driveFileId: r.driveFileId });
      } else {
        openSense(mailText, `Email: ${m.subject}`, { url: `https://mail.google.com/mail/u/0/#all/${m.id}` });
      }
      store.audit('', 'Email sensed', `${m.subject} (${m.from})`);
    } catch (e) {
      handleGoogleError(e, 'Reading email');
    } finally {
      setReadingPill(null);
    }
  };

  const handleSenseEvent = (ev: google.CalendarEvent) => {
    const text = `Calendar event: ${ev.summary}\nDate: ${ev.start}\nOrganizer: ${ev.organizer}\n\n${ev.description}`;
    store.audit('', 'Calendar event sensed', `${ev.summary} (${ev.start})`);
    openSense(text, `Event: ${ev.summary}`, { url: ev.link });
  };

  // File processing (TXT, EML, PDF)
  const handleFileProcessing = (file: File) => {
    if (store.isLive()) {
      handleLiveFile(file);
      return;
    }
    setReadingPill(`Reading ${file.name}...`);

    // Match scenario from samples if filename matches
    const matchedSample = store.samples.find(
      s => s.filename.toLowerCase() === file.name.toLowerCase()
    );

    if (matchedSample) {
      setTimeout(() => {
        setReadingPill(null);
        const res = store.sense({ text: matchedSample.text, name: file.name });
        setSenseResult(res);
        setIsSenseModalOpen(true);
      }, 700);
      return;
    }

    if (file.type.startsWith('text/') || /\.(txt|eml|csv|md)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        setReadingPill(null);
        const text = String(reader.result || '');
        const res = store.sense({ text, name: file.name });
        setSenseResult(res);
        setIsSenseModalOpen(true);
      };
      reader.readAsText(file);
    } else {
      // PDF or binary
      setTimeout(() => {
        setReadingPill(null);
        // Fallback sample based on filename or normal
        const res = store.sense({ text: '', name: file.name });
        setSenseResult(res);
        setIsSenseModalOpen(true);
      }, 800);
    }
  };

  const handleSenseText = (text: string, name?: string) => {
    const res = store.sense({ text, name: name || 'pasted text' });
    setSenseResult(res);
    setIsSenseModalOpen(true);
  };

  const handleNavigate = (view: string, arg?: any) => {
    setCurrentView(view);
    setViewArg(arg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAccount = (user: User) => {
    store.setActAs(user.userId);
    refresh();
    handleNavigate('home');
    showToast(`Signed in as ${user.name} (${user.code})`);
  };

  const handleResetDemo = () => {
    if (store.isLive()) {
      showToast('Reset is only for demo data. Your live workspace is untouched.');
      return;
    }
    if (confirm('Reset all demo data back to the starting state?')) {
      store.seedAll();
      refresh();
      showToast('Demo data reset to initial state.');
      handleNavigate('home');
    }
  };

  const unreadCount = store.notifications.filter(
    n => n.toUser === store.activeUserId && n.read === 'no'
  ).length;

  return (
    <div className="relative min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 pb-20 sm:pb-12">
      {/* Background soft atmospheric glow */}
      <div className="wave" />

      {/* Top bar (only shown when authenticated, scrolls away with page) */}
      {currentView !== 'landing' && currentView !== 'demo' && (
        <TopBar
          onLogoClick={() => handleNavigate('home')}
          live={isLive ? { email: store.liveEmail, status: syncStatus, onReconnect: handleReconnect } : undefined}
        />
      )}

      {/* Main View Router */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <LandingView
            onSignIn={handleGoogleSignIn}
            onDemo={() => handleNavigate('demo')}
            googleConfigured={google.isConfigured()}
            signingIn={signingIn}
            signInError={signInError}
            onNavigateNav={v => handleNavigate(v)}
          />
        )}

        {currentView === 'demo' && (
          <ChooseAccountView
            onSelectAccount={handleSelectAccount}
            onBack={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenDraft={d => setPreviewDraft(d)}
            onOpenActivityDetail={a => {
              alert(`${a.action}\n\n${a.detail}\n\nUser: ${a.user}\nTime: ${a.at}`);
            }}
          />
        )}

        {currentView === 'modules' && (
          <ModulesView
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'list' && (
          <CasesListView
            arg={viewArg || 'all'}
            onNavigate={handleNavigate}
            onSelectCase={cid => handleNavigate('case', cid)}
          />
        )}

        {currentView === 'case' && (
          <CaseDetailView
            caseId={viewArg || store.cases[0]?.caseId}
            onBack={() => handleNavigate('list', 'all')}
            onOpenFolder={cid => setDriveCaseId(cid)}
            onRefresh={refresh}
          />
        )}

        {currentView === 'sense' && (
          <SenseView
            onBack={() => handleNavigate('home')}
            onSenseFile={handleFileProcessing}
            onSenseText={handleSenseText}
            live={isLive ? { onSenseGmail: handleSenseGmail, onSenseEvent: handleSenseEvent, onError: e => handleGoogleError(e, 'Google') } : undefined}
          />
        )}

        {currentView === 'people' && (
          <PeopleView
            onSelectPerson={empId => handleNavigate('person', empId)}
            onImported={msg => {
              showToast(msg);
              refresh();
            }}
          />
        )}

        {currentView === 'person' && (
          <PersonProfileView
            empId={viewArg || store.employees[0]?.empId}
            onBack={() => handleNavigate('people')}
            onOpenCase={cid => handleNavigate('case', cid)}
            onOpenFile={f => setPreviewFile(f)}
            onOpenDraft={d => setPreviewDraft(d)}
            onDraftEmail={empId => {
              const draftId = store.createCase('salaryletter', empId);
              showToast('Created email draft in Documents.');
              refresh();
            }}
          />
        )}

        {currentView === 'improve' && (
          <ImproveView
            onBack={() => handleNavigate('home')}
            onOpenProcess={type => handleNavigate('process', type)}
            onRefresh={refresh}
          />
        )}

        {currentView === 'process' && (
          <ProcessDetailView
            type={(viewArg as ModuleType) || 'resignation'}
            onBack={() => handleNavigate('improve')}
            onRefresh={refresh}
          />
        )}

        {currentView === 'inbox' && (
          <InboxView
            onBack={() => handleNavigate('home')}
            onOpenCase={cid => handleNavigate('case', cid)}
            onRefresh={refresh}
          />
        )}

        {currentView === 'control' && (
          <ControlRoomView
            onBack={() => handleNavigate('home')}
            onOpenEmergencyStop={() => setIsStopModalOpen(true)}
            onRefresh={refresh}
          />
        )}
      </main>

      {/* Navigation (Multi-Style, hidden by default, pops up on edge hover or menu) */}
      {currentView !== 'landing' && currentView !== 'demo' && (
        <Navigation
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenPalette={() => setIsPaletteOpen(true)}
          onOpenMenuStyle={() => setIsMenuStyleOpen(true)}
          onOpenEmergencyStop={() => setIsStopModalOpen(true)}
          onResetDemo={handleResetDemo}
          onSignOut={handleSignOut}
          unreadInboxCount={unreadCount}
        />
      )}

      {/* Emergency Stop & Watchdog System */}
      <EmergencyStop
        isStopModalOpen={isStopModalOpen}
        onCloseStopModal={() => setIsStopModalOpen(false)}
        onOpenControlRoom={() => handleNavigate('control')}
        onStatusChange={refresh}
      />

      {/* Drag & Drop Fullscreen Overlay */}
      <DropOverlay isDragging={isDragging} />

      {/* Universal Sense Engine Modal */}
      <SenseModal
        senseResult={senseResult}
        isOpen={isSenseModalOpen}
        onClose={() => setIsSenseModalOpen(false)}
        onCaseCreated={cid => {
          handleNavigate('case', cid);
          showToast(`Case ${cid} created.`);
          refresh();
          // Live: file the source document under Oneness/HR/<Module>/<Employee>.
          const driveFileId = senseResult?.source?.driveFileId;
          const c = store.cases.find(x => x.caseId === cid);
          if (store.isLive() && driveFileId && c) {
            const emp = store.employees.find(e => e.empId === c.empId);
            const folder = ['HR', LABELS[c.type] || c.type, emp ? `${emp.name} (${emp.empId})` : c.empId];
            google
              .moveFile(driveFileId, folder)
              .then(() => store.audit(cid, 'Source filed in Drive', `Oneness/${folder.join('/')}`, 'Oneness'))
              .catch(e => handleGoogleError(e, 'Filing to Drive'));
          }
        }}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onOpenCase={cid => handleNavigate('case', cid)}
        onOpenFolder={cid => setDriveCaseId(cid)}
      />

      {/* Gmail Draft Modal */}
      <GmailDraftModal
        draft={previewDraft}
        isOpen={!!previewDraft}
        onClose={() => setPreviewDraft(null)}
        onRefresh={refresh}
      />

      {/* Drive Case Folder Modal */}
      <DriveFolderModal
        caseId={driveCaseId}
        isOpen={!!driveCaseId}
        onClose={() => setDriveCaseId(null)}
        onOpenFile={f => setPreviewFile(f)}
        onOpenDraft={d => setPreviewDraft(d)}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenMenuStyle={() => setIsMenuStyleOpen(true)}
        onOpenEmergencyStop={() => setIsStopModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Menu Style Settings Modal */}
      <MenuStyleModal
        isOpen={isMenuStyleOpen}
        onClose={() => setIsMenuStyleOpen(false)}
        currentStyle={store.menuStyle}
        onSelectStyle={style => {
          store.menuStyle = style;
          refresh();
          showToast(`Menu style set to ${style}.`);
        }}
      />

      {/* Reading File Pill (Screenshots 27 & 28) */}
      {readingPill && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-medium shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {readingPill}
        </div>
      )}

      {/* Bottom Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-5 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs sm:text-sm font-medium shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
