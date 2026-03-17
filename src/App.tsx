/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import RegisterCompany from './pages/RegisterCompany';
import SupplierContracts from './pages/SupplierContracts';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetails from './pages/InvoiceDetails';
import Managers from './pages/Managers';
import Attendance from './pages/Attendance';
import AttendanceEntry from './pages/AttendanceEntry';
import MonthlyAttendance from './pages/MonthlyAttendance';
import ManagerApproval from './pages/ManagerApproval';
import AttendanceReports from './pages/AttendanceReports';
import Projects from './pages/Projects';
import AddEditProject from './pages/AddEditProject';
import ProjectDetails from './pages/ProjectDetails';
import Assignments from './pages/Assignments';
import RecentActivities from './pages/RecentActivities';
import Notifications from './pages/Notifications';
import AddCustomerRequest from './pages/AddCustomerRequest';
import AddSupplierEmployee from './pages/AddSupplierEmployee';
import CustomerRequests from './pages/CustomerRequests';
import SupplierEmployees from './pages/SupplierEmployees';
import EditQuotation from './pages/EditQuotation';
import QuotationList from './pages/QuotationList';
import CreateQuotation from './pages/CreateQuotation';
import QuotationDetails from './pages/QuotationDetails';
import CustomerDetails from './pages/CustomerDetails';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
