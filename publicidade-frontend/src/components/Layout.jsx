import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { path: '/admin/publicidade/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/publicidade/squads', label: 'Squads', icon: '🤖' },
  { path: '/admin/publicidade/logs', label: 'Logs', icon: '📝' },
  { path: '/admin/publicidade/skills', label: 'Skills', icon: '🧩' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="publicidade-layout">
      <header className="publicidade-header">
        <h1>PUBLICIDADE</h1>
        <span className="subtitle">OpenSquad Manager</span>
      </header>
      
      <nav className="publicidade-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="publicidade-content">
        <Outlet />
      </main>
    </div>
  );
}
