// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FraudDetection
 * @notice Sistema de detecção de fraude em near-real time para carteiras comprometidas
 * @dev Monitora padrões suspeitos e invalida carteiras automaticamente
 * 
 * PROBLEMA:
 * - Carteira roubada pode drenar todos recursos
 * - Atacante pode transferir SOB, votar, manipular sistema
 * - Detecção manual é muito lenta
 * 
 * SOLUÇÃO:
 * - Análise comportamental em tempo real
 * - Regras de fraude baseadas em padrões conhecidos
 * - Invalidação automática com score de risco
 * - Sistema de quarentena progressiva
 * - Alertas para outras carteiras da identidade
 * 
 * REGRAS DE DETECÇÃO:
 * 1. Velocidade: Múltiplas ações em curto período
 * 2. Geolocalização: Mudança impossível de localização
 * 3. Padrão: Comportamento diferente do histórico
 * 4. Horário: Atividade em horários incomuns
 * 5. Dispositivo: Novo dispositivo não reconhecido
 * 6. Valor: Tentativa de drenar todos recursos
 * 7. Social: Outras carteiras reportam suspeita
 * 8. Biométrico: Falha em verificação biométrica
 */
contract FraudDetection is AccessControl, Pausable {
    
    // ============ ROLES ============
    
    bytes32 public constant MONITOR_ROLE = keccak256("MONITOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Score máximo de risco (100 = certeza de fraude)
    uint256 public constant MAX_RISK_SCORE = 100;
    
    /// @notice Threshold para quarentena (score >= 40)
    uint256 public constant QUARANTINE_THRESHOLD = 40;
    
    /// @notice Threshold para bloqueio imediato (score >= 70)
    uint256 public constant BLOCK_THRESHOLD = 70;
    
    /// @notice Tempo máximo entre ações normais (5 minutos)
    uint256 public constant NORMAL_ACTION_INTERVAL = 5 minutes;
    
    /// @notice Máximo de ações por hora (limite de velocidade)
    uint256 public constant MAX_ACTIONS_PER_HOUR = 20;
    
    /// @notice Período de quarentena (24 horas)
    uint256 public constant QUARANTINE_PERIOD = 24 hours;
    
    /// @notice Distância máxima para mudança de localização (km/h)
    uint256 public constant MAX_TRAVEL_SPEED = 900; // Avião comercial
    
    // ============ ENUMS ============
    
    enum WalletStatus {
        Active,         // ✅ Ativa e normal
        Monitoring,     // 👁️ Sob monitoramento (score 20-39)
        Quarantine,     // ⚠️ Em quarentena (score 40-69)
        Blocked,        // 🚫 Bloqueada (score >= 70)
        Destroyed       // 💥 Tokens destruídos
    }
    
    enum FraudType {
        VelocityAnomaly,        // Múltiplas ações rápidas
        GeolocationImpossible,  // Mudança impossível de local
        PatternDeviation,       // Comportamento diferente
        UnusualTime,            // Horário suspeito
        UnknownDevice,          // Dispositivo novo
        DrainAttempt,           // Tentativa de drenar recursos
        SocialReport,           // Reportada por outras carteiras
        BiometricFailure        // Falha biométrica
    }
    
    enum ActionType {
        Login,
        Transaction,
        Vote,
        ProofOfLife,
        ChangeSettings,
        AddWallet,
        RemoveWallet
    }
    
    // ============ STRUCTS ============
    
    /// @notice Ação registrada
    struct Action {
        ActionType actionType;
        uint256 timestamp;
        bytes32 deviceFingerprint;
        GeoLocation location;
        uint256 value;              // Valor envolvido (se aplicável)
        bool biometricVerified;
    }
    
    /// @notice Localização geográfica
    struct GeoLocation {
        int256 latitude;    // * 1e6 (ex: -23.550520 * 1e6)
        int256 longitude;   // * 1e6 (ex: -46.633308 * 1e6)
        uint256 timestamp;
    }
    
    /// @notice Perfil comportamental
    struct BehavioralProfile {
        uint256[] typicalHours;         // Horários típicos de uso (bitmap)
        bytes32[] knownDevices;         // Dispositivos conhecidos
        uint256 avgActionsPerDay;       // Média de ações por dia
        uint256 avgTimeBetweenActions;  // Tempo médio entre ações
        GeoLocation[] frequentLocations;// Localizações frequentes
        uint256 profileCreatedAt;
        uint256 lastUpdated;
    }
    
    /// @notice Incidente de fraude detectado
    struct FraudIncident {
        FraudType fraudType;
        uint256 detectedAt;
        uint256 riskScore;              // 0-100
        string description;
        bytes evidence;                 // Dados do incidente
        bool resolved;
        address resolver;
        uint256 resolvedAt;
    }
    
    /// @notice Estado de segurança da carteira
    struct WalletSecurity {
        WalletStatus status;
        uint256 currentRiskScore;
        uint256 totalIncidents;
        uint256 lastActionTime;
        uint256 actionsInLastHour;
        uint256 quarantineUntil;
        Action[] recentActions;         // Últimas 50 ações
        FraudIncident[] incidents;
        BehavioralProfile profile;
    }
    
    /// @notice Regra de detecção
    struct DetectionRule {
        string name;
        FraudType fraudType;
        uint256 riskScore;              // Score atribuído se detectado
        bool enabled;
        uint256 createdAt;
    }
    
    // ============ STATE ============
    
    /// @notice Mapeamento de carteira para estado de segurança
    mapping(address => WalletSecurity) internal walletSecurity;
    
    /// @notice Regras de detecção ativas
    DetectionRule[] public detectionRules;
    
    /// @notice Whitelist de carteiras confiáveis (exchanges, contratos oficiais)
    mapping(address => bool) public trustedWallets;
    
    /// @notice Blacklist de endereços conhecidos como fraudulentos
    mapping(address => bool) public blacklistedWallets;
    
    /// @notice Total de carteiras bloqueadas
    uint256 public totalBlocked;
    
    /// @notice Total de incidentes detectados
    uint256 public totalIncidents;
    
    /// @notice Contrato de Justiça Restaurativa (opcional)
    address public restorativeJusticeContract;
    
    // ============ EVENTS ============
    
    event ActionRecorded(
        address indexed wallet,
        ActionType actionType,
        uint256 timestamp
    );
    
    event FraudDetected(
        address indexed wallet,
        FraudType fraudType,
        uint256 riskScore,
        string description
    );
    
    event WalletQuarantined(
        address indexed wallet,
        uint256 riskScore,
        uint256 until
    );
    
    event WalletBlocked(
        address indexed wallet,
        uint256 riskScore,
        uint256 totalIncidents
    );
    
    event WalletDestroyed(
        address indexed wallet,
        uint256 finalRiskScore
    );
    
    event RiskScoreUpdated(
        address indexed wallet,
        uint256 oldScore,
        uint256 newScore
    );
    
    event IncidentResolved(
        address indexed wallet,
        uint256 incidentId,
        address resolver
    );
    
    event DisputeCreatedForFraud(
        address indexed wallet,
        uint256 disputeId,
        FraudType fraudType
    );
    
    event RuleAdded(
        uint256 indexed ruleId,
        string name,
        FraudType fraudType
    );
    
    event RuleToggled(
        uint256 indexed ruleId,
        bool enabled
    );
    
    // ============ MODIFIERS ============
    
    modifier notBlocked(address wallet) {
        require(
            walletSecurity[wallet].status != WalletStatus.Blocked &&
            walletSecurity[wallet].status != WalletStatus.Destroyed,
            "Wallet is blocked"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MONITOR_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        _initializeDefaultRules();
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Configura contrato de Justiça Restaurativa
     * @param _restorativeJustice Endereço do contrato
     */
    function setRestorativeJusticeContract(address _restorativeJustice) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_restorativeJustice != address(0), "Invalid address");
        restorativeJusticeContract = _restorativeJustice;
    }
    
    /**
     * @notice Cria disputa no sistema de justiça para fraude detectada
     * @param wallet Carteira fraudulenta
     * @param evidenceIPFS Hash IPFS com evidências
     * @return disputeId ID da disputa criada
     */
    function createDisputeForFraud(
        address wallet,
        string memory evidenceIPFS
    )
        external
        onlyRole(VALIDATOR_ROLE)
        returns (uint256 disputeId)
    {
        require(restorativeJusticeContract != address(0), "Justice contract not set");
        require(walletSecurity[wallet].status == WalletStatus.Blocked, "Wallet not blocked");
        
        // Cria disputa no contrato de justiça
        (bool success, bytes memory data) = restorativeJusticeContract.call(
            abi.encodeWithSignature(
                "createDispute(address,string)",
                wallet,
                evidenceIPFS
            )
        );
        
        require(success, "Failed to create dispute");
        disputeId = abi.decode(data, (uint256));
        
        emit DisputeCreatedForFraud(wallet, disputeId, FraudType.PatternDeviation);
        
        return disputeId;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Registra ação e analisa fraude em tempo real
     * @param wallet Endereço da carteira
     * @param actionType Tipo de ação
     * @param deviceFingerprint Hash do dispositivo
     * @param location Localização geográfica
     * @param value Valor envolvido (se aplicável)
     * @param biometricVerified Se passou verificação biométrica
     */
    function recordAction(
        address wallet,
        ActionType actionType,
        bytes32 deviceFingerprint,
        GeoLocation memory location,
        uint256 value,
        bool biometricVerified
    )
        external
        onlyRole(MONITOR_ROLE)
        notBlocked(wallet)
        whenNotPaused
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        // Criar ação
        Action memory action = Action({
            actionType: actionType,
            timestamp: block.timestamp,
            deviceFingerprint: deviceFingerprint,
            location: location,
            value: value,
            biometricVerified: biometricVerified
        });
        
        // Adicionar às ações recentes (máximo 50)
        if (security.recentActions.length >= 50) {
            _removeOldestAction(security);
        }
        security.recentActions.push(action);
        security.lastActionTime = block.timestamp;
        
        // Atualizar contador de ações por hora
        _updateActionCounter(security);
        
        // ANÁLISE DE FRAUDE EM TEMPO REAL
        _analyzeForFraud(wallet, action, security);
        
        emit ActionRecorded(wallet, actionType, block.timestamp);
    }
    
    /**
     * @notice Reporta carteira suspeita (chamado por outras carteiras da identidade)
     * @param suspiciousWallet Carteira suspeita
     * @param reason Razão da suspeita
     */
    function reportSuspiciousActivity(
        address suspiciousWallet,
        string memory reason
    )
        external
        whenNotPaused
    {
        _addIncident(
            suspiciousWallet,
            FraudType.SocialReport,
            20, // Score moderado
            reason,
            abi.encode(msg.sender, block.timestamp)
        );
    }
    
    /**
     * @notice Bloqueia carteira imediatamente (emergência)
     * @param wallet Carteira a bloquear
     * @param reason Razão do bloqueio
     */
    function emergencyBlock(
        address wallet,
        string memory reason
    )
        external
        onlyRole(VALIDATOR_ROLE)
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        security.status = WalletStatus.Blocked;
        security.currentRiskScore = MAX_RISK_SCORE;
        totalBlocked++;
        
        _addIncident(
            wallet,
            FraudType.PatternDeviation,
            MAX_RISK_SCORE,
            string(abi.encodePacked("EMERGENCY: ", reason)),
            abi.encode(msg.sender, block.timestamp)
        );
        
        emit WalletBlocked(wallet, MAX_RISK_SCORE, security.totalIncidents);
    }
    
    /**
     * @notice Destrói tokens da carteira bloqueada
     * @param wallet Carteira a destruir tokens
     */
    function destroyTokens(address wallet)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        require(
            security.status == WalletStatus.Blocked,
            "Wallet must be blocked first"
        );
        
        security.status = WalletStatus.Destroyed;
        
        emit WalletDestroyed(wallet, security.currentRiskScore);
        
        // Nota: Integração com SovereignCurrency para queimar SOB
        // será feita externamente via interface ISovereignCurrency
    }
    
    /**
     * @notice Resolve incidente (falso positivo)
     * @param wallet Carteira
     * @param incidentId ID do incidente
     */
    function resolveIncident(
        address wallet,
        uint256 incidentId
    )
        external
        onlyRole(VALIDATOR_ROLE)
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        require(incidentId < security.incidents.length, "Invalid incident");
        
        FraudIncident storage incident = security.incidents[incidentId];
        require(!incident.resolved, "Already resolved");
        
        incident.resolved = true;
        incident.resolver = msg.sender;
        incident.resolvedAt = block.timestamp;
        
        // Reduzir score de risco
        _decreaseRiskScore(wallet, incident.riskScore / 2);
        
        emit IncidentResolved(wallet, incidentId, msg.sender);
    }
    
    /**
     * @notice Libera carteira da quarentena (se período passou)
     * @param wallet Carteira a liberar
     */
    function releaseFromQuarantine(address wallet)
        external
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        require(
            security.status == WalletStatus.Quarantine,
            "Not in quarantine"
        );
        require(
            block.timestamp >= security.quarantineUntil,
            "Quarantine period not over"
        );
        
        security.status = WalletStatus.Active;
        security.currentRiskScore = 0;
        
        emit RiskScoreUpdated(wallet, security.currentRiskScore, 0);
    }
    
    // ============ ANALYSIS FUNCTIONS ============
    
    /**
     * @notice Analisa ação para detecção de fraude
     * @param wallet Carteira
     * @param action Ação realizada
     * @param security Estado de segurança
     */
    function _analyzeForFraud(
        address wallet,
        Action memory action,
        WalletSecurity storage security
    )
        internal
    {
        // REGRA 1: Velocidade (múltiplas ações rápidas)
        if (_detectVelocityAnomaly(security)) {
            _addIncident(
                wallet,
                FraudType.VelocityAnomaly,
                30,
                "Multiple rapid actions detected",
                abi.encode(security.actionsInLastHour)
            );
        }
        
        // REGRA 2: Geolocalização impossível
        if (security.recentActions.length > 0 && _detectImpossibleTravel(security, action.location)) {
            _addIncident(
                wallet,
                FraudType.GeolocationImpossible,
                50,
                "Impossible travel speed detected",
                abi.encode(action.location)
            );
        }
        
        // REGRA 3: Dispositivo desconhecido
        if (_detectUnknownDevice(security, action.deviceFingerprint)) {
            _addIncident(
                wallet,
                FraudType.UnknownDevice,
                25,
                "Unknown device detected",
                abi.encode(action.deviceFingerprint)
            );
        }
        
        // REGRA 4: Horário incomum
        if (_detectUnusualTime(security, action.timestamp)) {
            _addIncident(
                wallet,
                FraudType.UnusualTime,
                15,
                "Activity at unusual time",
                abi.encode(action.timestamp)
            );
        }
        
        // REGRA 5: Falha biométrica
        if (!action.biometricVerified && action.actionType != ActionType.Login) {
            _addIncident(
                wallet,
                FraudType.BiometricFailure,
                35,
                "Biometric verification failed",
                abi.encode(action.actionType)
            );
        }
        
        // REGRA 6: Tentativa de drenar recursos
        if (_detectDrainAttempt(security, action)) {
            _addIncident(
                wallet,
                FraudType.DrainAttempt,
                60,
                "Drain attempt detected",
                abi.encode(action.value)
            );
        }
        
        // Atualizar status baseado no score
        _updateWalletStatus(wallet, security);
    }
    
    /**
     * @notice Detecta anomalia de velocidade
     */
    function _detectVelocityAnomaly(WalletSecurity storage security)
        internal
        view
        returns (bool)
    {
        return security.actionsInLastHour > MAX_ACTIONS_PER_HOUR;
    }
    
    /**
     * @notice Detecta viagem impossível
     */
    function _detectImpossibleTravel(
        WalletSecurity storage security,
        GeoLocation memory newLocation
    )
        internal
        view
        returns (bool)
    {
        if (security.recentActions.length == 0) return false;
        
        Action storage lastAction = security.recentActions[security.recentActions.length - 1];
        GeoLocation memory lastLocation = lastAction.location;
        
        // Calcular distância (simplificado - usar haversine em produção)
        uint256 distance = _calculateDistance(lastLocation, newLocation);
        uint256 timeDiff = newLocation.timestamp - lastLocation.timestamp;
        
        if (timeDiff == 0) return false;
        
        // Velocidade em km/h
        uint256 speed = (distance * 3600) / timeDiff;
        
        return speed > MAX_TRAVEL_SPEED;
    }
    
    /**
     * @notice Detecta dispositivo desconhecido
     */
    function _detectUnknownDevice(
        WalletSecurity storage security,
        bytes32 deviceFingerprint
    )
        internal
        view
        returns (bool)
    {
        for (uint i = 0; i < security.profile.knownDevices.length; i++) {
            if (security.profile.knownDevices[i] == deviceFingerprint) {
                return false;
            }
        }
        return security.profile.knownDevices.length > 0;
    }
    
    /**
     * @notice Detecta horário incomum
     */
    function _detectUnusualTime(
        WalletSecurity storage security,
        uint256 timestamp
    )
        internal
        view
        returns (bool)
    {
        if (security.profile.typicalHours.length == 0) return false;
        
        uint256 hour = (timestamp / 1 hours) % 24;
        
        // Verificar se hora está no bitmap de horários típicos
        // Simplificado - em produção usar análise estatística
        return false; // TODO: Implementar bitmap check
    }
    
    /**
     * @notice Detecta tentativa de drenar recursos
     */
    function _detectDrainAttempt(
        WalletSecurity storage security,
        Action memory action
    )
        internal
        view
        returns (bool)
    {
        // Se está tentando remover carteiras ou transferir grande valor
        if (action.actionType == ActionType.RemoveWallet) {
            return true;
        }
        
        // Se valor é muito alto comparado ao histórico
        // TODO: Integrar com SovereignCurrency para verificar saldo
        
        return false;
    }
    
    /**
     * @notice Calcula distância entre duas coordenadas (simplificado)
     * @dev Em produção, usar fórmula Haversine completa
     */
    function _calculateDistance(
        GeoLocation memory loc1,
        GeoLocation memory loc2
    )
        internal
        pure
        returns (uint256)
    {
        // Simplificado: distância euclidiana
        // 1 grau ≈ 111 km
        int256 latDiff = loc2.latitude - loc1.latitude;
        int256 lonDiff = loc2.longitude - loc1.longitude;
        
        uint256 latDist = uint256(latDiff < 0 ? -latDiff : latDiff) * 111 / 1e6;
        uint256 lonDist = uint256(lonDiff < 0 ? -lonDiff : lonDiff) * 111 / 1e6;
        
        // Pitágoras
        return _sqrt(latDist * latDist + lonDist * lonDist);
    }
    
    /**
     * @notice Raiz quadrada (Babylonian method)
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Adiciona incidente de fraude
     */
    function _addIncident(
        address wallet,
        FraudType fraudType,
        uint256 riskScore,
        string memory description,
        bytes memory evidence
    )
        internal
    {
        WalletSecurity storage security = walletSecurity[wallet];
        
        security.incidents.push(FraudIncident({
            fraudType: fraudType,
            detectedAt: block.timestamp,
            riskScore: riskScore,
            description: description,
            evidence: evidence,
            resolved: false,
            resolver: address(0),
            resolvedAt: 0
        }));
        
        security.totalIncidents++;
        totalIncidents++;
        
        // Aumentar score de risco
        _increaseRiskScore(wallet, riskScore);
        
        emit FraudDetected(wallet, fraudType, riskScore, description);
    }
    
    /**
     * @notice Aumenta score de risco
     */
    function _increaseRiskScore(address wallet, uint256 amount)
        internal
    {
        WalletSecurity storage security = walletSecurity[wallet];
        uint256 oldScore = security.currentRiskScore;
        
        security.currentRiskScore += amount;
        if (security.currentRiskScore > MAX_RISK_SCORE) {
            security.currentRiskScore = MAX_RISK_SCORE;
        }
        
        emit RiskScoreUpdated(wallet, oldScore, security.currentRiskScore);
    }
    
    /**
     * @notice Diminui score de risco
     */
    function _decreaseRiskScore(address wallet, uint256 amount)
        internal
    {
        WalletSecurity storage security = walletSecurity[wallet];
        uint256 oldScore = security.currentRiskScore;
        
        if (security.currentRiskScore > amount) {
            security.currentRiskScore -= amount;
        } else {
            security.currentRiskScore = 0;
        }
        
        emit RiskScoreUpdated(wallet, oldScore, security.currentRiskScore);
    }
    
    /**
     * @notice Atualiza status da carteira baseado no score
     */
    function _updateWalletStatus(address wallet, WalletSecurity storage security)
        internal
    {
        WalletStatus oldStatus = security.status;
        
        if (security.currentRiskScore >= BLOCK_THRESHOLD) {
            security.status = WalletStatus.Blocked;
            totalBlocked++;
            emit WalletBlocked(wallet, security.currentRiskScore, security.totalIncidents);
        } else if (security.currentRiskScore >= QUARANTINE_THRESHOLD) {
            if (oldStatus != WalletStatus.Quarantine) {
                security.status = WalletStatus.Quarantine;
                security.quarantineUntil = block.timestamp + QUARANTINE_PERIOD;
                emit WalletQuarantined(wallet, security.currentRiskScore, security.quarantineUntil);
            }
        } else if (security.currentRiskScore >= 20) {
            security.status = WalletStatus.Monitoring;
        } else {
            security.status = WalletStatus.Active;
        }
    }
    
    /**
     * @notice Atualiza contador de ações por hora
     */
    function _updateActionCounter(WalletSecurity storage security)
        internal
    {
        // Contar ações na última hora
        uint256 count = 0;
        
        if (block.timestamp < 1 hours) {
            // Se blockchain iniciou há menos de 1 hora, contar todas
            count = security.recentActions.length;
        } else {
            uint256 oneHourAgo = block.timestamp - 1 hours;
            
            for (uint i = security.recentActions.length; i > 0; i--) {
                if (security.recentActions[i-1].timestamp >= oneHourAgo) {
                    count++;
                } else {
                    break;
                }
            }
        }
        
        security.actionsInLastHour = count;
    }
    
    /**
     * @notice Remove ação mais antiga
     */
    function _removeOldestAction(WalletSecurity storage security)
        internal
    {
        for (uint i = 0; i < security.recentActions.length - 1; i++) {
            security.recentActions[i] = security.recentActions[i + 1];
        }
        security.recentActions.pop();
    }
    
    /**
     * @notice Inicializa regras padrão
     */
    function _initializeDefaultRules()
        internal
    {
        _addRule("Velocity Anomaly", FraudType.VelocityAnomaly, 30);
        _addRule("Impossible Travel", FraudType.GeolocationImpossible, 50);
        _addRule("Unknown Device", FraudType.UnknownDevice, 25);
        _addRule("Unusual Time", FraudType.UnusualTime, 15);
        _addRule("Biometric Failure", FraudType.BiometricFailure, 35);
        _addRule("Drain Attempt", FraudType.DrainAttempt, 60);
        _addRule("Social Report", FraudType.SocialReport, 20);
        _addRule("Pattern Deviation", FraudType.PatternDeviation, 40);
    }
    
    /**
     * @notice Adiciona regra de detecção
     */
    function _addRule(
        string memory name,
        FraudType fraudType,
        uint256 riskScore
    )
        internal
    {
        detectionRules.push(DetectionRule({
            name: name,
            fraudType: fraudType,
            riskScore: riskScore,
            enabled: true,
            createdAt: block.timestamp
        }));
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna estado de segurança da carteira
     */
    function getWalletSecurity(address wallet)
        external
        view
        returns (
            WalletStatus status,
            uint256 riskScore,
            uint256 incidents,
            uint256 actionsInLastHour
        )
    {
        WalletSecurity storage security = walletSecurity[wallet];
        return (
            security.status,
            security.currentRiskScore,
            security.totalIncidents,
            security.actionsInLastHour
        );
    }
    
    /**
     * @notice Retorna incidentes de uma carteira
     */
    function getIncidents(address wallet)
        external
        view
        returns (FraudIncident[] memory)
    {
        return walletSecurity[wallet].incidents;
    }
    
    /**
     * @notice Verifica se carteira está bloqueada
     */
    function isBlocked(address wallet)
        external
        view
        returns (bool)
    {
        WalletStatus status = walletSecurity[wallet].status;
        return status == WalletStatus.Blocked || status == WalletStatus.Destroyed;
    }
    
    /**
     * @notice Retorna ações recentes
     */
    function getRecentActions(address wallet)
        external
        view
        returns (Action[] memory)
    {
        return walletSecurity[wallet].recentActions;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function addTrustedWallet(address wallet) external onlyRole(VALIDATOR_ROLE) {
        trustedWallets[wallet] = true;
    }
    
    function removeTrustedWallet(address wallet) external onlyRole(VALIDATOR_ROLE) {
        trustedWallets[wallet] = false;
    }
    
    function addToBlacklist(address wallet) external onlyRole(VALIDATOR_ROLE) {
        blacklistedWallets[wallet] = true;
        
        WalletSecurity storage security = walletSecurity[wallet];
        security.status = WalletStatus.Blocked;
        security.currentRiskScore = MAX_RISK_SCORE;
        totalBlocked++;
        
        _addIncident(
            wallet,
            FraudType.PatternDeviation,
            MAX_RISK_SCORE,
            "Blacklisted wallet",
            abi.encode(msg.sender, block.timestamp)
        );
        
        emit WalletBlocked(wallet, MAX_RISK_SCORE, security.totalIncidents);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
