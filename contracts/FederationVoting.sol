// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title FederationVoting
 * @notice Sistema de Votação Híbrida Contextual inspirado na Cybersyn 2.0
 * @dev Implementa 4 funções de votação biomimético-cibernéticas
 * 
 * Baseado em Art. 3º-A da Constituição Viva 2.0
 * Como a natureza usa diferentes estratégias de dissipação de energia,
 * este contrato seleciona automaticamente a função de votação contextual.
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Interface para integração com DAOMitosis (Art. 5º-C)
 */
interface IDAOMitosis {
    function recordActivity(uint256 _daoId, address _member) external;
}

/**
 * @notice Interface para integração com RestorativeJustice (Art. 6º)
 */
interface IRestorativeJustice {
    function hasActivePenalty(address account) external view returns (bool);
}

/**
 * @notice Interface para integração com AttentionTokens (Art. 6º-D)
 */
interface IAttentionTokens {
    function getCitizenAttention(address citizen) external view returns (uint256 balance, uint256 expirationDate, uint256 lifetimeAllocated);
    function getProposalAttention(uint256 proposalId) external view returns (uint256 totalTokens, uint256 uniqueAllocators, bool isFastTrack, bool isSpam);
    function awardCashback(uint256 proposalId, address[] calldata voters) external;
    function recordLosingVote(uint256 proposalId, address[] calldata voters) external;
}

