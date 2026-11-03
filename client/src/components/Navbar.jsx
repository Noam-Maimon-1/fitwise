import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  const getFullName = () => {
    const r = localStorage.getItem('user');
    const u = r ? JSON.parse(r) : null;
    return u ? `${u.firstName} ${u.lastName}` : 'User';
  };

  const [fullName, setFullName] = useState(getFullName);

  useEffect(() => {
    const sync = () => setFullName(getFullName());
    window.addEventListener('user-profile-updated', sync);
    return () => window.removeEventListener('user-profile-updated', sync);
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // inform the backend (stateless, always returns success)
    } catch {
      // ignore — we clear the local session regardless
    }
    localStorage.removeItem('user');
    navigate('/');
  };

  const ic = (size, children) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ verticalAlign: 'middle', marginRight: '6px' }}>
      {children}
    </svg>
  );

  return (
    <nav className="navbar">
      {/* Brand / logo */}
      <div className="navbar-brand">
        <Link to="/dashboard">
          {ic(20, <path d="M6 4v16M18 4v16M4 9h4M4 15h4M16 9h4M16 15h4M8 12h8"/>)}
          Adaptive Bio-Coach
        </Link>
      </div>

      {/* Navigation links */}
      <ul className="navbar-links">
        <li><NavLink to="/dashboard">
          {ic(14, <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>)}
          Dashboard
        </NavLink></li>
        <li><NavLink to="/workout-plans">
          {ic(14, <path d="M6 4v16M18 4v16M4 9h4M4 15h4M16 9h4M16 15h4M8 12h8"/>)}
          Workout Plans
        </NavLink></li>
        <li><NavLink to="/meal-plans">
          {ic(14, <><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>)}
          Meal Plans
        </NavLink></li>
        <li><NavLink to="/check-ins">
          {ic(14, <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>)}
          Check-ins
        </NavLink></li>
        {user?.userRole === 'user' && (
          <li><NavLink to="/support">
            {ic(14, <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>)}
            Support
          </NavLink></li>
        )}
        <li><NavLink to="/settings">
          {ic(14, <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>)}
          Settings
        </NavLink></li>
        {(user?.userRole === 'admin' || user?.userRole === 'manager') && (
          <li><NavLink to="/admin">
            {ic(14, <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>)}
            Admin
          </NavLink></li>
        )}
      </ul>

      {/* User info and logout */}
      <div className="navbar-user">
        <span className="navbar-username">
          {ic(16, <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>)}
          {fullName}
        </span>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
