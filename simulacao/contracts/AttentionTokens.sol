// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AttentionTokens
 * @notice Sistema de Tokens de Atenção (Art. 6º-D da Constituição Viva 2.0)
 * @dev Inspirado no sistema imunológico humano que usa inflamação para sinalizar urgências
 * 
 * Características:
 * - 100 tokens/mês por cidadão com IDS ativo
 * - Tokens expiram após 30 dias (não acumulam)
 * - Alocação de 1-50 tokens por BIP
 * - Sistema de priorização automática
 * - Cashback de reputação quando sua posição vence
 * - Fast-track para BIPs com >5000 tokens
 * - Filtro anti-spam: <100 tokens em 48h = draft
 * 
 * @author @revolucao-cibernetica
 */
contract AttentionTokens is AccessControl, ReentrancyGuard {
    
    // ============ TYPES ============
    
    /// @notice Dados de alocação de atenção por cidadão
    struct CitizenAttention {
        uint256 balance;           // Tokens disponíveis
        uint256 lastAllocation;    // Timestamp da última distribuição mensal
        uint256 expirationDate;    // Quando os tokens expiram
        uint256 totalAllocated;    // Total alocado no período atual
        uint256 lifetimeAllocated; // Total histórico alocado
    }
    
    /// @notice Dados de atenção recebida por uma BIP
    struct ProposalAttention {
        uint256 totalTokens;       // Total de tokens alocados
        uint256 uniqueAllocators;  // Número de cidadãos que alocaram
        uint256 createdAt;         // Timestamp de criação
        uint256 lastAllocationAt;  // Última alocação recebida
        bool isFastTrack;          // Se atingiu threshold de fast-track
        bool isSpam;               // Se foi marcada como spam
        mapping(address => uint256) allocations; // Tokens por cidadão
    }
    
    /// @notice Dados de cashback de reputação
    struct ReputationCashback {
        uint256 totalEarned;       // Total de tokens recebidos de volta
        uint256 winningVotes;      // Número de vezes que votou no lado vencedor
        uint256 totalVotes;        // Total de votos realizados
        uint256 reputationScore;   // Score de 0-1000 (calculado)
    }
    
    // ============ CONSTANTS ============
    
    /// @notice Tokens distribuídos por cidadão por mês
    uint256 public constant MONTHLY_ALLOCATION = 100;
    
    /// @notice Período de um mês em segundos (30 dias)
    uint256 public constant ALLOCATION_PERIOD = 30 days;
    
    /// @notice Mínimo de tokens por alocação
    uint256 public constant MIN_ALLOCATION = 1;
    
    /// @notice Máximo de tokens por alocação (evita concentração)
    uint256 public constant MAX_ALLOCATION = 50;
    
    /// @notice Threshold para fast-track (votação acelerada)
    uint256 public constant FAST_TRACK_THRESHOLD = 5000;
    
    /// @notice Threshold anti-spam (mínimo em 48h)
    uint256 public constant SPAM_THRESHOLD = 100;
    uint256 public constant SPAM_WINDOW = 48 hours;
    
    /// @notice Período de cashback após votação
    uint256 public constant CASHBACK_DELAY = 7 days;
    
    /// @notice Percentual de cashback para vencedores (30%)
    uint256 public constant CASHBACK_PERCENTAGE = 30;
    
    // ============ ROLES ============
    
    bytes32 public constant VOTING_CONTRACT_ROLE = keccak256("VOTING_CONTRACT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ============ STATE VARIABLES ============
    
    /// @notice Token de governança (IDS)
    IERC20 public governanceToken;
    
    /// @notice Dados de atenção por cidadão
    mapping(address => CitizenAttention) public citizenAttention;
    
    /// @notice Dados de atenção por BIP
    mapping(uint256 => ProposalAttention) public proposalAttention;
    
    /// @notice Dados de cashback por cidadão
    mapping(address => ReputationCashback) public reputationCashback;
    
    /// @notice Lista de BIPs ordenadas por atenção (top 20)
    uint256[] public topProposals;
    
    /// @notice Mapping para verificar se BIP está no top
    mapping(uint256 => bool) public isInTop;
    
    /// @notice Total de cidadãos ativos
    uint256 public totalActiveCitizens;
    
    /// @notice Total de tokens alocados no sistema
    uint256 public totalAllocatedTokens;
    
    /// @notice Próxima data de distribuição mensal
    uint256 public nextDistributionDate;
    
    // ============ EVENTS ============
    
    event MonthlyAllocation(address indexed citizen, uint256 amount, uint256 expirationDate);
    event AttentionAllocated(address indexed citizen, uint256 indexed proposalId, uint256 amount);
    event AttentionReallocated(address indexed citizen, uint256 indexed proposalId, uint256 oldAmount, uint256 newAmount);
    event FastTrackAchieved(uint256 indexed proposalId, uint256 totalTokens);
    event SpamFlagged(uint256 indexed proposalId, uint256 totalTokens);
    event CashbackAwarded(address indexed citizen, uint256 indexed proposalId, uint256 amount);
    event TopProposalsUpdated(uint256[] proposalIds);
    event TokensExpired(address indexed citizen, uint256 amount);
    
    // ============ ERRORS ============
    
    error InsufficientBalance(uint256 available, uint256 required);
    error InvalidAllocationAmount(uint256 amount);
    error AllocationTooSoon(uint256 nextAllowedTime);
    error ProposalNotFound(uint256 proposalId);
    error NotEligibleForCashback(uint256 proposalId);
    error TokensAlreadyExpired();
    error UnauthorizedCaller();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @notice Inicializa o sistema de tokens de atenção
     * @param _governanceToken Endereço do token IDS
     */
    constructor(address _governanceToken) {
        require(_governanceToken != address(0), "Invalid token address");
        
        governanceToken = IERC20(_governanceToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        nextDistributionDate = block.timestamp + ALLOCATION_PERIOD;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice Registra um novo cidadão no sistema
     * @param citizen Endereço do cidadão
     */
    function registerCitizen(address citizen) external onlyRole(ADMIN_ROLE) {
        require(citizen != address(0), "Invalid address");
        require(citizenAttention[citizen].lastAllocation == 0, "Already registered");
        
        _allocateMonthlyTokens(citizen);
        totalActiveCitizens++;
    }
    
    /**
     * @notice Distribui tokens mensais para um cidadão
     * @param citizen Endereço do cidadão
     */
    function claimMonthlyAllocation(address citizen) external nonReentrant {
        require(citizen != address(0), "Invalid address");
        require(
            block.timestamp >= citizenAttention[citizen].lastAllocation + ALLOCATION_PERIOD,
            "Too soon to claim"
        );
        
        // Expira tokens não utilizados
        if (citizenAttention[citizen].balance > 0) {
            emit TokensExpired(citizen, citizenAttention[citizen].balance);
        }
        
        _allocateMonthlyTokens(citizen);
    }
    
    /**
     * @notice Aloca tokens de atenção para uma BIP
     * @param proposalId ID da proposta
     * @param amount Quantidade de tokens (1-50)
     */
    function allocateAttention(uint256 proposalId, uint256 amount) external nonReentrant {
        CitizenAttention storage citizen = citizenAttention[msg.sender];
        
        // Validações
        if (block.timestamp > citizen.expirationDate) {
            revert TokensAlreadyExpired();
        }
        
        if (amount < MIN_ALLOCATION || amount > MAX_ALLOCATION) {
            revert InvalidAllocationAmount(amount);
        }
        
        if (citizen.balance < amount) {
            revert InsufficientBalance(citizen.balance, amount);
        }
        
        // Atualiza saldo do cidadão
        citizen.balance -= amount;
        citizen.totalAllocated += amount;
        citizen.lifetimeAllocated += amount;
        
        // Atualiza dados da proposta
        ProposalAttention storage proposal = proposalAttention[proposalId];
        
        // Se é primeira alocação deste cidadão
        if (proposal.allocations[msg.sender] == 0) {
            proposal.uniqueAllocators++;
            
            // Se é a primeira alocação na proposta
            if (proposal.createdAt == 0) {
                proposal.createdAt = block.timestamp;
            }
        }
        
        proposal.allocations[msg.sender] += amount;
        proposal.totalTokens += amount;
        proposal.lastAllocationAt = block.timestamp;
        
        totalAllocatedTokens += amount;
        
        // Verifica thresholds
        _checkFastTrack(proposalId);
        _checkSpam(proposalId);
        
        // Atualiza ranking
        _updateTopProposals(proposalId);
        
        emit AttentionAllocated(msg.sender, proposalId, amount);
    }
    
    /**
     * @notice Realoca tokens de uma BIP para outra
     * @param fromProposalId BIP de origem
     * @param toProposalId BIP de destino
     * @param amount Quantidade de tokens
     */
    function reallocateAttention(
        uint256 fromProposalId,
        uint256 toProposalId,
        uint256 amount
    ) external nonReentrant {
        CitizenAttention storage citizen = citizenAttention[msg.sender];
        ProposalAttention storage fromProposal = proposalAttention[fromProposalId];
        
        // Validações
        if (block.timestamp > citizen.expirationDate) {
            revert TokensAlreadyExpired();
        }
        
        uint256 allocated = fromProposal.allocations[msg.sender];
        if (allocated < amount) {
            revert InsufficientBalance(allocated, amount);
        }
        
        // Remove da proposta de origem
        fromProposal.allocations[msg.sender] -= amount;
        fromProposal.totalTokens -= amount;
        
        if (fromProposal.allocations[msg.sender] == 0) {
            fromProposal.uniqueAllocators--;
        }
        
        // Adiciona na proposta de destino
        ProposalAttention storage toProposal = proposalAttention[toProposalId];
        
        if (toProposal.allocations[msg.sender] == 0) {
            toProposal.uniqueAllocators++;
            if (toProposal.createdAt == 0) {
                toProposal.createdAt = block.timestamp;
            }
        }
        
        toProposal.allocations[msg.sender] += amount;
        toProposal.totalTokens += amount;
        toProposal.lastAllocationAt = block.timestamp;
        
        // Atualiza rankings
        _updateTopProposals(fromProposalId);
        _updateTopProposals(toProposalId);
        
        emit AttentionReallocated(msg.sender, fromProposalId, allocated, allocated - amount);
        emit AttentionAllocated(msg.sender, toProposalId, amount);
    }
    
    /**
     * @notice Concede cashback de reputação para votantes do lado vencedor
     * @param proposalId ID da proposta
     * @param voters Lista de votantes do lado vencedor
     */
    function awardCashback(
        uint256 proposalId,
        address[] calldata voters
    ) external onlyRole(VOTING_CONTRACT_ROLE) {
        ProposalAttention storage proposal = proposalAttention[proposalId];
        
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            uint256 allocated = proposal.allocations[voter];
            
            if (allocated > 0) {
                uint256 cashback = (allocated * CASHBACK_PERCENTAGE) / 100;
                
                // Retorna tokens ao cidadão (se ainda não expirou)
                CitizenAttention storage citizen = citizenAttention[voter];
                if (block.timestamp <= citizen.expirationDate) {
                    citizen.balance += cashback;
                }
                
                // Atualiza reputação
                ReputationCashback storage reputation = reputationCashback[voter];
                reputation.totalEarned += cashback;
                reputation.winningVotes++;
                reputation.totalVotes++;
                
                // Calcula score (0-1000)
                reputation.reputationScore = (reputation.winningVotes * 1000) / reputation.totalVotes;
                
                emit CashbackAwarded(voter, proposalId, cashback);
            }
        }
    }
    
    /**
     * @notice Registra voto de perdedor (sem cashback)
     * @param proposalId ID da proposta
     * @param voters Lista de votantes do lado perdedor
     */
    function recordLosingVote(
        uint256 proposalId,
        address[] calldata voters
    ) external onlyRole(VOTING_CONTRACT_ROLE) {
        for (uint256 i = 0; i < voters.length; i++) {
            ReputationCashback storage reputation = reputationCashback[voters[i]];
            reputation.totalVotes++;
            
            // Recalcula score
            if (reputation.totalVotes > 0) {
                reputation.reputationScore = (reputation.winningVotes * 1000) / reputation.totalVotes;
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna dados de atenção de um cidadão
     * @param citizen Endereço do cidadão
     * @return balance Saldo disponível
     * @return expirationDate Data de expiração
     * @return lifetimeAllocated Total histórico alocado
     */
    function getCitizenAttention(address citizen) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 expirationDate,
            uint256 lifetimeAllocated
        ) 
    {
        CitizenAttention storage data = citizenAttention[citizen];
        return (data.balance, data.expirationDate, data.lifetimeAllocated);
    }
    
    /**
     * @notice Retorna dados de atenção de uma proposta
     * @param proposalId ID da proposta
     * @return totalTokens Total de tokens
     * @return uniqueAllocators Número de alocadores únicos
     * @return isFastTrack Se está em fast-track
     * @return isSpam Se foi marcada como spam
     */
    function getProposalAttention(uint256 proposalId)
        external
        view
        returns (
            uint256 totalTokens,
            uint256 uniqueAllocators,
            bool isFastTrack,
            bool isSpam
        )
    {
        ProposalAttention storage data = proposalAttention[proposalId];
        return (data.totalTokens, data.uniqueAllocators, data.isFastTrack, data.isSpam);
    }
    
    /**
     * @notice Retorna alocação de um cidadão em uma proposta
     * @param proposalId ID da proposta
     * @param citizen Endereço do cidadão
     * @return Quantidade de tokens alocados
     */
    function getAllocation(uint256 proposalId, address citizen) 
        external 
        view 
        returns (uint256) 
    {
        return proposalAttention[proposalId].allocations[citizen];
    }
    
    /**
     * @notice Retorna dados de reputação de um cidadão
     * @param citizen Endereço do cidadão
     * @return totalEarned Total recebido de cashback
     * @return reputationScore Score de 0-1000
     * @return winRate Taxa de vitória (%)
     */
    function getReputation(address citizen)
        external
        view
        returns (
            uint256 totalEarned,
            uint256 reputationScore,
            uint256 winRate
        )
    {
        ReputationCashback storage data = reputationCashback[citizen];
        uint256 rate = data.totalVotes > 0 ? (data.winningVotes * 100) / data.totalVotes : 0;
        return (data.totalEarned, data.reputationScore, rate);
    }
    
    /**
     * @notice Retorna top 20 BIPs por atenção
     * @return Array de IDs de propostas
     */
    function getTopProposals() external view returns (uint256[] memory) {
        return topProposals;
    }
    
    /**
     * @notice Calcula score de priorização de uma BIP
     * @param proposalId ID da proposta
     * @return Score de 0-10000 (ponderado)
     */
    function calculatePriorityScore(uint256 proposalId) public view returns (uint256) {
        ProposalAttention storage proposal = proposalAttention[proposalId];
        
        if (proposal.createdAt == 0) return 0;
        
        // 50% tokens alocados
        uint256 tokenScore = (proposal.totalTokens * 5000) / FAST_TRACK_THRESHOLD;
        if (tokenScore > 5000) tokenScore = 5000;
        
        // 30% diversidade de alocadores
        uint256 diversityScore = (proposal.uniqueAllocators * 3000) / totalActiveCitizens;
        if (diversityScore > 3000) diversityScore = 3000;
        
        // 20% urgência temporal (decay ao longo do tempo)
        uint256 age = block.timestamp - proposal.createdAt;
        uint256 timeScore = age > 30 days ? 0 : 2000 - (age * 2000) / 30 days;
        
        return tokenScore + diversityScore + timeScore;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Aloca tokens mensais para um cidadão
     * @param citizen Endereço do cidadão
     */
    function _allocateMonthlyTokens(address citizen) internal {
        CitizenAttention storage data = citizenAttention[citizen];
        
        data.balance = MONTHLY_ALLOCATION;
        data.lastAllocation = block.timestamp;
        data.expirationDate = block.timestamp + ALLOCATION_PERIOD;
        data.totalAllocated = 0;
        
        emit MonthlyAllocation(citizen, MONTHLY_ALLOCATION, data.expirationDate);
    }
    
    /**
     * @notice Verifica se BIP atingiu threshold de fast-track
     * @param proposalId ID da proposta
     */
    function _checkFastTrack(uint256 proposalId) internal {
        ProposalAttention storage proposal = proposalAttention[proposalId];
        
        if (!proposal.isFastTrack && proposal.totalTokens >= FAST_TRACK_THRESHOLD) {
            proposal.isFastTrack = true;
            emit FastTrackAchieved(proposalId, proposal.totalTokens);
        }
    }
    
    /**
     * @notice Verifica se BIP está abaixo do threshold anti-spam
     * @param proposalId ID da proposta
     */
    function _checkSpam(uint256 proposalId) internal {
        ProposalAttention storage proposal = proposalAttention[proposalId];
        
        // Se criada há mais de 48h e tem menos de 100 tokens
        if (
            proposal.createdAt > 0 &&
            block.timestamp >= proposal.createdAt + SPAM_WINDOW &&
            proposal.totalTokens < SPAM_THRESHOLD
        ) {
            proposal.isSpam = true;
            emit SpamFlagged(proposalId, proposal.totalTokens);
        }
    }
    
    /**
     * @notice Atualiza lista de top 20 propostas
     * @param proposalId ID da proposta atualizada
     */
    function _updateTopProposals(uint256 proposalId) internal {
        uint256 score = calculatePriorityScore(proposalId);
        
        // Se já está no top, atualiza posição
        if (isInTop[proposalId]) {
            _reorderTopProposals();
            return;
        }
        
        // Se tem menos de 20 propostas, adiciona diretamente
        if (topProposals.length < 20) {
            topProposals.push(proposalId);
            isInTop[proposalId] = true;
            _reorderTopProposals();
            return;
        }
        
        // Verifica se score é maior que o último do top
        uint256 lastId = topProposals[topProposals.length - 1];
        uint256 lastScore = calculatePriorityScore(lastId);
        
        if (score > lastScore) {
            // Remove último
            isInTop[lastId] = false;
            topProposals[topProposals.length - 1] = proposalId;
            isInTop[proposalId] = true;
            _reorderTopProposals();
        }
    }
    
    /**
     * @notice Reordena top propostas por score (bubble sort simples)
     */
    function _reorderTopProposals() internal {
        uint256 n = topProposals.length;
        
        if (n <= 1) return; // Nothing to sort
        
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                uint256 score1 = calculatePriorityScore(topProposals[j]);
                uint256 score2 = calculatePriorityScore(topProposals[j + 1]);
                
                if (score1 < score2) {
                    // Swap
                    uint256 temp = topProposals[j];
                    topProposals[j] = topProposals[j + 1];
                    topProposals[j + 1] = temp;
                }
            }
        }
        
        emit TopProposalsUpdated(topProposals);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Adiciona contrato de votação autorizado
     * @param votingContract Endereço do contrato
     */
    function setVotingContract(address votingContract) external onlyRole(ADMIN_ROLE) {
        require(votingContract != address(0), "Invalid address");
        _grantRole(VOTING_CONTRACT_ROLE, votingContract);
    }
    
    /**
     * @notice Remove proposta do ranking (admin emergency)
     * @param proposalId ID da proposta
     */
    function removeFromTop(uint256 proposalId) external onlyRole(ADMIN_ROLE) {
        if (!isInTop[proposalId]) return;
        
        for (uint256 i = 0; i < topProposals.length; i++) {
            if (topProposals[i] == proposalId) {
                // Move último elemento para posição removida
                topProposals[i] = topProposals[topProposals.length - 1];
                topProposals.pop();
                isInTop[proposalId] = false;
                break;
            }
        }
        
        _reorderTopProposals();
    }
}
