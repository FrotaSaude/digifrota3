// DigiFrota 3.0 — Service Worker
const CACHE = 'digifrota-v6';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  // manifest.json e ícones FORA do cache — sempre buscam da rede
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Apps Script sempre vai para a rede
  if (e.request.url.includes('script.google.com')) return;

  // Manifest e ícones sempre buscam da rede (nunca do cache)
  if (
    e.request.url.includes('manifest.json') ||
    e.request.url.includes('icon-192') ||
    e.request.url.includes('icon-512')
  ) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
