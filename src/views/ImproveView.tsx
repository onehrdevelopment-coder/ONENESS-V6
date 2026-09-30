import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import { store, LABELS, ROLES } from '../services/store';
import { ModuleType } from '../types';

interface ImproveViewProps {
  onBack: () => void;
  onOpenProcess: (type: ModuleType) => void;
  onRefresh: () => void;
}

export const ImproveView: React.FC<ImproveViewProps> = ({
  onBack,
  onOpenProcess,
  onRefresh,
}) => {
  const user = store.currentUser();

  // Suggestions
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const suggestions = [
    {
      id: 'sug-1',
      category: 'Handoffs',
      module: 'resignation' as ModuleType,
      title: 'Too many role handoffs in Resignation',
      desc: '4 role changes across 9 steps. Each handoff adds waiting time.',
      impact: 'Could remove ~2 waits',
    },
    {
      id: 'sug-2',
      category: 'Automation',
      module: 'resignation' as ModuleType,
      title: '"Validate resignation details" could be rule-based',
      desc: 'Deterministic checks can run automatically and only escalate exceptions to a human.',
      impact: 'Saves a human touch per case',
    },
    {
      id: 'sug-3',
      category: 'Automation',
      module: 'promotion' as ModuleType,
      title: '"Validate eligibility and performance rating" could be rule-based',
      desc: 'Deterministic checks can run automatically and only escalate exceptions to a human.',
      impact: 'Saves a human touch per case',
    },
    {
      id: 'sug-4',
      category: 'Automation',
      module: 'confirmation' as ModuleType,
      title: '"Check probation end date" could be rule-based',
      desc: 'Deterministic checks can run automatically and only escalate exceptions to a human.',
      impact: 'Saves a human touch per case',
    },
  ];

  const visibleSuggestions = suggestions.filter(s => !dismissed[s.id]);

  const activeProcesses: ModuleType[] = [
    'resignation',
    'recruitment',
    'promotion',
    'confirmation',
    'renewal',
    'onboarding',
    'claim',
    'leave',
  ];

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">
        Process improvement
      </h1>
      <p className="text-sm text-[#86868b] mb-8 leading-relaxed max-w-2xl">
        Suggestions from how your processes actually run. Any change needs approval, runs in shadow mode first, and only then goes live.
      </p>

      {/* Suggestions Section */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          SUGGESTIONS FOR YOU
        </h2>

        <div className="space-y-3.5">
          {visibleSuggestions.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center text-xs text-gray-400">
              No new suggestions right now.
            </div>
          ) : (
            visibleSuggestions.map(sug => (
              <div
                key={sug.id}
                className="p-5 sm:p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {sug.category}
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {LABELS[sug.module]}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f]">
                    {sug.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {sug.desc}
                  </p>
                  <div className="text-xs font-semibold text-emerald-600 mt-1">
                    {sug.impact}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onOpenProcess(sug.module)}
                    className="btn-primary text-xs"
                  >
                    Review process
                  </button>
                  <button
                    onClick={() => setDismissed(prev => ({ ...prev, [sug.id]: true }))}
                    className="btn-ghost text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Processes List */}
      <div>
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          ALL PROCESSES
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activeProcesses.map(p => (
            <div
              key={p}
              onClick={() => onOpenProcess(p)}
              className="p-5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <h3 className="font-bold text-base text-[#1d1d1f] group-hover:text-blue-600 transition-colors">
                {LABELS[p]}
              </h3>
              <div className="text-xs text-[#86868b] mt-1">
                Live v1 · 9 steps
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
