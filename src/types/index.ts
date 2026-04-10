// Type definitions for all domain models — ensures type safety across React components

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'finance' | 'employee' | 'customer_user' | 'supplier_user';
}

export interface Customer {
  id: string;
  name: string;
  company_name?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  city?: string;
  country?: string;
  status: 'Active' | 'Inactive';
  invoice_count?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  supplier_name?: string;
  manager_name?: string;
}

export interface SupplierEmployee {
  id: string;
  supplier_id?: string;
  skills?: string;
  availability?: string;
  rate?: number;
  rate_type?: 'hourly' | 'daily';
  status?: 'Active' | 'Draft' | 'Inactive' | 'Assigned / Completed';
}

export interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'On Hold';
  customer_id: string;
  customer_name?: string;
  manager_id?: string;
  manager_name?: string;
  services?: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  issue_date: string;
  due_date: string;
}

export interface Quotation {
  id: string;
  customer_id: string;
  customer_name?: string;
  project_id?: string;
  project_name?: string;
  rate_type?: 'hourly' | 'daily';
  rate?: number;
  duration?: number;
  total_amount?: number;
  amount?: number;
  created_at?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

export interface Supplier {
  id: string;
  name: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  contact_info?: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  logo_url?: string;
  project?: string;
  services?: string;
}

export interface Assignment {
  id: string;
  employee_id: string;
  employee_name?: string;
  project_id: string;
  project_name?: string;
  billing_rate: number;
  pay_rate: number;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name?: string;
  project_id?: string;
  project_name?: string;
  date: string;
  status: 'present' | 'absent' | 'half-day';
  hours: number;
}

export interface SupplierContract {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  employee_id: string;
  employee_name?: string;
  project_id: string;
  project_name?: string;
  contract_type?: 'Hourly' | 'Daily' | 'Fixed';
  rate: number;
  duration: number;
  status: 'Active' | 'Inactive' | 'Pending' | 'Completed';
}
