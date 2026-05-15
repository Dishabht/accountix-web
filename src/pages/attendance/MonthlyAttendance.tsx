import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { normalizeCalendarStatus } from './attendanceUtils';

type AttendanceRow = {
  id: string;
  employeeId: string;
  projectId: string;
  employee: string;
  role: string;
  project: string;
  records: Record<number, string>;
};

type EmployeeItem = {
  _id: string;
  name?: string;
  title?: string;
};

type AttendanceItem = {
  _id?: string;
  id?: string;
  employee_id: string;
  project_id?: string;
  employee_name?: string;
  project_name?: string;
  date: string;
  status: string;
};

export default function MonthlyAttendance() {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [attendanceRaw, setAttendanceRaw] = useState<AttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const getCalendarDaysWithInitials = () => {
    const result = [];
    const dayInitials = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
      result.push({ day, initial: dayInitials[dayOfWeek], isWeekend: dayOfWeek === 0 || dayOfWeek === 6 });
    }

    return result;
  };

  const calendarDaysWithInitials = getCalendarDaysWithInitials();

  const buildRowsForMonth = (employees: EmployeeItem[], attendance: AttendanceItem[]) => {
    const rowMap = new Map<string, AttendanceRow>();
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const today = new Date();
    const lastDayToConsider =
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : new Date(year, month + 1, 0).getDate();
    const employeeMap = new Map(
      employees.map((employee) => [String(employee._id), employee])
    );

    attendance.forEach((item) => {
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return;
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      // NOTE: we intentionally include future records so saved future attendance
      // remains visible in the calendar. Counting/aggregation logic elsewhere
      // should use `lastDayToConsider` when computing summaries.

      const employeeId = String(item.employee_id || '');
      const projectId = String(item.project_id || '');
      const rowId = projectId ? `${employeeId}:${projectId}` : employeeId;
      const day = date.getDate();

      const existingRow = rowMap.get(rowId) || rowMap.get(employeeId);
      const employeeName = item.employee_name || existingRow?.employee || 'Employee';
      const employeeRole = employeeMap.get(employeeId)?.title || existingRow?.role || 'Role';
      const projectName = item.project_name || existingRow?.project || 'N/A';

      const nextRow: AttendanceRow = existingRow
        ? {
            ...existingRow,
            id: rowId,
            employeeId,
            projectId,
            employee: employeeName,
            role: employeeRole,
            project: projectName,
            records: {
              ...existingRow.records,
              [day]: normalizeCalendarStatus(item.status),
            },
          }
        : {
            id: rowId,
            employeeId,
            projectId,
            employee: employeeName,
            role: employeeRole,
            project: projectName,
            records: { [day]: normalizeCalendarStatus(item.status) },
          };

      rowMap.set(rowId, nextRow);
    });

    employees.forEach((employee) => {
      const employeeId = String(employee._id);
      const hasEmployeeRow = Array.from(rowMap.values()).some((row) => row.employeeId === employeeId);

      if (!hasEmployeeRow) {
        rowMap.set(employeeId, {
          id: employeeId,
          employeeId,
          projectId: '',
          employee: employee.name || employee.title || 'Employee',
          role: employee.title || 'Role',
          project: 'N/A',
          records: {},
        });
      }
    });

    return Array.from(rowMap.values());
  };

  const loadMonthlyAttendance = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [employeesData, attendanceDataResponse] = await Promise.all([
        api.get('/employees', token),
        api.get('/attendance', token),
      ]);

      const employeesList = Array.isArray(employeesData) ? employeesData : [];
      const attendanceList = Array.isArray(attendanceDataResponse) ? attendanceDataResponse : [];

      const rows = buildRowsForMonth(employeesList, attendanceList);

      setAttendanceRaw(attendanceList);
      setAttendanceData(rows);
    } catch (error) {
      console.error('Failed to load monthly attendance data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlyAttendance();
  }, [token, currentMonth.getFullYear(), currentMonth.getMonth()]);

  useEffect(() => {
    const handleRefresh = () => {
      loadMonthlyAttendance();
    };

    const handleStorageRefresh = (event: StorageEvent) => {
      if (event.key === 'attendance:updated') {
        loadMonthlyAttendance();
      }
    };

    window.addEventListener('attendance:updated', handleRefresh);
    window.addEventListener('storage', handleStorageRefresh);
    return () => {
      window.removeEventListener('attendance:updated', handleRefresh);
      window.removeEventListener('storage', handleStorageRefresh);
    };
  }, [token, currentMonth.getFullYear(), currentMonth.getMonth()]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSelection, setEditorSelection] = useState<{ rowId: string; day: number | null } | null>(null);
  const [editorStatus, setEditorStatus] = useState<string>('P');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  const openEditor = (rowId: string, day: number | null) => {
    if (!day) return;
    const row = attendanceData.find((item) => item.id === rowId);
    setEditorSelection({ rowId, day });
    // if the stored status is cleared marker 'C', open editor with empty selection
    const stored = row && row.records[day];
    setEditorStatus(stored === 'C' ? '' : (stored ?? 'P'));
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorSelection(null);
  };

  const saveEditor = () => {
    if (!editorSelection) return;
    (async () => {
      const selection = editorSelection;
      const row = attendanceData.find((r) => r.id === selection.rowId);
      if (!row) return closeEditor();

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // 1-based
      const day = selection.day!;
      const pad = (n: number) => String(n).padStart(2, '0');
      const isoDate = `${year}-${pad(month)}-${pad(day)}`;

      const statusMap: Record<string, string> = { P: 'present', A: 'absent', H: 'half_day', L: 'leave', '': 'cleared' };
      const toStatus = statusMap[editorStatus] ?? 'present';

      try {
        // find existing attendance record for this employee/project/date
        const existing = attendanceRaw.find((a) => {
          const d = new Date(a.date);
          if (Number.isNaN(d.getTime())) return false;
          return (
            String(a.employee_id) === String(row.employeeId) &&
            d.getFullYear() === year &&
            d.getMonth() === currentMonth.getMonth() &&
            d.getDate() === day &&
            String(a.project_id || '') === String(row.projectId || '')
          );
        });

        if (existing) {
          // update status (including 'cleared')
          console.debug('Updating attendance', { id: existing.id || existing._id, toStatus });
          const res = await api.put(`/attendance/${existing.id || existing._id}`, token, { status: toStatus });
          console.debug('Update response', res);
        } else {
          // create new attendance (can be 'cleared')
          console.debug('Creating attendance', { employee: row.employeeId, project: row.projectId, date: isoDate, toStatus });
          const res = await api.post('/attendance', token, {
            employee_id: row.employeeId,
            project_id: row.projectId || undefined,
            date: isoDate,
            hours: 8,
            status: toStatus,
            notes: '',
          });
          console.debug('Create response', res);
        }

        // reload authoritative data
        await loadMonthlyAttendance();

        // notify other listeners
        try {
          localStorage.setItem('attendance:updated', String(Date.now()));
          window.dispatchEvent(new Event('attendance:updated'));
        } catch (e) {
          console.debug('Failed to dispatch attendance:updated', e);
        }

        // show confirmation UI
        setSaveMessage('Attendance saved');
        setSaveSuccess(true);
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        console.error('Failed to save attendance from calendar', error);
        setSaveMessage('Failed to save attendance');
        setSaveSuccess(false);
        setTimeout(() => setSaveMessage(null), 5000);
      } finally {
        closeEditor();
      }
    })();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'P':
        return 'bg-emerald-100 text-emerald-800';
      case 'A':
        return 'bg-red-100 text-red-800';
      case 'H':
        return 'bg-amber-100 text-amber-800';
      case 'L':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-50 text-slate-400';
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
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-4 py-2 text-sm font-semibold text-slate-900 sticky left-0 bg-slate-100 z-10 min-w-[200px]"></th>
                {calendarDaysWithInitials.map((item, index) => (
                  <th key={index} className="px-2 py-2 text-xs font-semibold text-slate-700 text-center min-w-[40px]">
                    {item.initial}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2 text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                  Employee
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
                      <span className="text-xs text-slate-400 flex items-center mt-1 pl-4">
                        {row.role}
                      </span>
                    </div>
                  </td>
                  {calendarDaysWithInitials.map((item, index) => {
                    const rawStatus = row.records[item.day]; // could be 'P','A','H','L','C' or undefined
                    const today = new Date();
                    const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
                    // do not auto-present if status explicitly cleared ('C')
                    const isCleared = rawStatus === 'C';
                    const shouldAutoPresent = rawStatus == null && !item.isWeekend && isCurrentMonth && item.day <= today.getDate();
                    const displayStatus = isCleared ? null : (rawStatus ?? (shouldAutoPresent ? 'P' : null));

                    return (
                      <td key={index} className={`px-1 py-3 text-center ${item.isWeekend ? 'bg-slate-100/40' : ''}`}>
                        {isCleared ? (
                          <button
                            onClick={() => openEditor(row.id, item.day)}
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto bg-slate-50 text-slate-300 hover:bg-slate-100"
                          >
                            -
                          </button>
                        ) : displayStatus ? (
                          <button
                            onClick={() => openEditor(row.id, item.day)}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto ${getStatusColor(displayStatus)}`}
                          >
                            {displayStatus}
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditor(row.id, item.day)}
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium mx-auto bg-slate-50 text-slate-300 hover:bg-slate-100"
                          >
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

        {isLoading && attendanceData.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-500 border-t border-slate-200">Chargement des employés et des présences...</div>
        )}

        {isEditorOpen && editorSelection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={closeEditor}></div>
            <div className="relative bg-white rounded-2xl p-6 w-80 shadow-lg ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Edit Attendance</h3>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), editorSelection.day ?? 1).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
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
                <button onClick={closeEditor} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={saveEditor} className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm ${
            saveSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded bg-emerald-100 mr-2"></span> Present (P)
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded bg-red-100 mr-2"></span> Absent (A)
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded bg-amber-100 mr-2"></span> Half Day (H)
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded bg-blue-100 mr-2"></span> Leave (L)
          </div>
        </div>
      </div>
    </div>
  );
}
