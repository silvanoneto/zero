// Endereços dos contratos deployados
// TODO: Atualizar com endereços reais após deploy

export const CONTRACT_ADDRESSES = {
  // Localhost / Hardhat
  31337: {
    FederationVoting: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Placeholder
    GovernanceToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Placeholder
    SovereignWallet: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Placeholder
    MultiWalletIdentity: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Placeholder
    FraudDetection: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', // Placeholder
    WalletRecovery: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', // Placeholder
    ProofOfLife: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // Placeholder
    SovereignCurrency: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853', // Placeholder
  },
  // Outras redes podem ser adicionadas aqui
} as const;

// Export individual addresses for convenience
export const SOVEREIGN_WALLET_ADDRESS = CONTRACT_ADDRESSES[31337].SovereignWallet as `0x${string}`;
export const MULTI_WALLET_ADDRESS = CONTRACT_ADDRESSES[31337].MultiWalletIdentity as `0x${string}`;
export const FRAUD_DETECTION_ADDRESS = CONTRACT_ADDRESSES[31337].FraudDetection as `0x${string}`;
export const WALLET_RECOVERY_ADDRESS = CONTRACT_ADDRESSES[31337].WalletRecovery as `0x${string}`;
export const PROOF_OF_LIFE_ADDRESS = CONTRACT_ADDRESSES[31337].ProofOfLife as `0x${string}`;
export const SOVEREIGN_CURRENCY_ADDRESS = CONTRACT_ADDRESSES[31337].SovereignCurrency as `0x${string}`;

export function getContractAddress(
  contractName: 'FederationVoting' | 'GovernanceToken' | 'SovereignWallet' | 'MultiWalletIdentity' | 'FraudDetection' | 'WalletRecovery' | 'ProofOfLife' | 'SovereignCurrency',
  chainId: number = 31337
): string {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return addresses[contractName];
}
