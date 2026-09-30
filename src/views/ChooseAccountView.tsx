import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { store } from '../services/store';
import { User } from '../types';

interface ChooseAccountViewProps {
  onSelectAccount: (user: User) => void;
  onBack: () => void;
}

export const ChooseAccountView: React.FC<ChooseAccountViewProps> = ({
  onSelectAccount,
  onBack,
}) => {
  const users = store.users;

  const groups: Array<{ title: string; level: User['level'] }> = [
    { title: 'HR TEAM', level: 'Staff' },
    { title: 'UNIT MANAGERS', level: 'Manager' },
    { title: 'HEADS OF DEPARTMENT', level: 'HOD' },
    { title: 'ADMIN', level: 'Admin' },
  ];

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
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] px-6 py-12">
      <div className="max-w-[1080px] mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-2">
            CHOOSE ACCOUNT
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-3">
            Who is signing in?
          </h1>
          <p className="text-base text-[#86868b]">
            Demo accounts. Real Google sign-in replaces this list.
          </p>
        </div>

        <div className="space-y-8">
          {groups.map(g => {
            const list = users.filter(u => u.level === g.level);
            if (!list.length) return null;

            return (
              <div key={g.title}>
                <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#86868b] mb-3 px-1">
                  {g.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map(u => (
                    <div
                      key={u.userId}
                      onClick={() => onSelectAccount(u)}
                      className="flex items-center gap-3.5 p-4 bg-white border border-[#e8e8ed] rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-50 to-orange-50 border border-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 flex-none group-hover:scale-105 transition-transform">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-[#0071e3] transition-colors">
                          {u.name} <span className="font-normal text-xs text-[#86868b]">· {u.code}</span>
                        </div>
                        <div className="text-xs text-[#86868b] truncate mt-0.5">
                          {u.email} · {u.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-[#86868b] mt-12">
          Demo accounts. In production Google Workspace verifies who you are.
        </div>
      </div>
    </div>
  );
};
