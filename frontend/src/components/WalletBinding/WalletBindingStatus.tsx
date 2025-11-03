import React from 'react';
import { useWalletBinding } from '@/hooks/useWalletBinding';
import { CheckCircle, XCircle, AlertTriangle, Shield, Key, RefreshCw } from 'lucide-react';

export function WalletBindingStatus() {
  const { walletInfo, isLoading, hasIdentity, isSecure, needsAttention, recentMigrations } = useWalletBinding();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading wallet security status...</span>
        </div>
      </div>
    );
  }

  if (!walletInfo) {
    return null;
  }

  const getStatusIcon = () => {
    if (needsAttention) {
      return <XCircle className="w-6 h-6 text-red-400" />;
    }
    if (isSecure) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
    return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
  };

  const getStatusColor = () => {
    if (needsAttention) return 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
    if (isSecure) return 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
    return 'border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
  };

  const getStatusText = () => {
    if (!hasIdentity) return 'No identity linked';
    if (needsAttention) return 'Security issue detected';
    if (isSecure && walletInfo.isMigrated) return 'Secure (Migrated)';
    if (isSecure && walletInfo.isOriginal) return 'Secure (Original)';
    return 'Checking...';
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <div className={`rounded-lg p-6 border-2 ${getStatusColor()}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Wallet Security Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{getStatusText()}</p>
            </div>
          </div>
          <Shield className="w-8 h-8 text-gray-400 dark:text-gray-600" />
        </div>

        {/* Wallet Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Balance Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">SOB Balance</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {parseFloat(walletInfo.balance).toFixed(2)} SOB
            </p>
            {walletInfo.balance !== walletInfo.rawBalance && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Raw: {parseFloat(walletInfo.rawBalance).toFixed(2)} SOB
              </p>
            )}
          </div>

          {/* Wallet Type */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Wallet Type</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {walletInfo.isOriginal && 'Original Wallet'}
              {walletInfo.isMigrated && 'Migrated Wallet'}
              {!walletInfo.isOriginal && !walletInfo.isMigrated && 'New Wallet'}
            </p>
            {walletInfo.isMigrated && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                From: {walletInfo.originalWallet.slice(0, 6)}...{walletInfo.originalWallet.slice(-4)}
              </p>
            )}
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Validation Status:</span>
            <span className={`text-sm font-medium ${
              walletInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {walletInfo.validationReason}
            </span>
          </div>
        </div>

        {/* Identity Info */}
        {hasIdentity && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Identity ID:</span>
              <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                {walletInfo.identityId.slice(0, 10)}...{walletInfo.identityId.slice(-8)}
              </span>
            </div>
          </div>
        )}

        {/* Warning if not secure */}
        {needsAttention && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-500/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  Security Alert
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {walletInfo.validationReason}
                </p>
                <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Initiate Recovery
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Migrations */}
      {recentMigrations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <span>Recent Token Migrations</span>
          </h4>
          <div className="space-y-3">
            {recentMigrations.map((migration, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-950/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {parseFloat(migration.amount).toFixed(2)} SOB
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-mono">
                    {migration.fromWallet.slice(0, 6)}...{migration.fromWallet.slice(-4)}
                  </span>
                  <span>→</span>
                  <span className="font-mono">
                    {migration.toWallet.slice(0, 6)}...{migration.toWallet.slice(-4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Wallet Binding:</strong> Your SOB tokens are bound to your identity, not your wallet. 
              This prevents theft - stolen tokens are automatically destroyed. You can safely use up to 5 wallets 
              and migrate tokens between them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
