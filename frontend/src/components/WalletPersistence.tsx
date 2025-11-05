'use client';

import { useEffect } from 'react';
import { useAccount, useReconnect } from 'wagmi';

/**
 * Componente para gerenciar persistência da conexão da carteira
 * Garante reconexão automática após reload da página
 */
export function WalletPersistence() {
  const { isConnected, isReconnecting } = useAccount();
  const { reconnect } = useReconnect();

  useEffect(() => {
    // Tentar reconectar automaticamente quando o componente montar
    // Isso acontece após o reload da página
    if (!isConnected && !isReconnecting) {
      const timer = setTimeout(() => {
        reconnect();
      }, 100); // Pequeno delay para garantir que o provider está pronto

      return () => clearTimeout(timer);
    }
  }, [isConnected, isReconnecting, reconnect]);

  // Log de debug (remover em produção se necessário)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Wallet State:', {
        isConnected,
        isReconnecting,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isConnected, isReconnecting]);

  // Este componente não renderiza nada
  return null;
}
