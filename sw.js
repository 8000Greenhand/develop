const CACHE_NAME = 'dnd-shadow-adventure-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/character.css',
  '/css/combat.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/dice.js',
  '/js/character.js',
  '/js/combat.js',
  '/js/storage.js',
  '/js/ai-bridge.js',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg'
];

// 安装 Service Worker 并缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活并清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求，优先使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            // 不缓存非成功响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 缓存新资源
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // 离线时返回缓存的 index.html
            return caches.match('/index.html');
          });
      })
  );
});
