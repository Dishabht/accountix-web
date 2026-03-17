import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, FolderKanban, DollarSign, Clock, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QuotationDetails() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/quotations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuotation(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        navigate('/quotations');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete quotation', error);
      alert('Failed to delete quotation');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  if (loading) return <div>Loading...</div>;
  if (!quotation) return <div>Quotation not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/quotations" className="flex items-center text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Quotations
        </Link>
        {canManage && (
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/quotations/${id}/edit`)}
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotation #{quotation.id}</h1>
            <p className="text-slate-500">Created on {new Date(quotation.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            quotation.status === 'Draft' ? 'bg-slate-100 text-slate-800' :
            quotation.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
            quotation.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
            'bg-red-100 text-red-800'
          }`}>
            {quotation.status}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center text-slate-700">
              <Briefcase className="w-5 h-5 mr-3 text-slate-400" />
              <span className="font-medium">Customer:</span>
              <span className="ml-2">{quotation.customer_name}</span>
            </div>
            <div className="flex items-center text-slate-700">
              <FolderKanban className="w-5 h-5 mr-3 text-slate-400" />
              <span className="font-medium">Project:</span>
              <span className="ml-2">{quotation.project_name}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center text-slate-700">
              <DollarSign className="w-5 h-5 mr-3 text-slate-400" />
              <span className="font-medium">Rate:</span>
              <span className="ml-2">${quotation.rate.toFixed(2)} / {quotation.rate_type}</span>
            </div>
            <div className="flex items-center text-slate-700">
              <Clock className="w-5 h-5 mr-3 text-slate-400" />
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{quotation.duration} {quotation.rate_type === 'hourly' ? 'hours' : 'days'}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600">
              ${quotation.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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
                      Delete Quotation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this quotation? This action cannot be undone.
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
