import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SupplierEmployee } from '../../types';
import { Plus, Search, Edit2, ClipboardList, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

export default function SupplierEmployees() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<SupplierEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Fetch supplier employees from API using centralized service
    api.get('/supplier-employees', token)
      .then(data => setEmployees(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = (e.skills || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'Active').length,
      draft: employees.filter(e => e.status === 'Draft').length,
      other: employees.filter(e => e.status !== 'Active' && e.status !== 'Draft').length,
    };
  }, [employees]);

  const statCards: DashpanelCardData[] = [
    {
      title: 'Total Employees',
      value: stats.total.toString(),
      icon: ClipboardList,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
    },
    {
      title: 'Active',
      value: stats.active.toString(),
      icon: CheckCircle2,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
    },
    {
      title: 'Draft',
      value: stats.draft.toString(),
      icon: FileText,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
    },
    {
      title: 'Other',
      value: stats.other.toString(),
      icon: AlertCircle,
      iconBg: 'bg-green-600',
      gradientFrom: 'from-green-600/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supplier Employees</h2>
          <p className="text-slate-500 mt-1">Manage and review supplier employees.</p>
        </div>
        <button
          onClick={() => navigate('/add-supplier-employee')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Status:</label>
            <select
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{emp.skills}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.rate} / {emp.rate_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                        emp.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => navigate(`/edit-supplier-employee/${emp.id}`)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

