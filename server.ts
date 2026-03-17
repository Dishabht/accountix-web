import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db, initDb } from './src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database
  initDb();

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
  });

  // Users (Managers, Employees, Finance, etc.)
  app.get('/api/users', authenticateToken, (req: any, res) => {
    const role = req.query.role;
    let query = 'SELECT id, name, email, role FROM users';
    let params: any[] = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    const users = db.prepare(query).all(...params);
    res.json(users);
  });

  app.post('/api/users', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.sendStatus(403);
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, role);
      res.json({ id: result.lastInsertRowid, name, email, role });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Suppliers
  app.get('/api/suppliers', authenticateToken, (req: any, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers').all();
    res.json(suppliers);
  });

  app.post('/api/suppliers', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services } = req.body;
    try {
      const result = db.prepare('INSERT INTO suppliers (name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services);
      res.json({ id: result.lastInsertRowid, name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/suppliers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services } = req.body;
    try {
      db.prepare('UPDATE suppliers SET name = ?, contact_info = ?, address = ?, city = ?, postal_code = ?, region = ?, country = ?, logo_url = ?, company_name = ?, decided_amount = ?, period = ?, project = ?, services = ? WHERE id = ?').run(name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, project, services, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/suppliers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Customers
  app.get('/api/customers', authenticateToken, (req: any, res) => {
    const customers = db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM invoices WHERE customer_id = c.id) as invoice_count
      FROM customers c
    `).all();
    res.json(customers);
  });

  app.get('/api/customers/:id', authenticateToken, (req: any, res) => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  });

  app.post('/api/customers', authenticateToken, (req: any, res) => {
    const { name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status, project, services } = req.body;
    try {
      const result = db.prepare('INSERT INTO customers (name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status, project, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status || 'Active', project, services);
      res.json({ id: result.lastInsertRowid, name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status: status || 'Active', project, services });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/customers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status, project, services } = req.body;
    try {
      db.prepare('UPDATE customers SET name = ?, contact_info = ?, address = ?, city = ?, postal_code = ?, region = ?, country = ?, logo_url = ?, company_name = ?, decided_amount = ?, period = ?, employee_name = ?, contact_person_name = ?, contact_person_role = ?, contact_person_email = ?, contact_person_phone = ?, customer_phone = ?, status = ?, project = ?, services = ? WHERE id = ?').run(name, contact_info, address, city, postal_code, region, country, logo_url, company_name, decided_amount, period, employee_name, contact_person_name, contact_person_role, contact_person_email, contact_person_phone, customer_phone, status, project, services, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/customers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Employees (Detailed)
  app.get('/api/employees', authenticateToken, (req: any, res) => {
    const employees = db.prepare(`
      SELECT e.id, u.name, u.email, s.name as supplier_name, m.name as manager_name, e.title, e.manager_id, e.supplier_id
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN suppliers s ON e.supplier_id = s.id
      LEFT JOIN users m ON e.manager_id = m.id
    `).all();
    res.json(employees);
  });

  app.post('/api/employees', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, email, password, supplier_id, manager_id, title } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare('BEGIN').run();
      const userResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, 'employee');
      const empResult = db.prepare('INSERT INTO employees (user_id, supplier_id, manager_id, title) VALUES (?, ?, ?, ?)').run(userResult.lastInsertRowid, supplier_id, manager_id, title);
      db.prepare('COMMIT').run();
      res.json({ id: empResult.lastInsertRowid, name, email, title });
    } catch (e: any) {
      db.prepare('ROLLBACK').run();
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/employees/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, email, supplier_id, manager_id, title } = req.body;
    
    try {
      db.prepare('BEGIN').run();
      const employee = db.prepare('SELECT user_id FROM employees WHERE id = ?').get(req.params.id) as { user_id: number } | undefined;
      
      if (!employee) {
        db.prepare('ROLLBACK').run();
        return res.status(404).json({ error: 'Employee not found' });
      }

      db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, employee.user_id);
      db.prepare('UPDATE employees SET supplier_id = ?, manager_id = ?, title = ? WHERE id = ?').run(supplier_id, manager_id, title, req.params.id);
      
      db.prepare('COMMIT').run();
      res.json({ success: true });
    } catch (e: any) {
      db.prepare('ROLLBACK').run();
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/employees/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    
    try {
      db.prepare('BEGIN').run();
      const employee = db.prepare('SELECT user_id FROM employees WHERE id = ?').get(req.params.id) as { user_id: number } | undefined;
      
      if (!employee) {
        db.prepare('ROLLBACK').run();
        return res.status(404).json({ error: 'Employee not found' });
      }

      db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
      db.prepare('DELETE FROM users WHERE id = ?').run(employee.user_id);
      
      db.prepare('COMMIT').run();
      res.json({ success: true });
    } catch (e: any) {
      db.prepare('ROLLBACK').run();
      res.status(400).json({ error: e.message });
    }
  });

  // Assignments
  app.get('/api/assignments', authenticateToken, (req: any, res) => {
    let query = `
      SELECT a.id, a.billing_rate, a.pay_rate, u.name as employee_name, p.name as project_name, a.project_id
      FROM assignments a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      JOIN projects p ON a.project_id = p.id
    `;
    const params: any[] = [];
    if (req.query.project_id) {
      query += ` WHERE a.project_id = ?`;
      params.push(req.query.project_id);
    }
    const assignments = db.prepare(query).all(...params);
    res.json(assignments);
  });

  app.post('/api/assignments', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { employee_id, project_id, billing_rate, pay_rate } = req.body;
    try {
      const result = db.prepare('INSERT INTO assignments (employee_id, project_id, billing_rate, pay_rate) VALUES (?, ?, ?, ?)').run(employee_id, project_id, billing_rate, pay_rate);
      res.json({ id: result.lastInsertRowid, employee_id, project_id });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/assignments/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { employee_id, project_id, billing_rate, pay_rate } = req.body;
    try {
      db.prepare('UPDATE assignments SET employee_id = ?, project_id = ?, billing_rate = ?, pay_rate = ? WHERE id = ?').run(employee_id, project_id, billing_rate, pay_rate, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/assignments/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Attendance
  app.get('/api/attendance', authenticateToken, (req: any, res) => {
    let query = `
      SELECT a.id, a.date, a.hours, a.status, a.employee_id, u.name as employee_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
    `;
    let params: any[] = [];

    // If manager, only see attendance for their employees
    if (req.user.role === 'manager') {
      query += ' WHERE a.manager_id = ?';
      params.push(req.user.id);
    }

    const attendance = db.prepare(query).all(...params);
    res.json(attendance);
  });

  app.post('/api/attendance', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { employee_id, date, hours, status } = req.body;
    try {
      const employee = db.prepare('SELECT manager_id FROM employees WHERE id = ?').get(employee_id) as { manager_id: number } | undefined;
      const manager_id = employee ? employee.manager_id : null;
      
      const result = db.prepare('INSERT INTO attendance (employee_id, manager_id, date, hours, status) VALUES (?, ?, ?, ?, ?)').run(employee_id, manager_id, date, hours, status || 'pending');
      res.json({ id: result.lastInsertRowid, employee_id, date, hours, status: status || 'pending' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/attendance/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { employee_id, date, hours, status } = req.body;
    try {
      const employee = db.prepare('SELECT manager_id FROM employees WHERE id = ?').get(employee_id) as { manager_id: number } | undefined;
      const manager_id = employee ? employee.manager_id : null;

      db.prepare('UPDATE attendance SET employee_id = ?, manager_id = ?, date = ?, hours = ?, status = ? WHERE id = ?').run(employee_id, manager_id, date, hours, status, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/attendance/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM attendance WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/attendance/:id/status', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { status } = req.body;
    try {
      db.prepare('UPDATE attendance SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Projects
  app.get('/api/projects', authenticateToken, (req: any, res) => {
    const projects = db.prepare(`
      SELECT p.id, p.name, p.status, p.customer_id, p.manager_id, p.services, c.name as customer_name, m.name as manager_name
      FROM projects p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users m ON p.manager_id = m.id
    `).all();
    res.json(projects);
  });

  app.get('/api/projects/:id', authenticateToken, (req: any, res) => {
    const project = db.prepare(`
      SELECT p.*, c.name as customer_name, m.name as manager_name
      FROM projects p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users m ON p.manager_id = m.id
      WHERE p.id = ?
    `).get(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  });

  app.post('/api/projects', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, customer_id, manager_id, status, services } = req.body;
    try {
      const result = db.prepare('INSERT INTO projects (name, customer_id, manager_id, status, services) VALUES (?, ?, ?, ?, ?)').run(name, customer_id, manager_id, status, services);
      res.json({ id: result.lastInsertRowid, name, customer_id, manager_id, status, services });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/projects/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    const { name, customer_id, manager_id, status, services } = req.body;
    try {
      db.prepare('UPDATE projects SET name = ?, customer_id = ?, manager_id = ?, status = ?, services = ? WHERE id = ?').run(name, customer_id, manager_id, status, services, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/projects/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Dashboard Stats & Charts
  app.get('/api/dashboard/stats', authenticateToken, (req: any, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalSuppliers = db.prepare('SELECT COUNT(*) as count FROM suppliers').get() as any;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as any;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
    
    res.json({
      users: totalUsers.count,
      suppliers: totalSuppliers.count,
      customers: totalCustomers.count,
      projects: totalProjects.count
    });
  });

  app.get('/api/dashboard/charts', authenticateToken, (req: any, res) => {
    const financialData = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total 
      FROM transactions 
      GROUP BY month, type 
      ORDER BY month ASC LIMIT 24
    `).all();

    const employeeDistribution = db.prepare(`
      SELECT s.name, COUNT(e.id) as value 
      FROM employees e 
      JOIN suppliers s ON e.supplier_id = s.id 
      GROUP BY s.id
    `).all();

    const monthlyStats: Record<string, any> = {};
    financialData.forEach((row: any) => {
      if (!monthlyStats[row.month]) monthlyStats[row.month] = { name: row.month, income: 0, expense: 0 };
      if (row.type === 'income') monthlyStats[row.month].income = row.total;
      if (row.type === 'expense') monthlyStats[row.month].expense = row.total;
    });

    res.json({
      financials: Object.values(monthlyStats),
      employeeDistribution
    });
  });

  // Invoices
  app.get('/api/invoices', authenticateToken, (req: any, res) => {
    const customerId = req.query.customer_id;
    let query = `
      SELECT i.*, c.name as customer_name 
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
    `;
    let params: any[] = [];

    if (customerId) {
      query += ' WHERE i.customer_id = ?';
      params.push(customerId);
    }

    query += ' ORDER BY i.issue_date DESC';
    
    const invoices = db.prepare(query).all(...params);
    res.json(invoices);
  });

  app.get('/api/invoices/:id', authenticateToken, (req: any, res) => {
    try {
      const invoice = db.prepare(`
        SELECT i.*, c.name as customer_name 
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
      `).get(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  });

  app.post('/api/invoices', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager' && req.user.role !== 'finance') return res.sendStatus(403);
    const { customer_id, amount, status, issue_date, due_date } = req.body;
    try {
      const result = db.prepare('INSERT INTO invoices (customer_id, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?)').run(customer_id, amount, status, issue_date, due_date);
      res.json({ id: result.lastInsertRowid, customer_id, amount, status, issue_date, due_date });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/invoices/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager' && req.user.role !== 'finance') return res.sendStatus(403);
    const { customer_id, amount, status, issue_date, due_date } = req.body;
    try {
      db.prepare('UPDATE invoices SET customer_id = ?, amount = ?, status = ?, issue_date = ?, due_date = ? WHERE id = ?').run(customer_id, amount, status, issue_date, due_date, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/invoices/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager' && req.user.role !== 'finance') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Quotations
  app.get('/api/quotations', authenticateToken, (req: any, res) => {
    const customerId = req.query.customer_id;
    let query = `
      SELECT q.*, c.name as customer_name, p.name as project_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN projects p ON q.project_id = p.id
    `;
    let params: any[] = [];

    if (customerId) {
      query += ' WHERE q.customer_id = ?';
      params.push(customerId);
    }

    const quotations = db.prepare(query).all(...params);
    res.json(quotations);
  });

  app.post('/api/quotations', authenticateToken, (req: any, res) => {
    const { customer_id, project_id, rate_type, rate, duration, total_amount, status } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO quotations (customer_id, project_id, rate_type, rate, duration, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(customer_id, project_id, rate_type, rate, duration, total_amount, status || 'Draft', new Date().toISOString());
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/quotations/:id', authenticateToken, (req: any, res) => {
    const quotation = db.prepare(`
      SELECT q.*, c.name as customer_name, p.name as project_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN projects p ON q.project_id = p.id
      WHERE q.id = ?
    `).get(req.params.id);
    if (quotation) {
      res.json(quotation);
    } else {
      res.status(404).json({ error: 'Quotation not found' });
    }
  });

  app.put('/api/quotations/:id', authenticateToken, (req: any, res) => {
    const { customer_id, project_id, rate_type, rate, duration, total_amount, status } = req.body;
    try {
      db.prepare('UPDATE quotations SET customer_id = ?, project_id = ?, rate_type = ?, rate = ?, duration = ?, total_amount = ?, status = ? WHERE id = ?').run(customer_id, project_id, rate_type, rate, duration, total_amount, status, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/quotations/:id', authenticateToken, (req: any, res) => {
    try {
      db.prepare('DELETE FROM quotations WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- Customer Requests ---
  app.get('/api/customer-requests', authenticateToken, (req: any, res) => {
    const requests = db.prepare(`
      SELECT cr.*, c.name as customer_name 
      FROM customer_requests cr
      LEFT JOIN customers c ON cr.customer_id = c.id
    `).all();
    res.json(requests);
  });

  app.post('/api/customer-requests', authenticateToken, (req: any, res) => {
    const { customer_id, position, duration, status } = req.body;
    const result = db.prepare('INSERT INTO customer_requests (customer_id, position, duration, status) VALUES (?, ?, ?, ?)').run(customer_id, position, duration, status);
    res.json({ id: result.lastInsertRowid, customer_id, position, duration, status });
  });

  app.put('/api/customer-requests/:id', authenticateToken, (req: any, res) => {
    const { position, duration, status } = req.body;
    db.prepare('UPDATE customer_requests SET position = ?, duration = ?, status = ? WHERE id = ?').run(position, duration, status, req.params.id);
    res.json({ success: true });
  });

  // --- Supplier Employees ---
  app.get('/api/supplier-employees', authenticateToken, (req: any, res) => {
    const employees = db.prepare('SELECT * FROM supplier_employees').all();
    res.json(employees);
  });

  app.post('/api/supplier-employees', authenticateToken, (req: any, res) => {
    const { supplier_id, skills, availability, rate, rate_type, status } = req.body;
    const result = db.prepare('INSERT INTO supplier_employees (supplier_id, skills, availability, rate, rate_type, status) VALUES (?, ?, ?, ?, ?, ?)').run(supplier_id, skills, availability, rate, rate_type, status);
    res.json({ id: result.lastInsertRowid, supplier_id, skills, availability, rate, rate_type, status });
  });

  app.put('/api/supplier-employees/:id', authenticateToken, (req: any, res) => {
    const { skills, availability, rate, rate_type, status } = req.body;
    db.prepare('UPDATE supplier_employees SET skills = ?, availability = ?, rate = ?, rate_type = ?, status = ? WHERE id = ?').run(skills, availability, rate, rate_type, status, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
