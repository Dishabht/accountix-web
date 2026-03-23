import React, { useState, useMemo } from 'react';
import { FileText, Search, Plus, Building2, User, Clock, DollarSign, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SupplierContracts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const contracts = [
    {
      id: 1,
      supplierCompany: 'TechStaffing Inc.',
      employeeSupplied: 'Jane Smith',
      contractType: 'Hourly',
      rate: 45.00,
      duration: '6 Months',
      assignedProject: 'Website Redesign',
      status: 'Active'
    },
    {
      id: 2,
      supplierCompany: 'Global Resources LLC',
      employeeSupplied: 'Michael Johnson',
      contractType: 'Daily',
      rate: 350.00,
      duration: '12 Months',
      assignedProject: 'Mobile App Development',
      status: 'Pending'
    }
  ];

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = c.supplierCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.employeeSupplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.assignedProject.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Contracts</h1>
          <p className="text-slate-500 mt-1">Manage contracts for employees provided by suppliers.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          New Contract
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Contracts</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

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
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 flex items-center">
                        <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.supplierCompany}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center mt-1">
                        <User className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.employeeSupplied}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-slate-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-slate-400" />
                        {contract.contractType} ({contract.duration})
                      </span>
                      <span className="text-sm text-slate-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                        ${contract.rate.toFixed(2)} / {contract.contractType === 'Hourly' ? 'hr' : 'day'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900 flex items-center">
                      <FolderKanban className="w-4 h-4 mr-1 text-slate-400" />
                      {contract.assignedProject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
