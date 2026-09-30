import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface LandingViewProps {
  onSignIn: () => void;
  onDemo: () => void;
  googleConfigured: boolean;
  signingIn: boolean;
  signInError: string | null;
  onNavigateNav: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSignIn,
  onDemo,
  googleConfigured,
  signingIn,
  signInError,
  onNavigateNav,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#fbfbfd] text-[#1d1d1f] overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="h-12 w-full flex items-center justify-between sm:justify-center gap-6 sm:gap-9 px-6 border-b border-[#e8e8ed] text-xs sm:text-[13px] text-[#424245] bg-[#fbfbfd]/90 backdrop-blur-md z-20">
        <span className="font-bold text-base text-[#1d1d1f] tracking-tight mr-2 sm:mr-4">
          Oneness
        </span>
        <div className="hidden sm:flex items-center gap-8">
          <button onClick={() => onNavigateNav('home')} className="hover:text-[#0071e3] transition-colors cursor-pointer">
            Home
          </button>
          <button onClick={() => onNavigateNav('modules')} className="hover:text-[#0071e3] transition-colors cursor-pointer">
            Modules
          </button>
          <button onClick={() => onNavigateNav('sense')} className="hover:text-[#0071e3] transition-colors cursor-pointer">
            Sense
          </button>
          <button onClick={() => onNavigateNav('improve')} className="hover:text-[#0071e3] transition-colors cursor-pointer">
            Improve
          </button>
          <button onClick={() => onNavigateNav('control')} className="hover:text-[#0071e3] transition-colors cursor-pointer">
            Control room
          </button>
        </div>
        <button
          onClick={onDemo}
          className="hover:text-[#0071e3] font-medium transition-colors cursor-pointer ml-auto sm:ml-0"
        >
          Demo login
        </button>
      </nav>

      {/* Main Hero Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-10 z-10">
        <div className="text-xs sm:text-[13px] font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          PEOPLE · PROCESS · AI · AS ONE
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-[76px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-5">
          HR work, <span className="grad">handled.</span>
          <br />
          You decide.
        </h1>

        <p className="text-lg sm:text-xl lg:text-[22px] font-normal text-[#6e6e73] max-w-[740px] leading-snug mb-9">
          Oneness sits around Ramco. It reads what arrives, routes it to the right owner, does the routine steps, and asks you only for decisions.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          <button
            onClick={onSignIn}
            disabled={!googleConfigured || signingIn}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0071e3] text-white text-base font-semibold shadow-md hover:bg-blue-600 transition-all hover:scale-102 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="font-bold text-lg">G</span>
            <span>{signingIn ? 'Signing in…' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={onDemo}
            className="px-7 py-3.5 rounded-full bg-white text-[#0071e3] border border-[#d2d2d7] text-base font-semibold hover:bg-gray-50 transition-all hover:scale-102 cursor-pointer"
          >
            Try demo accounts &rsaquo;
          </button>
        </div>

        <div className="text-xs text-[#86868b] max-w-[560px] mb-10 min-h-[1rem]">
          {signInError ? (
            <span className="text-[#ff3b30]">{signInError}</span>
          ) : !googleConfigured ? (
            'Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID to enable it. Demo accounts still work.'
          ) : (
            <>
              Google sign-in uses your real Drive, Gmail and Calendar. Demo accounts use synthetic data only.{' '}
              <button onClick={() => setShowHowItWorks(true)} className="text-[#0071e3] hover:underline cursor-pointer">
                How it works
              </button>
            </>
          )}
        </div>

        {/* 4 Feature Strip Cards */}
        <div className="w-full max-w-[1140px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-6 bg-white/90 backdrop-blur-md border border-[#e8e8ed] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase">
              SENSE
            </span>
            <h3 className="text-xl font-bold text-[#1d1d1f] mt-1.5 mb-1">
              Drop any file
            </h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Mine? Case starts. Someone else's? Handed over, notified, logged.
            </p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md border border-[#e8e8ed] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase">
              PROCESS
            </span>
            <h3 className="text-xl font-bold text-[#1d1d1f] mt-1.5 mb-1">
              Every role, one flow
            </h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              HR A to F, managers and HODs see only what is theirs.
            </p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md border border-[#e8e8ed] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase">
              IMPROVE
            </span>
            <h3 className="text-xl font-bold text-[#1d1d1f] mt-1.5 mb-1">
              Change with approval
            </h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Propose, approve, shadow test, then live.
            </p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md border border-[#e8e8ed] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase">
              GOVERN
            </span>
            <h3 className="text-xl font-bold text-[#1d1d1f] mt-1.5 mb-1">
              Audit + Emergency stop
            </h3>
            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Every action logged. One button stops everything.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Status Strip */}
      <footer className="h-12 w-full flex items-center justify-center gap-6 text-xs text-[#6e6e73] border-t border-[#e8e8ed] bg-[#fbfbfd]/90 backdrop-blur-sm z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#30d158]" />
          <span>Google Workspace {googleConfigured ? 'ready' : 'not configured'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#30d158]" />
          <span>Watchdog ready</span>
        </div>
        <span className="hidden sm:inline">Demo accounts use dummy data only</span>
      </footer>

      {/* How it works modal */}
      {showHowItWorks && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowHowItWorks(false)}
        >
          <div
            className="w-full max-w-[580px] bg-white rounded-3xl p-7 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">How Oneness works</h3>
                <p className="text-xs text-[#86868b]">Four steps, every role</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm text-[#1d1d1f]">
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <b>1. Drop a file.</b> Sense reads it and works out what happened and who owns it.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <b>2. Route.</b> Yours: a case starts. Someone else's: handed over, notified, logged.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <b>3. Do.</b> Oneness does routine steps (drafts, calendar, checks). You decide the rest.
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <b>4. Govern.</b> Everything is audited. Watchdog watches. Emergency stop halts all.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="btn-primary"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
