import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { store, LABELS } from '../services/store';
import { Case, ModuleType } from '../types';

interface CasesListViewProps {
  arg?: string;
  onNavigate: (view: string, arg?: any) => void;
  onSelectCase: (caseId: string) => void;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  arg = 'all',
  onNavigate,
  onSelectCase,
}) => {
  const user = store.currentUser();
  const allCases = store.cases.filter(c => store.caseVisible(c));

  let title = 'All cases';
  let filteredCases: Case[] = allCases;

  if (arg === 'attention') {
    title = 'Need your attention';
    filteredCases = allCases.filter(c => {
      if (c.status === 'Closed') return false;
      const tasks = store.decorateTasks(store.tasksOf(c.caseId));
      return tasks.some(t => !['Completed', 'Verified'].includes(t.status) && (t.ready || t.status === 'Escalated') && (user.roles.includes(t.ownerRole) || user.level === 'Admin'));
    });
  } else if (arg === 'decisions') {
    title = 'Decisions waiting for you';
    filteredCases = allCases.filter(c => {
      if (c.status === 'Closed') return false;
      const tasks = store.tasksOf(c.caseId);
      return tasks.some(t => t.kind === 'decision' && !['Completed', 'Verified'].includes(t.status) && (user.roles.includes(t.ownerRole) || user.level === 'Admin'));
    });
  } else if (arg === 'events') {
    title = 'Employee events detected';
    filteredCases = allCases;
  } else if (arg === 'exceptions') {
    title = 'Policy exceptions';
    filteredCases = allCases.filter(c => !!c.exception && c.status !== 'Closed');
  } else if (arg.startsWith('module:')) {
    const modType = arg.slice(7) as ModuleType;
    title = LABELS[modType] || 'Module cases';
    filteredCases = allCases.filter(c => c.type === modType);
  } else if (arg.startsWith('chan:')) {
    const chan = arg.slice(5);
    title = `Actions: ${chan}`;
  }

  const getPriorityBadge = (priority: Case['priority']) => {
    if (priority === 'Urgent') {
      return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Urgent</span>;
    }
    if (priority === 'High') {
      return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">High</span>;
    }
    return null;
  };

  const getStatusBadge = (status: Case['status']) => {
    switch (status) {
      case 'Closed':
      case 'Verified':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{status}</span>;
      case 'Escalated':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">{status}</span>;
      case 'Awaiting verification':
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">Verify</span>;
      default:
        return <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-1.5">
        {title}
      </h1>
      <div className="text-sm text-[#86868b] mb-6">
        {filteredCases.length} item{filteredCases.length === 1 ? '' : 's'}
      </div>

      <div className="space-y-2.5">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400">
            Nothing here. Calm is good.
          </div>
        ) : (
          filteredCases.map(c => (
            <div
              key={c.caseId}
              onClick={() => onSelectCase(c.caseId)}
              className="p-4 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-base text-[#1d1d1f] truncate group-hover:text-blue-600 transition-colors">
                  {c.title}
                </div>
                <div className="text-xs text-[#86868b] truncate mt-0.5">
                  {c.caseId} · {c.stage} {c.blocker ? `· ${c.blocker}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-none">
                {getPriorityBadge(c.priority)}
                {getStatusBadge(c.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
