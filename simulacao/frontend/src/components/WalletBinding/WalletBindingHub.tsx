import React from 'react';
import { WalletBindingStatus } from './WalletBindingStatus';
import { TokenMigrationPanel } from './TokenMigrationPanel';
import { MultiWalletDashboard } from './MultiWalletDashboard';

export function WalletBindingHub() {
  return (
    <div className="space-y-6">
      {/* Security Status - Always visible */}
      <WalletBindingStatus />

      {/* Multi-Wallet Overview */}
      <MultiWalletDashboard />

      {/* Token Migration Interface */}
      <TokenMigrationPanel />
    </div>
  );
}
