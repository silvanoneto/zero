'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';

/**
 * Componente para gerenciar persistência da conexão da carteira
 * Garante que o estado da conexão é mantido após reload da página
 * 
 * A reconexão automática é gerenciada pelo wagmi através da propriedade
 * reconnectOnMount e do storage configurado no WagmiProvider.
 */
export function WalletPersistence() {
  const { isConnected, connector, address, status } = useAccount();

  // Log de debug inicial
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 WalletPersistence montado');
      
      // Verificar storage
      const wagmiStorage = localStorage.getItem('revolucao-cibernetica.wallet.store');
      console.log('💾 Storage no mount:', {
        hasWagmiStorage: !!wagmiStorage,
        wagmiStoragePreview: wagmiStorage ? wagmiStorage.substring(0, 100) + '...' : null,
      });
    }
  }, []);

  // Salvar informação de conexão no localStorage para rastreamento
  useEffect(() => {
    if (isConnected && connector && address) {
      localStorage.setItem('revolucao-cibernetica.wallet.wasConnected', 'true');
      localStorage.setItem('revolucao-cibernetica.wallet.lastConnector', connector.id);
      localStorage.setItem('revolucao-cibernetica.wallet.lastAddress', address);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Wallet conectada e salva:', {
          connector: connector.id,
          address: address.slice(0, 6) + '...' + address.slice(-4),
          status,
        });
      }
    }
  }, [isConnected, connector, address, status]);

  // Garantir que o estado é salvo antes do reload/navegação
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isConnected && connector && address) {
        // Forçar salvamento síncrono antes do unload
        try {
          localStorage.setItem('revolucao-cibernetica.wallet.wasConnected', 'true');
          localStorage.setItem('revolucao-cibernetica.wallet.lastConnector', connector.id);
          localStorage.setItem('revolucao-cibernetica.wallet.lastAddress', address);
        } catch (error) {
          console.error('Erro ao salvar estado da wallet:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isConnected, connector, address]);

  // Limpar flags antigas apenas quando desconectar explicitamente
  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      // Verificar se há dados de reconexão no wagmi storage
      const wagmiStorage = localStorage.getItem('revolucao-cibernetica.wallet.store');
      
      // Se não há dados do wagmi, limpar nossos flags também
      if (!wagmiStorage || wagmiStorage === '{}') {
        localStorage.removeItem('revolucao-cibernetica.wallet.wasConnected');
        localStorage.removeItem('revolucao-cibernetica.wallet.lastConnector');
        localStorage.removeItem('revolucao-cibernetica.wallet.lastAddress');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Wallet desconectada, flags limpos');
        }
      }
    }
  }, [isConnected]);

  // Log de debug para rastreamento do estado
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const wasConnected = localStorage.getItem('revolucao-cibernetica.wallet.wasConnected');
      const lastConnector = localStorage.getItem('revolucao-cibernetica.wallet.lastConnector');
      
      console.log('🔗 Wallet State Update:', {
        isConnected,
        connector: connector?.id,
        address: address ? address.slice(0, 6) + '...' + address.slice(-4) : null,
        status,
        wasConnected,
        lastConnector,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isConnected, connector, address, status]);

  // Este componente não renderiza nada
  return null;
}
