import { useState, useEffect } from 'react';
import type { Link, CategoryId } from '../types';
import linksData from '../data/links.json';
import categoriesData from '../config/categories.json';

const STORAGE_KEY = 'admin-links-backup';

export default function AdminPanel() {
  const [links, setLinks] = useState<Link[]>(linksData as Link[]);
  const [form, setForm] = useState({
    title: '', url: '', description: '', category: 'other' as CategoryId, tags: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLinks(JSON.parse(saved));
  }, []);

  const persist = (next: Link[]) => {
    setLinks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addOrUpdate = () => {
    if (!form.title || !form.url) return;
    const now = new Date().toISOString();
    const tags = form.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    if (editingId) {
      persist(links.map(l =>
        l.id === editingId
          ? { ...l, title: form.title, url: form.url, description: form.description, category: form.category, tags, lastChecked: now }
          : l
      ));
    } else {
      const newLink: Link = {
        id: Date.now().toString(),
        title: form.title,
        url: form.url,
        description: form.description,
        category: form.category,
        tags,
        source: 'manual',
        addedAt: now,
        lastChecked: now,
        status: 'unknown',
      };
      persist([newLink, ...links]);
    }
    setForm({ title: '', url: '', description: '', category: 'other', tags: '' });
    setEditingId(null);
  };

  const edit = (link: Link) => {
    setForm({ title: link.title, url: link.url, description: link.description, category: link.category, tags: link.tags.join(', ') });
    setEditingId(link.id);
    window.scrollTo(0, 0);
  };

  const remove = (id: string) => {
    persist(links.filter(l => l.id !== id));
    if (editingId === id) {
      setForm({ title: '', url: '', description: '', category: 'other', tags: '' });
      setEditingId(null);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'links.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="page admin-panel">
      <h2>🔧 管理面板</h2>

      <div className="admin-form">
        <h3>{editingId ? '编辑链接' : '添加链接'}</h3>
        <input
          placeholder="标题 *"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="URL *"
          value={form.url}
          onChange={e => setForm({ ...form, url: e.target.value })}
        />
        <textarea
          placeholder="简短描述"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value as CategoryId })}
        >
          {categoriesData.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <input
          placeholder="标签（逗号分隔）"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />
        <div className="form-actions">
          <button onClick={addOrUpdate}>{editingId ? '更新' : '添加'}</button>
          {editingId && (
            <button className="btn-cancel" onClick={() => { setEditingId(null); setForm({ title: '', url: '', description: '', category: 'other', tags: '' }); }}>
              取消
            </button>
          )}
        </div>
      </div>

      <div className="admin-actions-bar">
        <button className="btn-export" onClick={exportJSON}>📥 导出 links.json</button>
      </div>

      <div className="admin-list">
        <h3>已有链接 ({links.length})</h3>
        {links.map(link => (
          <div key={link.id} className="admin-link-item">
            <div className="admin-link-info">
              <strong>{link.title}</strong>
              <span className="admin-link-url">{link.url}</span>
              <span className={`status-badge ${link.status}`}>{link.status}</span>
            </div>
            <div className="admin-link-actions">
              <button onClick={() => edit(link)}>编辑</button>
              <button className="btn-danger" onClick={() => remove(link.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-note">
        <p>💡 提示：添加或编辑链接后，点击「导出 links.json」按钮，将下载的文件替换到 <code>src/data/links.json</code>，然后重新构建部署即可更新站点。</p>
      </div>
    </div>
  );
}
