#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules']);

async function collectJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...await collectJsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      files.push(path.relative(ROOT, fullPath));
    }
  }

  return files;
}

async function main() {
  const files = (await collectJsFiles(ROOT)).sort();
  const failures = [];

  for (const relativePath of files) {
    const result = spawnSync(process.execPath, ['--check', relativePath], {
      cwd: ROOT,
      encoding: 'utf8'
    });

    if (result.status !== 0) {
      failures.push({
        file: relativePath,
        output: (result.stderr || result.stdout || 'Unknown syntax error').trim()
      });
    }
  }

  if (failures.length > 0) {
    console.error('JavaScript syntax validation failed:');
    failures.forEach(({ file, output }) => {
      console.error(`\n- ${file}\n${output}`);
    });
    process.exit(1);
  }

  console.log(`JavaScript syntax validation passed for ${files.length} files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
