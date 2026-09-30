import React, { useState, useEffect } from 'react';
import { Power, AlertTriangle, X } from 'lucide-react';
import { store } from '../services/store';

interface EmergencyStopProps {
  isStopModalOpen: boolean;
  onCloseStopModal: () => void;
  onOpenControlRoom: () => void;
  onStatusChange: () => void;
}

export const EmergencyStop: React.FC<EmergencyStopProps> = ({
  isStopModalOpen,
  onCloseStopModal,
  onOpenControlRoom,
  onStatusChange,
}) => {
  const [isHoveredCorner, setIsHoveredCorner] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [resumeReason, setResumeReason] = useState('');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [watchdogTrippedMessage, setWatchdogTrippedMessage] = useState<string | null>(null);

  const currentUser = store.currentUser();
  const isEstop = store.isEmergencyStop();
  const estopReason = store.getSys('estop_reason');
  const estopBy = store.getSys('estop_by');
  const canResume = ['HOD', 'Admin'].includes(currentUser.level);

  // Bottom-right corner hover detection (260x150px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const inCorner = e.clientX > W - 260 && e.clientY > H - 150;
      setIsHoveredCorner(inCorner);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic watchdog check
  useEffect(() => {
    const check = () => {
      const w = store.runWatchdog();
      if (w.worst === 'critical' && store.isEmergencyStop()) {
        const crit = w.checks.find(c => c.level === 'critical');
        if (crit && !watchdogTrippedMessage) {
          setWatchdogTrippedMessage(`${crit.label}: ${crit.detail}`);
        }
      }
      onStatusChange();
    };

    check();
    const iv = setInterval(check, 8000);
    return () => clearInterval(iv);
  }, [onStatusChange, watchdogTrippedMessage]);

  const handleStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopReason.trim()) return;
    store.emergencyStop(stopReason, currentUser.name);
    setStopReason('');
    onCloseStopModal();
    onStatusChange();
  };

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeReason.trim()) return;
    store.resumeSystem(resumeReason);
    setResumeReason('');
    setIsResumeModalOpen(false);
    setWatchdogTrippedMessage(null);
    onStatusChange();
  };

  return (
    <>
      {/* Red Banner across top when Emergency Stop is Active */}
      {isEstop && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#ff3b30] text-white px-5 py-2.5 flex items-center justify-center gap-3 text-sm font-medium shadow-md">
          <span>
            <b>EMERGENCY STOP</b> · all automation halted · {estopReason || 'Manual halt'}
          </span>
          {canResume ? (
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="px-3 py-1 rounded-full border border-white/70 hover:bg-white hover:text-[#ff3b30] text-xs font-semibold transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onOpenControlRoom}
              className="px-3 py-1 rounded-full border border-white/70 hover:bg-white hover:text-[#ff3b30] text-xs font-semibold transition-colors"
            >
              Details
            </button>
          )}
        </div>
      )}

      {/* Hidden button: bottom-right corner hover zone */}
      {!isEstop && (
        <div
          className={`fixed right-6 bottom-6 z-40 transition-all duration-300 ${
            isHoveredCorner ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
          } hidden md:block`}
        >
          <button
            onClick={() => onCloseStopModal()} // Toggle via parent
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#ff3b30] border border-red-200/80 shadow-xl hover:bg-red-50 text-xs font-semibold transition-all hover:scale-105"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Emergency stop</span>
          </button>
        </div>
      )}

      {/* Emergency Stop Dialog */}
      {isStopModalOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={onCloseStopModal}
        >
          <div
            className="w-full max-w-[540px] bg-white rounded-3xl p-7 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onCloseStopModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Emergency stop</h3>
                <p className="text-xs text-[#86868b]">Halts all automation and all changes</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border-l-4 border-red-500 text-xs leading-relaxed text-[#1d1d1f] mb-4">
              Everything stops: automated tasks, Google actions, case creation, handovers and approvals. You can still read. Only a HOD or Admin can resume.
            </div>

            <form onSubmit={handleStopSubmit}>
              <textarea
                required
                className="w-full h-24 p-3.5 rounded-2xl border border-[#e8e8ed] text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-red-400 mb-5 resize-none"
                placeholder="What is going wrong? (required, recorded in audit)"
                value={stopReason}
                onChange={e => setStopReason(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseStopModal}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                >
                  Stop everything
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {isResumeModalOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsResumeModalOpen(false)}
        >
          <div
            className="w-full max-w-[540px] bg-white rounded-3xl p-7 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsResumeModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Resume system</h3>
                <p className="text-xs text-[#86868b]">HOD / Admin only</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 text-xs leading-relaxed text-[#1d1d1f] mb-4">
              Confirm the cause has been understood and it is safe before resuming. All watchdog failure counters will be reset.
            </div>

            <form onSubmit={handleResumeSubmit}>
              <textarea
                required
                className="w-full h-24 p-3.5 rounded-2xl border border-[#e8e8ed] text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-400 mb-5 resize-none"
                placeholder="Why is it safe to resume? (required, recorded in audit)"
                value={resumeReason}
                onChange={e => setResumeReason(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Watchdog Tripped Full-Screen Overlay (screenshot 25) */}
      {watchdogTrippedMessage && (
        <div className="fixed inset-0 z-[60] bg-radial from-[#4a1c1a] via-[#241315] to-[#120a0b] text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-4xl font-bold shadow-[0_0_80px_rgba(255,59,48,0.6)] mb-8">
            !
          </div>

          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            Watchdog stopped everything.
          </h1>

          <p className="text-lg text-white/80 max-w-lg mb-2">
            {watchdogTrippedMessage}
          </p>

          <p className="text-sm text-white/50 mb-8">
            No further actions will run until a HOD or Admin resumes.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setWatchdogTrippedMessage(null);
                onOpenControlRoom();
              }}
              className="px-6 py-3 rounded-full bg-white text-[#1d1d1f] font-medium text-sm hover:scale-105 transition-transform"
            >
              Open control room
            </button>
            <button
              onClick={() => setWatchdogTrippedMessage(null)}
              className="px-6 py-3 rounded-full border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};
