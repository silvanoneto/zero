// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../../interfaces/ISovereignCurrencyFunding.sol";

/**
 * @title MockSovereignCurrency
 * @notice Mock simplificado de SovereignCurrency para testes
 * @dev Implementa ISovereignCurrencyFunding com valor explícito
 */
contract MockSovereignCurrency is AccessControl, ISovereignCurrencyFunding {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    mapping(address => uint256) private balances;
    mapping(address => mapping(string => uint256)) public activityEarnings;

    event CurrencyEarned(
        address indexed citizen,
        string activityType,
        uint256 amount,
        bytes32 proofHash
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }

    /**
     * @notice Gera moeda com valor específico (implementação de ISovereignCurrencyFunding)
     * @param citizen Endereço do cidadão
     * @param activityType Tipo de atividade
     * @param amount Quantidade de SOB a gerar
     * @param proofHash Hash de prova
     */
    function earnCurrencyWithAmount(
        address citizen,
        string memory activityType,
        uint256 amount,
        bytes32 proofHash
    ) external override onlyRole(VALIDATOR_ROLE) {
        balances[citizen] += amount;
        activityEarnings[citizen][activityType] += amount;

        emit CurrencyEarned(citizen, activityType, amount, proofHash);
    }

    /**
     * @notice Retorna o saldo de um cidadão (implementação de ISovereignCurrencyFunding)
     */
    function balanceOf(address citizen) external view override returns (uint256) {
        return balances[citizen];
    }

    /**
     * @notice Função auxiliar para testes: mint direto
     */
    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    /**
     * @notice Função auxiliar para testes: burn direto
     */
    function burn(address from, uint256 amount) external {
        require(balances[from] >= amount, "Insufficient balance");
        balances[from] -= amount;
    }
}
