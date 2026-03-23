import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Receipt, 
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';

export default function CustomerDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        navigate('/customers');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, invRes, quotRes] = await Promise.all([
          fetch(`/api/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/invoices?customer_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/quotations?customer_id=${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (custRes.ok) setCustomer(await custRes.json());
        if (invRes.ok) setInvoices(await invRes.json());
        if (quotRes.ok) setQuotations(await quotRes.json());
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Customer not found</h2>
        <button 
          onClick={() => navigate('/customers')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center space-x-4">
            {customer.logo_url ? (
              <img 
                src={customer.logo_url} 
                alt={customer.name} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{customer.name}</h1>
              <div className="flex items-center mt-1 space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.status === 'Inactive' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {customer.status || 'Active'}
                </span>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-500 text-sm">{customer.company_name || 'No Company Name'}</span>
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/companies/edit/${id}?type=customer`)}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={() => setIsDeleteModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      Delete Customer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this customer? This action cannot be undone and may affect associated projects and invoices.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact & Address Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-indigo-600" />
                Company Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Contact Person</p>
                  <p className="text-slate-900 font-medium">{customer.contact_person_name || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{customer.contact_person_role || 'No Role'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-slate-900">{customer.contact_person_email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-slate-900">{customer.contact_person_phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Globe className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Country</p>
                  <p className="text-slate-900">{customer.country || 'N/A'}</p>
                </div>
              </div>
              {customer.project && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Project Type</p>
                    <p className="text-slate-900 font-medium">{customer.project}</p>
                  </div>
                </div>
              )}
              {customer.services && (
                <div className="flex items-start space-x-3">
                  <Receipt className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Services Needed</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(() => {
                        try {
                          const services = JSON.parse(customer.services);
                          return Array.isArray(services) ? services.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100">
                              {s}
                            </span>
                          )) : <p className="text-slate-900">{customer.services}</p>;
                        } catch (e) {
                          return <p className="text-slate-900">{customer.services}</p>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-indigo-600" />
                Financial Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Decided Amount</p>
                <p className="text-xl font-bold text-slate-900">${(customer.decided_amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Billing Period</p>
                <p className="text-slate-900">{customer.period || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                Address Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Street Address</p>
                <p className="text-slate-900">{customer.address || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">City</p>
                  <p className="text-slate-900">{customer.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Region</p>
                  <p className="text-slate-900">{customer.region || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Postal Code</p>
                <p className="text-slate-900">{customer.postal_code || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices & Quotations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Invoices Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-indigo-600" />
                Invoices
              </h3>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {invoices.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Invoice #</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No invoices found.</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">INV-{inv.id.toString().padStart(4, '0')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                            {inv.issue_date}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ${inv.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quotations Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Quotations
              </h3>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {quotations.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Project</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Rate</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Total</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No quotations found.</td>
                    </tr>
                  ) : (
                    quotations.map((quot) => (
                      <tr key={quot.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{quot.project_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          ${quot.rate}/{quot.rate_type === 'hourly' ? 'hr' : 'day'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ${quot.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quot.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            quot.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            quot.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {quot.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
