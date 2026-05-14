const CACHE_NAME = 'dnd-shadow-adventure-v2';
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./css/character.css",
  "./css/combat.css",
  "./css/animations.css",
  "./css/features.css",
  "./js/state-manager.js",
  "./js/encounter-engine.js",
  "./js/audio-engine.js",
  "./js/character.js",
  "./js/dice.js",
  "./js/storage.js",
  "./js/ai-bridge.js",
  "./js/combat.js",
  "./js/npc.js",
  "./js/inventory.js",
  "./js/ui.js",
  "./js/app.js",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

const toScopeUrl = (path) => new URL(path, self.registration.scope).toString();

// 安装 Service Worker 并缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 缓存静态资源');
        return cache.addAll(STATIC_ASSETS.map(toScopeUrl));
      })
      .then(() => self.skipWaiting())
  );
});

// 激活并清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

// 拦截请求：优先缓存，导航请求离线时回退到 index.html
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match(toScopeUrl('./index.html'));
        }
        return caches.match(request);
      });
    })
  );
});
