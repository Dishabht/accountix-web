import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

async function start() {
  // Demo mode: serve /api from in-browser sample data (no backend required).
  if (isDemoMode) {
    await import('./demo/mockApi');

    // Open the demo straight on the dashboard: auto sign-in as the demo admin.
    try {
      const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!hasToken) {
        sessionStorage.setItem('token', 'demo-token-u1');
        if (window.location.pathname === '/login') {
          window.history.replaceState(null, '', '/');
        }
      }
    } catch {
      /* storage unavailable: the login page still offers demo access */
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
