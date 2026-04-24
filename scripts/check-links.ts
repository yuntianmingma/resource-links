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

async function checkUrl(url: string): Promise<'active' | 'dead' | 'unknown'> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ResourceLinkChecker/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return resp.ok ? 'active' : 'dead';
  } catch {
    // HEAD failed, try GET as fallback
    try {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 10000);
      const resp = await fetch(url, {
        method: 'GET',
        signal: c2.signal,
        headers: { 'User-Agent': 'ResourceLinkChecker/1.0', 'Range': 'bytes=0-0' },
        redirect: 'follow',
      });
      clearTimeout(t2);
      return resp.ok ? 'active' : 'dead';
    } catch {
      return 'unknown';
    }
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
