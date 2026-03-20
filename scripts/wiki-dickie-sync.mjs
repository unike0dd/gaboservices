import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'internal');
const SITE_BASE_URL = 'https://www.gabo.services';
const WORKER_URL = 'https://wikie-dickie.rulathemtodos.workers.dev/';
const SECRET_ENV_KEY = 'WIKI_DICKIE';
const NONCE_ENV_KEY = 'NONCE';
const PAGE_SOURCES = [
  { file: 'index.html', path: '/', type: 'home' },
  { file: 'about/index.html', path: '/about/', type: 'about' },
  { file: 'services/index.html', path: '/services/', type: 'services' },
  { file: 'services/logistics-operations/index.html', path: '/services/logistics-operations/', type: 'service-detail' },
  { file: 'services/administrative-backoffice/index.html', path: '/services/administrative-backoffice/', type: 'service-detail' },
  { file: 'services/customer-relations/index.html', path: '/services/customer-relations/', type: 'service-detail' },
  { file: 'services/it-support/index.html', path: '/services/it-support/', type: 'service-detail' },
  { file: 'contact/index.html', path: '/contact/', type: 'contact' },
  { file: 'careers/index.html', path: '/careers/', type: 'careers' },
  { file: 'learning/index.html', path: '/learning/', type: 'learning' },
  { file: 'legal/terms.html', path: '/legal/terms.html', type: 'legal' },
  { file: 'legal/cookies.html', path: '/legal/cookies.html', type: 'legal' },
  { file: 'legal/privacy-gdpr.html', path: '/legal/privacy-gdpr.html', type: 'legal' }
];

const CTA_HINTS = [
  'schedule', 'contact', 'request', 'apply', 'explore', 'book', 'submit', 'support', 'consultation', 'discuss', 'open'
];

const INTENT_RULES = [
  { test: /(career|apply|application|resume|hiring)/i, intent: 'careers' },
  { test: /(contact|consultation|request|support|workflow|message)/i, intent: 'lead-generation' },
  { test: /(privacy|cookie|terms|gdpr)/i, intent: 'legal' },
  { test: /(service|logistics|administrative|customer|it support)/i, intent: 'services' },
  { test: /(learning|guide|track)/i, intent: 'learning' }
];

const SPANISH_PHRASE_MAP = new Map([
  ['Gabriel Services', 'Gabriel Services'],
  ['Outsource, Delivered', 'Externaliza, entregado'],
  ['Home', 'Inicio'],
  ['About', 'Acerca de'],
  ['Services', 'Servicios'],
  ['Careers', 'Carreras'],
  ['Contact', 'Contacto'],
  ['Learning', 'Aprendizaje'],
  ['Terms and Conditions', 'Términos y Condiciones'],
  ['Cookies Consent', 'Consentimiento de Cookies'],
  ['Privacy and GDPR', 'Privacidad y GDPR'],
  ['Schedule a consultation', 'Programar una consulta'],
  ['Explore services', 'Explorar servicios'],
  ['Request a consultation', 'Solicitar una consulta'],
  ['Request support', 'Solicitar soporte'],
  ['Submit Contact Summary', 'Enviar resumen de contacto'],
  ['Submit Application', 'Enviar solicitud'],
  ['Clear Form', 'Limpiar formulario'],
  ['Discuss your workflow', 'Habla sobre tu flujo de trabajo'],
  ['View engagement options', 'Ver opciones de contratación'],
  ['Business services for logistics, IT, admin, and customer relations.', 'Servicios empresariales para logística, TI, administración y relaciones con clientes.'],
  ['Apply to join Gabriel Services and support logistics, customer operations, and administrative workflows.', 'Postúlate para unirte a Gabriel Services y apoyar logística, operaciones con clientes y flujos administrativos.'],
  ['Explore Gabriel Services learning tracks for logistics, administrative backoffice, customer operations, and IT support workflows.', 'Explora las rutas de aprendizaje de Gabriel Services para logística, backoffice administrativo, operaciones con clientes y flujos de soporte TI.']
]);

function stripTags(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' ')
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function looksLikeCodeLine(line) {
  return /[{}<>;]{2,}|\b(function|const|let|var|return|import|export|class|script-src|default-src)\b/.test(line);
}

function sanitizeText(value) {
  const normalized = decodeEntities(stripTags(value))
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/javascript:/gi, ' ')
    .replace(/on\w+\s*=/gi, ' ')
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lines = normalized
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !looksLikeCodeLine(line));

  return lines.join(' ').trim();
}

function sanitizeRichText(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' ')
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' ')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, ' ')
    .replace(/javascript:/gi, ' ');
}

