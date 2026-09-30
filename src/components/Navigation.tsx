import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Layers,
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  Inbox,
  Sliders,
  Search,
  SlidersHorizontal,
  ArrowRightLeft,
  RotateCcw,
  Power,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react';
import { store, LABELS, ROLES, MODULE_GROUPS } from '../services/store';
import { MenuStyle, ModuleType } from '../types';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string, arg?: any) => void;
  onOpenPalette: () => void;
  onOpenMenuStyle: () => void;
  onOpenEmergencyStop: () => void;
  onResetDemo: () => void;
  onSignOut: () => void;
  unreadInboxCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onOpenPalette,
  onOpenMenuStyle,
  onOpenEmergencyStop,
  onResetDemo,
  onSignOut,
  unreadInboxCount,
}) => {
  const [menuStyle, setMenuStyle] = useState<MenuStyle>(store.menuStyle);
  const [isOpen, setIsOpen] = useState(false);
  const [modulesPopOpen, setModulesPopOpen] = useState(false);
  const [accountPopOpen, setAccountPopOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const user = store.currentUser();

  useEffect(() => {
    const handleStorage = () => {
      setMenuStyle(store.menuStyle);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Hover detection for Desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (launchpadOpen) return;
      const W = window.innerWidth;
      const H = window.innerHeight;

      if (menuStyle === 'dock') {
        const inZone = e.clientY >= H - 80 && Math.abs(e.clientX - W / 2) < 380;
        if (inZone) {
          setIsOpen(true);
        } else if (e.clientY < H - 120 && !dockRef.current?.contains(e.target as Node)) {
          setIsOpen(false);
          setModulesPopOpen(false);
        }
      } else if (menuStyle === 'sidebar') {
        if (e.clientX <= 14) {
          setIsOpen(true);
        } else if (e.clientX > 320) {
          setIsOpen(false);
        }
      } else {
        // top edge styles: capsule, toolbar, mega, launchpad chip, spotlight
        if (e.clientY <= 16) {
          setIsOpen(true);
        } else if (e.clientY > 160 && !modulesPopOpen && !accountPopOpen) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [menuStyle, launchpadOpen, modulesPopOpen, accountPopOpen]);

  // Modules list for the current role
  const userRole = user.roles[0] || 'HR Ops';
  const roleModules: ModuleType[] = (MODULE_GROUPS[userRole] || []).filter(m => store.canStart(m));
  const openCases = store.cases.filter(c => c.status !== 'Closed');

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-blue-100 text-blue-600' },
    { id: 'modules', label: 'Modules', icon: Layers, color: 'bg-purple-100 text-purple-600', isModules: true },
    { id: 'sense', label: 'Sense', icon: Sparkles, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'list', label: 'Cases', icon: FileText, color: 'bg-blue-100 text-blue-600', arg: 'all' },
    { id: 'improve', label: 'Improve', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
    { id: 'people', label: 'People', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'bg-rose-100 text-rose-600', badge: unreadInboxCount },
    { id: 'control', label: 'Control', icon: Sliders, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleNavClick = (id: string, arg?: any, isModules?: boolean) => {
    if (isModules) {
      setModulesPopOpen(prev => !prev);
      return;
    }
    setIsOpen(false);
    setModulesPopOpen(false);
    setAccountPopOpen(false);
    setLaunchpadOpen(false);
    setMobileMenuOpen(false);
    onNavigate(id, arg);
  };

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ================= STYLE 1: DOCK (DEFAULT) ================= */}
      {menuStyle === 'dock' && (
        <div
          ref={dockRef}
          className={`fixed left-1/2 -translate-x-1/2 bottom-4 z-40 transition-all duration-300 hidden md:block ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => {
            if (!modulesPopOpen) setIsOpen(false);
          }}
        >
          {/* Modules Popover if clicked */}
          {modulesPopOpen && (
            <div className="absolute bottom-[96px] left-1/2 -translate-x-1/2 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {user.code} Modules
                </span>
                <button
                  onClick={() => setModulesPopOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {roleModules.map(m => {
                  const mCases = openCases.filter(c => c.type === m).length;
                  return (
                    <button
                      key={m}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-[#1d1d1f] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl transition-colors"
                      onClick={() => handleNavClick('list', `module:${m}`)}
                    >
                      <span className="font-medium">{LABELS[m]}</span>
                      {mCases > 0 && <span className="red-pulse-dot" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  className="w-full text-center text-xs font-medium text-blue-600 hover:underline py-1"
                  onClick={() => handleNavClick('modules')}
                >
                  View all modules &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Dock Bar */}
          <div className="flex items-end gap-2.5 h-[84px] px-5 pb-3 bg-white/85 backdrop-blur-3xl rounded-[30px] shadow-2xl border border-white/80">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.arg, item.isModules)}
                  className="dock-item relative group flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                >
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-3 px-2.5 py-1 text-xs font-medium bg-[#1d1d1f]/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md">
                    {item.label}
                  </span>

                  <div
                    className={`w-[50px] h-[50px] rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                      isActive ? 'bg-[#0071e3] text-white shadow-md' : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                      {item.badge}
                    </span>
                  )}

                  {/* Active dot */}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f] -mb-1" />}
                </button>
              );
            })}

            <div className="w-[1px] h-10 bg-gray-200 self-center mx-1" />

            {/* Quick search */}
            <button
              onClick={onOpenPalette}
              className="dock-item relative group flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="absolute bottom-full mb-3 px-2.5 py-1 text-xs font-medium bg-[#1d1d1f]/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                Search (Ctrl+K)
              </span>
              <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center bg-gray-100/90 text-gray-600 hover:bg-gray-200 shadow-sm">
                <Search className="w-5 h-5" />
              </div>
            </button>

            {/* Menu style */}
            <button
              onClick={onOpenMenuStyle}
              className="dock-item relative group flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="absolute bottom-full mb-3 px-2.5 py-1 text-xs font-medium bg-[#1d1d1f]/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                Menu style
              </span>
              <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center bg-gray-100/90 text-gray-600 hover:bg-gray-200 shadow-sm">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
            </button>

            {/* Switch Account */}
            <button
              onClick={onSignOut}
              className="dock-item relative group flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="absolute bottom-full mb-3 px-2.5 py-1 text-xs font-medium bg-[#1d1d1f]/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                Switch account
              </span>
              <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-100 to-rose-100 text-gray-800 font-semibold text-sm shadow-sm hover:scale-105 transition-transform">
                {initials}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ================= STYLE 2: CAPSULE (TOP FLOATING) ================= */}
      {menuStyle === 'capsule' && (
        <div
          className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 hidden md:block ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => {
            if (!modulesPopOpen && !accountPopOpen) setIsOpen(false);
          }}
        >
          <div className="flex items-center gap-1 h-[52px] px-3 bg-white/85 backdrop-blur-3xl rounded-[26px] shadow-2xl border border-white/80">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.arg, item.isModules)}
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium transition-all ${
                    isActive ? 'bg-[#0071e3]/12 text-[#0071e3] font-semibold' : 'text-gray-700 hover:bg-gray-100/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.isModules && <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              );
            })}

            <div className="w-[1px] h-6 bg-gray-200 mx-1" />

            <button
              onClick={onOpenPalette}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAccountPopOpen(prev => !prev)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-rose-100 flex items-center justify-center text-gray-700 font-semibold text-xs hover:ring-2 hover:ring-[#0071e3]/30 transition-all"
            >
              {initials}
            </button>
          </div>

          {/* Modules Dropdown */}
          {modulesPopOpen && (
            <div className="absolute top-[60px] left-28 w-80 bg-white/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 pb-2 mb-2 border-b border-gray-100">
                {user.code} Modules
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {roleModules.map(m => {
                  const mCases = openCases.filter(c => c.type === m).length;
                  return (
                    <button
                      key={m}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-[#1d1d1f] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl transition-colors"
                      onClick={() => handleNavClick('list', `module:${m}`)}
                    >
                      <span className="font-medium">{LABELS[m]}</span>
                      {mCases > 0 && <span className="red-pulse-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Dropdown */}
          {accountPopOpen && (
            <div className="absolute top-[60px] right-2 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl p-3 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="font-semibold text-sm text-[#1d1d1f]">{user.name}</div>
                <div className="text-xs text-gray-500">{user.code} · {user.title}</div>
              </div>
              <div className="pt-2 space-y-1 text-sm">
                <button
                  onClick={() => {
                    setAccountPopOpen(false);
                    onOpenMenuStyle();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span>Menu style</span>
                </button>
                <button
                  onClick={() => {
                    setAccountPopOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                  <span>Switch account</span>
                </button>
                <button
                  onClick={() => {
                    setAccountPopOpen(false);
                    onResetDemo();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                  <span>Reset demo</span>
                </button>
                {!store.isEmergencyStop() && (
                  <button
                    onClick={() => {
                      setAccountPopOpen(false);
                      onOpenEmergencyStop();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                  >
                    <Power className="w-4 h-4 text-red-600" />
                    <span>Emergency stop</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STYLE 3: TOOLBAR (SEGMENTED TOP) ================= */}
      {menuStyle === 'toolbar' && (
        <div
          className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 hidden md:block ${
            isOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/80 shadow-lg px-6 py-2.5">
            <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <span className="font-bold text-lg text-[#1d1d1f] tracking-tight">Oneness</span>
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl">
                  {mainNavItems.filter(i => i.id !== 'modules').map(item => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id, item.arg)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isActive ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenPalette}
                  className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-gray-100/90 text-sm text-gray-500 hover:bg-gray-200/80 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                  <span className="text-[10px] font-mono border border-gray-300 px-1 rounded">Ctrl K</span>
                </button>

                <button
                  onClick={onOpenMenuStyle}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                  title="Menu style"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                <button
                  onClick={onSignOut}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-rose-100 flex items-center justify-center text-gray-700 font-semibold text-xs"
                >
                  {initials}
                </button>
              </div>
            </div>

            {/* Second row: Module pills */}
            <div className="max-w-[1240px] mx-auto flex items-center gap-2 pt-2.5 mt-2 border-t border-gray-100 overflow-x-auto text-xs">
              <span className="font-bold uppercase tracking-wider text-gray-400 mr-2">
                {user.code}
              </span>
              {roleModules.map(m => {
                const mCases = openCases.filter(c => c.type === m).length;
                return (
                  <button
                    key={m}
                    onClick={() => handleNavClick('list', `module:${m}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all font-medium whitespace-nowrap shadow-xs"
                  >
                    <span>{LABELS[m]}</span>
                    {mCases > 0 && <span className="red-pulse-dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLE 4: SIDEBAR ================= */}
      {menuStyle === 'sidebar' && (
        <div
          className={`fixed top-3 left-3 bottom-3 w-[290px] z-40 transition-transform duration-300 hidden md:block ${
            isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="h-full bg-white/90 backdrop-blur-3xl rounded-[28px] p-5 shadow-2xl border border-white/80 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <span className="font-bold text-xl text-[#1d1d1f] tracking-tight">Oneness</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                  {user.code}
                </span>
              </div>

              <div className="space-y-1 mb-6">
                {mainNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.arg)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-[#0071e3]/12 text-[#0071e3] font-semibold' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-3">
                {user.code} Modules
              </div>
              <div className="space-y-1">
                {roleModules.map(m => {
                  const mCases = openCases.filter(c => c.type === m).length;
                  return (
                    <button
                      key={m}
                      onClick={() => handleNavClick('list', `module:${m}`)}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                    >
                      <span>{LABELS[m]}</span>
                      {mCases > 0 && <span className="red-pulse-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-1 text-sm">
              <button
                onClick={onOpenPalette}
                className="w-full flex items-center justify-between px-3.5 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>Search</span>
                </div>
                <span className="text-[10px] font-mono border border-gray-200 px-1 rounded text-gray-400">Ctrl K</span>
              </button>
              <button
                onClick={onOpenMenuStyle}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <span>Menu style</span>
              </button>
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                <span>Switch account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLE 5: MEGA MENU ================= */}
      {menuStyle === 'mega' && (
        <div
          className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 hidden md:block ${
            isOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-white/90 backdrop-blur-3xl border-b border-gray-200/80 shadow-2xl rounded-b-[32px] px-12 py-8">
            <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-10">
              {/* Column 1: Navigate */}
              <div className="col-span-3 border-r border-gray-100 pr-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Navigate
                </div>
                <div className="space-y-1">
                  {mainNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id, item.arg)}
                        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Modules Grid */}
              <div className="col-span-6 border-r border-gray-100 pr-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Your Modules · {user.code}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {roleModules.map(m => {
                    const mCases = openCases.filter(c => c.type === m).length;
                    return (
                      <button
                        key={m}
                        onClick={() => handleNavClick('list', `module:${m}`)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-blue-400 hover:shadow-sm text-left transition-all"
                      >
                        <span className="font-medium text-sm text-[#1d1d1f]">{LABELS[m]}</span>
                        {mCases > 0 && <span className="red-pulse-dot" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Account */}
              <div className="col-span-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Account
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                  <div className="font-semibold text-base text-[#1d1d1f]">{user.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{user.title}</div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">{user.email}</div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={onOpenPalette}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={onOpenMenuStyle}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    <span>Menu style</span>
                  </button>
                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    <span>Switch account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLE 6: LAUNCHPAD TRIGGER & OVERLAY ================= */}
      {menuStyle === 'launchpad' && (
        <>
          <div
            className={`fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 hidden md:block ${
              isOpen ? 'translate-y-0' : '-translate-y-20 pointer-events-none'
            }`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button
              onClick={() => setLaunchpadOpen(true)}
              className="flex items-center gap-2 h-10 px-5 bg-white/90 backdrop-blur-2xl rounded-full shadow-lg border border-white/80 text-sm font-semibold text-gray-800 hover:scale-105 transition-transform"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Menu</span>
            </button>
          </div>

          {launchpadOpen && (
            <div
              className="fixed inset-0 z-50 bg-white/85 backdrop-blur-3xl p-16 overflow-y-auto animate-in fade-in duration-200"
              onClick={() => setLaunchpadOpen(false)}
            >
              <div className="max-w-[1000px] mx-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setLaunchpadOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-8 justify-items-center mb-16">
                  {mainNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setLaunchpadOpen(false);
                          handleNavClick(item.id, item.arg);
                        }}
                        className="flex flex-col items-center gap-3 text-center group cursor-pointer"
                      >
                        <div className="w-[84px] h-[84px] rounded-[24px] bg-white shadow-xl border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-9 h-9 text-[#0071e3]" />
                        </div>
                        <span className="text-sm font-medium text-[#1d1d1f]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
                  {user.code} Modules
                </div>
                <div className="grid grid-cols-6 gap-6 justify-items-center mb-16">
                  {roleModules.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setLaunchpadOpen(false);
                        handleNavClick('list', `module:${m}`);
                      }}
                      className="flex flex-col items-center gap-2 text-center group cursor-pointer"
                    >
                      <div className="w-[62px] h-[62px] rounded-[18px] bg-white shadow-lg border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-[#1d1d1f] max-w-[90px] leading-tight">
                        {LABELS[m]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
                  Account & Controls
                </div>
                <div className="grid grid-cols-4 gap-6 justify-items-center">
                  <button
                    onClick={() => {
                      setLaunchpadOpen(false);
                      onOpenPalette();
                    }}
                    className="flex flex-col items-center gap-2 text-center group"
                  >
                    <div className="w-[62px] h-[62px] rounded-[18px] bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-[#1d1d1f]">Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setLaunchpadOpen(false);
                      onOpenMenuStyle();
                    }}
                    className="flex flex-col items-center gap-2 text-center group"
                  >
                    <div className="w-[62px] h-[62px] rounded-[18px] bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <SlidersHorizontal className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-[#1d1d1f]">Menu style</span>
                  </button>
                  <button
                    onClick={() => {
                      setLaunchpadOpen(false);
                      onSignOut();
                    }}
                    className="flex flex-col items-center gap-2 text-center group"
                  >
                    <div className="w-[62px] h-[62px] rounded-[18px] bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRightLeft className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-[#1d1d1f]">Switch account</span>
                  </button>
                  {!store.isEmergencyStop() && (
                    <button
                      onClick={() => {
                        setLaunchpadOpen(false);
                        onOpenEmergencyStop();
                      }}
                      className="flex flex-col items-center gap-2 text-center group"
                    >
                      <div className="w-[62px] h-[62px] rounded-[18px] bg-red-50 text-red-600 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Power className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-red-600">Emergency stop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= STYLE 7: SPOTLIGHT ONLY ================= */}
      {menuStyle === 'spotlight' && (
        <div
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 hidden md:block ${
            isOpen ? 'translate-y-0' : '-translate-y-20 pointer-events-none'
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-3 h-10 px-5 bg-white/90 backdrop-blur-2xl rounded-full shadow-lg border border-white/80 text-sm text-gray-600 hover:scale-105 transition-transform"
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>Search or jump to...</span>
            <span className="text-[10px] font-mono border border-gray-300 px-1.5 py-0.5 rounded text-gray-400">
              Ctrl K
            </span>
          </button>
        </div>
      )}

      {/* ================= MOBILE BOTTOM TAB BAR ================= */}
      <div className="fixed bottom-2.5 left-3 right-3 z-40 h-[62px] bg-white/85 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/80 flex items-center justify-around md:hidden">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
            currentView === 'home' ? 'text-[#0071e3]' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('list', 'all')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
            currentView === 'list' ? 'text-[#0071e3]' : 'text-gray-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Cases</span>
        </button>

        <button
          onClick={() => handleNavClick('sense')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
            currentView === 'sense' ? 'text-[#0071e3]' : 'text-gray-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Sense</span>
        </button>

        <button
          onClick={() => handleNavClick('inbox')}
          className={`relative flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
            currentView === 'inbox' ? 'text-[#0071e3]' : 'text-gray-500'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Inbox</span>
          {unreadInboxCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadInboxCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-gray-500"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex flex-col justify-end p-3 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[75vh] overflow-y-auto mb-16 animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="font-bold text-base text-[#1d1d1f]">{user.name}</div>
                <div className="text-xs text-gray-500">{user.code} · {user.title}</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => handleNavClick('modules')}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 font-medium text-left"
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Modules</span>
              </button>
              <button
                onClick={() => handleNavClick('people')}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 font-medium text-left"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>People</span>
              </button>
              <button
                onClick={() => handleNavClick('improve')}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 font-medium text-left"
              >
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Improve</span>
              </button>
              <button
                onClick={() => handleNavClick('control')}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 font-medium text-left"
              >
                <Sliders className="w-4 h-4 text-gray-600" />
                <span>Control Room</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2 text-sm">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPalette();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                <span>Switch account</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onResetDemo();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <span>Reset demo</span>
              </button>
              {!store.isEmergencyStop() && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEmergencyStop();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                >
                  <Power className="w-4 h-4" />
                  <span>Emergency stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
