import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLinks } from '../hooks/useLinks';
import SearchBar from '../components/SearchBar';
import LinkCard from '../components/LinkCard';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { links, categories } = useLinks();
  const cat = categories.find(c => c.id === categoryId);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  if (!cat) {
    return <div className="page"><h2>分类不存在</h2></div>;
  }

  const filtered = links
    .filter(l => l.category === categoryId)
    .filter(link => {
      if (status !== 'all' && link.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          link.title.toLowerCase().includes(q) ||
          link.description.toLowerCase().includes(q) ||
          link.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

  filtered.sort((a, b) => {
    if (a.status === 'dead' && b.status !== 'dead') return 1;
    if (a.status !== 'dead' && b.status === 'dead') return -1;
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <div className="page">
      <h2 className="page-title">{cat.icon} {cat.name}</h2>
      <SearchBar onSearch={(q, _, s) => { setQuery(q); setStatus(s); }} />
      <div className="results-info">
        {filtered.length === 0 ? (
          <p className="no-results">该分类下暂无匹配资源</p>
        ) : (
          <p>共 {filtered.length} 个资源</p>
        )}
      </div>
      <div className="link-grid">
        {filtered.map(link => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}
