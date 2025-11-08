'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

/**
 * Componente de debug para verificar estado da conexão da carteira
 * Útil durante desenvolvimento para diagnosticar problemas de persistência
 */
export function WalletDebug() {
  const { isConnected, connector, address, status } = useAccount();
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wagmiStorage = localStorage.getItem('revolucao-cibernetica.wallet.store');
      const wasConnected = localStorage.getItem('revolucao-cibernetica.wallet.wasConnected');
      const lastConnector = localStorage.getItem('revolucao-cibernetica.wallet.lastConnector');
      const lastAddress = localStorage.getItem('revolucao-cibernetica.wallet.lastAddress');
      
      setStorageInfo({
        wagmiStorage: wagmiStorage ? JSON.parse(wagmiStorage) : null,
        wasConnected,
        lastConnector,
        lastAddress,
      });
    }
  }, [isConnected, connector, address]);

  // Mostrar apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Botão flutuante para abrir/fechar debug */}
      <button
        onClick={() => setVisible(!visible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        title="Debug Wallet"
      >
        🔍
      </button>

      {/* Painel de debug */}
      {visible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md border-2 border-blue-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Wallet Debug Info</h3>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <strong>Status:</strong> <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{status}</span>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <strong>Conectada:</strong> <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Sim' : 'Não'}</span>
            </div>

            {connector && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <strong>Conector:</strong> {connector.id} ({connector.name})
              </div>
            )}

            {address && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <strong>Endereço:</strong> 
                <div className="text-xs font-mono break-all">{address}</div>
              </div>
            )}

            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
              <strong className="block mb-1">LocalStorage:</strong>
              {storageInfo && (
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                  <div><strong>Was Connected:</strong> {storageInfo.wasConnected || 'null'}</div>
                  <div><strong>Last Connector:</strong> {storageInfo.lastConnector || 'null'}</div>
                  <div><strong>Last Address:</strong> {storageInfo.lastAddress ? `${storageInfo.lastAddress.slice(0, 6)}...${storageInfo.lastAddress.slice(-4)}` : 'null'}</div>
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Wagmi Storage</summary>
                    <pre className="mt-1 overflow-auto max-h-40 bg-gray-200 dark:bg-gray-800 p-2 rounded">
                      {JSON.stringify(storageInfo.wagmiStorage, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition text-xs"
              >
                Limpar Storage e Recarregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
