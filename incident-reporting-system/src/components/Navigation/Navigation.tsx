/**
 * Navigation Component
 * Top navigation bar for the admin dashboard
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
    <nav className="navigation-bar">
      {/* Logo and branding */}
      <div className="nav-branding">
        <div className="nav-logo">
          <span className="logo-text">DHL</span>
          <div className="logo-separator"></div>
        </div>
        <h1 className="nav-title">Incident System</h1>
      </div>

      {/* Navigation links */}
      <ul className="nav-links">
        <li>
          <button
            className="nav-link"
            onClick={() => handleNavigation('/')}
            title="Dashboard"
          >
            📊 Dashboard
          </button>
        </li>
        <li>
          <button
            className="nav-link"
            onClick={() => handleNavigation('/upload')}
            title="Upload Incident"
          >
            📤 Upload
          </button>
        </li>
      </ul>

      {/* Logout button */}
      <button className="nav-logout-btn" onClick={handleLogout} title="Sign out">
        Sign Out
      </button>
    </nav>
  );
}
