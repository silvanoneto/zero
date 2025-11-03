// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ISovereignInterfaces.sol";

/**
 * @title ProofOfLife (Prova de Vida)
 * @notice Sistema de autenticação contínua com avaliação de saúde existencial
 * @dev Previne fraude por morte, impersonation e provê análise de bem-estar
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1. Pessoa falecida não pode mais votar/participar
 * 2. Impersonation detectado via biometria/comportamento
 * 3. IDS expira se não renovado (máx 1 ano)
 * 4. Saúde existencial monitorada e melhorias recomendadas
 * 
 * CARACTERÍSTICAS:
 * - Prova de vida periódica (máx 90 dias)
 * - Autenticação contínua (comportamento, biometria)
 * - Laudo de saúde existencial (físico, mental, social)
 * - Recomendações personalizadas de bem-estar
 * - Sistema de alerta para riscos
 * - Privacy-preserving (zero-knowledge proofs)
 */
contract ProofOfLife is AccessControl, Pausable {
    
    // ============ ROLES ============
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant HEALTH_ASSESSOR_ROLE = keccak256("HEALTH_ASSESSOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Período máximo sem prova de vida (90 dias)
    uint256 public constant MAX_PROOF_INTERVAL = 90 days;
    
    /// @notice Período de expiração do IDS (1 ano)
    uint256 public constant IDS_EXPIRATION = 365 days;
    
    /// @notice Período de alerta antes da expiração (30 dias)
    uint256 public constant ALERT_BEFORE_EXPIRATION = 30 days;
    
    // ============ ENUMS ============
    
    enum HealthDimension {
        Physical,       // Saúde física
        Mental,         // Saúde mental
        Social,         // Conexões sociais
        Financial,      // Segurança financeira
        Environmental,  // Qualidade do ambiente
        Purpose         // Senso de propósito
    }
    
    enum RiskLevel {
        Low,            // Baixo risco
        Medium,         // Risco médio
        High,           // Alto risco
        Critical        // Crítico - intervenção urgente
    }
    
    enum AuthenticationMethod {
        Biometric,      // Face/impressão digital/íris
        Behavioral,     // Padrões de digitação/movimento
        Challenge,      // Desafio cognitivo
        Social,         // Confirmação por conhecidos
        Geolocation     // Localização esperada
    }
    
    // ============ STRUCTS ============
    
    /// @notice Prova de vida individual
    struct LifeProof {
        uint256 timestamp;
        AuthenticationMethod method;
        uint8 confidenceScore;      // 0-100
        bytes32 proofHash;          // Hash da prova off-chain
        address validator;
    }
    
    /// @notice Avaliação de uma dimensão de saúde
    struct HealthScore {
        uint8 score;                // 0-100
        RiskLevel risk;
        string[] recommendations;   // Recomendações
        uint256 timestamp;
    }
    
    /// @notice Laudo completo de saúde existencial
    struct HealthAssessment {
        mapping(HealthDimension => HealthScore) dimensions;
        uint8 overallScore;         // 0-100 (média ponderada)
        RiskLevel overallRisk;
        uint256 timestamp;
        bytes32 reportHash;         // Hash do laudo completo off-chain
    }
    
    /// @notice Estado do cidadão
    struct CitizenIdentity {
        bool isActive;
        uint256 registrationDate;
        uint256 lastProofOfLife;
        uint256 idsExpiration;
        uint256 proofCount;
        LifeProof[] proofs;
        HealthAssessment currentHealth;
        bool needsIntervention;     // Flag de alerta
        bytes32 identityId;         // ID único da identidade
    }
    
    // ============ STATE ============
    
    /// @notice Mapeamento de identidades
    mapping(address => CitizenIdentity) internal citizens;
    
    /// @notice Mapeamento de identityId para wallet
    mapping(bytes32 => address) public identityToWallet;
    
    /// @notice Lista de cidadãos ativos
    address[] public activeCitizens;
    
    /// @notice Cidadãos que precisam renovação urgente
    address[] public expirationAlerts;
    
    /// @notice Total de cidadãos registrados
    uint256 public totalCitizens;
    
    /// @notice Total de provas de vida realizadas
    uint256 public totalProofs;
    
    /// @notice Referência ao contrato SovereignCurrency (opcional)
    address public sovereignCurrency;

    
    // ============ EVENTS ============
    
    event CitizenRegistered(
        address indexed citizen,
        uint256 idsExpiration
    );
    
    event ProofOfLifeSubmitted(
        address indexed citizen,
        AuthenticationMethod method,
        uint8 confidenceScore,
        uint256 timestamp
    );
    
    event IDSRenewed(
        address indexed citizen,
        uint256 newExpiration
    );
    
    event IDSExpired(
        address indexed citizen,
        uint256 expiredAt
    );
    
    event HealthAssessmentCompleted(
        address indexed citizen,
        uint8 overallScore,
        RiskLevel overallRisk,
        uint256 timestamp
    );
    
    event InterventionRequired(
        address indexed citizen,
        RiskLevel risk,
        string reason
    );
    
    event ExpirationAlertTriggered(
        address indexed citizen,
        uint256 expiresIn
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(HEALTH_ASSESSOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Registra novo cidadão no sistema
     * @param citizen Endereço do cidadão
     * @param initialProofHash Hash da prova de vida inicial
     */
    function registerCitizen(
        address citizen,
        bytes32 initialProofHash
    )
        external
        onlyRole(VALIDATOR_ROLE)
        whenNotPaused
        returns (bytes32 identityId)
    {
        require(citizen != address(0), "Invalid address");
        require(!citizens[citizen].isActive, "Already registered");
        
        // Gerar identityId único
        identityId = keccak256(abi.encodePacked(
            citizen,
            block.timestamp,
            totalCitizens,
            initialProofHash
        ));
        
        CitizenIdentity storage identity = citizens[citizen];
        identity.isActive = true;
        identity.registrationDate = block.timestamp;
        identity.lastProofOfLife = block.timestamp;
        identity.idsExpiration = block.timestamp + IDS_EXPIRATION;
        identity.proofCount = 0;
        identity.identityId = identityId;
        
        // Mapear identityId para wallet
        identityToWallet[identityId] = citizen;
        
        // Primeira prova de vida
        identity.proofs.push(LifeProof({
            timestamp: block.timestamp,
            method: AuthenticationMethod.Biometric,
            confidenceScore: 100,
            proofHash: initialProofHash,
            validator: msg.sender
        }));
        
        activeCitizens.push(citizen);
        totalCitizens++;
        totalProofs++;
        
        // INTEGRAÇÃO: Vincular wallet à identidade no SovereignCurrency
        if (sovereignCurrency != address(0)) {
            ISovereignCurrency(sovereignCurrency).linkWalletToIdentity(citizen, identityId);
        }
        
        emit CitizenRegistered(citizen, identity.idsExpiration);
        
        return identityId;
    }
    
    /**
     * @notice Submete prova de vida
     * @param citizen Endereço do cidadão
     * @param method Método de autenticação usado
     * @param confidenceScore Score de confiança (0-100)
     * @param proofHash Hash da prova off-chain
     */
    function submitProofOfLife(
        address citizen,
        AuthenticationMethod method,
        uint8 confidenceScore,
        bytes32 proofHash
    )
        external
        onlyRole(VALIDATOR_ROLE)
        whenNotPaused
    {
        require(citizens[citizen].isActive, "Citizen not registered");
        require(confidenceScore <= 100, "Invalid confidence score");
        require(confidenceScore >= 70, "Confidence too low");
        
        CitizenIdentity storage identity = citizens[citizen];
        
        // Verificar se não expirou
        require(block.timestamp < identity.idsExpiration, "IDS expired");
        
        // Registrar prova
        identity.proofs.push(LifeProof({
            timestamp: block.timestamp,
            method: method,
            confidenceScore: confidenceScore,
            proofHash: proofHash,
            validator: msg.sender
        }));
        
        identity.lastProofOfLife = block.timestamp;
        identity.proofCount++;
        totalProofs++;
        
        emit ProofOfLifeSubmitted(citizen, method, confidenceScore, block.timestamp);
    }
    
    /**
     * @notice Renova IDS do cidadão
     * @param citizen Endereço do cidadão
     */
    function renewIDS(address citizen)
        external
        onlyRole(VALIDATOR_ROLE)
        whenNotPaused
    {
        CitizenIdentity storage identity = citizens[citizen];
        require(identity.isActive, "Citizen not registered");
        
        // Verificar se teve prova de vida recente (últimos 90 dias)
        require(
            block.timestamp - identity.lastProofOfLife <= MAX_PROOF_INTERVAL,
            "Need recent proof of life"
        );
        
        // Renovar por mais 1 ano
        identity.idsExpiration = block.timestamp + IDS_EXPIRATION;
        
        emit IDSRenewed(citizen, identity.idsExpiration);
    }
    
    /**
     * @notice Submete avaliação de saúde existencial
     * @param citizen Endereço do cidadão
     * @param dimension Dimensão da saúde
     * @param score Score (0-100)
     * @param risk Nível de risco
     * @param recommendations Recomendações
     */
    function submitHealthScore(
        address citizen,
        HealthDimension dimension,
        uint8 score,
        RiskLevel risk,
        string[] memory recommendations
    )
        external
        onlyRole(HEALTH_ASSESSOR_ROLE)
        whenNotPaused
    {
        require(citizens[citizen].isActive, "Citizen not registered");
        require(score <= 100, "Invalid score");
        
        CitizenIdentity storage identity = citizens[citizen];
        
        identity.currentHealth.dimensions[dimension] = HealthScore({
            score: score,
            risk: risk,
            recommendations: recommendations,
            timestamp: block.timestamp
        });
        
        // Atualizar timestamp da avaliação
        identity.currentHealth.timestamp = block.timestamp;
        
        // Se risco crítico, marcar para intervenção
        if (risk == RiskLevel.Critical) {
            identity.needsIntervention = true;
            emit InterventionRequired(citizen, risk, "Critical health dimension");
        }
    }
    
    /**
     * @notice Finaliza avaliação calculando score geral
     * @param citizen Endereço do cidadão
     * @param reportHash Hash do laudo completo off-chain
     */
    function finalizeHealthAssessment(
        address citizen,
        bytes32 reportHash
    )
        external
        onlyRole(HEALTH_ASSESSOR_ROLE)
        whenNotPaused
    {
        require(citizens[citizen].isActive, "Citizen not registered");
        
        CitizenIdentity storage identity = citizens[citizen];
        HealthAssessment storage assessment = identity.currentHealth;
        
        // Calcular score geral (média ponderada)
        uint256 totalScore = 0;
        uint256 criticalCount = 0;
        
        for (uint i = 0; i < 6; i++) {
            HealthDimension dim = HealthDimension(i);
            HealthScore storage dimScore = assessment.dimensions[dim];
            
            totalScore += dimScore.score;
            
            if (dimScore.risk == RiskLevel.Critical) {
                criticalCount++;
            }
        }
        
        assessment.overallScore = uint8(totalScore / 6);
        
        // Determinar risco geral
        if (criticalCount > 0) {
            assessment.overallRisk = RiskLevel.Critical;
        } else if (assessment.overallScore < 50) {
            assessment.overallRisk = RiskLevel.High;
        } else if (assessment.overallScore < 70) {
            assessment.overallRisk = RiskLevel.Medium;
        } else {
            assessment.overallRisk = RiskLevel.Low;
        }
        
        assessment.reportHash = reportHash;
        assessment.timestamp = block.timestamp;
        
        emit HealthAssessmentCompleted(
            citizen,
            assessment.overallScore,
            assessment.overallRisk,
            block.timestamp
        );
    }
    
    /**
     * @notice Marca IDS como expirado (chamado por keeper/cron)
     * @param citizen Endereço do cidadão
     */
    function markAsExpired(address citizen)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        CitizenIdentity storage identity = citizens[citizen];
        require(identity.isActive, "Already inactive");
        require(block.timestamp >= identity.idsExpiration, "Not expired yet");
        
        identity.isActive = false;
        
        emit IDSExpired(citizen, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Verifica se IDS está válido
     * @param citizen Endereço do cidadão
     */
    function isIDSValid(address citizen) external view returns (bool) {
        CitizenIdentity storage identity = citizens[citizen];
        
        return identity.isActive && 
               block.timestamp < identity.idsExpiration &&
               (block.timestamp - identity.lastProofOfLife) <= MAX_PROOF_INTERVAL;
    }
    
    /**
     * @notice Retorna tempo até expiração
     * @param citizen Endereço do cidadão
     */
    function getTimeUntilExpiration(address citizen) 
        external 
        view 
        returns (uint256) 
    {
        CitizenIdentity storage identity = citizens[citizen];
        
        if (!identity.isActive || block.timestamp >= identity.idsExpiration) {
            return 0;
        }
        
        return identity.idsExpiration - block.timestamp;
    }
    
    /**
     * @notice Verifica se precisa de prova de vida
     * @param citizen Endereço do cidadão
     */
    function needsProofOfLife(address citizen) external view returns (bool) {
        CitizenIdentity storage identity = citizens[citizen];
        
        if (!identity.isActive) return false;
        
        return (block.timestamp - identity.lastProofOfLife) >= (MAX_PROOF_INTERVAL - 7 days);
    }
    
    /**
     * @notice Retorna informações do cidadão
     * @param citizen Endereço do cidadão
     */
    function getCitizenInfo(address citizen)
        external
        view
        returns (
            bool isActive,
            uint256 registrationDate,
            uint256 lastProofOfLife,
            uint256 idsExpiration,
            uint256 proofCount,
            bool needsIntervention
        )
    {
        CitizenIdentity storage identity = citizens[citizen];
        
        return (
            identity.isActive,
            identity.registrationDate,
            identity.lastProofOfLife,
            identity.idsExpiration,
            identity.proofCount,
            identity.needsIntervention
        );
    }
    
    /**
     * @notice Retorna score de saúde de uma dimensão
     * @param citizen Endereço do cidadão
     * @param dimension Dimensão da saúde
     */
    function getHealthScore(address citizen, HealthDimension dimension)
        external
        view
        returns (
            uint8 score,
            RiskLevel risk,
            uint256 timestamp
        )
    {
        CitizenIdentity storage identity = citizens[citizen];
        HealthScore storage healthScore = identity.currentHealth.dimensions[dimension];
        
        return (
            healthScore.score,
            healthScore.risk,
            healthScore.timestamp
        );
    }
    
    /**
     * @notice Retorna avaliação geral de saúde
     * @param citizen Endereço do cidadão
     */
    function getOverallHealth(address citizen)
        external
        view
        returns (
            uint8 overallScore,
            RiskLevel overallRisk,
            uint256 timestamp,
            bytes32 reportHash
        )
    {
        CitizenIdentity storage identity = citizens[citizen];
        
        return (
            identity.currentHealth.overallScore,
            identity.currentHealth.overallRisk,
            identity.currentHealth.timestamp,
            identity.currentHealth.reportHash
        );
    }
    
    /**
     * @notice Retorna histórico de provas de vida
     * @param citizen Endereço do cidadão
     * @param offset Índice inicial
     * @param limit Quantidade máxima
     */
    function getProofHistory(address citizen, uint256 offset, uint256 limit)
        external
        view
        returns (LifeProof[] memory)
    {
        CitizenIdentity storage identity = citizens[citizen];
        uint256 total = identity.proofs.length;
        
        if (offset >= total) {
            return new LifeProof[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        LifeProof[] memory result = new LifeProof[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = identity.proofs[offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Lista cidadãos que precisam renovação
     */
    function getCitizensNeedingRenewal()
        external
        view
        returns (address[] memory)
    {
        uint256 count = 0;
        
        // Contar quantos precisam
        for (uint256 i = 0; i < activeCitizens.length; i++) {
            address citizen = activeCitizens[i];
            CitizenIdentity storage identity = citizens[citizen];
            
            if (identity.isActive) {
                uint256 timeLeft = identity.idsExpiration > block.timestamp
                    ? identity.idsExpiration - block.timestamp
                    : 0;
                
                if (timeLeft <= ALERT_BEFORE_EXPIRATION && timeLeft > 0) {
                    count++;
                }
            }
        }
        
        // Preencher array
        address[] memory result = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeCitizens.length; i++) {
            address citizen = activeCitizens[i];
            CitizenIdentity storage identity = citizens[citizen];
            
            if (identity.isActive) {
                uint256 timeLeft = identity.idsExpiration > block.timestamp
                    ? identity.idsExpiration - block.timestamp
                    : 0;
                
                if (timeLeft <= ALERT_BEFORE_EXPIRATION && timeLeft > 0) {
                    result[index] = citizen;
                    index++;
                }
            }
        }
        
        return result;
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
     * @notice Retorna a identidade de um cidadão
     * @param citizen Endereço do cidadão
     * @return identityId ID da identidade
     */
    function getIdentityOf(address citizen) 
        external 
        view 
        returns (bytes32) 
    {
        return citizens[citizen].identityId;
    }
    
    /**
     * @notice Verifica se uma identidade está verificada
     * @param identityId ID da identidade
     * @return verified True se verificada
     */
    function isIdentityVerified(bytes32 identityId) 
        external 
        view 
        returns (bool) 
    {
        address citizen = identityToWallet[identityId];
        if (citizen == address(0)) return false;
        
        CitizenIdentity storage identity = citizens[citizen];
        return identity.isActive && block.timestamp < identity.idsExpiration;
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
}
