// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRestorativeJustice
 * @notice Interface para o sistema de Justiça Restaurativa (Artigo 6º)
 * @dev Sistema de resolução de conflitos com júris populares e mediação obrigatória
 * 
 * REQUISITOS CONSTITUCIONAIS:
 * - Júris populares descentralizados
 * - Mediação obrigatória antes de julgamento
 * - Sistema de reputação para mediadores
 * - Punições focadas em restauração, não punição
 */
interface IRestorativeJustice {
    /// @notice Estados possíveis de uma disputa
    enum DisputeStatus {
        PENDING_MEDIATION,    // Aguardando mediação
        IN_MEDIATION,         // Em processo de mediação
        MEDIATION_FAILED,     // Mediação falhou, vai para júri
        PENDING_VRF,          // Aguardando randomness do Chainlink VRF
        PENDING_JURY,         // Aguardando formação de júri
        IN_TRIAL,             // Julgamento em andamento
        VERDICT_REACHED,      // Veredito alcançado
        RESOLUTION_COMPLETED, // Resolução completa
        DISMISSED             // Caso arquivado
    }

    /// @notice Tipos de resolução restaurativa
    enum RestorationType {
        COMMUNITY_SERVICE,    // Serviço comunitário
        RESTITUTION,          // Restituição de danos
        EDUCATION,            // Programa educacional
        MEDIATED_AGREEMENT,   // Acordo mediado
        PUBLIC_APOLOGY,       // Desculpa pública
        REPUTATION_PENALTY    // Penalidade de reputação
    }

    /// @notice Estrutura de uma disputa
    struct Dispute {
        uint256 id;
        address plaintiff;         // Reclamante
        address defendant;         // Réu
        string evidenceIPFSHash;   // Hash IPFS das evidências
        DisputeStatus status;
        address mediator;
        uint256 mediationDeadline;
        address[] jurors;
        uint256 trialDeadline;
        RestorationType resolutionType;
        string resolutionDetails;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    /// @notice Estrutura de um mediador
    struct Mediator {
        address mediatorAddress;
        uint256 casesMediated;
        uint256 successfulMediations;
        uint256 failedMediations;
        uint256 reputationScore;     // 0-1000
        bool isActive;
        uint256 registeredAt;
    }

    /// @notice Estrutura de voto do júri
    struct JuryVote {
        address juror;
        bool guiltyVote;             // true = culpado, false = inocente
        RestorationType suggestedResolution;
        string reasoning;
        uint256 votedAt;
    }

    // ============ EVENTOS ============

    /// @notice Emitido quando nova disputa é criada
    event DisputeCreated(
        uint256 indexed disputeId,
        address indexed plaintiff,
        address indexed defendant,
        string evidenceIPFSHash
    );

    /// @notice Emitido quando mediador é atribuído
    event MediatorAssigned(
        uint256 indexed disputeId,
        address indexed mediator,
        uint256 deadline
    );

    /// @notice Emitido quando mediação é concluída
    event MediationCompleted(
        uint256 indexed disputeId,
        bool successful,
        string resolution
    );

    /// @notice Emitido quando júri é convocado
    event JuryConvened(
        uint256 indexed disputeId,
        address[] jurors,
        uint256 trialDeadline
    );

    /// @notice Emitido quando jurado vota
    event JuryVoteCast(
        uint256 indexed disputeId,
        address indexed juror,
        bool guiltyVote
    );

    /// @notice Emitido quando veredito é alcançado
    event VerdictReached(
        uint256 indexed disputeId,
        bool guilty,
        RestorationType resolutionType,
        string resolutionDetails
    );

    /// @notice Emitido quando resolução é cumprida
    event ResolutionCompleted(
        uint256 indexed disputeId,
        address indexed defendant,
        uint256 completedAt
    );

    /// @notice Emitido quando mediador se registra
    event MediatorRegistered(
        address indexed mediator,
        uint256 registeredAt
    );

    /// @notice Emitido quando reputação de mediador é atualizada
    event MediatorReputationUpdated(
        address indexed mediator,
        uint256 newReputation,
        uint256 casesMediated
    );

    // ============ FUNÇÕES PÚBLICAS ============

    /**
     * @notice Cria uma nova disputa
     * @param defendant Endereço do réu
     * @param evidenceIPFSHash Hash IPFS contendo as evidências
     * @return disputeId ID da disputa criada
     */
    function createDispute(
        address defendant,
        string calldata evidenceIPFSHash
    ) external returns (uint256 disputeId);

