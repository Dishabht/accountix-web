import React, { useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Pending Approvals',
      message: 'You have 3 pending attendance records to approve for the Website Redesign project.',
      time: '10 minutes ago',
      type: 'warning',
      read: false,
    },
    {
      id: 2,
      title: 'New Quotation Request',
      message: 'Acme Corp has requested a new quotation for SEO Services.',
      time: '1 hour ago',
      type: 'info',
      read: false,
    },
    {
      id: 3,
      title: 'Contract Expiring Soon',
      message: 'The contract for employee Michael Johnson (Globex Corporation) expires in 7 days.',
      time: 'Yesterday',
      type: 'warning',
      read: true,
    },
    {
      id: 4,
      title: 'Invoice Paid',
      message: 'Invoice #INV-2023-041 for Soylent Corp has been marked as paid.',
      time: 'Oct 24, 2023',
      type: 'success',
      read: true,
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <Check className="w-5 h-5 text-emerald-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50';
      case 'success': return 'bg-emerald-50';
      case 'info':
      default: return 'bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-slate-500 mt-1">Stay updated with important alerts and messages.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-1">You have no new notifications.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-4 sm:p-6 transition-colors ${notification.read ? 'bg-white' : 'bg-slate-50'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="w-2 h-2 bg-indigo-600 rounded-full"
                            title="Mark as read"
                          />
                        )}
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <div className="mt-3">
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
