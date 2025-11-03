// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISovereignCurrencyFunding.sol";

/**
 * @title OrganizationalRedundancy
 * @notice Implementa Artigo 4º-B da Constituição 2.0 - Redundância Organizacional Obrigatória
 * @dev Sistema biomimético inspirado em órgãos redundantes (Princípio dos Dois Rins)
 * 
 * IMPORTANTE: Opera com MOEDA SOBERANA (SOB), não ETH
 * 
 * Funcionalidades:
 * - Mínimo de 3 DAOs por função crítica
 * - Distribuição de orçamento: 50% igualitário + 50% por performance
 * - KPIs on-chain verificáveis
 * - Remoção automática de DAOs com performance <30% da média
 */
contract OrganizationalRedundancy is AccessControl, ReentrancyGuard {
    bytes32 public constant DAO_MANAGER_ROLE = keccak256("DAO_MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Referência à moeda soberana
    ISovereignCurrencyFunding public sovereignCurrency;

    // Setores críticos da Federação
    enum CriticalSector {
        HEALTH,           // Saúde pública
        ENERGY,           // Energia renovável
        WATER,            // Água e saneamento
        COMMUNICATION,    // Internet mesh cooperativa
        CYBER_DEFENSE     // Defesa cibernética
    }

    // KPIs para avaliação de performance
    struct PerformanceMetrics {
        uint256 responseTime;        // Tempo médio de resposta (em segundos)
        uint256 userSatisfaction;    // Média de avaliações (0-100)
        uint256 costEfficiency;      // Custo por serviço (quanto menor, melhor)
        uint256 innovationCount;     // Número de patentes abertas geradas
        uint256 lastUpdated;         // Timestamp da última atualização
    }

    // Estrutura de uma DAO registrada
    struct DAO {
        address daoAddress;
        string name;
        CriticalSector sector;
        bool isActive;
        uint256 registeredAt;
        PerformanceMetrics metrics;
        uint256 consecutiveLowPerformanceMonths;
        uint256 totalFundingReceived;
    }

    // Mapeamentos
    mapping(uint256 => DAO) public daos;
    mapping(CriticalSector => uint256[]) public daosBySector;
    mapping(address => uint256) public daoIdByAddress;
    mapping(CriticalSector => uint256) public sectorBudget;
    
    uint256 public nextDaoId = 1;
    uint256 public constant MIN_DAOS_PER_SECTOR = 3;
    uint256 public constant LOW_PERFORMANCE_THRESHOLD = 30; // 30% da média
    uint256 public constant LOW_PERFORMANCE_MONTHS = 6;
    uint256 public constant EQUAL_SPLIT_PERCENTAGE = 50;

    // Events
    event DAORegistered(uint256 indexed daoId, address indexed daoAddress, CriticalSector sector, string name);
    event DAODeactivated(uint256 indexed daoId, string reason);
    event MetricsUpdated(uint256 indexed daoId, PerformanceMetrics metrics);
    event FundsDistributed(CriticalSector sector, uint256 totalAmount);
    event BudgetAllocated(CriticalSector sector, uint256 amount);
    event LowPerformanceWarning(uint256 indexed daoId, uint256 consecutiveMonths);

    constructor(address _sovereignCurrency) {
        require(_sovereignCurrency != address(0), "Invalid currency address");
        
        sovereignCurrency = ISovereignCurrencyFunding(_sovereignCurrency);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_MANAGER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @notice Registra uma nova DAO em um setor crítico
     * @param _daoAddress Endereço da DAO
     * @param _name Nome da DAO
     * @param _sector Setor crítico
     */
    function registerDAO(
        address _daoAddress,
        string memory _name,
        CriticalSector _sector
    ) external onlyRole(DAO_MANAGER_ROLE) {
        require(_daoAddress != address(0), "Invalid DAO address");
        require(daoIdByAddress[_daoAddress] == 0, "DAO already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        uint256 daoId = nextDaoId++;

        daos[daoId] = DAO({
            daoAddress: _daoAddress,
            name: _name,
            sector: _sector,
            isActive: true,
            registeredAt: block.timestamp,
            metrics: PerformanceMetrics({
                responseTime: 0,
                userSatisfaction: 50, // Começa com 50/100
                costEfficiency: 100,
                innovationCount: 0,
                lastUpdated: block.timestamp
            }),
            consecutiveLowPerformanceMonths: 0,
            totalFundingReceived: 0
        });

        daosBySector[_sector].push(daoId);
        daoIdByAddress[_daoAddress] = daoId;

        emit DAORegistered(daoId, _daoAddress, _sector, _name);
    }

    /**
     * @notice Atualiza métricas de performance de uma DAO
     * @param _daoId ID da DAO
     * @param _responseTime Tempo médio de resposta
     * @param _userSatisfaction Satisfação do usuário (0-100)
     * @param _costEfficiency Eficiência de custo
     * @param _innovationCount Número de inovações
     */
    function updateMetrics(
        uint256 _daoId,
        uint256 _responseTime,
        uint256 _userSatisfaction,
        uint256 _costEfficiency,
        uint256 _innovationCount
    ) external onlyRole(AUDITOR_ROLE) {
        require(daos[_daoId].isActive, "DAO not active");
        require(_userSatisfaction <= 100, "Satisfaction must be 0-100");

        DAO storage dao = daos[_daoId];
        dao.metrics = PerformanceMetrics({
            responseTime: _responseTime,
            userSatisfaction: _userSatisfaction,
            costEfficiency: _costEfficiency,
            innovationCount: _innovationCount,
            lastUpdated: block.timestamp
        });

        emit MetricsUpdated(_daoId, dao.metrics);

        // Verifica performance e atualiza contador de meses ruins
        _checkPerformance(_daoId);
    }

    /**
     * @notice Aloca orçamento para um setor usando moeda soberana
     * @param _sector Setor crítico
     * @param _amount Quantidade em SOB
     * @dev Admin aloca crédito orçamentário (não transfere diretamente)
     */
    function allocateBudget(CriticalSector _sector, uint256 _amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_amount > 0, "Budget must be > 0");
        
        // Verifica se admin tem saldo suficiente
        require(
            sovereignCurrency.balanceOf(msg.sender) >= _amount,
            "Insufficient SOB balance"
        );
        
        // Aloca orçamento (crédito)
        sectorBudget[_sector] += _amount;
        emit BudgetAllocated(_sector, _amount);
    }

    /**
     * @notice Distribui fundos para DAOs de um setor
     * @param _sector Setor crítico
     * @dev 50% igualitário + 50% proporcional a KPIs
     * @dev Gera SOB para as DAOs via earnCurrency (funding DAO = contribuição validada)
     */
    function distributeFunds(CriticalSector _sector) 
        external 
        onlyRole(DAO_MANAGER_ROLE)
        nonReentrant
    {
        uint256 budget = sectorBudget[_sector];
        require(budget > 0, "No budget available");

        uint256[] memory activeDaoIds = getActiveDaosBySector(_sector);
        uint256 activeCount = activeDaoIds.length;
        
        require(activeCount >= MIN_DAOS_PER_SECTOR, "Minimum 3 DAOs required");

        // 50% dividido igualmente
        uint256 equalShare = (budget * EQUAL_SPLIT_PERCENTAGE) / 100;
        uint256 equalPerDao = equalShare / activeCount;

        // 50% proporcional a performance
        uint256 performancePool = budget - equalShare;
        uint256 totalScore = _calculateTotalScore(activeDaoIds);

        // Distribui fundos gerando SOB para cada DAO
        for (uint256 i = 0; i < activeCount; i++) {
            uint256 daoId = activeDaoIds[i];
            DAO storage dao = daos[daoId];

            // Parte igualitária
            uint256 allocation = equalPerDao;

            // Parte por performance
            if (totalScore > 0) {
                uint256 daoScore = _calculatePerformanceScore(dao.metrics);
                allocation += (performancePool * daoScore) / totalScore;
            }

            // Gera SOB para a DAO via earnCurrencyWithAmount
            dao.totalFundingReceived += allocation;
            
            // Cria proof hash do funding
            bytes32 fundingProof = keccak256(abi.encodePacked(
                daoId,
                dao.daoAddress,
                _sector,
                allocation,
                block.timestamp
            ));
            
            // Usa a interface com valor explícito (compatível com mock e produção)
            sovereignCurrency.earnCurrencyWithAmount(
                dao.daoAddress,
                "dao_funding",
                allocation,
                fundingProof
            );
        }

        // Reset budget do setor
        sectorBudget[_sector] = 0;
        emit FundsDistributed(_sector, budget);
    }

    /**
     * @notice Desativa DAO com performance baixa consistente
     * @param _daoId ID da DAO
     */
    function deactivateLowPerformanceDAO(uint256 _daoId) 
        external 
        onlyRole(DAO_MANAGER_ROLE) 
    {
        DAO storage dao = daos[_daoId];
        require(dao.isActive, "DAO already inactive");
        require(
            dao.consecutiveLowPerformanceMonths >= LOW_PERFORMANCE_MONTHS,
            "Not enough consecutive low performance months"
        );

        dao.isActive = false;
        emit DAODeactivated(_daoId, "Low performance for 6+ months");
    }

    /**
     * @notice Reativa uma DAO
     * @param _daoId ID da DAO
     */
    function reactivateDAO(uint256 _daoId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        DAO storage dao = daos[_daoId];
        require(!dao.isActive, "DAO already active");
        
        dao.isActive = true;
        dao.consecutiveLowPerformanceMonths = 0;
    }

    /**
     * @notice Retorna DAOs ativas de um setor
     * @param _sector Setor crítico
     */
    function getActiveDaosBySector(CriticalSector _sector) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory sectorDaos = daosBySector[_sector];
        uint256 activeCount = 0;

        // Conta DAOs ativas
        for (uint256 i = 0; i < sectorDaos.length; i++) {
            if (daos[sectorDaos[i]].isActive) {
                activeCount++;
            }
        }

        // Cria array de retorno
        uint256[] memory activeDaos = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < sectorDaos.length; i++) {
            if (daos[sectorDaos[i]].isActive) {
                activeDaos[index++] = sectorDaos[i];
            }
        }

        return activeDaos;
    }

    /**
     * @notice Calcula score de performance de uma DAO
     * @param metrics Métricas da DAO
     * @return Score total (0-400)
     */
    function _calculatePerformanceScore(PerformanceMetrics memory metrics) 
        internal 
        pure 
        returns (uint256) 
    {
        // Normaliza métricas para 0-100 cada
        uint256 responseScore = metrics.responseTime > 0 
            ? 100 - (metrics.responseTime > 100 ? 100 : metrics.responseTime)
            : 0;
        
        uint256 satisfactionScore = metrics.userSatisfaction;
        
        uint256 efficiencyScore = metrics.costEfficiency > 0
            ? (10000 / metrics.costEfficiency) // Inverte: menor custo = maior score
            : 0;
        if (efficiencyScore > 100) efficiencyScore = 100;
        
        uint256 innovationScore = metrics.innovationCount * 10; // 10 pontos por inovação
        if (innovationScore > 100) innovationScore = 100;

        return responseScore + satisfactionScore + efficiencyScore + innovationScore;
    }

    /**
     * @notice Calcula score total de todas DAOs
     */
    function _calculateTotalScore(uint256[] memory daoIds) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 total = 0;
        for (uint256 i = 0; i < daoIds.length; i++) {
            total += _calculatePerformanceScore(daos[daoIds[i]].metrics);
        }
        return total;
    }

    /**
     * @notice Verifica performance e atualiza contador de meses ruins
     */
    function _checkPerformance(uint256 _daoId) internal {
        DAO storage dao = daos[_daoId];
        
        // Calcula média do setor
        uint256[] memory sectorDaos = getActiveDaosBySector(dao.sector);
        uint256 avgScore = _calculateTotalScore(sectorDaos) / sectorDaos.length;
        
        // Calcula score da DAO
        uint256 daoScore = _calculatePerformanceScore(dao.metrics);
        
        // Threshold de 30% da média
        uint256 threshold = (avgScore * LOW_PERFORMANCE_THRESHOLD) / 100;
        
        if (daoScore < threshold) {
            dao.consecutiveLowPerformanceMonths++;
            emit LowPerformanceWarning(_daoId, dao.consecutiveLowPerformanceMonths);
        } else {
            dao.consecutiveLowPerformanceMonths = 0;
        }
    }

    /**
     * @notice Retorna informações de uma DAO
     */
    function getDAO(uint256 _daoId) 
        external 
        view 
        returns (
            address daoAddress,
            string memory name,
            CriticalSector sector,
            bool isActive,
            uint256 registeredAt,
            PerformanceMetrics memory metrics,
            uint256 consecutiveLowPerformanceMonths,
            uint256 totalFundingReceived
        ) 
    {
        DAO memory dao = daos[_daoId];
        return (
            dao.daoAddress,
            dao.name,
            dao.sector,
            dao.isActive,
            dao.registeredAt,
            dao.metrics,
            dao.consecutiveLowPerformanceMonths,
            dao.totalFundingReceived
        );
    }

    /**
     * @notice Retorna número de DAOs ativas em um setor
     */
    function getActiveDaoCount(CriticalSector _sector) 
        external 
        view 
        returns (uint256) 
    {
        return getActiveDaosBySector(_sector).length;
    }
}
