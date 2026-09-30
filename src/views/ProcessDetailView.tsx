import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { store, LABELS, ROLES } from '../services/store';
import { ModuleType } from '../types';

interface ProcessDetailViewProps {
  type: ModuleType;
  onBack: () => void;
  onRefresh: () => void;
}

export const ProcessDetailView: React.FC<ProcessDetailViewProps> = ({
  type,
  onBack,
  onRefresh,
}) => {
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');

  const processName = LABELS[type];
  const roleName = type === 'resignation' ? 'HR A' : 'HR Ops';

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Improve</span>
      </button>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-1.5">
        {processName}
      </h1>
      <div className="text-sm text-[#86868b] mb-8">
        {roleName} · <b>Live v1</b> · 2 open cases · avg age 11.5 days · 0 overdue steps
      </div>

      {/* Live Process Workflow Cards (Screenshot 18) */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs mb-8">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-6">
          LIVE PROCESS
        </h2>

        {/* Workflow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-6">
          {/* Step 1 */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
            <div className="font-semibold text-xs sm:text-sm text-[#1d1d1f]">
              1. Validate resignation details
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              HR A · human
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
            <div className="font-semibold text-xs sm:text-sm text-[#1d1d1f]">
              2. Confirm notice period and last working day
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              HR A · human · after 1
            </div>
          </div>

          {/* Steps 3 to 8 Column */}
          <div className="space-y-2.5">
            <div className="p-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                3. Notify reporting manager (Gmail draft)
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR A · automatic · after 2
              </div>
            </div>

            <div className="p-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                4. Check leave balance and encashment
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR B · automatic · after 2
              </div>
            </div>

            <div className="p-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                5. Add last working day to calendar
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR A · automatic · after 2
              </div>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                6. Prepare exit checklist (assets, access)
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR A · human · after 2
              </div>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                7. Check payroll and benefits impact
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR E · human · after 2
              </div>
            </div>

            <div className="p-3 bg-white border-2 border-purple-400 rounded-2xl shadow-xs">
              <div className="font-semibold text-xs text-[#1d1d1f]">
                8. Decide: replacement required?
              </div>
              <div className="text-[10px] text-[#86868b] mt-0.5">
                HR A · decision · after 2
              </div>
            </div>
          </div>

          {/* Step 9 Final */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
            <div className="font-semibold text-xs sm:text-sm text-[#1d1d1f]">
              9. Update Ramco (System of Record)
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              HR A · human · after 2,4,6,7
            </div>
          </div>
        </div>

        <div className="text-xs text-[#86868b]">
          Cases already open keep their current steps. New cases use the live version.
        </div>
      </div>

      {/* Propose a Change form */}
      <div className="p-6 bg-white border border-[#e8e8ed] rounded-3xl shadow-xs space-y-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase">
          PROPOSE A CHANGE
        </h2>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Describe the change (optional)
          </label>
          <textarea
            rows={3}
            className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs sm:text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-blue-400 font-sans resize-none"
            placeholder="e.g. Merge exit checklist into the manager task; HR B should confirm leave balance before payroll."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Why? (required)
          </label>
          <textarea
            rows={3}
            required
            className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs sm:text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-blue-400 font-sans resize-none"
            placeholder="Reason, evidence, policy or LOA reference"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              if (!reason.trim()) {
                alert('Please give a reason for the change.');
                return;
              }
              alert('Process change submitted for Manager / HOD approval.');
              setDescription('');
              setReason('');
              onRefresh();
            }}
            className="btn-primary"
          >
            Submit for approval
          </button>
        </div>
      </div>
    </div>
  );
};
