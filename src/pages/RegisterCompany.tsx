import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, User, MapPin, Globe, FileText, Save, Upload, X, ArrowLeft, CheckCircle2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterCompany() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'supplier' ? 'supplier' : 'customer';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyType, setCompanyType] = useState<'customer' | 'supplier'>(initialType);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    country: '',
    logoUrl: '',
    project: '',
    services: [] as string[],
    status: 'Active',
    contactPersonName: '',
    contactPersonRole: '',
    decidedAmount: 0,
    period: ''
  });

  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAvailableProjects)
      .catch(console.error);

    if (id) {
      const endpoint = companyType === 'customer' ? `/api/customers/${id}` : `/api/suppliers/${id}`;
      fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || '',
            email: data.contact_person_email || '',
            phone: data.contact_person_phone || '',
            address: data.address || '',
            city: data.city || '',
            postalCode: data.postal_code || '',
            region: data.region || '',
            country: data.country || '',
            logoUrl: data.logo_url || '',
            project: data.project || '',
            services: data.services ? JSON.parse(data.services) : [],
            status: data.status || 'Active',
            contactPersonName: data.contact_person_name || '',
            contactPersonRole: data.contact_person_role || '',
            decidedAmount: data.decided_amount || 0,
            period: data.period || ''
          });
          setPreviewUrl(data.logo_url || null);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, token, companyType]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        setFormData(prev => ({ ...prev, logoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProjectChange = (project: string) => {
    setFormData(prev => ({
      ...prev,
      project,
      services: [] // Reset services when project changes
    }));
  };

  const toggleService = (service: string) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseEndpoint = companyType === 'customer' ? '/api/customers' : '/api/suppliers';
    const endpoint = id ? `${baseEndpoint}/${id}` : baseEndpoint;
    const redirectPath = companyType === 'customer' ? '/customers' : '/suppliers';

    try {
      const res = await fetch(endpoint, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          company_name: formData.name,
          contact_info: formData.email,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          region: formData.region,
          country: formData.country,
          logo_url: formData.logoUrl,
          contact_person_email: formData.email,
          contact_person_phone: formData.phone,
          contact_person_name: formData.contactPersonName,
          contact_person_role: formData.contactPersonRole,
          project: formData.project,
          services: JSON.stringify(formData.services),
          decided_amount: formData.decidedAmount,
          period: formData.period,
          status: formData.status
        })
      });

      if (res.ok) {
        if (id && companyType === 'customer') {
          navigate(`/customers/${id}`);
        } else {
          navigate(redirectPath);
        }
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to register company', error);
    }
  };

  const backPath = companyType === 'customer' ? '/customers' : '/suppliers';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit' : 'Add'} Company</h1>
            <p className="text-slate-500 mt-1">{id ? 'Update' : 'Register a new'} {companyType} company and specify their project needs.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company Name</label>
                <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Logo</label>
                <div className="flex items-center space-x-4">
                  {previewUrl ? (
                    <div className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden group">
                      <img src={previewUrl} alt="Logo preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Upload company logo (PNG, JPG)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              Contact Person
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input type="text" className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.contactPersonName} onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role / Title</label>
                <input type="text" className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.contactPersonRole} onChange={(e) => setFormData({ ...formData, contactPersonRole: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Project Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Project Type</label>
                <select 
                  required 
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  value={formData.project} 
                  onChange={(e) => handleProjectChange(e.target.value)}
                >
                  <option value="">Select a project type</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.name}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Products / Services</label>
                {!formData.project ? (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 italic">
                    Select a project type first
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                    {(() => {
                      const selectedProject = availableProjects.find(p => p.name === formData.project);
                      const services = selectedProject?.services ? JSON.parse(selectedProject.services) : [];
                      
                      if (services.length === 0) {
                        return <div className="text-sm text-slate-400 italic p-2">No products/services found for this project.</div>;
                      }
                      
                      return services.map((service: string) => (
                        <label key={service} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            checked={formData.services.includes(service)}
                            onChange={() => toggleService(service)}
                          />
                          <span className="text-sm text-slate-700">{service}</span>
                        </label>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Street Address</label>
                <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">City</label>
                  <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Postal Code</label>
                  <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Region / State</label>
                <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Country</label>
                <input type="text" required className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-red-600 border-slate-300 focus:ring-indigo-500"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-slate-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button type="submit" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            {id ? 'Update' : 'Register'} Company
          </button>
        </div>
      </form>
    </div>
  );
}
