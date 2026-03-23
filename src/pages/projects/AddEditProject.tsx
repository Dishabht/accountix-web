import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

export default function AddEditProject() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    customer_id: '',
    manager_id: '',
    status: 'Active',
    services: [] as string[]
  });

  const [newService, setNewService] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isAddingNewService, setIsAddingNewService] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setCustomers);
      
    fetch('/api/users?role=manager', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setManagers);

    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(projects => {
        const services = new Set<string>();
        projects.forEach((p: any) => {
          if (p.services) {
            try {
              const parsed = JSON.parse(p.services);
              parsed.forEach((s: string) => services.add(s));
            } catch (e) {}
          }
        });
        setAllServices(Array.from(services));
      });

    if (id) {
      fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || '',
            customer_id: data.customer_id || '',
            manager_id: data.manager_id || '',
            status: data.status || 'Active',
            services: data.services ? JSON.parse(data.services) : []
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, token]);

  const handleAddExistingService = () => {
    if (selectedService && !formData.services.includes(selectedService)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, selectedService]
      }));
      setSelectedService('');
    }
  };

  const handleAddNewService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
      setIsAddingNewService(false);
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== serviceToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = id ? `/api/projects/${id}` : '/api/projects';
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          services: JSON.stringify(formData.services)
        })
      });
      
      if (res.ok) {
        navigate('/projects');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {id ? 'Edit Project' : 'Add New Project'}
          </h2>
          <p className="text-slate-500 mt-1">
            A project represents a company undertaking.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. Graphic Design"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer</label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Manager</label>
              <select
                required
                value={formData.manager_id}
                onChange={(e) => setFormData({...formData, manager_id: e.target.value})}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Products / Services</h3>
            <p className="text-sm text-slate-500 mb-4">
              List the products or services included in this project (e.g., Logo design, Flyer design).
            </p>
            
            <div className="flex space-x-2 mb-4">
              {!isAddingNewService ? (
                <>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select an existing product or service...</option>
                    {allServices.filter(s => !formData.services.includes(s)).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExistingService}
                    disabled={!selectedService}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center transition-colors"
                  >
                    Add to Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewService(true)}
                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create New
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewService())}
                    placeholder="Type new product or service name..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewService}
                    disabled={!newService.trim()}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewService(false);
                      setNewService('');
                    }}
                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.services.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No products/services added yet.</p>
              ) : (
                formData.services.map((service, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {id ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

