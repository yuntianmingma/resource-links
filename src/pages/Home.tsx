import { useState } from 'react';
import { useLinks } from '../hooks/useLinks';
import SearchBar from '../components/SearchBar';
import LinkCard from '../components/LinkCard';
import type { CategoryId } from '../types';

export default function Home() {
  const { links } = useLinks();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [status, setStatus] = useState('all');

  const filtered = links.filter(link => {
    if (category !== 'all' && link.category !== category) return false;
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

  // Sort dead links to bottom, then by date
  filtered.sort((a, b) => {
    if (a.status === 'dead' && b.status !== 'dead') return 1;
    if (a.status !== 'dead' && b.status === 'dead') return -1;
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <div className="page">
      <SearchBar onSearch={(q, c, s) => { setQuery(q); setCategory(c); setStatus(s); }} />
      <div className="results-info">
        {filtered.length === 0 ? (
          <p className="no-results">没有找到匹配的资源</p>
        ) : (
          <p>共 {filtered.length} 个资源</p>
        )}
        {status === 'all' && filtered.some(l => l.status === 'dead') && (
          <p className="dead-warning">⚠️ 存在失效链接，请留意标注</p>
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
