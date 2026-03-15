#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { SOURCE_ROUTES, getEnPath, getEsPath } = require('./lib/locale-route-map');

const ROOT = path.resolve(__dirname, '..');
const sitemapFile = path.join(ROOT, 'sitemap.xml');
const BASE = 'https://www.gabo.services';

function urlTag(loc) {
  return `  <url><loc>${BASE}${loc}</loc></url>`;
}

const localeUrls = [];
SOURCE_ROUTES.forEach(({ route }) => {
  localeUrls.push(getEnPath(route));
  localeUrls.push(getEsPath(route));
});

const unique = Array.from(new Set(localeUrls));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...unique.map(urlTag),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(sitemapFile, xml, 'utf8');
console.log(`Updated ${path.relative(ROOT, sitemapFile)} with ${unique.length} locale URLs`);