contract FederationVoting is AccessControl, ReentrancyGuard {
    
    // ============ TYPES ============
    
    /// @notice Tipos de votação disponíveis
    enum VoteType { 
        LINEAR,      // 1 token = 1 voto (questões procedimentais)
        QUADRATIC,   // sqrt(tokens) = votos (alocação recursos)
        LOGARITHMIC, // log2(tokens) = votos (questões técnicas)
        CONSENSUS    // aprovação binária (questões éticas)
    }
    
    /// @notice Estados de uma BIP (Brasil Improvement Proposal)
    enum ProposalState { 
        DRAFT,      // Em elaboração
        ACTIVE,     // Votação ativa
        SUCCEEDED,  // Aprovada
        DEFEATED,   // Rejeitada
        EXPIRED     // Expirou (apoptose)
    }
    
    /// @notice Estrutura de uma proposta
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string ipfsHash;          // Conteúdo completo no IPFS
        VoteType voteType;        // Função de votação usada
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;         // Peso dos votos a favor
        uint256 votesAgainst;     // Peso dos votos contra
        uint256 votersFor;        // Contagem de votantes a favor (para consenso)
        uint256 votersAgainst;    // Contagem de votantes contra (para consenso)
        uint256 totalVoters;      // Número de votantes
        uint256 quorumRequired;   // Quórum necessário (%)
        ProposalState state;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight; // Peso do voto
    }
    
    /// @notice Tags para detecção automática do tipo de votação
    struct ProposalTags {
        bool isProcedural;   // Linear
        bool isResourceAllocation; // Quadrática
        bool isTechnical;    // Logarítmica
        bool isEthical;      // Consenso
        uint256 budgetImpact; // Em tokens
        bool requiresExpertise; // Epistemocracia?
        bytes32 expertDomain; // Domínio de expertise necessário
    }
    
    // ============ STATE VARIABLES ============
    
    /// @notice Token de governança (IDS - Identidade Soberana)
    IERC20 public governanceToken;
    
    /// @notice Contrato DAOMitosis para rastreamento de atividade (Art. 5º-C)
    IDAOMitosis public daoMitosis;
    
    /// @notice Contrato RestorativeJustice para verificação de penalidades (Art. 6º)
    IRestorativeJustice public restorativeJustice;
    
    /// @notice Contrato AttentionTokens para priorização (Art. 6º-D)
    IAttentionTokens public attentionTokens;
    
    /// @notice ID da DAO principal (se aplicável)
    uint256 public daoId;
    
    /// @notice Contador de propostas
    uint256 public proposalCount;
    
    /// @notice Mapeamento de propostas
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Mapeamento de tags
    mapping(uint256 => ProposalTags) public proposalTags;
    
    /// @notice Especialistas verificados (Art. 7º-E - Epistemocracia)
    mapping(address => mapping(bytes32 => bool)) public verifiedExperts;
    
    /// @notice Multiplicador de especialista (máximo 2x)
    uint256 public constant MAX_EXPERT_MULTIPLIER = 2;
    
    /// @notice Tempo de expiração padrão (Art. 8º-F - Apoptose)
    uint256 public constant DEFAULT_EXPIRATION = 10 * 365 days;
    
    /// @notice Roles
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXPERT_VERIFIER_ROLE = keccak256("EXPERT_VERIFIER_ROLE");
    
    // ============ EVENTS ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        VoteType voteType
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight,
        VoteType voteType
    );
    
    event ProposalExecuted(uint256 indexed proposalId, ProposalState state);
    
    event ExpertVerified(address indexed expert, bytes32 indexed domain);
    
    event DAOMitosisIntegrationEnabled(address indexed mitosisContract, uint256 daoId);
    
    event AttentionTokensIntegrationEnabled(address indexed attentionContract);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXPERT_VERIFIER_ROLE, msg.sender);
    }
    
    // ============ CONFIGURATION ============
    
    /**
     * @notice Habilita integração com DAOMitosis para rastreamento de atividade
     * @param _daoMitosis Endereço do contrato DAOMitosis
     * @param _daoId ID da DAO no sistema de mitose
     */
    function setDAOMitosisIntegration(
        address _daoMitosis,
        uint256 _daoId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_daoMitosis != address(0), "Invalid mitosis address");
        daoMitosis = IDAOMitosis(_daoMitosis);
        daoId = _daoId;
        emit DAOMitosisIntegrationEnabled(_daoMitosis, _daoId);
    }
    
    /**
     * @notice Configura integração com RestorativeJustice
     * @param _restorativeJustice Endereço do contrato de justiça
     */
    function setRestorativeJusticeIntegration(
        address _restorativeJustice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_restorativeJustice != address(0), "Invalid justice address");
        restorativeJustice = IRestorativeJustice(_restorativeJustice);
    }
    
    /**
     * @notice Configura integração com AttentionTokens (Art. 6º-D)
     * @param _attentionTokens Endereço do contrato de tokens de atenção
     */
    function setAttentionTokensIntegration(
        address _attentionTokens
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_attentionTokens != address(0), "Invalid attention address");
        attentionTokens = IAttentionTokens(_attentionTokens);
        emit AttentionTokensIntegrationEnabled(_attentionTokens);
    }
    
    // ============ VOTING FUNCTIONS ============
    
    /**
     * @notice Determina automaticamente o tipo de votação baseado nas tags
     * @dev Implementa lógica biomimética de seleção contextual
     * @param tags Características da proposta
     * @return VoteType apropriado
     */
    function determineVoteType(ProposalTags memory tags) 
        public 
        pure 
        returns (VoteType) 
    {
        // Ética sempre usa consenso (valores fundamentais)
        if (tags.isEthical) {
            return VoteType.CONSENSUS;
        }
        
        // Técnico com expertise usa logarítmica (evita plutocracia)
        if (tags.isTechnical && tags.requiresExpertise) {
            return VoteType.LOGARITHMIC;
        }
        
        // Alocação de recursos usa quadrática (preferência individual)
        if (tags.isResourceAllocation || tags.budgetImpact > 0) {
            return VoteType.QUADRATIC;
        }
        
        // Procedimento simples usa linear (1 pessoa = 1 voto)
        if (tags.isProcedural) {
            return VoteType.LINEAR;
        }
        
        // Default: quadrática (mais balanceada)
        return VoteType.QUADRATIC;
    }
    
    /**
     * @notice Cria nova proposta (BIP)
     * @param title Título da proposta
     * @param ipfsHash Hash do conteúdo completo no IPFS
     * @param tags Tags para detecção automática
     * @param duration Duração da votação em segundos
     */
    function createProposal(
        string memory title,
        string memory ipfsHash,
        ProposalTags memory tags,
        uint256 duration
    ) 
        external 
        onlyRole(PROPOSER_ROLE) 
        returns (uint256) 
    {
        require(duration >= 1 days && duration <= 90 days, "Invalid duration");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.ipfsHash = ipfsHash;
        proposal.voteType = determineVoteType(tags);
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + duration;
        proposal.quorumRequired = 20; // 20% de quórum mínimo
        proposal.state = ProposalState.ACTIVE;
        
        proposalTags[proposalId] = tags;
        
        emit ProposalCreated(proposalId, msg.sender, title, proposal.voteType);
        
        return proposalId;
    }
    
    /**
     * @notice Vota em uma proposta
     * @param proposalId ID da proposta
     * @param support true para apoiar, false para rejeitar
     * @param tokens Quantidade de tokens a usar (para quadrática/logarítmica)
     */
    function vote(
        uint256 proposalId, 
        bool support, 
        uint256 tokens
    ) 
        external 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.state == ProposalState.ACTIVE, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(
            governanceToken.balanceOf(msg.sender) >= tokens,
            "Insufficient tokens"
        );
        
        // Art. 6º - Verifica se votante tem penalidade ativa
        if (address(restorativeJustice) != address(0)) {
            require(
                !restorativeJustice.hasActivePenalty(msg.sender),
                "Cannot vote: active reputation penalty"
            );
        }
        
        uint256 weight = calculateVoteWeight(
            proposal.voteType,
            tokens,
            msg.sender,
            proposalId
        );
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = weight;
        proposal.totalVoters++;
        
        if (support) {
            proposal.votesFor += weight;
            proposal.votersFor++;
        } else {
            proposal.votesAgainst += weight;
            proposal.votersAgainst++;
        }
        
        // Registra atividade no sistema de mitose (Art. 5º-C)
        if (address(daoMitosis) != address(0)) {
            try daoMitosis.recordActivity(daoId, msg.sender) {
                // Atividade registrada com sucesso
            } catch {
                // Falha silenciosa - não bloqueia votação
            }
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight, proposal.voteType);
    }
    
    /**
     * @notice Calcula o peso do voto baseado na função escolhida
     * @dev Implementa as 4 funções biomimético-cibernéticas
     */
    function calculateVoteWeight(
        VoteType voteType,
        uint256 tokens,
        address voter,
        uint256 proposalId
    ) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 baseWeight;
        uint256 DECIMALS = 1e18;
        
        // Aplica função matemática apropriada
        if (voteType == VoteType.LINEAR) {
            baseWeight = tokens;
        } 
        else if (voteType == VoteType.QUADRATIC) {
            // sqrt(tokens) preservando 18 decimais
            // Para tokens = x * 10^18, queremos sqrt(x) * 10^18
            // Então: sqrt(x * 10^18) = sqrt(x) * 10^9, mas queremos sqrt(x) * 10^18
            // Solução: sqrt(tokens) * sqrt(10^18) / 10^9 = sqrt(tokens) * 10^9
            baseWeight = sqrt(tokens) * 1e9;
        } 
        else if (voteType == VoteType.LOGARITHMIC) {
            // log2(tokens/10^18) * 10^18
            // Calcula log2 do valor normalizado e reaplica decimais
            uint256 normalized = tokens / DECIMALS;
            if (normalized == 0) normalized = 1;
            baseWeight = log2(normalized) * DECIMALS;
        } 
        else if (voteType == VoteType.CONSENSUS) {
            baseWeight = 1 * DECIMALS; // Todos iguais, mantém 18 decimais
        }
        
        // Aplica multiplicador de especialista (Art. 7º-E)
        if (proposalTags[proposalId].requiresExpertise) {
            bytes32 domain = proposalTags[proposalId].expertDomain;
            if (verifiedExperts[voter][domain]) {
                baseWeight = (baseWeight * MAX_EXPERT_MULTIPLIER);
            }
        }
        
        return baseWeight;
    }
    
    /**
     * @notice Executa proposta após votação
     * @param proposalId ID da proposta
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.state == ProposalState.ACTIVE, "Not active");
        require(block.timestamp > proposal.endTime, "Voting ongoing");
        
        // Verifica quórum
        bool quorumReached;
        
        if (proposal.voteType == VoteType.CONSENSUS) {
            // Para consenso, verificamos participação mínima absoluta
            // Pelo menos X pessoas devem votar (configurável)
            uint256 minParticipants = 5; // Mínimo de 5 participantes
            uint256 totalParticipants = proposal.votersFor + proposal.votersAgainst;
            quorumReached = totalParticipants >= minParticipants;
        } else {
            // Para outros tipos, verificamos % do total supply
            uint256 totalSupply = governanceToken.totalSupply();
            uint256 quorumVotes = (totalSupply * proposal.quorumRequired) / 100;
            uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
            quorumReached = totalVotes >= quorumVotes;
        }
        
        if (!quorumReached) {
            proposal.state = ProposalState.DEFEATED;
            emit ProposalExecuted(proposalId, ProposalState.DEFEATED);
            return;
        }
        
        // Lógica de aprovação depende do tipo
        bool approved;
        
        if (proposal.voteType == VoteType.CONSENSUS) {
            // Consenso: requer 80%+ de aprovação (baseado em número de pessoas)
            uint256 totalPeople = proposal.votersFor + proposal.votersAgainst;
            if (totalPeople == 0) {
                approved = false;
            } else {
                approved = (proposal.votersFor * 100) / totalPeople >= 80;
            }
        } else {
            // Outros: maioria simples dos votos (baseado em peso)
            approved = proposal.votesFor > proposal.votesAgainst;
        }
        
        proposal.state = approved ? ProposalState.SUCCEEDED : ProposalState.DEFEATED;
        
        // Art. 6º-D: Concede cashback de reputação para vencedores
        if (address(attentionTokens) != address(0)) {
            _processCashback(proposalId, approved);
        }
        
        emit ProposalExecuted(proposalId, proposal.state);
    }
    
    /**
     * @notice Processa cashback de tokens de atenção para vencedores
     * @param proposalId ID da proposta
     * @param approved Se a proposta foi aprovada
     */
    function _processCashback(uint256 proposalId, bool approved) internal {
        Proposal storage proposal = proposals[proposalId];
        
        // Coleta endereços de vencedores e perdedores
        address[] memory winners = new address[](proposal.totalVoters);
        address[] memory losers = new address[](proposal.totalVoters);
        uint256 winnerCount = 0;
        uint256 loserCount = 0;
        
        // Note: Esta é uma implementação simplificada
        // Em produção, seria melhor manter arrays de votantes
        // Por ora, isso requer integração externa para passar os arrays
        
        // Admin ou sistema externo deve chamar awardCashback com a lista correta
    }
    
    /**
     * @notice Concede cashback manualmente (chamado por admin após execução)
     * @param proposalId ID da proposta
     * @param winners Lista de endereços que votaram no lado vencedor
     * @param losers Lista de endereços que votaram no lado perdedor
     */
    function processCashbackManual(
        uint256 proposalId,
        address[] calldata winners,
        address[] calldata losers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(attentionTokens) != address(0), "Attention tokens not set");
        
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.state == ProposalState.SUCCEEDED || proposal.state == ProposalState.DEFEATED,
            "Proposal not finalized"
        );
        
        if (winners.length > 0) {
            attentionTokens.awardCashback(proposalId, winners);
        }
        
        if (losers.length > 0) {
            attentionTokens.recordLosingVote(proposalId, losers);
        }
    }
    
    // ============ EXPERT MANAGEMENT ============
    
    /**
     * @notice Verifica especialista em um domínio
     * @param expert Endereço do especialista
     * @param domain Domínio de expertise (ex: "climate", "healthcare")
     */
    function verifyExpert(address expert, bytes32 domain) 
        external 
        onlyRole(EXPERT_VERIFIER_ROLE) 
    {
        verifiedExperts[expert][domain] = true;
        emit ExpertVerified(expert, domain);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (
            address proposer,
            string memory title,
            VoteType voteType,
            uint256 votesFor,
            uint256 votesAgainst,
            ProposalState state
        ) 
    {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.title,
            p.voteType,
            p.votesFor,
            p.votesAgainst,
            p.state
        );
    }
    
    /**
     * @notice Retorna dados de atenção de uma proposta (Art. 6º-D)
     * @param proposalId ID da proposta
     * @return totalTokens Total de tokens alocados
     * @return uniqueAllocators Número de cidadãos únicos
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
        if (address(attentionTokens) == address(0)) {
            return (0, 0, false, false);
        }
        
        return attentionTokens.getProposalAttention(proposalId);
    }
    
    /**
     * @notice Verifica se proposta deve estar em fast-track
     * @param proposalId ID da proposta
     * @return Se atingiu threshold de fast-track (>5000 tokens)
     */
    function isFastTrackProposal(uint256 proposalId) external view returns (bool) {
        if (address(attentionTokens) == address(0)) {
            return false;
        }
        
        (,, bool isFastTrack,) = attentionTokens.getProposalAttention(proposalId);
        return isFastTrack;
    }
    
    /**
     * @notice Verifica se proposta é spam
     * @param proposalId ID da proposta
     * @return Se foi marcada como spam (<100 tokens em 48h)
     */
    function isSpamProposal(uint256 proposalId) external view returns (bool) {
        if (address(attentionTokens) == address(0)) {
            return false;
        }
        
        (,,, bool isSpam) = attentionTokens.getProposalAttention(proposalId);
        return isSpam;
    }
    
    // ============ MATH HELPERS ============
    
    /// @notice Raiz quadrada (Babylonian method)
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    /// @notice Logaritmo base 2 (aproximação)
    function log2(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 n = 0;
        while (x > 1) {
            x = x / 2;
            n++;
        }
        return n;
    }
}
