import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
const htmls = [
  'index.html',
  'en/index.html',
  'legacy/index.html',
  'mobile.html',
  '404.html',
  'curriculo/index.html',
  'en/resume/index.html',
  'credenciais/index.html',
  'en/credentials/index.html',
];
assert.equal((await readFile('dist/CNAME', 'utf8')).trim(), 'felipemacedo.me');
for (const asset of [
  'cv/Felipe-Macedo-CV-2026.pdf',
  'certificates/certificado-sistemas-computacionais-seguranca.png',
  'certificates/certificado-cyber-threat-management.png',
  'certificates/certificado-fundamentos-forense-computacional.png',
  'certificates/certificado-introducao-ciberseguranca.png',
  'certificates/certificado-proteger-dados-era-digital.png',
])
  assert.ok((await stat(`dist/${asset}`)).isFile(), `Missing document asset ${asset}`);
for (const path of htmls) {
  const html = await readFile(`dist/${path}`, 'utf8');
  assert.ok(!html.includes(['felipemacedo.dev', '@gmail.com'].join('')));
  assert.ok(!html.includes(['linkedin.com/in/felipe', '-macedo-', '"'].join('')));
  for (const [, url] of html.matchAll(/\b(?:src|href)="(\/[^"#?]*)"/g)) {
    const file = `dist${url}${url.endsWith('/') ? 'index.html' : ''}`;
    assert.ok((await stat(file)).isFile(), `Broken asset/route ${url} in ${path}`);
  }
  if (path === 'index.html' || path === 'en/index.html') {
    for (const id of [
      'work',
      'journey',
      'education',
      'contact',
      'open-speech-bridge',
      'database-radar',
      'rizoma',
      'legacy-flight-recorder',
    ])
      assert.ok(html.includes(`id="${id}"`), `Missing ${id}`);
    const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((x) => x[1]));
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
      assert.ok(ids.has(id), `Broken anchor ${id}`);
    assert.ok(html.includes('https://felipemacedo.me/og-image.png'));
    assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
    assert.ok(gzipSync(html).length < 30000, 'HTML gzip budget: 30kB');
  }
}
let scriptTotal = 0;
let cssTotal = 0;
for (const f of await readdir('dist/_astro')) {
  const buf = await readFile(`dist/_astro/${f}`);
  const size = gzipSync(buf).length;
  if (f.endsWith('.js')) scriptTotal += size;
  if (f.endsWith('.css')) cssTotal += size;
}
assert.ok(scriptTotal < 200000, `JS gzip exceeds 200kB: ${scriptTotal}`);
assert.ok(cssTotal < 20000, `CSS gzip exceeds 20kB: ${cssTotal}`);
console.log(
  `Static routes, anchors, assets, CNAME verified. JS gzip ${scriptTotal}B; CSS gzip ${cssTotal}B.`,
);
