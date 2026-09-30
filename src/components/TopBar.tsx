import React, { useState, useEffect } from 'react';

interface TopBarProps {
  onLogoClick: () => void;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onLogoClick, onOpenMobileMenu }) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setDateStr(
        d.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
      setTimeStr(
        d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative w-full h-12 px-7 flex items-center justify-between border-b border-[#e8e8ed] bg-[#fbfbfd]/80 backdrop-blur-md z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onLogoClick}
          className="text-base font-bold text-[#1d1d1f] tracking-tight hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
        >
          Oneness
        </button>
      </div>

      {/* Subtle grab bar indicator */}
      <div className="w-12 h-1 rounded-full bg-black/15 pointer-events-none hidden sm:block" />

      {/* Date & Time */}
      <div className="flex items-baseline gap-2 text-[11px] text-[#86868b]">
        <span>{dateStr}</span>
        <span className="font-semibold text-xs text-[#1d1d1f]">{timeStr}</span>
      </div>
    </header>
  );
};
