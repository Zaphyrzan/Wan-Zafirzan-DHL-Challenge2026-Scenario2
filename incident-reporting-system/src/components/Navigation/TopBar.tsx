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
          <button className="profile-btn" onClick={() => setOpen(!open)} aria-haspopup="true" aria-expanded={open}>
            <svg className="profile-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
