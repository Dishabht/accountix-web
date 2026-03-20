import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  FolderKanban,
  UserCheck,
  LineChart,
  Activity,
  Bell,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const getNavigationGroups = (role: string) => {
    const groups = [
      {
        name: 'Dashboard',
        items: [
          { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'manager', 'finance'] },
          { name: 'Recent activities', href: '/activities', icon: Activity, roles: ['super_admin', 'admin', 'manager', 'finance'] },
          { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['super_admin', 'admin', 'manager', 'finance', 'customer_user', 'supplier_user'] },
        ]
      },
      {
        name: 'Customer Management',
        items: [
          { name: 'Customers List', href: '/customers', icon: Briefcase, roles: ['super_admin', 'admin', 'manager'] },
          { name: 'Customer Requests', href: '/customer-requests', icon: FileText, roles: ['super_admin', 'admin', 'manager', 'customer_user'] },
          { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['super_admin', 'admin', 'manager', 'customer_user'] },
          { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['super_admin', 'admin', 'finance', 'customer_user'] },
        ]
      },
      {
        name: 'Quotation Management',
        items: [
          { name: 'Quotation List', href: '/quotations', icon: FileText, roles: ['super_admin', 'admin', 'manager', 'finance'] },
          { name: 'Create Quotation', href: '/quotations/create', icon: FileText, roles: ['super_admin', 'admin', 'manager'] },
        ]
      },
      {
        name: 'Supplier Management',
        items: [
          { name: 'Suppliers List', href: '/suppliers', icon: Building2, roles: ['super_admin', 'admin', 'manager'] },
          { name: 'Supplier Employees', href: '/supplier-employees', icon: Users, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
          { name: 'Supplier Contracts', href: '/suppliers/contracts', icon: FileText, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
        ]
      },
      {
        name: 'Employee Management',
        items: [
          { name: 'Employee List', href: '/employees', icon: Users, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
          { name: 'Add Employee', href: '/employees/add', icon: UserCheck, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
          { name: 'Employee Assignment', href: '/assignments', icon: UserCheck, roles: ['super_admin', 'admin', 'manager'] },
        ]
      },
      {
        name: 'Attendance Management',
        items: [
          { name: 'Attendance Entry', href: '/attendance/entry', icon: Clock, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
          { name: 'Monthly Attendance', href: '/attendance/monthly', icon: Clock, roles: ['super_admin', 'admin', 'manager', 'supplier_user'] },
          { name: 'Manager Approval', href: '/attendance/approval', icon: Shield, roles: ['super_admin', 'admin', 'manager'] },
          { name: 'Attendance Reports', href: '/attendance/reports', icon: LineChart, roles: ['super_admin', 'admin', 'manager'] },
        ]
      },
      {
        name: 'System',
        items: [
          { name: 'Managers', href: '/managers', icon: Shield, roles: ['super_admin', 'admin'] },
          { name: 'Add Company', href: '/companies/add', icon: Building2, roles: ['super_admin', 'admin', 'manager'] },
        ]
      }
    ];

    return groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(role))
    })).filter(group => group.items.length > 0);
  };

  const navigationGroups = getNavigationGroups(user.role);

  // Auto-expand the group that contains the current active route
  useEffect(() => {
    const activeGroup = navigationGroups.find(group => 
      group.items.some(item => item.href === location.pathname)
    );
    
    if (activeGroup && expandedGroups[activeGroup.name] === undefined) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.name]: true }));
    }
  }, [location.pathname, navigationGroups, expandedGroups]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:flex lg:flex-col lg:shrink-0`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 bg-slate-950 shrink-0">
            <h1 className="text-xl font-bold tracking-tight">Accountability</h1>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups[group.name];
              return (
                <div key={group.name} className="mb-2">
                  <button 
                    onClick={() => toggleGroup(group.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    <span>{group.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 bg-slate-950 shrink-0">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-slate-400" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8 justify-between lg:justify-end shrink-0">
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
            {/* Add header actions here if needed */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
