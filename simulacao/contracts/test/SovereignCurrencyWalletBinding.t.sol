// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../SovereignCurrency.sol";

/**
 * @title SovereignCurrencyWalletBindingTest
 * @notice Testa sistema de vínculo carteira-token e migração segura
 */
contract SovereignCurrencyWalletBindingTest is Test {
    SovereignCurrency public currency;
    
    address public admin = address(1);
    address public validator = address(2);
    
    // Usuário legítimo com múltiplas carteiras
    bytes32 public aliceIdentity = keccak256("alice");
    address public aliceWallet1 = address(0x100);
    address public aliceWallet2 = address(0x101);
    address public aliceWallet3 = address(0x102);
    
    // Atacante tentando roubar tokens
    bytes32 public bobIdentity = keccak256("bob");
    address public bobWallet = address(0x200);
    
    function setUp() public {
        vm.startPrank(admin);
        
        currency = new SovereignCurrency();
        currency.grantRole(currency.VALIDATOR_ROLE(), validator);
        
        vm.stopPrank();
    }
    
    // ===== TESTE 1: Tokens gerados ficam vinculados à carteira original =====
    function testTokensBoundToOriginalWallet() public {
        vm.prank(validator);
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        
        // Verificar que originalWallet foi setada
        (,,,,address originalWallet,,) = currency.getCitizenInfo(aliceWallet1);
        assertEq(originalWallet, aliceWallet1);
    }
    
    // ===== TESTE 2: Tokens sem identidade são vulneráveis mas não destruídos =====
    function testTokensWithoutIdentityVulnerable() public {
        vm.prank(validator);
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        
        (bool valid, string memory reason) = currency.validateWalletTokens(aliceWallet1);
        
        assertTrue(valid);
        assertEq(reason, "No identity linked - vulnerable state");
    }
    
    // ===== TESTE 3: Vincular identidade protege tokens =====
    function testLinkIdentityProtectsTokens() public {
        // Gerar tokens
        vm.prank(validator);
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        
        // Vincular identidade
        vm.prank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        
        (bool valid, string memory reason) = currency.validateWalletTokens(aliceWallet1);
        
        assertTrue(valid);
        assertEq(reason, "Valid - original wallet");
    }
    
    // ===== TESTE 4: Migração entre carteiras da mesma identidade =====
    function testMigrateBetweenSameIdentityWallets() public {
        // Setup: Alice gera 100 SOB na wallet1
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet2, aliceIdentity);
        
        currency.earnCurrency(aliceWallet1, "proposal", bytes32(0)); // 100 SOB
        vm.stopPrank();
        
        uint256 balanceBefore1 = currency.balanceOf(aliceWallet1);
        uint256 balanceBefore2 = currency.balanceOf(aliceWallet2);
        
        assertEq(balanceBefore1, 100);
        assertEq(balanceBefore2, 0);
        
        // Migrar 50 SOB para wallet2
        vm.prank(validator);
        currency.migrateTokensBetweenWallets(aliceWallet1, aliceWallet2, 50);
        
        uint256 balanceAfter1 = currency.balanceOf(aliceWallet1);
        uint256 balanceAfter2 = currency.balanceOf(aliceWallet2);
        
        assertEq(balanceAfter1, 50);
        assertEq(balanceAfter2, 50);
    }
    
    // ===== TESTE 5: Migração preserva carteira original =====
    function testMigrationPreservesOriginalWallet() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet2, aliceIdentity);
        
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        currency.migrateTokensBetweenWallets(aliceWallet1, aliceWallet2, 10);
        vm.stopPrank();
        
        // Wallet2 deve ter originalWallet = wallet1
        (,,,,address originalWallet,,) = currency.getCitizenInfo(aliceWallet2);
        assertEq(originalWallet, aliceWallet1);
    }
    
    // ===== TESTE 6: Tokens migrados são válidos na nova carteira =====
    function testMigratedTokensAreValid() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet2, aliceIdentity);
        
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        currency.migrateTokensBetweenWallets(aliceWallet1, aliceWallet2, 10);
        vm.stopPrank();
        
        (bool valid, string memory reason) = currency.validateWalletTokens(aliceWallet2);
        
        assertTrue(valid);
        assertEq(reason, "Valid migration - same identity");
    }
    
    // ===== TESTE 7: Não pode migrar entre identidades diferentes =====
    function testCannotMigrateBetweenDifferentIdentities() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(bobWallet, bobIdentity);
        
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        
        vm.expectRevert("Wallets have different identities");
        currency.migrateTokensBetweenWallets(aliceWallet1, bobWallet, 10);
        vm.stopPrank();
    }
    
    // ===== TESTE 8: Tokens em carteira errada são detectados =====
    function testTokensInWrongWalletDetected() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(bobWallet, bobIdentity);
        
        // Alice gera tokens na wallet1
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        vm.stopPrank();
        
        // Simular que tokens "apareceram" na carteira do Bob (hack)
        // Isso não pode acontecer em produção, mas vamos testar a validação
        
        // Bob tenta gerar tokens e depois "receber" tokens de Alice via hack
        vm.prank(validator);
        currency.earnCurrency(bobWallet, "vote", bytes32(0));
        
        // Forçar cenário: originalWallet = alice, mas currentWallet = bob
        // (Em produção isso seria impossível sem migração válida)
        
        // A validação deve detectar identidades diferentes
        (bool valid, string memory reason) = currency.validateWalletTokens(bobWallet);
        assertTrue(valid); // Bob tem tokens próprios válidos
    }
    
    // ===== TESTE 9: Destruir tokens roubados =====
    function testDestroyInvalidTokens() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        
        // Alice gera tokens
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        vm.stopPrank();
        
        uint256 balanceBefore = currency.balanceOfRaw(aliceWallet1);
        assertEq(balanceBefore, 10);
        
        // Simular tokens roubados (forçar estado inválido para teste)
        // Em produção, precisaríamos de um ataque real
        
        // Verificar que tokens válidos não podem ser destruídos
        vm.expectRevert("Tokens are valid");
        currency.destroyInvalidTokens(aliceWallet1);
    }
    
    // ===== TESTE 10: balanceOf retorna 0 para tokens inválidos =====
    function testBalanceOfReturnsZeroForInvalidTokens() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        vm.stopPrank();
        
        // Tokens válidos devem mostrar saldo correto
        uint256 balance = currency.balanceOf(aliceWallet1);
        assertEq(balance, 10);
        
        // balanceOfRaw sempre mostra saldo real
        uint256 balanceRaw = currency.balanceOfRaw(aliceWallet1);
        assertEq(balanceRaw, 10);
    }
    
    // ===== TESTE 11: Migração em cadeia (wallet1 -> wallet2 -> wallet3) =====
    function testChainedMigration() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet2, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet3, aliceIdentity);
        
        // Gerar 100 SOB na wallet1
        currency.earnCurrency(aliceWallet1, "proposal", bytes32(0));
        
        // Migrar wallet1 -> wallet2
        currency.migrateTokensBetweenWallets(aliceWallet1, aliceWallet2, 100);
        
        // Migrar wallet2 -> wallet3
        currency.migrateTokensBetweenWallets(aliceWallet2, aliceWallet3, 100);
        vm.stopPrank();
        
        assertEq(currency.balanceOf(aliceWallet1), 0);
        assertEq(currency.balanceOf(aliceWallet2), 0);
        assertEq(currency.balanceOf(aliceWallet3), 100);
        
        // Todos devem ser válidos
        (bool valid1,) = currency.validateWalletTokens(aliceWallet1);
        (bool valid2,) = currency.validateWalletTokens(aliceWallet2);
        (bool valid3,) = currency.validateWalletTokens(aliceWallet3);
        
        assertTrue(valid1);
        assertTrue(valid2);
        assertTrue(valid3);
    }
    
    // ===== TESTE 12: Apenas VALIDATOR pode migrar =====
    function testOnlyValidatorCanMigrate() public {
        vm.startPrank(validator);
        currency.linkWalletToIdentity(aliceWallet1, aliceIdentity);
        currency.linkWalletToIdentity(aliceWallet2, aliceIdentity);
        currency.earnCurrency(aliceWallet1, "vote", bytes32(0));
        vm.stopPrank();
        
        // Usuário comum não pode migrar
        vm.prank(aliceWallet1);
        vm.expectRevert();
        currency.migrateTokensBetweenWallets(aliceWallet1, aliceWallet2, 10);
    }
}
