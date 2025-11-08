'use client';

import { useEffect } from 'react';
import { useAccount, useReconnect } from 'wagmi';

/**
 * Componente para forçar reconexão automática ao carregar a página
 * Tenta reconectar se há evidências de conexão prévia no localStorage
 */
export function WalletAutoReconnect() {
  const { isConnected, isConnecting } = useAccount();
  const { reconnect } = useReconnect();

  useEffect(() => {
    // Executar apenas uma vez ao montar
    const attemptReconnect = async () => {
      // Verificar se já está conectado ou conectando
      if (isConnected || isConnecting) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 AutoReconnect: Já conectado ou conectando, pulando');
        }
        return;
      }

      // Verificar se há dados de conexão prévia
      const wagmiStorage = localStorage.getItem('revolucao-cibernetica.wallet.store');
      const wasConnected = localStorage.getItem('revolucao-cibernetica.wallet.wasConnected');

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 AutoReconnect: Verificando storage...', {
          hasWagmiStorage: !!wagmiStorage,
          wasConnected,
        });
      }

      // Se há dados salvos, tentar reconectar
      if (wagmiStorage || wasConnected === 'true') {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 AutoReconnect: Tentando reconectar...');
          }
          
          // Pequeno delay para garantir que o DOM está pronto
          await new Promise(resolve => setTimeout(resolve, 250));
          
          // Tentar reconectar
          reconnect();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ AutoReconnect: Reconexão iniciada');
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ AutoReconnect: Erro ao reconectar:', error);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ AutoReconnect: Sem dados de conexão prévia');
        }
      }
    };

    attemptReconnect();
  }, []); // Executar apenas uma vez ao montar

  // Este componente não renderiza nada
  return null;
}
