import React, { useState } from 'react';
import { ArrowLeft, Search, Download, AlertTriangle, ShieldCheck, Play } from 'lucide-react';
import { store } from '../services/store';

interface ControlRoomViewProps {
  onBack: () => void;
  onOpenEmergencyStop: () => void;
  onRefresh: () => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  onBack,
  onOpenEmergencyStop,
  onRefresh,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [showSimMenu, setShowSimMenu] = useState(false);

  const currentUser = store.currentUser();
  const isEstop = store.isEmergencyStop();
  const estopReason = store.getSys('estop_reason');
  const estopBy = store.getSys('estop_by');
  const estopAt = store.getSys('estop_at') || '2026-09-30 10:00';
  const canResume = ['HOD', 'Admin'].includes(currentUser.level);

  const watchdogRes = store.watchdog();
  const auditList = store.auditLog;

  const filteredAudit = auditList.filter(a => {
    const q = filterQuery.toLowerCase();
    return (
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      a.detail.toLowerCase().includes(q) ||
      a.caseId.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = 'When,Who,Case,Action,Detail\n';
    const rows = filteredAudit.map(a =>
      `"${a.at}","${a.user}","${a.caseId}","${a.action}","${a.detail.replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oneness_audit_${Date.now()}.csv`;
    link.click();
  };

  const handleSimulate = (kind: 'gmail' | 'runaway' | 'corrupt') => {
    store.simulateFailure(kind);
    onRefresh();
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

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-1.5">
        Control room
      </h1>
      <div className="text-sm text-[#86868b] mb-8">
        Governance, health and the full audit trail.
      </div>

      {/* SYSTEM Status Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          SYSTEM
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-none ${
                isEstop ? 'bg-[#ff3b30] animate-pulse' : 'bg-[#30d158]'
              }`}
            />
            <div>
              <div className="font-bold text-sm text-[#1d1d1f]">
                {isEstop ? 'EMERGENCY STOP active' : 'System running normally'}
              </div>
              <div className="text-xs text-[#86868b] mt-0.5">
                {isEstop
                  ? `${estopReason || 'Manual halt'} · by ${estopBy || currentUser.name} · ${estopAt}`
                  : 'All automation and changes are permitted within governance rules.'}
              </div>
            </div>
          </div>

          <div>
            {isEstop ? (
              canResume ? (
                <button
                  onClick={() => {
                    const reason = prompt('Why is it safe to resume?');
                    if (reason) {
                      store.resumeSystem(reason);
                      onRefresh();
                    }
                  }}
                  className="btn-primary text-xs"
                >
                  Resume...
                </button>
              ) : (
                <span className="text-xs text-[#86868b] italic">
                  Only HOD or Admin can resume
                </span>
              )
            ) : (
              <button
                onClick={onOpenEmergencyStop}
                className="btn-danger text-xs"
              >
                Emergency stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WATCHDOG Status Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 space-y-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">
          WATCHDOG · {watchdogRes.worst === 'ok' ? 'ALL HEALTHY' : 'NEEDS A LOOK'}
        </h2>

        <div className="divide-y divide-gray-100">
          {watchdogRes.checks.map(c => (
            <div key={c.id} className="py-2.5 flex items-start gap-3 first:pt-0">
              <span
                className={`w-2.5 h-2.5 rounded-full mt-1 flex-none ${
                  c.level === 'critical'
                    ? 'bg-[#ff3b30] animate-pulse'
                    : c.level === 'warn'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#30d158]'
                }`}
              />
              <div className="min-w-0">
                <div className="font-semibold text-xs sm:text-sm text-[#1d1d1f]">
                  {c.label}
                </div>
                <div className="text-xs text-[#86868b] mt-0.5">
                  {c.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-[#86868b] pt-2 border-t border-gray-100">
          Runs on every screen load and, in production, every 5 minutes. A critical result stops the system automatically.
        </div>
      </div>

      {/* GOVERNANCE RULES Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 space-y-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">
          GOVERNANCE RULES
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-[#86868b]">
          <div>
            <div className="font-bold text-[#1d1d1f]">Oneness may do alone</div>
            <div>
              Rule-based checks (leave balance, claim cap, learning budget), classify and route documents, create Gmail drafts to yourself, add calendar events, file evidence. All reversible.
            </div>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f]">Audit</div>
            <div>
              Every action is logged with who, when, what and why. Overrides and handovers record their reason and source.
            </div>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f]">Watchdog</div>
            <div>
              Checks connectors, automation rate, process integrity, duplicates, escalations and overdue work. A critical failure trips the Emergency stop automatically.
            </div>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f]">Emergency stop</div>
            <div>
              Anyone signed in can stop. All automation and all changes halt (reading still works). Only a HOD or Admin can resume, with a reason.
            </div>
          </div>
        </div>
      </div>

      {/* AUDIT TRAIL Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-6 space-y-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">
          AUDIT TRAIL
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by user, action, case..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1d1d1f] outline-none focus:ring-1 focus:ring-blue-400"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-ghost text-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto border-t border-gray-100">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
              <tr>
                <th className="py-2.5 pr-4">WHEN</th>
                <th className="py-2.5 pr-4">WHO</th>
                <th className="py-2.5">WHAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAudit.map(a => (
                <tr key={a.auditId} className="hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4 font-mono text-gray-500 whitespace-nowrap">
                    {a.at}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-[#1d1d1f] whitespace-nowrap">
                    {a.user}
                  </td>
                  <td className="py-2.5">
                    <span className="font-semibold text-[#1d1d1f]">{a.action}</span>
                    {a.caseId && <span className="text-gray-400 ml-1.5 font-mono">{a.caseId}</span>}
                    <div className="text-gray-500 text-[11px] mt-0.5">{a.detail}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accordion: DEMO ONLY: MAKE SOMETHING GO WRONG */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
        <button
          onClick={() => setShowSimMenu(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-semibold tracking-[0.16em] text-[#86868b] uppercase cursor-pointer"
        >
          <span>DEMO ONLY: MAKE SOMETHING GO WRONG</span>
          <span className="text-xs">{showSimMenu ? '▲' : '▼'}</span>
        </button>

        {showSimMenu && (
          <div className="pt-4 space-y-3 border-t border-gray-100 mt-4">
            <div className="text-xs text-gray-500">
              Trigger failure cases to test automatic watchdog trip and emergency stop:
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleSimulate('gmail')}
                className="btn-ghost text-xs"
              >
                Simulate Gmail outage
              </button>
              <button
                onClick={() => handleSimulate('runaway')}
                className="btn-ghost text-xs"
              >
                Simulate runaway automation
              </button>
              <button
                onClick={() => handleSimulate('corrupt')}
                className="btn-ghost text-xs"
              >
                Simulate corrupted case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
