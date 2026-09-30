import React from 'react';
import {
  FileText,
  Mail,
  Calendar,
  ShieldCheck,
  Search,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { store } from '../services/store';
import { AuditRecord, DraftRecord } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, arg?: any) => void;
  onOpenDraft: (draft: DraftRecord) => void;
  onOpenActivityDetail: (audit: AuditRecord) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenDraft,
  onOpenActivityDetail,
}) => {
  const user = store.currentUser();
  const firstName = user.name.split(' ')[0].toUpperCase();

  // Scope to role
  const userAudit = store.auditLog.filter(a => user.roles.includes(a.role) || user.level === 'Admin');
  const userCases = store.cases.filter(c => store.caseVisible(c));
  const openCases = userCases.filter(c => c.status !== 'Closed');

  // Find attention tasks
  const attentionItems: Array<{ caseId: string; title: string }> = [];
  openCases.forEach(c => {
    const tasks = store.decorateTasks(store.tasksOf(c.caseId));
    tasks.forEach(t => {
      if (!['Completed', 'Verified'].includes(t.status) && (t.ready || t.status === 'Escalated') && (user.roles.includes(t.ownerRole) || user.level === 'Admin')) {
        attentionItems.push({ caseId: c.caseId, title: t.title });
      }
    });
  });

  const decisionsCount = openCases.filter(c => {
    const ts = store.tasksOf(c.caseId);
    return ts.some(t => t.kind === 'decision' && !['Completed', 'Verified'].includes(t.status));
  }).length;

  const policyExceptionsCount = openCases.filter(c => !!c.exception).length;
  const recentEventsCount = userCases.length;

  // Channel groups
  const channelCounts = {
    data: userAudit.filter(a => /update|record|validat|check|confirm/i.test(a.action)).length || 6,
    gmail: userAudit.filter(a => /draft|email|gmail/i.test(a.action)).length || 2,
    route: userAudit.filter(a => /rout|classif|match/i.test(a.action)).length || 2,
    evidence: userAudit.filter(a => /evidence|file/i.test(a.action)).length || 1,
    ramco: userAudit.filter(a => /ramco/i.test(a.action)).length || 1,
    calendar: userAudit.filter(a => /calendar/i.test(a.action)).length || 1,
  };

  const recentActivities = userAudit.slice(0, 5);

  const draftsToReview = store.drafts
    .filter(d => d.status === 'Draft' && (user.roles.includes(d.role) || !d.role || user.level === 'Admin'))
    .slice(0, 3);

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      {/* Top Greeting */}
      <div className="mb-2">
        <div className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-1.5">
          GOOD MORNING, {firstName}
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e8e8ed] rounded-full text-xs font-medium text-[#1d1d1f] shadow-xs">
          <span>{user.code} · {user.title}</span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="mt-4 mb-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-tight">
          While you were away,
          <br />
          <span className="grad">Oneness kept working.</span>
        </h1>
        <div className="text-[11px] font-semibold tracking-[0.2em] text-[#86868b] uppercase mt-2">
          SINCE 15:59 YESTERDAY
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
        <div
          onClick={() => onNavigate('list', 'processed')}
          className="p-5 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-[#1d1d1f]">
            <span>13</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
          </div>
          <div className="text-xs text-[#6e6e73] font-medium mt-1 leading-snug">
            Things processed
          </div>
          <div className="text-xs font-semibold text-[#30d158] mt-2">
            &uarr; 117%
          </div>
        </div>

        <div
          onClick={() => onNavigate('list', 'attention')}
          className="p-5 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-[#1d1d1f]">
            <span>{attentionItems.length || 6}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />
          </div>
          <div className="text-xs text-[#6e6e73] font-medium mt-1 leading-snug">
            Need your attention
          </div>
        </div>

        <div
          onClick={() => onNavigate('list', 'events')}
          className="p-5 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-[#1d1d1f]">
            <span>{recentEventsCount > 0 ? recentEventsCount : 4}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
          </div>
          <div className="text-xs text-[#6e6e73] font-medium mt-1 leading-snug">
            Employee events detected
          </div>
        </div>

        <div
          onClick={() => onNavigate('list', 'exceptions')}
          className="p-5 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-[#1d1d1f]">
            <span>{policyExceptionsCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          </div>
          <div className="text-xs text-[#6e6e73] font-medium mt-1 leading-snug">
            Policy exceptions
          </div>
        </div>

        <div
          onClick={() => onNavigate('list', 'decisions')}
          className="p-5 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-[#1d1d1f]">
            <span>{decisionsCount || 1}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8e44ad]" />
          </div>
          <div className="text-xs text-[#6e6e73] font-medium mt-1 leading-snug">
            Decision waiting for you
          </div>
        </div>
      </div>

      {/* Pill Notification */}
      <div
        onClick={() => onNavigate('list', 'attention')}
        className="p-5 sm:p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer mb-9"
      >
        <div className="flex items-start sm:items-center gap-4">
          <span className="w-3.5 h-3.5 rounded-full bg-[#30d158] flex-none mt-1 sm:mt-0" />
          <div>
            <div className="text-lg sm:text-xl font-bold text-[#1d1d1f] tracking-tight">
              Nothing urgent happened overnight.
            </div>
            <div className="text-sm text-[#6e6e73]">
              {attentionItems.length || 5} cases need your attention today.
            </div>
          </div>
        </div>

        <div className="sm:border-l sm:border-gray-200 sm:pl-6 text-left sm:text-right">
          <div className="text-3xl font-light text-[#1d1d1f] tracking-tight">
            11:00
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
            MIN · EST. TIME TO REVIEW
          </div>
        </div>
      </div>

      {/* Two Columns: While you were away & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Column 1: While You Were Away */}
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
            WHILE YOU WERE AWAY
          </h2>
          <div className="space-y-2.5">
            <div
              onClick={() => onNavigate('list', 'chan:data')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Records updated</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.data}</span>
            </div>

            <div
              onClick={() => onNavigate('list', 'chan:gmail')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Email drafts</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.gmail}</span>
            </div>

            <div
              onClick={() => onNavigate('list', 'chan:route')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Documents routed</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.route}</span>
            </div>

            <div
              onClick={() => onNavigate('list', 'chan:evidence')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Evidence filed</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.evidence}</span>
            </div>

            <div
              onClick={() => onNavigate('list', 'chan:ramco')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Records checked</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.ramco}</span>
            </div>

            <div
              onClick={() => onNavigate('list', 'chan:calendar')}
              className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1d1d1f]">Calendar events</div>
                  <div className="text-xs text-[#86868b]">Tap to see each one</div>
                </div>
              </div>
              <span className="text-lg font-light text-gray-700">{channelCounts.calendar}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Recent Activity */}
        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
            RECENT ACTIVITY
          </h2>
          <div className="space-y-2.5">
            {recentActivities.map(act => (
              <div
                key={act.auditId}
                onClick={() => onOpenActivityDetail(act)}
                className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-none">
                    {/calendar/i.test(act.action) ? (
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    ) : /gmail|draft/i.test(act.action) ? (
                      <Mail className="w-5 h-5 text-emerald-600" />
                    ) : /classif|rout/i.test(act.action) ? (
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    ) : /evidence/i.test(act.action) ? (
                      <ShieldCheck className="w-5 h-5 text-rose-600" />
                    ) : (
                      <Search className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#1d1d1f] truncate">
                      {act.action}
                    </div>
                    <div className="text-xs text-[#86868b] truncate">
                      {act.detail}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#86868b] flex-none">
                  {act.at.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drafts to review section */}
      {draftsToReview.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-3">
            DRAFTS TO REVIEW ({draftsToReview.length})
          </h2>
          <div className="space-y-2.5">
            {draftsToReview.map(d => (
              <div
                key={d.draftId}
                onClick={() => onOpenDraft(d)}
                className="flex items-center justify-between p-4 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600">
                      {d.subject}
                    </div>
                    <div className="text-xs text-[#86868b] truncate mt-0.5">
                      To {d.to || '—'} · {d.at}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-medium flex-none">
                  Not sent
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="text-center text-xs text-[#86868b] py-4">
        Drop a document anywhere. Hover the top edge (or tap Menu) for your menu.
      </div>
    </div>
  );
};
