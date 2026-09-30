import React, { useState, useEffect } from 'react';
import { Search, CornerDownLeft, Sparkles, Folder, Settings, RefreshCw, Power } from 'lucide-react';
import { store, LABELS } from '../services/store';
import { ModuleType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, arg?: any) => void;
  onOpenMenuStyle: () => void;
  onOpenEmergencyStop: () => void;
  onResetDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenMenuStyle,
  onOpenEmergencyStop,
  onResetDemo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const user = store.currentUser();
  const allModules = Object.keys(LABELS) as ModuleType[];
  const userModules = allModules.filter(m => store.canStart(m));

  interface PaletteItem {
    id: string;
    group: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const items: PaletteItem[] = [
    { id: 'home', group: 'Navigation', label: 'Home', icon: <Sparkles className="w-4 h-4 text-blue-500" />, action: () => onNavigate('home') },
    { id: 'modules', group: 'Navigation', label: 'Modules', icon: <Folder className="w-4 h-4 text-purple-500" />, action: () => onNavigate('modules') },
    { id: 'sense', group: 'Navigation', label: 'Sense (Intake & Classify)', icon: <Sparkles className="w-4 h-4 text-green-500" />, action: () => onNavigate('sense') },
    { id: 'cases', group: 'Navigation', label: 'All Cases', icon: <Folder className="w-4 h-4 text-blue-500" />, action: () => onNavigate('list', 'all') },
    { id: 'people', group: 'Navigation', label: 'People (Employees)', icon: <Folder className="w-4 h-4 text-indigo-500" />, action: () => onNavigate('people') },
    { id: 'improve', group: 'Navigation', label: 'Process Improvement', icon: <Settings className="w-4 h-4 text-amber-500" />, action: () => onNavigate('improve') },
    { id: 'inbox', group: 'Navigation', label: 'Inbox (Handovers & Alerts)', icon: <Sparkles className="w-4 h-4 text-red-500" />, action: () => onNavigate('inbox') },
    { id: 'control', group: 'Navigation', label: 'Control Room & Governance', icon: <Settings className="w-4 h-4 text-gray-500" />, action: () => onNavigate('control') },
  ];

  userModules.forEach(m => {
    items.push({
      id: `module-${m}`,
      group: 'Modules',
      label: LABELS[m],
      icon: <Folder className="w-4 h-4 text-blue-600" />,
      action: () => onNavigate('list', `module:${m}`),
    });
  });

  items.push(
    { id: 'menu-style', group: 'Actions', label: 'Menu style settings', icon: <Settings className="w-4 h-4 text-gray-600" />, action: onOpenMenuStyle },
    { id: 'switch-account', group: 'Actions', label: 'Switch demo account', icon: <RefreshCw className="w-4 h-4 text-gray-600" />, action: () => onNavigate('login') },
    { id: 'reset-demo', group: 'Actions', label: 'Reset demo data', icon: <RefreshCw className="w-4 h-4 text-amber-600" />, action: onResetDemo }
  );

  if (!store.isEmergencyStop()) {
    items.push({
      id: 'emergency-stop',
      group: 'Actions',
      label: 'Emergency stop (Halt all automation)',
      icon: <Power className="w-4 h-4 text-red-600" />,
      action: onOpenEmergencyStop,
    });
  }

  const q = query.toLowerCase().trim();
  const filtered = q ? items.filter(x => x.label.toLowerCase().includes(q) || x.group.toLowerCase().includes(q)) : items;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-[14vh] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            className="flex-1 text-[17px] text-[#1d1d1f] placeholder:text-gray-400 outline-none bg-transparent"
            placeholder="Go to, or search modules and actions..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="text-[11px] font-medium text-gray-400 border border-gray-200 px-2 py-0.5 rounded-md">
            ESC
          </span>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#86868b]">Nothing matches your search</div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#0071e3] text-white' : 'text-[#1d1d1f] hover:bg-gray-100/70'
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 font-medium text-[15px]">{item.label}</div>
                  <span
                    className={`text-[11px] uppercase tracking-wider ${
                      isSelected ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {item.group}
                  </span>
                  {isSelected && <CornerDownLeft className="w-4 h-4 text-white/90" />}
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Oneness Intelligence</span>
        </div>
      </div>
    </div>
  );
};
