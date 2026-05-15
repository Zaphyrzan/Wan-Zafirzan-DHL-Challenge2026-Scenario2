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

// Rescue script: if a full-screen overlay or invisible styles are hiding app content,
// make a best-effort attempt to reveal the main app elements. This is temporary
// and only intended for emergency diagnostics on the deployed site.
function rescueUI() {
  try {
    const hiddenClasses = ['admin-dashboard', 'upload-console-container', 'protected-content', 'protected-layout'];
    hiddenClasses.forEach(cls => {
      const el = document.querySelector('.' + cls) as HTMLElement | null;
      if (el) {
        el.style.display = el.style.display || 'block';
        el.style.visibility = 'visible';
        el.style.opacity = el.style.opacity || '1';
        el.style.color = el.style.color || '#111';
      }
    });

    // Hide any large fixed/sticky elements that cover the viewport and have opaque backgrounds
    const all = Array.from(document.querySelectorAll<HTMLElement>('*'));
    const hidden = [] as string[];
    all.forEach(el => {
      try {
        const cs = getComputedStyle(el);
        const pos = cs.position;
        const zi = parseInt(cs.zIndex || '0') || 0;
        const rect = el.getBoundingClientRect();
        const covers = rect.width >= window.innerWidth - 10 && rect.height >= window.innerHeight - 10;
        const opaqueBg = (cs.backgroundColor && cs.backgroundColor !== 'transparent' && cs.backgroundColor !== 'rgba(0, 0, 0, 0)');
        if ((pos === 'fixed' || pos === 'sticky' || pos === 'absolute') && zi >= 100 && covers && opaqueBg) {
          el.style.pointerEvents = 'none';
          el.style.visibility = 'hidden';
          hidden.push((el.className || el.tagName).toString());
        }
      } catch (e) {}
    });

    const diag = document.getElementById('diagnostic-banner');
    if (diag) {
      diag.textContent = `RESCUE: hid ${hidden.length} overlay(s) — ${hidden.slice(0,5).join(', ')}`;
      diag.style.background = '#ecfccb';
      diag.style.color = '#365314';
      diag.style.display = 'block';
    }
  } catch (e) {
    console.error('rescueUI error', e);
  }
}

// Run rescue after a short delay to allow React mounting to complete
setTimeout(rescueUI, 800);
