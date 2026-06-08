const CACHE_NAME = 'uem-assistant-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './app_icon.png',
    './css/variables.css',
    './css/main.css',
    './css/chat.css',
    './css/panels.css',
    './js/config.js',
    './js/db.js',
    './js/auth.js',
    './js/speech.js',
    './js/ai.js',
    './js/analytics.js',
    './js/notifications.js',
    './js/avatar3d.js',
    './js/ui.js',
    './js/chat.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Intercept standard GET requests for local assets
    if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    // Fail gracefully offline
                });
            })
        );
    }
});
