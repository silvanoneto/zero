// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title ISovereignCurrencyFunding
 * @notice Interface estendida para SovereignCurrency com suporte a funding com valor específico
 * @dev Usada pelo OrganizationalRedundancy para distribuir SOB às DAOs
 */
interface ISovereignCurrencyFunding {
    /**
     * @notice Gera moeda soberana para um endereço com valor específico
     * @param citizen Endereço do beneficiário
     * @param activityType Tipo de atividade ("dao_funding" para redundância)
     * @param amount Quantidade de SOB a gerar
     * @param proofHash Hash de prova da transação
     */
    function earnCurrencyWithAmount(
        address citizen,
        string memory activityType,
        uint256 amount,
        bytes32 proofHash
    ) external;
    
    /**
     * @notice Retorna o saldo de SOB de um endereço
     */
    function balanceOf(address citizen) external view returns (uint256);
}
