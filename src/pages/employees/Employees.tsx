import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Employee, Supplier } from '../../types';
import { Plus, Search, X, Edit2, Trash2, Users, Briefcase, UserCheck } from 'lucide-react';
import { MetricsWidgets, type DashpanelCardData } from '../../components/dashpanel';

type EmployeeFormData = {
  id: string | null;
  name: string;
  email: string;
  password: string;
  title: string;
  supplier_id: string;
  manager_id: string;
};

type EmployeeRow = Employee & {
  supplier_id?: string;
  manager_id?: string;
  supplier_name?: string;
  manager_name?: string;
};

const createEmptyFormData = (): EmployeeFormData => ({
  id: null,
  name: '',
  email: '',
  password: '',
  title: '',
  supplier_id: '',
  manager_id: '',
});

const toEmployeeFormData = (emp: EmployeeRow): EmployeeFormData => ({
  id: emp.id,
  name: emp.name || '',
  email: emp.email || '',
  password: '',
  title: emp.title || '',
  supplier_id: emp.supplier_id || '',
  manager_id: emp.manager_id || '',
});

const isManagerTitle = (title?: string) => (title || '').toLowerCase().includes('manager');

const buildStatCards = (total: number, managers: number, suppliers: number): DashpanelCardData[] => [
  {
    title: 'Total Employees',
    value: total.toString(),
    icon: Users,
    iconBg: 'bg-cyan-600',
    gradientFrom: 'from-cyan-600/10',
  },
  {
    title: 'Managers',
    value: managers.toString(),
    icon: UserCheck,
    iconBg: 'bg-purple-600',
    gradientFrom: 'from-purple-600/10',
  },
  {
    title: 'Supplier Employees',
    value: suppliers.toString(),
    icon: Briefcase,
    iconBg: 'bg-[#487FFF]',
    gradientFrom: 'from-[#487FFF]/10',
  },
];

const buildEmployeePayload = (formData: EmployeeFormData) => {
  const payload: Record<string, string> = {
    name: formData.name,
    email: formData.email,
    title: formData.title,
    supplier_id: formData.supplier_id,
    manager_id: formData.manager_id,
  };

  if (!formData.id || formData.password) {
    payload.password = formData.password;
  }

  return payload;
};

type EmployeeTableProps = {
  loading: boolean;
  employees: EmployeeRow[];
  canManage: boolean;
  onEdit: (emp: EmployeeRow) => void;
  onDelete: (id: string) => void;
};

