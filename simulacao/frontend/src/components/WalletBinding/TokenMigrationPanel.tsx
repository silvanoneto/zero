import React, { useState } from 'react';
import { useWalletBinding } from '@/hooks/useWalletBinding';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { ArrowRight, Wallet, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAccount } from 'wagmi';

export function TokenMigrationPanel() {
  const { address } = useAccount();
  const { walletInfo, migrate, isLoading: isMigrating, error } = useWalletBinding();
  const { identity } = useMultiWallet(address);
  
  const [selectedToWallet, setSelectedToWallet] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const availableBalance = walletInfo ? parseFloat(walletInfo.balance) : 0;
  const linkedWallets = identity?.wallets || [];
  const canMigrate = linkedWallets && linkedWallets.length > 1;

  const handleMigrate = async () => {
    if (!selectedToWallet || !amount) {
      setLocalError('Please select a wallet and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setLocalError('Invalid amount');
      return;
    }

    if (amountNum > availableBalance) {
      setLocalError('Insufficient balance');
      return;
    }

    setLocalError(null);
    setTxHash(null);

    try {
      const hash = await migrate(selectedToWallet, amount);
      setTxHash(hash as string);
      setAmount('');
      setSelectedToWallet('');
    } catch (err: any) {
      setLocalError(err.message || 'Migration failed');
    }
  };

  if (!canMigrate) {
    return (
      <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 rounded-lg p-6 border border-gray-700 dark:border-gray-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Token Migration Not Available
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              You need at least 2 wallets to migrate tokens. Add a new wallet using the Multi-Wallet Manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const otherWallets = linkedWallets?.filter((w: string) => 
    w.toLowerCase() !== address?.toLowerCase()
  ) || [];

  return (
    <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 rounded-lg p-6 border border-gray-700 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Send className="w-6 h-6 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">
            Migrate Tokens Between Wallets
          </h3>
          <p className="text-sm text-gray-400">
            Safely move SOB tokens to another wallet in your identity
          </p>
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-gray-900 dark:bg-gray-950/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Available Balance</span>
          <span className="text-2xl font-bold text-white">
            {availableBalance.toFixed(2)} SOB
          </span>
        </div>
      </div>

      {/* Migration Form */}
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount to Migrate
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={availableBalance}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setAmount(availableBalance.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            >
              MAX
            </button>
          </div>
          {amount && (
            <p className="mt-1 text-xs text-gray-400">
              Remaining: {(availableBalance - parseFloat(amount || '0')).toFixed(2)} SOB
            </p>
          )}
        </div>

        {/* To Wallet Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination Wallet
          </label>
          <select
            value={selectedToWallet}
            onChange={(e) => setSelectedToWallet(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a wallet...</option>
            {otherWallets.map((wallet: string) => (
              <option key={wallet} value={wallet}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        {/* Migration Arrow Visual */}
        {address && selectedToWallet && (
          <div className="bg-gray-900 dark:bg-gray-950/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono text-gray-300">
                  {selectedToWallet.slice(0, 6)}...{selectedToWallet.slice(-4)}
                </span>
              </div>
            </div>
            {amount && (
              <div className="mt-3 text-center">
                <span className="text-lg font-bold text-white">
                  {parseFloat(amount).toFixed(2)} SOB
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {(error || localError) && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error || localError}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {txHash && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-300 mb-1">Migration successful!</p>
                <p className="text-xs text-gray-400 font-mono break-all">
                  Tx: {txHash}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Migrate Button */}
        <button
          onClick={handleMigrate}
          disabled={isMigrating || !amount || !selectedToWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-semibold text-white transition-colors flex items-center justify-center space-x-2"
        >
          {isMigrating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Migrating...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Migrate Tokens</span>
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-300">
            <p className="font-semibold mb-1">Safe Migration</p>
            <ul className="space-y-1 text-xs">
              <li>• Only works between wallets of the same identity</li>
              <li>• Original wallet reference is preserved</li>
              <li>• Tokens remain secure after migration</li>
              <li>• Transaction is atomic (all or nothing)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
