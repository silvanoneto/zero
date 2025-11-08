// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ISovereignInterfaces.sol";

/**
 * @title WalletRecovery
 * @notice Sistema de recuperação de carteira e tokens após incidente de fraude
 * @dev Permite usuário legítimo recuperar acesso e migrar tokens para nova carteira
 * 
 * CENÁRIO PROBLEMA:
 * 1. Hacker rouba carteira → Sistema detecta e bloqueia
 * 2. Tokens SOB ficam "presos" na carteira bloqueada
 * 3. Usuário legítimo não consegue acessar seus próprios tokens
 * 
 * SOLUÇÃO:
 * 1. Usuário inicia recuperação de OUTRA carteira da identidade
 * 2. Prova identidade através de múltiplos fatores
 * 3. Guardiões aprovam recuperação
 * 4. Tokens migram para nova carteira segura
 * 5. Carteira comprometida permanece bloqueada
 * 
 * SEGURANÇA:
 * - Requer múltiplas carteiras ativas (prova de identidade)
 * - Guardiões precisam aprovar (quórum 2/3)
 * - Verificação biométrica obrigatória
 * - Período de espera (72h) para contestação
 * - Histórico de ações para validação
 */
contract WalletRecovery is AccessControl, Pausable {
    
    // ============ ROLES ============
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Período de espera para recuperação (72 horas)
    uint256 public constant RECOVERY_WAITING_PERIOD = 72 hours;
    
    /// @notice Quórum de guardiões necessário (2 de 3)
    uint256 public constant GUARDIAN_QUORUM = 2;
    
    /// @notice Número mínimo de provas de identidade
    uint256 public constant MIN_IDENTITY_PROOFS = 3;
    
    /// @notice Máximo de tentativas de recuperação
    uint256 public constant MAX_RECOVERY_ATTEMPTS = 3;
    
    // ============ ENUMS ============
    
    enum RecoveryStatus {
        Pending,        // Aguardando aprovações
        Approved,       // Aprovada, aguardando período
        Contested,      // Contestada por alguém
        Executed,       // Executada com sucesso
        Rejected,       // Rejeitada
        Expired         // Expirou sem aprovações
    }
    
    enum ProofType {
        BiometricVerification,      // Impressão digital, face, etc
        KnowledgeBased,             // Perguntas secretas
        DocumentVerification,       // KYC/documento
        HistoricalAction,           // Prova ação passada
        SocialVerification,         // Outros cidadãos confirmam
        DeviceOwnership,            // Acesso a dispositivo original
        EmailVerification,          // Código por email
        PhoneVerification           // Código por SMS
    }
    
    // ============ STRUCTS ============
    
    /// @notice Prova de identidade
    struct IdentityProof {
        ProofType proofType;
        bytes proofData;            // Hash da prova (dados sensíveis off-chain)
        uint256 submittedAt;
        address verifier;           // Quem verificou (validador ou sistema)
        bool verified;
        uint256 confidenceScore;    // 0-100
    }
    
    /// @notice Voto de guardião
    struct GuardianVote {
        address guardian;
        bool approved;
        string reason;
        uint256 votedAt;
    }
    
    /// @notice Processo de recuperação
    struct RecoveryProcess {
        bytes32 identityId;
        address compromisedWallet;      // Carteira roubada/bloqueada
        address recoveryWallet;         // Carteira atual do usuário (outra da identidade)
        address newWallet;              // Nova carteira para receber tokens
        uint256 startedAt;
        uint256 approvedAt;
        uint256 executesAt;
        RecoveryStatus status;
        IdentityProof[] proofs;
        GuardianVote[] votes;
        uint256 tokensToRecover;        // Quantidade de SOB a migrar
        address[] contestedBy;
        string contestReason;
    }
    
    /// @notice Tentativa de recuperação (para rate limiting)
    struct RecoveryAttempt {
        uint256 attemptedAt;
        bool successful;
        string failureReason;
    }
    
    // ============ STATE ============
    
    /// @notice Processos de recuperação ativos
    mapping(bytes32 => RecoveryProcess) public recoveryProcesses;
    
    /// @notice Histórico de tentativas por carteira
    mapping(address => RecoveryAttempt[]) public recoveryAttempts;
    
    /// @notice Carteiras que já foram recuperadas (evitar reutilização)
    mapping(address => bool) public alreadyRecovered;
    
    /// @notice Total de recuperações bem-sucedidas
    uint256 public totalRecoveries;
    
    /// @notice Total de tokens recuperados
    uint256 public totalTokensRecovered;
    
    /// @notice Referência ao contrato SovereignCurrency (opcional)
    address public sovereignCurrency;

    
    // ============ EVENTS ============
    
    event RecoveryInitiated(
        bytes32 indexed identityId,
        address indexed compromisedWallet,
        address indexed newWallet,
        uint256 tokensToRecover
    );
    
    event ProofSubmitted(
        bytes32 indexed identityId,
        ProofType proofType,
        uint256 confidenceScore
    );
    
    event GuardianVoted(
        bytes32 indexed identityId,
        address indexed guardian,
        bool approved
    );
    
    event RecoveryApproved(
        bytes32 indexed identityId,
        uint256 executesAt
    );
    
    event RecoveryContested(
        bytes32 indexed identityId,
        address indexed contester,
        string reason
    );
    
    event RecoveryExecuted(
        bytes32 indexed identityId,
        address indexed newWallet,
        uint256 tokensRecovered
    );
    
    event RecoveryRejected(
        bytes32 indexed identityId,
        string reason
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Inicia processo de recuperação
     * @param identityId ID da identidade
     * @param compromisedWallet Carteira comprometida/bloqueada
     * @param newWallet Nova carteira para receber tokens
     * @param tokensToRecover Quantidade de SOB a recuperar
     */
    function initiateRecovery(
        bytes32 identityId,
        address compromisedWallet,
        address newWallet,
        uint256 tokensToRecover
    )
        external
        whenNotPaused
    {
        require(compromisedWallet != address(0), "Invalid compromised wallet");
        require(newWallet != address(0), "Invalid new wallet");
        require(newWallet != compromisedWallet, "Wallets must be different");
        require(!alreadyRecovered[compromisedWallet], "Already recovered");
        
        // Verificar rate limiting
        require(
            _canAttemptRecovery(msg.sender),
            "Too many recovery attempts"
        );
        
        // Verificar se já existe processo ativo
        RecoveryProcess storage process = recoveryProcesses[identityId];
        require(
            process.status == RecoveryStatus(0) || 
            process.status == RecoveryStatus.Executed ||
            process.status == RecoveryStatus.Rejected ||
            process.status == RecoveryStatus.Expired,
            "Recovery already in progress"
        );
        
        // Criar novo processo
        delete recoveryProcesses[identityId];
        process = recoveryProcesses[identityId];
        
        process.identityId = identityId;
        process.compromisedWallet = compromisedWallet;
        process.recoveryWallet = msg.sender;
        process.newWallet = newWallet;
        process.startedAt = block.timestamp;
        process.status = RecoveryStatus.Pending;
        process.tokensToRecover = tokensToRecover;
        
        // Registrar tentativa
        recoveryAttempts[msg.sender].push(RecoveryAttempt({
            attemptedAt: block.timestamp,
            successful: false,
            failureReason: ""
        }));
        
        emit RecoveryInitiated(
            identityId,
            compromisedWallet,
            newWallet,
            tokensToRecover
        );
    }
    
    /**
     * @notice Submete prova de identidade
     * @param identityId ID da identidade
     * @param proofType Tipo de prova
     * @param proofData Hash da prova
     * @param confidenceScore Score de confiança (0-100)
     */
    function submitProof(
        bytes32 identityId,
        ProofType proofType,
        bytes memory proofData,
        uint256 confidenceScore
    )
        external
        whenNotPaused
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Pending,
            "Recovery not pending"
        );
        require(
            msg.sender == process.recoveryWallet ||
            hasRole(VALIDATOR_ROLE, msg.sender),
            "Not authorized"
        );
        require(confidenceScore <= 100, "Invalid confidence score");
        
        process.proofs.push(IdentityProof({
            proofType: proofType,
            proofData: proofData,
            submittedAt: block.timestamp,
            verifier: msg.sender,
            verified: hasRole(VALIDATOR_ROLE, msg.sender),
            confidenceScore: confidenceScore
        }));
        
        emit ProofSubmitted(identityId, proofType, confidenceScore);
        
        // Verificar se atingiu mínimo de provas
        _checkAutoApproval(identityId);
    }
    
    /**
     * @notice Guardião vota na recuperação
     * @param identityId ID da identidade
     * @param approve Aprovar ou rejeitar
     * @param reason Razão do voto
     */
    function voteRecovery(
        bytes32 identityId,
        bool approve,
        string memory reason
    )
        external
        whenNotPaused
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Pending,
            "Recovery not pending"
        );
        
        // Verificar se já votou
        for (uint i = 0; i < process.votes.length; i++) {
            require(
                process.votes[i].guardian != msg.sender,
                "Already voted"
            );
        }
        
        process.votes.push(GuardianVote({
            guardian: msg.sender,
            approved: approve,
            reason: reason,
            votedAt: block.timestamp
        }));
        
        emit GuardianVoted(identityId, msg.sender, approve);
        
        // Verificar se atingiu quórum
        _checkAutoApproval(identityId);
    }
    
    /**
     * @notice Valida e aprova recuperação
     * @param identityId ID da identidade
     */
    function approveRecovery(bytes32 identityId)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Pending,
            "Recovery not pending"
        );
        
        // Verificar se tem provas suficientes
        require(
            process.proofs.length >= MIN_IDENTITY_PROOFS,
            "Insufficient proofs"
        );
        
        // Verificar score médio das provas
        uint256 totalScore = 0;
        for (uint i = 0; i < process.proofs.length; i++) {
            totalScore += process.proofs[i].confidenceScore;
        }
        uint256 avgScore = totalScore / process.proofs.length;
        require(avgScore >= 70, "Low confidence score");
        
        // Verificar votos de guardiões
        uint256 approvals = 0;
        for (uint i = 0; i < process.votes.length; i++) {
            if (process.votes[i].approved) {
                approvals++;
            }
        }
        require(approvals >= GUARDIAN_QUORUM, "Insufficient guardian approvals");
        
        process.status = RecoveryStatus.Approved;
        process.approvedAt = block.timestamp;
        process.executesAt = block.timestamp + RECOVERY_WAITING_PERIOD;
        
        emit RecoveryApproved(identityId, process.executesAt);
    }
    
    /**
     * @notice Contesta recuperação (se for fraude)
     * @param identityId ID da identidade
     * @param reason Razão da contestação
     */
    function contestRecovery(
        bytes32 identityId,
        string memory reason
    )
        external
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Approved,
            "Recovery not approved"
        );
        require(
            block.timestamp < process.executesAt,
            "Recovery already executed"
        );
        
        process.status = RecoveryStatus.Contested;
        process.contestedBy.push(msg.sender);
        process.contestReason = reason;
        
        emit RecoveryContested(identityId, msg.sender, reason);
    }
    
    /**
     * @notice Executa recuperação após período de espera
     * @param identityId ID da identidade
     */
    function executeRecovery(bytes32 identityId)
        external
        whenNotPaused
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Approved,
            "Recovery not approved"
        );
        require(
            block.timestamp >= process.executesAt,
            "Waiting period not over"
        );
        
        process.status = RecoveryStatus.Executed;
        alreadyRecovered[process.compromisedWallet] = true;
        
        totalRecoveries++;
        totalTokensRecovered += process.tokensToRecover;
        
        // Atualizar tentativa como bem-sucedida
        RecoveryAttempt[] storage attempts = recoveryAttempts[process.recoveryWallet];
        if (attempts.length > 0) {
            attempts[attempts.length - 1].successful = true;
        }
        
        // INTEGRAÇÃO: Vincular nova wallet e migrar tokens no SovereignCurrency
        if (sovereignCurrency != address(0) && process.tokensToRecover > 0) {
            // 1. Vincular nova wallet à identidade
            ISovereignCurrency(sovereignCurrency).linkWalletToIdentity(
                process.newWallet,
                identityId
            );
            
            // 2. Migrar tokens da carteira comprometida para a nova
            ISovereignCurrency(sovereignCurrency).migrateTokensBetweenWallets(
                process.compromisedWallet,
                process.newWallet,
                process.tokensToRecover
            );
        }
        
        emit RecoveryExecuted(
            identityId,
            process.newWallet,
            process.tokensToRecover
        );
    }
    
    /**
     * @notice Rejeita recuperação
     * @param identityId ID da identidade
     * @param reason Razão da rejeição
     */
    function rejectRecovery(
        bytes32 identityId,
        string memory reason
    )
        external
        onlyRole(VALIDATOR_ROLE)
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        require(
            process.status == RecoveryStatus.Pending ||
            process.status == RecoveryStatus.Contested,
            "Cannot reject in current status"
        );
        
        process.status = RecoveryStatus.Rejected;
        
        // Atualizar tentativa com razão da falha
        RecoveryAttempt[] storage attempts = recoveryAttempts[process.recoveryWallet];
        if (attempts.length > 0) {
            attempts[attempts.length - 1].failureReason = reason;
        }
        
        emit RecoveryRejected(identityId, reason);
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @notice Verifica se pode tentar recuperação
     */
    function _canAttemptRecovery(address wallet)
        internal
        view
        returns (bool)
    {
        RecoveryAttempt[] storage attempts = recoveryAttempts[wallet];
        
        if (attempts.length == 0) {
            return true;
        }
        
        // Contar tentativas falhas recentes (últimas 24h)
        uint256 recentFailures = 0;
        uint256 oneDayAgo = block.timestamp - 1 days;
        
        for (uint i = attempts.length; i > 0; i--) {
            if (attempts[i-1].attemptedAt < oneDayAgo) {
                break;
            }
            if (!attempts[i-1].successful) {
                recentFailures++;
            }
        }
        
        return recentFailures < MAX_RECOVERY_ATTEMPTS;
    }
    
    /**
     * @notice Verifica se deve aprovar automaticamente
     */
    function _checkAutoApproval(bytes32 identityId)
        internal
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        if (process.status != RecoveryStatus.Pending) {
            return;
        }
        
        // Verificar provas suficientes com score alto
        if (process.proofs.length >= MIN_IDENTITY_PROOFS) {
            uint256 totalScore = 0;
            for (uint i = 0; i < process.proofs.length; i++) {
                totalScore += process.proofs[i].confidenceScore;
            }
            uint256 avgScore = totalScore / process.proofs.length;
            
            // Verificar votos de guardiões
            uint256 approvals = 0;
            for (uint i = 0; i < process.votes.length; i++) {
                if (process.votes[i].approved) {
                    approvals++;
                }
            }
            
            // Auto-aprovar se condições satisfeitas
            if (avgScore >= 70 && approvals >= GUARDIAN_QUORUM) {
                process.status = RecoveryStatus.Approved;
                process.approvedAt = block.timestamp;
                process.executesAt = block.timestamp + RECOVERY_WAITING_PERIOD;
                
                emit RecoveryApproved(identityId, process.executesAt);
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna estado do processo de recuperação
     */
    function getRecoveryProcess(bytes32 identityId)
        external
        view
        returns (
            address compromisedWallet,
            address newWallet,
            RecoveryStatus status,
            uint256 tokensToRecover,
            uint256 proofsCount,
            uint256 votesCount,
            uint256 executesAt
        )
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        return (
            process.compromisedWallet,
            process.newWallet,
            process.status,
            process.tokensToRecover,
            process.proofs.length,
            process.votes.length,
            process.executesAt
        );
    }
    
    /**
     * @notice Retorna provas submetidas
     */
    function getProofs(bytes32 identityId)
        external
        view
        returns (IdentityProof[] memory)
    {
        return recoveryProcesses[identityId].proofs;
    }
    
    /**
     * @notice Retorna votos de guardiões
     */
    function getVotes(bytes32 identityId)
        external
        view
        returns (GuardianVote[] memory)
    {
        return recoveryProcesses[identityId].votes;
    }
    
    /**
     * @notice Retorna tentativas de recuperação
     */
    function getRecoveryAttempts(address wallet)
        external
        view
        returns (RecoveryAttempt[] memory)
    {
        return recoveryAttempts[wallet];
    }
    
    /**
     * @notice Calcula score de confiança agregado
     */
    function getConfidenceScore(bytes32 identityId)
        external
        view
        returns (uint256)
    {
        RecoveryProcess storage process = recoveryProcesses[identityId];
        
        if (process.proofs.length == 0) {
            return 0;
        }
        
        uint256 totalScore = 0;
        for (uint i = 0; i < process.proofs.length; i++) {
            totalScore += process.proofs[i].confidenceScore;
        }
        
        return totalScore / process.proofs.length;
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
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
