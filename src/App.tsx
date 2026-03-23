/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/employees/Employees';
import AddEmployee from './pages/employees/AddEmployee';
import SupplierEmployees from './pages/employees/SupplierEmployees';
import AddSupplierEmployee from './pages/employees/AddSupplierEmployee';
import Suppliers from './pages/suppliers/Suppliers';
import SupplierContracts from './pages/suppliers/SupplierContracts';
import Customers from './pages/customers/Customers';
import CustomerDetails from './pages/customers/CustomerDetails';
import CustomerRequests from './pages/customers/CustomerRequests';
import AddCustomerRequest from './pages/customers/AddCustomerRequest';
import RegisterCompany from './pages/admin/RegisterCompany';
import Invoices from './pages/invoices/Invoices';
import CreateInvoice from './pages/invoices/CreateInvoice';
import EditInvoice from './pages/invoices/EditInvoice';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import Managers from './pages/admin/Managers';
import Attendance from './pages/attendance/Attendance';
import AttendanceEntry from './pages/attendance/AttendanceEntry';
import MonthlyAttendance from './pages/attendance/MonthlyAttendance';
import ManagerApproval from './pages/attendance/ManagerApproval';
import AttendanceReports from './pages/attendance/AttendanceReports';
import Projects from './pages/projects/Projects';
import AddEditProject from './pages/projects/AddEditProject';
import ProjectDetails from './pages/projects/ProjectDetails';
import Assignments from './pages/projects/Assignments';
import RecentActivities from './pages/admin/RecentActivities';
import Notifications from './pages/admin/Notifications';
import QuotationList from './pages/quotations/QuotationList';
import CreateQuotation from './pages/quotations/CreateQuotation';
import EditQuotation from './pages/quotations/EditQuotation';
import QuotationDetails from './pages/quotations/QuotationDetails';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="activities" element={<RecentActivities />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="managers" element={<Managers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="attendance/entry" element={<AttendanceEntry />} />
            <Route path="attendance/monthly" element={<MonthlyAttendance />} />
            <Route path="attendance/approval" element={<ManagerApproval />} />
            <Route path="attendance/reports" element={<AttendanceReports />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="companies/add" element={<RegisterCompany />} />
            <Route path="companies/edit/:id" element={<RegisterCompany />} />
            <Route path="suppliers/contracts" element={<SupplierContracts />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customer-requests" element={<CustomerRequests />} />
            <Route path="add-customer-request" element={<AddCustomerRequest />} />
            <Route path="supplier-employees" element={<SupplierEmployees />} />
            <Route path="add-supplier-employee" element={<AddSupplierEmployee />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/add" element={<AddEditProject />} />
            <Route path="projects/edit/:id" element={<AddEditProject />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            <Route path="invoices/:id/edit" element={<EditInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="quotations" element={<QuotationList />} />
            <Route path="quotations/create" element={<CreateQuotation />} />
            <Route path="quotations/:id/edit" element={<EditQuotation />} />
            <Route path="quotations/:id" element={<QuotationDetails />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
