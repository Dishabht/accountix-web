import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Present Days</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">135</p>
          <p className="text-sm text-emerald-600 mt-1 flex items-center">
            ↑ 12% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Absent Days</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">7</p>
          <p className="text-sm text-red-600 mt-1 flex items-center">
            ↑ 2% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Half Days</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">3</p>
          <p className="text-sm text-emerald-600 mt-1 flex items-center">
            ↓ 5% from last month
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500">Total Leaves</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">3</p>
          <p className="text-sm text-slate-500 mt-1 flex items-center">
            Same as last month
          </p>
        </div>
      </div>

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
