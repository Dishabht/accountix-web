import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddSupplierEmployee() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplierId: '',
    skills: '',
    availability: '',
    rate: 0,
    rateType: 'hourly',
    status: 'Draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/supplier-employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supplier_id: formData.supplierId,
          skills: formData.skills,
          availability: formData.availability,
          rate: formData.rate,
          rate_type: formData.rateType,
          status: formData.status
        })
      });

      if (res.ok) {
        navigate('/supplier-employees');
      } else {
        alert('Failed to create employee');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Supplier Employee</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Supplier ID</label>
          <input type="number" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Skills</label>
          <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Availability</label>
          <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Rate</label>
          <input type="number" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Rate Type</label>
          <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.rateType} onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Assigned / Completed">Assigned / Completed</option>
          </select>
        </div>
        <button type="submit" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Save className="w-4 h-4 mr-2" />
          Save Employee
        </button>
      </form>
    </div>
  );
}
