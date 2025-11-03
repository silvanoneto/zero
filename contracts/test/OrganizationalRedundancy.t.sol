// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../OrganizationalRedundancy.sol";
import "./mocks/MockSovereignCurrency.sol";

contract OrganizationalRedundancyTest is Test {
    OrganizationalRedundancy public redundancy;
    MockSovereignCurrency public sovereignCurrency;
    
    address public admin = address(1);
    address public manager = address(2);
    address public auditor = address(3);
    
    address public dao1 = address(0x100);
    address public dao2 = address(0x200);
    address public dao3 = address(0x300);
    address public dao4 = address(0x400);

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy MockSovereignCurrency
        sovereignCurrency = new MockSovereignCurrency();
        
        // Deploy OrganizationalRedundancy com endereço do SOB
        redundancy = new OrganizationalRedundancy(address(sovereignCurrency));
        
        // Concede VALIDATOR_ROLE ao contrato de redundância
        sovereignCurrency.grantRole(sovereignCurrency.VALIDATOR_ROLE(), address(redundancy));
        
        redundancy.grantRole(redundancy.DAO_MANAGER_ROLE(), manager);
        redundancy.grantRole(redundancy.AUDITOR_ROLE(), auditor);
        
        vm.stopPrank();
        
        // Mint SOB inicial para admin e manager poderem alocar budget
        sovereignCurrency.mint(admin, 1000 ether);
        sovereignCurrency.mint(manager, 1000 ether);
    }

    // ===== TESTE 1: Registro de DAOs =====
    function testRegisterDAO() public {
        vm.startPrank(manager);
        
        redundancy.registerDAO(
            dao1,
            "Health DAO Alpha",
            OrganizationalRedundancy.CriticalSector.HEALTH
        );
        
        (
            address daoAddress,
            string memory name,
            OrganizationalRedundancy.CriticalSector sector,
            bool isActive,
            ,,,
        ) = redundancy.getDAO(1);
        
        assertEq(daoAddress, dao1);
        assertEq(name, "Health DAO Alpha");
        assertTrue(isActive);
        assertEq(uint(sector), uint(OrganizationalRedundancy.CriticalSector.HEALTH));
        
        vm.stopPrank();
    }

    // ===== TESTE 2: Mínimo de 3 DAOs por setor =====
    function testMinimumThreeDAOsRequired() public {
        vm.startPrank(manager);
        
        // Registra apenas 2 DAOs
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.ENERGY);
        redundancy.registerDAO(dao2, "DAO 2", OrganizationalRedundancy.CriticalSector.ENERGY);
        
        vm.stopPrank();
        
        // Aloca orçamento em SOB
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.ENERGY, 1 ether);
        
        // Tenta distribuir fundos (deve falhar)
        vm.prank(manager);
        vm.expectRevert("Minimum 3 DAOs required");
        redundancy.distributeFunds(OrganizationalRedundancy.CriticalSector.ENERGY);
    }

    // ===== TESTE 3: Distribuição 50/50 =====
    function testFiftyFiftySplit() public {
        vm.startPrank(manager);
        
        // Registra 3 DAOs com métricas iguais
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.WATER);
        redundancy.registerDAO(dao2, "DAO 2", OrganizationalRedundancy.CriticalSector.WATER);
        redundancy.registerDAO(dao3, "DAO 3", OrganizationalRedundancy.CriticalSector.WATER);
        
        vm.stopPrank();
        
        // Atualiza métricas (todas iguais)
        vm.startPrank(auditor);
        redundancy.updateMetrics(1, 50, 80, 100, 5);
        redundancy.updateMetrics(2, 50, 80, 100, 5);
        redundancy.updateMetrics(3, 50, 80, 100, 5);
        vm.stopPrank();
        
        // Aloca 3 ether de orçamento em SOB
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.WATER, 3 ether);
        
        // Distribui fundos
        vm.prank(manager);
        redundancy.distributeFunds(OrganizationalRedundancy.CriticalSector.WATER);
        
        // Cada DAO deve receber ~1 ether em SOB (50% igualitário + 50% performance igual)
        assertEq(sovereignCurrency.balanceOf(dao1), 1 ether);
        assertEq(sovereignCurrency.balanceOf(dao2), 1 ether);
        assertEq(sovereignCurrency.balanceOf(dao3), 1 ether);
    }

    // ===== TESTE 4: Performance proporcional =====
    function testPerformanceProportionalDistribution() public {
        vm.startPrank(manager);
        
        // Registra 3 DAOs
        redundancy.registerDAO(dao1, "High Performer", OrganizationalRedundancy.CriticalSector.COMMUNICATION);
        redundancy.registerDAO(dao2, "Medium Performer", OrganizationalRedundancy.CriticalSector.COMMUNICATION);
        redundancy.registerDAO(dao3, "Low Performer", OrganizationalRedundancy.CriticalSector.COMMUNICATION);
        
        vm.stopPrank();
        
        // Atualiza métricas (diferentes performances)
        vm.startPrank(auditor);
        // DAO1: Alta performance
        redundancy.updateMetrics(1, 10, 95, 50, 10); // Score alto
        // DAO2: Média performance
        redundancy.updateMetrics(2, 50, 70, 100, 5); // Score médio
        // DAO3: Baixa performance
        redundancy.updateMetrics(3, 90, 40, 200, 0); // Score baixo
        vm.stopPrank();
        
        // Aloca 3 ether em SOB
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.COMMUNICATION, 3 ether);
        
        uint256 balanceBefore1 = sovereignCurrency.balanceOf(dao1);
        uint256 balanceBefore2 = sovereignCurrency.balanceOf(dao2);
        uint256 balanceBefore3 = sovereignCurrency.balanceOf(dao3);
        
        // Distribui fundos
        vm.prank(manager);
        redundancy.distributeFunds(OrganizationalRedundancy.CriticalSector.COMMUNICATION);
        
        uint256 received1 = sovereignCurrency.balanceOf(dao1) - balanceBefore1;
        uint256 received2 = sovereignCurrency.balanceOf(dao2) - balanceBefore2;
        uint256 received3 = sovereignCurrency.balanceOf(dao3) - balanceBefore3;
        
        // DAO1 (alta performance) deve receber mais que DAO2 (média)
        assertGt(received1, received2);
        // DAO2 (média) deve receber mais que DAO3 (baixa)
        assertGt(received2, received3);
        // Total distribuído = 3 ether em SOB
        assertEq(received1 + received2 + received3, 3 ether);
    }

    // ===== TESTE 5: Desativação por baixa performance =====
    function testLowPerformanceDeactivation() public {
        vm.startPrank(manager);
        
        // Registra 4 DAOs (para ter >3 após desativação)
        redundancy.registerDAO(dao1, "Good DAO", OrganizationalRedundancy.CriticalSector.CYBER_DEFENSE);
        redundancy.registerDAO(dao2, "Good DAO 2", OrganizationalRedundancy.CriticalSector.CYBER_DEFENSE);
        redundancy.registerDAO(dao3, "Good DAO 3", OrganizationalRedundancy.CriticalSector.CYBER_DEFENSE);
        redundancy.registerDAO(dao4, "Bad DAO", OrganizationalRedundancy.CriticalSector.CYBER_DEFENSE);
        
        vm.stopPrank();
        
        // Simula 6 meses de baixa performance para DAO4
        vm.startPrank(auditor);
        
        // DAOs boas com alta performance
        for (uint i = 0; i < 6; i++) {
            redundancy.updateMetrics(1, 20, 90, 80, 8);
            redundancy.updateMetrics(2, 25, 85, 90, 7);
            redundancy.updateMetrics(3, 30, 88, 85, 6);
            // DAO4 com performance muito baixa (<30% da média)
            redundancy.updateMetrics(4, 200, 20, 500, 0);
            
            // Avança 30 dias
            vm.warp(block.timestamp + 30 days);
        }
        
        vm.stopPrank();
        
        // Verifica que DAO4 tem 6 meses consecutivos de baixa performance
        (,,,,,, uint256 consecutiveMonths,) = redundancy.getDAO(4);
        assertGe(consecutiveMonths, 6);
        
        // Desativa DAO4
        vm.prank(manager);
        redundancy.deactivateLowPerformanceDAO(4);
        
        // Verifica que DAO4 está inativa
        (,,, bool isActive,,,,) = redundancy.getDAO(4);
        assertFalse(isActive);
        
        // Verifica que ainda há 3 DAOs ativas
        uint256 activeCount = redundancy.getActiveDaoCount(OrganizationalRedundancy.CriticalSector.CYBER_DEFENSE);
        assertEq(activeCount, 3);
    }

    // ===== TESTE 6: Atualização de métricas reseta contador se performance melhora =====
    function testPerformanceImprovementResetsCounter() public {
        vm.startPrank(manager);
        
        redundancy.registerDAO(dao1, "DAO Alpha", OrganizationalRedundancy.CriticalSector.HEALTH);
        redundancy.registerDAO(dao2, "DAO Beta", OrganizationalRedundancy.CriticalSector.HEALTH);
        redundancy.registerDAO(dao3, "DAO Gamma", OrganizationalRedundancy.CriticalSector.HEALTH);
        
        vm.stopPrank();
        
        vm.startPrank(auditor);
        
        // DAOs 1 e 2 com boa performance
        redundancy.updateMetrics(1, 30, 85, 90, 7);
        redundancy.updateMetrics(2, 35, 80, 95, 6);
        
        // DAO3 com baixa performance por 3 meses
        for (uint i = 0; i < 3; i++) {
            redundancy.updateMetrics(3, 200, 20, 500, 0);
            vm.warp(block.timestamp + 30 days);
        }
        
        // Verifica contador
        (,,,,,, uint256 consecutiveMonths,) = redundancy.getDAO(3);
        assertEq(consecutiveMonths, 3);
        
        // DAO3 melhora performance
        redundancy.updateMetrics(3, 40, 75, 100, 5);
        
        // Contador deve resetar
        (,,,,,, consecutiveMonths,) = redundancy.getDAO(3);
        assertEq(consecutiveMonths, 0);
        
        vm.stopPrank();
    }

    // ===== TESTE 7: Apenas DAO_MANAGER pode registrar DAOs =====
    function testOnlyManagerCanRegisterDAO() public {
        vm.prank(address(999)); // Não é manager
        vm.expectRevert();
        redundancy.registerDAO(dao1, "Unauthorized DAO", OrganizationalRedundancy.CriticalSector.HEALTH);
    }

    // ===== TESTE 8: Apenas AUDITOR pode atualizar métricas =====
    function testOnlyAuditorCanUpdateMetrics() public {
        vm.prank(manager);
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.HEALTH);
        
        vm.prank(address(999)); // Não é auditor
        vm.expectRevert();
        redundancy.updateMetrics(1, 50, 80, 100, 5);
    }

    // ===== TESTE 9: Não pode registrar DAO duplicada =====
    function testCannotRegisterDuplicateDAO() public {
        vm.startPrank(manager);
        
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.HEALTH);
        
        vm.expectRevert("DAO already registered");
        redundancy.registerDAO(dao1, "DAO 1 Again", OrganizationalRedundancy.CriticalSector.HEALTH);
        
        vm.stopPrank();
    }

    // ===== TESTE 10: Orçamento é resetado após distribuição =====
    function testBudgetResetAfterDistribution() public {
        vm.startPrank(manager);
        
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.ENERGY);
        redundancy.registerDAO(dao2, "DAO 2", OrganizationalRedundancy.CriticalSector.ENERGY);
        redundancy.registerDAO(dao3, "DAO 3", OrganizationalRedundancy.CriticalSector.ENERGY);
        
        vm.stopPrank();
        
        // Aloca 1 ether em SOB
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.ENERGY, 1 ether);
        
        uint256 budgetBefore = redundancy.sectorBudget(OrganizationalRedundancy.CriticalSector.ENERGY);
        assertEq(budgetBefore, 1 ether);
        
        // Distribui
        vm.prank(manager);
        redundancy.distributeFunds(OrganizationalRedundancy.CriticalSector.ENERGY);
        
        // Orçamento deve estar zerado
        uint256 budgetAfter = redundancy.sectorBudget(OrganizationalRedundancy.CriticalSector.ENERGY);
        assertEq(budgetAfter, 0);
    }

    // ===== TESTE 11: Reativação de DAO =====
    function testReactivateDAO() public {
        vm.startPrank(manager);
        
        redundancy.registerDAO(dao1, "DAO 1", OrganizationalRedundancy.CriticalSector.HEALTH);
        redundancy.registerDAO(dao2, "DAO 2", OrganizationalRedundancy.CriticalSector.HEALTH);
        redundancy.registerDAO(dao3, "DAO 3", OrganizationalRedundancy.CriticalSector.HEALTH);
        redundancy.registerDAO(dao4, "DAO 4", OrganizationalRedundancy.CriticalSector.HEALTH);
        
        vm.stopPrank();
        
        // Simula baixa performance e desativa
        vm.startPrank(auditor);
        for (uint i = 0; i < 6; i++) {
            redundancy.updateMetrics(1, 20, 90, 80, 8);
            redundancy.updateMetrics(2, 25, 85, 90, 7);
            redundancy.updateMetrics(3, 30, 88, 85, 6);
            redundancy.updateMetrics(4, 200, 20, 500, 0);
            vm.warp(block.timestamp + 30 days);
        }
        vm.stopPrank();
        
        vm.prank(manager);
        redundancy.deactivateLowPerformanceDAO(4);
        
        // Verifica que está inativa
        (,,, bool isActiveBefore,,,,) = redundancy.getDAO(4);
        assertFalse(isActiveBefore);
        
        // Admin reativa
        vm.prank(admin);
        redundancy.reactivateDAO(4);
        
        // Verifica que está ativa
        (,,, bool isActiveAfter,,,,) = redundancy.getDAO(4);
        assertTrue(isActiveAfter);
        
        // Contador deve ter sido resetado
        (,,,,,, uint256 consecutiveMonths,) = redundancy.getDAO(4);
        assertEq(consecutiveMonths, 0);
    }

    // ===== TESTE 12: Funding acumula entre alocações =====
    function testFundingAccumulation() public {
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.WATER, 1 ether);
        
        vm.prank(admin);
        redundancy.allocateBudget(OrganizationalRedundancy.CriticalSector.WATER, 2 ether);
        
        uint256 totalBudget = redundancy.sectorBudget(OrganizationalRedundancy.CriticalSector.WATER);
        assertEq(totalBudget, 3 ether);
    }
}
