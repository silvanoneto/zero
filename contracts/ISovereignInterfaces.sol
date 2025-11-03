// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title ISovereignInterfaces
 * @notice Interfaces para integração entre contratos do ecossistema
 */

interface IProofOfLife {
    function isIdentityVerified(bytes32 identityId) external view returns (bool);
    function getIdentityOf(address wallet) external view returns (bytes32);
}

interface IMultiWalletIdentity {
    function isWalletOfIdentity(bytes32 identityId, address wallet) external view returns (bool);
    function getPrimaryWallet(bytes32 identityId) external view returns (address);
    function getWallets(bytes32 identityId) external view returns (address[] memory);
}

interface IFraudDetection {
    enum ActionType { Transfer, Vote, AddWallet, RemoveWallet, ChangeProfile, Login }
    enum WalletStatus { Active, Monitoring, Quarantine, Blocked, Destroyed }
    
    function recordAction(
        address wallet,
        ActionType actionType,
        uint256 value,
        int256 latitude,
        int256 longitude,
        bytes32 deviceFingerprint,
        bool biometricVerified
    ) external;
    
    function getWalletStatus(address wallet) external view returns (WalletStatus);
    function getRiskScore(address wallet) external view returns (uint256);
}

interface IWalletRecovery {
    function canRecover(bytes32 identityId, address wallet) external view returns (bool);
    function isRecoveryInProgress(bytes32 identityId) external view returns (bool);
}

interface ISovereignCurrency {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    
    // Wallet-Token Binding Functions
    function linkWalletToIdentity(address wallet, bytes32 identityId) external;
    function migrateTokensBetweenWallets(address fromWallet, address toWallet, uint256 amount) external returns (bool);
    function validateWalletTokens(address wallet) external view returns (bool valid, string memory reason);
    function getWalletIdentity(address wallet) external view returns (bytes32);
}
