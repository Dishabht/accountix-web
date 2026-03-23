import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit2, Trash2, X, Save } from 'lucide-react';

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchInvoice = () => {
    setLoading(true);
    fetch(`/api/invoices/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invoice not found');
        return res.json();
      })
      .then(data => {
        setInvoice(data);
      })
      .catch(err => {
        console.error(err);
        navigate('/invoices');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoice();
    
    fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setCustomers)
      .catch(console.error);
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        navigate('/invoices');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete invoice', error);
      alert('Failed to delete invoice');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'finance';

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-6 text-center text-red-500">Invoice not found.</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/invoices')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Invoice INV-{invoice.id.toString().padStart(4, '0')}
            </h2>
            <p className="text-slate-500 mt-1">Detailed view of the invoice.</p>
          </div>
        </div>
        
        {canManage && (
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/invoices/${id}/edit`)}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Invoice Information</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Customer Name</p>
            <p className="mt-1 text-base text-slate-900">{invoice.customer_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Amount</p>
            <p className="mt-1 text-base text-slate-900 font-semibold">${invoice.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Issue Date</p>
            <p className="mt-1 text-base text-slate-900">{invoice.issue_date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Due Date</p>
            <p className="mt-1 text-base text-slate-900">{invoice.due_date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <div className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                'bg-slate-100 text-slate-800'
              }`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={() => setIsDeleteModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      Delete Invoice
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this invoice? This action cannot be undone.
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
    </div>
  );
}
