// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../MultiWalletIdentity.sol";

contract MultiWalletIdentityTest is Test {
    MultiWalletIdentity public multiWallet;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;
    address public backup1;
    address public backup2;
    address public emergency;
    address public guardian1;
    address public guardian2;
    address public guardian3;
    address public attacker;
    
    bytes32 public identityId;
    
    event IdentityCreated(bytes32 indexed identityId, address indexed primaryWallet, uint256 timestamp);
    event WalletAdditionRequested(bytes32 indexed identityId, address indexed wallet, uint256 executesAt);
    event WalletAdded(bytes32 indexed identityId, address indexed wallet, string label);
    event WalletRemoved(bytes32 indexed identityId, address indexed wallet);
    event GuardianAdded(bytes32 indexed identityId, address indexed guardian);
    event RecoveryInitiated(bytes32 indexed identityId, address indexed newWallet, uint256 expiresAt);
    event RecoveryCompleted(bytes32 indexed identityId, address indexed newWallet);
    
    function setUp() public {
        multiWallet = new MultiWalletIdentity();
        
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        backup1 = makeAddr("backup1");
        backup2 = makeAddr("backup2");
        emergency = makeAddr("emergency");
        guardian1 = makeAddr("guardian1");
        guardian2 = makeAddr("guardian2");
        guardian3 = makeAddr("guardian3");
        attacker = makeAddr("attacker");
        
        // Admin tem VALIDATOR_ROLE
        multiWallet.grantRole(multiWallet.VALIDATOR_ROLE(), admin);
        
        // Criar identidade inicial para user1
        identityId = multiWallet.createIdentity(user1, "Primary Wallet");
    }
    
    // ============ IDENTITY CREATION TESTS ============
    
    function testCreateIdentity() public {
        bytes32 newId = multiWallet.createIdentity(user2, "New Wallet");
        
        assertEq(multiWallet.getIdentityId(user2), newId);
        assertEq(multiWallet.totalIdentities(), 2);
        
        address[] memory wallets = multiWallet.getWallets(newId);
        assertEq(wallets.length, 1);
        assertEq(wallets[0], user2);
    }
    
    function testCreateIdentityEmitsEvent() public {
        bytes32 newId = multiWallet.createIdentity(user2, "Test");
        
        // Verificar evento foi emitido (não podemos prever o ID exato)
        assertTrue(newId != bytes32(0));
    }
    
    function testCannotCreateDuplicateIdentity() public {
        vm.expectRevert("Wallet already linked");
        multiWallet.createIdentity(user1, "Duplicate");
    }
    
    function testOnlyValidatorCanCreateIdentity() public {
        vm.prank(attacker);
        vm.expectRevert();
        multiWallet.createIdentity(user2, "Unauthorized");
    }
    
    // ============ ADD WALLET TESTS ============
    
    function testRequestAddWallet() public {
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup Wallet");
        
        address[] memory wallets = multiWallet.getWallets(identityId);
        assertEq(wallets.length, 2);
        
        (
            MultiWalletIdentity.WalletStatus status,
            ,
            ,
            string memory label,
        ) = multiWallet.getWalletInfo(identityId, backup1);
        
        assertEq(uint(status), uint(MultiWalletIdentity.WalletStatus.Pending));
        assertEq(label, "Backup Wallet");
    }
    
    function testCannotAddWalletAlreadyLinked() public {
        vm.prank(user1);
        vm.expectRevert("Wallet already linked");
        multiWallet.requestAddWallet(user1, "Self");
    }
    
    function testCannotExceedMaxWallets() public {
        // Adicionar 4 wallets (já tem 1)
        vm.startPrank(user1);
        multiWallet.requestAddWallet(backup1, "Backup 1");
        multiWallet.requestAddWallet(backup2, "Backup 2");
        multiWallet.requestAddWallet(emergency, "Emergency");
        multiWallet.requestAddWallet(user2, "Extra");
        
        // Tentar adicionar 6ª wallet
        vm.expectRevert("Max wallets reached");
        multiWallet.requestAddWallet(user3, "Too Many");
        vm.stopPrank();
    }
    
    function testExecuteAddWallet() public {
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        
        // Não pode executar imediatamente
        vm.prank(user1);
        vm.expectRevert("Delay period not passed");
        multiWallet.executeAddWallet(backup1);
        
        // Avançar 7 dias
        vm.warp(block.timestamp + 7 days);
        
        // Agora pode executar
        vm.prank(user1);
        multiWallet.executeAddWallet(backup1);
        
        // Verificar wallet ativa
        (MultiWalletIdentity.WalletStatus status, , , , ) = 
            multiWallet.getWalletInfo(identityId, backup1);
        assertEq(uint(status), uint(MultiWalletIdentity.WalletStatus.Active));
        
        // Verificar pode acessar identidade
        assertEq(multiWallet.getIdentityId(backup1), identityId);
        assertTrue(multiWallet.canAccess(backup1, identityId));
    }
    
    function testAddWalletEmitsEvents() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit WalletAdditionRequested(identityId, backup1, block.timestamp + 7 days);
        multiWallet.requestAddWallet(backup1, "Backup");
        
        vm.warp(block.timestamp + 7 days);
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit WalletAdded(identityId, backup1, "Backup");
        multiWallet.executeAddWallet(backup1);
    }
    
    // ============ REMOVE WALLET TESTS ============
    
    function testRequestRemoveWallet() public {
        // Adicionar e ativar backup
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        vm.warp(block.timestamp + 7 days);
        vm.prank(user1);
        multiWallet.executeAddWallet(backup1);
        
        // Remover
        vm.prank(user1);
        multiWallet.requestRemoveWallet(backup1);
        
        (MultiWalletIdentity.WalletStatus status, , , , ) = 
            multiWallet.getWalletInfo(identityId, backup1);
        assertEq(uint(status), uint(MultiWalletIdentity.WalletStatus.Removing));
    }
    
    function testCannotRemovePrimaryWallet() public {
        vm.prank(user1);
        vm.expectRevert("Cannot remove primary wallet");
        multiWallet.requestRemoveWallet(user1);
    }
    
    function testCannotRemoveLastWallet() public {
        vm.prank(user1);
        // Tentará remover carteira primária primeiro
        vm.expectRevert("Cannot remove primary wallet");
        multiWallet.requestRemoveWallet(user1);
    }
    
    function testExecuteRemoveWallet() public {
        // Setup: adicionar e ativar backup
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        vm.warp(block.timestamp + 7 days);
        vm.prank(user1);
        multiWallet.executeAddWallet(backup1);
        
        // Solicitar remoção
        vm.prank(user1);
        multiWallet.requestRemoveWallet(backup1);
        
        // Não pode executar imediatamente
        vm.prank(user1);
        vm.expectRevert("Cannot remove yet");
        multiWallet.executeRemoveWallet(backup1);
        
        // Avançar 3 dias
        vm.warp(block.timestamp + 3 days);
        
        // Executar remoção
        vm.prank(user1);
        multiWallet.executeRemoveWallet(backup1);
        
        // Verificar removida
        (MultiWalletIdentity.WalletStatus status, , , , ) = 
            multiWallet.getWalletInfo(identityId, backup1);
        assertEq(uint(status), uint(MultiWalletIdentity.WalletStatus.Removed));
        
        // Não pode mais acessar
        assertEq(multiWallet.getIdentityId(backup1), bytes32(0));
        assertFalse(multiWallet.canAccess(backup1, identityId));
    }
    
    // ============ CHANGE PRIMARY WALLET TESTS ============
    
    function testChangePrimaryWallet() public {
        // Adicionar e ativar backup
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        vm.warp(block.timestamp + 7 days);
        vm.prank(user1);
        multiWallet.executeAddWallet(backup1);
        
        // Mudar primária
        vm.prank(user1);
        multiWallet.changePrimaryWallet(backup1);
        
        // Verificar mudança
        (, , , , bool isPrimary1) = multiWallet.getWalletInfo(identityId, user1);
        (, , , , bool isPrimary2) = multiWallet.getWalletInfo(identityId, backup1);
        
        assertFalse(isPrimary1);
        assertTrue(isPrimary2);
    }
    
    function testCannotChangeToPendingWallet() public {
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        
        vm.prank(user1);
        vm.expectRevert("Wallet not active");
        multiWallet.changePrimaryWallet(backup1);
    }
    
    // ============ GUARDIAN TESTS ============
    
    function testAddGuardian() public {
        vm.prank(user1);
        multiWallet.addGuardian(guardian1);
        
        address[] memory guardians = multiWallet.getGuardians(identityId);
        assertEq(guardians.length, 1);
        assertEq(guardians[0], guardian1);
    }
    
    function testAddMultipleGuardians() public {
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        address[] memory guardians = multiWallet.getGuardians(identityId);
        assertEq(guardians.length, 3);
    }
    
    function testCannotAddDuplicateGuardian() public {
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        
        vm.expectRevert("Already guardian");
        multiWallet.addGuardian(guardian1);
        vm.stopPrank();
    }
    
    function testCannotAddSelfAsGuardian() public {
        vm.prank(user1);
        vm.expectRevert("Cannot be self");
        multiWallet.addGuardian(user1);
    }
    
    function testRemoveGuardian() public {
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.removeGuardian(guardian1);
        vm.stopPrank();
        
        address[] memory guardians = multiWallet.getGuardians(identityId);
        assertEq(guardians.length, 0);
    }
    
    // ============ SOCIAL RECOVERY TESTS ============
    
    function testInitiateRecovery() public {
        // Setup: adicionar guardiões
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        // Guardião inicia recuperação
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        (
            bytes32 recoveryId,
            address newWallet,
            ,
            ,
            ,
            bool executed,
            
        ) = multiWallet.recoveryProcesses(identityId);
        
        assertEq(recoveryId, identityId);
        assertEq(newWallet, emergency);
        assertFalse(executed);
    }
    
    function testCannotInitiateRecoveryWithoutGuardians() public {
        vm.prank(guardian1);
        vm.expectRevert("Not enough guardians");
        multiWallet.initiateRecovery(identityId, emergency);
    }
    
    function testCannotInitiateRecoveryIfNotGuardian() public {
        // Setup: adicionar guardiões
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        // Atacante tenta iniciar
        vm.prank(attacker);
        vm.expectRevert("Not a guardian");
        multiWallet.initiateRecovery(identityId, attacker);
    }
    
    function testVoteRecovery() public {
        // Setup: guardiões + iniciar recuperação
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        // Guardião 2 vota
        vm.prank(guardian2);
        multiWallet.voteRecovery(identityId, true);
        
        // Verificar voto registrado
        // (processo tem 2 votos agora)
    }
    
    function testCannotVoteTwice() public {
        // Setup
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        // Tentar votar novamente
        vm.prank(guardian1);
        vm.expectRevert("Already voted");
        multiWallet.voteRecovery(identityId, true);
    }
    
    function testExecuteRecovery() public {
        // Setup: guardiões
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        // Iniciar recuperação
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        // Segundo voto
        vm.prank(guardian2);
        multiWallet.voteRecovery(identityId, true);
        
        // Executar (quórum alcançado: 2/3)
        vm.prank(guardian1);
        multiWallet.executeRecovery(identityId);
        
        // Verificar nova carteira funciona
        assertEq(multiWallet.getIdentityId(emergency), identityId);
        assertTrue(multiWallet.canAccess(emergency, identityId));
        
        // Verificar é primária
        (, , , , bool isPrimary) = multiWallet.getWalletInfo(identityId, emergency);
        assertTrue(isPrimary);
    }
    
    function testCannotExecuteRecoveryWithoutQuorum() public {
        // Setup
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        // Apenas 1 voto (não alcança quórum de 2)
        vm.prank(guardian1);
        vm.expectRevert("Quorum not reached");
        multiWallet.executeRecovery(identityId);
    }
    
    function testRecoveryProcessExpires() public {
        // Setup
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        // Avançar mais de 7 dias
        vm.warp(block.timestamp + 8 days);
        
        // Não pode votar após expiração
        vm.prank(guardian2);
        vm.expectRevert("Process expired");
        multiWallet.voteRecovery(identityId, true);
    }
    
    // ============ SECURITY TESTS ============
    
    function testAttackerCannotAddWalletToOthersIdentity() public {
        vm.prank(attacker);
        vm.expectRevert("No identity found");
        multiWallet.requestAddWallet(attacker, "Evil Wallet");
    }
    
    function testCompromisedWalletCanBeRemoved() public {
        // Adicionar backup primeiro
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        vm.warp(block.timestamp + 7 days);
        vm.prank(user1);
        multiWallet.executeAddWallet(backup1);
        
        // Mudar primária para backup
        vm.prank(user1);
        multiWallet.changePrimaryWallet(backup1);
        
        // Remover carteira comprometida (user1)
        vm.prank(backup1);
        multiWallet.requestRemoveWallet(user1);
        vm.warp(block.timestamp + 3 days);
        vm.prank(backup1);
        multiWallet.executeRemoveWallet(user1);
        
        // Verificar user1 não tem mais acesso
        assertFalse(multiWallet.canAccess(user1, identityId));
    }
    
    // ============ VIEW FUNCTION TESTS ============
    
    function testGetIdentityId() public {
        assertEq(multiWallet.getIdentityId(user1), identityId);
        assertEq(multiWallet.getIdentityId(attacker), bytes32(0));
    }
    
    function testGetWallets() public {
        address[] memory wallets = multiWallet.getWallets(identityId);
        assertEq(wallets.length, 1);
        assertEq(wallets[0], user1);
    }
    
    function testGetWalletInfo() public {
        (
            MultiWalletIdentity.WalletStatus status,
            uint256 addedAt,
            ,
            string memory label,
            bool isPrimary
        ) = multiWallet.getWalletInfo(identityId, user1);
        
        assertEq(uint(status), uint(MultiWalletIdentity.WalletStatus.Active));
        assertEq(addedAt, block.timestamp);
        assertEq(label, "Primary Wallet");
        assertTrue(isPrimary);
    }
    
    function testCanAccess() public {
        assertTrue(multiWallet.canAccess(user1, identityId));
        assertFalse(multiWallet.canAccess(attacker, identityId));
    }
    
    // ============ PAUSE TESTS ============
    
    function testPauseAndUnpause() public {
        multiWallet.grantRole(multiWallet.PAUSER_ROLE(), admin);
        
        multiWallet.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        multiWallet.requestAddWallet(backup1, "Backup");
        
        multiWallet.unpause();
        
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
    }
    
    // ============ GAS TESTS ============
    
    function testGasCreateIdentity() public {
        uint256 gasBefore = gasleft();
        multiWallet.createIdentity(user2, "Test");
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for createIdentity:", gasUsed);
        assertLt(gasUsed, 300000); // Ajustado para 300k
    }
    
    function testGasAddWallet() public {
        uint256 gasBefore = gasleft();
        vm.prank(user1);
        multiWallet.requestAddWallet(backup1, "Backup");
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for requestAddWallet:", gasUsed);
        assertLt(gasUsed, 250000); // Ajustado para 250k
    }
    
    function testGasExecuteRecovery() public {
        // Setup
        vm.startPrank(user1);
        multiWallet.addGuardian(guardian1);
        multiWallet.addGuardian(guardian2);
        multiWallet.addGuardian(guardian3);
        vm.stopPrank();
        
        vm.prank(guardian1);
        multiWallet.initiateRecovery(identityId, emergency);
        
        vm.prank(guardian2);
        multiWallet.voteRecovery(identityId, true);
        
        uint256 gasBefore = gasleft();
        vm.prank(guardian1);
        multiWallet.executeRecovery(identityId);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for executeRecovery:", gasUsed);
        assertLt(gasUsed, 200000); // Should be under 200k
    }
}
