const CACHE_NAME = 'kooked-musics-cache-v1';
const STATIC_ASSETS = ['/manifest.json'];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});
