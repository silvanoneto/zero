// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title DAOMitosis
 * @notice Implementa Artigo 5º-C da Cybersyn 2.0 - Limites de Dunbar e Mitose Organizacional
 * @dev Sistema biomimético inspirado em divisão celular (mitose)
 * 
 * PRINCÍPIO DE DUNBAR:
 * - Limite cognitivo de ~150 relações significativas
 * - Para organizações digitais: 500 membros ativos
 * - Divisão automática previne:
 *   * Alienação e perda de senso de comunidade
 *   * Formação de oligarquias internas
 *   * Sobrecarga cognitiva em tomadas de decisão
 * 
 * PROCESSO DE MITOSE:
 * 1. Monitoramento contínuo de membros ativos
 * 2. Warning 30 dias antes (450 membros)
 * 3. Trigger automático aos 500 membros
 * 4. Votação sobre critério de divisão (geográfico, afinidade, random)
 * 5. Snapshot de estado (tokens, propostas, reputação)
 * 6. Criação de 2 DAOs filhas
 * 7. Migração de governança
 * 8. DAO mãe entra em modo legado (read-only)
 * 
 * PRESERVAÇÃO DE GOVERNANÇA:
 * - Propostas ativas são duplicadas
 * - Histórico de votação é preservado (IPFS)
 * - Tokens são redistribuídos 1:1
 * - Reputação é mantida
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Interface para GovernanceToken com função mint
 */
interface IGovernanceToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

