import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { store } from '../services/store';
import { Employee } from '../types';

interface PeopleViewProps {
  onSelectPerson: (empId: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ onSelectPerson }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'On notice' | 'Union' | 'Probation' | 'Has open case'>('All');

  const employees = store.employees;
  const cases = store.cases;

  const getOpenCasesCount = (empId: string) => {
    return cases.filter(c => c.empId === empId && c.status !== 'Closed').length;
  };

  const filteredEmployees = employees.filter(e => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.empId.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    const openCount = getOpenCasesCount(e.empId);

    if (filter === 'Active') return e.status === 'Active';
    if (filter === 'On notice') return e.status === 'On notice' || (e.status === 'Active' && openCount > 0);
    if (filter === 'Union') return e.category === 'Union';
    if (filter === 'Probation') return e.status === 'Probation';
    if (filter === 'Has open case') return openCount > 0;
    return true;
  });

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
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <div className="text-xs font-semibold tracking-[0.2em] text-[#86868b] uppercase mb-1.5">
        PEOPLE
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-6">
        Employees
      </h1>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f5f5f7] border-0 text-sm text-[#1d1d1f] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search name, ID, department..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Active', 'On notice', 'Union', 'Probation', 'Has open case'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab ? 'bg-[#1d1d1f] text-white font-semibold' : 'text-[#6e6e73] hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e8ed] rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#e8e8ed] text-[11px] font-semibold uppercase tracking-wider text-[#86868b] bg-gray-50/50">
              <tr>
                <th className="py-3.5 px-6">NAME</th>
                <th className="py-3.5 px-4">POSITION</th>
                <th className="py-3.5 px-4">DEPT</th>
                <th className="py-3.5 px-4">GRADE</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-6 text-right">OPEN CASES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    No matching employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(e => {
                  const openCount = getOpenCasesCount(e.empId);
                  return (
                    <tr
                      key={e.empId}
                      onClick={() => onSelectPerson(e.empId)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-50 to-orange-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 flex-none group-hover:scale-105 transition-transform">
                            {getInitials(e.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#1d1d1f] group-hover:text-blue-600 transition-colors">
                              {e.name}
                            </div>
                            <div className="text-[11px] text-[#86868b] font-mono mt-0.5">
                              {e.empId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{e.position}</td>
                      <td className="py-3.5 px-4 text-gray-600">{e.dept}</td>
                      <td className="py-3.5 px-4 text-gray-600">{e.grade}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-medium text-gray-700">
                        {openCount > 0 ? openCount : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
