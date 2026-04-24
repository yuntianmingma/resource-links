import { NavLink } from 'react-router-dom';
import { useLinks } from '../hooks/useLinks';
import type { CategoryId } from '../types';

export default function Sidebar() {
  const { links, categories } = useLinks();

  const counts = categories.reduce((acc, cat) => {
    const catLinks = links.filter(l => l.category === cat.id);
    acc[cat.id] = {
      total: catLinks.length,
      dead: catLinks.filter(l => l.status === 'dead').length,
    };
    return acc;
  }, {} as Record<CategoryId, { total: number; dead: number }>);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>资源分类</h2>
      </div>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">全部</span>
          <span className="nav-count">{links.length}</span>
        </NavLink>
        {categories.map(cat => (
          <NavLink
            key={cat.id}
            to={`/category/${cat.id}`}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">{cat.icon}</span>
            <span className="nav-label">{cat.name}</span>
            <span className="nav-count">{counts[cat.id]?.total || 0}</span>
            {counts[cat.id]?.dead > 0 && (
              <span className="nav-dead">{counts[cat.id].dead}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
