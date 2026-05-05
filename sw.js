// ╔══════════════════════════════════════════════════════════════╗
// ║  SERVICE WORKER — DigiFrota 3.2                              ║
// ║  Cache atualizado em 2026-05 para forçar reload nos devices  ║
// ╚══════════════════════════════════════════════════════════════╝
const CACHE_NAME = 'digifrota-v3-2-20260505c'; // ← versão nova
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];
// ── Instalação: limpa caches antigos e pré-carrega assets ──────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
// ── Ativação: remove todos os caches antigos ───────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Removendo cache antigo:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});
// ── Fetch: network-first para o script do Google, cache-first para o resto ──
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (
    url.includes('script.google.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
