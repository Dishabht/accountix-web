import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Invoice } from '../../types';
import { Plus, Search, Eye, FileText, CheckCircle2, Send, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

export default function Invoices() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchInvoices = async () => {
    try {
      const data = await api.get('/invoices', token);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const customerName = (invoice.customer_name || '').toLowerCase();
      const invoiceId = `INV-${String(invoice.id ?? '').padStart(4, '0')}`.toLowerCase();
      const invoiceStatus = (invoice.status || '').toLowerCase();

      const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
                            invoiceId.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || invoiceStatus === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: invoices.length,
      paid: invoices.filter(i => (i.status || '').toLowerCase() === 'paid').length,
      sent: invoices.filter(i => (i.status || '').toLowerCase() === 'sent').length,
      draft: invoices.filter(i => (i.status || '').toLowerCase() === 'draft').length,
    };
  }, [invoices]);

  const statCards: DashpanelCardData[] = [
    {
      title: 'Total Invoices',
      value: stats.total.toString(),
      icon: FileText,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
      growth: '+0%',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'all invoices',
    },
    {
      title: 'Paid',
      value: stats.paid.toString(),
      icon: CheckCircle2,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
      growth: `${stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'payment completed',
    },
    {
      title: 'Sent',
      value: stats.sent.toString(),
      icon: Send,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
      growth: `${stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'awaiting payment',
    },
    {
      title: 'Draft',
      value: stats.draft.toString(),
      icon: Clock,
      iconBg: 'bg-green-600',
      gradientFrom: 'from-green-600/10',
      growth: `${stats.total > 0 ? ((stats.draft / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowDown,
      growthColor: 'text-red-600',
      description: 'not sent yet',
    },
  ];

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'finance';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h2>
          <p className="text-slate-500 mt-1">Manage customer invoices and payments.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => navigate('/invoices/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
        )}
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="sent">Sent</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.id ?? `row-${index}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">INV-{String(invoice.id ?? '').padStart(4, '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{invoice.customer_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">${Number(invoice.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{invoice.issue_date || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{invoice.due_date || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const invoiceStatus = (invoice.status || 'draft').toLowerCase();
                        const statusLabel = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);

                        return (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                        invoiceStatus === 'sent' ? 'bg-blue-100 text-blue-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {statusLabel}
                      </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
