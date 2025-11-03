import React from 'react';
import { useAccount } from 'wagmi';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletBinding } from '@/hooks/useWalletBinding';
import { Wallet, Star, CheckCircle, XCircle, AlertTriangle, Shield, Copy } from 'lucide-react';

interface WalletCardProps {
  address: string;
  isPrimary: boolean;
  isCurrent: boolean;
  identityId: string | null;
}

function WalletCard({ address, isPrimary, isCurrent, identityId }: WalletCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // For each wallet, we'd ideally fetch its balance and validation status
  // For now, we'll show a simplified version
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={`
      bg-gray-900 dark:bg-gray-950 rounded-lg p-4 border-2 transition-all
      ${isCurrent ? 'border-blue-500' : 'border-gray-700'}
      ${isPrimary ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-800' : ''}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Wallet className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-gray-400'}`} />
          {isPrimary && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isCurrent && (
            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
              Active
            </span>
          )}
          {isPrimary && (
            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded-full">
              Primary
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <code className="text-sm font-mono text-white">{shortAddress}</code>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Copy address"
        >
          <Copy className={`w-3 h-3 ${copied ? 'text-green-400' : 'text-gray-400'}`} />
        </button>
      </div>

      {identityId && (
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Shield className="w-3 h-3" />
          <span>Linked to Identity</span>
        </div>
      )}
    </div>
  );
}

export function MultiWalletDashboard() {
  const { address } = useAccount();
  const { identity, loading } = useMultiWallet(address);
  const { walletInfo, hasIdentity } = useWalletBinding();

  if (loading) {
    return (
      <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 rounded-lg p-6 border border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!identity || !identity.isActive) {
    return (
      <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 rounded-lg p-6 border border-gray-700 dark:border-gray-800">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              No Multi-Wallet Identity
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              You need to create a multi-wallet identity first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const walletCount = identity.wallets.length;
  const maxWallets = 5;

  return (
    <div className="bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 rounded-lg p-6 border border-gray-700 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wallet className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Your Wallets
            </h3>
            <p className="text-sm text-gray-400">
              {walletCount} of {maxWallets} wallets linked
            </p>
          </div>
        </div>
        {hasIdentity && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Secure</span>
          </div>
        )}
      </div>

      {/* Identity Info */}
      <div className="bg-gray-900 dark:bg-gray-950/50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Identity ID</span>
            <code className="text-sm font-mono text-white">
              {identity.identityId.slice(0, 10)}...{identity.identityId.slice(-8)}
            </code>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Primary Wallet</span>
            <code className="text-sm font-mono text-white">
              {identity.primaryWallet.slice(0, 6)}...{identity.primaryWallet.slice(-4)}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {identity.wallets.map((wallet: string) => (
          <WalletCard
            key={wallet}
            address={wallet}
            isPrimary={wallet.toLowerCase() === identity.primaryWallet.toLowerCase()}
            isCurrent={wallet.toLowerCase() === address?.toLowerCase()}
            identityId={hasIdentity ? identity.identityId : null}
          />
        ))}
      </div>

      {/* Current Balance Summary */}
      {walletInfo && (
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-300 mb-2">
                <span className="font-semibold">Current Wallet Balance:</span>{' '}
                {parseFloat(walletInfo.balance).toFixed(2)} SOB
              </p>
              <div className="flex items-center space-x-2">
                {walletInfo.isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-300">Tokens validated and secure</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-300">Validation issue: {walletInfo.validationReason}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Wallet Hint */}
      {walletCount < maxWallets && (
        <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            💡 You can add up to {maxWallets - walletCount} more wallet(s) to your identity using the Multi-Wallet Manager.
          </p>
        </div>
      )}
    </div>
  );
}
