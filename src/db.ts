import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const dbPath = path.resolve(process.cwd(), 'portal.db');
export const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT -- admin, manager, finance, employee
    );
    
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT -- income, expense
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      contact_info TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      region TEXT,
      company_name TEXT,
      decided_amount REAL,
      period TEXT,
      project TEXT,
      services TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      contact_info TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      region TEXT,
      country TEXT,
      logo_url TEXT,
      company_name TEXT,
      decided_amount REAL,
      period TEXT,
      status TEXT DEFAULT 'Active',
      project TEXT,
      services TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      supplier_id INTEGER,
      manager_id INTEGER,
      title TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY(manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      manager_id INTEGER,
      name TEXT,
      status TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      project_id INTEGER,
      billing_rate REAL,
      pay_rate REAL,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      date TEXT,
      hours REAL,
      status TEXT, -- pending, approved, rejected
      manager_id INTEGER,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT, -- income, expense
      category_id INTEGER,
      amount REAL,
      date TEXT,
      description TEXT,
      reference_id INTEGER, -- could be invoice_id
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      amount REAL,
      status TEXT, -- draft, sent, paid
      issue_date TEXT,
      due_date TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      project_id INTEGER,
      rate_type TEXT, -- hourly, daily
      rate REAL,
      duration REAL,
      total_amount REAL,
      status TEXT, -- draft, sent, accepted, rejected
      created_at TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS customer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      position TEXT,
      duration TEXT,
      status TEXT, -- Draft, Active, Completed, Inactive / Closed
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS supplier_employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER,
      skills TEXT,
      availability TEXT,
      rate REAL,
      rate_type TEXT, -- hourly, daily
      status TEXT, -- Draft, Active, Inactive, Assigned / Completed
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    );
  `);

  // Migration: Add new columns if they don't exist
  const addColumn = (table: string, column: string, type: string) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch (e) {
      // Column might already exist
    }
  };

  addColumn('customers', 'employee_name', 'TEXT');
  addColumn('customers', 'contact_person_name', 'TEXT');
  addColumn('customers', 'contact_person_role', 'TEXT');
  addColumn('customers', 'contact_person_email', 'TEXT');
  addColumn('customers', 'contact_person_phone', 'TEXT');
  addColumn('customers', 'customer_phone', 'TEXT');
  addColumn('customers', 'city', 'TEXT');
  addColumn('customers', 'postal_code', 'TEXT');
  addColumn('customers', 'region', 'TEXT');
  addColumn('customers', 'country', 'TEXT');
  addColumn('customers', 'logo_url', 'TEXT');
  addColumn('customers', 'status', 'TEXT DEFAULT "Active"');
  addColumn('customers', 'project', 'TEXT');
  addColumn('customers', 'services', 'TEXT');
  
  addColumn('suppliers', 'city', 'TEXT');
  addColumn('suppliers', 'postal_code', 'TEXT');
  addColumn('suppliers', 'region', 'TEXT');
  addColumn('suppliers', 'country', 'TEXT');
  addColumn('suppliers', 'logo_url', 'TEXT');
  addColumn('suppliers', 'project', 'TEXT');
  addColumn('suppliers', 'services', 'TEXT');

  addColumn('projects', 'services', 'TEXT');

  // Seed admin user if not exists
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@portal.com');
  if (!admin) {
    const hash = (pw: string) => bcrypt.hashSync(pw, 10);

    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'System Admin', 'admin@portal.com', hash('admin123'), 'admin'
    );
    
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Super Admin', 'super@portal.com', hash('admin123'), 'super_admin'
    );

    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Finance Team', 'finance@portal.com', hash('pass123'), 'finance'
    );

    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Customer User', 'customer@portal.com', hash('pass123'), 'customer_user'
    );

    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Supplier User', 'supplier@portal.com', hash('pass123'), 'supplier_user'
    );

    // Seed Categories
    const catInc1 = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run('Consulting Services', 'income');
    const catInc2 = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run('Software Licensing', 'income');
    const catExp1 = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run('Supplier Payments', 'expense');
    const catExp2 = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run('Office Supplies', 'expense');

    // Seed Suppliers
    const sup1 = db.prepare('INSERT INTO suppliers (name, contact_info) VALUES (?, ?)').run('TechStaffing Inc.', 'contact@techstaffing.com');
    const sup2 = db.prepare('INSERT INTO suppliers (name, contact_info) VALUES (?, ?)').run('DesignPros LLC', 'hello@designpros.com');
    const sup3 = db.prepare('INSERT INTO suppliers (name, contact_info) VALUES (?, ?)').run('CloudExperts Ltd', 'info@cloudexperts.com');

    // Seed Customers
    const cust4 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Umbrella Corp', 'Umbrella Pharmaceuticals', 'info@umbrella.com', '101 Raccoon St', 'Chicago', '60601', 'Illinois', 'USA',
      'https://picsum.photos/seed/umbrella/200/200', 'Active', 'Digital Marketer', JSON.stringify(['SEO Optimization', 'PPC Campaigns']),
      'Albert Wesker', 'Head of Research', 'wesker@umbrella.com', '+1-555-6666', 50000, 'Annual'
    );

    const cust5 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Stark Industries', 'Stark Industries', 'tony@stark.com', '890 Fifth Avenue', 'Malibu', '90265', 'California', 'USA',
      'https://picsum.photos/seed/stark/200/200', 'Inactive', 'Video Editor', JSON.stringify(['Motion Graphics', 'Color Grading']),
      'Pepper Potts', 'CEO', 'pepper@stark.com', '+1-555-0001', 100000, 'Monthly'
    );

    const cust6 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Wayne Enterprises', 'Wayne Enterprises', 'lucius@wayne.com', '1007 Mountain Drive', 'Gotham', '12345', 'New Jersey', 'USA',
      'https://picsum.photos/seed/wayne/200/200', 'Active', 'Web Developer', JSON.stringify(['Fullstack Development', 'Maintenance']),
      'Lucius Fox', 'CEO', 'lucius@wayne.com', '+1-555-BAT1', 75000, 'Quarterly'
    );

    const cust7 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Cyberdyne Systems', 'Cyberdyne Systems', 'miles@cyberdyne.com', '18111 Nordhoff St', 'Northridge', '91330', 'California', 'USA',
      'https://picsum.photos/seed/cyberdyne/200/200', 'Active', 'Digital Marketer', JSON.stringify(['SEO Optimization', 'Content Strategy']),
      'Miles Dyson', 'Director', 'miles@cyberdyne.com', '+1-555-800', 35000, 'Monthly'
    );

    const cust8 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Hooli', 'Hooli Corp', 'gavin@hooli.com', '100 Hooli Way', 'Mountain View', '94043', 'California', 'USA',
      'https://picsum.photos/seed/hooli/200/200', 'Active', 'Web Developer', JSON.stringify(['Backend Development', 'E-commerce Site']),
      'Gavin Belson', 'CEO', 'gavin@hooli.com', '+1-555-HOOL', 90000, 'Monthly'
    );

    const cust9 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Pied Piper', 'Pied Piper Inc.', 'richard@piedpiper.com', '5230 Newell Rd', 'Palo Alto', '94303', 'California', 'USA',
      'https://picsum.photos/seed/piedpiper/200/200', 'Active', 'Web Developer', JSON.stringify(['Backend Development', 'Fullstack Development']),
      'Richard Hendricks', 'CEO', 'richard@piedpiper.com', '+1-555-PIED', 45000, 'Monthly'
    );

    const cust10 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Massive Dynamic', 'Massive Dynamic', 'nina@massivedynamic.com', '650 Townsend St', 'San Francisco', '94103', 'California', 'USA',
      'https://picsum.photos/seed/massive/200/200', 'Active', 'Digital Marketer', JSON.stringify(['SEO Optimization', 'Email Marketing']),
      'Nina Sharp', 'Executive Director', 'nina@massivedynamic.com', '+1-555-DYNM', 120000, 'Annual'
    );

    const cust11 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Oscorp', 'Oscorp Industries', 'norman@oscorp.com', 'Oscorp Tower', 'New York', '10019', 'New York', 'USA',
      'https://picsum.photos/seed/oscorp/200/200', 'Active', 'Graphic Designer', JSON.stringify(['Branding', 'UI/UX Design']),
      'Norman Osborn', 'CEO', 'norman@oscorp.com', '+1-555-GOBL', 85000, 'Quarterly'
    );

    const cust12 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Tyrell Corp', 'Tyrell Corporation', 'eldon@tyrell.com', 'Tyrell Pyramid', 'Los Angeles', '90012', 'California', 'USA',
      'https://picsum.photos/seed/tyrell/200/200', 'Active', 'Web Developer', JSON.stringify(['AI Integration', 'Cloud Infrastructure']),
      'Eldon Tyrell', 'Founder', 'eldon@tyrell.com', '+1-555-REPL', 200000, 'Annual'
    );

    const cust13 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Weyland-Yutani', 'Weyland-Yutani Corp', 'carter@weyland.com', 'Building Better Worlds', 'Tokyo', '100-0001', 'Tokyo', 'Japan',
      'https://picsum.photos/seed/weyland/200/200', 'Active', 'Graphic Designer', JSON.stringify(['Logo Design', 'Corporate Identity']),
      'Carter Burke', 'Director', 'carter@weyland.com', '+1-555-XENO', 150000, 'Monthly'
    );

    const cust14 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Wonka Industries', 'Wonka Industries', 'willy@wonka.com', 'Chocolate Factory', 'London', 'SW1A 1AA', 'Greater London', 'UK',
      'https://picsum.photos/seed/wonka/200/200', 'Active', 'Content Writer', JSON.stringify(['Creative Writing', 'Marketing Copy']),
      'Willy Wonka', 'Owner', 'willy@wonka.com', '+1-555-GOLD', 60000, 'Quarterly'
    );

    const cust15 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Gringotts', 'Gringotts Wizarding Bank', 'griphook@gringotts.com', 'Diagon Alley', 'London', 'E1 6AN', 'Greater London', 'UK',
      'https://picsum.photos/seed/gringotts/200/200', 'Inactive', 'Digital Marketer', JSON.stringify(['Security Audits', 'SEO']),
      'Griphook', 'Head Goblin', 'griphook@gringotts.com', '+44-555-COIN', 300000, 'Annual'
    );

    const cust16 = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Daily Planet', 'The Daily Planet', 'perry@dailyplanet.com', 'Planet Building', 'Metropolis', '54321', 'New York', 'USA',
      'https://picsum.photos/seed/planet/200/200', 'Active', 'Video Editor', JSON.stringify(['News Editing', 'Documentaries']),
      'Perry White', 'Editor-in-Chief', 'perry@dailyplanet.com', '+1-555-NEWS', 40000, 'Monthly'
    );

    // Seed Managers
    const manager1 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Sarah Manager', 'sarah@portal.com', hash('pass123'), 'manager');
    const manager2 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Michael Scott', 'michael@portal.com', hash('pass123'), 'manager');

    // Seed Employees
    const empUser1 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Alice Smith', 'alice@example.com', hash('pass123'), 'employee');
    const empUser2 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Bob Jones', 'bob@example.com', hash('pass123'), 'employee');
    const empUser3 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Charlie Brown', 'charlie@example.com', hash('pass123'), 'employee');
    const empUser4 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Diana Prince', 'diana@example.com', hash('pass123'), 'employee');
    const empUser5 = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Evan Wright', 'evan@example.com', hash('pass123'), 'employee');

    const emp1 = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(empUser1.lastInsertRowid, sup1.lastInsertRowid, manager1.lastInsertRowid, 'Senior Developer');
    const emp2 = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(empUser2.lastInsertRowid, sup2.lastInsertRowid, manager1.lastInsertRowid, 'UX Designer');
    const emp3 = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(empUser3.lastInsertRowid, sup1.lastInsertRowid, manager2.lastInsertRowid, 'Backend Engineer');
    const emp4 = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(empUser4.lastInsertRowid, sup3.lastInsertRowid, manager2.lastInsertRowid, 'Cloud Architect');
    const emp5 = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(empUser5.lastInsertRowid, sup2.lastInsertRowid, manager1.lastInsertRowid, 'UI Designer');

    // Seed Projects
    const proj1 = db.prepare('INSERT INTO projects (customer_id, manager_id, name, status) VALUES (?, ?, ?, ?)').run(cust4.lastInsertRowid, manager1.lastInsertRowid, 'Website Redesign', 'Active');
    const proj2 = db.prepare('INSERT INTO projects (customer_id, manager_id, name, status) VALUES (?, ?, ?, ?)').run(cust5.lastInsertRowid, manager1.lastInsertRowid, 'Mobile App Dev', 'Active');
    const proj3 = db.prepare('INSERT INTO projects (customer_id, manager_id, name, status) VALUES (?, ?, ?, ?)').run(cust6.lastInsertRowid, manager2.lastInsertRowid, 'Cloud Migration', 'Active');

    // Seed Assignments
    db.prepare('INSERT INTO assignments (employee_id, project_id, billing_rate, pay_rate) VALUES (?, ?, ?, ?)').run(emp1.lastInsertRowid, proj1.lastInsertRowid, 150, 100);
    db.prepare('INSERT INTO assignments (employee_id, project_id, billing_rate, pay_rate) VALUES (?, ?, ?, ?)').run(emp2.lastInsertRowid, proj1.lastInsertRowid, 120, 80);
    db.prepare('INSERT INTO assignments (employee_id, project_id, billing_rate, pay_rate) VALUES (?, ?, ?, ?)').run(emp3.lastInsertRowid, proj2.lastInsertRowid, 140, 90);
    db.prepare('INSERT INTO assignments (employee_id, project_id, billing_rate, pay_rate) VALUES (?, ?, ?, ?)').run(emp4.lastInsertRowid, proj3.lastInsertRowid, 180, 120);

    // Seed Attendance
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).toISOString().split('T')[0];
      db.prepare('INSERT INTO attendance (employee_id, date, hours, status, manager_id) VALUES (?, ?, ?, ?, ?)').run(emp1.lastInsertRowid, dateStr, 8, 'approved', manager1.lastInsertRowid);
      db.prepare('INSERT INTO attendance (employee_id, date, hours, status, manager_id) VALUES (?, ?, ?, ?, ?)').run(emp2.lastInsertRowid, dateStr, 8, 'pending', manager1.lastInsertRowid);
      db.prepare('INSERT INTO attendance (employee_id, date, hours, status, manager_id) VALUES (?, ?, ?, ?, ?)').run(emp3.lastInsertRowid, dateStr, 8, 'approved', manager2.lastInsertRowid);
    }

    // Seed Invoices
    const inv1 = db.prepare('INSERT INTO invoices (customer_id, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?)').run(cust4.lastInsertRowid, 15000, 'paid', '2026-02-01', '2026-02-15');
    const inv2 = db.prepare('INSERT INTO invoices (customer_id, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?)').run(cust5.lastInsertRowid, 22000, 'sent', '2026-03-01', '2026-03-15');
    const inv3 = db.prepare('INSERT INTO invoices (customer_id, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?)').run(cust6.lastInsertRowid, 18500, 'draft', '2026-03-05', '2026-03-20');

    // Seed Quotations
    const quote1 = db.prepare('INSERT INTO quotations (customer_id, project_id, rate_type, rate, duration, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(cust4.lastInsertRowid, proj1.lastInsertRowid, 'hourly', 150, 100, 15000, 'Accepted', new Date().toISOString());
    const quote2 = db.prepare('INSERT INTO quotations (customer_id, project_id, rate_type, rate, duration, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(cust5.lastInsertRowid, proj2.lastInsertRowid, 'daily', 800, 30, 24000, 'Sent', new Date().toISOString());
    const quote3 = db.prepare('INSERT INTO quotations (customer_id, project_id, rate_type, rate, duration, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(cust6.lastInsertRowid, proj3.lastInsertRowid, 'hourly', 200, 50, 10000, 'Draft', new Date().toISOString());
    const quote4 = db.prepare('INSERT INTO quotations (customer_id, project_id, rate_type, rate, duration, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(cust7.lastInsertRowid, proj1.lastInsertRowid, 'daily', 1000, 15, 15000, 'Rejected', new Date().toISOString());

    // Seed Transactions (Financial Data for Charts)
    const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
    months.forEach(month => {
      // Income
      db.prepare('INSERT INTO transactions (type, category_id, amount, date, description) VALUES (?, ?, ?, ?, ?)').run('income', catInc1.lastInsertRowid, Math.floor(Math.random() * 30000) + 20000, `${month}-15`, 'Consulting Revenue');
      // Expense
      db.prepare('INSERT INTO transactions (type, category_id, amount, date, description) VALUES (?, ?, ?, ?, ?)').run('expense', catExp1.lastInsertRowid, Math.floor(Math.random() * 20000) + 10000, `${month}-20`, 'Supplier Payouts');
    });
  }

  // Ensure we have a good amount of dummy customers for the demo
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (customerCount.count < 10) {
    const hash = (pw: string) => bcrypt.hashSync(pw, 10);
    
    const dummyCustomers = [
      ['Stark Industries', 'Stark Industries', 'tony@stark.com', '890 Fifth Avenue', 'Malibu', '90265', 'California', 'USA', 'https://picsum.photos/seed/stark/200/200', 'Inactive', 'Video Editor', JSON.stringify(['Motion Graphics', 'Color Grading']), 'Pepper Potts', 'CEO', 'pepper@stark.com', '+1-555-0001', 100000, 'Monthly'],
      ['Wayne Enterprises', 'Wayne Enterprises', 'lucius@wayne.com', '1007 Mountain Drive', 'Gotham', '12345', 'New Jersey', 'USA', 'https://picsum.photos/seed/wayne/200/200', 'Active', 'Web Developer', JSON.stringify(['Fullstack Development', 'Maintenance']), 'Lucius Fox', 'CEO', 'lucius@wayne.com', '+1-555-BAT1', 75000, 'Quarterly'],
      ['Cyberdyne Systems', 'Cyberdyne Systems', 'miles@cyberdyne.com', '18111 Nordhoff St', 'Northridge', '91330', 'California', 'USA', 'https://picsum.photos/seed/cyberdyne/200/200', 'Active', 'Digital Marketer', JSON.stringify(['SEO Optimization', 'Content Strategy']), 'Miles Dyson', 'Director', 'miles@cyberdyne.com', '+1-555-800', 35000, 'Monthly'],
      ['Hooli', 'Hooli Corp', 'gavin@hooli.com', '100 Hooli Way', 'Mountain View', '94043', 'California', 'USA', 'https://picsum.photos/seed/hooli/200/200', 'Active', 'Web Developer', JSON.stringify(['Backend Development', 'E-commerce Site']), 'Gavin Belson', 'CEO', 'gavin@hooli.com', '+1-555-HOOL', 90000, 'Monthly'],
      ['Pied Piper', 'Pied Piper Inc.', 'richard@piedpiper.com', '5230 Newell Rd', 'Palo Alto', '94303', 'California', 'USA', 'https://picsum.photos/seed/piedpiper/200/200', 'Active', 'Web Developer', JSON.stringify(['Backend Development', 'Fullstack Development']), 'Richard Hendricks', 'CEO', 'richard@piedpiper.com', '+1-555-PIED', 45000, 'Monthly'],
      ['Massive Dynamic', 'Massive Dynamic', 'nina@massivedynamic.com', '650 Townsend St', 'San Francisco', '94103', 'California', 'USA', 'https://picsum.photos/seed/massive/200/200', 'Active', 'Digital Marketer', JSON.stringify(['SEO Optimization', 'Email Marketing']), 'Nina Sharp', 'Executive Director', 'nina@massivedynamic.com', '+1-555-DYNM', 120000, 'Annual'],
      ['Oscorp', 'Oscorp Industries', 'norman@oscorp.com', 'Oscorp Tower', 'New York', '10019', 'New York', 'USA', 'https://picsum.photos/seed/oscorp/200/200', 'Active', 'Graphic Designer', JSON.stringify(['Branding', 'UI/UX Design']), 'Norman Osborn', 'CEO', 'norman@oscorp.com', '+1-555-GOBL', 85000, 'Quarterly'],
      ['Tyrell Corp', 'Tyrell Corporation', 'eldon@tyrell.com', 'Tyrell Pyramid', 'Los Angeles', '90012', 'California', 'USA', 'https://picsum.photos/seed/tyrell/200/200', 'Active', 'Web Developer', JSON.stringify(['AI Integration', 'Cloud Infrastructure']), 'Eldon Tyrell', 'Founder', 'eldon@tyrell.com', '+1-555-REPL', 200000, 'Annual'],
      ['Weyland-Yutani', 'Weyland-Yutani Corp', 'carter@weyland.com', 'Building Better Worlds', 'Tokyo', '100-0001', 'Tokyo', 'Japan', 'https://picsum.photos/seed/weyland/200/200', 'Active', 'Graphic Designer', JSON.stringify(['Logo Design', 'Corporate Identity']), 'Carter Burke', 'Director', 'carter@weyland.com', '+1-555-XENO', 150000, 'Monthly'],
      ['Wonka Industries', 'Wonka Industries', 'willy@wonka.com', 'Chocolate Factory', 'London', 'SW1A 1AA', 'Greater London', 'UK', 'https://picsum.photos/seed/wonka/200/200', 'Active', 'Content Writer', JSON.stringify(['Creative Writing', 'Marketing Copy']), 'Willy Wonka', 'Owner', 'willy@wonka.com', '+1-555-GOLD', 60000, 'Quarterly'],
      ['Gringotts', 'Gringotts Wizarding Bank', 'griphook@gringotts.com', 'Diagon Alley', 'London', 'E1 6AN', 'Greater London', 'UK', 'https://picsum.photos/seed/gringotts/200/200', 'Inactive', 'Digital Marketer', JSON.stringify(['Security Audits', 'SEO']), 'Griphook', 'Head Goblin', 'griphook@gringotts.com', '+44-555-COIN', 300000, 'Annual'],
      ['Daily Planet', 'The Daily Planet', 'perry@dailyplanet.com', 'Planet Building', 'Metropolis', '54321', 'New York', 'USA', 'https://picsum.photos/seed/planet/200/200', 'Active', 'Video Editor', JSON.stringify(['News Editing', 'Documentaries']), 'Perry White', 'Editor-in-Chief', 'perry@dailyplanet.com', '+1-555-NEWS', 40000, 'Monthly']
    ];

    const insert = db.prepare(`
      INSERT INTO customers (
        name, company_name, contact_info, address, city, postal_code, region, country, 
        logo_url, status, project, services, contact_person_name, contact_person_role, 
        contact_person_email, contact_person_phone, decided_amount, period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    dummyCustomers.forEach(cust => {
      const exists = db.prepare('SELECT id FROM customers WHERE name = ?').get(cust[0]);
      if (!exists) {
        insert.run(...cust);
      }
    });
  }

  // Seed Customer Requests
  const requestCount = db.prepare('SELECT COUNT(*) as count FROM customer_requests').get() as { count: number };
  if (requestCount.count === 0) {
    const customers = db.prepare('SELECT id FROM customers LIMIT 5').all() as { id: number }[];
    if (customers.length > 0) {
      const insertReq = db.prepare('INSERT INTO customer_requests (customer_id, position, duration, status) VALUES (?, ?, ?, ?)');
      insertReq.run(customers[0].id, 'Senior Web Developer', '6 Months', 'Active');
      insertReq.run(customers[1 % customers.length].id, 'UX/UI Designer', '3 Months', 'Draft');
      insertReq.run(customers[2 % customers.length].id, 'DevOps Engineer', '12 Months', 'Active');
      insertReq.run(customers[3 % customers.length].id, 'Project Manager', '6 Months', 'Completed');
      insertReq.run(customers[4 % customers.length].id, 'Data Analyst', '3 Months', 'Inactive / Closed');
    }
  }
}

