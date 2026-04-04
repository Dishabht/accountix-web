import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Search, Plus, Building2, User, Clock, DollarSign, FolderKanban, CheckCircle2, AlertCircle, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SupplierContract, Supplier, Employee, Project } from '../../types';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

export default function SupplierContracts() {
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [contracts, setContracts] = useState<SupplierContract[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    employee_id: '',
    project_id: '',
    contract_type: 'Hourly',
    rate: '',
    duration: '',
    status: 'Pending',
  });

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  // Fetch contracts from API using centralized service
  const fetchContracts = async () => {
    try {
      const data = await api.get('/supplier-contracts', token);
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // Fetch relational data for dropdowns using centralized API service
    Promise.all([
      api.get('/suppliers', token).then(setSuppliers),
      api.get('/employees', token).then(setEmployees),
      api.get('/projects', token).then(data => setProjects(Array.isArray(data) ? data : [])),
    ]).catch(console.error);
  }, [token]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = (c.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.project_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'Active').length,
      pending: contracts.filter(c => c.status === 'Pending').length,
    };
  }, [contracts]);

  const statCards: DashpanelCardData[] = [
    {
      title: 'Total Contracts',
      value: stats.total.toString(),
      icon: FileText,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
      growth: '+0%',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'supplier contracts',
    },
    {
      title: 'Active',
      value: stats.active.toString(),
      icon: CheckCircle2,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
      growth: `${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'running contracts',
    },
    {
      title: 'Pending',
      value: stats.pending.toString(),
      icon: AlertCircle,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
      growth: `${stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowDown,
      growthColor: 'text-red-600',
      description: 'awaiting approval',
    },
  ];

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/supplier-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier_id: Number(formData.supplier_id),
          employee_id: Number(formData.employee_id),
          project_id: Number(formData.project_id),
          contract_type: formData.contract_type,
          rate: Number(formData.rate),
          duration: formData.duration,
          status: formData.status,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error?.error || 'Failed to create contract');
        return;
      }

      setIsModalOpen(false);
      setFormData({
        supplier_id: '',
        employee_id: '',
        project_id: '',
        contract_type: 'Hourly',
        rate: '',
        duration: '',
        status: 'Pending',
      });
      fetchContracts();
    } catch (error) {
      console.error('Failed to create contract', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/supplier-contracts/${deleteTarget}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error?.error || 'Failed to delete contract');
        return;
      }

      setDeleteTarget(null);
      fetchContracts();
    } catch (error) {
      console.error('Failed to delete contract', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Contracts</h1>
          <p className="text-slate-500 mt-1">Manage contracts for employees provided by suppliers.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Contract
          </button>
        )}
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <select
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Supplier & Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Contract Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Project</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No contracts found.</td>
                </tr>
              ) : filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 flex items-center">
                        <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.supplier_name}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center mt-1">
                        <User className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.employee_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-slate-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.contract_type} ({contract.duration})
                      </span>
                      <span className="text-sm text-slate-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                        ${Number(contract.rate || 0).toFixed(2)} / {contract.contract_type === 'Hourly' ? 'hr' : 'day'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900 flex items-center">
                      <FolderKanban className="w-4 h-4 mr-1 text-slate-400" />
                      {contract.project_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : contract.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : contract.status === 'Completed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canManage ? (
                      <button
                        onClick={() => setDeleteTarget(contract.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500/75" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Add New Contract</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateContract} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Supplier</label>
                    <select
                      required
                      value={formData.supplier_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, supplier_id: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Employee</label>
                    <select
                      required
                      value={formData.employee_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, employee_id: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Project</label>
                    <select
                      required
                      value={formData.project_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, project_id: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Type</label>
                      <select
                        value={formData.contract_type}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contract_type: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="Hourly">Hourly</option>
                        <option value="Daily">Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Rate</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, rate: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Duration</label>
                      <input
                        required
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="e.g. 6 Months"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Save Contract
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500/75" onClick={() => setDeleteTarget(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-slate-900">Delete Contract</h3>
                <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete this contract?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
