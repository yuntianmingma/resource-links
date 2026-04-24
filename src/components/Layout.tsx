import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import Icon from './Icon';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name="menu" size={22} /></button>
        <h1>资源链接站</h1>
        <button className="theme-btn" onClick={toggleTheme}><Icon name={dark ? 'sun' : 'moon'} size={20} /></button>
      </header>
      <div className={`layout-body ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
