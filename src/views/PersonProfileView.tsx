import React, { useState } from 'react';
import { ArrowLeft, Mail, FileText, Calendar } from 'lucide-react';
import { store } from '../services/store';
import { FileRecord, DraftRecord } from '../types';

interface PersonProfileViewProps {
  empId: string;
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onOpenFile: (file: FileRecord) => void;
  onOpenDraft: (draft: DraftRecord) => void;
  onDraftEmail: (empId: string) => void;
}

export const PersonProfileView: React.FC<PersonProfileViewProps> = ({
  empId,
  onBack,
  onOpenCase,
  onOpenFile,
  onOpenDraft,
  onDraftEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Employment' | 'Leave' | 'Claims' | 'Cases' | 'Documents' | 'Timeline'>('Overview');

  const employee = store.employees.find(e => e.empId === empId);

  if (!employee) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">Employee not found.</p>
        <button onClick={onBack} className="btn-ghost mt-4">
          Back to People
        </button>
      </div>
    );
  }

  const cases = store.cases.filter(c => c.empId === empId && store.caseVisible(c));
  const activeCases = cases.filter(c => c.status !== 'Closed');
  const leaveRecords = store.leave.filter(l => l.empId === empId);
  const claimsRecords = store.claims.filter(c => c.empId === empId);
  const learningRecords = store.learning.filter(l => l.empId === empId);
  const files = store.files.filter(f => f.empId === empId);
  const drafts = store.drafts.filter(d => d.empId === empId && d.status !== 'Deleted');
  const timeline = store.auditLog
    .filter(a => cases.some(c => c.caseId === a.caseId))
    .slice(0, 10);

  const getInitials = (name: string) => {
    return name
      .replace(/\(.*\)/, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>People</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-50 to-orange-50 border border-gray-100 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-700 flex-none shadow-sm">
            {getInitials(employee.name)}
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#86868b] uppercase mb-1">
              {employee.empId} · {employee.dept.toUpperCase()}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2">
              {employee.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {employee.status}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {employee.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('Cases')}
            className="btn-ghost text-xs"
          >
            Cases
          </button>
          <button
            onClick={() => onDraftEmail(employee.empId)}
            className="btn-primary text-xs"
          >
            Draft email
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-2 mb-6 overflow-x-auto text-xs sm:text-sm">
        {(['Overview', 'Employment', 'Leave', 'Claims', 'Cases', 'Documents', 'Timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-[#1d1d1f] text-white font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Employment */}
          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-3">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              EMPLOYMENT
            </h2>
            <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-500">Position</span>
              <span className="font-medium text-[#1d1d1f]">{employee.position}</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-500">Grade</span>
              <span className="font-medium text-[#1d1d1f]">{employee.grade}</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-500">Manager</span>
              <span className="font-medium text-[#1d1d1f]">{employee.manager}</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium text-[#1d1d1f]">{employee.joinDate}</span>
            </div>
          </div>

          {/* Card 2: Leave Balance */}
          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-5">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              LEAVE BALANCE
            </h2>
            {leaveRecords.map(l => {
              const pct = l.entitled > 0 ? (l.balance / l.entitled) * 100 : 0;
              return (
                <div key={l.type}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#1d1d1f] font-medium">{l.type}</span>
                    <span className="text-gray-500">{l.balance} of {l.entitled} left</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card 3: Active Case & Documents */}
          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
                ACTIVE CASE
              </h2>
              {activeCases.length === 0 ? (
                <div className="text-xs text-gray-400">No active cases.</div>
              ) : (
                activeCases.slice(0, 1).map(c => (
                  <div
                    key={c.caseId}
                    onClick={() => onOpenCase(c.caseId)}
                    className="p-3 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-3"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#1d1d1f] truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {c.stage}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
                DOCUMENTS
              </h2>
              <div className="space-y-2">
                {files.slice(0, 2).map(f => (
                  <div
                    key={f.fileId}
                    onClick={() => onOpenFile(f)}
                    className="p-3 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px] uppercase flex-none">
                      TXT
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#1d1d1f] truncate">
                        {f.name}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {f.at}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: EMPLOYMENT */}
      {activeTab === 'Employment' && (
        <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
            EMPLOYMENT RECORD (RAMCO MIRROR, DUMMY)
          </h2>
          {[
            ['Staff ID', employee.empId],
            ['Name', employee.name],
            ['Position', employee.position],
            ['Department', employee.dept],
            ['Grade', employee.grade],
            ['Reports to', employee.manager],
            ['Joined', employee.joinDate],
            ['Category', employee.category],
            ['Status', employee.status],
            ['Email', employee.email],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500 w-44">{k}</span>
              <span className="font-medium text-[#1d1d1f]">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: LEAVE */}
      {activeTab === 'Leave' && (
        <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
            LEAVE (THIS YEAR)
          </h2>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400">
              <tr>
                <th className="py-2.5">TYPE</th>
                <th className="py-2.5">ENTITLED</th>
                <th className="py-2.5">TAKEN</th>
                <th className="py-2.5">BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveRecords.map(l => (
                <tr key={l.type}>
                  <td className="py-3 font-medium text-[#1d1d1f]">{l.type}</td>
                  <td className="py-3 text-gray-600">{l.entitled}</td>
                  <td className="py-3 text-gray-600">{l.taken}</td>
                  <td className="py-3 font-bold text-[#1d1d1f]">{l.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: CLAIMS */}
      {activeTab === 'Claims' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              CLAIMS
            </h2>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400">
                <tr>
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">TYPE</th>
                  <th className="py-2.5">AMOUNT</th>
                  <th className="py-2.5">DATE</th>
                  <th className="py-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claimsRecords.map(c => (
                  <tr key={c.claimId}>
                    <td className="py-3 font-mono text-gray-500">{c.claimId}</td>
                    <td className="py-3 font-medium text-[#1d1d1f]">{c.claimType}</td>
                    <td className="py-3 text-gray-700">RM {c.amount}</td>
                    <td className="py-3 text-gray-500">{c.date}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              LEARNING
            </h2>
            <div className="space-y-2">
              {learningRecords.map(l => (
                <div key={l.courseId} className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                  <div className="font-medium text-[#1d1d1f]">{l.course}</div>
                  <div className="text-gray-500">RM {l.cost} · {l.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: CASES */}
      {activeTab === 'Cases' && (
        <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
            CASES ({cases.length})
          </h2>
          {cases.map(c => (
            <div
              key={c.caseId}
              onClick={() => onOpenCase(c.caseId)}
              className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <div>
                <div className="font-semibold text-sm text-[#1d1d1f]">{c.title}</div>
                <div className="text-xs text-gray-500">{c.caseId} · {c.stage}</div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              FILES (TAP TO PREVIEW)
            </h2>
            <div className="space-y-2.5">
              {files.map(f => (
                <div
                  key={f.fileId}
                  onClick={() => onOpenFile(f)}
                  className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl flex items-center gap-3 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs uppercase flex-none">
                    TXT
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1d1d1f] truncate">{f.name}</div>
                    <div className="text-xs text-gray-500 truncate">{f.caseId} · {f.by} · {f.at}</div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
              EMAIL DRAFTS
            </h2>
            <div className="space-y-2.5">
              {drafts.map(d => (
                <div
                  key={d.draftId}
                  onClick={() => onOpenDraft(d)}
                  className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl flex items-center gap-3 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1d1d1f] truncate">{d.subject}</div>
                    <div className="text-xs text-gray-500 truncate">To {d.to || '—'} · {d.at}</div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium">
                    {d.status === 'Draft' ? 'Not sent' : d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: TIMELINE */}
      {activeTab === 'Timeline' && (
        <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
            TIMELINE
          </h2>
          {timeline.map(a => (
            <div key={a.auditId} className="flex items-start justify-between text-xs py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-semibold text-[#1d1d1f]">{a.action}</div>
                <div className="text-gray-500 mt-0.5">{a.detail}</div>
              </div>
              <span className="text-gray-400 font-mono flex-none">{a.at.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
