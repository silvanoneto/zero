/**
 * Registro do Service Worker
 * Este script deve ser incluído no <head> ou no final do <body>
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);

        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // A cada 1 minuto
      })
      .catch((error) => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  });
}