    /**
     * @notice Registra-se como mediador
     * @dev Mediador deve ter reputação mínima na DAO
     */
    function registerAsMediator() external;

    /**
     * @notice Aceita mediação de uma disputa
     * @param disputeId ID da disputa
     */
    function acceptMediation(uint256 disputeId) external;

    /**
     * @notice Completa mediação com acordo
     * @param disputeId ID da disputa
     * @param resolution Descrição da resolução acordada
     */
    function completeMediationSuccessfully(
        uint256 disputeId,
        string calldata resolution
    ) external;

    /**
     * @notice Marca mediação como falha (vai para júri)
     * @param disputeId ID da disputa
     * @param reason Razão da falha
     */
    function failMediation(
        uint256 disputeId,
        string calldata reason
    ) external;

    /**
     * @notice Convoca júri popular aleatório
     * @param disputeId ID da disputa
     * @dev Seleciona 12 jurados aleatórios usando VRF
     */
    function conveneJury(uint256 disputeId) external;

    /**
     * @notice Vota como jurado
     * @param disputeId ID da disputa
     * @param guiltyVote Voto (true = culpado, false = inocente)
     * @param suggestedResolution Tipo de resolução sugerida
     * @param reasoning Justificativa do voto
     */
    function castJuryVote(
        uint256 disputeId,
        bool guiltyVote,
        RestorationType suggestedResolution,
        string calldata reasoning
    ) external;

    /**
     * @notice Finaliza julgamento e emite veredito
     * @param disputeId ID da disputa
     */
    function finalizeVerdict(uint256 disputeId) external;

    /**
     * @notice Marca resolução como cumprida
     * @param disputeId ID da disputa
     * @param proofIPFSHash Hash IPFS da prova de cumprimento
     */
    function completeResolution(
        uint256 disputeId,
        string calldata proofIPFSHash
    ) external;

    /**
     * @notice Arquiva disputa (ambas partes concordam)
     * @param disputeId ID da disputa
     */
    function dismissDispute(uint256 disputeId) external;

    // ============ FUNÇÕES VIEW ============

    /**
     * @notice Retorna dados completos de uma disputa
     * @param disputeId ID da disputa
     * @return Disputa completa
     */
    function getDispute(uint256 disputeId) external view returns (Dispute memory);

    /**
     * @notice Retorna dados de um mediador
     * @param mediatorAddress Endereço do mediador
     * @return Mediador
     */
    function getMediator(address mediatorAddress) external view returns (Mediator memory);

    /**
     * @notice Retorna votos do júri de uma disputa
     * @param disputeId ID da disputa
     * @return Array de votos
     */
    function getJuryVotes(uint256 disputeId) external view returns (JuryVote[] memory);

    /**
     * @notice Retorna todas disputas de um endereço
     * @param participant Endereço (plaintiff ou defendant)
     * @return Array de IDs de disputas
     */
    function getDisputesByParticipant(address participant) external view returns (uint256[] memory);

    /**
     * @notice Retorna mediadores ativos por reputação
     * @param minReputation Reputação mínima
     * @return Array de endereços de mediadores
     */
    function getActiveMediators(uint256 minReputation) external view returns (address[] memory);

    /**
     * @notice Checa se endereço é jurado em disputa
     * @param disputeId ID da disputa
     * @param account Endereço a verificar
     * @return true se for jurado
     */
    function isJuror(uint256 disputeId, address account) external view returns (bool);

    /**
     * @notice Retorna estatísticas gerais do sistema
     * @return totalDisputes Total de disputas
     * @return activeMediations Mediações ativas
     * @return activeTrials Julgamentos ativos
     * @return resolutionRate Taxa de resolução (%)
     */
    function getSystemStats() external view returns (
        uint256 totalDisputes,
        uint256 activeMediations,
        uint256 activeTrials,
        uint256 resolutionRate
    );

    /**
     * @notice Verifica se endereço tem penalidade de reputação ativa
     * @param account Endereço a verificar
     * @return true se tem penalidade ativa
     */
    function hasActivePenalty(address account) external view returns (bool);

    /**
     * @notice Registra cidadão como elegível para júri
     * @param citizen Endereço do cidadão
     * @dev Deve ter ProofOfLife e stake mínimo
     */
    function registerAsEligibleJuror(address citizen) external;

    /**
     * @notice Remove elegibilidade de júri
     * @param citizen Endereço do cidadão
     */
    function removeEligibleJuror(address citizen) external;

    /**
     * @notice Retorna pool de jurados elegíveis
     * @return Array de endereços elegíveis
     */
    function getEligibleJurors() external view returns (address[] memory);
}
