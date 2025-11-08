// ABI simplificada do contrato FederationVoting
// Contém apenas as funções necessárias para o frontend

export const FEDERATION_VOTING_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      {
        "components": [
          { "internalType": "bool", "name": "isProcedural", "type": "bool" },
          { "internalType": "bool", "name": "isResourceAllocation", "type": "bool" },
          { "internalType": "bool", "name": "isTechnical", "type": "bool" },
          { "internalType": "bool", "name": "isEthical", "type": "bool" },
          { "internalType": "uint256", "name": "budgetImpact", "type": "uint256" },
          { "internalType": "bool", "name": "requiresExpertise", "type": "bool" },
          { "internalType": "bytes32", "name": "expertDomain", "type": "bytes32" }
        ],
        "internalType": "struct FederationVoting.ProposalTags",
        "name": "tags",
        "type": "tuple"
      },
      { "internalType": "uint256", "name": "duration", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "internalType": "bool", "name": "support", "type": "bool" },
      { "internalType": "uint256", "name": "tokens", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" }
    ],
    "name": "getProposal",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint8", "name": "voteType", "type": "uint8" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "votesFor", "type": "uint256" },
      { "internalType": "uint256", "name": "votesAgainst", "type": "uint256" },
      { "internalType": "uint8", "name": "state", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "voteType", "type": "uint8" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "support", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "weight", "type": "uint256" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
] as const;

// ABI do SovereignWallet - Contrato de integração de segurança
export const SOVEREIGN_WALLET_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "getSecurityStatus",
    "outputs": [
      { "internalType": "bool", "name": "isVerified", "type": "bool" },
      { "internalType": "bool", "name": "isBlocked", "type": "bool" },
      { "internalType": "uint256", "name": "riskScore", "type": "uint256" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      {
        "components": [
          { "internalType": "bool", "name": "requireBiometric", "type": "bool" },
          { "internalType": "bool", "name": "requireGeolocation", "type": "bool" },
          { "internalType": "bool", "name": "autoBlockOnFraud", "type": "bool" },
          { "internalType": "bool", "name": "allowRecovery", "type": "bool" },
          { "internalType": "uint8", "name": "minConfirmations", "type": "uint8" },
          { "internalType": "uint256", "name": "dailyTransferLimit", "type": "uint256" }
        ],
        "internalType": "struct SovereignWallet.SecurityConfig",
        "name": "config",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "getWalletHealthScore",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "getWalletStats",
    "outputs": [
      { "internalType": "uint256", "name": "totalTransfers", "type": "uint256" },
      { "internalType": "uint256", "name": "totalReceived", "type": "uint256" },
      { "internalType": "uint256", "name": "totalSent", "type": "uint256" },
      { "internalType": "uint256", "name": "fraudIncidents", "type": "uint256" },
      { "internalType": "uint256", "name": "recoveryAttempts", "type": "uint256" },
      { "internalType": "uint256", "name": "lastActivityAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "getRemainingDailyLimit",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bytes32", "name": "biometricHash", "type": "bytes32" },
      { "internalType": "string", "name": "geolocation", "type": "string" },
      { "internalType": "bytes32", "name": "deviceFingerprint", "type": "bytes32" }
    ],
    "name": "secureTransfer",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "bool", "name": "requireBiometric", "type": "bool" },
          { "internalType": "bool", "name": "requireGeolocation", "type": "bool" },
          { "internalType": "bool", "name": "autoBlockOnFraud", "type": "bool" },
          { "internalType": "bool", "name": "allowRecovery", "type": "bool" },
          { "internalType": "uint8", "name": "minConfirmations", "type": "uint8" },
          { "internalType": "uint256", "name": "dailyTransferLimit", "type": "uint256" }
        ],
        "internalType": "struct SovereignWallet.SecurityConfig",
        "name": "newConfig",
        "type": "tuple"
      }
    ],
    "name": "configureSecuritySettings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "actionId", "type": "bytes32" }
    ],
    "name": "confirmPendingAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "riskScore", "type": "uint256" }
    ],
    "name": "SecureTransfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "riskScore", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "FraudDetected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "newStatus", "type": "uint8" }
    ],
    "name": "SecurityStatusChanged",
    "type": "event"
  }
] as const;
