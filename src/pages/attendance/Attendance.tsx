import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Attendance as AttendanceRecord, Employee } from '../../types';
import { Plus, Search, Check, X, Edit2, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

type ReviewStatus = 'pending' | 'approved' | 'rejected';

type AttendanceFormData = {
  id: string | null;
  employee_id: string;
  date: string;
  hours: string;
  status: ReviewStatus;
};

const toReviewStatus = (status: unknown): ReviewStatus | null => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value;
  }
  return null;
};

const getStatusClass = (status: unknown) => {
  const value = String(status ?? '').toLowerCase();

  if (value === 'approved') return 'bg-green-100 text-green-800';
  if (value === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const formatStatusLabel = (status: unknown) => {
  const value = String(status ?? '').toLowerCase();
  if (!value) return 'Pending';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const createEmptyFormData = (): AttendanceFormData => ({
  id: null,
  employee_id: '',
  date: getTodayDate(),
  hours: '',
  status: 'pending',
});

const toFormData = (record: AttendanceRecord): AttendanceFormData => ({
  id: record.id,
  employee_id: record.employee_id || '',
  date: record.date || '',
  hours: String(record.hours ?? ''),
  status: toReviewStatus(record.status) || 'pending',
});

const buildStatCards = (total: number, pending: number, approved: number, rejected: number): DashpanelCardData[] => [
  {
    title: 'Total Records',
    value: total.toString(),
    icon: Clock,
    iconBg: 'bg-cyan-600',
    gradientFrom: 'from-cyan-600/10',
    growth: '+0%',
    growthIcon: ArrowUp,
    growthColor: 'text-green-600',
    description: 'attendance entries',
  },
  {
    title: 'Pending',
    value: pending.toString(),
    icon: AlertCircle,
    iconBg: 'bg-purple-600',
    gradientFrom: 'from-purple-600/10',
    growth: `${total > 0 ? ((pending / total) * 100).toFixed(0) : 0}%`,
    growthIcon: ArrowDown,
    growthColor: 'text-red-600',
    description: 'awaiting review',
  },
  {
    title: 'Approved',
    value: approved.toString(),
    icon: CheckCircle2,
    iconBg: 'bg-[#487FFF]',
    gradientFrom: 'from-[#487FFF]/10',
    growth: `${total > 0 ? ((approved / total) * 100).toFixed(0) : 0}%`,
    growthIcon: ArrowUp,
    growthColor: 'text-green-600',
    description: 'validated records',
  },
  {
    title: 'Rejected',
    value: rejected.toString(),
    icon: XCircle,
    iconBg: 'bg-green-600',
    gradientFrom: 'from-green-600/10',
    growth: `${total > 0 ? ((rejected / total) * 100).toFixed(0) : 0}%`,
    growthIcon: ArrowDown,
    growthColor: 'text-red-600',
    description: 'declined records',
  },
];

type AttendanceTableProps = {
  loading: boolean;
  records: AttendanceRecord[];
  canManage: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
};

function AttendanceTable({ loading, records, canManage, onApprove, onReject, onEdit, onDelete }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
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
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 5 : 4} className="px-6 py-4 text-center text-sm text-slate-500">No attendance records found.</td>
            </tr>
          ) : (
            records.map((record) => {
              const status = String(record.status ?? '').toLowerCase();
              return (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{record.employee_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.hours}h</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
                      {formatStatusLabel(status)}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2 items-center">
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => onApprove(record.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(record.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 ml-2"
                          title="Edit Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record.id)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

type AttendanceFormModalProps = {
  isOpen: boolean;
  formData: AttendanceFormData;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (next: AttendanceFormData) => void;
};

function AttendanceFormModal({ isOpen, formData, employees, onClose, onSubmit, onChange }: AttendanceFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                {formData.id ? 'Edit Attendance Record' : 'Create New Record'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => onChange({ ...formData, employee_id: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => onChange({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Hours</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) => onChange({ ...formData, hours: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => onChange({ ...formData, status: e.target.value as ReviewStatus })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {formData.id ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Delete Record</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete this attendance record? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Attendance() {
  const { token, user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<AttendanceFormData>(createEmptyFormData());

  const fetchAttendance = async () => {
    try {
      const data = await api.get('/attendance', token);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await api.get('/employees', token);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [token]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const employeeName = (a.employee_name || '').toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || String(a.status).toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [attendance, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return attendance.reduce(
      (acc, record) => {
        const status = toReviewStatus(record.status);
        if (status) acc[status] += 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [attendance]);

  const statCards = useMemo(
    () => buildStatCards(stats.total, stats.pending, stats.approved, stats.rejected),
    [stats]
  );

  const handleStatusUpdate = async (id: string, status: ReviewStatus) => {
    try {
      await api.put(`/attendance/${id}/status`, token, { status });
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const openAddModal = () => {
    setFormData(createEmptyFormData());
    setIsModalOpen(true);
  };

  const openEditModal = (record: AttendanceRecord) => {
    setFormData(toFormData(record));
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      employee_id: formData.employee_id,
      date: formData.date,
      hours: Number(formData.hours),
      status: formData.status,
    };

    try {
      if (formData.id) {
        await api.put(`/attendance/${formData.id}`, token, payload);
      } else {
        await api.post('/attendance', token, payload);
      }

      setIsModalOpen(false);
      await fetchAttendance();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save attendance record');
      console.error('Failed to save attendance record', error);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      await api.delete(`/attendance/${recordToDelete}`, token);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      await fetchAttendance();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete attendance record');
      console.error('Failed to delete attendance record', error);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h2>
          <p className="text-slate-500 mt-1">Manage and review employee attendance records.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </button>
        )}
      </div>

      <MetricsWidgets cardsData={statCards} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <AttendanceTable
          loading={loading}
          records={filteredAttendance}
          canManage={canManage}
          onApprove={(id) => handleStatusUpdate(id, 'approved')}
          onReject={(id) => handleStatusUpdate(id, 'rejected')}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      <AttendanceFormModal
        isOpen={isModalOpen}
        formData={formData}
        employees={employees}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onChange={setFormData}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
