#!/usr/bin/env node
// Every getElementById() target in js/*.js must exist in index.html, or be
// created at runtime by one of those scripts.
//
// Written after a regex-based nav rebuild silently deleted the language
// switcher, the theme toggle and the Download CV button, and after game.js
// was found writing to #completedLevel, which never existed in the markup.
// A generic probe over ALL references survives redesigns; asserting specific
// element names does not.
//
//   node scripts-check-dom-refs.mjs
import { readFileSync, readdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const files = readdirSync('js').filter(f => f.endsWith('.js')).map(f => `js/${f}`);

const runtime = new Set();
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/id=["']([A-Za-z0-9_-]+)["']/g)) runtime.add(m[1]);
  for (const m of s.matchAll(/\.id\s*=\s*["']([A-Za-z0-9_-]+)["']/g)) runtime.add(m[1]);
}

let bad = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/getElementById\(\s*["']([A-Za-z0-9_-]+)["']\s*\)/g)) {
    const el = m.group ?? m[1];
    if (!ids.has(el) && !runtime.has(el)) {
      console.error(`  x ${f}:${s.slice(0, m.index).split('\n').length}  #${el} referenced but never in the DOM`);
      bad++;
    }
  }
}
console.log(bad === 0
  ? `OK  ${files.length} scripts checked, no dangling getElementById targets`
  : `FAIL  ${bad} dangling reference(s)`);
process.exit(bad === 0 ? 0 : 1);
