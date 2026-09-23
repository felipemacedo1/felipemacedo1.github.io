// Public Credly assertions only. Never persist recipient or tracking fields.
export function validBadge(b) {
  return (
    b &&
    typeof b.id === 'string' &&
    typeof b.name === 'string' &&
    b.name.length > 3 &&
    typeof b.issuer === 'string' &&
    b.issuer.length > 2 &&
    b.url === `https://www.credly.com/badges/${b.id}` &&
    [b.issuedAt, b.expiresAt].every(
      (d) => d === null || (typeof d === 'string' && Number.isFinite(Date.parse(d))),
    )
  );
}

export function parsePublicBadge(payload, id) {
  const d = payload?.data;
  const t = d?.badge_template;
  const issuer = d?.issuer?.entities?.find((e) => e.primary)?.entity;
  if (
    d?.id !== id ||
    d.public !== true ||
    d.state !== 'accepted' ||
    d.issued_to !== 'Felipe Macedo' ||
    typeof t?.name !== 'string' ||
    typeof issuer?.name !== 'string'
  )
    throw new Error('Invalid public badge assertion');
  const date = (v) =>
    v == null ? null : typeof v === 'string' && Number.isFinite(Date.parse(v)) ? v : null;
  const image = d.image_url || t.image_url;
  if (new URL(image).hostname !== 'images.credly.com') throw new Error('Invalid badge image host');
  return {
    id,
    name: t.name,
    issuer: issuer.name,
    description: t.description || '',
    image,
    issuedAt: date(d.issued_at_date || d.issued_at),
    expiresAt: date(d.expires_at_date || d.expires_at),
    skills: Array.isArray(t.skills)
      ? t.skills.map((s) => s.name).filter((s) => typeof s === 'string')
      : [],
    type: typeof t.type_category === 'string' ? t.type_category : null,
    url: `https://www.credly.com/badges/${id}`,
    source: 'official-public-api',
    checkedAt: new Date().toISOString(),
  };
}