function extractTagContents(html, tagName) {
  const matches = [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi'))];
  return matches
    .map((match) => sanitizeText(match[1]))
    .filter(Boolean);
}

function extractMeta(html, name) {
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  for (const tag of metaTags) {
    const nameMatch = tag.match(/\bname=["']([^"']+)["']/i);
    if (!nameMatch || nameMatch[1].toLowerCase() !== String(name).toLowerCase()) continue;
    const contentMatch = tag.match(/\bcontent=["']([^"']*)["']/i);
    if (contentMatch?.[1]) return sanitizeText(contentMatch[1]);
  }
  return '';
}

function extractCanonical(html, fallbackPathname) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const raw = match?.[1]?.trim();
  return raw ? new URL(raw, SITE_BASE_URL).toString() : new URL(fallbackPathname, SITE_BASE_URL).toString();
}

function extractLinks(html, sourceFile) {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return anchors.map(([, href, label]) => {
    const absoluteUrl = new URL(href, new URL(sourceFile, SITE_BASE_URL)).toString();
    return {
      href: absoluteUrl,
      label: sanitizeText(label)
    };
  }).filter((link) => link.label && link.href.startsWith(SITE_BASE_URL));
}

function extractFormDetails(html) {
  const labelMatches = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)];
  const labels = labelMatches.map((match) => sanitizeText(match[1])).filter(Boolean);
  const placeholders = [...html.matchAll(/placeholder=["']([^"']+)["']/gi)].map((match) => sanitizeText(match[1])).filter(Boolean);
  const options = [...html.matchAll(/<option\b[^>]*>([\s\S]*?)<\/option>/gi)].map((match) => sanitizeText(match[1])).filter(Boolean);
  return { labels, placeholders, options };
}

function buildChunks(page) {
  const sentences = page.bodyText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  const chunkSize = 3;
  for (let index = 0; index < sentences.length; index += chunkSize) {
    const slice = sentences.slice(index, index + chunkSize);
    const text = slice.join(' ').trim();
    if (!text) continue;
    const chunkId = `${page.slug}#${chunks.length + 1}`;
    chunks.push({
      id: chunkId,
      pagePath: page.path,
      url: page.url,
      locale: page.locale,
      text,
      intent: page.intent,
      tags: page.tags
    });
  }
  return chunks;
}

function inferIntent(page) {
  const haystack = `${page.title} ${page.metaDescription} ${page.bodyText}`;
  const match = INTENT_RULES.find((rule) => rule.test.test(haystack));
  return match?.intent || page.pageType || 'general';
}

function summarize(text, fallback = '') {
  if (!text) return fallback;
  const pieces = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return pieces.slice(0, 2).join(' ').trim() || fallback;
}

function toSlug(pagePath) {
  if (pagePath === '/') return 'home';
  return pagePath.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-');
}

function translateSentence(sentence) {
  let translated = sentence;
  for (const [source, target] of SPANISH_PHRASE_MAP.entries()) {
    translated = translated.split(source).join(target);
  }
  return translated;
}

function translateBundleToSpanish(bundle, localeMessagesEs = []) {
  const clone = structuredClone(bundle);
  clone.locale = 'es';
  clone.generatedFromLocale = 'en';
  clone.translationStatus = 'machine-assisted-seed';
  clone.uiMessages = localeMessagesEs;
  clone.pages = clone.pages.map((page) => ({
    ...page,
    locale: 'es',
    title: translateSentence(page.title),
    metaDescription: translateSentence(page.metaDescription),
    summary: translateSentence(page.summary),
    bodyText: translateSentence(page.bodyText),
    headings: page.headings.map(translateSentence),
    ctas: page.ctas.map((cta) => ({ ...cta, label: translateSentence(cta.label) })),
    formDetails: {
      labels: page.formDetails.labels.map(translateSentence),
      placeholders: page.formDetails.placeholders.map(translateSentence),
      options: page.formDetails.options.map(translateSentence)
    },
    internalLinks: page.internalLinks.map((link) => ({ ...link, label: translateSentence(link.label) })),
    tags: [...new Set(page.tags.map(translateSentence))]
  }));
  clone.chunks = clone.chunks.map((chunk) => ({
    ...chunk,
    locale: 'es',
    text: translateSentence(chunk.text),
    tags: [...new Set(chunk.tags.map(translateSentence))]
  }));
  return clone;
}

async function readLocaleMessages() {
  const enSource = await readFile(path.join(repoRoot, 'locales/en/messages.js'), 'utf8');
  const esSource = await readFile(path.join(repoRoot, 'locales/es/messages.js'), 'utf8');
  const pattern = /([a-zA-Z]+):\s*'([^']+)'/g;
  const collect = (source, locale) => [...source.matchAll(pattern)].map((match, index) => ({
    id: `${locale}-${index + 1}`,
    locale,
    value: sanitizeText(match[2])
  }));
  return { en: collect(enSource, 'en'), es: collect(esSource, 'es') };
}

