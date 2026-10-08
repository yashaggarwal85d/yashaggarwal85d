// Lists every string passed to tr() in src/, and checks each locale against it:
//   node scripts/i18n-keys.mjs            → writes src/i18n/en.json (the source catalogue)
//   node scripts/i18n-keys.mjs --check    → reports missing/extra keys and broken {placeholders}
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src');
const files = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes(`${path.sep}locales`)) walk(p);
    } else if (/\.(tsx?|mjs)$/.test(f)) files.push(p);
  }
};
walk(root);

const keys = new Set();
const re = /\btr\(\s*(['"])((?:\\.|(?!\1).)*)\1/g;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(re)) keys.add(m[2].replace(/\\(['"\\])/g, '$1'));
}
// Keys that only reach tr() through a variable (skill groups, shelf kinds).
for (const k of ['All', 'Languages', 'Processing', 'Lakehouse', 'Databases', 'Cloud & IaC', 'DevOps', 'AI', 'Series', 'Film', 'Anime', 'Books', 'Music', 'Travel', 'Kitchen']) keys.add(k);
const list = [...keys].sort();

if (!process.argv.includes('--check')) {
  fs.writeFileSync(path.join(root, 'i18n', 'en.json'), JSON.stringify(list, null, 2) + '\n');
  console.log(`${list.length} strings → src/i18n/en.json`);
} else {
  const dir = path.join(root, 'i18n', 'locales');
  let bad = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    let d;
    try {
      d = JSON.parse(json);
    } catch (e) {
      console.log(`${f}: not plain JSON inside the object (${e.message})`);
      bad++;
      continue;
    }
    const missing = list.filter((k) => !(k in d));
    const extra = Object.keys(d).filter((k) => !keys.has(k));
    const ph = list.filter((k) => k in d && (k.match(/\{\w+\}/g) || []).sort().join() !== (d[k].match(/\{\w+\}/g) || []).sort().join());
    console.log(`${f}: ${Object.keys(d).length} entries, ${missing.length} missing, ${extra.length} stale, ${ph.length} placeholder mismatches`);
    if (missing.length) console.log('  missing:', missing.slice(0, 8).map((k) => JSON.stringify(k)).join(', '), missing.length > 8 ? '…' : '');
    if (ph.length) console.log('  placeholders:', ph.slice(0, 5).join(' | '));
    bad += missing.length + ph.length;
  }
  process.exit(bad ? 1 : 0);
}
