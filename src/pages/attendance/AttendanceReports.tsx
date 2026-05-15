import React, { useEffect, useMemo, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import { Download, Filter, CheckCircle2, XCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setCurrentMonth(new Date(`${e.target.value}-01`))}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          />
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
          <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Saved Attendance Details</h3>
          {isLoading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Present</th>
                <th className="py-2 pr-4">Absent</th>
                <th className="py-2 pr-4">Half Day</th>
                <th className="py-2 pr-4">Leave</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3 pr-4">{row.present}</td>
                  <td className="py-3 pr-4">{row.absent}</td>
                  <td className="py-3 pr-4">{row.halfDay}</td>
                  <td className="py-3 pr-4">{row.leave}</td>
                </tr>
              ))}
              {!groupedData.length && (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={5}>
                    No saved attendance found for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
