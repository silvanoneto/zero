/**
 * Service Worker para Revolução Cibernética
 * Implementa estratégia de cache para melhorar performance e permitir acesso offline
 */

const CACHE_NAME = 'revolucao-cibernetica-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifesto.html',
  '/entry.html',
  '/download.html',
  '/assets/css/styles.css',
  '/assets/css/index-ternary.css',
  '/assets/css/download.css',
  '/assets/scripts/ternary-navigation.js',
  '/assets/scripts/rizoma-navigation.js',
  '/assets/scripts/captcha.js',
  '/assets/scripts/main.js',
  // Adicionar imagens críticas
  '/assets/images/01_capa_revolucao_cibernetica.png',
  '/assets/images/favicon.ico'
];

// Instalar service worker e fazer cache inicial
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache aberto');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Service Worker: Assets em cache');
        return self.skipWaiting();
      })
  );
});

// Ativar service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('🗑️ Service Worker: Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado');
        return self.clients.claim();
      })
  );
});

// Estratégia: Cache First, falling back to Network
// Ideal para assets estáticos que não mudam frequentemente
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Recurso encontrado no cache
          console.log('📦 Cache hit:', event.request.url);
          return cachedResponse;
        }

        // Recurso não está no cache, buscar na rede
        console.log('🌐 Cache miss, buscando na rede:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Verificar se a resposta é válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clonar a resposta (só pode ser consumida uma vez)
            const responseToCache = networkResponse.clone();

            // Adicionar ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('❌ Erro ao buscar recurso:', error);
            // Aqui você pode retornar uma página offline customizada
            // return caches.match('/offline.html');
          });
      })
  );
});

// Sincronização em background (opcional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('🔄 Service Worker: Sincronizando dados...');
    // Implementar lógica de sincronização aqui
  }
});

// Push notifications (opcional)
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Notificação push recebida');
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/assets/images/favicon.ico',
    badge: '/assets/images/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'revolucao-cibernetica',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('Revolução Cibernética', options)
  );
});
