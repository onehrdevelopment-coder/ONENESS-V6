import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Sparkles } from 'lucide-react';
import { store } from '../services/store';
import { SampleDoc } from '../types';

interface SenseViewProps {
  onBack: () => void;
  onSenseFile: (file: File) => void;
  onSenseText: (text: string, name?: string) => void;
}

export const SenseView: React.FC<SenseViewProps> = ({
  onBack,
  onSenseFile,
  onSenseText,
}) => {
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const samples = store.samples;

  const handleSampleClick = (s: SampleDoc) => {
    setPastedText(s.text);
    onSenseText(s.text, s.filename);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSenseFile(file);
      e.target.value = '';
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

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">
        Sense
      </h1>
      <p className="text-sm text-[#86868b] mb-8 leading-relaxed max-w-2xl">
        Drop a file anywhere on the screen, paste text, or try a test scenario. Oneness shows what it thinks happened before creating anything.
      </p>

      {/* Drop / Choose File Card */}
      <div className="p-8 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs text-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.eml,.csv,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-lg sm:text-xl font-bold text-[#1d1d1f] mb-3">
          Drop a PDF anywhere, or
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary mb-3"
        >
          <Upload className="w-4 h-4 mr-1" />
          Choose a file
        </button>
        <div className="text-xs text-[#86868b]">
          PDF (with text), TXT or EML. Scanned images need OCR (later).
        </div>
      </div>

      {/* Paste Text Card */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-8">
        <textarea
          rows={5}
          className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-blue-400 font-sans resize-none mb-3"
          placeholder="Or paste the document text here..."
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={() => onSenseText(pastedText, 'pasted text')}
            disabled={!pastedText.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Sense this
          </button>
        </div>
      </div>

      {/* Test scenarios (25 samples) */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-4">
          TEST SCENARIOS (SYNTHETIC)
        </h2>

        <div className="space-y-2">
          {samples.map(s => (
            <div
              key={s.id}
              onClick={() => handleSampleClick(s)}
              className="p-3.5 bg-white border border-[#e8e8ed] hover:border-blue-400 rounded-2xl flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600 transition-colors">
                  {s.id}: {s.label}
                </div>
                <div className="text-xs text-[#86868b] truncate mt-0.5 font-mono">
                  {s.filename}
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium flex-none">
                {s.scenario}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
