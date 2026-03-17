import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { initDb } from './src/db';

// Initialize the database to ensure tables exist
initDb();

const db = new Database('./portal.db');

try {
  const customer = db.prepare("SELECT id FROM customers LIMIT 1").get() as any;
  if (!customer) {
    console.error("No customer found. Please create a customer first.");
    process.exit(1);
  }

  const manager = db.prepare("SELECT id FROM users WHERE role = 'manager' LIMIT 1").get() as any;
  if (!manager) {
    console.error("No manager found. Please create a manager first.");
    process.exit(1);
  }

  const projects = [
    { name: 'Website Redesign', status: 'Active', services: ['Web Design', 'SEO', 'Copywriting'] },
    { name: 'Mobile App Development', status: 'Active', services: ['iOS App', 'Android App', 'UI/UX Design'] },
    { name: 'Marketing Campaign Q3', status: 'Active', services: ['Social Media Marketing', 'Email Marketing'] },
    { name: 'Brand Identity Update', status: 'Completed', services: ['Logo Design', 'Brand Guidelines'] },
    { name: 'E-commerce Platform', status: 'Active', services: ['Web Development', 'Payment Integration'] },
    { name: 'Cloud Migration', status: 'On Hold', services: ['AWS Setup', 'Data Migration'] },
    { name: 'Cybersecurity Audit', status: 'Completed', services: ['Penetration Testing', 'Security Report'] },
    { name: 'Employee Training Portal', status: 'Active', services: ['Web Development', 'Content Creation'] },
    { name: 'Annual Report Design', status: 'Active', services: ['Graphic Design', 'Print Formatting'] },
    { name: 'SEO Optimization 2026', status: 'Active', services: ['SEO', 'Content Strategy', 'Analytics Setup'] }
  ];

  const stmt = db.prepare("INSERT INTO projects (name, customer_id, manager_id, status, services) VALUES (?, ?, ?, ?, ?)");
  
  const insertMany = db.transaction((projects) => {
    for (const p of projects) {
      stmt.run(p.name, customer.id, manager.id, p.status, JSON.stringify(p.services));
    }
  });

  insertMany(projects);
  console.log("Successfully inserted 10 projects with products/services.");

} catch (err) {
  console.error(err);
} finally {
  db.close();
}