function EmployeeTable({ loading, employees, canManage, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</th>
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
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 5 : 4} className="px-6 py-4 text-center text-sm text-slate-500">No employees found.</td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{emp.name}</div>
                      <div className="text-sm text-slate-500">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.title || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.supplier_name || 'Direct'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.manager_name || 'None'}</td>
                {canManage && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(emp)}
                        data-testid={`employee-edit-button-${emp.id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emp.id)}
                        data-testid={`employee-delete-button-${emp.id}`}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Employee"
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
  );
}

type EmployeeFormModalProps = {
  isOpen: boolean;
  formData: EmployeeFormData;
  suppliers: Supplier[];
  managers: Employee[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (next: EmployeeFormData) => void;
};

function EmployeeFormModal({ isOpen, formData, suppliers, managers, onClose, onSubmit, onChange }: EmployeeFormModalProps) {
  if (!isOpen) return null;
  const [emailFieldName, setEmailFieldName] = useState('');
  const [passwordFieldName, setPasswordFieldName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // For edit forms keep names so existing values show; for add, clear names to avoid autofill
      if (formData.id) {
        setEmailFieldName('username');
        setPasswordFieldName('password');
      } else {
        setEmailFieldName('');
        setPasswordFieldName('');
      }
      // If adding a new employee, clear any prefilled values to prevent browser autofill showing on open
      if (!formData.id) {
        // clear email and password in parent formData
        onChange({ ...formData, email: '', password: '' });
      }
    } else {
      // when modal closes, reset internal field-name state so next open isn't affected by autofill
      setEmailFieldName('');
      setPasswordFieldName('');
    }
  }, [isOpen, formData.id]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                {formData.id ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  data-testid="employee-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => onChange({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  data-testid="employee-email"
                  type="email"
                  name={emailFieldName || undefined}
                  autoComplete="username"
                  readOnly
                  onFocus={(e) => {
                    if (!emailFieldName) setEmailFieldName('username');
                    ((e.target as HTMLInputElement).readOnly = false);
                  }}
                  onMouseDown={(e) => {
                    if (!emailFieldName) setEmailFieldName('username');
                    ((e.target as HTMLInputElement).readOnly = false);
                  }}
                  required
                  value={formData.email}
                  onChange={(e) => onChange({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {!formData.id && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    data-testid="employee-password"
                    type="password"
                    name={passwordFieldName || undefined}
                    autoComplete="current-password"
                    readOnly
                    onFocus={(e) => {
                      if (!passwordFieldName) setPasswordFieldName('password');
                      ((e.target as HTMLInputElement).readOnly = false);
                    }}
                    onMouseDown={(e) => {
                      if (!passwordFieldName) setPasswordFieldName('password');
                      ((e.target as HTMLInputElement).readOnly = false);
                    }}
                    required
                    value={formData.password}
                    onChange={(e) => onChange({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Title</label>
                <input
                  data-testid="employee-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => onChange({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Supplier</label>
                <select
                  data-testid="employee-supplier"
                  required
                  value={formData.supplier_id}
                  onChange={(e) => onChange({ ...formData, supplier_id: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Manager</label>
                <select
                  data-testid="employee-manager"
                  required
                  value={formData.manager_id}
                  onChange={(e) => onChange({ ...formData, manager_id: e.target.value })}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="employee-form-cancel"
                  className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="employee-form-submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {formData.id ? 'Update Employee' : 'Save Employee'}
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
                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Delete Employee</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete this employee? This action cannot be undone and will remove their access to the system.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                data-testid="employee-delete-confirm"
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                data-testid="employee-delete-cancel"
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

export default function Employees() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyFormData());

  const fetchEmployees = async () => {
    try {
      const data = await api.get('/employees', token);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [suppliersData, managersData] = await Promise.all([
        api.get('/suppliers', token),
        api.get('/users?role=manager', token),
      ]);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setManagers(Array.isArray(managersData) ? managersData : []);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdownData();
  }, [token]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(normalizedSearch) ||
      emp.email.toLowerCase().includes(normalizedSearch) ||
      (emp.title || '').toLowerCase().includes(normalizedSearch)
    );
  }, [employees, searchTerm]);

  // Count stats:
  // - total: number of employee records
  // - managers: prefer `managers.length` (users with role=manager) when available,
  //   otherwise count unique `manager_id` referenced by employees
  // - suppliers: count unique `supplier_id` referenced by employees (more reliable than supplier_name)
  const stats = useMemo(() => {
    const total = employees.length;
    const managersCount = (Array.isArray(managers) && managers.length > 0)
      ? managers.length
      : new Set(employees.map((e) => e.manager_id).filter(Boolean)).size;
    const suppliersCount = new Set(employees.map((e) => e.supplier_id).filter(Boolean)).size;

    return {
      total,
      managers: managersCount,
      suppliers: suppliersCount,
    };
  }, [employees, managers]);

  const statCards = useMemo(
    () => buildStatCards(stats.total, stats.managers, stats.suppliers),
    [stats]
  );

  const openAddModal = () => {
    setFormData(createEmptyFormData());
    setIsModalOpen(true);
  };

  const openEditModal = (emp: EmployeeRow) => {
    setFormData(toEmployeeFormData(emp));
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setEmployeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = buildEmployeePayload(formData);

      if (formData.id) {
        await api.put(`/employees/${formData.id}`, token, payload);
      } else {
        await api.post('/employees', token, payload);
      }

      setIsModalOpen(false);
      await fetchEmployees();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save employee');
      console.error('Failed to save employee', error);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await api.delete(`/employees/${employeeToDelete}`, token);
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      await fetchEmployees();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete employee');
      console.error('Failed to delete employee', error);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h2>
          <p className="text-slate-500 mt-1">Manage employee profiles and assignments.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddModal}
            data-testid="employee-add-button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
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
              data-testid="employee-search"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <EmployeeTable
          loading={loading}
          employees={filteredEmployees}
          canManage={canManage}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      <EmployeeFormModal
        isOpen={isModalOpen}
        formData={formData}
        suppliers={suppliers}
        managers={managers}
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
