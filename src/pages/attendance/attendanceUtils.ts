export type AttendanceRecord = {
  _id?: string;
  employee_id?: string;
  employee_name?: string;
  project_id?: string;
  project_name?: string;
  date: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceRow = {
  name: string;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
};

export type AttendanceEmployee = {
  _id: string;
  name?: string;
  title?: string;
};

export type AttendanceProject = {
  _id: string;
  name?: string;
};

export type AttendanceReportType = 'employee' | 'project';

const calendarStatusMap: Record<string, string> = {
  present: 'P',
  P: 'P',
  absent: 'A',
  A: 'A',
  half_day: 'H',
  H: 'H',
  leave: 'L',
  L: 'L',
  cleared: 'C',
};

const reportStatusMap: Record<string, string> = {
  present: 'present',
  approved: 'present',
  P: 'present',
  absent: 'absent',
  rejected: 'absent',
  A: 'absent',
  half_day: 'halfDay',
  H: 'halfDay',
  leave: 'leave',
  pending: 'leave',
  L: 'leave',
  cleared: 'cleared',
};

export const normalizeCalendarStatus = (status: string) => calendarStatusMap[status] ?? status ?? 'P';

export const normalizeReportStatus = (status: string) => reportStatusMap[status] ?? 'present';

export const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const getRecordKey = (item: AttendanceRecord, reportType: AttendanceReportType) =>
  reportType === 'employee' ? item.employee_id || item.employee_name || 'Unknown' : item.project_id || item.project_name || 'Unknown';

const getRecordName = (item: AttendanceRecord, reportType: AttendanceReportType) =>
  reportType === 'employee' ? item.employee_name || 'Unknown employee' : item.project_name || 'Unknown project';

const pickLatestAttendance = (current: AttendanceRecord | undefined, candidate: AttendanceRecord) => {
  if (!current) return candidate;

  const currentTime = new Date(current.updatedAt || current.createdAt || current.date || 0).getTime();
  const candidateTime = new Date(candidate.updatedAt || candidate.createdAt || candidate.date || 0).getTime();

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime ? candidate : current;
  }

  return String(candidate._id || '').localeCompare(String(current._id || '')) > 0 ? candidate : current;
};

export const buildAttendanceReportRows = ({
  attendance,
  employees,
  projects,
  currentMonth,
  reportType,
}: {
  attendance: AttendanceRecord[];
  employees: AttendanceEmployee[];
  projects: AttendanceProject[];
  currentMonth: Date;
  reportType: AttendanceReportType;
}) => {
  const monthAttendance = attendance.filter((item) => {
    const date = new Date(item.date);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
  });

  const dedupedAttendance = new Map<string, AttendanceRecord>();
  monthAttendance.forEach((item) => {
    const key = `${String(item.employee_id || item.employee_name || 'Unknown')}|${String(item.project_id || item.project_name || 'Unknown')}|${item.date}`;
    dedupedAttendance.set(key, pickLatestAttendance(dedupedAttendance.get(key), item));
  });

  const rows = new Map<string, AttendanceRow>();
  const dayStatusByRow = new Map<string, Map<number, string>>();

  const seedRows = reportType === 'employee'
    ? employees.map((employee) => [String(employee._id), employee.name || employee.title || 'Employee'])
    : projects.map((project) => [String(project._id), project.name || 'Project']);

  seedRows.forEach(([key, name]) => {
    rows.set(key, { name, present: 0, absent: 0, halfDay: 0, leave: 0 });
  });

  dedupedAttendance.forEach((item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) return;

    const key = getRecordKey(item, reportType);
    if (!rows.has(key)) {
      rows.set(key, { name: getRecordName(item, reportType), present: 0, absent: 0, halfDay: 0, leave: 0 });
    }

    const dayStatusMap = dayStatusByRow.get(key) || new Map<number, string>();
    dayStatusMap.set(date.getDate(), normalizeReportStatus(item.status));
    dayStatusByRow.set(key, dayStatusMap);
  });

  const today = new Date();
  const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  const lastDayToConsider = isCurrentMonth ? today.getDate() : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  rows.forEach((row, key) => {
    const dayStatusMap = dayStatusByRow.get(key) || new Map<number, string>();

    for (let day = 1; day <= lastDayToConsider; day += 1) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (isWeekend(currentDate)) continue;

      const explicitStatus = dayStatusMap.get(day);
      if (explicitStatus) {
        if (explicitStatus === 'present') row.present += 1;
        else if (explicitStatus === 'absent') row.absent += 1;
        else if (explicitStatus === 'halfDay') row.halfDay += 1;
        else if (explicitStatus === 'leave') row.leave += 1;
        continue;
      }

      if (isCurrentMonth && day <= today.getDate()) {
        row.present += 1;
      }
    }
  });

  // Preserve the seed order (employees or projects) so UI order doesn't jump when counts change.
  const ordered: AttendanceRow[] = [];
  const seen = new Set<string>();

  // add rows in the same order as seedRows
  seedRows.forEach(([key]) => {
    const r = rows.get(key);
    if (r) {
      ordered.push(r);
      seen.add(key);
    }
  });

  // append any additional rows that were not in the seed (e.g., attendance for unknown items)
  rows.forEach((r, key) => {
    if (!seen.has(key)) ordered.push(r);
  });

  return ordered;
};