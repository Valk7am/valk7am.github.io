#!/usr/bin/env node
/**
 * Build feed.xml (RSS 2.0) and sitemap.xml from Contentful + static page list.
 *
 * Run locally:
 *   node scripts/build-rss.mjs
 *
 * Environment variables (optional — defaults read from src):
 *   CONTENTFUL_SPACE_ID      — defaults to value in assets/request.js
 *   CONTENTFUL_ENV_ID        — defaults to "master"
 *   CONTENTFUL_CDA_TOKEN     — defaults to value in assets/request.js (public read-only)
 *   SITE_URL                 — defaults to https://valk7am.github.io
 *
 * Requires Node 18+ (uses global fetch).
 */
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SITE_URL = (process.env.SITE_URL || 'https://valk7am.github.io').replace(/\/$/, '');
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || 'c5jg5l1708kd';
const ENV_ID = process.env.CONTENTFUL_ENV_ID || 'master';
const TOKEN = process.env.CONTENTFUL_CDA_TOKEN || 'b7o1R1fuGMuQNigcPOSeTYYaHZ8Hy2ApIJMtgcol3Is';
const CONTENT_TYPE = 'blogs';
const LIMIT = 30;

const STATIC_PAGES = [
  { loc: '/',              priority: '1.0', changefreq: 'weekly'  },
  { loc: '/about.html',    priority: '0.8', changefreq: 'monthly' },
  { loc: '/projects.html', priority: '0.9', changefreq: 'weekly'  },
  { loc: '/blogs.html',    priority: '0.9', changefreq: 'daily'   },
  { loc: '/sitemap.html',  priority: '0.3', changefreq: 'monthly' },
];

function xmlEscape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractText(rich) {
  if (!rich || !Array.isArray(rich.content)) return '';
  const out = [];
  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 'text' && node.value) out.push(node.value);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  rich.content.forEach(walk);
  return out.join(' ').replace(/\s+/g, ' ').trim();
}

function richToHtml(rich) {
  if (!rich || !Array.isArray(rich.content)) return '';
  const render = (node) => {
    switch (node.nodeType) {
      case 'paragraph':    return `<p>${(node.content || []).map(render).join('')}</p>`;
      case 'heading-1':    return `<h1>${(node.content || []).map(render).join('')}</h1>`;
      case 'heading-2':    return `<h2>${(node.content || []).map(render).join('')}</h2>`;
      case 'heading-3':    return `<h3>${(node.content || []).map(render).join('')}</h3>`;
      case 'unordered-list': return `<ul>${(node.content || []).map(render).join('')}</ul>`;
      case 'ordered-list':   return `<ol>${(node.content || []).map(render).join('')}</ol>`;
      case 'list-item':      return `<li>${(node.content || []).map(render).join('')}</li>`;
      case 'hyperlink': {
        const url = node.data && node.data.uri ? node.data.uri : '#';
        return `<a href="${xmlEscape(url)}">${(node.content || []).map(render).join('')}</a>`;
      }
      case 'text': {
        let t = xmlEscape(node.value || '');
        (node.marks || []).forEach((m) => {
          if (m.type === 'bold')      t = `<strong>${t}</strong>`;
          if (m.type === 'italic')    t = `<em>${t}</em>`;
          if (m.type === 'underline') t = `<u>${t}</u>`;
          if (m.type === 'code')      t = `<code>${t}</code>`;
        });
        return t;
      }
      default: return '';
    }
  };
  return rich.content.map(render).join('');
}

async function fetchEntries() {
  if (!TOKEN) {
    console.warn('No Contentful token — emitting empty feed/sitemap.');
    return [];
  }
  // Match assets/request.js: no content_type filter, just newest first.
  const url = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENV_ID}/entries`
    + `?limit=${LIMIT}&order=-sys.createdAt&include=2`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) {
    console.warn('Contentful fetch failed:', res.status, res.statusText);
    return [];
  }
  const data = await res.json();
  return (data.items || []).filter((e) => e && e.fields && e.fields.title);
}

function buildRss(items) {
  const now = new Date().toUTCString();
  const lastPubDate = items.length
    ? new Date(items[0].sys.createdAt).toUTCString()
    : now;

  const itemsXml = items.map((entry) => {
    const id = entry.sys.id;
    const title = entry.fields.title || 'Untitled';
    const link = `${SITE_URL}/blogs.html#post-${id}`;
    const pub = new Date(entry.sys.createdAt).toUTCString();
    const html = richToHtml(entry.fields.discription || entry.fields.description);
    const summary = extractText(entry.fields.discription || entry.fields.description).slice(0, 280);
    return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="false">${xmlEscape(id)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${xmlEscape(summary)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>valk7am — Mahmoud Abuhassan</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Articles, notes, and Today I Learned posts by Mahmoud Abuhassan.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${lastPubDate}</pubDate>
    <generator>scripts/build-rss.mjs</generator>
    <image>
      <url>${SITE_URL}/assets/images/icon.png</url>
      <title>valk7am — Mahmoud Abuhassan</title>
      <link>${SITE_URL}/</link>
    </image>
${itemsXml}
  </channel>
</rss>
`;
}

function buildSitemap(items) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_PAGES.map((p) =>
      `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...items.map((entry) => {
      const updated = (entry.sys.updatedAt || entry.sys.createdAt).slice(0, 10);
      const loc = `${SITE_URL}/blogs.html#post-${entry.sys.id}`;
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }),
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function main() {
  let items = [];
  try {
    items = await fetchEntries();
    console.log(`Fetched ${items.length} entries from Contentful.`);
  } catch (err) {
    console.warn('Could not fetch from Contentful:', err.message);
  }

  const rss = buildRss(items);
  const sitemap = buildSitemap(items);

  await writeFile(join(ROOT, 'feed.xml'), rss, 'utf8');
  await writeFile(join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

  console.log('Wrote feed.xml (' + (rss.length / 1024).toFixed(1) + ' KB)');
  console.log('Wrote sitemap.xml (' + (sitemap.length / 1024).toFixed(1) + ' KB)');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
