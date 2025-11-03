'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSecureTransfer } from '@/hooks/useSecureTransfer';
import { parseEther } from 'viem';

export default function SecureTransferForm() {
  const { address } = useAccount();
  const { transfer, isPending, isSuccess, error } = useSecureTransfer();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [useBiometric, setUseBiometric] = useState(false);
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [biometricData, setBiometricData] = useState('');
  const [geolocation, setGeolocation] = useState('');

  const handleGeolocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geo = `${position.coords.latitude},${position.coords.longitude}`;
          setGeolocation(geo);
        },
        (error) => {
          alert('Erro ao capturar geolocalização: ' + error.message);
        }
      );
    } else {
      alert('Geolocalização não suportada pelo navegador');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Endereço do destinatário inválido');
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }

    // Generate device fingerprint (simplified)
    const deviceFingerprint = `0x${navigator.userAgent.slice(0, 64).split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(64, '0')}` as `0x${string}`;

    // Convert biometric data to hash (simplified)
    const biometricHash = useBiometric && biometricData
      ? `0x${biometricData.padEnd(64, '0')}` as `0x${string}`
      : undefined;

    await transfer({
      to: recipient as `0x${string}`,
      amount: parseEther(amount),
      biometricHash,
      geolocation: useGeolocation ? geolocation : undefined,
      deviceFingerprint,
    });

    // Reset form on success
    if (isSuccess) {
      setRecipient('');
      setAmount('');
      setBiometricData('');
      setGeolocation('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Transferência Segura</h2>

      {!address ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
          <p className="text-yellow-800 dark:text-yellow-200">⚠️ Conecte sua carteira para realizar transferências</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destinatário
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor (SOB)
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          {/* Security Options */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Opções de Segurança</h3>
            
            {/* Biometric */}
            <div className="mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBiometric}
                  onChange={(e) => setUseBiometric(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium">Verificação Biométrica</p>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Adiciona camada extra de segurança</p>
                </div>
              </label>
              {useBiometric && (
                <div className="mt-2 ml-8">
                  <input
                    type="text"
                    value={biometricData}
                    onChange={(e) => setBiometricData(e.target.value)}
                    placeholder="Hash da impressão digital"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-500">
                    Em produção: captura automática via WebAuthn
                  </p>
                </div>
              )}
            </div>

            {/* Geolocation */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGeolocation}
                  onChange={(e) => setUseGeolocation(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium">Verificação de Localização</p>
                  <p className="text-sm text-gray-600 dark:text-gray-500">Detecta transferências de locais suspeitos</p>
                </div>
              </label>
              {useGeolocation && (
                <div className="mt-2 ml-8">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={geolocation}
                      readOnly
                      placeholder="Clique para capturar"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={handleGeolocationCapture}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      📍 Capturar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 font-semibold text-lg"
            >
              {isPending ? 'Processando...' : '💰 Transferir'}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">❌ Erro: {error}</p>
            </div>
          )}
          {isSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">✅ Transferência realizada com sucesso!</p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">ℹ️ Segurança</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• A transferência será analisada em tempo real</li>
              <li>• Score de risco será calculado automaticamente</li>
              <li>• Transferências suspeitas podem ser bloqueadas</li>
              <li>• Dispositivo e padrões de uso são verificados</li>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
}
