import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { SenseResult } from '../types';
import { store } from '../services/store';

interface SenseModalProps {
  senseResult: SenseResult | null;
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (caseId: string) => void;
}

export const SenseModal: React.FC<SenseModalProps> = ({
  senseResult,
  isOpen,
  onClose,
  onCaseCreated,
}) => {
  const [activeStep, setActiveStep] = useState(4); // 0 to 4
  const [showDetails, setShowDetails] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState<{ caseId: string; ownerName: string; code: string } | null>(null);

  // Form overrides
  const [resignationDate, setResignationDate] = useState('');
  const [lwd, setLwd] = useState('');
  const [noticeMonths, setNoticeMonths] = useState('');
  const [reason, setReason] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');

  useEffect(() => {
    if (senseResult) {
      setHandoverSuccess(null);
      setShowDetails(false);
      const s = senseResult.suggested || {};
      setResignationDate(s.resignationDate || '');
      setLwd(s.lwd || '');
      setNoticeMonths(s.noticeMonths != null ? String(s.noticeMonths) : '');
      setReason(s.reason || '');
      setOverrideReason('');
      setSelectedEmpId(senseResult.employeeId || '');

      // Simulate operating loop progression
      setActiveStep(0);
      const t1 = setTimeout(() => setActiveStep(1), 200);
      const t2 = setTimeout(() => setActiveStep(2), 450);
      const t3 = setTimeout(() => setActiveStep(3), 700);
      const t4 = setTimeout(() => setActiveStep(4), 950);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [senseResult]);

  if (!isOpen || !senseResult) return null;

  const loopSteps = ['SENSE', 'IDENTIFY', 'UNDERSTAND', 'CLASSIFY', 'ROUTE'];
  const rt = senseResult.route;
  const isMine = rt?.mine;
  const stopFlags = (senseResult.flags || []).filter(f => f.level === 'stop');
  const warnFlags = (senseResult.flags || []).filter(f => f.level === 'warn');

  const handleConfirm = (isHandover: boolean) => {
    if (!senseResult.event || senseResult.event === 'unknown') return;

    const fieldsPayload: any = senseResult.event === 'resignation'
      ? {
          resignationDate,
          lwd,
          noticeMonths,
          reason,
        }
      : senseResult.suggested || {};

    const res = store.confirmSense(
      {
        type: senseResult.event,
        empId: selectedEmpId || senseResult.employeeId || '',
        fields: fieldsPayload,
        suggested: senseResult.suggested,
        overrideReason,
        source: senseResult.source,
      },
      isHandover
    );

    if (!res.ok) {
      alert(res.error);
      return;
    }

    if (isHandover) {
      setHandoverSuccess({
        caseId: res.caseId!,
        ownerName: rt?.ownerName || 'Owner',
        code: rt?.code || 'HR',
      });
    } else {
      onClose();
      onCaseCreated(res.caseId!);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-white rounded-3xl p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Handover Done View */}
        {handoverSuccess ? (
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Handed over</h3>
                <p className="text-xs text-[#86868b]">Logged in the audit trail</p>
              </div>
            </div>

            {/* Loop Bar */}
            <div className="bg-[#f7f6f4] rounded-2xl p-3.5 mb-5">
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 mb-2">
                CORE OPERATING LOOP
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium">
                {loopSteps.map((step, idx) => (
                  <span
                    key={step}
                    className={`flex-1 text-center py-2 rounded-xl transition-all ${
                      idx === 4 ? 'bg-[#7c3aed] text-white font-semibold shadow-md' : 'text-[#7c3aed]'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fffaf0] border-l-3 border-[#f59e0b] text-sm text-[#1d1d1f] mb-6">
              <b>{handoverSuccess.ownerName} ({handoverSuccess.code}) has been notified.</b>
              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                Case {handoverSuccess.caseId} was created and assigned to them. A Gmail draft was prepared (nothing was sent). The whole handover is recorded in the audit trail.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Normal Sense Result View */
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Universal Sense Engine</h3>
                <p className="text-xs text-[#86868b]">Rule-based today · Alita (Gemini) plugs in here</p>
              </div>
            </div>

            {/* Core Operating Loop */}
            <div className="bg-[#f7f6f4] rounded-2xl p-3.5 mb-5">
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 mb-2">
                CORE OPERATING LOOP
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium">
                {loopSteps.map((step, idx) => {
                  const isCurrent = idx === activeStep;
                  const isDone = idx < activeStep;
                  return (
                    <span
                      key={step}
                      className={`flex-1 text-center py-2 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-[#7c3aed] text-white font-semibold shadow-md scale-102'
                          : isDone
                          ? 'text-[#7c3aed] font-medium'
                          : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Classification banner */}
            <div className="bg-[#f7f6f4] rounded-2xl p-4 text-sm text-[#1d1d1f] mb-3 font-medium">
              <b>{senseResult.eventLabel}</b>
              {senseResult.fields.find(f => f.key === 'employee') && (
                <span> · {senseResult.fields.find(f => f.key === 'employee')?.value}</span>
              )}
              <span className="text-gray-500 font-normal"> · {senseResult.confidence} confidence</span>
              {senseResult.poor && <span className="text-amber-600"> · poor scan</span>}
            </div>

            {/* Route description box */}
            {stopFlags.length > 0 ? (
              <div className="p-4 rounded-2xl bg-red-50 border-l-3 border-red-500 text-sm text-red-900 mb-3">
                <b>Stopped.</b> {stopFlags[0].text}
              </div>
            ) : isMine ? (
              <div className="p-4 rounded-2xl bg-[#faf7ff] border-l-3 border-[#7c3aed] text-sm text-[#1d1d1f] mb-3">
                <b>For your role ({rt?.code}).</b> Oneness will create the case and open the first task for you.
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#fffaf0] border-l-3 border-[#f59e0b] text-sm text-[#1d1d1f] mb-3">
                <b>Belongs to {rt?.code} · {rt?.label}.</b> Oneness will create the case, assign it to {rt?.ownerName}, notify the team and log the handover.
              </div>
            )}

            {/* Warnings list */}
            {warnFlags.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-gray-50 text-xs text-gray-600 space-y-1 mb-4">
                {warnFlags.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{w.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Details accordion */}
            {showDetails && (
              <div className="space-y-4 pt-3 border-t border-gray-100 mb-5 animate-in fade-in duration-150">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Extracted and Checked
                </div>
                <div className="space-y-2">
                  {senseResult.fields.map(f => (
                    <div key={f.key} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 border-b border-gray-100 gap-1">
                      <span className="text-gray-500 w-40">{f.label}</span>
                      <span className="font-medium text-[#1d1d1f] flex-1">{f.value || '—'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold self-start sm:self-auto">
                        {f.state}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Candidate selection if not confirmed */}
                {(!senseResult.employeeId || (senseResult.employeeCandidates || []).length > 1) && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm Employee
                    </label>
                    <select
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
                      value={selectedEmpId}
                      onChange={e => setSelectedEmpId(e.target.value)}
                    >
                      <option value="">Select employee...</option>
                      {(senseResult.employeeCandidates || []).map(cid => {
                        const em = store.employees.find(x => x.empId === cid);
                        return (
                          <option key={cid} value={cid}>
                            {em ? `${em.name} (${cid})` : cid}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Override inputs for Resignation */}
                {senseResult.event === 'resignation' && isMine && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Resignation Date</label>
                      <input
                        type="date"
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                        value={resignationDate}
                        onChange={e => setResignationDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Last Working Day</label>
                      <input
                        type="date"
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                        value={lwd}
                        onChange={e => setLwd(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Reason</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    {senseResult.suggested?.lwd && senseResult.suggested.lwd !== lwd && (
                      <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-red-500 mb-1">Override Reason (Required if LWD changed)</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2 rounded-xl border border-red-200 text-xs focus:ring-1 focus:ring-red-400 outline-none"
                          value={overrideReason}
                          onChange={e => setOverrideReason(e.target.value)}
                          placeholder="e.g. mutually agreed early release"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowDetails(prev => !prev)}
                className="text-xs text-[#86868b] hover:text-[#1d1d1f] underline cursor-pointer"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                >
                  Dismiss
                </button>

                {stopFlags.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="btn-primary"
                  >
                    Review details
                  </button>
                ) : isMine ? (
                  <button
                    type="button"
                    onClick={() => handleConfirm(false)}
                    className="btn-primary"
                  >
                    Create &amp; start case
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirm(true)}
                    className="btn-primary"
                  >
                    Hand over to {rt?.code}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
