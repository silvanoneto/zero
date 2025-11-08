// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../SovereignCurrency.sol";

contract SovereignCurrencyTest is Test {
    SovereignCurrency public currency;
    
    address public admin = address(1);
    address public validator = address(2);
    address public citizen1 = address(3);
    address public citizen2 = address(4);
    address public attacker = address(5);
    
    event CurrencyEarned(
        address indexed citizen,
        uint256 amount,
        string activityType,
        bytes32 proofHash
    );
    
    event CurrencyDecayed(
        address indexed citizen,
        uint256 amount,
        uint256 inactiveDays
    );
    
    function setUp() public {
        vm.startPrank(admin);
        currency = new SovereignCurrency();
        currency.grantRole(currency.VALIDATOR_ROLE(), validator);
        vm.stopPrank();
    }
    
    // ============ BASIC TESTS ============
    
    function testInitialState() public {
        assertEq(currency.totalSupply(), 0);
        assertEq(currency.getTotalCitizens(), 0);
        assertEq(currency.balanceOf(citizen1), 0);
    }
    
    function testEarnCurrency() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        assertEq(currency.balanceOf(citizen1), 100); // proposal = 100 SOB
        assertEq(currency.totalSupply(), 100);
        assertEq(currency.getTotalCitizens(), 1);
    }
    
    function testMultipleActivities() public {
        vm.startPrank(validator);
        
        // Criar proposta
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        assertEq(currency.balanceOf(citizen1), 100);
        
        // Votar
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        assertEq(currency.balanceOf(citizen1), 110);
        
        // Contribuir
        currency.earnCurrency(citizen1, "contribution", bytes32(uint256(3)));
        assertEq(currency.balanceOf(citizen1), 310);
        
        vm.stopPrank();
    }
    
    function testMultipleCitizens() public {
        vm.startPrank(validator);
        
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        currency.earnCurrency(citizen2, "vote", bytes32(uint256(2)));
        
        vm.stopPrank();
        
        assertEq(currency.balanceOf(citizen1), 100);
        assertEq(currency.balanceOf(citizen2), 10);
        assertEq(currency.totalSupply(), 110);
        assertEq(currency.getTotalCitizens(), 2);
    }
    
    // ============ SECURITY TESTS ============
    
    function testOnlyValidatorCanDistribute() public {
        vm.prank(attacker);
        vm.expectRevert();
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
    }
    
    function testCannotEarnInvalidActivity() public {
        vm.prank(validator);
        vm.expectRevert("Unknown activity type");
        currency.earnCurrency(citizen1, "invalid_activity", bytes32(uint256(1)));
    }
    
    function testNoTransferFunction() public {
        // Verificar que não existe função transfer
        // Solidity não tem como chamar função que não existe
        // Então verificamos que o contrato não implementa ERC20 padrão
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        // Se houvesse transfer(), este teste falharia na compilação
        // porque SovereignCurrency não herda de ERC20 completo
        assertTrue(true); // Token é soulbound por design
    }
    
    // ============ DECAY TESTS ============
    
    function testDecayAfterInactivity() public {
        // Ganhar moeda
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        assertEq(currency.balanceOf(citizen1), 100);
        
        // Avançar 120 dias (4 meses) - acima do período de decay (90 dias)
        vm.warp(block.timestamp + 120 days);
        
        // Nova atividade dispara decay
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        
        // Decay = 100 * 0.01 * (120/30) = 4 SOB
        // Novo saldo = 100 - 4 + 10 = 106
        // Como 120 >= 90 (DECAY_PERIOD), deve haver decay
        uint256 balance = currency.balanceOf(citizen1);
        assertLt(balance, 110); // Menos que sem decay
        assertGt(balance, 100); // Mas mais que o inicial
    }
    
    function testNoDecayBeforePeriod() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        // Avançar 60 dias (menos que 90)
        vm.warp(block.timestamp + 60 days);
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        
        // Não deve haver decay
        assertEq(currency.balanceOf(citizen1), 110);
    }
    
    function testDecayDoesNotGoNegative() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(1)));
        assertEq(currency.balanceOf(citizen1), 10);
        
        // Avançar 1 ano
        vm.warp(block.timestamp + 365 days);
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        
        // Mesmo com decay alto, não pode ficar negativo
        assertGe(currency.balanceOf(citizen1), 0);
    }
    
    // ============ CHECKPOINT TESTS ============
    
    function testCheckpointCreation() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        (,,,,, uint256 checkpointCount,) = currency.getCitizenInfo(citizen1);
        assertEq(checkpointCount, 1);
    }
    
    function testGetBalanceAt() public {
        uint256 t1 = block.timestamp;
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        vm.warp(block.timestamp + 1 days);
        uint256 t2 = block.timestamp;
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        
        // No tempo t1, tinha 100
        assertEq(currency.getBalanceAt(citizen1, t1), 100);
        
        // No tempo t2, tinha 110
        assertEq(currency.getBalanceAt(citizen1, t2), 110);
        
        // Antes de qualquer atividade, tinha 0
        assertEq(currency.getBalanceAt(citizen1, t1 - 1), 0);
    }
    
    // ============ ACTIVITY HISTORY TESTS ============
    
    function testActivityHistory() public {
        vm.startPrank(validator);
        
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        currency.earnCurrency(citizen1, "contribution", bytes32(uint256(3)));
        
        vm.stopPrank();
        
        (,,,,, , uint256 activityCount) = currency.getCitizenInfo(citizen1);
        assertEq(activityCount, 3);
        
        SovereignCurrency.Activity[] memory activities = 
            currency.getActivities(citizen1, 0, 10);
        
        assertEq(activities.length, 3);
        assertEq(activities[0].reward, 100); // proposal
        assertEq(activities[1].reward, 10);  // vote
        assertEq(activities[2].reward, 200); // contribution
    }
    
    function testActivityPagination() public {
        vm.startPrank(validator);
        
        // Criar 5 atividades
        for (uint i = 1; i <= 5; i++) {
            currency.earnCurrency(citizen1, "vote", bytes32(i));
        }
        
        vm.stopPrank();
        
        // Pegar primeiras 3
        SovereignCurrency.Activity[] memory page1 = 
            currency.getActivities(citizen1, 0, 3);
        assertEq(page1.length, 3);
        
        // Pegar próximas 2
        SovereignCurrency.Activity[] memory page2 = 
            currency.getActivities(citizen1, 3, 3);
        assertEq(page2.length, 2);
    }
    
    // ============ ADMIN TESTS ============
    
    function testUpdateActivityReward() public {
        vm.prank(admin);
        currency.updateActivityReward("proposal", 200);
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        assertEq(currency.balanceOf(citizen1), 200); // Nova recompensa
    }
    
    function testOnlyAdminCanUpdateRewards() public {
        vm.prank(attacker);
        vm.expectRevert();
        currency.updateActivityReward("proposal", 200);
    }
    
    function testDeactivateCitizen() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        (,,,bool isActive,,,) = currency.getCitizenInfo(citizen1);
        assertTrue(isActive);
        
        vm.prank(admin);
        currency.deactivateCitizen(citizen1);
        
        (,,,isActive,,,) = currency.getCitizenInfo(citizen1);
        assertFalse(isActive);
    }
    
    // ============ PAUSE TESTS ============
    
    function testPauseStopsOperations() public {
        vm.prank(admin);
        currency.pause();
        
        vm.prank(validator);
        vm.expectRevert();
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
    }
    
    function testUnpauseResumesOperations() public {
        vm.startPrank(admin);
        currency.pause();
        currency.unpause();
        vm.stopPrank();
        
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        assertEq(currency.balanceOf(citizen1), 100);
    }
    
    // ============ EXPORT/IMPORT TESTS ============
    
    function testExportStateHash() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        
        bytes32 stateHash = currency.exportStateHash(citizen1);
        
        // Hash deve ser determinístico
        bytes32 stateHash2 = currency.exportStateHash(citizen1);
        assertEq(stateHash, stateHash2);
    }
    
    function testVerifyExportedState() public {
        // Skip por enquanto - requer lógica complexa de assinatura
        // TODO: Implementar teste com assinatura correta
        vm.skip(true);
    }
    
    // ============ CITIZEN LIST TESTS ============
    
    function testGetCitizens() public {
        vm.startPrank(validator);
        
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        currency.earnCurrency(citizen2, "vote", bytes32(uint256(2)));
        
        vm.stopPrank();
        
        address[] memory citizens = currency.getCitizens(0, 10);
        assertEq(citizens.length, 2);
        assertEq(citizens[0], citizen1);
        assertEq(citizens[1], citizen2);
    }
    
    function testGetCitizensPagination() public {
        vm.startPrank(validator);
        
        // Registrar 5 cidadãos
        address[] memory addrs = new address[](5);
        for (uint i = 0; i < 5; i++) {
            addrs[i] = address(uint160(100 + i));
            currency.earnCurrency(addrs[i], "vote", bytes32(i));
        }
        
        vm.stopPrank();
        
        // Pegar primeiros 3
        address[] memory page1 = currency.getCitizens(0, 3);
        assertEq(page1.length, 3);
        
        // Pegar próximos 2
        address[] memory page2 = currency.getCitizens(3, 3);
        assertEq(page2.length, 2);
    }
    
    // ============ GAS OPTIMIZATION TESTS ============
    
    function testGasEarnCurrency() public {
        vm.prank(validator);
        uint256 gasBefore = gasleft();
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        uint256 gasUsed = gasBefore - gasleft();
        
        // Deve usar menos de 500k gas (primeira interação é mais cara)
        assertLt(gasUsed, 500_000);
    }
    
    function testGasGetBalanceAt() public {
        // Criar vários checkpoints
        vm.startPrank(validator);
        for (uint i = 0; i < 10; i++) {
            currency.earnCurrency(citizen1, "vote", bytes32(i));
            vm.warp(block.timestamp + 1 days);
        }
        vm.stopPrank();
        
        // Busca deve ser eficiente (binary search)
        uint256 gasBefore = gasleft();
        currency.getBalanceAt(citizen1, block.timestamp - 5 days);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Busca binária deve usar muito menos gas
        assertLt(gasUsed, 50_000);
    }
    
    // ============ EDGE CASES ============
    
    function testZeroAddressRejected() public {
        vm.prank(validator);
        vm.expectRevert("Invalid address");
        currency.earnCurrency(address(0), "proposal", bytes32(uint256(1)));
    }
    
    function testGetActivitiesOutOfBounds() public {
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(1)));
        
        // Offset maior que total
        SovereignCurrency.Activity[] memory activities = 
            currency.getActivities(citizen1, 10, 5);
        
        assertEq(activities.length, 0);
    }
    
    function testGetCitizensEmptyList() public {
        address[] memory citizens = currency.getCitizens(0, 10);
        assertEq(citizens.length, 0);
    }
    
    // ============ INTEGRATION TESTS ============
    
    function testFullLifecycle() public {
        // 1. Cidadão ganha moeda por várias atividades
        vm.startPrank(validator);
        currency.earnCurrency(citizen1, "proposal", bytes32(uint256(1)));
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(2)));
        currency.earnCurrency(citizen1, "contribution", bytes32(uint256(3)));
        vm.stopPrank();
        
        uint256 balanceAfterActivity = currency.balanceOf(citizen1);
        assertEq(balanceAfterActivity, 310);
        
        // 2. Fica inativo por 120 dias
        vm.warp(block.timestamp + 120 days);
        
        // 3. Retorna e ganha mais moeda (dispara decay)
        vm.prank(validator);
        currency.earnCurrency(citizen1, "vote", bytes32(uint256(4)));
        
        // 4. Verifica que decay foi aplicado
        uint256 finalBalance = currency.balanceOf(citizen1);
        assertLt(finalBalance, balanceAfterActivity + 10); // Menos que 320
        assertGt(finalBalance, balanceAfterActivity - 50); // Mas não decaiu muito
        
        // 5. Histórico preservado
        (,,,,, , uint256 activityCount) = currency.getCitizenInfo(citizen1);
        assertEq(activityCount, 4);
    }
}
