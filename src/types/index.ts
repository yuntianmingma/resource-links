export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: CategoryId;
  tags: string[];
  source: 'manual' | 'rss';
  addedAt: string;
  lastChecked: string;
  status: 'active' | 'dead' | 'unknown';
}

export type CategoryId = 'books' | 'comics' | 'videos' | 'software' | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface RssSource {
  name: string;
  url: string;
  category: CategoryId;
}
