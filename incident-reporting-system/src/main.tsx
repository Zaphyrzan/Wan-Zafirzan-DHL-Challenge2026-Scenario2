import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Small runtime diagnostic: indicate mounting status on the page
const diag = document.getElementById('diagnostic-banner');
if (diag) {
  try {
    diag.textContent = 'DIAGNOSTIC: React script loaded, attempting mount...';
  } catch (e) {
    // ignore
  }
}

try {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // On successful mount, remove or update the diagnostic banner
  if (diag) {
    try {
      diag.textContent = '';
      diag.style.display = 'none';
    } catch (e) {}
  }
} catch (err) {
  // If render fails, show the error message in the banner for debugging
  if (diag) {
    diag.textContent = 'DIAGNOSTIC ERROR: React failed to mount — check console for errors';
    diag.style.background = '#fee2e2';
    diag.style.color = '#991B1B';
  }
  // Re-throw so errors still appear in console/logs
  throw err;
}
