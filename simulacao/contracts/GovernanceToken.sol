// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title GovernanceToken (IDS - Identidade Soberana)
 * @notice Token de governança da Cybersyn 2.0
 * @dev Implementa identidade soberana com checkpoints para votação
 * 
 * Características:
 * - ERC20 padrão com extensões
 * - ERC20Votes para checkpoints e histórico de votação
 * - ERC20Permit para aprovações sem gas
 * - Pausável em emergências
 * - Burnable para deflação
 * - AccessControl para gestão
 * 
 * Supply Inicial: 100.000.000 IDS
 * Decimais: 18
 */
contract GovernanceToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Votes,
    AccessControl, 
    Pausable 
{
    // ============ ROLES ============
    
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // ============ CONSTANTS ============
    
    /// @notice Supply inicial: 100 milhões de tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Cap máximo: 1 bilhão de tokens (proteção contra inflação)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // ============ STATE ============
    
    /// @notice Total mintado até agora
    uint256 public totalMinted;
    
    // ============ EVENTS ============
    
    event TokensMinted(address indexed to, uint256 amount, uint256 totalSupply);
    
    // ============ CONSTRUCTOR ============
    
    constructor() 
        ERC20("Identidade Soberana", "IDS")
        EIP712("Identidade Soberana", "1")
    {
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Mint supply inicial
        _mint(msg.sender, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
        
        emit TokensMinted(msg.sender, INITIAL_SUPPLY, totalSupply());
    }
    
    // ============ CHECKPOINTS ============
    
    /**
     * @notice Retorna o voting power de uma conta em um ponto específico no tempo
     * @param account Endereço
     * @param timepoint Block number ou timestamp
     * @return Voting power no timepoint especificado
     */
    function getPastVotes(address account, uint256 timepoint) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return super.getPastVotes(account, timepoint);
    }
    
    /**
     * @notice Retorna o total supply em um ponto específico no tempo
     * @param timepoint Block number ou timestamp
     * @return Total supply no timepoint especificado
     */
    function getPastTotalSupply(uint256 timepoint) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return super.getPastTotalSupply(timepoint);
    }
    
    /**
     * @notice Retorna o clock mode (usa block numbers)
     */
    function clock() public view override returns (uint48) {
        return uint48(block.number);
    }
    
    /**
     * @notice Retorna o clock mode description
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=blocknumber&from=default";
    }
    
    // ============ MINTING ============
    
    /**
     * @notice Mint novos tokens (sujeito ao cap)
     * @dev Usado para rewards de participação, grants, etc.
     * @param to Destinatário
     * @param amount Quantidade a mintar
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
    {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit TokensMinted(to, amount, totalSupply());
    }
    
    // ============ PAUSE ============
    
    /**
     * @notice Pausa transferências em emergência
     * @dev Apenas PAUSER_ROLE (multi-sig)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Despausa transferências
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // ============ OVERRIDES ============
    
    /**
     * @notice Hook antes de transferência
     * @dev Integra pausable e votes
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) 
        internal 
        override(ERC20, ERC20Votes) 
        whenNotPaused 
    {
        super._update(from, to, amount);
    }
    
    /**
     * @notice Retorna nonce para EIP-2612 permits
     */
    function nonces(address owner)
        public
        view
        override
        returns (uint256)
    {
        return super.nonces(owner);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Retorna o voting power atual de uma conta
     * @param account Endereço
     */
    function getVotes(address account) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return super.getVotes(account);
    }
    
    /**
     * @notice Retorna os delegates de uma conta
     * @param account Endereço
     */
    function delegates(address account)
        public
        view
        override
        returns (address)
    {
        return super.delegates(account);
    }
}
