import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { MetricCard, ChartCard } from '../components/dashboard';

const COLORS = ['#06B6D4', '#9333EA', '#487FFF', '#16A34A', '#22C55E', '#6366F1', '#0EA5E9', '#A855F7', '#14B8A6'];

const RADIAN = Math.PI / 180;

const renderDonutPercentLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) {
    return null;
  }

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

  const revenueCategories = revenueData.map((item) => item.name);
  const revenueZoomSeries = [
    {
      name: 'Revenue',
      data: revenueData.map((item) => item.revenue),
    },
    {
      name: 'Expenses',
      data: revenueData.map((item) => item.expenses),
    },
  ];

  const revenueZoomOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
      width: 3,
      lineCap: 'round',
    },
    colors: ['#487FFF', '#9333EA'],
    grid: {
      borderColor: '#D1D5DB',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.35,
        opacityFrom: 0.45,
        opacityTo: 0.08,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      hover: { size: 7 },
    },
    xaxis: {
      categories: revenueCategories,
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value}`,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `$${value}`,
      },
    },
  };

  const attendanceCategories = attendanceData.map((item) => item.name);
  const attendanceColumnSeries = [
    {
      name: 'Present',
      data: attendanceData.map((item) => item.present),
    },
    {
      name: 'Absent',
      data: attendanceData.map((item) => item.absent),
    },
  ];

  const attendanceColumnOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: {
        show: false,
      },
    },
    colors: ['#16A34A', '#487FFF'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
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
        columnWidth: '35%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: attendanceCategories,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${Math.round(value)}`,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const statsData = await (await import('../services/api')).api.get('/dashboard/stats', token);
        setStats(statsData);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }

      try {
        const chartsData = await (await import('../services/api')).api.get('/dashboard/charts', token);
        setCharts(chartsData);
      } catch (err) {
        console.error('Charts fetch error:', err);
      }
    })();
  }, [token]);

  const demoEmployeeDistribution = [
    { name: 'TechCorp Ltd', value: 32 },
    { name: 'Global Staff', value: 26 },
    { name: 'Prime Solutions', value: 22 },
    { name: 'Outsource Pro', value: 20 },
  ];

  const demoFinancials = [
    { name: 'Jan', income: 4200, expense: 2800 },
    { name: 'Feb', income: 5100, expense: 3400 },
    { name: 'Mar', income: 4700, expense: 3200 },
    { name: 'Apr', income: 5900, expense: 3900 },
    { name: 'May', income: 6300, expense: 4300 },
    { name: 'Jun', income: 7100, expense: 4700 },
  ];

  const employeeDistributionData =
    Array.isArray(charts.employeeDistribution) && charts.employeeDistribution.length > 0
      ? charts.employeeDistribution
      : demoEmployeeDistribution;

  const financialOverviewData =
    (Array.isArray(charts.financials) && charts.financials.length > 0
      ? charts.financials
      : demoFinancials
    ).map((item: any, index: number) => ({
      name: item?.name || item?.month || item?.label || `M${index + 1}`,
      income: Number(item?.income ?? item?.revenue ?? 0),
      expense: Number(item?.expense ?? item?.expenses ?? 0),
    }));

  const financialCategories = financialOverviewData.map((item) => item.name);
  const financialColumnSeries = [
    {
      name: 'Income',
      data: financialOverviewData.map((item) => item.income),
    },
    {
      name: 'Expense',
      data: financialOverviewData.map((item) => item.expense),
    },
  ];

  const financialColumnOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: {
        show: false,
      },
    },
    colors: ['#06B6D4', '#9333EA'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
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
        columnWidth: '35%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: financialCategories,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${Math.round(value)}`,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `$${value}`,
      },
    },
  };

  const metricCards = [
    {
      title: 'Total Users',
      value: stats.users.toLocaleString(),
      icon: Users,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
      growth: '+8%',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'Last 30 days users',
    },
    {
      title: 'Suppliers',
      value: stats.suppliers.toLocaleString(),
      icon: Building2,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
      growth: '+2',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'Last 30 days suppliers',
    },
    {
      title: 'Customers',
      value: stats.customers.toLocaleString(),
      icon: Briefcase,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
      growth: '+5',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'Last 30 days customers',
    },
    {
      title: 'Active Projects',
      value: stats.projects.toLocaleString(),
      icon: FileText,
      iconBg: 'bg-green-600',
      gradientFrom: 'from-green-600/10',
      growth: '+4',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'Last 30 days projects',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-neutral-500 mt-1">Key metrics and trends at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-neutral-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === 'weekly' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-indigo-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === 'monthly' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-indigo-50'
              }`}
            >
              Monthly
            </button>
            {/* Yearly removed - only Weekly/Monthly supported */}
          </div>
          <div className="text-sm text-neutral-500 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Revenue vs Expenses - Line Chart */}
        <ChartCard 
          title="Revenue vs Expenses Trend"
          icon={DollarSign}
          iconColor="text-primary"
          colSpan="xl:col-span-6"
        >
          <div className="h-80">
            <div className="-m-2">
              <Chart
                options={revenueZoomOptions}
                series={revenueZoomSeries}
                type="area"
                height={320}
              />
            </div>
          </div>
        </ChartCard>

        {/* Project Status Distribution */}
        <ChartCard
          title="Project Status Distribution"
          icon={Activity}
          iconColor="text-amber-500"
          colSpan="xl:col-span-6"
        >
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  label={renderDonutPercentLabel}
                  labelLine={false}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-wrap items-center justify-center mt-3 gap-4">
            {projectStatusData.map((item, index) => (
              <li key={item.name} className="flex items-center gap-2 text-xs text-neutral-600 font-semibold">
                <span
                  className="w-3 h-2 rounded-[50rem]"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.name}: <span className="text-neutral-900 font-bold">{item.value}</span>
              </li>
            ))}
          </ul>
        </ChartCard>

        {/* Weekly Attendance */}
        <ChartCard
          title="Weekly Attendance Overview"
          icon={Users}
          iconColor="text-blue-500"
          colSpan="xl:col-span-12"
        >
          <div className="h-80">
            <div className="-m-2">
              <Chart
                options={attendanceColumnOptions}
                series={attendanceColumnSeries}
                type="bar"
                height={320}
              />
            </div>
          </div>
        </ChartCard>

        {/* Employees by Supplier */}
        <ChartCard
          title="Employees by Supplier"
          colSpan="xl:col-span-6"
        >
          <div>
            <div className="h-72 -m-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                  >
                    {employeeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-wrap items-center justify-center mt-3 gap-4">
              {employeeDistributionData.slice(0, 4).map((item, index) => (
                <li key={item.name} className="flex items-center gap-2 text-xs text-neutral-600 font-semibold">
                  <span
                    className="w-3 h-2 rounded-[50rem]"
                    style={{ backgroundColor: COLORS[(index + 4) % COLORS.length] }}
                  />
                  {item.name}: <span className="text-neutral-900 font-bold">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        {/* Financial Overview (Original Dashboard Chart) */}
        <ChartCard
          title="Financial Overview (Income vs Expense)"
          icon={DollarSign}
          iconColor="text-blue-500"
          colSpan="xl:col-span-6"
        >
          <div className="h-80">
            <div className="-m-2">
              <Chart
                options={financialColumnOptions}
                series={financialColumnSeries}
                type="bar"
                height={320}
              />
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
