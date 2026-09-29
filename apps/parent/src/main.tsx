import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { openBrowserRepo } from '@atlas/db/browser';
import { DataProvider, Splash, applyStoredTheme } from '@atlas/ui';
import { App } from './App';
import '@atlas/ui/fonts';
import './index.css';

applyStoredTheme();
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider open={openBrowserRepo} fallback={<Splash label="Opening family data…" />}>
      <App />
    </DataProvider>
  </StrictMode>,
);
