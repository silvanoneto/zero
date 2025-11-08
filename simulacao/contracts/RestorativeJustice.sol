// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRestorativeJustice.sol";
import "./mocks/VRFCoordinatorV2Mock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RestorativeJustice
 * @notice Implementação do sistema de Justiça Restaurativa (Artigo 6º da Constituição)
 * @dev Sistema de resolução de conflitos com mediação obrigatória e júris populares
 * 
 * PRINCÍPIOS CONSTITUCIONAIS:
 * 1. Mediação obrigatória antes de julgamento
 * 2. Júris populares descentralizados (12 jurados aleatórios)
 * 3. Sistema de reputação para mediadores
 * 4. Foco em restauração, não punição
 * 5. Transparência total do processo
 * 
 * SECURITY:
 * - Chainlink VRF v2 para seleção verdadeiramente aleatória de jurados
 * - Fallback para pseudo-random se VRF não configurado
 * - Mock implementation para testes, usar Chainlink real em produção
 * 
 * @author Cybersyn 2.0 Team
 * @custom:security-contact security@cybersyn.org
 */
contract RestorativeJustice is IRestorativeJustice, Ownable, ReentrancyGuard, VRFConsumerBaseV2Mock {
    
    // ============ CONSTANTES ============
    
    uint256 public constant MEDIATION_PERIOD = 14 days;        // Prazo para mediação
    uint256 public constant TRIAL_PERIOD = 21 days;            // Prazo para julgamento
    uint256 public constant JURY_SIZE = 12;                    // Número de jurados
    uint256 public constant MIN_MEDIATOR_REPUTATION = 500;     // Reputação mínima para mediar
    uint256 public constant INITIAL_MEDIATOR_REPUTATION = 700; // Reputação inicial
    uint256 public constant MAX_REPUTATION = 1000;             // Reputação máxima
    uint256 public constant REPUTATION_DECAY = 10;             // Decay por mediação falha
    uint256 public constant REPUTATION_GAIN = 20;              // Ganho por mediação bem-sucedida
    
    // ============ STORAGE ============
    
    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    
    /// @notice Mapping de requestId do VRF para disputeId
    mapping(uint256 => uint256) private _vrfRequestToDispute;
    
    /// @notice Flag para habilitar/desabilitar VRF
    bool public vrfEnabled;
    
    /// @notice Contador de disputas
    uint256 private _disputeCounter;
    
    /// @notice Mapping de disputas por ID
    mapping(uint256 => Dispute) private _disputes;
    
    /// @notice Mapping de mediadores por endereço
    mapping(address => Mediator) private _mediators;
    
    /// @notice Mapping de votos por disputa
    mapping(uint256 => JuryVote[]) private _juryVotes;
    
    /// @notice Mapping de disputas por participante
    mapping(address => uint256[]) private _disputesByParticipant;
    
    /// @notice Mapping de disputas onde endereço é jurado
    mapping(uint256 => mapping(address => bool)) private _isJurorInDispute;
    
    /// @notice Mapping de votos já realizados
    mapping(uint256 => mapping(address => bool)) private _hasVoted;
    
    /// @notice Lista de mediadores ativos
    address[] private _activeMediators;
    
    /// @notice Mapping de penalidades ativas (endereço => deadline)
    mapping(address => uint256) private _reputationPenaltyDeadline;
    
    /// @notice Pool de cidadãos elegíveis para júri
    address[] private _eligibleJurors;
    mapping(address => bool) private _isEligibleJuror;
    
    /// @notice Estatísticas do sistema
    uint256 private _totalMediations;
    uint256 private _successfulMediations;
    uint256 private _totalTrials;
    uint256 private _totalResolutions;
    
    // ============ MODIFICADORES ============
    
    /// @notice Apenas participantes da disputa
    modifier onlyParticipant(uint256 disputeId) {
        Dispute storage dispute = _disputes[disputeId];
        require(
            msg.sender == dispute.plaintiff || msg.sender == dispute.defendant,
            "RestorativeJustice: not a participant"
        );
        _;
    }
    
    /// @notice Apenas mediador da disputa
    modifier onlyMediator(uint256 disputeId) {
        require(
            _disputes[disputeId].mediator == msg.sender,
            "RestorativeJustice: not the mediator"
        );
        _;
    }
    
    /// @notice Apenas jurado da disputa
    modifier onlyJuror(uint256 disputeId) {
        require(
            _isJurorInDispute[disputeId][msg.sender],
            "RestorativeJustice: not a juror"
        );
        _;
    }
    
    /// @notice Checa status da disputa
    modifier inStatus(uint256 disputeId, DisputeStatus status) {
        require(
            _disputes[disputeId].status == status,
            "RestorativeJustice: invalid dispute status"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @notice Construtor com parâmetros do Chainlink VRF
     * @param vrfCoordinator Endereço do VRF Coordinator (usar address(0) para desabilitar VRF)
     * @param subscriptionId ID da assinatura do Chainlink VRF
     * @param keyHash Gas lane key hash do Chainlink VRF
     * @param callbackGasLimit Limite de gas para callback
     */
    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) 
        Ownable(msg.sender) 
        VRFConsumerBaseV2Mock(vrfCoordinator)
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        
        // VRF DESABILITADO por padrão (deve ser habilitado manualmente via setVrfEnabled)
        vrfEnabled = false;
        
        _disputeCounter = 0;
    }
    
    // ============ FUNÇÕES PÚBLICAS - DISPUTAS ============
    
    /// @inheritdoc IRestorativeJustice
    function createDispute(
        address defendant,
        string calldata evidenceIPFSHash
    ) external override returns (uint256 disputeId) {
        require(defendant != address(0), "RestorativeJustice: invalid defendant");
        require(defendant != msg.sender, "RestorativeJustice: cannot dispute yourself");
        require(bytes(evidenceIPFSHash).length > 0, "RestorativeJustice: evidence required");
        
        disputeId = ++_disputeCounter;
        
        Dispute storage dispute = _disputes[disputeId];
        dispute.id = disputeId;
        dispute.plaintiff = msg.sender;
        dispute.defendant = defendant;
        dispute.evidenceIPFSHash = evidenceIPFSHash;
        dispute.status = DisputeStatus.PENDING_MEDIATION;
        dispute.createdAt = block.timestamp;
        
        // Registra disputa para ambos participantes
        _disputesByParticipant[msg.sender].push(disputeId);
        _disputesByParticipant[defendant].push(disputeId);
        
        emit DisputeCreated(disputeId, msg.sender, defendant, evidenceIPFSHash);
    }
    
    /// @inheritdoc IRestorativeJustice
    function dismissDispute(uint256 disputeId) 
        external 
        override 
        onlyParticipant(disputeId)
        nonReentrant
    {
        Dispute storage dispute = _disputes[disputeId];
        require(
            dispute.status == DisputeStatus.PENDING_MEDIATION || 
            dispute.status == DisputeStatus.IN_MEDIATION,
            "RestorativeJustice: cannot dismiss at this stage"
        );
        
        dispute.status = DisputeStatus.DISMISSED;
        dispute.resolvedAt = block.timestamp;
        
        emit VerdictReached(disputeId, false, RestorationType.MEDIATED_AGREEMENT, "Dispute dismissed by mutual agreement");
    }
    
    // ============ FUNÇÕES PÚBLICAS - MEDIAÇÃO ============
    
    /// @inheritdoc IRestorativeJustice
    function registerAsMediator() external override {
        require(
            _mediators[msg.sender].mediatorAddress == address(0),
            "RestorativeJustice: already registered"
        );
        
        Mediator storage mediator = _mediators[msg.sender];
        mediator.mediatorAddress = msg.sender;
        mediator.reputationScore = INITIAL_MEDIATOR_REPUTATION;
        mediator.isActive = true;
        mediator.registeredAt = block.timestamp;
        
        _activeMediators.push(msg.sender);
        
        emit MediatorRegistered(msg.sender, block.timestamp);
    }
    
    /// @inheritdoc IRestorativeJustice
    function acceptMediation(uint256 disputeId) 
        external 
        override 
        inStatus(disputeId, DisputeStatus.PENDING_MEDIATION)
    {
        Mediator storage mediator = _mediators[msg.sender];
        require(mediator.isActive, "RestorativeJustice: mediator not active");
        require(
            mediator.reputationScore >= MIN_MEDIATOR_REPUTATION,
            "RestorativeJustice: insufficient reputation"
        );
        
        Dispute storage dispute = _disputes[disputeId];
        dispute.mediator = msg.sender;
        dispute.status = DisputeStatus.IN_MEDIATION;
        dispute.mediationDeadline = block.timestamp + MEDIATION_PERIOD;
        
        _totalMediations++;
        
        emit MediatorAssigned(disputeId, msg.sender, dispute.mediationDeadline);
    }
    
    /// @inheritdoc IRestorativeJustice
    function completeMediationSuccessfully(
        uint256 disputeId,
        string calldata resolution
    ) 
        external 
        override 
        onlyMediator(disputeId)
        inStatus(disputeId, DisputeStatus.IN_MEDIATION)
    {
        require(bytes(resolution).length > 0, "RestorativeJustice: resolution required");
        
        Dispute storage dispute = _disputes[disputeId];
        dispute.status = DisputeStatus.RESOLUTION_COMPLETED;
        dispute.resolutionType = RestorationType.MEDIATED_AGREEMENT;
        dispute.resolutionDetails = resolution;
        dispute.resolvedAt = block.timestamp;
        
        // Atualiza reputação do mediador
        Mediator storage mediator = _mediators[msg.sender];
        mediator.successfulMediations++;
        mediator.casesMediated++;
        
        if (mediator.reputationScore < MAX_REPUTATION) {
            mediator.reputationScore = _min(
                mediator.reputationScore + REPUTATION_GAIN,
                MAX_REPUTATION
            );
        }
        
        _successfulMediations++;
        _totalResolutions++;
        
        emit MediationCompleted(disputeId, true, resolution);
        emit MediatorReputationUpdated(msg.sender, mediator.reputationScore, mediator.casesMediated);
        emit ResolutionCompleted(disputeId, dispute.defendant, block.timestamp);
    }
    
    /// @inheritdoc IRestorativeJustice
    function failMediation(
        uint256 disputeId,
        string calldata reason
    ) 
        external 
        override 
        onlyMediator(disputeId)
        inStatus(disputeId, DisputeStatus.IN_MEDIATION)
    {
        Dispute storage dispute = _disputes[disputeId];
        dispute.status = DisputeStatus.MEDIATION_FAILED;
        
        // Atualiza reputação do mediador
        Mediator storage mediator = _mediators[msg.sender];
        mediator.failedMediations++;
        mediator.casesMediated++;
        
        if (mediator.reputationScore > REPUTATION_DECAY) {
            mediator.reputationScore -= REPUTATION_DECAY;
        }
        
        emit MediationCompleted(disputeId, false, reason);
        emit MediatorReputationUpdated(msg.sender, mediator.reputationScore, mediator.casesMediated);
    }
    
    // ============ FUNÇÕES PÚBLICAS - JÚRI ============
    
    /// @inheritdoc IRestorativeJustice
    function conveneJury(uint256 disputeId) 
        external 
        override 
        inStatus(disputeId, DisputeStatus.MEDIATION_FAILED)
    {
        Dispute storage dispute = _disputes[disputeId];
        
        // Se VRF habilitado, solicita randomness do Chainlink
        if (vrfEnabled) {
            uint256 requestId = i_vrfCoordinator.requestRandomWords(
                i_keyHash,
                i_subscriptionId,
                REQUEST_CONFIRMATIONS,
                i_callbackGasLimit,
                1 // Precisamos de apenas 1 número aleatório
            );
            
            _vrfRequestToDispute[requestId] = disputeId;
            dispute.status = DisputeStatus.PENDING_VRF; // Novo status
            
            emit VrfRandomnessRequested(disputeId, requestId);
            return;
        }
        
        // Fallback: Seleção pseudo-aleatória
        _conveneJuryWithRandomness(disputeId, 0);
    }
    
    /**
     * @notice Callback do Chainlink VRF com randomness
     * @param requestId ID da requisição
     * @param randomWords Array de palavras aleatórias
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 disputeId = _vrfRequestToDispute[requestId];
        require(disputeId != 0, "Invalid VRF request");
        
        _conveneJuryWithRandomness(disputeId, randomWords[0]);
        
        emit VrfRandomnessFulfilled(disputeId, requestId);
        
        // Limpa o mapping
        delete _vrfRequestToDispute[requestId];
    }
    
    /**
     * @notice Convoca júri usando valor de randomness fornecido
     * @param disputeId ID da disputa
     * @param randomSeed Semente aleatória (0 para fallback pseudo-random)
     */
    function _conveneJuryWithRandomness(uint256 disputeId, uint256 randomSeed) internal {
        Dispute storage dispute = _disputes[disputeId];
        
        // Seleciona 12 jurados aleatórios
        address[] memory jurors = _selectRandomJurors(disputeId, randomSeed);
        
        dispute.jurors = jurors;
        dispute.status = DisputeStatus.IN_TRIAL;
        dispute.trialDeadline = block.timestamp + TRIAL_PERIOD;
        
        // Marca endereços como jurados
        for (uint256 i = 0; i < jurors.length; i++) {
            _isJurorInDispute[disputeId][jurors[i]] = true;
        }
        
        _totalTrials++;
        
        emit JuryConvened(disputeId, jurors, dispute.trialDeadline);
    }
    
    /// @inheritdoc IRestorativeJustice
    function castJuryVote(
        uint256 disputeId,
        bool guiltyVote,
        RestorationType suggestedResolution,
        string calldata reasoning
    ) 
        external 
        override 
        onlyJuror(disputeId)
        inStatus(disputeId, DisputeStatus.IN_TRIAL)
    {
        require(!_hasVoted[disputeId][msg.sender], "RestorativeJustice: already voted");
        require(bytes(reasoning).length > 0, "RestorativeJustice: reasoning required");
        
        JuryVote memory vote = JuryVote({
            juror: msg.sender,
            guiltyVote: guiltyVote,
            suggestedResolution: suggestedResolution,
            reasoning: reasoning,
            votedAt: block.timestamp
        });
        
        _juryVotes[disputeId].push(vote);
        _hasVoted[disputeId][msg.sender] = true;
        
        emit JuryVoteCast(disputeId, msg.sender, guiltyVote);
    }
    
    /// @inheritdoc IRestorativeJustice
    function finalizeVerdict(uint256 disputeId) 
        external 
        override 
        inStatus(disputeId, DisputeStatus.IN_TRIAL)
    {
        Dispute storage dispute = _disputes[disputeId];
        JuryVote[] storage votes = _juryVotes[disputeId];
        
        require(votes.length >= JURY_SIZE, "RestorativeJustice: not all jurors voted");
        
        // Conta votos
        uint256 guiltyCount = 0;
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].guiltyVote) {
                guiltyCount++;
            }
        }
        
        // Maioria simples (7+/12)
        bool guilty = guiltyCount > (JURY_SIZE / 2);
        
        dispute.status = DisputeStatus.VERDICT_REACHED;
        
        if (guilty) {
            // Seleciona tipo de resolução mais votado
            RestorationType chosenResolution = _getMostVotedResolution(disputeId);
            dispute.resolutionType = chosenResolution;
            dispute.status = DisputeStatus.PENDING_JURY; // Aguarda cumprimento
            
            emit VerdictReached(disputeId, true, chosenResolution, "Guilty verdict - resolution pending");
        } else {
            dispute.status = DisputeStatus.RESOLUTION_COMPLETED;
            dispute.resolvedAt = block.timestamp;
            _totalResolutions++;
            
            emit VerdictReached(disputeId, false, RestorationType.MEDIATED_AGREEMENT, "Not guilty verdict");
            emit ResolutionCompleted(disputeId, dispute.defendant, block.timestamp);
        }
    }
    
    /// @inheritdoc IRestorativeJustice
    function completeResolution(
        uint256 disputeId,
        string calldata proofIPFSHash
    ) 
        external 
        override 
        nonReentrant
    {
        Dispute storage dispute = _disputes[disputeId];
        require(
            dispute.status == DisputeStatus.VERDICT_REACHED || 
            dispute.status == DisputeStatus.PENDING_JURY,
            "RestorativeJustice: invalid status"
        );
        require(bytes(proofIPFSHash).length > 0, "RestorativeJustice: proof required");
        
        dispute.status = DisputeStatus.RESOLUTION_COMPLETED;
        dispute.resolutionDetails = string(abi.encodePacked(
            dispute.resolutionDetails,
            " | Proof: ",
            proofIPFSHash
        ));
        dispute.resolvedAt = block.timestamp;
        
        _totalResolutions++;
        
        // Se tipo de resolução for REPUTATION_PENALTY, aplica penalidade
        if (dispute.resolutionType == RestorationType.REPUTATION_PENALTY) {
            _reputationPenaltyDeadline[dispute.defendant] = block.timestamp + 180 days; // 6 meses
        }
        
        emit ResolutionCompleted(disputeId, dispute.defendant, block.timestamp);
    }
    
    // ============ FUNÇÕES PÚBLICAS - ELEGIBILIDADE ============
    
    /// @inheritdoc IRestorativeJustice
    function registerAsEligibleJuror(address citizen) external override onlyOwner {
        require(citizen != address(0), "RestorativeJustice: invalid address");
        require(!_isEligibleJuror[citizen], "RestorativeJustice: already registered");
        
        _eligibleJurors.push(citizen);
        _isEligibleJuror[citizen] = true;
    }
    
    /// @inheritdoc IRestorativeJustice
    function removeEligibleJuror(address citizen) external override onlyOwner {
        require(_isEligibleJuror[citizen], "RestorativeJustice: not registered");
        
        _isEligibleJuror[citizen] = false;
        
        // Remove do array
        for (uint256 i = 0; i < _eligibleJurors.length; i++) {
            if (_eligibleJurors[i] == citizen) {
                _eligibleJurors[i] = _eligibleJurors[_eligibleJurors.length - 1];
                _eligibleJurors.pop();
                break;
            }
        }
    }
    
    // ============ FUNÇÕES ADMIN - VRF ============
    
    /**
     * @notice Habilita ou desabilita o uso do Chainlink VRF
     * @param enabled True para habilitar, false para usar fallback pseudo-random
     * @dev Apenas owner pode chamar. VRF deve estar configurado no construtor.
     */
    function setVrfEnabled(bool enabled) external onlyOwner {
        require(address(i_vrfCoordinator) != address(0), "VRF not configured");
        vrfEnabled = enabled;
        emit VrfStatusChanged(enabled);
    }
    
    /**
     * @notice Evento emitido quando status do VRF muda
     * @param enabled Novo status
     */
    event VrfStatusChanged(bool enabled);
    
    /**
     * @notice Evento emitido quando VRF solicita randomness
     * @param disputeId ID da disputa
     * @param requestId ID da requisição VRF
     */
    event VrfRandomnessRequested(uint256 indexed disputeId, uint256 requestId);
    
    /**
     * @notice Evento emitido quando VRF cumpre randomness
     * @param disputeId ID da disputa
     * @param requestId ID da requisição VRF
     */
    event VrfRandomnessFulfilled(uint256 indexed disputeId, uint256 requestId);
    
    // ============ FUNÇÕES VIEW ============
    
    /// @inheritdoc IRestorativeJustice
    function getDispute(uint256 disputeId) 
        external 
        view 
        override 
        returns (Dispute memory) 
    {
        return _disputes[disputeId];
    }
    
    /// @inheritdoc IRestorativeJustice
    function getMediator(address mediatorAddress) 
        external 
        view 
        override 
        returns (Mediator memory) 
    {
        return _mediators[mediatorAddress];
    }
    
    /// @inheritdoc IRestorativeJustice
    function getJuryVotes(uint256 disputeId) 
        external 
        view 
        override 
        returns (JuryVote[] memory) 
    {
        return _juryVotes[disputeId];
    }
    
    /// @inheritdoc IRestorativeJustice
    function getDisputesByParticipant(address participant) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _disputesByParticipant[participant];
    }
    
    /// @inheritdoc IRestorativeJustice
    function getActiveMediators(uint256 minReputation) 
        external 
        view 
        override 
        returns (address[] memory) 
    {
        uint256 count = 0;
        
        // Conta mediadores qualificados
        for (uint256 i = 0; i < _activeMediators.length; i++) {
            Mediator storage mediator = _mediators[_activeMediators[i]];
            if (mediator.isActive && mediator.reputationScore >= minReputation) {
                count++;
            }
        }
        
        // Cria array
        address[] memory qualified = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _activeMediators.length; i++) {
            Mediator storage mediator = _mediators[_activeMediators[i]];
            if (mediator.isActive && mediator.reputationScore >= minReputation) {
                qualified[index] = _activeMediators[i];
                index++;
            }
        }
        
        return qualified;
    }
    
    /// @inheritdoc IRestorativeJustice
    function isJuror(uint256 disputeId, address account) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _isJurorInDispute[disputeId][account];
    }
    
    /// @inheritdoc IRestorativeJustice
    function hasActivePenalty(address account) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _reputationPenaltyDeadline[account] > block.timestamp;
    }
    
    /// @inheritdoc IRestorativeJustice
    function getEligibleJurors() 
        external 
        view 
        override 
        returns (address[] memory) 
    {
        // Conta jurados elegíveis ativos
        uint256 count = 0;
        for (uint256 i = 0; i < _eligibleJurors.length; i++) {
            if (_isEligibleJuror[_eligibleJurors[i]]) {
                count++;
            }
        }
        
        // Cria array filtrado
        address[] memory eligible = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _eligibleJurors.length; i++) {
            if (_isEligibleJuror[_eligibleJurors[i]]) {
                eligible[index] = _eligibleJurors[i];
                index++;
            }
        }
        
        return eligible;
    }
    
    /// @inheritdoc IRestorativeJustice
    function getSystemStats() 
        external 
        view 
        override 
        returns (
            uint256 totalDisputes,
            uint256 activeMediations,
            uint256 activeTrials,
            uint256 resolutionRate
        ) 
    {
        totalDisputes = _disputeCounter;
        
        // Conta mediações e julgamentos ativos
        for (uint256 i = 1; i <= _disputeCounter; i++) {
            DisputeStatus status = _disputes[i].status;
            if (status == DisputeStatus.IN_MEDIATION || status == DisputeStatus.PENDING_MEDIATION) {
                activeMediations++;
            }
            if (status == DisputeStatus.IN_TRIAL || status == DisputeStatus.PENDING_JURY) {
                activeTrials++;
            }
        }
        
        // Taxa de resolução (%)
        if (_totalMediations > 0) {
            resolutionRate = (_successfulMediations * 100) / _totalMediations;
        }
    }
    
    // ============ FUNÇÕES INTERNAS ============
    
    /**
     * @notice Seleciona jurados aleatórios
     * @dev Usa Chainlink VRF se habilitado, senão pseudo-random
     * @param disputeId ID da disputa
     * @param randomSeed Semente aleatória do VRF (0 para fallback)
     * @return Array de endereços de jurados
     */
    function _selectRandomJurors(uint256 disputeId, uint256 randomSeed) 
        internal 
        view 
        returns (address[] memory) 
    {
        address[] memory jurors = new address[](JURY_SIZE);
        
        // Se há pool de elegíveis suficiente, usa ele
        if (_eligibleJurors.length >= JURY_SIZE) {
            uint256 seed;
            
            // Usa randomness do VRF se fornecido, senão fallback
            if (randomSeed != 0) {
                seed = randomSeed;
            } else {
                // Fallback pseudo-aleatório
                seed = uint256(keccak256(abi.encodePacked(
                    disputeId,
                    block.timestamp,
                    block.prevrandao
                )));
            }
            
            // Seleciona JURY_SIZE jurados aleatórios sem repetição
            address[] memory pool = new address[](_eligibleJurors.length);
            for (uint256 i = 0; i < _eligibleJurors.length; i++) {
                pool[i] = _eligibleJurors[i];
            }
            uint256 poolSize = pool.length;
            
            for (uint256 i = 0; i < JURY_SIZE; i++) {
                // Gera índice aleatório usando seed
                uint256 index = uint256(keccak256(abi.encodePacked(seed, i))) % poolSize;
                jurors[i] = pool[index];
                
                // Remove do pool (swap com último e reduz tamanho)
                pool[index] = pool[poolSize - 1];
                poolSize--;
            }
        } else {
            // Fallback: gera endereços mock (testnet/desenvolvimento)
            for (uint256 i = 0; i < JURY_SIZE; i++) {
                bytes32 hash = keccak256(abi.encodePacked(
                    disputeId,
                    block.timestamp,
                    blockhash(block.number - 1),
                    i
                ));
                jurors[i] = address(uint160(uint256(hash)));
            }
        }
        
        return jurors;
    }
    
    /**
     * @notice Retorna tipo de resolução mais votado
     * @param disputeId ID da disputa
     * @return Tipo de resolução
     */
    function _getMostVotedResolution(uint256 disputeId) 
        internal 
        view 
        returns (RestorationType) 
    {
        JuryVote[] storage votes = _juryVotes[disputeId];
        
        // Conta votos por tipo
        uint256[6] memory counts; // 6 tipos de RestorationType
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].guiltyVote) {
                uint8 resType = uint8(votes[i].suggestedResolution);
                counts[resType]++;
            }
        }
        
        // Encontra máximo
        uint256 maxCount = 0;
        uint8 maxType = 0;
        
        for (uint8 i = 0; i < 6; i++) {
            if (counts[i] > maxCount) {
                maxCount = counts[i];
                maxType = i;
            }
        }
        
        return RestorationType(maxType);
    }
    
    /**
     * @notice Retorna menor de dois valores
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
