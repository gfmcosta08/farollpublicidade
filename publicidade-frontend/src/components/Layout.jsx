import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { path: 'dashboard', label: 'Dashboard', icon: '📊', end: true },
  { path: 'squads', label: 'Squads', icon: '🤖', end: false },
  { path: 'logs', label: 'Logs', icon: '📝', end: true },
  { path: 'skills', label: 'Skills', icon: '🧩', end: true },
];

export default function Layout() {
  return (
    <div className="publicidade-layout">
      <header className="publicidade-header">
        <h1>PUBLICIDADE</h1>
        <span className="subtitle">OpenSquad Manager</span>
      </header>

      <nav className="publicidade-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="publicidade-content">
        <Outlet />
      </main>
    </div>
  );
}
