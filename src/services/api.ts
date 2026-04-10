// API service layer — centralize all fetch calls for consistency and maintainability

const BASE = '/api';

// Helper function to build headers with authorization
const headers = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const buildErrorMessage = (data: any, fallback: string) => {
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  return fallback;
};

const request = async (url: string, token: string | null, method: HttpMethod, body?: any) => {
  const response = await fetch(`${BASE}${url}`, {
    method,
    headers: headers(token),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(data, 'Request failed'));
  }

  return data;
};

// Centralized API client with GET, POST, PUT, DELETE methods
export const api = {
  // GET request — retrieve data from server
  get: (url: string, token: string | null) => request(url, token, 'GET'),

  // POST request — create new resource on server
  post: (url: string, token: string | null, body: any) => request(url, token, 'POST', body),

  // PUT request — update existing resource on server
  put: (url: string, token: string | null, body: any) => request(url, token, 'PUT', body),

  // DELETE request — remove resource from server
  delete: (url: string, token: string | null) => request(url, token, 'DELETE'),
};
