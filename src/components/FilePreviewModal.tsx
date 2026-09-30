import React from 'react';
import { X, FileText, Folder, ExternalLink } from 'lucide-react';
import { FileRecord } from '../types';
import { store, LABELS } from '../services/store';

interface FilePreviewModalProps {
  file: FileRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCase: (caseId: string) => void;
  onOpenFolder: (caseId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onOpenCase,
  onOpenFolder,
}) => {
  if (!isOpen || !file) return null;

  const relatedCase = store.cases.find(c => c.caseId === file.caseId);
  const employee = store.employees.find(e => e.empId === file.empId);

  // Run quick sense on text to highlight extracted values
  const senseRes = store.sense({ text: file.text, name: file.name });
  const extracted = senseRes.fields || [];

  // Function to highlight matched keywords
  const renderHighlightedText = (text: string) => {
    let result = text;
    extracted.forEach(f => {
      const v = (f.value || '').trim().replace(/\s*\(.*\)$/, '');
      if (v.length > 2 && text.includes(v)) {
        // Safe regex replace
        const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="hl">$1</mark>');
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: result }} className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-[#1d1d1f]" />;
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1040px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-y-auto">
          {/* Left Column: Paper view */}
          <div className="lg:col-span-7 bg-[#ffffff] border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-inner overflow-y-auto max-h-[500px] lg:max-h-[640px]">
            {renderHighlightedText(file.text)}
          </div>

          {/* Right Column: Extracted metadata */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#86868b] mb-1">
                Sense Engine · Extracted
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight mb-4 break-words">
                {file.name}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#86868b] w-28">Type</span>
                  <span className="font-semibold text-[#1d1d1f] text-right">
                    {relatedCase ? LABELS[relatedCase.type] : senseRes.eventLabel}
                  </span>
                </div>

                <div className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#86868b] w-28">Employee</span>
                  <span className="font-medium text-[#1d1d1f] text-right">
                    {employee ? `${employee.name} (${employee.empId})` : '—'}
                  </span>
                </div>

                {extracted.map(f => {
                  if (['employee'].includes(f.key)) return null;
                  return (
                    <div
                      key={f.key}
                      className="p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-[#86868b] w-28">{f.label}</span>
                      <span className="font-medium text-[#1d1d1f] text-right">{f.value || '—'}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed mb-6">
                <b>Read-only preview</b>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Original is not changed. Extracted values are for you to check.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
              {file.caseId && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCase(file.caseId);
                    }}
                    className="btn-primary text-xs"
                  >
                    Open case
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFolder(file.caseId);
                    }}
                    className="btn-ghost text-xs"
                  >
                    Case folder
                  </button>
                </>
              )}
              <button
                disabled
                title="Drive is simulated in demo mode"
                className="btn-ghost text-xs opacity-50 cursor-not-allowed"
              >
                Open in Drive
              </button>
              <button
                onClick={onClose}
                className="btn-ghost text-xs ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
