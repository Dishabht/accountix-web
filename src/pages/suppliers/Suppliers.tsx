import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, X, Edit2, Trash2, Building2, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Suppliers() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    contact_info: '',
    address: '',
    city: '',
    postal_code: '',
    region: '',
    contact_person_email: '',
    contact_person_phone: '',
    project: '',
    services: [] as string[]
  });

  const fetchSuppliers = () => {
    fetch('/api/suppliers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAvailableProjects)
      .catch(console.error);
  }, [token]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.contact_person_email && s.contact_person_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (s.project && s.project.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [suppliers, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      withProject: suppliers.filter(s => s.project && s.project !== 'N/A').length,
      withoutProject: suppliers.filter(s => !s.project || s.project === 'N/A').length,
    };
  }, [suppliers]);

  const openAddModal = () => {
    navigate('/companies/add?type=supplier');
  };

  const openEditModal = (supplier: any) => {
    let services = [];
    try {
      services = JSON.parse(supplier.services || '[]');
    } catch (e) {
      services = [];
    }
    setFormData({ 
      id: supplier.id, 
      name: supplier.name, 
      contact_info: supplier.contact_info,
      address: supplier.address || '',
      city: supplier.city || '',
      postal_code: supplier.postal_code || '',
      region: supplier.region || '',
      contact_person_email: supplier.contact_person_email || '',
      contact_person_phone: supplier.contact_person_phone || '',
      project: supplier.project || '',
      services: Array.isArray(services) ? services : []
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setSupplierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = formData.id ? `/api/suppliers/${formData.id}` : '/api/suppliers';
      const method = formData.id ? 'PUT' : 'POST';
      
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
        setIsModalOpen(false);
        fetchSuppliers();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save supplier', error);
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    
    try {
      const res = await fetch(`/api/suppliers/${supplierToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSupplierToDelete(null);
        fetchSuppliers();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete supplier', error);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h2>
          <p className="text-slate-500 mt-1">Manage supplier companies and contracts.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Suppliers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">With Projects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.withProject}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Without Projects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.withoutProject}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <UserX className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email/Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                {canManage && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-4 text-center text-sm text-slate-500">No suppliers found.</td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {supplier.logo_url && (
                          <img 
                            src={supplier.logo_url} 
                            alt={supplier.name} 
                            className="w-8 h-8 rounded-full mr-3 object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="text-sm font-medium text-slate-900">{supplier.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div>{supplier.contact_person_email || supplier.contact_info}</div>
                      <div className="text-xs">{supplier.contact_person_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div>{supplier.address}</div>
                      <div className="text-xs">{supplier.city}, {supplier.region} {supplier.postal_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="font-medium text-slate-900">{supplier.project || 'N/A'}</div>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openEditModal(supplier)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(supplier.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add/Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                    {formData.id ? 'Edit Supplier' : 'Add New Supplier'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.contact_person_email}
                        onChange={(e) => setFormData({...formData, contact_person_email: e.target.value, contact_info: e.target.value})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Phone</label>
                      <input
                        type="text"
                        required
                        value={formData.contact_person_phone}
                        onChange={(e) => setFormData({...formData, contact_person_phone: e.target.value})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Region</label>
                      <input
                        type="text"
                        required
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Project Type</label>
                      <select
                        required
                        value={formData.project}
                        onChange={(e) => setFormData({...formData, project: e.target.value, services: []})}
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Project</option>
                        {availableProjects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Services</label>
                      <div className="mt-1 max-h-32 overflow-y-auto border border-slate-300 rounded-lg p-2">
                        {formData.project ? (
                          (() => {
                            const selectedProject = availableProjects.find(p => p.name === formData.project);
                            const services = selectedProject?.services ? JSON.parse(selectedProject.services) : [];
                            
                            if (services.length === 0) {
                              return <div className="text-xs text-slate-400 italic p-1">No services found.</div>;
                            }
                            
                            return services.map((s: string) => (
                              <label key={s} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.services.includes(s)}
                                  onChange={(e) => {
                                    const newServices = e.target.checked 
                                      ? [...formData.services, s]
                                      : formData.services.filter(item => item !== s);
                                    setFormData({...formData, services: newServices});
                                  }}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs text-slate-700">{s}</span>
                              </label>
                            ));
                          })()
                        ) : (
                          <span className="text-xs text-slate-400 italic">Select project first</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {formData.id ? 'Update Supplier' : 'Save Supplier'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      Delete Supplier
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this supplier? This action cannot be undone and may affect associated employees.
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
