// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../FraudDetection.sol";

contract FraudDetectionTest is Test {
    FraudDetection public fraudDetection;
    
    address public admin;
    address public monitor;
    address public validator;
    address public user1;
    address public user2;
    address public attacker;
    
    bytes32 public device1;
    bytes32 public device2;
    bytes32 public unknownDevice;
    
    function setUp() public {
        fraudDetection = new FraudDetection();
        
        admin = address(this);
        monitor = makeAddr("monitor");
        validator = makeAddr("validator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        attacker = makeAddr("attacker");
        
        device1 = keccak256("device1");
        device2 = keccak256("device2");
        unknownDevice = keccak256("unknown");
        
        // Grant roles
        fraudDetection.grantRole(fraudDetection.MONITOR_ROLE(), monitor);
        fraudDetection.grantRole(fraudDetection.VALIDATOR_ROLE(), validator);
    }
    
    // ============ BASIC TESTS ============
    
    function testRecordNormalAction() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,  // São Paulo
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.prank(monitor);
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            loc,
            0,
            true
        );
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Active));
        assertEq(riskScore, 0);
    }
    
    // ============ VELOCITY ANOMALY TESTS ============
    
    function testDetectVelocityAnomaly() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.startPrank(monitor);
        
        // Simular 25 ações em 1 hora (> 20 limite)
        for (uint i = 0; i < 25; i++) {
            fraudDetection.recordAction(
                user1,
                FraudDetection.ActionType.Transaction,
                device1,
                loc,
                100,
                true
            );
            vm.warp(block.timestamp + 2 minutes);
        }
        
        vm.stopPrank();
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            uint256 totalIncidents,
        ) = fraudDetection.getWalletSecurity(user1);
        
        // Deve ter detectado anomalia de velocidade (score 30)
        assertGt(riskScore, 0);
        assertGt(totalIncidents, 0);
        
        console.log("Risk Score after velocity anomaly:", riskScore);
        console.log("Total Incidents:", totalIncidents);
    }
    
    function testQuarantineAtThreshold() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.startPrank(monitor);
        
        // Gerar score suficiente para quarentena (>= 40)
        // Velocidade anomaly (30) + unknown device (25) + biometric failure (35) = 90
        
        // 1. Velocidade
        for (uint i = 0; i < 25; i++) {
            fraudDetection.recordAction(
                user1,
                FraudDetection.ActionType.Transaction,
                device1,
                loc,
                100,
                true
            );
            vm.warp(block.timestamp + 2 minutes);
        }
        
        // 2. Dispositivo desconhecido
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            unknownDevice,
            loc,
            0,
            true
        );
        
        // 3. Falha biométrica
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Transaction,
            device1,
            loc,
            100,
            false  // biometric failed
        );
        
        vm.stopPrank();
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        console.log("Final Risk Score:", riskScore);
        console.log("Status:", uint(status));
        
        // Deve estar em quarentena ou bloqueada
        assertTrue(
            status == FraudDetection.WalletStatus.Quarantine ||
            status == FraudDetection.WalletStatus.Blocked
        );
    }
    
    function testBlockAtHighThreshold() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.startPrank(monitor);
        
        // Gerar score >= 70 para bloqueio
        // Drain attempt (60) + velocity (30) = 90
        
        for (uint i = 0; i < 25; i++) {
            fraudDetection.recordAction(
                user1,
                FraudDetection.ActionType.RemoveWallet,  // Drain attempt
                device1,
                loc,
                1000,
                false
            );
            vm.warp(block.timestamp + 2 minutes);
        }
        
        vm.stopPrank();
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        console.log("Risk Score:", riskScore);
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Blocked));
        assertGe(riskScore, 70);
    }
    
    // ============ GEOLOCATION TESTS ============
    
    function testDetectImpossibleTravel() public {
        vm.startPrank(monitor);
        
        // Primeira ação: São Paulo
        FraudDetection.GeoLocation memory loc1 = FraudDetection.GeoLocation({
            latitude: -23550520,  // São Paulo
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            loc1,
            0,
            true
        );
        
        // 10 minutos depois: Nova York (impossível!)
        vm.warp(block.timestamp + 10 minutes);
        
        FraudDetection.GeoLocation memory loc2 = FraudDetection.GeoLocation({
            latitude: 40712776,   // Nova York
            longitude: -74005974,
            timestamp: block.timestamp
        });
        
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            loc2,
            0,
            true
        );
        
        vm.stopPrank();
        
        (
            ,
            uint256 riskScore,
            uint256 totalIncidents,
        ) = fraudDetection.getWalletSecurity(user1);
        
        console.log("Risk Score after impossible travel:", riskScore);
        assertGt(riskScore, 0);
        assertGt(totalIncidents, 0);
    }
    
    // ============ SOCIAL REPORT TESTS ============
    
    function testSocialReport() public {
        vm.prank(user2);
        fraudDetection.reportSuspiciousActivity(
            user1,
            "Suspicious behavior observed"
        );
        
        (
            ,
            uint256 riskScore,
            uint256 totalIncidents,
        ) = fraudDetection.getWalletSecurity(user1);
        
        assertEq(riskScore, 20);  // Social report score
        assertEq(totalIncidents, 1);
    }
    
    function testMultipleSocialReports() public {
        vm.prank(user2);
        fraudDetection.reportSuspiciousActivity(user1, "Report 1");
        
        vm.prank(attacker);
        fraudDetection.reportSuspiciousActivity(user1, "Report 2");
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        assertEq(riskScore, 40);  // 2x20
        // Status pode ser Monitoring ou Quarantine dependendo do threshold
        assertTrue(
            uint(status) >= uint(FraudDetection.WalletStatus.Monitoring)
        );
    }
    
    // ============ EMERGENCY BLOCK TESTS ============
    
    function testEmergencyBlock() public {
        vm.prank(validator);
        fraudDetection.emergencyBlock(user1, "Confirmed fraud");
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Blocked));
        assertEq(riskScore, 100);
        assertTrue(fraudDetection.isBlocked(user1));
    }
    
    function testCannotActAfterBlock() public {
        vm.prank(validator);
        fraudDetection.emergencyBlock(user1, "Fraud");
        
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.prank(monitor);
        vm.expectRevert("Wallet is blocked");
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            loc,
            0,
            true
        );
    }
    
    // ============ TOKEN DESTRUCTION TESTS ============
    
    function testDestroyTokens() public {
        // Primeiro bloquear
        vm.prank(validator);
        fraudDetection.emergencyBlock(user1, "Fraud");
        
        // Depois destruir tokens
        vm.prank(validator);
        fraudDetection.destroyTokens(user1);
        
        (
            FraudDetection.WalletStatus status,
            ,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Destroyed));
    }
    
    function testCannotDestroyUnblockedWallet() public {
        vm.prank(validator);
        vm.expectRevert("Wallet must be blocked first");
        fraudDetection.destroyTokens(user1);
    }
    
    // ============ INCIDENT RESOLUTION TESTS ============
    
    function testResolveIncident() public {
        // Criar incidente
        vm.prank(user2);
        fraudDetection.reportSuspiciousActivity(user1, "False alarm");
        
        FraudDetection.FraudIncident[] memory incidents = fraudDetection.getIncidents(user1);
        assertEq(incidents.length, 1);
        
        // Resolver
        vm.prank(validator);
        fraudDetection.resolveIncident(user1, 0);
        
        (
            ,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        // Score deve ter diminuído (20 -> 10)
        assertEq(riskScore, 10);
    }
    
    // ============ QUARANTINE RELEASE TESTS ============
    
    function testReleaseFromQuarantine() public {
        // Colocar em quarentena
        vm.prank(user2);
        fraudDetection.reportSuspiciousActivity(user1, "Report 1");
        
        vm.prank(attacker);
        fraudDetection.reportSuspiciousActivity(user1, "Report 2");
        
        (FraudDetection.WalletStatus status, , ,) = fraudDetection.getWalletSecurity(user1);
        
        // Deve estar em quarentena ou monitoring
        assertTrue(uint(status) >= uint(FraudDetection.WalletStatus.Monitoring));
        
        // Se não está em quarentena, forçar
        if (status != FraudDetection.WalletStatus.Quarantine) {
            vm.prank(validator);
            fraudDetection.reportSuspiciousActivity(user1, "Force quarantine");
        }
        
        // Não pode liberar antes de 24h
        vm.expectRevert("Quarantine period not over");
        fraudDetection.releaseFromQuarantine(user1);
        
        // Avançar 24 horas
        vm.warp(block.timestamp + 24 hours);
        
        // Agora pode liberar
        fraudDetection.releaseFromQuarantine(user1);
        
        (status, , ,) = fraudDetection.getWalletSecurity(user1);
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Active));
    }
    
    // ============ ADMIN TESTS ============
    
    function testAddTrustedWallet() public {
        vm.prank(validator);
        fraudDetection.addTrustedWallet(user1);
        
        assertTrue(fraudDetection.trustedWallets(user1));
    }
    
    function testAddToBlacklist() public {
        vm.prank(validator);
        fraudDetection.addToBlacklist(attacker);
        
        assertTrue(fraudDetection.blacklistedWallets(attacker));
        assertTrue(fraudDetection.isBlocked(attacker));
    }
    
    // ============ VIEW FUNCTION TESTS ============
    
    function testGetRecentActions() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.startPrank(monitor);
        
        for (uint i = 0; i < 5; i++) {
            fraudDetection.recordAction(
                user1,
                FraudDetection.ActionType.Login,
                device1,
                loc,
                0,
                true
            );
        }
        
        vm.stopPrank();
        
        FraudDetection.Action[] memory actions = fraudDetection.getRecentActions(user1);
        assertEq(actions.length, 5);
    }
    
    function testGetIncidents() public {
        vm.prank(user2);
        fraudDetection.reportSuspiciousActivity(user1, "Incident 1");
        
        vm.prank(attacker);
        fraudDetection.reportSuspiciousActivity(user1, "Incident 2");
        
        FraudDetection.FraudIncident[] memory incidents = fraudDetection.getIncidents(user1);
        assertEq(incidents.length, 2);
    }
    
    // ============ INTEGRATION SCENARIO TESTS ============
    
    function testCompleteAttackScenario() public {
        console.log("\n=== SIMULATING ATTACK SCENARIO ===");
        
        // 1. Carteira roubada, atacante faz login de local distante
        FraudDetection.GeoLocation memory normalLoc = FraudDetection.GeoLocation({
            latitude: -23550520,  // São Paulo (usuário normal)
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        vm.prank(monitor);
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            normalLoc,
            0,
            true
        );
        
        console.log("Step 1: Normal login from Sao Paulo");
        
        // 2. 10 minutos depois, login da Rússia (impossível!)
        vm.warp(block.timestamp + 10 minutes);
        
        FraudDetection.GeoLocation memory attackLoc = FraudDetection.GeoLocation({
            latitude: 55755826,   // Moscou
            longitude: 37617300,
            timestamp: block.timestamp
        });
        
        vm.prank(monitor);
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            unknownDevice,  // Dispositivo desconhecido
            attackLoc,
            0,
            false  // Falha biométrica
        );
        
        console.log("Step 2: Suspicious login from Moscow");
        
        (
            FraudDetection.WalletStatus status,
            uint256 riskScore,
            ,
        ) = fraudDetection.getWalletSecurity(user1);
        
        console.log("Risk Score after suspicious login:", riskScore);
        console.log("Status:", uint(status));
        
        // 3. Atacante tenta múltiplas transações rápidas
        vm.startPrank(monitor);
        for (uint i = 0; i < 25; i++) {
            fraudDetection.recordAction(
                user1,
                FraudDetection.ActionType.RemoveWallet,  // Tentando drenar
                unknownDevice,
                attackLoc,
                1000,
                false
            );
            vm.warp(block.timestamp + 1 minutes);
        }
        vm.stopPrank();
        
        console.log("Step 3: Multiple drain attempts");
        
        (status, riskScore, ,) = fraudDetection.getWalletSecurity(user1);
        
        console.log("Final Risk Score:", riskScore);
        console.log("Final Status:", uint(status));
        
        // Deve estar bloqueada
        assertEq(uint(status), uint(FraudDetection.WalletStatus.Blocked));
        assertGe(riskScore, 70);
        
        console.log("=== ATTACK BLOCKED SUCCESSFULLY ===\n");
    }
    
    // ============ GAS TESTS ============
    
    function testGasRecordAction() public {
        FraudDetection.GeoLocation memory loc = FraudDetection.GeoLocation({
            latitude: -23550520,
            longitude: -46633308,
            timestamp: block.timestamp
        });
        
        uint256 gasBefore = gasleft();
        vm.prank(monitor);
        fraudDetection.recordAction(
            user1,
            FraudDetection.ActionType.Login,
            device1,
            loc,
            0,
            true
        );
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for recordAction:", gasUsed);
        assertLt(gasUsed, 500000);  // Should be under 500k
    }
}
