import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FileText, Briefcase, FolderKanban, DollarSign, Eye, Clock, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function QuotationList() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuotations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            q.project_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: quotations.length,
      draft: quotations.filter(q => q.status === 'Draft').length,
      sent: quotations.filter(q => q.status === 'Sent').length,
      accepted: quotations.filter(q => q.status === 'Accepted').length,
      rejected: quotations.filter(q => q.status === 'Rejected').length,
    };
  }, [quotations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="text-slate-500 mt-1">Manage project quotations and convert them to contracts or invoices.</p>
        </div>
        <Link to="/quotations/create" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Draft</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.draft}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sent</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.sent}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Accepted</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.accepted}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Rejected</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.rejected}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotations..."
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
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Customer & Project</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Rate Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Total Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No quotations found.</td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 flex items-center">
                          <Briefcase className="w-4 h-4 mr-1 text-slate-400" />
                          {quote.customer_name}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center mt-1">
                          <FolderKanban className="w-4 h-4 mr-1 text-slate-400" />
                          {quote.project_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-slate-900">
                          ${quote.rate.toFixed(2)} / {quote.rate_type === 'hourly' ? 'hr' : 'day'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {quote.duration} {quote.rate_type === 'hourly' ? 'hours' : 'days'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900 flex items-center">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        {quote.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/quotations/${quote.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                        <Eye className="w-5 h-5" />
                      </Link>
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
