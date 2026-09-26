import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// Original vector artwork. Rasterized locally for social platform compatibility.
const curves = Array.from(
  { length: 11 },
  (_, i) =>
    `<ellipse cx="990" cy="300" rx="${30 + i * 19}" ry="230" fill="none" stroke="#40596a" stroke-width="1" transform="rotate(-24 990 300)"/>`,
).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0b1015"/><g opacity=".7">${curves}</g><path d="M750 220L890 160L1080 280L960 440L805 375Z M890 160L960 440L750 220" fill="none" stroke="#9bd6e0"/><g fill="#b6e1e8"><circle cx="750" cy="220" r="4"/><circle cx="890" cy="160" r="4"/><circle cx="1080" cy="280" r="4"/><circle cx="960" cy="440" r="4"/></g><path d="M65 75h1070M65 550h1070" stroke="#2b3b46"/><text x="65" y="140" fill="#9bd6e0" font-family="monospace" font-size="15" letter-spacing="3">SYSTEMS ANALYST</text><text x="60" y="300" fill="#eef1f3" font-family="sans-serif" font-size="88" letter-spacing="-5">Felipe Macedo</text><text x="65" y="365" fill="#b1c0cc" font-family="sans-serif" font-size="28">Systems Analysis / Integrations / Software</text><text x="65" y="493" fill="#9baab5" font-family="monospace" font-size="17">WORK / STUDY / PERSONAL PROJECTS</text><text x="65" y="587" fill="#cbd7df" font-family="monospace" font-size="15">felipemacedo.me</text></svg>`;
await writeFile('public/og-image.svg', svg);
await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
