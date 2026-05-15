import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import { Download, CheckCircle2, XCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';
import { buildAttendanceReportRows, type AttendanceEmployee, type AttendanceProject, type AttendanceRecord, type AttendanceReportType, type AttendanceRow } from './attendanceUtils';

export default function AttendanceReports() {
  const { token } = useAuth();
  const [reportType, setReportType] = useState('employee');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<AttendanceEmployee[]>([]);
  const [projects, setProjects] = useState<AttendanceProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    });

  const exportPdf = async () => {
    if (!groupedData.length) {
      alert('No saved attendance data to export.');
      return;
    }

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      const jspdfGlobal = (window as any).jspdf || (window as any).jsPDF || (window as any).jspdf?.default || (window as any).jspdf;
      const jsPDF = jspdfGlobal?.jsPDF || jspdfGlobal;
      if (!jsPDF) throw new Error('jsPDF failed to load');

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
    } catch (err: any) {
      console.error('Export PDF failed', err);
      const msg = err?.message || String(err);
      alert(`Export failed: ${msg}. Try again or use the Print dialog.`);
    }
  };

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const loadAttendance = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [attendanceData, employeesData, projectsData] = await Promise.all([
          api.get('/attendance', token),
          api.get('/employees', token),
          api.get('/projects', token),
        ]);

        const list = Array.isArray(attendanceData) ? attendanceData : [];
        console.debug('AttendanceReports: loaded attendance', list.length);
        setAttendance(list);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
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
          <button onClick={exportPdf} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Attendance Overview ({reportType === 'employee' ? 'Per Employee' : 'Per Project'}) - {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Chart key={chartKey} options={chartOptions} series={chartSeries} type="bar" height={400} />
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        The detailed table is now included in the PDF export.
      </div>
    </div>
  );
}
