import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseBadge,validBadge} from '../scripts/credly.mjs';
import {badgeIds} from '../src/content/credentials.mjs';
test('snapshot contains eight official assertions with no fabricated dates',async()=>{
 const data=JSON.parse(await readFile('src/data/credentials.generated.json','utf8'));
 assert.deepEqual(data.map(x=>x.id),badgeIds);
 for(const b of data){assert.ok(validBadge(b));assert.equal(b.issuedAt,null);assert.equal(b.expiresAt,null);assert.ok(!('recipient_email' in b));}
 assert.ok(data.some(b=>b.name==='Microsoft Certified: Azure Fundamentals'));
 assert.ok(data.filter(b=>b.issuer.includes('Amazon')).every(b=>!b.name.includes('AWS Certified')));
});
test('unavailable metadata is rejected, never invented',()=>{
 assert.throws(()=>parseBadge('<title>Access denied</title>',badgeIds[0]));
 assert.equal(validBadge({id:badgeIds[0],name:'Unknown',issuer:'Unknown',url:'javascript:alert(1)',issuedAt:null,expiresAt:null}),false);
});
test('public metadata is escaped, unknown dates stay null',()=>{
 const id=badgeIds[0];const badge=parseBadge(`<meta property="og:title" content="Research &amp; Analysis was issued by Example to Felipe Macedo."><meta property="og:image" content="https://images.credly.com/example.png"><meta property="og:url" content="https://www.credly.com/badges/${id}"><meta property="og:description" content="A public badge.">`,id);
 assert.equal(badge.name,'Research & Analysis');assert.equal(badge.issuedAt,null);
});
