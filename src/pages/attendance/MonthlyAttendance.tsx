import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, FolderKanban } from 'lucide-react';

export default function MonthlyAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Create calendar with proper week alignment and day initials
  const getCalendarDaysWithInitials = () => {
    const result = [];
    const dayInitials = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Add all days of the month (including weekends)
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
      result.push({ day, initial: dayInitials[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 });
    }
    
    return result;
  };

  const calendarDaysWithInitials = getCalendarDaysWithInitials();

  const initialAttendance = [
    {
      id: 1,
      employee: 'Jane Smith',
      project: 'Website Redesign',
      records: {}
    },
    {
      id: 2,
      employee: 'Michael Johnson',
      project: 'Mobile App Development',
      records: {}
    }
  ];

  const [attendanceData, setAttendanceData] = useState(initialAttendance);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSelection, setEditorSelection] = useState<{ rowId: number; day: number | null } | null>(null);
  const [editorStatus, setEditorStatus] = useState<string>('P');

  const openEditor = (rowId: number, day: number | null) => {
    if (!day) return;
    const row = attendanceData.find((r) => r.id === rowId);
    setEditorSelection({ rowId, day });
    setEditorStatus((row && (row.records as any)[day]) ?? 'P');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorSelection(null);
  };

  const saveEditor = () => {
    if (!editorSelection) return;
    setAttendanceData((prev) =>
      prev.map((r) => {
        if (r.id !== editorSelection.rowId) return r;
        const records = { ...(r.records as any) };
        if (editorStatus) records[editorSelection.day!] = editorStatus;
        else delete records[editorSelection.day!];
        return { ...r, records };
      })
    );
    closeEditor();
  };

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
            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
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
              {/* Week day initials row */}
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-4 py-2 text-sm font-semibold text-slate-900 sticky left-0 bg-slate-100 z-10 min-w-[200px]">
                </th>
                {calendarDaysWithInitials.map((item, index) => (
                  <th key={index} className="px-2 py-2 text-xs font-semibold text-slate-700 text-center min-w-[40px]">
                    {item.initial}
                  </th>
                ))}
              </tr>
              {/* Day numbers row */}
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2 text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                  Employee & Project
                </th>
                  {calendarDaysWithInitials.map((item, index) => (
                  <th key={index} className="px-2 py-2 text-xs font-semibold text-slate-900 text-center min-w-[40px]">
                    <div>{item.day || ''}</div>
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
                  {calendarDaysWithInitials.map((item, index) => {
                    const rawStatus = (row.records as any)[item.day];
                    const today = new Date();
                    const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
                    const shouldAutoPresent = !rawStatus && !item.isWeekend && isCurrentMonth && item.day <= today.getDate();
                    const status = rawStatus ?? (shouldAutoPresent ? 'P' : null);

                    return (
                      <td key={index} className={`px-1 py-3 text-center ${item.isWeekend ? 'bg-slate-100/40' : ''}`}>
                        {status ? (
                          <button onClick={() => openEditor(row.id, item.day)} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto ${getStatusColor(status)}`}>
                            {status}
                          </button>
                        ) : (
                          <button onClick={() => openEditor(row.id, item.day)} className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto bg-slate-50 text-slate-300 hover:bg-slate-100">
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
        {/* Editor modal */}
        {isEditorOpen && editorSelection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={closeEditor}></div>
            <div className="relative bg-white rounded-2xl p-6 w-80 shadow-lg ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Edit Attendance</h3>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), editorSelection.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditorStatus('P')}
                    className={`px-3 py-2 rounded-md text-sm font-normal transition flex items-center gap-2 ${editorStatus === 'P' ? 'bg-white border border-emerald-500' : 'bg-white border border-slate-200'}`}
                  >
                    <span className="w-3 h-3 rounded bg-emerald-100"></span>
                    Present (P)
                  </button>
                  <button
                    onClick={() => setEditorStatus('A')}
                    className={`px-3 py-2 rounded-md text-sm font-normal transition flex items-center gap-2 ${editorStatus === 'A' ? 'bg-white border border-red-500' : 'bg-white border border-slate-200'}`}
                  >
                    <span className="w-3 h-3 rounded bg-red-100"></span>
                    Absent (A)
                  </button>
                  <button
                    onClick={() => setEditorStatus('H')}
                    className={`px-3 py-2 rounded-md text-sm font-normal transition flex items-center gap-2 ${editorStatus === 'H' ? 'bg-white border border-amber-500' : 'bg-white border border-slate-200'}`}
                  >
                    <span className="w-3 h-3 rounded bg-amber-100"></span>
                    Half Day (H)
                  </button>
                  <button
                    onClick={() => setEditorStatus('L')}
                    className={`px-3 py-2 rounded-md text-sm font-normal transition flex items-center gap-2 ${editorStatus === 'L' ? 'bg-white border border-blue-500' : 'bg-white border border-slate-200'}`}
                  >
                    <span className="w-3 h-3 rounded bg-blue-100"></span>
                    Leave (L)
                  </button>
                </div>
                <button
                  onClick={() => setEditorStatus('')}
                  className={`w-full mt-2 px-3 py-2 rounded-md text-sm font-normal transition ${editorStatus === '' ? 'bg-white border border-slate-500' : 'bg-white border border-slate-200'}`}
                >
                  Clear
                </button>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={closeEditor} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50">Cancel</button>
                <button onClick={saveEditor} className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">Save</button>
              </div>
            </div>
          </div>
        )}
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
