const CACHE_NAME = 'divine-wisdom-v1';
const OFFLINE_CACHE = 'divine-wisdom-offline-v1';

// Recursos essenciais para funcionar offline
const ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instala o service worker e faz cache dos recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Ativa o service worker e limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições e serve do cache quando offline
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se existir
      if (cachedResponse) {
        return cachedResponse;
      }

      // Tenta buscar da rede
      return fetch(event.request)
        .then((response) => {
          // Não cacheia respostas inválidas
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clona a resposta para cachear
          const responseToCache = response.clone();

          // Cacheia a resposta
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Se falhar, tenta retornar do cache offline
          return caches.match('/index.html');
        });
    })
  );
});

// Mensagens do aplicativo para controlar o cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_QUESTIONS') {
    event.waitUntil(
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.put(
          new Request('/offline-questions'),
          new Response(JSON.stringify(event.data.questions), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
