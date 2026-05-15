import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, FolderKanban, Clock, Calendar, Save } from 'lucide-react';
import { api } from '../../services/api';

export default function AttendanceEntry() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Array<{ _id: string; name?: string; title?: string }>>([]);
  const [projects, setProjects] = useState<Array<{ _id: string; name?: string }>>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    workHours: 8,
    notes: '',
  });

  useEffect(() => {
    const loadLists = async () => {
      if (!token) return;
      setLoadingLists(true);
      try {
        const [employeesData, projectsData] = await Promise.all([
          api.get('/employees', token),
          api.get('/projects', token),
        ]);

        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Failed to load employees/projects', error);
      } finally {
        setLoadingLists(false);
      }
    };

    loadLists();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      if (!formData.projectId) return alert('Please select a project');

      if (!token) return alert('Vous devez être connecté pour enregistrer une présence.');

      await api.post('/attendance', token, {
        employee_id: formData.employeeId,
        project_id: formData.projectId,
        date: formData.date,
        hours: formData.workHours,
        status: formData.status,
        notes: formData.notes,
      });

      window.dispatchEvent(new Event('attendance:updated'));
      alert('Attendance saved');
    } catch (error) {
      console.error('Failed to save attendance', error);
      alert(error instanceof Error ? error.message : 'Failed to save attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Entry</h1>
        <p className="text-slate-500 mt-1">Record daily attendance and work hours for an employee.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Employee</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  disabled={loadingLists || !employees.length}
                >
                  <option value="">{loadingLists ? 'Loading employees...' : 'Select an employee'}</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name || employee.title || employee._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Project</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderKanban className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  disabled={loadingLists || !projects.length}
                >
                  <option value="">{loadingLists ? 'Loading projects...' : 'Select a project'}</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Daily Attendance</label>
              <select
                required
                className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
                <option value="leave">On Leave</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Work Hours</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  max="24"
                  step="0.5"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.workHours}
                  onChange={(e) => setFormData({ ...formData, workHours: parseFloat(e.target.value) })}
                  disabled={formData.status === 'absent' || formData.status === 'leave'}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea
                rows={3}
                className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Add any relevant notes here..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Attendance
          </button>
        </div>
      </form>
    </div>
  );
}
