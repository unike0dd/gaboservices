#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { SOURCE_ROUTES, getEnPath, getEsPath } = require('./lib/locale-route-map');

const ROOT = path.resolve(__dirname, '..');
const outputFile = path.join(ROOT, 'legacy-locale-redirects.txt');

function queryPath(route) {
  if (route.startsWith('/legal/')) return route;
  return route.endsWith('/') ? route : `${route}/`;
}

function buildLines() {
  const lines = ['# Legacy query-based locale redirects'];
  SOURCE_ROUTES.forEach(({ route }) => {
    const base = queryPath(route);
    lines.push(`${base}?lang=en -> ${getEnPath(route)} 301`);
    lines.push(`${base}?lang=es -> ${getEsPath(route)} 301`);
  });
  return lines;
}

fs.writeFileSync(outputFile, `${buildLines().join('\n')}\n`, 'utf8');
console.log(`Updated ${path.relative(ROOT, outputFile)}`);
