import React, { useState, useEffect } from 'react';
import { Briefcase, FolderKanban, Clock, DollarSign, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

function toQtNum(id: string, createdAt?: string): string {
  const year    = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const cleaned = (id ?? '').replace(/[^0-9a-f]/gi, '');
  const hex     = cleaned.slice(-6) || '000000';
  const num     = (parseInt(hex, 16) % 9000) + 1000;
  return `QT-${year}-${String(num).padStart(4, '0')}`;
}

export default function EditQuotation() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projects,  setProjects]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [formData, setFormData] = useState({
    customer_id:  '',
    project_id:   '',
    rate_type:    'hourly',
    rate:          0,
    duration:      0,
    total_amount:  0,
    status:       'Draft',
  });

  // Load quotation and pre-fill form
  useEffect(() => {
    fetch(`/api/quotations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setQuotation(data);
        setFormData({
          customer_id:  data.customer_id  ?? '',
          project_id:   data.project_id   ?? '',
          rate_type:    data.rate_type    ?? 'hourly',
          rate:         data.rate         ?? 0,
          duration:     data.duration     ?? 0,
          total_amount: data.total_amount ?? 0,
          status:       data.status       ?? 'Draft',
        });
        setLoading(false);
      })
      .catch(console.error);
  }, [id, token]);

  // Load customers and projects for dropdowns
  useEffect(() => {
    fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  // Auto-calculate total amount from rate × duration
  useEffect(() => {
    setFormData(prev => ({ ...prev, total_amount: prev.rate * prev.duration }));
  }, [formData.rate, formData.duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        navigate(`/quotations/${id}`);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  const qtNum = toQtNum(quotation?.id ?? id ?? '', quotation?.created_at);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/quotations/${id}`)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Quotation #{qtNum}</h1>
          <p className="text-slate-500 mt-1">Update quotation details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Customer dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.customer_id}
                  onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderKanban className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rate Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rate Type</label>
              <select
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.rate_type}
                onChange={e => setFormData({ ...formData, rate_type: e.target.value })}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.rate || ''}
                  onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Duration ({formData.rate_type === 'hourly' ? 'Hours' : 'Days'})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.duration || ''}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Total Amount — read-only, auto-calculated */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Total Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-600" />
                </div>
                <input
                  type="text"
                  readOnly
                  className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold sm:text-sm cursor-not-allowed"
                  value={formData.total_amount.toFixed(2)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/quotations/${id}`)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
