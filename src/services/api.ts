// API service layer — centralize all fetch calls for consistency and maintainability

const BASE = '/api';

// Helper function to build headers with authorization
const headers = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Centralized API client with GET, POST, PUT, DELETE methods
export const api = {
  // GET request — retrieve data from server
  get: (url: string, token: string | null) =>
    fetch(`${BASE}${url}`, { headers: headers(token) })
      .then(r => r.json()),

  // POST request — create new resource on server
  post: (url: string, token: string | null, body: any) =>
    fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  // PUT request — update existing resource on server
  put: (url: string, token: string | null, body: any) =>
    fetch(`${BASE}${url}`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  // DELETE request — remove resource from server
  delete: (url: string, token: string | null) =>
    fetch(`${BASE}${url}`, {
      method: 'DELETE',
      headers: headers(token),
    }).then(r => r.json()),
};
