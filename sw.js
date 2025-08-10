/**
 * Enterprise Service Worker
 * Implements stale-while-revalidate and network-first strategies
 */

const CACHE_NAME = 'terminal-portfolio-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/mobile.html',
  '/src/css/main.css',
  '/src/js/main.js'
];

const API_ENDPOINTS = [
  'https://api.github.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== API_CACHE)
            .map(name => caches.delete(name))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first with fallback
  if (API_ENDPOINTS.some(endpoint => request.url.startsWith(endpoint))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - stale while revalidate
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.startsWith('/src/'))) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Default - network first
  event.respondWith(networkFirstStrategy(request));
});

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background Sync for queued actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processQueuedActions());
  }
});

async function processQueuedActions() {
  // Process any queued analytics or user actions
  const db = await openDB();
  const actions = await getQueuedActions(db);
  
  for (const action of actions) {
    try {
      await fetch(action.url, action.options);
      await removeQueuedAction(db, action.id);
    } catch (error) {
      console.warn('Failed to process queued action:', error);
    }
  }
}

// Simple IndexedDB wrapper for queued actions
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('terminal-portfolio', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        const store = db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

async function getQueuedActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeQueuedAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}