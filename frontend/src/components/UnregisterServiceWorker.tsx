'use client';

import { useEffect } from 'react';

/**
 * Componente para desregistrar Service Workers em ambiente de desenvolvimento
 * Service Workers podem cachear código e interferir com hot-reload e localStorage
 */
export function UnregisterServiceWorker() {
  useEffect(() => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Desregistrar todos os service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.log('🔧 [Dev] Encontrados', registrations.length, 'Service Workers');
          
          registrations.forEach((registration) => {
            registration.unregister().then((success) => {
              if (success) {
                console.log('✅ [Dev] Service Worker desregistrado:', registration.scope);
              }
            });
          });

          // Limpar caches do service worker
          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              cacheNames.forEach((cacheName) => {
                caches.delete(cacheName).then(() => {
                  console.log('🗑️ [Dev] Cache removido:', cacheName);
                });
              });
            });
          }

          // Avisar para recarregar
          console.warn('⚠️ [Dev] Service Workers removidos. Recarregue a página (Ctrl+Shift+R).');
        } else {
          console.log('✅ [Dev] Nenhum Service Worker ativo');
        }
      });
    }
  }, []);

  return null;
}
