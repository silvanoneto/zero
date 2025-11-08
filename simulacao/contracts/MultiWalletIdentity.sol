// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ISovereignInterfaces.sol";

/**
 * @title MultiWalletIdentity
 * @notice Sistema de recuperação multi-carteira para identidades soberanas
 * @dev Permite que um cidadão vincule múltiplas carteiras à mesma identidade
 * 
 * PROBLEMA RESOLVIDO:
 * - Perda de acesso à carteira principal = perda permanente de identidade
 * - Sem recuperação, cidadão perde toda participação/SOB
 * - Dependência de uma única chave privada é arriscado
 * 
 * SOLUÇÃO:
 * - Vincular até 5 carteiras diferentes à mesma identidade
 * - Qualquer carteira vinculada pode acessar a identidade
 * - Processo de vinculação com período de espera (segurança)
 * - Desvinculação requer confirmação de múltiplas carteiras
 * - Sistema de recuperação social (guardiões)
 * 
 * CASOS DE USO:
 * 1. Carteira principal (Metamask no PC)
 * 2. Carteira mobile (Trust Wallet no celular)
 * 3. Carteira hardware (Ledger)
 * 4. Carteira de recuperação (papel/cold storage)
 * 5. Carteira emergencial (com família/confiança)
 */
contract MultiWalletIdentity is AccessControl, Pausable {
    using ECDSA for bytes32;
    
    // ============ ROLES ============
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Máximo de carteiras por identidade
    uint256 public constant MAX_WALLETS_PER_IDENTITY = 5;
    
    /// @notice Período de espera para adicionar nova carteira (7 dias)
    uint256 public constant WALLET_ADDITION_DELAY = 7 days;
    
    /// @notice Período de espera para remover carteira (3 dias)
    uint256 public constant WALLET_REMOVAL_DELAY = 3 days;
    
    /// @notice Número mínimo de guardiões
    uint256 public constant MIN_GUARDIANS = 3;
    
    /// @notice Quórum de guardiões para recuperação (2 de 3)
    uint256 public constant GUARDIAN_QUORUM = 2;
    
    // ============ ENUMS ============
    
    enum WalletStatus {
        Active,         // Ativa e válida
        Pending,        // Aguardando período de espera
        Removing,       // Em processo de remoção
        Removed         // Removida
    }
    
    enum RequestType {
        AddWallet,      // Adicionar carteira
        RemoveWallet,   // Remover carteira
        RecoverIdentity // Recuperar identidade
    }
    
    // ============ STRUCTS ============
    
    /// @notice Carteira vinculada
    struct LinkedWallet {
        address wallet;
        WalletStatus status;
        uint256 addedAt;
        uint256 lastUsed;
        string label;           // "PC Metamask", "Mobile Trust", etc
        bool isPrimary;         // Carteira principal
    }
    
    /// @notice Solicitação pendente
    struct PendingRequest {
        RequestType requestType;
        address initiator;
        address targetWallet;
        uint256 requestedAt;
        uint256 executesAt;
        bool executed;
        bool cancelled;
    }
    
    /// @notice Guardião de recuperação
    struct Guardian {
        address guardian;
        bool isActive;
        uint256 addedAt;
    }
    
    /// @notice Identidade do cidadão
    struct Identity {
        bytes32 identityId;         // ID único da identidade
        address[] wallets;          // Lista de carteiras
        mapping(address => LinkedWallet) walletData;
        Guardian[] guardians;       // Guardiões para recuperação social
        uint256 createdAt;
        bool isActive;
        PendingRequest[] pendingRequests;
    }
    
    /// @notice Voto de guardião para recuperação
    struct GuardianVote {
        address guardian;
        bool approved;
        uint256 votedAt;
    }
    
    /// @notice Processo de recuperação
    struct RecoveryProcess {
        bytes32 identityId;
        address newWallet;
        address initiator;
        GuardianVote[] votes;
        uint256 startedAt;
        uint256 expiresAt;
        bool executed;
        bool cancelled;
    }
    
    // ============ STATE ============
    
    /// @notice Mapeamento de identidades por ID
    mapping(bytes32 => Identity) public identities;
    
    /// @notice Mapeamento de carteira para ID de identidade
    mapping(address => bytes32) public walletToIdentity;
    
    /// @notice Processos de recuperação ativos
    mapping(bytes32 => RecoveryProcess) public recoveryProcesses;
    
    /// @notice Total de identidades criadas
    uint256 public totalIdentities;
    
    /// @notice Referência ao contrato SovereignCurrency (opcional)
    address public sovereignCurrency;

    
    // ============ EVENTS ============
    
    event IdentityCreated(
        bytes32 indexed identityId,
        address indexed primaryWallet,
        uint256 timestamp
    );
    
    event WalletAdditionRequested(
        bytes32 indexed identityId,
        address indexed wallet,
        uint256 executesAt
    );
    
    event WalletAdded(
        bytes32 indexed identityId,
        address indexed wallet,
        string label
    );
    
    event WalletRemovalRequested(
        bytes32 indexed identityId,
        address indexed wallet,
        uint256 executesAt
    );
    
    event WalletRemoved(
        bytes32 indexed identityId,
        address indexed wallet
    );
    
    event PrimaryWalletChanged(
        bytes32 indexed identityId,
        address indexed oldPrimary,
        address indexed newPrimary
    );
    
    event GuardianAdded(
        bytes32 indexed identityId,
        address indexed guardian
    );
    
    event GuardianRemoved(
        bytes32 indexed identityId,
        address indexed guardian
    );
    
    event RecoveryInitiated(
        bytes32 indexed identityId,
        address indexed newWallet,
        uint256 expiresAt
    );
    
    event GuardianVoted(
        bytes32 indexed identityId,
        address indexed guardian,
        bool approved
    );
    
    event RecoveryCompleted(
        bytes32 indexed identityId,
        address indexed newWallet
    );
    
    event RecoveryCancelled(
        bytes32 indexed identityId
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyIdentityOwner(bytes32 identityId) {
        require(
            walletToIdentity[msg.sender] == identityId,
            "Not identity owner"
        );
        _;
    }
    
    modifier validWallet(address wallet) {
        require(wallet != address(0), "Invalid wallet");
        require(walletToIdentity[wallet] == bytes32(0), "Wallet already linked");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Cria nova identidade com carteira inicial
     * @param primaryWallet Carteira principal
     * @param label Label da carteira
     */
    function createIdentity(
        address primaryWallet,
        string memory label
    )
        external
        onlyRole(VALIDATOR_ROLE)
        validWallet(primaryWallet)
        whenNotPaused
        returns (bytes32)
    {
        // Gerar ID único
        bytes32 identityId = keccak256(abi.encodePacked(
            primaryWallet,
            block.timestamp,
            totalIdentities
        ));
        
        Identity storage identity = identities[identityId];
        identity.identityId = identityId;
        identity.createdAt = block.timestamp;
        identity.isActive = true;
        
        // Adicionar carteira primária
        identity.wallets.push(primaryWallet);
        identity.walletData[primaryWallet] = LinkedWallet({
            wallet: primaryWallet,
            status: WalletStatus.Active,
            addedAt: block.timestamp,
            lastUsed: block.timestamp,
            label: label,
            isPrimary: true
        });
        
        walletToIdentity[primaryWallet] = identityId;
        totalIdentities++;
        
        emit IdentityCreated(identityId, primaryWallet, block.timestamp);
        
        return identityId;
    }
    
    /**
     * @notice Solicita adição de nova carteira
     * @param newWallet Endereço da nova carteira
     * @param label Label da carteira
     */
    function requestAddWallet(
        address newWallet,
        string memory label
    )
        external
        validWallet(newWallet)
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        require(identity.wallets.length < MAX_WALLETS_PER_IDENTITY, "Max wallets reached");
        
        uint256 executesAt = block.timestamp + WALLET_ADDITION_DELAY;
        
        // Criar solicitação pendente
        identity.pendingRequests.push(PendingRequest({
            requestType: RequestType.AddWallet,
            initiator: msg.sender,
            targetWallet: newWallet,
            requestedAt: block.timestamp,
            executesAt: executesAt,
            executed: false,
            cancelled: false
        }));
        
        // Adicionar carteira como pendente
        identity.wallets.push(newWallet);
        identity.walletData[newWallet] = LinkedWallet({
            wallet: newWallet,
            status: WalletStatus.Pending,
            addedAt: block.timestamp,
            lastUsed: 0,
            label: label,
            isPrimary: false
        });
        
        emit WalletAdditionRequested(identityId, newWallet, executesAt);
    }
    
    /**
     * @notice Executa adição de carteira após período de espera
     * @param newWallet Endereço da carteira a adicionar
     */
    function executeAddWallet(address newWallet)
        external
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        LinkedWallet storage wallet = identity.walletData[newWallet];
        
        require(wallet.status == WalletStatus.Pending, "Wallet not pending");
        require(
            block.timestamp >= wallet.addedAt + WALLET_ADDITION_DELAY,
            "Delay period not passed"
        );
        
        // Ativar carteira
        wallet.status = WalletStatus.Active;
        walletToIdentity[newWallet] = identityId;
        
        // INTEGRAÇÃO: Vincular nova wallet à identidade no SovereignCurrency
        if (sovereignCurrency != address(0)) {
            ISovereignCurrency(sovereignCurrency).linkWalletToIdentity(newWallet, identityId);
        }
        
        emit WalletAdded(identityId, newWallet, wallet.label);
    }
    
    /**
     * @notice Solicita remoção de carteira
     * @param walletToRemove Endereço da carteira a remover
     */
    function requestRemoveWallet(address walletToRemove)
        external
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        LinkedWallet storage wallet = identity.walletData[walletToRemove];
        
        require(wallet.status == WalletStatus.Active, "Wallet not active");
        require(!wallet.isPrimary, "Cannot remove primary wallet");
        require(
            _countActiveWallets(identity) > 1,
            "Cannot remove last wallet"
        );
        
        uint256 executesAt = block.timestamp + WALLET_REMOVAL_DELAY;
        
        wallet.status = WalletStatus.Removing;
        
        identity.pendingRequests.push(PendingRequest({
            requestType: RequestType.RemoveWallet,
            initiator: msg.sender,
            targetWallet: walletToRemove,
            requestedAt: block.timestamp,
            executesAt: executesAt,
            executed: false,
            cancelled: false
        }));
        
        emit WalletRemovalRequested(identityId, walletToRemove, executesAt);
    }
    
    /**
     * @notice Executa remoção de carteira após período
     * @param walletToRemove Endereço da carteira a remover
     */
    function executeRemoveWallet(address walletToRemove)
        external
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        LinkedWallet storage wallet = identity.walletData[walletToRemove];
        
        require(wallet.status == WalletStatus.Removing, "Wallet not removing");
        
        // Verificar se passou período
        bool canRemove = false;
        for (uint i = 0; i < identity.pendingRequests.length; i++) {
            PendingRequest storage req = identity.pendingRequests[i];
            if (
                req.requestType == RequestType.RemoveWallet &&
                req.targetWallet == walletToRemove &&
                !req.executed &&
                !req.cancelled &&
                block.timestamp >= req.executesAt
            ) {
                req.executed = true;
                canRemove = true;
                break;
            }
        }
        
        require(canRemove, "Cannot remove yet");
        
        wallet.status = WalletStatus.Removed;
        delete walletToIdentity[walletToRemove];
        
        emit WalletRemoved(identityId, walletToRemove);
    }
    
    /**
     * @notice Altera carteira primária
     * @param newPrimary Nova carteira primária
     */
    function changePrimaryWallet(address newPrimary)
        external
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        LinkedWallet storage newWallet = identity.walletData[newPrimary];
        
        require(newWallet.status == WalletStatus.Active, "Wallet not active");
        require(!newWallet.isPrimary, "Already primary");
        
        // Encontrar carteira primária atual
        address oldPrimary;
        for (uint i = 0; i < identity.wallets.length; i++) {
            address wallet = identity.wallets[i];
            if (identity.walletData[wallet].isPrimary) {
                identity.walletData[wallet].isPrimary = false;
                oldPrimary = wallet;
                break;
            }
        }
        
        newWallet.isPrimary = true;
        
        emit PrimaryWalletChanged(identityId, oldPrimary, newPrimary);
    }
    
    /**
     * @notice Adiciona guardião para recuperação social
     * @param guardian Endereço do guardião
     */
    function addGuardian(address guardian)
        external
        whenNotPaused
    {
        require(guardian != address(0), "Invalid guardian");
        require(guardian != msg.sender, "Cannot be self");
        
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        
        // Verificar se já é guardião
        for (uint i = 0; i < identity.guardians.length; i++) {
            require(
                identity.guardians[i].guardian != guardian,
                "Already guardian"
            );
        }
        
        identity.guardians.push(Guardian({
            guardian: guardian,
            isActive: true,
            addedAt: block.timestamp
        }));
        
        emit GuardianAdded(identityId, guardian);
    }
    
    /**
     * @notice Remove guardião
     * @param guardian Endereço do guardião
     */
    function removeGuardian(address guardian)
        external
        whenNotPaused
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        Identity storage identity = identities[identityId];
        
        for (uint i = 0; i < identity.guardians.length; i++) {
            if (identity.guardians[i].guardian == guardian) {
                identity.guardians[i].isActive = false;
                emit GuardianRemoved(identityId, guardian);
                return;
            }
        }
        
        revert("Guardian not found");
    }
    
    /**
     * @notice Inicia processo de recuperação social
     * @param identityId ID da identidade a recuperar
     * @param newWallet Nova carteira para recuperação
     */
    function initiateRecovery(
        bytes32 identityId,
        address newWallet
    )
        external
        validWallet(newWallet)
        whenNotPaused
    {
        Identity storage identity = identities[identityId];
        require(identity.isActive, "Identity not active");
        require(identity.guardians.length >= MIN_GUARDIANS, "Not enough guardians");
        
        // Verificar se é guardião
        bool isGuardian = false;
        for (uint i = 0; i < identity.guardians.length; i++) {
            if (identity.guardians[i].guardian == msg.sender && identity.guardians[i].isActive) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a guardian");
        
        // Verificar se não tem processo ativo
        RecoveryProcess storage process = recoveryProcesses[identityId];
        require(!process.executed && process.expiresAt < block.timestamp, "Recovery in progress");
        
        // Criar novo processo
        delete recoveryProcesses[identityId];
        process = recoveryProcesses[identityId];
        process.identityId = identityId;
        process.newWallet = newWallet;
        process.initiator = msg.sender;
        process.startedAt = block.timestamp;
        process.expiresAt = block.timestamp + 7 days;
        process.executed = false;
        process.cancelled = false;
        
        // Primeiro voto (do iniciador)
        process.votes.push(GuardianVote({
            guardian: msg.sender,
            approved: true,
            votedAt: block.timestamp
        }));
        
        emit RecoveryInitiated(identityId, newWallet, process.expiresAt);
        emit GuardianVoted(identityId, msg.sender, true);
    }
    
    /**
     * @notice Guardião vota no processo de recuperação
     * @param identityId ID da identidade
     * @param approve Aprovar ou rejeitar
     */
    function voteRecovery(bytes32 identityId, bool approve)
        external
        whenNotPaused
    {
        Identity storage identity = identities[identityId];
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(process.startedAt > 0, "No recovery process");
        require(!process.executed, "Already executed");
        require(!process.cancelled, "Process cancelled");
        require(block.timestamp < process.expiresAt, "Process expired");
        
        // Verificar se é guardião
        bool isGuardian = false;
        for (uint i = 0; i < identity.guardians.length; i++) {
            if (identity.guardians[i].guardian == msg.sender && identity.guardians[i].isActive) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a guardian");
        
        // Verificar se já votou
        for (uint i = 0; i < process.votes.length; i++) {
            require(process.votes[i].guardian != msg.sender, "Already voted");
        }
        
        process.votes.push(GuardianVote({
            guardian: msg.sender,
            approved: approve,
            votedAt: block.timestamp
        }));
        
        emit GuardianVoted(identityId, msg.sender, approve);
    }
    
    /**
     * @notice Executa recuperação se quórum alcançado
     * @param identityId ID da identidade
     */
    function executeRecovery(bytes32 identityId)
        external
        whenNotPaused
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        Identity storage identity = identities[identityId];
        
        require(process.startedAt > 0, "No recovery process");
        require(!process.executed, "Already executed");
        require(!process.cancelled, "Process cancelled");
        require(block.timestamp < process.expiresAt, "Process expired");
        
        // Contar votos aprovados
        uint256 approvals = 0;
        for (uint i = 0; i < process.votes.length; i++) {
            if (process.votes[i].approved) {
                approvals++;
            }
        }
        
        require(approvals >= GUARDIAN_QUORUM, "Quorum not reached");
        
        // Adicionar nova carteira como primária
        identity.wallets.push(process.newWallet);
        identity.walletData[process.newWallet] = LinkedWallet({
            wallet: process.newWallet,
            status: WalletStatus.Active,
            addedAt: block.timestamp,
            lastUsed: block.timestamp,
            label: "Recovered Wallet",
            isPrimary: true
        });
        
        // Desativar carteira primária antiga
        for (uint i = 0; i < identity.wallets.length; i++) {
            address wallet = identity.wallets[i];
            if (identity.walletData[wallet].isPrimary && wallet != process.newWallet) {
                identity.walletData[wallet].isPrimary = false;
            }
        }
        
        walletToIdentity[process.newWallet] = identityId;
        process.executed = true;
        
        emit RecoveryCompleted(identityId, process.newWallet);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna ID da identidade de uma carteira
     * @param wallet Endereço da carteira
     */
    function getIdentityId(address wallet) external view returns (bytes32) {
        return walletToIdentity[wallet];
    }
    
    /**
     * @notice Retorna carteiras de uma identidade
     * @param identityId ID da identidade
     */
    function getWallets(bytes32 identityId)
        external
        view
        returns (address[] memory)
    {
        return identities[identityId].wallets;
    }
    
    /**
     * @notice Retorna informações de uma carteira
     * @param identityId ID da identidade
     * @param wallet Endereço da carteira
     */
    function getWalletInfo(bytes32 identityId, address wallet)
        external
        view
        returns (
            WalletStatus status,
            uint256 addedAt,
            uint256 lastUsed,
            string memory label,
            bool isPrimary
        )
    {
        LinkedWallet storage w = identities[identityId].walletData[wallet];
        return (w.status, w.addedAt, w.lastUsed, w.label, w.isPrimary);
    }
    
    /**
     * @notice Retorna guardiões de uma identidade
     * @param identityId ID da identidade
     */
    function getGuardians(bytes32 identityId)
        external
        view
        returns (address[] memory)
    {
        Identity storage identity = identities[identityId];
        uint256 activeCount = 0;
        
        for (uint i = 0; i < identity.guardians.length; i++) {
            if (identity.guardians[i].isActive) {
                activeCount++;
            }
        }
        
        address[] memory result = new address[](activeCount);
        uint256 index = 0;
        
        for (uint i = 0; i < identity.guardians.length; i++) {
            if (identity.guardians[i].isActive) {
                result[index] = identity.guardians[i].guardian;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @notice Verifica se uma carteira pode acessar uma identidade
     * @param wallet Endereço da carteira
     * @param identityId ID da identidade
     */
    function canAccess(address wallet, bytes32 identityId)
        external
        view
        returns (bool)
    {
        if (walletToIdentity[wallet] != identityId) {
            return false;
        }
        
        LinkedWallet storage w = identities[identityId].walletData[wallet];
        return w.status == WalletStatus.Active;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _countActiveWallets(Identity storage identity)
        internal
        view
        returns (uint256)
    {
        uint256 count = 0;
        for (uint i = 0; i < identity.wallets.length; i++) {
            if (identity.walletData[identity.wallets[i]].status == WalletStatus.Active) {
                count++;
            }
        }
        return count;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Define o endereço do contrato SovereignCurrency
     * @param _sovereignCurrency Endereço do contrato
     */
    function setSovereignCurrency(address _sovereignCurrency) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_sovereignCurrency != address(0), "Invalid address");
        sovereignCurrency = _sovereignCurrency;
    }
    
    /**
     * @notice Migra tokens SOB entre carteiras da mesma identidade
     * @param fromWallet Carteira de origem
     * @param toWallet Carteira de destino
     * @param amount Quantidade a migrar
     */
    function migrateTokens(
        address fromWallet,
        address toWallet,
        uint256 amount
    )
        external
        whenNotPaused
        returns (bool)
    {
        bytes32 identityId = walletToIdentity[msg.sender];
        require(identityId != bytes32(0), "No identity found");
        
        // Verificar se ambas as wallets pertencem à mesma identidade
        require(walletToIdentity[fromWallet] == identityId, "From wallet not owned");
        require(walletToIdentity[toWallet] == identityId, "To wallet not owned");
        
        // Verificar se ambas estão ativas
        Identity storage identity = identities[identityId];
        require(
            identity.walletData[fromWallet].status == WalletStatus.Active,
            "From wallet not active"
        );
        require(
            identity.walletData[toWallet].status == WalletStatus.Active,
            "To wallet not active"
        );
        
        // INTEGRAÇÃO: Migrar tokens no SovereignCurrency
        if (sovereignCurrency != address(0)) {
            return ISovereignCurrency(sovereignCurrency).migrateTokensBetweenWallets(
                fromWallet,
                toWallet,
                amount
            );
        }
        
        return false;
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
