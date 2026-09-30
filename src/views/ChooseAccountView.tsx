import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { store } from '../services/store';
import { User } from '../types';
import { signInWithGoogle } from '../services/firebase';

interface ChooseAccountViewProps {
  onSelectAccount: (user: User) => void;
  onBack: () => void;
}

export const ChooseAccountView: React.FC<ChooseAccountViewProps> = ({
  onSelectAccount,
  onBack,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const users = store.users;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        // Find existing or create user
        let user = store.users.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
        if (!user) {
          const isAdminUser = fbUser.email === 'aliff_akhmar@mediaprima.com.my';
          user = {
            userId: `U-FB-${fbUser.uid.slice(0, 6)}`,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email || '',
            roles: isAdminUser ? ['HR Ops', 'Benefits', 'Learning', 'Engagement', 'Payroll', 'IR', 'Performance'] : ['HR Ops'],
            code: isAdminUser ? 'Admin' : 'HR A',
            level: isAdminUser ? 'Admin' : 'Staff',
            title: isAdminUser ? 'System Administrator' : 'HR Executive',
          };
          store.users.unshift(user);
          store.save();
        }
        onSelectAccount(user);
      }
    } catch (err) {
      console.warn('Google sign in canceled or failed:', err);
      setSignInError('Google sign in was not completed.');
    } finally {
      setIsSigningIn(false);
    }
  };

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

        <div className="text-center mb-8">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-2">
            CHOOSE ACCOUNT
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-3">
            Who is signing in?
          </h1>
          <p className="text-base text-[#86868b] mb-6">
            Sign in with your Google account or select a demo profile below.
          </p>

          {/* Google Sign In Button */}
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-[#1d1d1f] font-medium text-sm rounded-2xl border border-[#e8e8ed] shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google Workspace'}</span>
            </button>
            {signInError && (
              <span className="text-xs text-red-500">{signInError}</span>
            )}
          </div>
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
