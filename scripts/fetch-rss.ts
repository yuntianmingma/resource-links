import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Parser from 'rss-parser';

const RSS_SOURCES_PATH = resolve(import.meta.dirname, '../src/config/rss-sources.json');
const LINKS_PATH = resolve(import.meta.dirname, '../src/data/links.json');

interface RssSource {
  name: string;
  url: string;
  category: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  source: 'manual' | 'rss';
  addedAt: string;
  lastChecked: string;
  status: 'active' | 'dead' | 'unknown';
}

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'ResourceLinkRSS/1.0' },
});

async function fetchSource(source: RssSource): Promise<Partial<Link>[]> {
  try {
    const feed = await parser.parseURL(source.url);
    console.log(`  RSS: ${source.name} — ${feed.items?.length || 0} items`);

    return (feed.items || []).map(item => ({
      title: item.title || 'Untitled',
      url: item.link || '',
      description: item.contentSnippet?.slice(0, 120) || item.content?.slice(0, 120) || '',
      category: source.category,
      tags: [source.name],
      source: 'rss' as const,
    }));
  } catch (err) {
    console.error(`  Failed to fetch ${source.name}: ${(err as Error).message}`);
    return [];
  }
}

function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return 'rss-' + Math.abs(hash).toString(36);
}

async function main() {
  const sources: RssSource[] = JSON.parse(readFileSync(RSS_SOURCES_PATH, 'utf-8'));
  const links: Link[] = JSON.parse(readFileSync(LINKS_PATH, 'utf-8'));
  const existingUrls = new Set(links.map(l => l.url).filter(Boolean));
  const now = new Date().toISOString();

  console.log(`Fetching ${sources.length} RSS sources...`);

  let added = 0;
  for (const source of sources) {
    const items = await fetchSource(source);
    for (const item of items) {
      if (!item.url || existingUrls.has(item.url)) continue;

      const link: Link = {
        id: generateId(item.url),
        title: item.title!,
        url: item.url,
        description: item.description || '',
        category: item.category!,
        tags: item.tags!,
        source: 'rss',
        addedAt: now,
        lastChecked: now,
        status: 'unknown',
      };

      links.push(link);
      existingUrls.add(item.url);
      added++;
      console.log(`  + ${link.title}`);
    }
  }

  writeFileSync(LINKS_PATH, JSON.stringify(links, null, 2) + '\n');
  console.log(`Done. Added ${added} new links from RSS.`);
}

main().catch(console.error);
