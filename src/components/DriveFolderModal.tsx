import React from 'react';
import { X, Folder, FileText, Mail, ChevronRight } from 'lucide-react';
import { store, LABELS } from '../services/store';
import { FileRecord, DraftRecord } from '../types';

interface DriveFolderModalProps {
  caseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFile: (file: FileRecord) => void;
  onOpenDraft: (draft: DraftRecord) => void;
}

export const DriveFolderModal: React.FC<DriveFolderModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onOpenFile,
  onOpenDraft,
}) => {
  if (!isOpen || !caseId) return null;

  const currentCase = store.cases.find(c => c.caseId === caseId);
  const employee = currentCase ? store.employees.find(e => e.empId === currentCase.empId) : null;
  const files = store.files.filter(f => f.caseId === caseId);
  const drafts = store.drafts.filter(d => d.caseId === caseId && d.status !== 'Deleted');

  const path = `Oneness / HR / ${currentCase ? LABELS[currentCase.type] : 'General'} / ${employee?.name || caseId}`;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1040px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#86868b] mb-1">
            {currentCase ? LABELS[currentCase.type] : ''} · {caseId} · Documents
          </div>
          <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
            Case folder <span className="grad">in Drive.</span>
          </h2>
          <div className="text-xs text-[#86868b] mt-1 font-mono">
            {path} · demo mode (Drive off)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Files & Drafts */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-3">
                Files
              </h3>
              <div className="space-y-2">
                {files.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400">No files in case</div>
                ) : (
                  files.map(f => (
                    <div
                      key={f.fileId}
                      onClick={() => onOpenFile(f)}
                      className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl flex items-center gap-3 cursor-pointer shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center font-bold text-xs uppercase flex-none">
                        TXT
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600">
                          {f.name}
                        </div>
                        <div className="text-xs text-[#86868b] truncate mt-0.5">
                          {f.caseId} · {f.by} · {f.at}
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {f.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-3">
                Email Drafts
              </h3>
              <div className="space-y-2">
                {drafts.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400">No drafts created yet</div>
                ) : (
                  drafts.map(d => (
                    <div
                      key={d.draftId}
                      onClick={() => onOpenDraft(d)}
                      className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl flex items-center gap-3 cursor-pointer shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center flex-none">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#1d1d1f] truncate group-hover:text-blue-600">
                          {d.subject}
                        </div>
                        <div className="text-xs text-[#86868b] truncate mt-0.5">
                          To {d.to || '—'} · {d.at}
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800">
                        {d.status === 'Draft' ? 'Not sent' : d.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Drive Actions description */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                Drive Actions
              </h3>

              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <div className="font-semibold text-sm text-[#1d1d1f]">Create folder</div>
                <div className="text-xs text-[#86868b] mt-0.5">Automatic · reversible</div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <div className="font-semibold text-sm text-[#1d1d1f]">File attachment</div>
                <div className="text-xs text-[#86868b] mt-0.5">Automatic · can be moved</div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <div className="font-semibold text-sm text-[#1d1d1f]">Share with someone</div>
                <div className="text-xs text-[#86868b] mt-0.5">Needs your approval (not automatic)</div>
              </div>

              <p className="text-xs text-[#86868b] leading-relaxed pt-2 border-t border-gray-100">
                Oneness only writes reversible things. Deleting or sharing outside is never automatic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
