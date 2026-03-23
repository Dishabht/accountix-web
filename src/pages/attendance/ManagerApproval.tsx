import React, { useState } from 'react';
import { Check, X, User, FolderKanban, Calendar, Clock } from 'lucide-react';

export default function ManagerApproval() {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      employee: 'Jane Smith',
      project: 'Website Redesign',
      date: '2023-10-25',
      status: 'present',
      workHours: 8,
      notes: 'Completed homepage layout',
      approvalStatus: 'pending'
    },
    {
      id: 2,
      employee: 'Michael Johnson',
      project: 'Mobile App Development',
      date: '2023-10-25',
      status: 'half_day',
      workHours: 4,
      notes: 'Doctor appointment in afternoon',
      approvalStatus: 'pending'
    },
    {
      id: 3,
      employee: 'Sarah Williams',
      project: 'Cloud Migration',
      date: '2023-10-24',
      status: 'absent',
      workHours: 0,
      notes: 'Sick leave',
      approvalStatus: 'pending'
    }
  ]);

  const handleApprove = (id: number) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, approvalStatus: 'approved' } : a));
  };

  const handleReject = (id: number) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, approvalStatus: 'rejected' } : a));
  };

  const pendingApprovals = approvals.filter(a => a.approvalStatus === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manager Approval</h1>
        <p className="text-slate-500 mt-1">Review and approve employee attendance records.</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
          <p className="text-slate-500 mt-1">There are no pending attendance records to approve.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">Employee & Project</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">Date & Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">Hours & Notes</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pendingApprovals.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 flex items-center">
                          <User className="w-4 h-4 mr-1 text-slate-400" />
                          {record.employee}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center mt-1">
                          <FolderKanban className="w-4 h-4 mr-1 text-slate-400" />
                          {record.project}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-slate-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                          {record.date}
                        </span>
                        <span className="text-sm text-slate-500 capitalize">
                          {record.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-slate-900 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-slate-400" />
                          {record.workHours} hrs
                        </span>
                        {record.notes && (
                          <span className="text-xs text-slate-500 italic">
                            "{record.notes}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleApprove(record.id)}
                          className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleReject(record.id)}
                          className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                          title="Reject / Request Correction"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
