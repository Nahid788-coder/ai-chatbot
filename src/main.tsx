import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import './index.css';
import App from './App.tsx';

const root = createRoot(document.getElementById('root')!);

if (!isSupabaseConfigured) {
  root.render(
    <div style={{ padding: 32, fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 640, margin: '10vh auto', lineHeight: 1.6 }}>
      <h2>Setup required</h2>
      <p>
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_KEY</code> are missing. Copy <code>.env.example</code> to{' '}
        <code>.env</code>, fill in your keys, then restart <code>npm run dev</code>.
      </p>
    </div>,
  );
} else {
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}
