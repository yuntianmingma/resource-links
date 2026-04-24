import type { Link } from '../types';

function statusLabel(status: Link['status']) {
  switch (status) {
    case 'active': return '正常';
    case 'dead': return '失效';
    case 'unknown': return '未知';
  }
}

export default function LinkCard({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`link-card ${link.status === 'dead' ? 'dead' : ''}`}
    >
      <div className="link-card-header">
        <span className={`status-dot ${link.status}`} title={statusLabel(link.status)} />
        <h3 className="link-title">{link.title}</h3>
        {link.source === 'rss' && <span className="source-badge">RSS</span>}
      </div>
      <p className="link-desc">{link.description}</p>
      <div className="link-card-footer">
        <div className="link-tags">
          {link.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <span className="link-date">{new Date(link.addedAt).toLocaleDateString('zh-CN')}</span>
      </div>
    </a>
  );
}
