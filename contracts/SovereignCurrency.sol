// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title SovereignCurrency (SOBERANA - SOB)
 * @notice Moeda interna não-transferível baseada em Proof of Participation
 * @dev Soulbound token que não pode ser comprado, apenas ganho por contribuição
 * 
 * PROBLEMA RESOLVIDO:
 * - Carteiras grandes de ETH não podem dominar votação
 * - Moeda só pode ser ganha dentro do sistema
 * - Agnóstica de blockchain (funciona off-chain também)
 * - Pode ser armazenada em qualquer dispositivo
 * 
 * CARACTERÍSTICAS:
 * - Não-transferível (soulbound)
 * - Distribuída por participação/contribuição
 * - Sistema de checkpoints para votação
 * - Pode ser exportada/importada entre dispositivos
 * - Funciona com ou sem blockchain
 * 
 * SUPPLY:
 * - Não tem supply fixo
 * - Gerada dinamicamente por atividades
 * - Pode decair por inatividade
 * - 1 SOB = 1 ponto de participação
 */
contract SovereignCurrency is AccessControl, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ ROLES ============
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ STRUCTS ============
    
    /// @notice Checkpoint para histórico de saldo
    struct Checkpoint {
        uint256 timestamp;
        uint256 balance;
    }
    
    /// @notice Atividade que gera moeda
    struct Activity {
        string activityType;    // "proposal", "vote", "contribution", "validation"
        uint256 reward;         // SOB gerados
        uint256 timestamp;
        bytes32 proofHash;      // Hash da prova off-chain
    }
    
    /// @notice Estado do cidadão
    struct CitizenState {
        uint256 balance;                    // Saldo atual
        uint256 totalEarned;                // Total ganho histórico
        uint256 lastActivity;               // Timestamp última atividade
        bool isActive;                      // Status ativo
        address originalWallet;             // Carteira que gerou o token (vínculo permanente)
        Checkpoint[] checkpoints;           // Histórico de saldos
        Activity[] activities;              // Histórico de atividades
    }
    
    // ============ STATE ============
    
    /// @notice Mapeamento de saldos dos cidadãos
    mapping(address => CitizenState) public citizens;
    
    /// @notice Rastreamento de tokens por identidade (ProofOfLife)
    /// @dev identityId => (wallet => balance vinculado)
    mapping(bytes32 => mapping(address => uint256)) public identityTokens;
    
    /// @notice Mapeamento de identidade por carteira
    mapping(address => bytes32) public walletIdentity;
    
    /// @notice Lista de todos os cidadãos
    address[] public citizenList;
    
    /// @notice Total de moeda em circulação
    uint256 public totalSupply;
    
    /// @notice Período de decaimento por inatividade (90 dias)
    uint256 public constant DECAY_PERIOD = 90 days;
    
    /// @notice Taxa de decaimento (1% por mês de inatividade)
    uint256 public constant DECAY_RATE = 1; // 1%
    
    /// @notice Recompensas por tipo de atividade
    mapping(string => uint256) public activityRewards;
    
    // ============ EVENTS ============
    
    event CurrencyEarned(
        address indexed citizen,
        uint256 amount,
        string activityType,
        bytes32 proofHash
    );
    
    event CurrencyDecayed(
        address indexed citizen,
        uint256 amount,
        uint256 inactiveDays
    );
    
    event CheckpointCreated(
        address indexed citizen,
        uint256 timestamp,
        uint256 balance
    );
    
    event ActivityRewardUpdated(
        string activityType,
        uint256 oldReward,
        uint256 newReward
    );
    
    event CitizenActivated(address indexed citizen);
    event CitizenDeactivated(address indexed citizen);
    
    event TokensBound(
        address indexed wallet,
        bytes32 indexed identityId,
        uint256 amount
    );
    
    event TokensDestroyed(
        address indexed violator,
        address indexed originalWallet,
        uint256 amount,
        string reason
    );
    
    event WalletIdentityLinked(
        address indexed wallet,
        bytes32 indexed identityId
    );
    
    event TokensMigrated(
        address indexed fromWallet,
        address indexed toWallet,
        uint256 amount,
        bytes32 indexed identityId
    );
    
    event OriginalWalletUpdated(
        address indexed wallet,
        address oldOriginal,
        address newOriginal
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Configurar recompensas padrão
        activityRewards["proposal"] = 100;      // Criar proposta
        activityRewards["vote"] = 10;           // Votar
        activityRewards["validation"] = 50;     // Validar contribuição
        activityRewards["contribution"] = 200;  // Contribuição aceita
        activityRewards["review"] = 30;         // Revisar código
        activityRewards["documentation"] = 40;  // Documentar
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Registra nova atividade e distribui recompensa
     * @param citizen Endereço do cidadão
     * @param activityType Tipo de atividade
     * @param proofHash Hash da prova off-chain (IPFS CID, etc)
     */
    function earnCurrency(
        address citizen,
        string memory activityType,
        bytes32 proofHash
    ) 
        external 
        onlyRole(VALIDATOR_ROLE) 
        whenNotPaused 
    {
        require(citizen != address(0), "Invalid address");
        require(activityRewards[activityType] > 0, "Unknown activity type");
        
        uint256 reward = activityRewards[activityType];
        CitizenState storage state = citizens[citizen];
        
        // Primeira atividade - registrar cidadão e vincular carteira
        if (!state.isActive) {
            citizenList.push(citizen);
            state.isActive = true;
            state.originalWallet = citizen; // Vincula permanentemente à carteira original
            emit CitizenActivated(citizen);
        }
        
        // Aplicar decaimento antes de adicionar nova recompensa
        _applyDecay(citizen);
        
        // Adicionar recompensa
        state.balance += reward;
        state.totalEarned += reward;
        state.lastActivity = block.timestamp;
        totalSupply += reward;
        
        // Se identidade está vinculada, registrar tokens para essa identidade
        bytes32 identityId = walletIdentity[citizen];
        if (identityId != bytes32(0)) {
            identityTokens[identityId][citizen] += reward;
            emit TokensBound(citizen, identityId, reward);
        }
        
        // Registrar atividade
        state.activities.push(Activity({
            activityType: activityType,
            reward: reward,
            timestamp: block.timestamp,
            proofHash: proofHash
        }));
        
        // Criar checkpoint
        _createCheckpoint(citizen);
        
        emit CurrencyEarned(citizen, reward, activityType, proofHash);
    }
    
    /**
     * @notice Vincula uma carteira a uma identidade (ProofOfLife)
     * @param wallet Endereço da carteira
     * @param identityId ID da identidade verificada
     * @dev Apenas VALIDATOR pode vincular (geralmente o contrato MultiWallet)
     */
    function linkWalletToIdentity(
        address wallet,
        bytes32 identityId
    ) 
        external 
        onlyRole(VALIDATOR_ROLE) 
    {
        require(wallet != address(0), "Invalid wallet");
        require(identityId != bytes32(0), "Invalid identity");
        
        walletIdentity[wallet] = identityId;
        emit WalletIdentityLinked(wallet, identityId);
    }
    
    /**
     * @notice Valida se uma carteira pode usar seus tokens
     * @param wallet Endereço da carteira
     * @return valid True se válido, false se tokens devem ser destruídos
     * @return reason Razão da validação/destruição
     */
    function validateWalletTokens(address wallet) 
        public 
        view 
        returns (bool valid, string memory reason) 
    {
        CitizenState storage state = citizens[wallet];
        
        // Se não tem saldo, validação é trivial
        if (state.balance == 0) {
            return (true, "No balance");
        }
        
        // Se carteira não tem identidade, tokens estão vulneráveis
        bytes32 identityId = walletIdentity[wallet];
        if (identityId == bytes32(0)) {
            return (true, "No identity linked - vulnerable state");
        }
        
        // Verifica se esta carteira é a original que gerou os tokens
        if (state.originalWallet == address(0)) {
            // Tokens antigos sem vínculo - permitir
            return (true, "Legacy tokens");
        }
        
        // VERIFICAÇÃO CRÍTICA: Se tokens foram gerados em outra carteira
        // mas ambas pertencem à MESMA identidade, é migração válida
        bytes32 originalWalletIdentity = walletIdentity[state.originalWallet];
        
        if (state.originalWallet != wallet) {
            // Se ambas carteiras pertencem à mesma identidade: VÁLIDO (migração)
            if (originalWalletIdentity != bytes32(0) && originalWalletIdentity == identityId) {
                return (true, "Valid migration - same identity");
            }
            
            // Se identidades diferentes ou original sem identidade: TOKENS ROUBADOS
            return (false, "Tokens stolen - different identity");
        }
        
        // Tokens válidos - carteira original
        return (true, "Valid - original wallet");
    }
    
    /**
     * @notice Migra tokens entre carteiras da mesma identidade
     * @param fromWallet Carteira de origem
     * @param toWallet Carteira de destino
     * @param amount Quantidade a migrar
     * @dev Apenas VALIDATOR pode migrar (MultiWallet contract)
     */
    function migrateTokensBetweenWallets(
        address fromWallet,
        address toWallet,
        uint256 amount
    ) 
        external 
        onlyRole(VALIDATOR_ROLE)
        returns (bool) 
    {
        require(fromWallet != address(0) && toWallet != address(0), "Invalid addresses");
        require(amount > 0, "Amount must be positive");
        
        // Verificar que ambas carteiras pertencem à mesma identidade
        bytes32 fromIdentity = walletIdentity[fromWallet];
        bytes32 toIdentity = walletIdentity[toWallet];
        
        require(fromIdentity != bytes32(0), "From wallet has no identity");
        require(fromIdentity == toIdentity, "Wallets have different identities");
        
        CitizenState storage fromState = citizens[fromWallet];
        CitizenState storage toState = citizens[toWallet];
        
        require(fromState.balance >= amount, "Insufficient balance");
        
        // Validar tokens de origem antes de migrar
        (bool validFrom,) = validateWalletTokens(fromWallet);
        require(validFrom, "Source tokens invalid");
        
        // Transferir saldo
        fromState.balance -= amount;
        toState.balance += amount;
        
        // Se destino não estava ativo, ativar
        if (!toState.isActive) {
            citizenList.push(toWallet);
            toState.isActive = true;
            toState.originalWallet = fromState.originalWallet; // Preservar wallet original
            emit CitizenActivated(toWallet);
        }
        
        // Atualizar vínculo de tokens para a nova carteira
        identityTokens[fromIdentity][fromWallet] -= amount;
        identityTokens[fromIdentity][toWallet] += amount;
        
        // Atualizar atividade
        fromState.lastActivity = block.timestamp;
        toState.lastActivity = block.timestamp;
        
        // Criar checkpoints
        _createCheckpoint(fromWallet);
        _createCheckpoint(toWallet);
        
        emit TokensMigrated(fromWallet, toWallet, amount, fromIdentity);
        
        return true;
    }
    
    /**
     * @notice Atualiza a carteira original após migração validada
     * @param wallet Carteira atual
     * @param newOriginalWallet Nova carteira original
     * @dev Usado quando tokens migram de forma válida entre carteiras
     */
    function updateOriginalWallet(
        address wallet,
        address newOriginalWallet
    ) 
        external 
        onlyRole(VALIDATOR_ROLE) 
    {
        require(wallet != address(0), "Invalid wallet");
        require(newOriginalWallet != address(0), "Invalid new original");
        
        // Verificar mesma identidade
        bytes32 walletIdentityId = walletIdentity[wallet];
        bytes32 newOriginalIdentity = walletIdentity[newOriginalWallet];
        
        require(walletIdentityId == newOriginalIdentity, "Different identities");
        
        CitizenState storage state = citizens[wallet];
        address oldOriginal = state.originalWallet;
        state.originalWallet = newOriginalWallet;
        
        emit OriginalWalletUpdated(wallet, oldOriginal, newOriginalWallet);
    }
    
    /**
     * @notice Destrói tokens se validação falhar
     * @param wallet Endereço da carteira
     * @dev Função pública que qualquer um pode chamar para destruir tokens roubados
     */
    function destroyInvalidTokens(address wallet) 
        external 
        returns (uint256 destroyedAmount) 
    {
        (bool valid, string memory reason) = validateWalletTokens(wallet);
        
        require(!valid, "Tokens are valid");
        
        CitizenState storage state = citizens[wallet];
        destroyedAmount = state.balance;
        
        // Destruir tokens
        totalSupply -= destroyedAmount;
        state.balance = 0;
        
        // Registrar destruição
        emit TokensDestroyed(
            wallet,
            state.originalWallet,
            destroyedAmount,
            reason
        );
        
        return destroyedAmount;
    }
    
    /**
     * @notice Valida tokens antes de qualquer operação crítica
     * @param wallet Carteira a validar
     * @dev Modifier que deve ser usado em todas as funções que usam tokens
     */
    modifier validateTokens(address wallet) {
        (bool valid, string memory reason) = validateWalletTokens(wallet);
        
        if (!valid) {
            // Auto-destruir tokens inválidos
            CitizenState storage state = citizens[wallet];
            uint256 destroyedAmount = state.balance;
            
            totalSupply -= destroyedAmount;
            state.balance = 0;
            
            emit TokensDestroyed(
                wallet,
                state.originalWallet,
                destroyedAmount,
                reason
            );
            
            revert(string(abi.encodePacked("Tokens destroyed: ", reason)));
        }
        _;
    }
    
    /**
     * @notice Aplica decaimento por inatividade
     * @param citizen Endereço do cidadão
     */
    function _applyDecay(address citizen) internal {
        CitizenState storage state = citizens[citizen];
        
        if (state.lastActivity == 0 || state.balance == 0) return;
        
        uint256 inactiveDays = (block.timestamp - state.lastActivity) / 1 days;
        
        if (inactiveDays >= DECAY_PERIOD / 1 days) {
            // Decay rate: 1% por mês de inatividade
            // Formula: balance * 0.01 * (meses inativos)
            uint256 inactiveMonths = inactiveDays / 30;
            uint256 decayAmount = (state.balance * DECAY_RATE * inactiveMonths) / 100;
            
            if (decayAmount > 0 && decayAmount < state.balance) {
                state.balance -= decayAmount;
                totalSupply -= decayAmount;
                
                emit CurrencyDecayed(citizen, decayAmount, inactiveDays);
            }
        }
    }
    
    /**
     * @notice Cria checkpoint do saldo atual
     * @param citizen Endereço do cidadão
     */
    function _createCheckpoint(address citizen) internal {
        CitizenState storage state = citizens[citizen];
        
        state.checkpoints.push(Checkpoint({
            timestamp: block.timestamp,
            balance: state.balance
        }));
        
        emit CheckpointCreated(citizen, block.timestamp, state.balance);
    }
    
    /**
     * @notice Retorna saldo em um ponto específico no tempo
     * @param citizen Endereço do cidadão
     * @param timestamp Momento no tempo
     * @return Saldo no timestamp especificado
     */
    function getBalanceAt(address citizen, uint256 timestamp) 
        external 
        view 
        returns (uint256) 
    {
        CitizenState storage state = citizens[citizen];
        Checkpoint[] storage checkpoints = state.checkpoints;
        
        if (checkpoints.length == 0) return 0;
        
        // Busca binária
        uint256 min = 0;
        uint256 max = checkpoints.length - 1;
        
        while (min < max) {
            uint256 mid = (min + max + 1) / 2;
            if (checkpoints[mid].timestamp <= timestamp) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        
        return checkpoints[min].timestamp <= timestamp 
            ? checkpoints[min].balance 
            : 0;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna saldo atual de um cidadão
     * @param citizen Endereço do cidadão
     * @dev Retorna 0 se tokens são inválidos (proteção de leitura)
     */
    function balanceOf(address citizen) external view returns (uint256) {
        (bool valid,) = validateWalletTokens(citizen);
        
        // Se tokens inválidos, retornar 0 (serão destruídos na próxima transação)
        if (!valid) {
            return 0;
        }
        
        return citizens[citizen].balance;
    }
    
    /**
     * @notice Retorna saldo RAW sem validação (apenas para debug)
     * @param citizen Endereço do cidadão
     */
    function balanceOfRaw(address citizen) external view returns (uint256) {
        return citizens[citizen].balance;
    }
    
    /**
     * @notice Retorna informações completas de um cidadão
     * @param citizen Endereço do cidadão
     */
    function getCitizenInfo(address citizen) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 totalEarned,
            uint256 lastActivity,
            bool isActive,
            address originalWallet,
            uint256 checkpointCount,
            uint256 activityCount
        ) 
    {
        CitizenState storage state = citizens[citizen];
        return (
            state.balance,
            state.totalEarned,
            state.lastActivity,
            state.isActive,
            state.originalWallet,
            state.checkpoints.length,
            state.activities.length
        );
    }
    
    /**
     * @notice Retorna histórico de atividades de um cidadão
     * @param citizen Endereço do cidadão
     * @param offset Índice inicial
     * @param limit Quantidade máxima
     */
    function getActivities(address citizen, uint256 offset, uint256 limit)
        external
        view
        returns (Activity[] memory)
    {
        CitizenState storage state = citizens[citizen];
        uint256 total = state.activities.length;
        
        if (offset >= total) {
            return new Activity[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        Activity[] memory result = new Activity[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = state.activities[offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Retorna total de cidadãos registrados
     */
    function getTotalCitizens() external view returns (uint256) {
        return citizenList.length;
    }
    
    /**
     * @notice Retorna lista de cidadãos (paginada)
     */
    function getCitizens(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory)
    {
        uint256 total = citizenList.length;
        
        if (offset >= total) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        address[] memory result = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = citizenList[offset + i];
        }
        
        return result;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Atualiza recompensa de um tipo de atividade
     * @param activityType Tipo de atividade
     * @param newReward Nova recompensa
     */
    function updateActivityReward(string memory activityType, uint256 newReward)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 oldReward = activityRewards[activityType];
        activityRewards[activityType] = newReward;
        
        emit ActivityRewardUpdated(activityType, oldReward, newReward);
    }
    
    /**
     * @notice Desativa um cidadão manualmente
     * @param citizen Endereço do cidadão
     */
    function deactivateCitizen(address citizen)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        citizens[citizen].isActive = false;
        emit CitizenDeactivated(citizen);
    }
    
    /**
     * @notice Pausa o contrato em emergência
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Despausa o contrato
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // ============ EXPORT/IMPORT (Para uso off-chain) ============
    
    /**
     * @notice Gera hash para exportação de estado
     * @param citizen Endereço do cidadão
     * @return Hash do estado para verificação off-chain
     */
    function exportStateHash(address citizen) 
        external 
        view 
        returns (bytes32) 
    {
        CitizenState storage state = citizens[citizen];
        
        return keccak256(abi.encodePacked(
            citizen,
            state.balance,
            state.totalEarned,
            state.lastActivity,
            state.isActive,
            block.chainid
        ));
    }
    
    /**
     * @notice Verifica assinatura de estado exportado
     * @param stateHash Hash do estado
     * @param signature Assinatura do validador
     */
    function verifyExportedState(
        address /* citizen */,
        bytes32 stateHash,
        bytes memory signature
    )
        external
        view
        returns (bool)
    {
        bytes32 messageHash = stateHash.toEthSignedMessageHash();
        address signer = messageHash.recover(signature);
        
        return hasRole(VALIDATOR_ROLE, signer);
    }
    
    /**
     * @notice Retorna a identidade vinculada a uma carteira
     * @param wallet Endereço da carteira
     * @return identityId ID da identidade (ProofOfLife)
     */
    function getWalletIdentity(address wallet) 
        external 
        view 
        returns (bytes32) 
    {
        return walletIdentity[wallet];
    }
}
