import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { openBrowserRepo } from '@atlas/db/browser';
import { DataProvider, Splash, applyStoredTheme } from '@atlas/ui';
import { App } from './App';
import '@atlas/ui/fonts';
import './index.css';

applyStoredTheme();
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);

declare global {
  interface Window {
    __atlasBooted?: boolean;
    __atlasFatal?: (e: unknown) => void;
  }
}

// A crash while drawing the app shows the repair screen (see index.html) instead of a blank page.
createRoot(document.getElementById('root')!, { onUncaughtError: (e) => window.__atlasFatal?.(e) }).render(
  <StrictMode>
    <DataProvider open={openBrowserRepo} fallback={<Splash label="Opening your world…" />}>
      <App />
    </DataProvider>
  </StrictMode>,
);
window.__atlasBooted = true;
