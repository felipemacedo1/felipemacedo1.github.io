import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { badgeIds } from '../src/content/credentials.mjs';
import { parsePublicBadge, validBadge } from './credly.mjs';
const path = new URL('../src/data/credentials.generated.json', import.meta.url);
let previous = [];
try {
  previous = JSON.parse(await readFile(path, 'utf8'));
} catch {
  /* First sync */
}
const result = [];
for (const id of badgeIds) {
  try {
    if (process.env.CREDLY_OFFLINE === '1') throw new Error('Offline fallback test');
    const response = await fetch(`https://www.credly.com/api/v1/public_badges/${id}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const badge = parsePublicBadge(await response.json(), id);
    if (!validBadge(badge)) throw new Error('Invalid badge');
    // Cache images locally. Image failure retains remote metadata and previous local image.
    try {
      const img = await fetch(badge.image, { signal: AbortSignal.timeout(15000) });
      if (!img.ok || !img.headers.get('content-type')?.startsWith('image/'))
        throw new Error('Invalid image');
      const sharp = (await import('sharp')).default;
      await mkdir('public/badges', { recursive: true });
      await sharp(Buffer.from(await img.arrayBuffer()))
        .resize(160, 160, { fit: 'inside' })
        .webp({ quality: 85 })
        .toFile(`public/badges/${id}.webp`);
      badge.localImage = `/badges/${id}.webp`;
    } catch {
      const old = previous.find((b) => b.id === id);
      if (old?.localImage) badge.localImage = old.localImage;
    }
    result.push(badge);
    console.log(`${id}: ${badge.name}`);
  } catch (error) {
    const old = previous.find((b) => b.id === id);
    if (validBadge(old)) {
      result.push(old);
      console.warn(`${id}: retained valid snapshot (${error.message})`);
    } else {
      console.warn(`${id}: no valid snapshot; omitted`);
    }
  }
}
if (result.length !== badgeIds.length)
  throw new Error('Incomplete snapshot. Restore verified snapshot before building.');
await writeFile(
  new URL('./credentials.generated.json.tmp', path),
  JSON.stringify(result, null, 2) + '\n',
);
const { rename } = await import('node:fs/promises');
await rename(new URL('./credentials.generated.json.tmp', path), path);
