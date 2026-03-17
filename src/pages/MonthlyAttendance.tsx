import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, FolderKanban } from 'lucide-react';

export default function MonthlyAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const attendanceData = [
    {
      id: 1,
      employee: 'Jane Smith',
      project: 'Website Redesign',
      records: { 1: 'P', 2: 'P', 3: 'A', 4: 'P', 5: 'P', 8: 'P', 9: 'P', 10: 'H', 11: 'P', 12: 'P' }
    },
    {
      id: 2,
      employee: 'Michael Johnson',
      project: 'Mobile App Development',
      records: { 1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 8: 'P', 9: 'A', 10: 'P', 11: 'P', 12: 'P' }
    }
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'P': return 'bg-emerald-100 text-emerald-800';
      case 'A': return 'bg-red-100 text-red-800';
      case 'H': return 'bg-amber-100 text-amber-800';
      case 'L': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monthly Attendance</h1>
          <p className="text-slate-500 mt-1">View and edit attendance records for the month.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={prevMonth} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-lg font-medium text-slate-900">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                  Employee & Project
                </th>
                {days.map(day => (
                  <th key={day} className="px-2 py-3 text-xs font-semibold text-slate-900 text-center min-w-[40px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendanceData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 flex items-center text-sm">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        {row.employee}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center mt-1">
                        <FolderKanban className="w-3 h-3 mr-1 text-slate-400" />
                        {row.project}
                      </span>
                    </div>
                  </td>
                  {days.map(day => {
                    const status = (row.records as any)[day];
                    return (
                      <td key={day} className="px-1 py-3 text-center">
                        {status ? (
                          <button className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto ${getStatusColor(status)}`}>
                            {status}
                          </button>
                        ) : (
                          <button className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto bg-slate-50 text-slate-300 hover:bg-slate-100">
                            -
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center"><span className="w-3 h-3 rounded bg-emerald-100 mr-2"></span> Present (P)</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded bg-red-100 mr-2"></span> Absent (A)</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded bg-amber-100 mr-2"></span> Half Day (H)</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded bg-blue-100 mr-2"></span> Leave (L)</div>
        </div>
      </div>
    </div>
  );
}
