import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddCustomerRequest() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    position: '',
    duration: '',
    status: 'Draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/customer-requests');
      } else {
        alert('Failed to create request');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Customer Request</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Customer ID</label>
          <input type="number" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Position</label>
          <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Duration</label>
          <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Inactive / Closed">Inactive / Closed</option>
          </select>
        </div>
        <button type="submit" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Save className="w-4 h-4 mr-2" />
          Save Request
        </button>
      </form>
    </div>
  );
}
