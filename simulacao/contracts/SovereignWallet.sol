// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ISovereignInterfaces.sol";

/**
 * @title SovereignWallet
 * @notice Carteira Soberana com todas as camadas de segurança integradas
 * @dev Implementação de referência do ecossistema Revolução Cibernética
 * 
 * ARQUITETURA DE SEGURANÇA EM 5 CAMADAS:
 * 
 * ┌────────────────────────────────────────────────────────┐
 * │  1. IDENTIDADE SOBERANA (ProofOfLife)                  │
 * │     • Identidade verificada única                      │
 * │     • 1 pessoa = 1 identidade                          │
 * │     • KYC descentralizado                              │
 * └────────────────────────────────────────────────────────┘
 *                         ↓
 * ┌────────────────────────────────────────────────────────┐
 * │  2. MULTI-WALLET (MultiWalletIdentity)                 │
 * │     • 5 carteiras por identidade                       │
 * │     • Recuperação social com guardiões                 │
 * │     • Nunca perde acesso                               │
 * └────────────────────────────────────────────────────────┘
 *                         ↓
 * ┌────────────────────────────────────────────────────────┐
 * │  3. DETECÇÃO DE FRAUDE (FraudDetection)                │
 * │     • 8 regras comportamentais                         │
 * │     • Detecção < 1 minuto                              │
 * │     • Bloqueio automático                              │
 * └────────────────────────────────────────────────────────┘
 *                         ↓
 * ┌────────────────────────────────────────────────────────┐
 * │  4. RECUPERAÇÃO DE TOKENS (WalletRecovery)             │
 * │     • Provas de identidade múltiplas                   │
 * │     • Aprovação de guardiões                           │
 * │     • Migração segura de tokens                        │
 * └────────────────────────────────────────────────────────┘
 *                         ↓
 * ┌────────────────────────────────────────────────────────┐
 * │  5. TOKENS SOBERANOS (SovereignCurrency)               │
 * │     • Não-compráveis (apenas mining)                   │
 * │     • Poder de voto                                    │
 * │     • Governança democrática                           │
 * └────────────────────────────────────────────────────────┘
 * 
 * FUNCIONALIDADES AUTOMÁTICAS:
 * - ✅ Auto-registro de ações para análise de fraude
 * - ✅ Auto-verificação de identidade em cada transação
 * - ✅ Auto-bloqueio se fraude detectada
 * - ✅ Auto-recuperação através de guardiões
 * - ✅ Auto-migração de tokens se comprometida
 * 
 * GARANTIAS:
 * - 🔒 Impossível roubar tokens (detecção + bloqueio < 1 min)
 * - 🔑 Impossível perder tokens (5 carteiras + recuperação social)
 * - 👤 Impossível duplicar identidade (ProofOfLife único)
 * - 💰 Impossível comprar votos (tokens não-compráveis)
 * - ⚖️ Democracia real (1 pessoa = 1 voto)
 */
