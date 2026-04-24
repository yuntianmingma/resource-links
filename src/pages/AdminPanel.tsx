import { useState, useEffect, useCallback } from 'react';
import type { Link, CategoryId } from '../types';
import categoriesData from '../config/categories.json';

const REPO = 'yuntianmingma/resource-links';
const LINKS_PATH = 'src/data/links.json';
const AUTH_PATH = 'src/config/auth.json';
const TOKEN_KEY = 'gh-token';

function base64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [links, setLinks] = useState<Link[]>([]);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title: '', url: '', description: '', category: 'other' as CategoryId, tags: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  // Load links from GitHub API
  const loadLinks = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${LINKS_PATH}`, { headers: headers() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
      setLinks(content);
      setSha(data.sha);
      setMsg('已从 GitHub 加载');
    } catch (e) {
      setMsg(`加载失败: ${(e as Error).message}`);
    }
    setLoading(false);
  }, [token, headers]);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  // Password change
  const [pwdOld, setPwdOld] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Save links to GitHub API
  const saveToGitHub = async (newLinks: Link[], commitMsg: string) => {
    if (!token) { setMsg('请先设置 GitHub Token'); return false; }
    setSaving(true);
    setMsg('保存中...');
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${LINKS_PATH}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          message: commitMsg,
          content: base64(JSON.stringify(newLinks, null, 2) + '\n'),
          sha,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSha(data.content.sha);
      setLinks(newLinks);
      setMsg('✅ 已保存，Actions 部署后生效（约 2 分钟）');
      setSaving(false);
      return true;
    } catch (e) {
      setMsg(`保存失败: ${(e as Error).message}`);
      setSaving(false);
      return false;
    }
  };

  const addOrUpdate = async () => {
    if (!form.title || !form.url) return;
    const now = new Date().toISOString();
    const tags = form.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    let next: Link[];
    if (editingId) {
      next = links.map(l =>
        l.id === editingId ? { ...l, title: form.title, url: form.url, description: form.description, category: form.category, tags, lastChecked: now } : l
      );
    } else {
      const newLink: Link = {
        id: Date.now().toString(),
        title: form.title, url: form.url, description: form.description,
        category: form.category, tags, source: 'manual',
        addedAt: now, lastChecked: now, status: 'unknown',
      };
      next = [newLink, ...links];
    }

    const ok = await saveToGitHub(next, editingId ? `Update: ${form.title}` : `Add: ${form.title}`);
    if (ok) {
      setForm({ title: '', url: '', description: '', category: 'other', tags: '' });
      setEditingId(null);
    }
  };

  const remove = async (link: Link) => {
    const next = links.filter(l => l.id !== link.id);
    await saveToGitHub(next, `Remove: ${link.title}`);
    if (editingId === link.id) {
      setForm({ title: '', url: '', description: '', category: 'other', tags: '' });
      setEditingId(null);
    }
  };

  const edit = (link: Link) => {
    setForm({ title: link.title, url: link.url, description: link.description, category: link.category, tags: link.tags.join(', ') });
    setEditingId(link.id);
    window.scrollTo(0, 0);
  };

  const saveToken = (val: string) => {
    setToken(val);
    localStorage.setItem(TOKEN_KEY, val);
    setLoading(true);
  };

  const changePassword = async () => {
    if (!pwdOld || !pwdNew) { setMsg('请填写旧密码和新密码'); return; }
    if (pwdNew.length < 4) { setMsg('新密码至少 4 位'); return; }
    setChangingPwd(true);
    setMsg('验证中...');
    try {
      // Load current auth.json
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${AUTH_PATH}`, { headers: headers() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const auth = JSON.parse(decodeURIComponent(escape(atob(data.content))));

      // Verify old password
      const oldHash = await hashPassword(pwdOld, auth.salt);
      if (oldHash !== auth.hash) { setMsg('旧密码错误'); setChangingPwd(false); return; }

      // Generate new salt + hash
      const newSalt = randomSalt();
      const newHash = await hashPassword(pwdNew, newSalt);
      const newAuth = { salt: newSalt, hash: newHash };
      const content = JSON.stringify(newAuth, null, 2) + '\n';

      // Save via API
      const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${AUTH_PATH}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ message: 'Update admin password', content: base64(content), sha: data.sha }),
      });
      if (!putRes.ok) throw new Error(await putRes.text());

      setMsg('✅ 密码已更新，2 分钟后生效');
      setPwdOld(''); setPwdNew('');
    } catch (e) {
      setMsg(`修改失败: ${(e as Error).message}`);
    }
    setChangingPwd(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'links.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <div className="page"><p>加载中...</p></div>;

  if (!token) {
    return (
      <div className="page admin-panel">
        <h2>🔧 管理面板</h2>
        <div className="admin-form">
          <h3>设置 GitHub Token</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            需要一个 <a href="https://github.com/settings/tokens/new?scopes=repo&description=ResourceLinks" target="_blank" rel="noopener">GitHub Personal Access Token (classic)</a>，
            勾选 <strong>repo</strong> 权限即可。Token 仅保存在你的浏览器中。
          </p>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            onChange={e => saveToken(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-panel">
      <h2>🔧 管理面板</h2>

      {msg && <div className="admin-msg">{msg}</div>}

      <div className="admin-form">
        <h3>{editingId ? '编辑链接' : '添加链接'}</h3>
        <input placeholder="标题 *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="URL *" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        <textarea placeholder="简短描述" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as CategoryId })}>
          {categoriesData.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
        </select>
        <input placeholder="标签（逗号分隔）" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <div className="form-actions">
          <button onClick={addOrUpdate} disabled={saving}>{saving ? '保存中...' : editingId ? '更新' : '添加'}</button>
          {editingId && (
            <button className="btn-cancel" onClick={() => { setEditingId(null); setForm({ title: '', url: '', description: '', category: 'other', tags: '' }); }}>取消</button>
          )}
        </div>
      </div>

      <div className="admin-actions-bar">
        <button className="btn-export" onClick={exportJSON}>📥 导出 JSON（备份）</button>
      </div>

      <div className="admin-form">
        <h3>🔑 修改管理员密码</h3>
        <input type="password" placeholder="旧密码" value={pwdOld} onChange={e => setPwdOld(e.target.value)} />
        <input type="password" placeholder="新密码（至少 4 位）" value={pwdNew} onChange={e => setPwdNew(e.target.value)} />
        <div className="form-actions">
          <button onClick={changePassword} disabled={changingPwd}>{changingPwd ? '提交中...' : '修改密码'}</button>
        </div>
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
              <button className="btn-danger" onClick={() => remove(link)}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
