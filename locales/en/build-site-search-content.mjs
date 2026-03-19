#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outputFile = path.join(__dirname, 'site-search-content.js');

const HTML_FILES = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'services/logistics-operations/index.html',
  'services/administrative-backoffice/index.html',
  'services/customer-relations/index.html',
  'services/it-support/index.html',
  'careers/index.html',
  'contact/index.html',
  'learning/index.html',
  'legal/terms.html',
  'legal/cookies.html',
  'legal/privacy-gdpr.html'
];

const BLOCK_TAGS = new Set(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'label', 'td', 'th']);
const SECTION_HEADING_TAGS = ['h1', 'h2', 'h3'];

const decodeHtml = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const normalizeWhitespace = (value) => decodeHtml(value)
  .replace(/\s+/g, ' ')
  .trim();

const stripTags = (value) => normalizeWhitespace(
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
);

const stripNonContent = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--([\s\S]*?)-->/g, ' ');

const extractAttr = (tag, attrName) => {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1] || '';
};

const getCanonicalUrl = (html, fallbackPath) => {
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  if (canonicalMatch?.[1]) {
    return canonicalMatch[1].replace(/^https?:\/\/[^/]+/i, '') || '/';
  }

  if (fallbackPath === 'index.html') return '/';
  if (fallbackPath.endsWith('/index.html')) return `/${fallbackPath.slice(0, -'index.html'.length)}`;
  return `/${fallbackPath}`;
};

const getMetaContent = (html, name) => {
  const pattern = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return normalizeWhitespace(pattern.exec(html)?.[1] || '');
};

const extractTitle = (html) => normalizeWhitespace(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');

const getMainHtml = (html) => {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return match?.[1] || html;
};

const collectTextByTags = (html, tagNames) => {
  const texts = [];
  const pattern = new RegExp(`<(${tagNames.join('|')})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, 'gi');
  let match;
  while ((match = pattern.exec(html))) {
    const text = stripTags(match[2]);
    if (text) texts.push(text);
  }
  return texts;
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const buildKeywords = (...groups) => unique(
  groups
    .flat()
    .flatMap((value) => normalizeWhitespace(value).split(/[^a-zA-Z0-9+#.-]+/))
    .map((part) => part.toLowerCase())
    .filter((part) => part.length > 2)
).slice(0, 40);

const createExcerpt = (texts, fallback) => {
  const source = normalizeWhitespace(texts.join(' ')) || fallback;
  return source.length > 220 ? `${source.slice(0, 217).trimEnd()}...` : source;
};

const extractSections = (mainHtml, pageUrl, pageTitle, pageDescription) => {
  const sectionEntries = [];
  const sectionPattern = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let match;

  while ((match = sectionPattern.exec(mainHtml))) {
    const attrs = match[1] || '';
    const sectionHtml = match[2] || '';
    const sectionId = extractAttr(attrs, 'id');
    const heading = SECTION_HEADING_TAGS
      .map((tag) => collectTextByTags(sectionHtml, [tag])[0])
      .find(Boolean);
    const contentTexts = collectTextByTags(sectionHtml, [...BLOCK_TAGS]);
    const content = normalizeWhitespace(contentTexts.join(' '));

    if (!heading && !content) continue;

    const entryTitle = heading ? `${pageTitle} — ${heading}` : pageTitle;
    const excerpt = createExcerpt(contentTexts, pageDescription);
    const url = sectionId ? `${pageUrl}#${sectionId}` : pageUrl;

    sectionEntries.push({
      title: entryTitle,
      url,
      pageTitle,
      sectionTitle: heading || '',
      description: excerpt || pageDescription,
      content,
      keywords: buildKeywords(pageTitle, heading || '', excerpt)
    });
  }

  return sectionEntries;
};

const extractPageEntry = (html, filePath) => {
  const safeHtml = stripNonContent(html);
  const mainHtml = getMainHtml(safeHtml);
  const pageUrl = getCanonicalUrl(safeHtml, filePath);
  const title = extractTitle(safeHtml) || stripTags(collectTextByTags(mainHtml, ['h1'])[0] || '') || 'Gabriel Services';
  const description = getMetaContent(safeHtml, 'description');
  const mainTexts = collectTextByTags(mainHtml, [...BLOCK_TAGS]);
  const content = normalizeWhitespace(mainTexts.join(' '));
  const headings = collectTextByTags(mainHtml, ['h1', 'h2', 'h3']);

  const pageEntry = {
    title,
    url: pageUrl,
    pageTitle: title,
    sectionTitle: '',
    description: createExcerpt(mainTexts, description),
    content,
    keywords: buildKeywords(title, description, headings)
  };

  const sectionEntries = extractSections(mainHtml, pageUrl, title, description)
    .filter((entry) => entry.url !== pageUrl || entry.sectionTitle);

  return [pageEntry, ...sectionEntries];
};

const buildIndex = async () => {
  const entries = [];

  for (const relativePath of HTML_FILES) {
    const filePath = path.join(repoRoot, relativePath);
    const html = await fs.readFile(filePath, 'utf8');
    entries.push(...extractPageEntry(html, relativePath));
  }

  return entries;
};

const writeOutput = async (entries) => {
  const banner = [
    '/**',
    ' * Generated by locales/en/build-site-search-content.mjs.',
    ' * Re-run the script when page content changes to keep voice/text search aligned.',
    ' */'
  ].join('\n');

  const fileContents = `${banner}\nexport const EN_SITE_SEARCH_CONTENT = ${JSON.stringify(entries, null, 2)};\n`;
  await fs.writeFile(outputFile, fileContents, 'utf8');
};

const main = async () => {
  const entries = await buildIndex();
  await writeOutput(entries);
  console.log(`Generated ${entries.length} searchable entries in ${path.relative(repoRoot, outputFile)}.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
