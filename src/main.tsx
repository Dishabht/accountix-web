import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

async function start() {
  // Demo mode: serve /api from in-browser sample data (no backend required).
  if (isDemoMode) {
    await import('./demo/mockApi');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
