import { useState } from 'react';
import type { CategoryId } from '../types';

interface SearchBarProps {
  onSearch: (query: string, category: CategoryId | 'all', status: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [status, setStatus] = useState('all');

  const emit = (q: string, c: CategoryId | 'all', s: string) => onSearch(q, c, s);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="搜索资源..."
        value={query}
        onChange={e => { setQuery(e.target.value); emit(e.target.value, category, status); }}
      />
      <select value={category} onChange={e => { setCategory(e.target.value as CategoryId | 'all'); emit(query, e.target.value as CategoryId | 'all', status); }}>
        <option value="all">全部分类</option>
        <option value="books">书籍</option>
        <option value="comics">漫画</option>
        <option value="videos">视频</option>
        <option value="software">软件</option>
        <option value="other">其他</option>
      </select>
      <select value={status} onChange={e => { setStatus(e.target.value); emit(query, category, e.target.value); }}>
        <option value="all">全部状态</option>
        <option value="active">正常</option>
        <option value="dead">失效</option>
        <option value="unknown">未知</option>
      </select>
    </div>
  );
}
