import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

export default function AttendanceReports() {
  const [reportType, setReportType] = useState('employee');

  const employeeData = [
    { name: 'Jane Smith', present: 20, absent: 1, halfDay: 1, leave: 0 },
    { name: 'Michael Johnson', present: 18, absent: 2, halfDay: 0, leave: 2 },
    { name: 'Sarah Williams', present: 22, absent: 0, halfDay: 0, leave: 0 },
    { name: 'David Brown', present: 19, absent: 1, halfDay: 2, leave: 0 },
  ];

  const projectData = [
    { name: 'Website Redesign', present: 45, absent: 2, halfDay: 1, leave: 0 },
    { name: 'Mobile App Dev', present: 38, absent: 4, halfDay: 2, leave: 2 },
    { name: 'Cloud Migration', present: 52, absent: 1, halfDay: 0, leave: 1 },
  ];

  const data = reportType === 'employee' ? employeeData : projectData;

  const totalPresent = data.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = data.reduce((sum, item) => sum + item.absent, 0);
  const totalHalfDay = data.reduce((sum, item) => sum + item.halfDay, 0);
  const totalLeaves = data.reduce((sum, item) => sum + item.leave, 0);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p className="text-slate-500 mt-1">View attendance analytics by employee or project.</p>
        </div>
        <div className="flex items-center space-x-3">
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
          Attendance Overview ({reportType === 'employee' ? 'Per Employee' : 'Per Project'})
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="halfDay" name="Half Day" stackId="a" fill="#f59e0b" />
              <Bar dataKey="leave" name="Leave" stackId="a" fill="#3b82f6" />
              <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
