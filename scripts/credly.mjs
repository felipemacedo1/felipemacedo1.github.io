// Parse only public OG assertion metadata. Never retain recipient or tracking data.
export function parseBadge(html, id) {
 const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
 const metas = [...html.matchAll(/<meta\s[^>]+>/gi)];
 const meta = key => {
  const tag = metas.find(([s]) => s.includes(`property="${key}"`) || s.includes(`property='${key}'`))?.[0];
  return decode(tag?.match(/content=["']([^]*?)["']\s*\/?\s*>/i)?.[1] || '');
 };
 const title = meta('og:title');
 const match = title.match(/^(.+) was issued by (.+) to Felipe Macedo\.?$/);
 if (!match || meta('og:url') !== `https://www.credly.com/badges/${id}`) throw new Error('Invalid official assertion metadata');
 const image = meta('og:image');
 if (new URL(image).hostname !== 'images.credly.com') throw new Error('Unexpected image host');
 return { id, name: match[1], issuer: match[2], description: meta('og:description'), image,
  issuedAt: null, expiresAt: null, skills: [], url: `https://www.credly.com/badges/${id}`,
  source: 'official-public-page', checkedAt: new Date().toISOString() };
}
export function validBadge(b) {
 return b && typeof b.id === 'string' && typeof b.name === 'string' && b.name.length > 3 && typeof b.issuer === 'string' && b.issuer.length > 2 && b.url === `https://www.credly.com/badges/${b.id}` && [b.issuedAt,b.expiresAt].every(d => d === null || (typeof d === 'string' && Number.isFinite(Date.parse(d))));
}
