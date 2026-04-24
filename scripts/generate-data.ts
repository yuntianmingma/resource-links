import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const MANUAL_PATH = resolve(import.meta.dirname, '../src/data/manual-links.json');
const RSS_PATH = resolve(import.meta.dirname, '../src/data/rss-links.json');
const OUTPUT_PATH = resolve(import.meta.dirname, '../src/data/links.json');

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

function main() {
  const manual: Link[] = existsSync(MANUAL_PATH) ? JSON.parse(readFileSync(MANUAL_PATH, 'utf-8')) : [];
  const rss: Link[] = existsSync(RSS_PATH) ? JSON.parse(readFileSync(RSS_PATH, 'utf-8')) : [];

  const urlSet = new Set<string>();
  const merged: Link[] = [];

  for (const link of [...manual, ...rss]) {
    if (!urlSet.has(link.url)) {
      urlSet.add(link.url);
      merged.push(link);
    }
  }

  merged.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Generated ${OUTPUT_PATH} with ${merged.length} links (${manual.length} manual + ${rss.length} RSS).`);
}

main();
