import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LINKS_PATH = resolve(import.meta.dirname, '../src/data/links.json');

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

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const BROWSER_UA = 'Mozilla/5.0 (compatible; LinkChecker/1.0; +https://github.com/yuntianmingma/resource-links)';

// Anti-bot status codes: site is likely alive but blocking automated checks
const UNCERTAIN_STATUSES = new Set([403, 405, 429, 503]);

function classifyStatus(code: number): 'active' | 'dead' | 'unknown' {
  if (code >= 200 && code < 400) return 'active';
  if (code === 404 || code === 410) return 'dead';
  if (UNCERTAIN_STATUSES.has(code)) return 'unknown';
  if (code >= 400) return 'dead';
  return 'unknown';
}

async function checkUrl(url: string): Promise<'active' | 'dead' | 'unknown'> {
  const headers = {
    'User-Agent': BROWSER_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  // Try HEAD first (lightweight)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, { method: 'HEAD', signal: controller.signal, headers, redirect: 'follow' });
    clearTimeout(timeout);
    return classifyStatus(resp.status);
  } catch {
    // fall through to GET
  }

  // Fallback: GET only first bytes
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, { method: 'GET', signal: controller.signal, headers: { ...headers, 'Range': 'bytes=0-0' }, redirect: 'follow' });
    clearTimeout(timeout);
    return classifyStatus(resp.status);
  } catch {
    return 'unknown';
  }
}

async function main() {
  const links: Link[] = JSON.parse(readFileSync(LINKS_PATH, 'utf-8'));
  console.log(`Checking ${links.length} links...`);

  let updated = 0;
  const now = new Date().toISOString();

  for (const link of links) {
    const prev = link.status;
    link.status = await checkUrl(link.url);
    link.lastChecked = now;

    if (link.status !== prev) {
      updated++;
      const emoji = link.status === 'active' ? '✅' : link.status === 'dead' ? '❌' : '❓';
      console.log(`  ${emoji} [${link.status}] ${link.title}`);
    }

    // Rate limit
    await sleep(500);
  }

  writeFileSync(LINKS_PATH, JSON.stringify(links, null, 2) + '\n');
  console.log(`Done. ${updated} links changed status.`);
}

main().catch(console.error);
