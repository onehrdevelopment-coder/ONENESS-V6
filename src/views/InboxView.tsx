import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { store } from '../services/store';

interface InboxViewProps {
  onBack: () => void;
  onOpenCase: (caseId: string) => void;
  onRefresh: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  onBack,
  onOpenCase,
  onRefresh,
}) => {
  const user = store.currentUser();
  const notifications = store.notifications.filter(
    n => n.toUser === user.userId || user.roles.includes(n.toRole) || user.level === 'Admin'
  );
  const unreadCount = notifications.filter(n => n.read === 'no').length;

  const handleClick = (notifId: string, caseId?: string) => {
    const n = store.notifications.find(x => x.notifId === notifId);
    if (n) {
      n.read = 'yes';
      store.save();
    }
    onRefresh();
    if (caseId) {
      onOpenCase(caseId);
    }
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
        Inbox
      </h1>
      <div className="text-sm text-[#86868b] mb-6">
        {unreadCount > 0 ? `${unreadCount} new` : 'Nothing new'} · handovers and alerts sent to you
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400">
            Nothing here. Calm is good.
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = n.read === 'no';
            return (
              <div
                key={n.notifId}
                onClick={() => handleClick(n.notifId, n.caseId)}
                className="p-5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-3xl flex items-start gap-3.5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
              >
                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] mt-1.5 flex-none" />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm ${
                      isUnread ? 'font-bold text-[#1d1d1f]' : 'font-medium text-gray-700'
                    } group-hover:text-[#0071e3] transition-colors`}
                  >
                    {n.message}
                  </div>
                  <div className="text-xs text-[#86868b] mt-1">
                    {n.at} · from {n.from} {n.caseId ? `· ${n.caseId}` : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