async function buildEnglishBundle() {
  const localeMessages = await readLocaleMessages();
  const pages = [];
  for (const source of PAGE_SOURCES) {
    const absolutePath = path.join(repoRoot, source.file);
    const rawHtml = await readFile(absolutePath, 'utf8');
    const safeHtml = sanitizeRichText(rawHtml);
    const headings = ['h1', 'h2', 'h3'].flatMap((tag) => extractTagContents(safeHtml, tag));
    const paragraphs = ['p', 'li'].flatMap((tag) => extractTagContents(safeHtml, tag));
    const bodyText = sanitizeText(paragraphs.join(' '));
    const titleMatch = safeHtml.match(/<title>([\s\S]*?)<\/title>/i);
    const title = sanitizeText(titleMatch?.[1] || headings[0] || source.type);
    const metaDescription = extractMeta(safeHtml, 'description');
    const url = extractCanonical(safeHtml, source.path);
    const internalLinks = extractLinks(safeHtml, source.path);
    const ctas = internalLinks.filter((link) => CTA_HINTS.some((hint) => link.label.toLowerCase().includes(hint)));
    const formDetails = extractFormDetails(safeHtml);
    const page = {
      locale: 'en',
      sourceFile: source.file,
      pageType: source.type,
      path: source.path,
      slug: toSlug(source.path),
      url,
      title,
      metaDescription,
      summary: summarize(bodyText, metaDescription),
      bodyText,
      headings,
      ctas,
      internalLinks,
      formDetails,
      tags: [...new Set([source.type, ...headings.slice(0, 3)].map((value) => sanitizeText(value).toLowerCase()).filter(Boolean))]
    };
    page.intent = inferIntent(page);
    pages.push(page);
  }

  const chunks = pages.flatMap(buildChunks);
  return {
    wikiId: 'WIKI_DICKIE',
    locale: 'en',
    generatedAt: new Date().toISOString(),
    siteBaseUrl: SITE_BASE_URL,
    workerUrl: WORKER_URL,
    pageCount: pages.length,
    chunkCount: chunks.length,
    uiMessages: localeMessages.en,
    pages,
    chunks
  };
}

async function writeArtifacts(bundleEn, bundleEs) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'wiki-dickie.en.json'), `${JSON.stringify(bundleEn, null, 2)}\n`, 'utf8');
  await writeFile(path.join(outputDir, 'wiki-dickie.es.json'), `${JSON.stringify(bundleEs, null, 2)}\n`, 'utf8');
}

async function syncBundle(bundle) {
  const secret = process.env[SECRET_ENV_KEY] || '';
  const nonce = process.env[NONCE_ENV_KEY] || crypto.randomBytes(16).toString('hex');
  const payload = {
    wikiId: bundle.wikiId,
    locale: bundle.locale,
    nonce,
    generatedAt: bundle.generatedAt,
    siteBaseUrl: bundle.siteBaseUrl,
    pages: bundle.pages,
    chunks: bundle.chunks,
    uiMessages: bundle.uiMessages
  };

  if (!secret) {
    return { skipped: true, reason: `Missing ${SECRET_ENV_KEY} environment variable.`, nonce };
  }

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'x-wiki-id': bundle.wikiId,
      'x-wiki-secret': secret,
      'x-sync-nonce': nonce
    },
    body: JSON.stringify(payload)
  });

  const bodyText = await response.text();
  return {
    skipped: false,
    ok: response.ok,
    status: response.status,
    nonce,
    bodyPreview: bodyText.slice(0, 500)
  };
}

async function main() {
  const englishBundle = await buildEnglishBundle();
  const localeMessages = await readLocaleMessages();
  const spanishBundle = translateBundleToSpanish(englishBundle, localeMessages.es);
  await writeArtifacts(englishBundle, spanishBundle);
  const shouldSync = process.argv.includes('--sync');
  const results = shouldSync
    ? await Promise.all([syncBundle(englishBundle), syncBundle(spanishBundle)])
    : [];

  const report = {
    generatedAt: englishBundle.generatedAt,
    outputFiles: [
      path.relative(repoRoot, path.join(outputDir, 'wiki-dickie.en.json')),
      path.relative(repoRoot, path.join(outputDir, 'wiki-dickie.es.json'))
    ],
    synced: shouldSync,
    syncResults: results
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error('[wiki-dickie-sync] failed:', error);
  process.exitCode = 1;
});
