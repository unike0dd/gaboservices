#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const sitemapFile = path.join(ROOT, 'sitemap.xml');
const BASE = 'https://www.gabo.services';

function urlTag(loc) {
  return `  <url><loc>${BASE}${loc}</loc></url>`;
}

const baseUrls = [
  '/',
  '/about/',
  '/services/',
  '/services/logistics-operations/',
  '/services/administrative-backoffice/',
  '/services/customer-relations/',
  '/services/it-support/',
  '/pricing/',
  '/careers/',
  '/contact/',
  '/learning/'
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...baseUrls.map(urlTag),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(sitemapFile, xml, 'utf8');
console.log(`Updated ${path.relative(ROOT, sitemapFile)} with base URLs only.`);
