import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Project } from '../../types';
import { Plus, Search, X, Briefcase, Eye, CheckCircle2, XCircle, FolderKanban, ArrowUp, ArrowDown } from 'lucide-react';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

export default function Projects() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch all projects from API
  const fetchProjects = async () => {
    try {
      const data = await api.get('/projects', token);
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.customer_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      inactive: projects.filter(p => p.status !== 'Active').length,
    };
  }, [projects]);

  const statCards: DashpanelCardData[] = [
    {
      title: 'Total Projects',
      value: stats.total.toString(),
      icon: FolderKanban,
      iconBg: 'bg-cyan-600',
      gradientFrom: 'from-cyan-600/10',
      growth: '+0%',
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'project portfolio',
    },
    {
      title: 'Active',
      value: stats.active.toString(),
      icon: CheckCircle2,
      iconBg: 'bg-purple-600',
      gradientFrom: 'from-purple-600/10',
      growth: `${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowUp,
      growthColor: 'text-green-600',
      description: 'currently running',
    },
    {
      title: 'Inactive',
      value: stats.inactive.toString(),
      icon: XCircle,
      iconBg: 'bg-[#487FFF]',
      gradientFrom: 'from-[#487FFF]/10',
      growth: `${stats.total > 0 ? ((stats.inactive / stats.total) * 100).toFixed(0) : 0}%`,
      growthIcon: ArrowDown,
      growthColor: 'text-red-600',
      description: 'paused or closed',
    },
  ];

  const openAddPage = () => {
    navigate('/projects/add');
  };

  const openViewPage = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-slate-500 mt-1">Manage customer projects and assignments.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddPage}
            data-testid="project-add-button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </button>
        )}
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              data-testid="project-search"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Status:</label>
            <select
              data-testid="project-status-filter"
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Products / Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-4 text-center text-sm text-slate-500">No projects found.</td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const services = project.services ? JSON.parse(project.services) : [];
                  return (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{project.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{project.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{project.manager_name || 'None'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {services.slice(0, 3).map((service: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {service}
                          </span>
                        ))}
                        {services.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            +{services.length - 3} more
                          </span>
                        )}
                        {services.length === 0 && <span className="text-slate-400 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openViewPage(project.id)}
                            data-testid={`project-view-button-${project.id}`}
                            className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-100"
                            title="View Project"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