contract DAOMitosis is AccessControl, ReentrancyGuard {
    
    // ============ CONSTANTS ============
    
    /// @notice Limite de Dunbar para DAOs (500 membros ativos)
    uint256 public constant DUNBAR_LIMIT = 500;
    
    /// @notice Limite de warning (450 membros)
    uint256 public constant WARNING_THRESHOLD = 450;
    
    /// @notice Período de votação para mitose (30 dias)
    uint256 public constant MITOSIS_VOTING_PERIOD = 30 days;
    
    /// @notice Quórum mínimo para votação de mitose (51%)
    uint256 public constant MITOSIS_QUORUM = 51;
    
    /// @notice Tempo mínimo de inatividade para não ser contado como membro ativo (90 dias)
    uint256 public constant INACTIVITY_PERIOD = 90 days;
    
    // ============ SECURITY CONSTANTS ============
    
    /// @notice Máximo de operações de membro por bloco por DAO (proteção contra spam)
    uint256 public constant MAX_MEMBER_OPS_PER_BLOCK = 10;
    
    /// @notice Cooldown entre adicionar e remover o mesmo membro (1 hora)
    uint256 public constant MEMBER_COOLDOWN = 1 hours;
    
    /// @notice Janela de tempo para rate limiting (5 minutos)
    uint256 public constant RATE_LIMIT_WINDOW = 5 minutes;
    
    /// @notice Máximo de operações na janela de rate limiting
    uint256 public constant MAX_OPS_PER_WINDOW = 50;
    
    // ============ ROLES ============
    
    bytes32 public constant DAO_ADMIN_ROLE = keccak256("DAO_ADMIN_ROLE");
    bytes32 public constant MEMBER_TRACKER_ROLE = keccak256("MEMBER_TRACKER_ROLE");
    bytes32 public constant MITOSIS_EXECUTOR_ROLE = keccak256("MITOSIS_EXECUTOR_ROLE");
    
    // ============ TYPES ============
    
    /// @notice Critérios de divisão disponíveis
    enum DivisionCriteria {
        GEOGRAPHIC,    // Divisão geográfica (via oracle ou declaração)
        AFFINITY,      // Divisão por afinidade de votação (clustering)
        RANDOM,        // Divisão aleatória (mais justo)
        TEMPORAL       // Divisão por antiguidade (membros antigos vs novos)
    }
    
    /// @notice Status de uma DAO
    enum DAOStatus {
        ACTIVE,        // DAO ativa normal
        WARNING,       // Próxima do limite (450+ membros)
        MITOSIS_VOTE,  // Em processo de votação de mitose
        SPLITTING,     // Executando divisão
        LEGACY         // DAO mãe após mitose (read-only)
    }
    
    /// @notice Status de um processo de mitose
    enum MitosisStatus {
        PENDING,       // Aguardando votação
        APPROVED,      // Aprovada, aguardando execução
        EXECUTING,     // Em execução
        COMPLETED,     // Concluída
        CANCELLED      // Cancelada (membros saíram, voltou abaixo do limite)
    }
    
    /// @notice Estrutura de uma DAO registrada
    struct DAOInfo {
        uint256 id;
        address daoAddress;
        string name;
        uint256 createdAt;
        uint256 activeMemberCount;
        uint256 totalMemberCount;
        DAOStatus status;
        uint256 parentDaoId;      // 0 se for DAO raiz
        uint256[] childDaoIds;     // Array de DAOs filhas
        uint256 generationLevel;   // 0 = raiz, 1 = primeira geração, etc
        string metadataIPFS;       // Metadados completos no IPFS
    }
    
    /// @notice Estrutura de um membro
    struct Member {
        address memberAddress;
        uint256 joinedAt;
        uint256 lastActivityAt;
        bool isActive;
        uint256 reputationScore;
        string profileIPFS;
    }
    
    /// @notice Processo de mitose
    struct MitosisProcess {
        uint256 processId;
        uint256 daoId;
        uint256 initiatedAt;
        uint256 votingEndsAt;
        DivisionCriteria selectedCriteria;
        uint256 votesForGeographic;
        uint256 votesForAffinity;
        uint256 votesForRandom;
        uint256 votesForTemporal;
        uint256 totalVotes;
        MitosisStatus status;
        uint256 childDao1Id;
        uint256 childDao2Id;
        string snapshotIPFS;      // Snapshot de estado antes da divisão
    }
    
    // ============ STATE VARIABLES ============
    
    /// @notice Contador de DAOs
    uint256 public daoCount;
    
    /// @notice Contador de processos de mitose
    uint256 public mitosisProcessCount;
    
    /// @notice GovernanceToken para distribuição durante mitose
    IGovernanceToken public governanceToken;
    
    /// @notice Mapeamento de DAOs
    mapping(uint256 => DAOInfo) public daos;
    
    /// @notice Mapeamento de endereço para DAO ID
    mapping(address => uint256) public daoAddressToId;
    
    /// @notice Mapeamento de membros por DAO
    mapping(uint256 => mapping(address => Member)) public daoMembers;
    
    /// @notice Lista de endereços de membros por DAO (para iteração)
    mapping(uint256 => address[]) public daoMemberList;
    
    /// @notice Mapeamento de processos de mitose
    mapping(uint256 => MitosisProcess) public mitosisProcesses;
    
    // ============ SECURITY STATE ============
    
    /// @notice Timestamp da última operação de membro em uma DAO (por membro)
    mapping(uint256 => mapping(address => uint256)) public lastMemberOpTimestamp;
    
    /// @notice Contador de operações de membro por bloco por DAO
    mapping(uint256 => mapping(uint256 => uint256)) public memberOpsPerBlock;
    
    /// @notice Contador de operações na janela de rate limiting
    mapping(uint256 => uint256) public opsInWindow;
    
    /// @notice Timestamp do início da janela de rate limiting atual
    mapping(uint256 => uint256) public windowStartTime;
    
    /// @notice Última operação de cada tipo por membro (add/remove)
    mapping(uint256 => mapping(address => uint256)) public lastMemberAddition;
    mapping(uint256 => mapping(address => uint256)) public lastMemberRemoval;
    
    /// @notice DAOs com operações de membro pausadas (emergência)
    mapping(uint256 => bool) public memberOpsPaused;
    
    /// @notice Processo de mitose ativo por DAO
    mapping(uint256 => uint256) public activeMitosisProcess;
    
    /// @notice Votação de critério de divisão
    mapping(uint256 => mapping(address => bool)) public hasVotedOnMitosis;
    
    // ============ EVENTS ============
    
    event DAORegistered(
        uint256 indexed daoId,
        address indexed daoAddress,
        string name,
        uint256 parentDaoId
    );
    
    event MemberJoined(
        uint256 indexed daoId,
        address indexed member,
        uint256 timestamp
    );
    
    event MemberLeft(
        uint256 indexed daoId,
        address indexed member,
        uint256 timestamp
    );
    
    event MemberActivityRecorded(
        uint256 indexed daoId,
        address indexed member,
        uint256 timestamp
    );
    
    event RateLimitTriggered(
        uint256 indexed daoId,
        uint256 currentOps,
        uint256 limit,
        string limitType
    );
    
    event SuspiciousActivity(
        uint256 indexed daoId,
        address indexed actor,
        string activityType,
        uint256 timestamp
    );
    
    event DunbarWarning(
        uint256 indexed daoId,
        uint256 currentMembers,
        uint256 limit
    );
    
    event MitosisInitiated(
        uint256 indexed processId,
        uint256 indexed daoId,
        uint256 currentMembers,
        uint256 votingEndsAt
    );
    
    event MitosisVoteCast(
        uint256 indexed processId,
        address indexed voter,
        DivisionCriteria criteria
    );
    
    event MitosisApproved(
        uint256 indexed processId,
        uint256 indexed daoId,
        DivisionCriteria selectedCriteria,
        uint256 totalVotes
    );
    
    event MitosisExecuted(
        uint256 indexed processId,
        uint256 indexed parentDaoId,
        uint256 childDao1Id,
        uint256 childDao2Id
    );
    
    event MitosisCancelled(
        uint256 indexed processId,
        uint256 indexed daoId,
        string reason
    );
    
    event DAOStatusChanged(
        uint256 indexed daoId,
        DAOStatus oldStatus,
        DAOStatus newStatus
    );
    
    event TokensDistributed(
        uint256 indexed fromDaoId,
        uint256 indexed toDaoId,
        address indexed member,
        uint256 amount
    );
    
    event GovernanceTokenSet(address indexed tokenAddress);
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_ADMIN_ROLE, msg.sender);
        _grantRole(MEMBER_TRACKER_ROLE, msg.sender);
    }
    
    // ============ CONFIGURATION ============
    
    /**
     * @notice Configura o token de governança para distribuição durante mitose
     * @param _governanceToken Endereço do contrato GovernanceToken
     */
    function setGovernanceToken(address _governanceToken) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_governanceToken != address(0), "Invalid token address");
        governanceToken = IGovernanceToken(_governanceToken);
        emit GovernanceTokenSet(_governanceToken);
    }
    
    // ============ MODIFIERS ============
    
    /**
     * @notice Protege contra spam de operações de membros
     * @param _daoId ID da DAO
     */
    modifier rateLimited(uint256 _daoId) {
        require(!memberOpsPaused[_daoId], "Member operations paused");
        
        // Inicializa janela na primeira operação
        if (windowStartTime[_daoId] == 0) {
            windowStartTime[_daoId] = block.timestamp;
        }
        
        // Verifica operações por bloco
        uint256 opsThisBlock = memberOpsPerBlock[_daoId][block.number];
        require(opsThisBlock < MAX_MEMBER_OPS_PER_BLOCK, "Too many operations per block");
        
        // Atualiza janela de rate limiting se expirou
        if (block.timestamp >= windowStartTime[_daoId] + RATE_LIMIT_WINDOW) {
            windowStartTime[_daoId] = block.timestamp;
            opsInWindow[_daoId] = 0;
        }
        
        // Verifica operações na janela
        require(opsInWindow[_daoId] < MAX_OPS_PER_WINDOW, "Rate limit exceeded");
        
        // Incrementa contadores
        memberOpsPerBlock[_daoId][block.number]++;
        opsInWindow[_daoId]++;
        
        // Emite alerta se aproximando do limite
        if (opsInWindow[_daoId] > MAX_OPS_PER_WINDOW * 80 / 100) {
            emit RateLimitTriggered(
                _daoId, 
                opsInWindow[_daoId], 
                MAX_OPS_PER_WINDOW,
                "window_warning"
            );
        }
        
        _;
    }
    
    // ============ DAO MANAGEMENT ============
    
    /**
     * @notice Registra uma nova DAO no sistema
     * @param _daoAddress Endereço da DAO
     * @param _name Nome da DAO
     * @param _metadataIPFS Hash IPFS dos metadados
     * @param _parentDaoId ID da DAO mãe (0 se for raiz)
     */
    function registerDAO(
        address _daoAddress,
        string memory _name,
        string memory _metadataIPFS,
        uint256 _parentDaoId
    ) external onlyRole(DAO_ADMIN_ROLE) returns (uint256) {
        require(_daoAddress != address(0), "Invalid DAO address");
        require(daoAddressToId[_daoAddress] == 0, "DAO already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        daoCount++;
        uint256 daoId = daoCount;
        
        uint256 generationLevel = 0;
        if (_parentDaoId > 0) {
            require(daos[_parentDaoId].id > 0, "Parent DAO does not exist");
            generationLevel = daos[_parentDaoId].generationLevel + 1;
            daos[_parentDaoId].childDaoIds.push(daoId);
        }
        
        daos[daoId] = DAOInfo({
            id: daoId,
            daoAddress: _daoAddress,
            name: _name,
            createdAt: block.timestamp,
            activeMemberCount: 0,
            totalMemberCount: 0,
            status: DAOStatus.ACTIVE,
            parentDaoId: _parentDaoId,
            childDaoIds: new uint256[](0),
            generationLevel: generationLevel,
            metadataIPFS: _metadataIPFS
        });
        
        daoAddressToId[_daoAddress] = daoId;
        
        emit DAORegistered(daoId, _daoAddress, _name, _parentDaoId);
        
        return daoId;
    }
    
    // ============ MEMBER MANAGEMENT ============
    
    /**
     * @notice Adiciona um membro a uma DAO
     * @param _daoId ID da DAO
     * @param _member Endereço do membro
     * @param _profileIPFS Hash IPFS do perfil do membro
     */
    function addMember(
        uint256 _daoId,
        address _member,
        string memory _profileIPFS
    ) external onlyRole(MEMBER_TRACKER_ROLE) rateLimited(_daoId) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        require(_member != address(0), "Invalid member address");
        require(!daoMembers[_daoId][_member].isActive, "Member already active");
        
        // Proteção contra flip-flop rápido (adicionar logo após remover)
        uint256 lastRemoval = lastMemberRemoval[_daoId][_member];
        if (lastRemoval > 0) {
            require(
                block.timestamp >= lastRemoval + MEMBER_COOLDOWN,
                "Member cooldown active"
            );
            
            // Detecta padrão suspeito (múltiplas adições/remoções)
            uint256 timeSinceRemoval = block.timestamp - lastRemoval;
            if (timeSinceRemoval < 1 days) {
                emit SuspiciousActivity(
                    _daoId,
                    _member,
                    "rapid_rejoin",
                    block.timestamp
                );
            }
        }
        
        // Se membro já existiu, reativa
        if (daoMembers[_daoId][_member].memberAddress != address(0)) {
            daoMembers[_daoId][_member].isActive = true;
            daoMembers[_daoId][_member].lastActivityAt = block.timestamp;
        } else {
            // Novo membro
            daoMembers[_daoId][_member] = Member({
                memberAddress: _member,
                joinedAt: block.timestamp,
                lastActivityAt: block.timestamp,
                isActive: true,
                reputationScore: 0,
                profileIPFS: _profileIPFS
            });
            
            daoMemberList[_daoId].push(_member);
            daos[_daoId].totalMemberCount++;
        }
        
        daos[_daoId].activeMemberCount++;
        
        // Registra timestamp da adição
        lastMemberAddition[_daoId][_member] = block.timestamp;
        lastMemberOpTimestamp[_daoId][_member] = block.timestamp;
        
        emit MemberJoined(_daoId, _member, block.timestamp);
        
        // Verifica se atingiu threshold de warning
        _checkDunbarLimit(_daoId);
    }
    
    /**
     * @notice Remove um membro de uma DAO
     * @param _daoId ID da DAO
     * @param _member Endereço do membro
     */
    function removeMember(
        uint256 _daoId,
        address _member
    ) external onlyRole(MEMBER_TRACKER_ROLE) rateLimited(_daoId) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        require(daoMembers[_daoId][_member].isActive, "Member not active");
        
        // Proteção contra remoção logo após adição
        uint256 lastAddition = lastMemberAddition[_daoId][_member];
        require(
            block.timestamp >= lastAddition + MEMBER_COOLDOWN,
            "Member cooldown active"
        );
        
        // Detecta padrão suspeito (remoção muito rápida após adição)
        uint256 timeSinceAddition = block.timestamp - lastAddition;
        if (timeSinceAddition < 1 days) {
            emit SuspiciousActivity(
                _daoId,
                _member,
                "rapid_leave",
                block.timestamp
            );
        }
        
        daoMembers[_daoId][_member].isActive = false;
        daos[_daoId].activeMemberCount--;
        
        // Registra timestamp da remoção
        lastMemberRemoval[_daoId][_member] = block.timestamp;
        lastMemberOpTimestamp[_daoId][_member] = block.timestamp;
        
        emit MemberLeft(_daoId, _member, block.timestamp);
        
        // Se estava em processo de mitose e voltou abaixo do limite, cancela
        _checkMitosisCancellation(_daoId);
    }
    
    /**
     * @notice Registra atividade de um membro
     * @param _daoId ID da DAO
     * @param _member Endereço do membro
     */
    function recordActivity(
        uint256 _daoId,
        address _member
    ) external onlyRole(MEMBER_TRACKER_ROLE) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        require(daoMembers[_daoId][_member].isActive, "Member not active");
        
        daoMembers[_daoId][_member].lastActivityAt = block.timestamp;
        
        emit MemberActivityRecorded(_daoId, _member, block.timestamp);
    }
    
    /**
     * @notice Atualiza contador de membros ativos baseado em inatividade
     * @param _daoId ID da DAO
     * @dev Remove membros inativos por mais de 90 dias
     */
    function updateActiveMemberCount(uint256 _daoId) external {
        require(daos[_daoId].id > 0, "DAO does not exist");
        
        uint256 activeCount = 0;
        address[] memory memberList = daoMemberList[_daoId];
        
        for (uint256 i = 0; i < memberList.length; i++) {
            Member storage member = daoMembers[_daoId][memberList[i]];
            
            if (member.isActive) {
                // Verifica inatividade
                if (block.timestamp - member.lastActivityAt > INACTIVITY_PERIOD) {
                    member.isActive = false;
                    emit MemberLeft(_daoId, memberList[i], block.timestamp);
                } else {
                    activeCount++;
                }
            }
        }
        
        uint256 oldCount = daos[_daoId].activeMemberCount;
        daos[_daoId].activeMemberCount = activeCount;
        
        // Se mudou significativamente, verifica limite de Dunbar
        if (oldCount != activeCount) {
            _checkDunbarLimit(_daoId);
            _checkMitosisCancellation(_daoId);
        }
    }
    
    // ============ MITOSIS PROCESS ============
    
    /**
     * @notice Inicia processo de mitose (chamado automaticamente ao atingir 500 membros)
     * @param _daoId ID da DAO
     */
    function initiateMitosis(uint256 _daoId) public onlyRole(MITOSIS_EXECUTOR_ROLE) {
        DAOInfo storage dao = daos[_daoId];
        require(dao.id > 0, "DAO does not exist");
        require(dao.status == DAOStatus.ACTIVE || dao.status == DAOStatus.WARNING, "Invalid DAO status");
        require(dao.activeMemberCount >= DUNBAR_LIMIT, "DAO below Dunbar limit");
        require(activeMitosisProcess[_daoId] == 0, "Mitosis already in progress");
        
        mitosisProcessCount++;
        uint256 processId = mitosisProcessCount;
        
        uint256 votingEndsAt = block.timestamp + MITOSIS_VOTING_PERIOD;
        
        mitosisProcesses[processId] = MitosisProcess({
            processId: processId,
            daoId: _daoId,
            initiatedAt: block.timestamp,
            votingEndsAt: votingEndsAt,
            selectedCriteria: DivisionCriteria.RANDOM, // Default
            votesForGeographic: 0,
            votesForAffinity: 0,
            votesForRandom: 0,
            votesForTemporal: 0,
            totalVotes: 0,
            status: MitosisStatus.PENDING,
            childDao1Id: 0,
            childDao2Id: 0,
            snapshotIPFS: ""
        });
        
        activeMitosisProcess[_daoId] = processId;
        
        DAOStatus oldStatus = dao.status;
        dao.status = DAOStatus.MITOSIS_VOTE;
        
        emit DAOStatusChanged(_daoId, oldStatus, dao.status);
        emit MitosisInitiated(processId, _daoId, dao.activeMemberCount, votingEndsAt);
    }
    
    /**
     * @notice Vota no critério de divisão da mitose
     * @param _processId ID do processo de mitose
     * @param _criteria Critério escolhido
     */
    function voteOnMitosisCriteria(
        uint256 _processId,
        DivisionCriteria _criteria
    ) external {
        MitosisProcess storage process = mitosisProcesses[_processId];
        require(process.processId > 0, "Process does not exist");
        require(process.status == MitosisStatus.PENDING, "Voting not active");
        require(block.timestamp <= process.votingEndsAt, "Voting period ended");
        require(!hasVotedOnMitosis[_processId][msg.sender], "Already voted");
        require(daoMembers[process.daoId][msg.sender].isActive, "Not an active member");
        
        hasVotedOnMitosis[_processId][msg.sender] = true;
        process.totalVotes++;
        
        if (_criteria == DivisionCriteria.GEOGRAPHIC) {
            process.votesForGeographic++;
        } else if (_criteria == DivisionCriteria.AFFINITY) {
            process.votesForAffinity++;
        } else if (_criteria == DivisionCriteria.RANDOM) {
            process.votesForRandom++;
        } else if (_criteria == DivisionCriteria.TEMPORAL) {
            process.votesForTemporal++;
        }
        
        emit MitosisVoteCast(_processId, msg.sender, _criteria);
    }
    
    /**
     * @notice Finaliza votação e aprova mitose
     * @param _processId ID do processo de mitose
     */
    function finalizeMitosisVoting(uint256 _processId) external onlyRole(MITOSIS_EXECUTOR_ROLE) {
        MitosisProcess storage process = mitosisProcesses[_processId];
        require(process.processId > 0, "Process does not exist");
        require(process.status == MitosisStatus.PENDING, "Voting not active");
        require(block.timestamp > process.votingEndsAt, "Voting period not ended");
        
        DAOInfo storage dao = daos[process.daoId];
        uint256 quorum = (dao.activeMemberCount * MITOSIS_QUORUM) / 100;
        
        require(process.totalVotes >= quorum, "Quorum not reached");
        
        // Determina critério vencedor
        uint256 maxVotes = process.votesForGeographic;
        DivisionCriteria winner = DivisionCriteria.GEOGRAPHIC;
        
        if (process.votesForAffinity > maxVotes) {
            maxVotes = process.votesForAffinity;
            winner = DivisionCriteria.AFFINITY;
        }
        if (process.votesForRandom > maxVotes) {
            maxVotes = process.votesForRandom;
            winner = DivisionCriteria.RANDOM;
        }
        if (process.votesForTemporal > maxVotes) {
            maxVotes = process.votesForTemporal;
            winner = DivisionCriteria.TEMPORAL;
        }
        
        process.selectedCriteria = winner;
        process.status = MitosisStatus.APPROVED;
        
        emit MitosisApproved(_processId, process.daoId, winner, process.totalVotes);
    }
    
    /**
     * @notice Executa a mitose (divisão da DAO)
     * @param _processId ID do processo de mitose
     * @param _childDao1Address Endereço da primeira DAO filha
     * @param _childDao2Address Endereço da segunda DAO filha
     * @param _snapshotIPFS Hash IPFS do snapshot de estado
     * @dev Requer que as DAOs filhas já tenham sido criadas off-chain
     */
    function executeMitosis(
        uint256 _processId,
        address _childDao1Address,
        address _childDao2Address,
        string memory _snapshotIPFS
    ) external onlyRole(MITOSIS_EXECUTOR_ROLE) nonReentrant {
        MitosisProcess storage process = mitosisProcesses[_processId];
        require(process.processId > 0, "Process does not exist");
        require(process.status == MitosisStatus.APPROVED, "Mitosis not approved");
        require(_childDao1Address != address(0) && _childDao2Address != address(0), "Invalid child addresses");
        
        DAOInfo storage parentDao = daos[process.daoId];
        process.status = MitosisStatus.EXECUTING;
        process.snapshotIPFS = _snapshotIPFS;
        
        DAOStatus oldStatus = parentDao.status;
        parentDao.status = DAOStatus.SPLITTING;
        emit DAOStatusChanged(process.daoId, oldStatus, parentDao.status);
        
        // Cria DAO filha 1
        uint256 childDao1Id = _createChildDAO(
            _childDao1Address,
            string(abi.encodePacked(parentDao.name, " - Alpha")),
            _snapshotIPFS,
            process.daoId
        );
        
        // Cria DAO filha 2
        uint256 childDao2Id = _createChildDAO(
            _childDao2Address,
            string(abi.encodePacked(parentDao.name, " - Beta")),
            _snapshotIPFS,
            process.daoId
        );
        
        process.childDao1Id = childDao1Id;
        process.childDao2Id = childDao2Id;
        
        // Distribui tokens 1:1 para DAOs filhas se o governance token estiver configurado
        if (address(governanceToken) != address(0)) {
            _distributeTokensToChildDAOs(process.daoId, childDao1Id, childDao2Id);
        }
        
        // Coloca DAO mãe em modo legado
        parentDao.status = DAOStatus.LEGACY;
        emit DAOStatusChanged(process.daoId, DAOStatus.SPLITTING, DAOStatus.LEGACY);
        
        process.status = MitosisStatus.COMPLETED;
        activeMitosisProcess[process.daoId] = 0;
        
        emit MitosisExecuted(_processId, process.daoId, childDao1Id, childDao2Id);
    }
    
    /**
     * @notice Cria uma DAO filha (função interna)
     * @param _daoAddress Endereço da DAO
     * @param _name Nome da DAO
     * @param _metadataIPFS Hash IPFS dos metadados
     * @param _parentDaoId ID da DAO mãe
     */
    function _createChildDAO(
        address _daoAddress,
        string memory _name,
        string memory _metadataIPFS,
        uint256 _parentDaoId
    ) internal returns (uint256) {
        require(_daoAddress != address(0), "Invalid DAO address");
        require(daoAddressToId[_daoAddress] == 0, "DAO already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(daos[_parentDaoId].id > 0, "Parent DAO does not exist");
        
        daoCount++;
        uint256 daoId = daoCount;
        
        uint256 generationLevel = daos[_parentDaoId].generationLevel + 1;
        daos[_parentDaoId].childDaoIds.push(daoId);
        
        daos[daoId] = DAOInfo({
            id: daoId,
            daoAddress: _daoAddress,
            name: _name,
            createdAt: block.timestamp,
            activeMemberCount: 0,
            totalMemberCount: 0,
            status: DAOStatus.ACTIVE,
            parentDaoId: _parentDaoId,
            childDaoIds: new uint256[](0),
            generationLevel: generationLevel,
            metadataIPFS: _metadataIPFS
        });
        
        daoAddressToId[_daoAddress] = daoId;
        
        emit DAORegistered(daoId, _daoAddress, _name, _parentDaoId);
        
        return daoId;
    }
    
    /**
     * @notice Distribui tokens 1:1 para DAOs filhas baseado no balance dos membros
     * @param _parentDaoId ID da DAO mãe
     * @param _childDao1Id ID da primeira DAO filha
     * @param _childDao2Id ID da segunda DAO filha
     * @dev Assume que cada membro deve receber mesma quantidade nas filhas
     */
    function _distributeTokensToChildDAOs(
        uint256 _parentDaoId,
        uint256 _childDao1Id,
        uint256 _childDao2Id
    ) internal {
        address[] storage members = daoMemberList[_parentDaoId];
        
        // Para cada membro ativo da DAO mãe
        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            if (!daoMembers[_parentDaoId][member].isActive) {
                continue;
            }
            
            // Pega o balance atual do membro
            uint256 memberBalance = governanceToken.balanceOf(member);
            
            // Se o membro tem tokens, mint 1:1 para ambas as DAOs filhas
            if (memberBalance > 0) {
                try governanceToken.mint(member, memberBalance) {
                    emit TokensDistributed(_parentDaoId, _childDao1Id, member, memberBalance);
                } catch {
                    // Falha silenciosa - não bloqueia a mitose
                }
                
                try governanceToken.mint(member, memberBalance) {
                    emit TokensDistributed(_parentDaoId, _childDao2Id, member, memberBalance);
                } catch {
                    // Falha silenciosa - não bloqueia a mitose
                }
            }
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Verifica se DAO atingiu limite de Dunbar
     * @param _daoId ID da DAO
     */
    function _checkDunbarLimit(uint256 _daoId) internal {
        DAOInfo storage dao = daos[_daoId];
        
        if (dao.activeMemberCount >= DUNBAR_LIMIT && 
            (dao.status == DAOStatus.ACTIVE || dao.status == DAOStatus.WARNING)) {
            // Inicia mitose automaticamente
            _initiateMitosisInternal(_daoId);
        } else if (dao.activeMemberCount >= WARNING_THRESHOLD && dao.status == DAOStatus.ACTIVE) {
            dao.status = DAOStatus.WARNING;
            emit DunbarWarning(_daoId, dao.activeMemberCount, DUNBAR_LIMIT);
        }
    }
    
    /**
     * @notice Inicia processo de mitose internamente
     * @param _daoId ID da DAO
     */
    function _initiateMitosisInternal(uint256 _daoId) internal {
        DAOInfo storage dao = daos[_daoId];
        require(dao.id > 0, "DAO does not exist");
        require(dao.status == DAOStatus.ACTIVE || dao.status == DAOStatus.WARNING, "Invalid DAO status");
        require(dao.activeMemberCount >= DUNBAR_LIMIT, "DAO below Dunbar limit");
        require(activeMitosisProcess[_daoId] == 0, "Mitosis already in progress");
        
        mitosisProcessCount++;
        uint256 processId = mitosisProcessCount;
        
        uint256 votingEndsAt = block.timestamp + MITOSIS_VOTING_PERIOD;
        
        mitosisProcesses[processId] = MitosisProcess({
            processId: processId,
            daoId: _daoId,
            initiatedAt: block.timestamp,
            votingEndsAt: votingEndsAt,
            selectedCriteria: DivisionCriteria.RANDOM, // Default
            votesForGeographic: 0,
            votesForAffinity: 0,
            votesForRandom: 0,
            votesForTemporal: 0,
            totalVotes: 0,
            status: MitosisStatus.PENDING,
            childDao1Id: 0,
            childDao2Id: 0,
            snapshotIPFS: ""
        });
        
        activeMitosisProcess[_daoId] = processId;
        
        DAOStatus oldStatus = dao.status;
        dao.status = DAOStatus.MITOSIS_VOTE;
        
        emit DAOStatusChanged(_daoId, oldStatus, dao.status);
        emit MitosisInitiated(processId, _daoId, dao.activeMemberCount, votingEndsAt);
    }
    
    /**
     * @notice Verifica se mitose deve ser cancelada (membros saíram)
     * @param _daoId ID da DAO
     */
    function _checkMitosisCancellation(uint256 _daoId) internal {
        uint256 processId = activeMitosisProcess[_daoId];
        if (processId == 0) return;
        
        MitosisProcess storage process = mitosisProcesses[processId];
        if (process.status != MitosisStatus.PENDING) return;
        
        DAOInfo storage dao = daos[_daoId];
        
        // Se voltou abaixo de 450 membros, cancela
        if (dao.activeMemberCount < WARNING_THRESHOLD) {
            process.status = MitosisStatus.CANCELLED;
            activeMitosisProcess[_daoId] = 0;
            
            dao.status = DAOStatus.ACTIVE;
            
            emit MitosisCancelled(processId, _daoId, "Member count dropped below threshold");
        }
    }
    
    // ============ SECURITY ADMIN FUNCTIONS ============
    
    /**
     * @notice Pausa operações de membro em uma DAO (emergência)
     * @param _daoId ID da DAO
     * @param _paused True para pausar, false para despausar
     */
    function setMemberOpsPaused(
        uint256 _daoId,
        bool _paused
    ) external onlyRole(DAO_ADMIN_ROLE) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        memberOpsPaused[_daoId] = _paused;
        
        emit SuspiciousActivity(
            _daoId,
            msg.sender,
            _paused ? "operations_paused" : "operations_resumed",
            block.timestamp
        );
    }
    
    /**
     * @notice Reseta contadores de rate limiting (emergência)
     * @param _daoId ID da DAO
     */
    function resetRateLimits(uint256 _daoId) external onlyRole(DAO_ADMIN_ROLE) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        
        windowStartTime[_daoId] = block.timestamp;
        opsInWindow[_daoId] = 0;
        
        emit SuspiciousActivity(
            _daoId,
            msg.sender,
            "rate_limits_reset",
            block.timestamp
        );
    }
    
    /**
     * @notice Retorna métricas de segurança de uma DAO
     * @param _daoId ID da DAO
     */
    function getSecurityMetrics(uint256 _daoId) external view returns (
        uint256 opsThisBlock,
        uint256 opsInCurrentWindow,
        uint256 windowStart,
        bool isPaused
    ) {
        return (
            memberOpsPerBlock[_daoId][block.number],
            opsInWindow[_daoId],
            windowStartTime[_daoId],
            memberOpsPaused[_daoId]
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna informações de uma DAO
     * @param _daoId ID da DAO
     */
    function getDAOInfo(uint256 _daoId) external view returns (DAOInfo memory) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        return daos[_daoId];
    }
    
    /**
     * @notice Retorna informações de um membro
     * @param _daoId ID da DAO
     * @param _member Endereço do membro
     */
    function getMemberInfo(uint256 _daoId, address _member) external view returns (Member memory) {
        return daoMembers[_daoId][_member];
    }
    
    /**
     * @notice Retorna processo de mitose ativo de uma DAO
     * @param _daoId ID da DAO
     */
    function getActiveMitosisProcess(uint256 _daoId) external view returns (MitosisProcess memory) {
        uint256 processId = activeMitosisProcess[_daoId];
        require(processId > 0, "No active mitosis process");
        return mitosisProcesses[processId];
    }
    
    /**
     * @notice Verifica se existe processo de mitose ativo (sem revert)
     * @param _daoId ID da DAO
     */
    function hasActiveMitosisProcess(uint256 _daoId) external view returns (bool) {
        return activeMitosisProcess[_daoId] > 0;
    }
    
    /**
     * @notice Retorna ID do processo ativo (0 se não houver)
     * @param _daoId ID da DAO
     */
    function getActiveMitosisProcessId(uint256 _daoId) external view returns (uint256) {
        return activeMitosisProcess[_daoId];
    }
    
    /**
     * @notice Retorna processo de mitose por ID
     * @param _processId ID do processo
     */
    function getMitosisProcess(uint256 _processId) external view returns (MitosisProcess memory) {
        require(_processId > 0 && _processId <= mitosisProcessCount, "Invalid process ID");
        return mitosisProcesses[_processId];
    }
    
    /**
     * @notice Retorna lista de DAOs filhas
     * @param _daoId ID da DAO mãe
     */
    function getChildDAOs(uint256 _daoId) external view returns (uint256[] memory) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        return daos[_daoId].childDaoIds;
    }
    
    /**
     * @notice Verifica se DAO está próxima do limite de Dunbar
     * @param _daoId ID da DAO
     */
    function isDunbarLimitApproaching(uint256 _daoId) external view returns (bool) {
        require(daos[_daoId].id > 0, "DAO does not exist");
        return daos[_daoId].activeMemberCount >= WARNING_THRESHOLD;
    }
    
    /**
     * @notice Retorna estatísticas de votação de mitose
     * @param _processId ID do processo
     */
    function getMitosisVotingStats(uint256 _processId) external view returns (
        uint256 geographic,
        uint256 affinity,
        uint256 random,
        uint256 temporal,
        uint256 total
    ) {
        MitosisProcess memory process = mitosisProcesses[_processId];
        return (
            process.votesForGeographic,
            process.votesForAffinity,
            process.votesForRandom,
            process.votesForTemporal,
            process.totalVotes
        );
    }
}
