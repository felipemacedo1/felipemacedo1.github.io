// Retirement worker at the old URL. Remove only caches owned by this portfolio.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
 const names = await caches.keys();
 await Promise.all(names.filter(n => ['terminal-portfolio-v1','static-v1','api-v1'].includes(n)).map(n => caches.delete(n)));
 await self.registration.unregister();
 await self.clients.claim();
})()));
