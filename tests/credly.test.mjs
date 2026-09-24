import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parsePublicBadge, validBadge } from '../scripts/credly.mjs';
import { badgeIds } from '../src/content/credentials.mjs';
test('snapshot contains nine official assertions with no fabricated dates', async () => {
  const data = JSON.parse(await readFile('src/data/credentials.generated.json', 'utf8'));
  assert.deepEqual(
    data.map((x) => x.id),
    badgeIds,
  );
  for (const b of data) {
    assert.ok(validBadge(b));
    assert.ok(b.issuedAt === null || Number.isFinite(Date.parse(b.issuedAt)));
    assert.ok(!('recipient_email' in b));
  }
  assert.equal(new Set(data.map((b) => b.id)).size, 9);
  assert.ok(data.some((b) => b.name === 'Microsoft Certified: Azure Fundamentals'));
  assert.equal(
    data.find((b) => b.id === 'acdc8d79-0799-4ca5-a2c1-f34d61ce213b')?.issuedAt,
    '2026-04-19',
  );
  assert.equal(
    data.find((b) => b.id === 'acdc8d79-0799-4ca5-a2c1-f34d61ce213b')?.issuer,
    'Generation.org',
  );
  assert.ok(
    data.filter((b) => b.issuer.includes('Amazon')).every((b) => !b.name.includes('AWS Certified')),
  );
});
test('API parser rejects private badges and retains unknown dates', () => {
  const id = badgeIds[0];
  const data = {
    id,
    public: true,
    state: 'accepted',
    issued_to: 'Felipe Macedo',
    badge_template: { name: 'Real training', skills: [{ name: 'Storage' }] },
    issuer: { entities: [{ primary: true, entity: { name: 'Actual issuer' } }] },
    image_url: 'https://images.credly.com/a.png',
  };
  const parsed = parsePublicBadge({ data }, id);
  assert.equal(parsed.issuedAt, null);
  assert.deepEqual(parsed.skills, ['Storage']);
  assert.ok(!('issued_to' in parsed));
  assert.throws(() => parsePublicBadge({ data: { ...data, public: false } }, id));
  assert.throws(() => parsePublicBadge({ data: { ...data, id: 'other' } }, id));
});
