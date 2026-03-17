import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, Briefcase, FileText, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#10b981', '#3b82f6', '#f59e0b', '#64748b'];

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    suppliers: 0,
    customers: 0,
    projects: 0
  });
  const [charts, setCharts] = useState({ financials: [], employeeDistribution: [] });

  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');

  // Mock data for Monthly
  const monthlyRevenueData = [
    { name: 'Jan', revenue: 4500, expenses: 3200 },
    { name: 'Feb', revenue: 5200, expenses: 3800 },
    { name: 'Mar', revenue: 4800, expenses: 3500 },
    { name: 'Apr', revenue: 6100, expenses: 4200 },
    { name: 'May', revenue: 5900, expenses: 4000 },
    { name: 'Jun', revenue: 7200, expenses: 4800 },
  ];

  // Mock data for Weekly
  const weeklyRevenueData = [
    { name: 'Week 1', revenue: 1200, expenses: 800 },
    { name: 'Week 2', revenue: 1500, expenses: 950 },
    { name: 'Week 3', revenue: 1100, expenses: 700 },
    { name: 'Week 4', revenue: 1800, expenses: 1100 },
  ];

  const projectStatusData = [
    { name: 'Active', value: 400 },
    { name: 'Completed', value: 300 },
    { name: 'On Hold', value: 100 },
    { name: 'Planning', value: 200 },
  ];

  const monthlyAttendanceData = [
    { name: 'Jan', present: 950, absent: 50 },
    { name: 'Feb', present: 920, absent: 80 },
    { name: 'Mar', present: 980, absent: 20 },
    { name: 'Apr', present: 940, absent: 60 },
    { name: 'May', present: 960, absent: 40 },
  ];

  const weeklyAttendanceData = [
    { name: 'Mon', present: 45, absent: 2 },
    { name: 'Tue', present: 42, absent: 5 },
    { name: 'Wed', present: 46, absent: 1 },
    { name: 'Thu', present: 43, absent: 4 },
    { name: 'Fri', present: 40, absent: 7 },
  ];

  const revenueData = timeRange === 'monthly' ? monthlyRevenueData : weeklyRevenueData;
  const attendanceData = timeRange === 'monthly' ? monthlyAttendanceData : weeklyAttendanceData;

  useEffect(() => {
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch('/api/dashboard/charts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCharts(data))
      .catch(console.error);
  }, [token]);

  const statCards = [
    { name: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-500', trend: '+8%' },
    { name: 'Suppliers', value: stats.suppliers, icon: Building2, color: 'bg-emerald-500', trend: '+2' },
    { name: 'Customers', value: stats.customers, icon: Briefcase, color: 'bg-indigo-500', trend: '+5' },
    { name: 'Active Projects', value: stats.projects, icon: FileText, color: 'bg-amber-500', trend: '+4' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Key metrics and trends at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === 'weekly' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === 'monthly' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Monthly
            </button>
          </div>
          <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500 truncate">{item.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">{item.trend}</span>
              <span className="text-slate-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-indigo-500" />
            Revenue vs Expenses Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-amber-500" />
            Project Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Weekly Attendance Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employees by Supplier */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Employees by Supplier</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.employeeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.employeeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Overview (Original Dashboard Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Financial Overview (Income vs Expense)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.financials} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
