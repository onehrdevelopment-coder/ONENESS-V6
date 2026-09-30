import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { MenuStyle } from '../types';
import { store } from '../services/store';

interface MenuStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: MenuStyle;
  onSelectStyle: (style: MenuStyle) => void;
}

export const MenuStyleModal: React.FC<MenuStyleModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  const styles: Array<{ id: MenuStyle; label: string; desc: string }> = [
    { id: 'dock', label: 'Dock (default)', desc: 'Icons at the bottom, magnify on hover. Default.' },
    { id: 'capsule', label: 'Capsule', desc: 'Floating glass capsule at the top with a Modules popover.' },
    { id: 'toolbar', label: 'Toolbar', desc: 'Segmented toolbar with a row of module tabs.' },
    { id: 'sidebar', label: 'Sidebar', desc: 'Glass sidebar from the left edge. Good for many modules.' },
    { id: 'mega', label: 'Mega menu', desc: 'One big panel: navigate, modules, account.' },
    { id: 'launchpad', label: 'Launchpad', desc: 'Full-screen grid of everything.' },
    { id: 'spotlight', label: 'Spotlight only', desc: 'No visible menu. Search and jump with Ctrl/Cmd+K.' },
  ];

  const handleSelect = (id: MenuStyle) => {
    store.menuStyle = id;
    store.save();
    onSelectStyle(id);
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-3xl p-7 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Menu style</h3>
            <p className="text-xs text-[#86868b]">Saved on this device</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {styles.map(item => {
            const isSelected = item.id === currentStyle;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0071e3] bg-blue-50/50 shadow-xs'
                    : 'border-[#e8e8ed] hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-[#86868b] mt-1 leading-snug">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
