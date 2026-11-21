// Demo mode: intercepts every fetch('/api/...') and answers from an in-browser
// database, so the app can be hosted as a static site (e.g. Vercel) without the
// accountix-server backend. Enabled only when VITE_DEMO_MODE=true.
import { buildSeed, DemoDb, Row } from './seed';

const STORAGE_KEY = 'accountix-demo-db-v1';
const TOKEN_PREFIX = 'demo-token-';

const loadDb = (): DemoDb => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return buildSeed();
};

let db: DemoDb = loadDb();
const save = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
};

let counter = Date.now();
const newId = (prefix: string) => `${prefix}${(counter++).toString(36)}`;
const now = () => new Date().toISOString();

const byId = (list: Row[], id: any) => list.find((r) => String(r.id) === String(id));
const userName = (id: any) => byId(db.users, id)?.name;
const publicUser = (u: Row) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const withMongoId = (r: Row) => ({ ...r, _id: r.id });
const sortDesc = (list: Row[], key = 'createdAt') =>
  [...list].sort((a, b) => String(b[key] || '').localeCompare(String(a[key] || '')));

const toJsonList = (value: any) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return value;
    } catch {
      return JSON.stringify(value.split(',').map((s) => s.trim()).filter(Boolean));
    }
  }
  return '[]';
};

// ---- Joins (mirror the Mongo aggregation pipelines of the real API) ----
const joinCustomer = (c: Row) =>
  withMongoId({ ...c, invoice_count: db.invoices.filter((i) => i.customer_id === c.id).length });

const joinProject = (p: Row) =>
  withMongoId({
    ...p,
    customer_name: byId(db.customers, p.customer_id)?.name || 'Unknown',
    manager_name: userName(p.manager_id) || 'None',
  });

const joinEmployee = (e: Row) => {
  const u = byId(db.users, e.user_id) || {};
  return withMongoId({
    ...e,
    name: u.name,
    email: u.email,
    supplier_name: byId(db.suppliers, e.supplier_id)?.name || 'Direct',
    manager_name: userName(e.manager_id) || 'None',
  });
};

const employeeName = (employeeId: any) => {
  const e = byId(db.employees, employeeId);
  return e ? userName(e.user_id) : undefined;
};

const joinInvoice = (i: Row) =>
  withMongoId({ ...i, customer_name: byId(db.customers, i.customer_id)?.name || 'Unknown' });

const joinQuotation = (q: Row) =>
  withMongoId({
    ...q,
    customer_name: byId(db.customers, q.customer_id)?.name || 'Unknown',
    project_name: byId(db.projects, q.project_id)?.name || 'Unknown',
  });

const joinAssignment = (a: Row) =>
  withMongoId({
    ...a,
    employee_name: employeeName(a.employee_id) || 'Unknown',
    project_name: byId(db.projects, a.project_id)?.name || 'Unknown',
  });

const joinAttendance = (a: Row) =>
  withMongoId({
    ...a,
    employee_name: employeeName(a.employee_id) || 'Unknown',
    project_name: byId(db.projects, a.project_id)?.name || 'N/A',
    manager_name: userName(a.manager_id) || 'None',
  });

const joinContract = (c: Row) =>
  withMongoId({
    ...c,
    supplier_name: byId(db.suppliers, c.supplier_id)?.name || 'Unknown',
    employee_name: employeeName(c.employee_id) || 'Unknown',
    project_name: byId(db.projects, c.project_id)?.name || 'Unknown',
    created_by_name: userName(c.created_by) || null,
  });

const joinRequest = (r: Row) =>
  withMongoId({ ...r, customer_name: byId(db.customers, r.customer_id)?.name || 'Unknown' });

const joinSupplierEmployee = (s: Row) =>
  withMongoId({ ...s, supplier_name: byId(db.suppliers, s.supplier_id)?.name || 'Unknown' });

