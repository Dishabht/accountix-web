import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import { Download, CheckCircle2, XCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';
import { buildAttendanceReportRows, type AttendanceEmployee, type AttendanceProject, type AttendanceRecord, type AttendanceReportType, type AttendanceRow, normalizeReportStatus } from './attendanceUtils';

export default function AttendanceReports() {
  const { token } = useAuth();
  const [reportType, setReportType] = useState('employee');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<AttendanceEmployee[]>([]);
  const [projects, setProjects] = useState<AttendanceProject[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const exportPdf = async () => {
    console.debug('exportPdf invoked', { monthKey, groupedDataLength: groupedData.length });
    if (!groupedData.length) {
      alert('No saved attendance data to export.');
      return false;
    }

    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const left = 12;
      const right = 12;
      const contentWidth = pageWidth - left - right;
      const rowHeight = 8;
      const headerHeight = 10;
      const maxRowsPerPage = Math.floor((pageHeight - 55) / rowHeight);

      const reportLabel = reportType === 'employee' ? 'Per Employee' : 'Per Project';
      const title = 'Attendance Details';
      const subtitle = `${currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })} - ${reportLabel}`;

      const rows = groupedData.map((row) => [row.name, String(row.present), String(row.absent), String(row.halfDay), String(row.leave)]);

      const drawHeader = () => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(title, left, 16);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(subtitle, left, 22);

        const tableTop = 38;
        const cols = [contentWidth * 0.46, contentWidth * 0.14, contentWidth * 0.14, contentWidth * 0.13, contentWidth * 0.13];
        const xPositions = [left, left + cols[0], left + cols[0] + cols[1], left + cols[0] + cols[1] + cols[2], left + cols[0] + cols[1] + cols[2] + cols[3]];

        pdf.setDrawColor(226, 232, 240);
        pdf.line(left, 32, left + contentWidth, 32);
        pdf.setFillColor(248, 250, 252);
        pdf.rect(left, tableTop - 7, contentWidth, headerHeight, 'F');
        pdf.setDrawColor(203, 213, 225);
        pdf.rect(left, tableTop - 7, contentWidth, headerHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text('Name', xPositions[0] + 2, tableTop);
        pdf.text('Present', xPositions[1] + cols[1] / 2, tableTop, { align: 'center' });
        pdf.text('Absent', xPositions[2] + cols[2] / 2, tableTop, { align: 'center' });
        pdf.text('Half Day', xPositions[3] + cols[3] / 2, tableTop, { align: 'center' });
        pdf.text('Leave', xPositions[4] + cols[4] / 2, tableTop, { align: 'center' });

        return { tableTop, cols, xPositions };
      };

      let { tableTop, cols, xPositions } = drawHeader();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      let rowIndexOnPage = 0;

      rows.forEach((row, index) => {
        if (rowIndexOnPage >= maxRowsPerPage) {
          pdf.addPage();
          ({ tableTop, cols, xPositions } = drawHeader());
          rowIndexOnPage = 0;
        }

        const y = tableTop + 6 + rowIndexOnPage * rowHeight;
        const fill = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        pdf.setFillColor(fill[0], fill[1], fill[2]);
        pdf.rect(left, y - 5, contentWidth, rowHeight, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(left, y - 5, contentWidth, rowHeight);

        const cellTexts = [row[0], row[1], row[2], row[3], row[4]];
        cellTexts.forEach((text, cellIndex) => {
          const x = cellIndex === 0 ? xPositions[cellIndex] + 2 : xPositions[cellIndex] + cols[cellIndex] / 2;
          const maxWidth = cols[cellIndex] - 4;
          if (cellIndex === 0) {
            pdf.text(pdf.splitTextToSize(text, maxWidth), x, y);
          } else {
            pdf.text(text, x, y, { align: 'center' });
          }
        });

        rowIndexOnPage += 1;
      });

      const fileName = `attendance-${monthKey}-${reportType}.pdf`;
      pdf.save(fileName);
      console.debug('exportPdf success', { file: fileName });
      return true;
    } catch (err: any) {
      console.error('Export PDF failed', err);
      const msg = err?.message || String(err);
      alert(`Export failed: ${msg}. See console for details.`);
      return false;
    }
  };

  const exportPayrollAll = async () => {
    console.debug('exportPayrollAll invoked', { monthKey, payrollDataLength: payrollData?.length });
    if (!payrollData || payrollData.length === 0) {
      alert('No payroll data to export.');
      return false;
    }

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;

      // Header (right-aligned)
      const reportTitle = 'Payroll Summary Report';
      const monthLabel = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const generatedAt = new Date().toLocaleString();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleWidth = doc.getTextWidth(reportTitle);
      doc.text(reportTitle, pageWidth - margin - titleWidth, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const periodLine = `Period: ${monthLabel}`;
      const genLine = `Generated: ${generatedAt}`;
      const periodWidth = doc.getTextWidth(periodLine);
      const genWidth = doc.getTextWidth(genLine);
      doc.text(periodLine, pageWidth - margin - periodWidth, 22);
      doc.text(genLine, pageWidth - margin - genWidth, 28);

      // Thick dark separator under header
      doc.setDrawColor(26, 26, 46); // #1a1a2e
      doc.setLineWidth(2);
      doc.line(margin, 32, pageWidth - margin, 32);

      // Table
      const tableY = 36;
      const head = [['Employee', 'Project', 'Present', 'Absent', 'Half Days', 'Leave', 'Total Hours', 'Pay Rate', 'Salary']];
      const body = payrollData.map((r: any) => [
        r.employeeName,
        r.projectName,
        String(r.presentDays || 0),
        String(r.absentDays || 0),
        String(r.halfDay || 0),
        String(r.leaveDays || 0),
        String(r.hours || 0),
        `$${Number(r.payRate || 0).toFixed(2)}`,
        `$${Number(r.salary || 0).toFixed(2)}`,
      ]);

      const totalPayrollAmount = payrollData.reduce((s: number, r: any) => s + (r.salary || 0), 0);

      autoTable(doc, {
        startY: tableY,
        head: head,
        body: body,
        foot: [[
          { content: `TOTAL : $${totalPayrollAmount.toFixed(2)}`, colSpan: 9, styles: { halign: 'right', textColor: 255, fillColor: [26, 26, 46], fontStyle: 'bold', cellPadding: { top: 4, right: 7, bottom: 4, left: 6 } } },
        ]],
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [26, 26, 46], textColor: 255 },
        alternateRowStyles: { fillColor: [247, 248, 252] },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'left' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'right' },
        },
        didParseCell: function (data: any) {
          // Absent column highlight (index 3)
          if (data.section === 'body' && data.column.index === 3) {
            const val = Number(data.cell.raw);
            if (val > 0) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawCell: function (data: any) {
          // thin borders
          const { cell } = data;
          if (cell) {
            doc.setDrawColor(229, 231, 235);
            doc.rect(cell.x, cell.y, cell.width, cell.height);
          }
        },
      });

      // Footer: thin separator, centered italic gray text, right page numbering
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : tableY + 10;
      doc.setLineWidth(0.4);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      const conf = 'Confidential — For internal use only';
      doc.text(conf, pageWidth / 2 - doc.getTextWidth(conf) / 2, pageHeight - 8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const pageText = 'Page 1 of 1';
      doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 8);

      const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });
      const fileName = `Payroll_${monthName}_${currentMonth.getFullYear()}.pdf`;
      doc.save(fileName);
      console.debug('exportPayrollAll success', { file: fileName });
      return true;
    } catch (err: any) {
      console.error('Export payroll failed', err);
      const msg = err?.message || String(err);
      alert(`Payroll export failed: ${msg}. See console for details.`);
      return false;
    }
  };

  const exportPayrollIndividual = async () => {
    if (!payrollData || payrollData.length === 0) {
      alert('No payroll data to export.');
      return;
    }

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      const jspdfGlobal = (window as any).jspdf || (window as any).jsPDF || (window as any).jspdf?.default || (window as any).jspdf;
      const jsPDF = jspdfGlobal?.jsPDF || jspdfGlobal;
      if (!jsPDF) throw new Error('jsPDF failed to load');

      for (const r of payrollData) {
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Payroll Detail', 12, 16);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`${r.employeeName} — ${r.projectName}`, 12, 24);

        const lines = [
          ['Present days', String(r.presentDays || 0)],
          ['Absent days', String(r.absentDays || 0)],
          ['Half days', String(r.halfDay || 0)],
          ['Leave days', String(r.leave || 0)],
          ['Total hours', String(r.hours || 0)],
          ['Pay rate ($/hr)', `$${(r.payRate || 0).toFixed(2)}`],
          ['Calculated salary', `$${(r.salary || 0).toFixed(2)}`],
          ['Status', r.statut || ''],
        ];

        pdf.setFontSize(10);
        lines.forEach((ln, i) => {
          pdf.text(ln[0], 12, 36 + i * 8);
          pdf.text(String(ln[1]), 120, 36 + i * 8, { align: 'right' });
        });

        const safeName = (r.employeeName || 'employee').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`payroll-${safeName}-${monthKey}.pdf`);
      }
    } catch (err: any) {
      console.error('Export individual payroll failed', err);
      alert('Payroll export failed.');
    }
  };

  const exportPayrollRow = async (r: any) => {
    console.debug('exportPayrollRow invoked', { row: r, monthKey });
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Payroll Detail', 12, 16);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`${r.employeeName} — ${r.projectName}`, 12, 24);

      const lines = [
        ['Present days', String(r.presentDays || 0)],
        ['Absent days', String(r.absentDays || 0)],
        ['Half days', String(r.halfDay || 0)],
        ['Leave days', String(r.leave || 0)],
        ['Total hours', String(r.hours || 0)],
        ['Pay rate ($/hr)', `$${(r.payRate || 0).toFixed(2)}`],
        ['Calculated salary', `$${(r.salary || 0).toFixed(2)}`],
      ];

      pdf.setFontSize(10);
      lines.forEach((ln, i) => {
        pdf.text(ln[0], 12, 36 + i * 8);
        pdf.text(String(ln[1]), 120, 36 + i * 8, { align: 'right' });
      });

      const safeName = (r.employeeName || 'employee').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `payroll-${safeName}-${monthKey}.pdf`;
      pdf.save(fileName);
      console.debug('exportPayrollRow success', { file: fileName });
      alert(`Exported payroll for ${r.employeeName} (${r.projectName}).`);
      return true;
    } catch (err: any) {
      console.error('Export individual payroll failed', err);
      alert(`Payroll export failed: ${err?.message || String(err)}`);
      return false;
    }
  };

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const loadAttendance = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [attendanceData, employeesData, projectsData, assignmentsData] = await Promise.all([
          api.get('/attendance', token),
          api.get('/employees', token),
          api.get('/projects', token),
          api.get('/assignments', token),
        ]);

        const list = Array.isArray(attendanceData) ? attendanceData : [];
        console.debug('AttendanceReports: loaded attendance', list.length);
        setAttendance(list);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (error) {
        console.error('Failed to load attendance report data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendance();

    const handleRefresh = () => {
      console.debug('AttendanceReports: received attendance:updated, reloading');
      loadAttendance();
    };
    const handleStorageRefresh = (event: StorageEvent) => {
      if (event.key === 'attendance:updated') {
        console.debug('AttendanceReports: storage refresh detected, reloading');
        loadAttendance();
      }
    };
    window.addEventListener('attendance:updated', handleRefresh);
    window.addEventListener('storage', handleStorageRefresh);
    return () => {
      window.removeEventListener('attendance:updated', handleRefresh);
      window.removeEventListener('storage', handleStorageRefresh);
    };
  }, [token]);

  

  const groupedData = useMemo<AttendanceRow[]>(
    () =>
      buildAttendanceReportRows({
        attendance,
        employees,
        projects,
        currentMonth,
        reportType: reportType as AttendanceReportType,
      }),
    [attendance, employees, projects, currentMonth, reportType]
  );

  // Payroll computation
  const payrollData = useMemo(() => {
    // constants matching attendance auto-fill rules
    const AUTO_FILL_START_YEAR = 2026;
    const AUTO_FILL_START_MONTH = 4; // May (0-based)

    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
    const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());
    const isOnOrAfterAutoFillStart = year > AUTO_FILL_START_YEAR || (year === AUTO_FILL_START_YEAR && month >= AUTO_FILL_START_MONTH);
    const lastDay = isCurrentMonth ? today.getDate() : new Date(year, month + 1, 0).getDate();

    // helper to count working days in month
    const countWorkingDays = (dYear: number, dMonth: number) => {
      let count = 0;
      const days = new Date(dYear, dMonth + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const dow = new Date(dYear, dMonth, d).getDay();
        if (dow === 0 || dow === 6) continue;
        count++;
      }
      return count;
    };

    // dedupe attendance by emp|proj|day -> keep the most recently updated/created record
    const dedup = new Map<string, AttendanceRecord>();
    const pickLatest = (current: AttendanceRecord | undefined, candidate: AttendanceRecord) => {
      if (!current) return candidate;
      const currentTime = new Date(current.updatedAt || current.createdAt || current.date || 0).getTime();
      const candidateTime = new Date(candidate.updatedAt || candidate.createdAt || candidate.date || 0).getTime();
      return candidateTime >= currentTime ? candidate : current;
    };
    attendance.forEach((rec) => {
      const d = new Date(rec.date);
      if (Number.isNaN(d.getTime())) return;
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const emp = String(rec.employee_id || '');
      const proj = String(rec.project_id || '');
      const day = d.getDate();
      const k = `${emp}|${proj}|${day}`;
      dedup.set(k, pickLatest(dedup.get(k), rec));
    });

    // build map of attendance by employee|project -> day -> status using deduped records
    const keyMap = new Map<string, Map<number, string>>();
    const sourceMap = new Map<string, AttendanceRecord>();
    for (const rec of dedup.values()) {
      const d = new Date(rec.date);
      const emp = String(rec.employee_id || '');
      const proj = String(rec.project_id || '');
      const key = `${emp}|${proj}`;
      const day = d.getDate();
      const map = keyMap.get(key) || new Map<number, string>();
      map.set(day, rec.status);
      keyMap.set(key, map);
      if (!sourceMap.has(key)) sourceMap.set(key, rec);
    }

    const assignmentMap = new Map<string, any>();
    const assignList = Array.isArray(assignments) ? assignments : [];
    assignList.forEach((a: any) => {
      const empId = String(a.employee_id || '');
      const projId = String(a.project_id || '');
      assignmentMap.set(`${empId}|${projId}`, a);
    });

    const rows: Array<any> = [];
    // map groupedData (attendance overview) by employee name to ensure payroll absent days match
    const groupedMap = new Map<string, { present: number; absent: number; halfDay: number; leave: number }>();
    try {
      (groupedData || []).forEach((g: any) => groupedMap.set(g.name, { present: g.present, absent: g.absent, halfDay: g.halfDay, leave: g.leave }));
    } catch (e) {
      /* ignore if groupedData not available */
    }
    const allKeys = new Set<string>([...keyMap.keys(), ...assignmentMap.keys()]);

    allKeys.forEach((key) => {
      const attendanceSource = sourceMap.get(key);
      const assignmentSource = assignmentMap.get(key);
      const [empId, projId] = key.split('|');
      if (!assignmentSource) {
        return;
      }
      const dayMap = keyMap.get(key) || new Map<number, string>();

      let present = 0;
      let halfDay = 0;
      let leave = 0;
      let absent = 0;

      for (let day = 1; day <= lastDay; day++) {
        const dow = new Date(year, month, day).getDay();
        if (dow === 0 || dow === 6) continue; // skip weekends

        const explicit = dayMap.get(day);
        if (explicit) {
          const norm = normalizeReportStatus(explicit);
          if (norm === 'cleared') {
            // explicitly cleared by user - do not count nor auto-fill
            continue;
          }
          if (norm === 'present') present += 1;
          else if (norm === 'halfDay') halfDay += 1;
          else if (norm === 'leave') leave += 1;
          else if (norm === 'absent') absent += 1;
          // any other normalized value treated as present conservatively
          else present += 1;
          continue;
        }

        // no explicit record
        if (isFutureMonth) continue;
        if (!isOnOrAfterAutoFillStart) continue;

        // for past months or current up to today, auto-present
        if (isPastMonth || (isCurrentMonth && day <= today.getDate())) {
          present += 1;
        }
      }

      const hours = present * 8 + halfDay * 4 + leave * 8; // absent=0
      const payRate = Number(assignmentSource.pay_rate || 0);
      const salary = hours * payRate;
      const totalWorkDays = countWorkingDays(year, month);
      const expectedHours = totalWorkDays * 8;
      const statut = hours >= expectedHours ? 'Complet' : 'Partiel';

      const employeeName = attendanceSource?.employee_name || assignmentSource.employee_name || employees.find((e) => String(e._id) === empId)?.name || 'Employee';
      const projectName = attendanceSource?.project_name || assignmentSource.project_name || projects.find((p) => String(p._id) === projId)?.name || 'Project';

      // if groupedData has a record for this employee, prefer its absent count to keep tables in sync
      const grouped = groupedMap.get(employeeName);
      // If groupedData (monthly attendance) has values for this employee, use them to keep tables in sync
      const presentFinal = typeof grouped?.present === 'number' ? grouped.present : present;
      const absentFinal = typeof grouped?.absent === 'number' ? grouped.absent : absent;
      const halfDayFinal = typeof grouped?.halfDay === 'number' ? grouped.halfDay : halfDay;
      const leaveFinal = typeof grouped?.leave === 'number' ? grouped.leave : leave;
      const hoursFinal = presentFinal * 8 + halfDayFinal * 4 + leaveFinal * 8;

      rows.push({
        employeeId: empId,
        projectId: projId,
        employeeName,
        projectName,
        presentDays: presentFinal,
        absentDays: absentFinal,
        halfDay: halfDayFinal,
        leaveDays: leaveFinal,
        hours: hoursFinal,
        payRate,
        salary: hoursFinal * payRate,
        statut,
      });
    });

    return rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName) || a.projectName.localeCompare(b.projectName));
  }, [attendance, assignments, employees, projects, currentMonth]);

  const payrollTotal = useMemo(() => payrollData.reduce((s, r) => s + (r.salary || 0), 0), [payrollData]);

  const totalPresent = groupedData.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = groupedData.reduce((sum, item) => sum + item.absent, 0);
  const totalHalfDay = groupedData.reduce((sum, item) => sum + item.halfDay, 0);
  const totalLeaves = groupedData.reduce((sum, item) => sum + item.leave, 0);

  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    // when groupedData changes, log and bump key to force Chart rerender
    console.debug('AttendanceReports: groupedData changed', groupedData.map((g) => ({ name: g.name, present: g.present })));
    setChartKey((k) => k + 1);
  }, [groupedData]);

  const statCards: DashpanelCardData[] = [
    {
      title: 'Total Present Days',
      value: totalPresent.toString(),
      icon: CheckCircle2,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
    },
    {
      title: 'Total Absent Days',
      value: totalAbsent.toString(),
      icon: XCircle,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
    },
    {
      title: 'Total Half Days',
      value: totalHalfDay.toString(),
      icon: Clock,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
    },
    {
      title: 'Total Leaves',
      value: totalLeaves.toString(),
      icon: FileText,
      iconBg: 'bg-green-600',
      gradientFrom: 'from-green-600/10',
    },
  ];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const chartSeries = useMemo(
    () => [
      { name: 'Present', data: groupedData.map((row) => row.present) },
      { name: 'Half Day', data: groupedData.map((row) => row.halfDay) },
      { name: 'Leave', data: groupedData.map((row) => row.leave) },
      { name: 'Absent', data: groupedData.map((row) => row.absent) },
    ],
    [groupedData]
  );

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false },
      stacked: true,
    },
    colors: ['#d1fae5', '#fef3c7', '#dbeafe', '#fee2e2'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: '#000000' },
    },
    grid: {
      show: true,
      borderColor: '#D1D5DB',
      strokeDashArray: 4,
      position: 'back',
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: groupedData.map((row) => row.name),
      labels: { style: { colors: '#000000' } },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${Math.round(value)}`,
        style: { colors: '#000000' },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (value: number) => `${value}` },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p className="text-slate-500 mt-1">View saved attendance records by employee or project.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={prevMonth} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center">
            <input
              id="monthPicker"
              ref={(el) => { inputRef.current = el; }}
              type="month"
              value={monthKey}
              onChange={(e) => setCurrentMonth(new Date(`${e.target.value}-01`))}
              className="sr-only"
              aria-label="Select month"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click?.()}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </button>
          </div>
          <button onClick={nextMonth} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setReportType('employee')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                reportType === 'employee' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              By Employee
            </button>
            <button
              onClick={() => setReportType('project')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                reportType === 'project' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              By Project
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={exportPayrollAll} className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export All Payroll
            </button>
          </div>
        </div>
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Attendance Overview ({reportType === 'employee' ? 'Per Employee' : 'Per Project'}) - {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Chart key={chartKey} options={chartOptions} series={chartSeries} type="bar" height={400} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Payroll Summary</h3>
        <p className="text-sm text-slate-500 mb-4">Payroll hours are calculated using the following standard: present = 8h, half day = 4h, leave = 8h, absent = 0h.</p>

        <div className="w-full overflow-visible">
          <table className="w-full table-fixed divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[180px] truncate">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[220px] truncate">Project</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Present</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Absent</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Half</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Leave</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Salary</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payrollData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">No payroll data for selected month.</td>
                </tr>
              ) : (
                payrollData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 max-w-[180px] truncate">{row.employeeName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 max-w-[220px] truncate">{row.projectName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">{row.presentDays}</td>
                    <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${row.absentDays > 0 ? 'text-red-600 font-semibold' : 'text-slate-900'}`}>{row.absentDays}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">{row.halfDay}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">{row.leaveDays}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">{row.hours}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">${row.payRate.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-slate-900">${row.salary.toFixed(2)}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-slate-500 w-20">
                      <button
                        onClick={() => exportPayrollRow(row)}
                        title="Export"
                        className="inline-flex items-center p-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
          <div className="mt-2 flex justify-end">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-700">Total</div>
              <div className="text-lg font-bold text-slate-900">${payrollTotal.toFixed(2)}</div>
            </div>
          </div>
      </div>

      
    </div>
  );
}
