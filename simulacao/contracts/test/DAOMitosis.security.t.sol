// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../DAOMitosis.sol";

/**
 * @title DAOMitosis Security Tests
 * @notice Testes de segurança contra ataques de spam e DOS
 */
contract DAOMitosisSecurityTest is Test {
    DAOMitosis public mitosis;
    
    address public daoAdmin = address(0x2);
    address public memberTracker = address(0x3);
    address public attacker = address(0x666);
    
    address public daoAddress1 = address(0x100);
    
    address[] public members;
    
    function setUp() public {
        mitosis = new DAOMitosis();
        
        // Grant roles
        mitosis.grantRole(mitosis.DAO_ADMIN_ROLE(), daoAdmin);
        mitosis.grantRole(mitosis.MEMBER_TRACKER_ROLE(), memberTracker);
        
        // Create test members
        for (uint256 i = 0; i < 100; i++) {
            members.push(address(uint160(0x1000 + i)));
        }
    }
    
    // ============ RATE LIMITING TESTS ============
    
    function testBlockRateLimit() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona até o limite por bloco (10 operações)
        for (uint256 i = 0; i < 10; i++) {
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        
        // A 11ª operação deve falhar
        vm.expectRevert("Too many operations per block");
        mitosis.addMember(daoId, members[10], "QmProfile");
        
        vm.stopPrank();
    }
    
    function testWindowRateLimit() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona membros em múltiplos blocos até atingir limite da janela
        uint256 currentBlock = block.number;
        for (uint256 blockIdx = 0; blockIdx < 5; blockIdx++) {
            currentBlock++;
            vm.roll(currentBlock);
            
            for (uint256 i = 0; i < 10; i++) {
                uint256 memberIdx = blockIdx * 10 + i;
                if (memberIdx < 50) {
                    mitosis.addMember(daoId, members[memberIdx], "QmProfile");
                }
            }
        }
        
        // Próxima operação deve falhar (50 ops na janela)
        currentBlock++;
        vm.roll(currentBlock);
        vm.expectRevert("Rate limit exceeded");
        mitosis.addMember(daoId, members[50], "QmProfile");
        
        vm.stopPrank();
    }
    
    function testWindowReset() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona 40 membros
        for (uint256 i = 0; i < 40; i++) {
            if (i % 10 == 0) vm.roll(block.number + 1);
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        
        // Avança tempo além da janela (5 minutos)
        vm.warp(block.timestamp + 6 minutes);
        vm.roll(block.number + 1);
        
        // Agora pode adicionar mais 10 (nova janela)
        for (uint256 i = 40; i < 50; i++) {
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        
        vm.stopPrank();
    }
    
    // ============ COOLDOWN TESTS ============
    
    function testMemberCooldownAdd() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona membro
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        vm.roll(block.number + 1);
        
        // Remove membro
        vm.warp(block.timestamp + 1 hours);
        mitosis.removeMember(daoId, members[0]);
        
        vm.roll(block.number + 1);
        
        // Tenta adicionar novamente imediatamente - deve falhar
        vm.expectRevert("Member cooldown active");
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        // Avança tempo além do cooldown
        vm.warp(block.timestamp + 1 hours + 1);
        vm.roll(block.number + 1);
        
        // Agora deve funcionar
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        vm.stopPrank();
    }
    
    function testMemberCooldownRemove() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona membro
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        vm.roll(block.number + 1);
        
        // Tenta remover imediatamente - deve falhar
        vm.expectRevert("Member cooldown active");
        mitosis.removeMember(daoId, members[0]);
        
        // Avança tempo além do cooldown
        vm.warp(block.timestamp + 1 hours + 1);
        vm.roll(block.number + 1);
        
        // Agora deve funcionar
        mitosis.removeMember(daoId, members[0]);
        
        vm.stopPrank();
    }
    
    // ============ SUSPICIOUS ACTIVITY TESTS ============
    
    function testSuspiciousActivityDetection() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona membro no timestamp 1
        mitosis.addMember(daoId, members[0], "QmProfile");
        uint256 addTime1 = 1; // hardcode pois block.timestamp inicial é 1
        
        // Avança tempo além do cooldown para remover (2 horas)
        vm.roll(block.number + 1);
        vm.warp(addTime1 + 2 hours);
        
        // Remove membro
        mitosis.removeMember(daoId, members[0]);
        uint256 removeTime = addTime1 + 2 hours; // timestamp após o warp
        
        // Avança tempo além do cooldown para readicionar (mais 2 horas)
        vm.roll(block.number + 1);
        vm.warp(removeTime + 2 hours);
        
        // Readiciona (deve funcionar pois passou 2h do cooldown, mas emite alerta pois < 1 dia)
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        vm.stopPrank();
        
        // Verifica que o membro foi readicionado
        DAOMitosis.Member memory member = mitosis.getMemberInfo(daoId, members[0]);
        assertTrue(member.isActive, "Member should be active");
    }
    
    // ============ PAUSE TESTS ============
    
    function testPauseOperations() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Admin pausa operações
        vm.prank(daoAdmin);
        mitosis.setMemberOpsPaused(daoId, true);
        
        // Tenta adicionar membro - deve falhar
        vm.prank(memberTracker);
        vm.expectRevert("Member operations paused");
        mitosis.addMember(daoId, members[0], "QmProfile");
        
        // Admin despausa
        vm.prank(daoAdmin);
        mitosis.setMemberOpsPaused(daoId, false);
        
        // Agora deve funcionar
        vm.prank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile");
    }
    
    function testResetRateLimits() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona membros até próximo do limite
        for (uint256 i = 0; i < 45; i++) {
            if (i % 10 == 0) vm.roll(block.number + 1);
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        
        vm.stopPrank();
        
        // Verifica métricas
        (,uint256 opsInWindow,,) = mitosis.getSecurityMetrics(daoId);
        assertEq(opsInWindow, 45);
        
        // Admin reseta limites
        vm.prank(daoAdmin);
        mitosis.resetRateLimits(daoId);
        
        // Verifica que foi resetado
        (,opsInWindow,,) = mitosis.getSecurityMetrics(daoId);
        assertEq(opsInWindow, 0);
        
        // Agora pode adicionar mais membros
        vm.startPrank(memberTracker);
        vm.roll(block.number + 1);
        for (uint256 i = 45; i < 55; i++) {
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        vm.stopPrank();
    }
    
    // ============ METRICS TESTS ============
    
    function testSecurityMetrics() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        // Adiciona alguns membros
        for (uint256 i = 0; i < 5; i++) {
            mitosis.addMember(daoId, members[i], "QmProfile");
        }
        
        // Verifica métricas
        (
            uint256 opsThisBlock,
            uint256 opsInWindow,
            uint256 windowStart,
            bool isPaused
        ) = mitosis.getSecurityMetrics(daoId);
        
        assertEq(opsThisBlock, 5);
        assertEq(opsInWindow, 5);
        assertTrue(windowStart > 0, "Window start should be set");
        assertEq(isPaused, false);
        
        vm.stopPrank();
    }
    
    // ============ GAS OPTIMIZATION TESTS ============
    
    function testGas_RateLimitingOverhead() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        
        uint256 gasBefore = gasleft();
        mitosis.addMember(daoId, members[0], "QmProfile");
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas usado com rate limiting:", gasUsed);
        
        // Rate limiting não deve adicionar muito overhead (<350k gas)
        assertLt(gasUsed, 350000);
        
        vm.stopPrank();
    }
}
