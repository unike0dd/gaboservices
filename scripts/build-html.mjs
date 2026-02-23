import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
let html = readFileSync('index.html', 'utf8');
html = html.replace('./index.tsx', './index.js');
writeFileSync('dist/index.html', html);
copyFileSync('metadata.json', 'dist/metadata.json');
