import React from 'react';
import { Activity, UserPlus, FileText, CheckCircle, Clock } from 'lucide-react';

export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: 'user_added',
      title: 'New Employee Added',
      description: 'Jane Smith was added to the system by Admin.',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'quotation_created',
      title: 'Quotation Created',
      description: 'A new quotation (#QT-2023-001) was created for Acme Corp.',
      time: '4 hours ago',
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 3,
      type: 'attendance_approved',
      title: 'Attendance Approved',
      description: 'Manager approved attendance records for the Website Redesign project.',
      time: 'Yesterday at 4:30 PM',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 4,
      type: 'project_updated',
      title: 'Project Status Updated',
      description: 'Mobile App Development project status changed to "In Progress".',
      time: 'Yesterday at 11:15 AM',
      icon: Activity,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 5,
      type: 'invoice_sent',
      title: 'Invoice Sent',
      description: 'Invoice #INV-2023-042 was sent to Globex Corporation.',
      time: 'Oct 24, 2023',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Activities</h2>
        <p className="text-slate-500 mt-1">Track the latest actions and updates across the portal.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span className="absolute top-4 left-6 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-4">
                      <div>
                        <span className={`h-12 w-12 rounded-full flex items-center justify-center ring-8 ring-white ${activity.bgColor}`}>
                          <activity.icon className={`h-5 w-5 ${activity.color}`} aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-slate-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
