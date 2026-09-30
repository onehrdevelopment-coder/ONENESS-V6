import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { store, LABELS, ROLES, MODULE_GROUPS } from '../services/store';
import { ModuleType } from '../types';

interface ModulesViewProps {
  onNavigate: (view: string, arg?: any) => void;
  onBack: () => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({ onNavigate, onBack }) => {
  const user = store.currentUser();
  const openCases = store.cases.filter(c => c.status !== 'Closed');

  // Groups visible to user
  const userRoleGroups = Object.keys(MODULE_GROUPS).filter(
    role => user.roles.includes(role) || user.level === 'Admin'
  );

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">
        Modules
      </h1>
      <p className="text-sm text-[#86868b] mb-8">
        What your role can work on. A red dot means something needs you.
      </p>

      <div className="space-y-10">
        {userRoleGroups.map(role => {
          const rInfo = ROLES[role];
          const mods = (MODULE_GROUPS[role] || []).filter(m => store.canStart(m));
          if (!mods.length) return null;

          return (
            <div key={role}>
              <div className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4 px-1">
                {rInfo.code} · {rInfo.label.toUpperCase()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {mods.map(m => {
                  const casesForM = openCases.filter(c => c.type === m);
                  const count = casesForM.length;
                  const hasUrgentOrReady = casesForM.some(c => {
                    const tasks = store.tasksOf(c.caseId);
                    return tasks.some(t => t.status === 'Escalated' || (!['Completed', 'Verified'].includes(t.status) && store.can(t.ownerRole)));
                  });

                  return (
                    <div
                      key={m}
                      onClick={() => onNavigate('list', `module:${m}`)}
                      className="relative p-5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                      {hasUrgentOrReady && (
                        <span className="absolute top-4 right-4 red-pulse-dot" />
                      )}
                      <h3 className="text-base font-bold text-[#1d1d1f] pr-6 group-hover:text-[#0071e3] transition-colors leading-snug">
                        {LABELS[m]}
                      </h3>
                      <div className="text-xs text-[#86868b] mt-1.5 font-normal">
                        {count > 0 ? `${count} open` : 'No open cases'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
