/**
 * Navigation Component
 * Left sidebar navigation for the admin dashboard
 */

import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './Navigation.css';

/**
 * Navigation Component
 */
export function Navigation() {
  // Router and auth
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  /**
   * Handle navigation
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
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
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-label">Dashboard</span>
        </button>

        <button className="sidebar-item" onClick={() => handleNavigation('/upload')} title="Upload">
          <span className="sidebar-icon">⬆️</span>
          <span className="sidebar-label">Upload</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="signout-btn" onClick={handleLogout} title="Sign out">Sign Out</button>
      </div>
    </aside>
  );
}