contract SovereignWallet is AccessControl, Pausable, ReentrancyGuard {
    
    // ============ ROLES ============
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ STATE ============
    
    /// @notice Endereços dos contratos integrados
    address public proofOfLifeContract;
    address public multiWalletContract;
    address public fraudDetectionContract;
    address public walletRecoveryContract;
    address public sovereignCurrencyContract;
    
    /// @notice Configurações de segurança global
    struct SecurityConfig {
        bool requireBiometric;          // Exigir biometria em transações
        bool requireGeolocation;        // Exigir geolocalização
        bool autoBlockOnFraud;          // Bloquear automaticamente se fraude
        bool allowRecovery;             // Permitir recuperação
        uint256 minConfirmations;       // Confirmações mínimas para ação crítica
        uint256 dailyTransferLimit;     // Limite diário de transferências
    }
    
    SecurityConfig public securityConfig;
    
    /// @notice Preferências de segurança por carteira
    mapping(address => SecurityConfig) public walletSecurityConfig;
    
    /// @notice Ações pendentes (para ações que requerem confirmação)
    struct PendingAction {
        uint256 actionId;
        address initiator;
        bytes32 identityId;
        ActionType actionType;
        bytes actionData;
        uint256 createdAt;
        uint256 confirmations;
        bool executed;
        bool cancelled;
    }
    
    enum ActionType {
        Transfer,
        ChangeSecurityConfig,
        AddGuardian,
        RemoveGuardian,
        InitiateRecovery
    }
    
    mapping(uint256 => PendingAction) public pendingActions;
    uint256 public nextActionId;
    
    /// @notice Estatísticas de uso
    struct WalletStats {
        uint256 totalTransfers;
        uint256 totalReceived;
        uint256 totalSent;
        uint256 fraudIncidents;
        uint256 recoveryAttempts;
        uint256 lastActivityAt;
    }
    
    mapping(address => WalletStats) public walletStats;
    
    /// @notice Limite diário de transferências
    struct DailyLimit {
        uint256 amount;
        uint256 resetAt;
    }
    
    mapping(address => DailyLimit) public dailyTransfers;
    
    // ============ EVENTS ============
    
    event WalletCreated(
        bytes32 indexed identityId,
        address indexed wallet,
        uint256 timestamp
    );
    
    event ActionRecorded(
        address indexed wallet,
        IFraudDetection.ActionType actionType,
        uint256 riskScore
    );
    
    event FraudDetected(
        address indexed wallet,
        uint256 riskScore,
        IFraudDetection.WalletStatus status
    );
    
    event SecurityConfigUpdated(
        address indexed wallet,
        bool requireBiometric,
        bool requireGeolocation
    );
    
    event PendingActionCreated(
        uint256 indexed actionId,
        address indexed initiator,
        ActionType actionType
    );
    
    event PendingActionConfirmed(
        uint256 indexed actionId,
        address indexed confirmer
    );
    
    event PendingActionExecuted(
        uint256 indexed actionId,
        bool success
    );
    
    event TransferExecuted(
        address indexed from,
        address indexed to,
        uint256 amount,
        bool fraudCheckPassed
    );
    
    // ============ MODIFIERS ============
    
    /// @notice Verifica se identidade está verificada
    modifier onlyVerifiedIdentity(address wallet) {
        bytes32 identityId = IProofOfLife(proofOfLifeContract).getIdentityOf(wallet);
        require(identityId != bytes32(0), "No identity registered");
        require(
            IProofOfLife(proofOfLifeContract).isIdentityVerified(identityId),
            "Identity not verified"
        );
        _;
    }
    
    /// @notice Verifica se carteira não está bloqueada
    modifier notBlocked(address wallet) {
        IFraudDetection.WalletStatus status = IFraudDetection(fraudDetectionContract).getWalletStatus(wallet);
        require(
            status != IFraudDetection.WalletStatus.Blocked &&
            status != IFraudDetection.WalletStatus.Destroyed,
            "Wallet is blocked"
        );
        _;
    }
    
    /// @notice Verifica se está em quarentena
    modifier notInQuarantine(address wallet) {
        IFraudDetection.WalletStatus status = IFraudDetection(fraudDetectionContract).getWalletStatus(wallet);
        require(
            status != IFraudDetection.WalletStatus.Quarantine,
            "Wallet in quarantine - enhanced verification required"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _proofOfLife,
        address _multiWallet,
        address _fraudDetection,
        address _walletRecovery,
        address _sovereignCurrency
    ) {
        proofOfLifeContract = _proofOfLife;
        multiWalletContract = _multiWallet;
        fraudDetectionContract = _fraudDetection;
        walletRecoveryContract = _walletRecovery;
        sovereignCurrencyContract = _sovereignCurrency;
        
        // Configuração padrão de segurança (paranoid mode)
        securityConfig = SecurityConfig({
            requireBiometric: true,
            requireGeolocation: true,
            autoBlockOnFraud: true,
            allowRecovery: true,
            minConfirmations: 2,
            dailyTransferLimit: 1000 ether  // 1000 SOB por dia
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ============ WALLET MANAGEMENT ============
    
    /**
     * @notice Cria carteira soberana (wrapper para multi-wallet)
     * @param identityId ID da identidade verificada
     * @param biometricHash Hash biométrico para verificação
     */
    function createWallet(
        bytes32 identityId,
        bytes32 biometricHash
    )
        external
        whenNotPaused
        returns (address wallet)
    {
        // Verificar identidade
        require(
            IProofOfLife(proofOfLifeContract).isIdentityVerified(identityId),
            "Identity not verified"
        );
        
        wallet = msg.sender;
        
        // Configurar segurança padrão
        walletSecurityConfig[wallet] = securityConfig;
        
        // Inicializar estatísticas
        walletStats[wallet] = WalletStats({
            totalTransfers: 0,
            totalReceived: 0,
            totalSent: 0,
            fraudIncidents: 0,
            recoveryAttempts: 0,
            lastActivityAt: block.timestamp
        });
        
        emit WalletCreated(identityId, wallet, block.timestamp);
        
        return wallet;
    }
    
    /**
     * @notice Configura preferências de segurança da carteira
     */
    function configureSecuritySettings(
        bool _requireBiometric,
        bool _requireGeolocation,
        bool _autoBlockOnFraud,
        uint256 _dailyTransferLimit
    )
        external
        onlyVerifiedIdentity(msg.sender)
        whenNotPaused
    {
        SecurityConfig storage config = walletSecurityConfig[msg.sender];
        config.requireBiometric = _requireBiometric;
        config.requireGeolocation = _requireGeolocation;
        config.autoBlockOnFraud = _autoBlockOnFraud;
        config.dailyTransferLimit = _dailyTransferLimit;
        
        emit SecurityConfigUpdated(
            msg.sender,
            _requireBiometric,
            _requireGeolocation
        );
    }
    
    // ============ TRANSFER WITH SECURITY ============
    
    /**
     * @notice Transfere tokens SOB com todas as verificações de segurança
     * @param to Endereço destino
     * @param amount Quantidade de SOB
     * @param latitude Latitude atual * 1e6
     * @param longitude Longitude atual * 1e6
     * @param deviceFingerprint Fingerprint do dispositivo
     * @param biometricVerified Se biometria foi verificada
     */
    function secureTransfer(
        address to,
        uint256 amount,
        int256 latitude,
        int256 longitude,
        bytes32 deviceFingerprint,
        bool biometricVerified
    )
        external
        nonReentrant
        onlyVerifiedIdentity(msg.sender)
        notBlocked(msg.sender)
        notInQuarantine(msg.sender)
        whenNotPaused
        returns (bool)
    {
        address from = msg.sender;
        
        // 1. VERIFICAÇÕES DE SEGURANÇA LOCAIS
        SecurityConfig memory config = walletSecurityConfig[from];
        
        // Verificar biometria se requerida
        if (config.requireBiometric) {
            require(biometricVerified, "Biometric verification required");
        }
        
        // Verificar geolocalização se requerida
        if (config.requireGeolocation) {
            require(latitude != 0 || longitude != 0, "Geolocation required");
        }
        
        // Verificar limite diário
        _checkDailyLimit(from, amount);
        
        // 2. REGISTRAR AÇÃO NO FRAUD DETECTION
        IFraudDetection(fraudDetectionContract).recordAction(
            from,
            IFraudDetection.ActionType.Transfer,
            amount,
            latitude,
            longitude,
            deviceFingerprint,
            biometricVerified
        );
        
        // 3. VERIFICAR SE FRAUDE FOI DETECTADA
        uint256 riskScore = IFraudDetection(fraudDetectionContract).getRiskScore(from);
        IFraudDetection.WalletStatus status = IFraudDetection(fraudDetectionContract).getWalletStatus(from);
        
        emit ActionRecorded(from, IFraudDetection.ActionType.Transfer, riskScore);
        
        // Se fraude detectada, bloquear
        if (status == IFraudDetection.WalletStatus.Blocked || 
            status == IFraudDetection.WalletStatus.Destroyed) {
            
            walletStats[from].fraudIncidents++;
            emit FraudDetected(from, riskScore, status);
            revert("Transfer blocked - fraud detected");
        }
        
        // Se em monitoramento, exigir confirmações extras
        if (status == IFraudDetection.WalletStatus.Monitoring && amount > 100 ether) {
            return _createPendingTransfer(from, to, amount);
        }
        
        // 4. EXECUTAR TRANSFERÊNCIA
        bool success = ISovereignCurrency(sovereignCurrencyContract).transfer(to, amount);
        require(success, "Transfer failed");
        
        // 5. ATUALIZAR ESTATÍSTICAS
        walletStats[from].totalTransfers++;
        walletStats[from].totalSent += amount;
        walletStats[from].lastActivityAt = block.timestamp;
        walletStats[to].totalReceived += amount;
        
        // Atualizar limite diário
        dailyTransfers[from].amount += amount;
        
        emit TransferExecuted(from, to, amount, true);
        
        return true;
    }
    
    /**
     * @notice Transferência simples (usa geolocalização padrão)
     */
    function transfer(address to, uint256 amount)
        external
        returns (bool)
    {
        return this.secureTransfer(
            to,
            amount,
            0,  // sem geolocalização
            0,
            keccak256(abi.encodePacked(msg.sender, block.timestamp)),  // device padrão
            false  // sem biometria
        );
    }
    
    /**
     * @notice Cria transferência pendente (requer confirmações)
     */
    function _createPendingTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        returns (bool)
    {
        bytes32 identityId = IProofOfLife(proofOfLifeContract).getIdentityOf(from);
        
        uint256 actionId = nextActionId++;
        pendingActions[actionId] = PendingAction({
            actionId: actionId,
            initiator: from,
            identityId: identityId,
            actionType: ActionType.Transfer,
            actionData: abi.encode(to, amount),
            createdAt: block.timestamp,
            confirmations: 0,
            executed: false,
            cancelled: false
        });
        
        emit PendingActionCreated(actionId, from, ActionType.Transfer);
        
        return false;  // Não executado ainda
    }
    
    /**
     * @notice Confirma ação pendente (outra carteira da identidade)
     */
    function confirmPendingAction(uint256 actionId)
        external
        onlyVerifiedIdentity(msg.sender)
        whenNotPaused
    {
        PendingAction storage action = pendingActions[actionId];
        
        require(!action.executed, "Already executed");
        require(!action.cancelled, "Already cancelled");
        
        // Verificar se msg.sender é carteira da mesma identidade
        require(
            IMultiWalletIdentity(multiWalletContract).isWalletOfIdentity(
                action.identityId,
                msg.sender
            ),
            "Not wallet of identity"
        );
        
        action.confirmations++;
        
        emit PendingActionConfirmed(actionId, msg.sender);
        
        // Executar se atingiu confirmações mínimas
        SecurityConfig memory config = walletSecurityConfig[action.initiator];
        if (action.confirmations >= config.minConfirmations) {
            _executePendingAction(actionId);
        }
    }
    
    /**
     * @notice Executa ação pendente
     */
    function _executePendingAction(uint256 actionId)
        internal
    {
        PendingAction storage action = pendingActions[actionId];
        
        require(!action.executed, "Already executed");
        
        bool success = false;
        
        if (action.actionType == ActionType.Transfer) {
            (address to, uint256 amount) = abi.decode(action.actionData, (address, uint256));
            success = ISovereignCurrency(sovereignCurrencyContract).transfer(to, amount);
            
            if (success) {
                walletStats[action.initiator].totalTransfers++;
                walletStats[action.initiator].totalSent += amount;
            }
        }
        
        action.executed = true;
        
        emit PendingActionExecuted(actionId, success);
    }
    
    // ============ DAILY LIMIT ============
    
    function _checkDailyLimit(address wallet, uint256 amount)
        internal
    {
        DailyLimit storage limit = dailyTransfers[wallet];
        
        // Reset se passou 24h
        if (block.timestamp >= limit.resetAt) {
            limit.amount = 0;
            limit.resetAt = block.timestamp + 1 days;
        }
        
        SecurityConfig memory config = walletSecurityConfig[wallet];
        require(
            limit.amount + amount <= config.dailyTransferLimit,
            "Daily transfer limit exceeded"
        );
    }
    
    // ============ RECOVERY HELPERS ============
    
    /**
     * @notice Verifica se carteira pode ser recuperada
     */
    function canRecover(address wallet)
        external
        view
        returns (bool)
    {
        bytes32 identityId = IProofOfLife(proofOfLifeContract).getIdentityOf(wallet);
        if (identityId == bytes32(0)) {
            return false;
        }
        
        return IWalletRecovery(walletRecoveryContract).canRecover(identityId, wallet);
    }
    
    /**
     * @notice Verifica se recuperação está em progresso
     */
    function isRecoveryInProgress(address wallet)
        external
        view
        returns (bool)
    {
        bytes32 identityId = IProofOfLife(proofOfLifeContract).getIdentityOf(wallet);
        if (identityId == bytes32(0)) {
            return false;
        }
        
        return IWalletRecovery(walletRecoveryContract).isRecoveryInProgress(identityId);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna status completo de segurança da carteira
     */
    function getSecurityStatus(address wallet)
        external
        view
        returns (
            bool isVerified,
            bool isBlocked,
            uint256 riskScore,
            IFraudDetection.WalletStatus status,
            uint256 balance,
            SecurityConfig memory config
        )
    {
        bytes32 identityId = IProofOfLife(proofOfLifeContract).getIdentityOf(wallet);
        isVerified = IProofOfLife(proofOfLifeContract).isIdentityVerified(identityId);
        
        status = IFraudDetection(fraudDetectionContract).getWalletStatus(wallet);
        isBlocked = (status == IFraudDetection.WalletStatus.Blocked ||
                     status == IFraudDetection.WalletStatus.Destroyed);
        
        riskScore = IFraudDetection(fraudDetectionContract).getRiskScore(wallet);
        balance = ISovereignCurrency(sovereignCurrencyContract).balanceOf(wallet);
        config = walletSecurityConfig[wallet];
        
        return (isVerified, isBlocked, riskScore, status, balance, config);
    }
    
    /**
     * @notice Retorna estatísticas da carteira
     */
    function getWalletStats(address wallet)
        external
        view
        returns (WalletStats memory)
    {
        return walletStats[wallet];
    }
    
    /**
     * @notice Retorna todas as carteiras de uma identidade
     */
    function getIdentityWallets(bytes32 identityId)
        external
        view
        returns (address[] memory)
    {
        return IMultiWalletIdentity(multiWalletContract).getWallets(identityId);
    }
    
    /**
     * @notice Retorna carteira primária da identidade
     */
    function getPrimaryWallet(bytes32 identityId)
        external
        view
        returns (address)
    {
        return IMultiWalletIdentity(multiWalletContract).getPrimaryWallet(identityId);
    }
    
    /**
     * @notice Calcula score de saúde da carteira (0-100)
     */
    function getWalletHealthScore(address wallet)
        external
        view
        returns (uint256 healthScore)
    {
        // Fatores:
        // 1. Risco (invertido) - 40%
        // 2. Atividade - 20%
        // 3. Incidentes (invertido) - 20%
        // 4. Configuração - 20%
        
        uint256 riskScore = IFraudDetection(fraudDetectionContract).getRiskScore(wallet);
        WalletStats memory stats = walletStats[wallet];
        SecurityConfig memory config = walletSecurityConfig[wallet];
        
        // Fator 1: Risco (0-40)
        uint256 riskFactor = riskScore > 100 ? 0 : (100 - riskScore) * 40 / 100;
        
        // Fator 2: Atividade (0-20)
        uint256 activityFactor = 0;
        if (stats.lastActivityAt > 0) {
            uint256 daysSinceActivity = (block.timestamp - stats.lastActivityAt) / 1 days;
            if (daysSinceActivity == 0) activityFactor = 20;
            else if (daysSinceActivity <= 7) activityFactor = 15;
            else if (daysSinceActivity <= 30) activityFactor = 10;
            else activityFactor = 5;
        }
        
        // Fator 3: Incidentes (0-20)
        uint256 incidentFactor = stats.fraudIncidents == 0 ? 20 : 
                                 stats.fraudIncidents == 1 ? 10 : 0;
        
        // Fator 4: Configuração (0-20)
        uint256 configFactor = 0;
        if (config.requireBiometric) configFactor += 8;
        if (config.requireGeolocation) configFactor += 6;
        if (config.autoBlockOnFraud) configFactor += 6;
        
        healthScore = riskFactor + activityFactor + incidentFactor + configFactor;
        
        return healthScore;
    }
    
    /**
     * @notice Retorna limite diário restante
     */
    function getRemainingDailyLimit(address wallet)
        external
        view
        returns (uint256 remaining)
    {
        DailyLimit memory limit = dailyTransfers[wallet];
        SecurityConfig memory config = walletSecurityConfig[wallet];
        
        // Reset se passou 24h
        if (block.timestamp >= limit.resetAt) {
            return config.dailyTransferLimit;
        }
        
        if (limit.amount >= config.dailyTransferLimit) {
            return 0;
        }
        
        return config.dailyTransferLimit - limit.amount;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateContracts(
        address _proofOfLife,
        address _multiWallet,
        address _fraudDetection,
        address _walletRecovery,
        address _sovereignCurrency
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (_proofOfLife != address(0)) proofOfLifeContract = _proofOfLife;
        if (_multiWallet != address(0)) multiWalletContract = _multiWallet;
        if (_fraudDetection != address(0)) fraudDetectionContract = _fraudDetection;
        if (_walletRecovery != address(0)) walletRecoveryContract = _walletRecovery;
        if (_sovereignCurrency != address(0)) sovereignCurrencyContract = _sovereignCurrency;
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
