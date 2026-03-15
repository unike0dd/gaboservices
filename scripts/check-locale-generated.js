#!/usr/bin/env node
const { spawnSync } = require('child_process');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  run('node', ['scripts/duplicates.js', 'en', 'es']);

  const diffResult = spawnSync('git', ['diff', '--exit-code', '--', 'en', 'es'], {
    encoding: 'utf8'
  });

  if (diffResult.status !== 0) {
    process.stdout.write(diffResult.stdout || '');
    process.stderr.write(diffResult.stderr || '');
    console.error('\n[i18n] Generated locale pages are out of sync with sources.');
    console.error('[i18n] Run: node scripts/duplicates.js en es');
    process.exit(1);
  }

  console.log('[i18n] Locale generated pages are in sync (en/, es/).');
}

main();
