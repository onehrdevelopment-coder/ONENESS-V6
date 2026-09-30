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

import { store } from './services/store';
import { FileRecord, DraftRecord, SenseResult, MenuStyle, User, ModuleType } from './types';

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

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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

  // File processing (TXT, EML, PDF)
  const handleFileProcessing = (file: File) => {
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
      {currentView !== 'landing' && currentView !== 'login' && (
        <TopBar onLogoClick={() => handleNavigate('home')} />
      )}

      {/* Main View Router */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <LandingView
            onSignIn={() => handleNavigate('login')}
            onNavigateNav={v => handleNavigate(v)}
          />
        )}

        {currentView === 'login' && (
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
          />
        )}

        {currentView === 'people' && (
          <PeopleView
            onSelectPerson={empId => handleNavigate('person', empId)}
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
      {currentView !== 'landing' && currentView !== 'login' && (
        <Navigation
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenPalette={() => setIsPaletteOpen(true)}
          onOpenMenuStyle={() => setIsMenuStyleOpen(true)}
          onOpenEmergencyStop={() => setIsStopModalOpen(true)}
          onResetDemo={handleResetDemo}
          onSignOut={() => handleNavigate('login')}
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
