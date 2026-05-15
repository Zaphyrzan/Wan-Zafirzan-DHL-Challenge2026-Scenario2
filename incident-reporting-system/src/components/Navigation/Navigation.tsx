/**
 * Navigation Component
 * Left sidebar navigation for the admin dashboard
 */

import { useNavigate } from 'react-router-dom';
import './Navigation.css';

/**
 * Navigation Component
 */
export function Navigation() {
  // Router and auth
  const navigate = useNavigate();

  /**
   * Handle navigation
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // JSX render
  return (
    <aside className="navigation-sidebar">
      <div className="sidebar-brand">
        <div className="nav-logo">
          <span className="logo-text">DHL</span>
        </div>
        <h1 className="sidebar-title">Incidents</h1>
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-item" onClick={() => handleNavigation('/')} title="Dashboard">
          <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 21V12h14v9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sidebar-label">Dashboard</span>
        </button>

        <button className="sidebar-item" onClick={() => handleNavigation('/upload')} title="Upload">
          <svg className="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sidebar-label">Upload</span>
        </button>
      </nav>
    </aside>
  );
}