// ---- Generic CRUD resource ----
interface Resource {
  key: keyof DemoDb;
  prefix: string;
  join: (r: Row) => Row;
  notFound: string;
  prepare?: (body: Row, existing?: Row) => Row;
  sortKey?: string;
  filters?: string[];
}

const resources: Record<string, Resource> = {
  customers: { key: 'customers', prefix: 'c', join: joinCustomer, notFound: 'Customer not found', prepare: (b) => ({ ...b, ...(b.services !== undefined ? { services: toJsonList(b.services) } : {}) }) },
  suppliers: { key: 'suppliers', prefix: 's', join: withMongoId, notFound: 'Supplier not found', prepare: (b) => ({ ...b, ...(b.services !== undefined ? { services: toJsonList(b.services) } : {}) }) },
  projects: { key: 'projects', prefix: 'p', join: joinProject, notFound: 'Project not found', prepare: (b) => ({ ...b, ...(b.services !== undefined ? { services: toJsonList(b.services) } : {}) }) },
  invoices: { key: 'invoices', prefix: 'inv', join: joinInvoice, notFound: 'Invoice not found', filters: ['customer_id', 'project_id'], prepare: (b) => ({ ...b, ...(b.amount !== undefined ? { amount: Number(b.amount) } : {}) }) },
  quotations: {
    key: 'quotations', prefix: 'q', join: joinQuotation, notFound: 'Quotation not found', filters: ['customer_id', 'project_id'],
    prepare: (b, existing) => {
      const out: Row = { ...b };
      ['rate', 'duration', 'total_amount'].forEach((k) => { if (out[k] !== undefined) out[k] = Number(out[k]); });
      if (!existing && !out.created_at) out.created_at = now();
      return out;
    },
  },
  assignments: { key: 'assignments', prefix: 'a', join: joinAssignment, notFound: 'Assignment not found', filters: ['project_id', 'employee_id'] },
  'supplier-contracts': { key: 'supplierContracts', prefix: 'sc', join: joinContract, notFound: 'Supplier contract not found', prepare: (b, existing) => ({ ...b, ...(b.rate !== undefined ? { rate: Number(b.rate) } : {}), ...(!existing ? { created_by: 'u1', status: b.status || 'Pending' } : {}) }) },
  'supplier-employees': { key: 'supplierEmployees', prefix: 'se', join: joinSupplierEmployee, notFound: 'Supplier employee not found' },
  'customer-requests': { key: 'customerRequests', prefix: 'cr', join: joinRequest, notFound: 'Request not found' },
  companies: { key: 'companies', prefix: 'co', join: withMongoId, notFound: 'Company not found' },
};

// ---- HTTP helpers ----
type Result = { status: number; body: any };
const ok = (body: any, status = 200): Result => ({ status, body });
const err = (status: number, error: string): Result => ({ status, body: { error } });

const currentUser = (headers: Headers) => {
  const auth = headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  return byId(db.users, token.slice(TOKEN_PREFIX.length)) || null;
};

