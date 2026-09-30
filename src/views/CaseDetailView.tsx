import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { store, LABELS } from '../services/store';
import { Task } from '../types';

interface CaseDetailViewProps {
  caseId: string;
  onBack: () => void;
  onOpenFolder: (caseId: string) => void;
  onRefresh: () => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseId,
  onBack,
  onOpenFolder,
  onRefresh,
}) => {
  const currentCase = store.cases.find(c => c.caseId === caseId);
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [taskDecisions, setTaskDecisions] = useState<Record<string, string>>({});
  const [showAudit, setShowAudit] = useState(false);

  if (!currentCase) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">Case not found.</p>
        <button onClick={onBack} className="btn-ghost mt-4">
          Back
        </button>
      </div>
    );
  }

  const employee = store.employees.find(e => e.empId === currentCase.empId);
  const tasks = store.decorateTasks(store.tasksOf(caseId));
  const evidenceList = store.evidence.filter(e => e.caseId === caseId);
  const auditList = store.auditLog.filter(a => a.caseId === caseId);

  const handleRunAutoTask = (taskId: string) => {
    const res = store.runTask(caseId, taskId);
    if (!res.ok) {
      alert(res.error || res.note);
    }
    onRefresh();
  };

  const handleCompleteTask = (task: Task) => {
    const note = taskNotes[task.taskId] || '';
    const decision = taskDecisions[task.taskId];
    const res = store.completeTask(caseId, task.taskId, { note, decision });
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setTaskNotes(prev => ({ ...prev, [task.taskId]: '' }));
    onRefresh();
  };

  const handleVerifyCase = () => {
    const res = store.verifyCase(caseId);
    if (!res.ok) {
      alert(`Cannot verify: ${(res.missing || []).join('; ')}`);
      return;
    }
    alert(`Case verified and closed: ${res.outcome}`);
    onRefresh();
  };

  const getStatusBadge = (state?: Task['status']) => {
    switch (state) {
      case 'Completed':
      case 'Verified':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Completed</span>;
      case 'Ready':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">Ready</span>;
      case 'Escalated':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">Escalated</span>;
      default:
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Waiting</span>;
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{LABELS[currentCase.type] || 'Back'}</span>
      </button>

      {/* Case Header */}
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wider text-[#86868b] uppercase mb-1">
          {currentCase.caseId} · {currentCase.status.toUpperCase()}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-1.5">
          {currentCase.title}
        </h1>
        <div className="text-sm text-[#86868b]">
          {currentCase.stage} {currentCase.keyDate ? `· key date ${currentCase.keyDate}` : ''}
        </div>
      </div>

      {/* Exceptions and Blockers */}
      {currentCase.exception && (
        <div className="p-4 rounded-2xl bg-red-50 border-l-4 border-red-500 text-sm text-red-900 mb-4">
          <b>Policy exception.</b> {currentCase.exception}
        </div>
      )}
      {currentCase.blocker && (
        <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-sm text-amber-900 mb-4">
          <b>Waiting.</b> {currentCase.blocker}
        </div>
      )}

      {/* CASE Details Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 space-y-3">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          CASE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Employee</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {employee ? `${employee.name} (${employee.empId})` : currentCase.empId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Position</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {employee ? employee.position : '—'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Reporting to</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {employee ? employee.manager : '—'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Owner</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {currentCase.owner}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Validation</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {currentCase.validation}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5 border-b border-gray-100">
          <span className="sm:col-span-3 text-[#86868b]">Evidence</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {currentCase.evidence}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs sm:text-sm py-1.5">
          <span className="sm:col-span-3 text-[#86868b]">Source</span>
          <span className="sm:col-span-9 font-medium text-[#1d1d1f]">
            {currentCase.source}
          </span>
        </div>
      </div>

      {/* WORK / Tasks Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          WORK
        </h2>

        <div className="space-y-4">
          {tasks.map(t => {
            const isDone = ['Completed', 'Verified'].includes(t.status);
            const isReady = t.ready && !isDone;
            const isEscalated = t.status === 'Escalated';

            return (
              <div
                key={t.taskId}
                className="py-3 border-t border-gray-100 first:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-24 flex-none pt-0.5">
                    {getStatusBadge(t.state)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1d1d1f]">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#86868b] mt-0.5 leading-relaxed">
                      {t.ownerRole} ·{' '}
                      {t.kind === 'auto'
                        ? 'Oneness can handle'
                        : t.kind === 'decision'
                        ? 'your decision'
                        : 'human'}{' '}
                      · due {t.due}
                      {t.waitingOn && t.waitingOn.length > 0 && !isDone && (
                        <span> · waiting on {t.waitingOn.join(', ')}</span>
                      )}
                    </div>

                    {t.note && (
                      <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl mt-2">
                        {t.note}
                      </div>
                    )}

                    {/* Action button: Auto Task */}
                    {isReady && t.kind === 'auto' && !isEscalated && currentCase.status !== 'Closed' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleRunAutoTask(t.taskId)}
                          className="btn-primary text-xs"
                        >
                          Let Oneness do it
                        </button>
                      </div>
                    )}

                    {/* Action input: Human / Decision Task */}
                    {(isReady || isEscalated) && t.canAct && t.kind !== 'auto' && currentCase.status !== 'Closed' && (
                      <div className="mt-3 space-y-2">
                        {t.kind === 'decision' && t.options && (
                          <select
                            className="p-2.5 rounded-xl border border-gray-200 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-blue-400"
                            value={taskDecisions[t.taskId] || ''}
                            onChange={e =>
                              setTaskDecisions(prev => ({
                                ...prev,
                                [t.taskId]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Decide...</option>
                            {t.options.split(';').map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={
                              isEscalated ? 'Override reason (recorded)' : 'Note / evidence'
                            }
                            className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs text-[#1d1d1f] outline-none focus:ring-1 focus:ring-blue-400"
                            value={taskNotes[t.taskId] || ''}
                            onChange={e =>
                              setTaskNotes(prev => ({
                                ...prev,
                                [t.taskId]: e.target.value,
                              }))
                            }
                          />
                          <button
                            onClick={() => handleCompleteTask(t)}
                            className="btn-primary text-xs"
                          >
                            {isEscalated ? 'Override & complete' : 'Done'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome verification banner if awaiting */}
      {currentCase.status === 'Awaiting verification' && (
        <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-base text-[#1d1d1f]">Outcome Ready</div>
            <div className="text-xs text-[#86868b] mt-0.5">
              All tasks are completed. Verify outcome and close case.
            </div>
          </div>
          <button onClick={handleVerifyCase} className="btn-primary text-xs">
            Verify outcome &amp; close
          </button>
        </div>
      )}

      {currentCase.outcome && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-l-4 border-emerald-500 text-sm text-emerald-900 mb-6">
          <b>Outcome verified.</b> {currentCase.outcome}
        </div>
      )}

      {/* FILES & DRAFTS Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">
            FILES &amp; DRAFTS
          </h2>
          <div className="text-xs text-[#86868b] mt-1">
            Associated case documents, checklists and email drafts
          </div>
        </div>
        <button
          onClick={() => onOpenFolder(caseId)}
          className="btn-primary text-xs"
        >
          Open case folder
        </button>
      </div>

      {/* EVIDENCE Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
          EVIDENCE ({evidenceList.length})
        </h2>
        {evidenceList.length === 0 ? (
          <div className="text-xs text-gray-400">None yet.</div>
        ) : (
          <div className="space-y-2">
            {evidenceList.map(ev => (
              <div
                key={ev.evId}
                className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-[#1d1d1f]">{ev.label}</div>
                <div className="text-[#86868b]">
                  {ev.source} · {ev.at}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUDIT LOG Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-10">
        <button
          onClick={() => setShowAudit(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-semibold tracking-[0.16em] text-[#86868b] uppercase cursor-pointer"
        >
          <span>AUDIT LOG ({auditList.length})</span>
          {showAudit ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {showAudit && (
          <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
            {auditList.map(a => (
              <div key={a.auditId} className="flex gap-4 text-xs">
                <span className="w-28 text-gray-400 font-mono flex-none">{a.at}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1d1d1f]">
                    {a.action} · <span className="font-normal text-gray-500">{a.user}</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">{a.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
