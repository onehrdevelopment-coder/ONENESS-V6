import React from 'react';
import { Upload } from 'lucide-react';

interface DropOverlayProps {
  isDragging: boolean;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#3c3c40]/70 backdrop-blur-xl text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="w-36 h-36 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mb-7 animate-pulse">
        <Upload className="w-14 h-14 stroke-[1.5]" />
      </div>

      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
        Drop anywhere to Sense.
      </h2>

      <p className="text-base text-white/85 max-w-md leading-relaxed mb-6 font-normal">
        Oneness will identify what it is, who it relates to, which policy applies, and who must act.
      </p>

      <div className="text-xs font-mono tracking-widest text-white/70 uppercase">
        SENSE &rarr; IDENTIFY &rarr; UNDERSTAND &rarr; CLASSIFY &rarr; ROUTE
      </div>
    </div>
  );
};