function handle(method: string, path: string, query: URLSearchParams, body: Row, headers: Headers): Result {
  const parts = path.split('/').filter(Boolean); // e.g. ['projects', 'p1']
  const [root, id, sub] = parts;

  // ---- Public auth routes ----
  if (root === 'health') return ok({ status: 'ok', message: 'Demo API is running' });
  if (root === 'auth' && method === 'POST' && id === 'login') {
    if (!body.email || !body.password) return err(400, 'Email and password are required');
    const u = db.users.find((x) => x.email === String(body.email).toLowerCase().trim());
    if (!u || u.password !== body.password) return err(401, 'Invalid credentials');
    return ok({ token: TOKEN_PREFIX + u.id, user: publicUser(u) });
  }
  if (root === 'auth' && method === 'POST' && id === 'register') {
    const { name, email, password } = body;
    if (!name || !email || !password) return err(400, 'Name, email, and password are required');
    if (String(password).length < 6) return err(400, 'Password must be at least 6 characters');
    const normalized = String(email).toLowerCase().trim();
    if (db.users.some((x) => x.email === normalized)) return err(409, 'An account with this email already exists');
    const u = { id: newId('u'), name, email: normalized, password, role: 'customer_user', createdAt: now() };
    db.users.push(u);
    save();
    return ok({ token: TOKEN_PREFIX + u.id, user: publicUser(u) }, 201);
  }
  if (root === 'auth' && id === 'forgot-password') {
    if (!body.email) return err(400, 'Email is required');
    return ok({ message: 'If an account exists for this email, a recovery email has been sent.' });
  }

  // ---- Everything else requires a token ----
  const me = currentUser(headers);
  if (!me) return err(401, 'Access token is missing');

  if (root === 'auth' && id === 'me') {
    const { password, ...rest } = me;
    return ok({ user: { ...rest, _id: me.id } });
  }

  if (root === 'dashboard') {
    if (id === 'stats') {
      return ok({ users: db.users.length, suppliers: db.suppliers.length, customers: db.customers.length, projects: db.projects.length });
    }
    if (id === 'charts') {
      const months: { name: string; income: number; expense: number }[] = [];
      const d = new Date();
      for (let i = 5; i >= 0; i--) {
        const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
        const income = db.invoices.filter((inv) => String(inv.issue_date || '').startsWith(key)).reduce((s, inv) => s + Number(inv.amount || 0), 0);
        const expense = db.attendance
          .filter((a) => String(a.date).startsWith(key))
          .reduce((s, a) => s + Number(a.hours || 0) * Number(db.assignments.find((x) => x.employee_id === a.employee_id)?.pay_rate || 0), 0);
        months.push({ name: m.toLocaleString('en-US', { month: 'short' }), income, expense: Math.round(expense) });
      }
      const counts: Record<string, number> = {};
      db.projects.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
      return ok({ financials: months, employeeDistribution: Object.entries(counts).map(([name, value]) => ({ name, value })) });
    }
  }

  if (root === 'users') {
    if (method === 'GET') {
      const role = query.get('role');
      return ok(sortDesc(db.users).filter((u) => !role || u.role === role).map(({ password, ...u }) => withMongoId(u)));
    }
    if (method === 'POST') {
      const { name, email, password, role } = body;
      if (!name || !email || !password) return err(400, 'Name, email and password are required');
      if (db.users.some((u) => u.email === String(email).toLowerCase())) return err(409, 'Email already exists');
      const u = { id: newId('u'), name, email: String(email).toLowerCase(), password, role: role || 'manager', createdAt: now() };
      db.users.push(u);
      save();
      return ok(publicUser(u), 201);
    }
  }

  if (root === 'employees') {
    if (method === 'GET' && !id) return ok(sortDesc(db.employees).map(joinEmployee));
    if (method === 'GET' && id) {
      const e = byId(db.employees, id);
      return e ? ok(joinEmployee(e)) : err(404, 'Employee not found');
    }
    if (method === 'POST') {
      const { name, email, password, title, supplier_id, manager_id } = body;
      if (!name || !email || !password || !title) return err(400, 'Missing required employee fields');
      if (db.users.some((u) => u.email === String(email).toLowerCase())) return err(409, 'Email already exists');
      const u = { id: newId('u'), name, email: String(email).toLowerCase(), password, role: 'employee', createdAt: now() };
      db.users.push(u);
      const e = { id: newId('e'), user_id: u.id, title, supplier_id: supplier_id || undefined, manager_id: manager_id || undefined, createdAt: now() };
      db.employees.push(e);
      save();
      return ok(joinEmployee(e), 201);
    }
    if (method === 'PUT') {
      const e = byId(db.employees, id);
      if (!e) return err(404, 'Employee not found');
      const u = byId(db.users, e.user_id);
      if (u) {
        if (body.name) u.name = body.name;
        if (body.email) u.email = body.email;
        if (body.password) u.password = body.password;
      }
      if (body.title !== undefined) e.title = body.title;
      if (body.supplier_id !== undefined) e.supplier_id = body.supplier_id || undefined;
      if (body.manager_id !== undefined) e.manager_id = body.manager_id || undefined;
      save();
      return ok(joinEmployee(e));
    }
    if (method === 'DELETE') {
      const e = byId(db.employees, id);
      if (!e) return err(404, 'Employee not found');
      db.employees = db.employees.filter((x) => x.id !== e.id);
      db.users = db.users.filter((x) => x.id !== e.user_id);
      save();
      return ok({ success: true });
    }
  }

  if (root === 'attendance') {
    if (method === 'GET') {
      return ok(sortDesc(db.attendance, 'date').filter((a) => byId(db.employees, a.employee_id)).map(joinAttendance));
    }
    if (method === 'POST') {
      let rec = db.attendance.find(
        (a) => String(a.employee_id) === String(body.employee_id) && String(a.project_id || '') === String(body.project_id || '') && a.date === body.date,
      );
      if (rec) Object.assign(rec, body);
      else {
        rec = { id: newId('at'), hours: 8, status: 'present', ...body, createdAt: now() };
        db.attendance.push(rec);
      }
      save();
      return ok(joinAttendance(rec), 201);
    }
    if (method === 'PUT') {
      // supports both PUT /attendance/:id and PUT /attendance/:id/status
      const rec = byId(db.attendance, id);
      if (!rec) return err(404, 'Attendance not found');
      if (body.status !== undefined) rec.status = body.status;
      if (sub !== 'status') Object.assign(rec, { ...body, id: rec.id });
      save();
      return ok(joinAttendance(rec));
    }
    if (method === 'DELETE') {
      if (!byId(db.attendance, id)) return err(404, 'Attendance not found');
      db.attendance = db.attendance.filter((a) => String(a.id) !== String(id));
      save();
      return ok({ success: true });
    }
  }

  const res = resources[root];
  if (res) {
    const list = db[res.key] as Row[];
    if (method === 'GET' && !id) {
      let rows = sortDesc(list, res.sortKey);
      (res.filters || []).forEach((f) => {
        const v = query.get(f);
        if (v) rows = rows.filter((r) => String(r[f]) === v);
      });
      return ok(rows.map(res.join));
    }
    if (method === 'GET' && id) {
      const r = byId(list, id);
      return r ? ok(res.join(r)) : err(404, res.notFound);
    }
    if (method === 'POST') {
      const data = res.prepare ? res.prepare(body) : body;
      const r = { ...data, id: newId(res.prefix), createdAt: now() };
      list.push(r);
      save();
      return ok(res.join(r), 201);
    }
    if (method === 'PUT' || method === 'PATCH') {
      const r = byId(list, id);
      if (!r) return err(404, res.notFound);
      const data = res.prepare ? res.prepare(body, r) : body;
      Object.assign(r, data, { id: r.id, updatedAt: now() });
      save();
      return ok(res.join(r));
    }
    if (method === 'DELETE') {
      if (!byId(list, id)) return err(404, res.notFound);
      (db as any)[res.key] = list.filter((r) => String(r.id) !== String(id));
      save();
      return ok({ success: true });
    }
  }

  return err(404, `Demo API: no route for ${method} /api/${path}`);
}

// ---- Install the fetch interceptor ----
const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(rawUrl, window.location.origin);

  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api')) {
    return realFetch(input as any, init);
  }

  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  let body: Row = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  const path = url.pathname.replace(/^\/api\/?/, '');
  let result: Result;
  try {
    result = handle(method, path, url.searchParams, body, headers);
  } catch (e: any) {
    result = err(500, e?.message || 'Demo API error');
  }

  await new Promise((r) => setTimeout(r, 120)); // small, realistic latency
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const resetDemoData = () => {
  db = buildSeed();
  save();
};

console.info('[Accountix] Demo mode: API calls are served from in-browser sample data.');
