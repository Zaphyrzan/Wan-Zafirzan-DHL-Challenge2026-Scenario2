import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import './Navigation.css';

export function TopBar() {
  const { logout } = useAuthContext();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple client-side routing for now — search could route to a search page
    console.log('Search for:', query);
  };

  return (
    <header className="topbar">
      <form className="topbar-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search dashboard, upload, incidents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <div className="profile-wrap">
          <button className="profile-btn" onClick={() => setOpen(!open)} aria-haspopup="true">
            <span className="profile-icon">👤</span>
          </button>

          {open && (
            <div className="profile-menu">
              <button onClick={() => logout()} className="profile-menu-item">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
