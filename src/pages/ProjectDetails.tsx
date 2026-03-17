import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Building2, 
  User, 
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        navigate('/projects');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, assignRes] = await Promise.all([
          fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/assignments?project_id=${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (projRes.ok) setProject(await projRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
      } catch (error) {
        console.error('Error fetching project details:', error);
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Project not found</h2>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const services = project.services ? JSON.parse(project.services) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              <div className="flex items-center mt-1 space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {project.status || 'Active'}
                </span>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-500 text-sm">{project.customer_name || 'No Customer'}</span>
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/projects/edit/${id}`)}
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
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this project? This action cannot be undone and may affect associated assignments.
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
        {/* Project Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
                Project Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</p>
                  <p className="text-slate-900 font-medium">{project.customer_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Manager</p>
                  <p className="text-slate-900">{project.manager_name || 'None'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Products / Services</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {services.length > 0 ? services.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100">
                        {s}
                      </span>
                    )) : <p className="text-slate-500 text-sm italic">None</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Assigned Employees
              </h3>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {assignments.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Employee</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Billing Rate</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider italic font-serif">Pay Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No employees assigned.</td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {assignment.employee_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ${assignment.billing_rate.toLocaleString()}/hr
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ${assignment.pay_rate.toLocaleString()}/hr
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
