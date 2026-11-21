// Demo seed data — used only when VITE_DEMO_MODE=true (no backend needed).
// Shapes mirror the Mongo models of accountix-server.

export type Row = Record<string, any>;

export interface DemoDb {
  users: Row[];
  customers: Row[];
  suppliers: Row[];
  projects: Row[];
  employees: Row[];
  assignments: Row[];
  supplierContracts: Row[];
  supplierEmployees: Row[];
  invoices: Row[];
  quotations: Row[];
  customerRequests: Row[];
  attendance: Row[];
  companies: Row[];
}

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
const stamp = (n: number) => daysAgo(n).toISOString();

export const DEMO_EMAIL = 'admin@portal.com';
export const DEMO_PASSWORD = 'admin123';

export function buildSeed(): DemoDb {
  const users: Row[] = [
    { id: 'u1', name: 'System Admin', email: DEMO_EMAIL, password: DEMO_PASSWORD, role: 'admin', createdAt: stamp(200) },
    { id: 'u2', name: 'Claire Martin', email: 'claire.martin@accountix.io', password: 'demo123', role: 'manager', createdAt: stamp(180) },
    { id: 'u3', name: 'Julien Moreau', email: 'julien.moreau@accountix.io', password: 'demo123', role: 'manager', createdAt: stamp(170) },
    { id: 'u4', name: 'Sophie Lambert', email: 'sophie.lambert@accountix.io', password: 'demo123', role: 'finance', createdAt: stamp(160) },
    { id: 'u5', name: 'Karim Benali', email: 'karim.benali@accountix.io', password: 'demo123', role: 'manager', createdAt: stamp(150) },
  ];

  const empPeople = [
    ['Lucas Bernard', 'Full-Stack Developer'],
    ['Emma Petit', 'UX/UI Designer'],
    ['Hugo Dubois', 'DevOps Engineer'],
    ['Léa Robert', 'Data Analyst'],
    ['Nathan Richard', 'Frontend Developer'],
    ['Chloé Durand', 'Project Coordinator'],
    ['Thomas Leroy', 'Backend Developer'],
    ['Inès Garcia', 'QA Engineer'],
    ['Yanis Fournier', 'Mobile Developer'],
    ['Manon Girard', 'Business Analyst'],
  ];
  empPeople.forEach(([name], i) => {
    users.push({
      id: `u${10 + i}`,
      name,
      email: name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.') + '@accountix.io',
      password: 'demo123',
      role: 'employee',
      createdAt: stamp(140 - i * 5),
    });
  });

  const customers: Row[] = [
    { id: 'c1', name: 'Nova Retail', company_name: 'Nova Retail SAS', contact_person_name: 'Paul Lefèvre', contact_person_role: 'CTO', contact_person_email: 'p.lefevre@novaretail.fr', contact_person_phone: '+33 1 42 00 11 22', customer_phone: '+33 1 42 00 11 00', address: '12 rue de Rivoli', city: 'Paris', postal_code: '75001', region: 'Île-de-France', country: 'France', status: 'Active', project: 'E-commerce Platform', services: '["Web Development","Maintenance"]', decided_amount: 48000, period: '12 months' },
    { id: 'c2', name: 'BlueWave Logistics', company_name: 'BlueWave Logistics', contact_person_name: 'Sarah Cohen', contact_person_role: 'Operations Director', contact_person_email: 's.cohen@bluewave.eu', contact_person_phone: '+33 4 91 22 33 44', customer_phone: '+33 4 91 22 33 00', address: '45 quai du Port', city: 'Marseille', postal_code: '13002', region: 'PACA', country: 'France', status: 'Active', project: 'Fleet Tracking', services: '["Mobile App","Cloud Hosting"]', decided_amount: 36000, period: '9 months' },
    { id: 'c3', name: 'GreenLeaf Energy', company_name: 'GreenLeaf Energy SA', contact_person_name: 'Marc Vidal', contact_person_role: 'Head of IT', contact_person_email: 'm.vidal@greenleaf.com', contact_person_phone: '+33 4 72 10 20 30', customer_phone: '+33 4 72 10 20 00', address: '8 cours Lafayette', city: 'Lyon', postal_code: '69003', region: 'Auvergne-Rhône-Alpes', country: 'France', status: 'Active', project: 'Energy Dashboard', services: '["Data Analytics","Web Development"]', decided_amount: 52000, period: '12 months' },
    { id: 'c4', name: 'Atelier Céleste', company_name: 'Atelier Céleste', contact_person_name: 'Julie Roux', contact_person_role: 'Founder', contact_person_email: 'julie@atelierceleste.fr', contact_person_phone: '+33 5 56 44 55 66', customer_phone: '+33 5 56 44 55 00', address: '3 place de la Bourse', city: 'Bordeaux', postal_code: '33000', region: 'Nouvelle-Aquitaine', country: 'France', status: 'Active', project: 'Brand Website', services: '["UI/UX Design"]', decided_amount: 12000, period: '3 months' },
    { id: 'c5', name: 'MediCare Plus', company_name: 'MediCare Plus', contact_person_name: 'Ahmed Haddad', contact_person_role: 'IT Manager', contact_person_email: 'a.haddad@medicareplus.fr', contact_person_phone: '+33 3 20 11 22 33', customer_phone: '+33 3 20 11 22 00', address: '21 rue Nationale', city: 'Lille', postal_code: '59000', region: 'Hauts-de-France', country: 'France', status: 'Inactive', project: 'Patient Portal', services: '["Web Development","QA Testing"]', decided_amount: 30000, period: '6 months' },
    { id: 'c6', name: 'Orbit Finance', company_name: 'Orbit Finance Ltd', contact_person_name: 'Emily Clarke', contact_person_role: 'Product Owner', contact_person_email: 'e.clarke@orbitfinance.co.uk', contact_person_phone: '+44 20 7946 0001', customer_phone: '+44 20 7946 0000', address: '1 Canary Wharf', city: 'London', postal_code: 'E14 5AB', region: 'Greater London', country: 'United Kingdom', status: 'Active', project: 'Banking API', services: '["API Integration","Security Audit"]', decided_amount: 64000, period: '12 months' },
  ].map((c, i) => ({ ...c, contact_info: c.contact_person_email, createdAt: stamp(190 - i * 10) }));

  const suppliers: Row[] = [
    { id: 's1', name: 'TechTalent Partners', contact_person_name: 'Olivier Blanc', contact_person_email: 'o.blanc@techtalent.fr', contact_person_phone: '+33 1 55 66 77 88', city: 'Paris', region: 'Île-de-France', postal_code: '75008', country: 'France', address: '50 avenue des Champs-Élysées', project: 'E-commerce Platform', services: '["Web Development","DevOps"]' },
    { id: 's2', name: 'CodeForge Consulting', contact_person_name: 'Nadia Ferhat', contact_person_email: 'n.ferhat@codeforge.io', contact_person_phone: '+33 4 78 11 22 33', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', postal_code: '69002', country: 'France', address: '14 rue de la République', project: 'Energy Dashboard', services: '["Data Analytics","Backend Development"]' },
    { id: 's3', name: 'PixelCraft Studio', contact_person_name: 'Antoine Muller', contact_person_email: 'antoine@pixelcraft.fr', contact_person_phone: '+33 3 88 44 55 66', city: 'Strasbourg', region: 'Grand Est', postal_code: '67000', country: 'France', address: '7 place Kléber', project: 'Brand Website', services: '["UI/UX Design"]' },
    { id: 's4', name: 'CloudNine Services', contact_person_name: 'Priya Sharma', contact_person_email: 'priya@cloudnine.eu', contact_person_phone: '+33 5 61 22 33 44', city: 'Toulouse', region: 'Occitanie', postal_code: '31000', country: 'France', address: '2 place du Capitole', project: 'Fleet Tracking', services: '["Cloud Hosting","Mobile App"]' },
    { id: 's5', name: 'QualityFirst Labs', contact_person_name: 'Benoît Faure', contact_person_email: 'b.faure@qualityfirst.fr', contact_person_phone: '+33 2 40 11 22 33', city: 'Nantes', region: 'Pays de la Loire', postal_code: '44000', country: 'France', address: '9 quai de la Fosse', project: 'Patient Portal', services: '["QA Testing"]' },
  ].map((s, i) => ({ ...s, contact_info: s.contact_person_email, createdAt: stamp(185 - i * 10) }));

  const projects: Row[] = [
    { id: 'p1', name: 'E-commerce Platform', customer_id: 'c1', manager_id: 'u2', status: 'Active', services: '["Web Development","Maintenance"]' },
    { id: 'p2', name: 'Fleet Tracking App', customer_id: 'c2', manager_id: 'u3', status: 'Active', services: '["Mobile App","Cloud Hosting"]' },
    { id: 'p3', name: 'Energy Dashboard', customer_id: 'c3', manager_id: 'u5', status: 'Active', services: '["Data Analytics","Web Development"]' },
    { id: 'p4', name: 'Brand Website Redesign', customer_id: 'c4', manager_id: 'u2', status: 'Completed', services: '["UI/UX Design"]' },
    { id: 'p5', name: 'Patient Portal', customer_id: 'c5', manager_id: 'u3', status: 'On Hold', services: '["Web Development","QA Testing"]' },
    { id: 'p6', name: 'Open Banking API', customer_id: 'c6', manager_id: 'u5', status: 'Active', services: '["API Integration","Security Audit"]' },
    { id: 'p7', name: 'Internal Reporting Tool', customer_id: 'c3', manager_id: 'u2', status: 'Inactive', services: '["Data Analytics"]' },
  ].map((p, i) => ({ ...p, createdAt: stamp(170 - i * 12) }));

  const supplierOf = ['s1', null, 's1', 's2', null, null, 's2', 's5', 's4', null];
  const managerOf = ['u2', 'u2', 'u3', 'u5', 'u2', 'u3', 'u5', 'u3', 'u3', 'u5'];
  const employees: Row[] = empPeople.map(([, title], i) => ({
    id: `e${i + 1}`,
    user_id: `u${10 + i}`,
    supplier_id: supplierOf[i] || undefined,
    manager_id: managerOf[i],
    title,
    createdAt: stamp(140 - i * 5),
  }));

  const projectOf = ['p1', 'p4', 'p2', 'p3', 'p1', 'p6', 'p3', 'p5', 'p2', 'p6'];
  const assignments: Row[] = employees.map((e, i) => ({
    id: `a${i + 1}`,
    employee_id: e.id,
    project_id: projectOf[i],
    billing_rate: [75, 65, 80, 70, 60, 55, 78, 58, 72, 62][i],
    pay_rate: [50, 42, 55, 46, 40, 36, 52, 38, 48, 41][i],
    createdAt: stamp(130 - i * 4),
  }));

  const supplierContracts: Row[] = [
    { id: 'sc1', supplier_id: 's1', employee_id: 'e1', project_id: 'p1', contract_type: 'Daily', rate: 450, duration: '6 months', status: 'Active' },
    { id: 'sc2', supplier_id: 's1', employee_id: 'e3', project_id: 'p2', contract_type: 'Hourly', rate: 65, duration: '9 months', status: 'Active' },
    { id: 'sc3', supplier_id: 's2', employee_id: 'e4', project_id: 'p3', contract_type: 'Daily', rate: 420, duration: '12 months', status: 'Active' },
    { id: 'sc4', supplier_id: 's2', employee_id: 'e7', project_id: 'p3', contract_type: 'Hourly', rate: 60, duration: '6 months', status: 'Pending' },
    { id: 'sc5', supplier_id: 's5', employee_id: 'e8', project_id: 'p5', contract_type: 'Daily', rate: 380, duration: '3 months', status: 'Completed' },
    { id: 'sc6', supplier_id: 's4', employee_id: 'e9', project_id: 'p2', contract_type: 'Hourly', rate: 58, duration: '6 months', status: 'Terminated' },
  ].map((c, i) => ({ ...c, created_by: 'u1', createdAt: stamp(120 - i * 8) }));

  const supplierEmployees: Row[] = [
    { id: 'se1', supplier_id: 's1', skills: 'React, Node.js, TypeScript', availability: 'Immediate', rate: 450, rate_type: 'daily', status: 'Active' },
    { id: 'se2', supplier_id: 's1', skills: 'Kubernetes, AWS, Terraform', availability: '2 weeks', rate: 70, rate_type: 'hourly', status: 'Active' },
    { id: 'se3', supplier_id: 's2', skills: 'Python, Power BI, SQL', availability: '1 month', rate: 400, rate_type: 'daily', status: 'Draft' },
    { id: 'se4', supplier_id: 's3', skills: 'Figma, Design Systems', availability: 'Immediate', rate: 55, rate_type: 'hourly', status: 'Active' },
    { id: 'se5', supplier_id: 's4', skills: 'Flutter, Firebase', availability: '3 weeks', rate: 60, rate_type: 'hourly', status: 'Draft' },
    { id: 'se6', supplier_id: 's5', skills: 'Selenium, Cypress, Jest', availability: 'Ended', rate: 350, rate_type: 'daily', status: 'Assigned / Completed' },
  ].map((s, i) => ({ ...s, createdAt: stamp(110 - i * 6) }));

  const invoiceSpecs: [string, string, number, number, 'hourly' | 'daily', 'draft' | 'sent' | 'paid', number][] = [
    ['c1', 'p1', 75, 160, 'hourly', 'paid', 150],
    ['c2', 'p2', 80, 140, 'hourly', 'paid', 125],
    ['c3', 'p3', 560, 20, 'daily', 'paid', 100],
    ['c6', 'p6', 620, 18, 'daily', 'paid', 80],
    ['c1', 'p1', 75, 150, 'hourly', 'paid', 60],
    ['c4', 'p4', 480, 15, 'daily', 'paid', 45],
    ['c2', 'p2', 80, 120, 'hourly', 'sent', 30],
    ['c3', 'p3', 560, 22, 'daily', 'sent', 20],
    ['c6', 'p6', 620, 20, 'daily', 'sent', 10],
    ['c1', 'p1', 75, 80, 'hourly', 'draft', 3],
    ['c5', 'p5', 70, 60, 'hourly', 'draft', 2],
  ];
  const invoices: Row[] = invoiceSpecs.map(([cid, pid, rate, duration, rate_type, status, ago], i) => ({
    id: `inv${i + 1}`,
    customer_id: cid,
    project_id: pid,
    description: `${projects.find((p) => p.id === pid)?.name} — ${rate_type === 'daily' ? 'consulting days' : 'development hours'}`,
    rate,
    duration,
    rate_type,
    amount: rate * duration,
    status,
    issue_date: iso(daysAgo(ago)),
    due_date: iso(daysAgo(ago - 30)),
    paid_date: status === 'paid' ? iso(daysAgo(ago - 20)) : undefined,
    createdAt: stamp(ago),
  }));

  const quotationSpecs: [string, string, 'hourly' | 'daily', number, number, string, number][] = [
    ['c1', 'p1', 'hourly', 75, 640, 'Accepted', 160],
    ['c2', 'p2', 'hourly', 80, 450, 'Accepted', 140],
    ['c3', 'p3', 'daily', 560, 90, 'Accepted', 110],
    ['c4', 'p4', 'daily', 480, 25, 'Accepted', 70],
    ['c6', 'p6', 'daily', 620, 100, 'Sent', 25],
    ['c5', 'p5', 'hourly', 70, 300, 'Rejected', 40],
    ['c3', 'p7', 'daily', 500, 30, 'Draft', 5],
  ];
  const quotations: Row[] = quotationSpecs.map(([cid, pid, rate_type, rate, duration, status, ago], i) => ({
    id: `q${i + 1}`,
    customer_id: cid,
    project_id: pid,
    rate_type,
    rate,
    duration,
    total_amount: rate * duration,
    status,
    created_at: stamp(ago),
    createdAt: stamp(ago),
  }));
  invoices[0].quotation_ref = 'q1';
  invoices[1].quotation_ref = 'q2';

  const customerRequests: Row[] = [
    { id: 'cr1', customer_id: 'c1', position: 'Senior React Developer', duration: '6 months', status: 'Active' },
    { id: 'cr2', customer_id: 'c3', position: 'Data Engineer', duration: '12 months', status: 'Draft' },
    { id: 'cr3', customer_id: 'c6', position: 'Security Consultant', duration: '3 months', status: 'Active' },
    { id: 'cr4', customer_id: 'c2', position: 'Flutter Developer', duration: '4 months', status: 'Completed' },
    { id: 'cr5', customer_id: 'c5', position: 'QA Automation Engineer', duration: '2 months', status: 'Inactive' },
  ].map((r, i) => ({ ...r, createdAt: stamp(60 - i * 9) }));

  // Attendance: working days over the last ~45 days for every assigned employee.
  const attendance: Row[] = [];
  let n = 0;
  for (let ago = 45; ago >= 1; ago--) {
    const d = daysAgo(ago);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    assignments.forEach((a, i) => {
      const r = (ago * 7 + i * 13) % 23;
      const status = r === 0 ? 'absent' : r === 1 ? 'leave' : r === 2 ? 'half_day' : 'present';
      n += 1;
      attendance.push({
        id: `at${n}`,
        employee_id: a.employee_id,
        project_id: a.project_id,
        manager_id: employees[i].manager_id,
        date: iso(d),
        hours: status === 'present' ? 8 : status === 'half_day' ? 4 : 0,
        status,
        createdAt: d.toISOString(),
      });
    });
  }

  return {
    users,
    customers,
    suppliers,
    projects,
    employees,
    assignments,
    supplierContracts,
    supplierEmployees,
    invoices,
    quotations,
    customerRequests,
    attendance,
    companies: [],
  };
}
