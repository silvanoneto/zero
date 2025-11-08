// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../DAOMitosis.sol";

/**
 * @title DAOMitosisTest
 * @notice Testes para o sistema de Mitose de DAOs (Artigo 5º-C)
 * @dev Testa todos os cenários de divisão celular organizacional
 */
contract DAOMitosisTest is Test {
    DAOMitosis public mitosis;
    
    address public admin = address(0x1);
    address public daoAdmin = address(0x2);
    address public memberTracker = address(0x3);
    address public mitosisExecutor = address(0x4);
    
    address public daoAddress1 = address(0x100);
    address public daoAddress2 = address(0x200);
    address public daoAddress3 = address(0x300);
    
    address[] public members;
    
    function setUp() public {
        mitosis = new DAOMitosis();
        
        // Grant roles
        mitosis.grantRole(mitosis.DAO_ADMIN_ROLE(), daoAdmin);
        mitosis.grantRole(mitosis.MEMBER_TRACKER_ROLE(), memberTracker);
        mitosis.grantRole(mitosis.MITOSIS_EXECUTOR_ROLE(), mitosisExecutor);
        
        // Create 600 test member addresses
        for (uint256 i = 0; i < 600; i++) {
            members.push(address(uint160(0x1000 + i)));
        }
    }
    
    /**
     * @notice Helper function to add members respecting rate limits
     * @dev Adds up to 10 members per block and resets window every 50 ops
     */
    function addMembersWithRateLimit(uint256 daoId, uint256 startIdx, uint256 count) internal {
        vm.startPrank(memberTracker);
        
        uint256 addedInBlock = 0;
        uint256 addedInWindow = 0;
        
        for (uint256 i = 0; i < count; i++) {
            // Roll to new block every 10 members
            if (addedInBlock >= 10) {
                vm.roll(block.number + 1);
                addedInBlock = 0;
            }
            
            // Advance time to new window every 50 members
            if (addedInWindow >= 50) {
                vm.warp(block.timestamp + 6 minutes); // Beyond 5-minute window
                addedInWindow = 0;
            }
            
            mitosis.addMember(daoId, members[startIdx + i], "QmProfile");
            addedInBlock++;
            addedInWindow++;
        }
        
        vm.stopPrank();
    }
    
    // ============ REGISTRATION TESTS ============
    
    function testRegisterDAO() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(
            daoAddress1,
            "DAO Alpha",
            "QmTestHash123",
            0 // no parent
        );
        
        assertEq(daoId, 1, "DAO ID should be 1");
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(1);
        assertEq(dao.daoAddress, daoAddress1);
        assertEq(dao.name, "DAO Alpha");
        assertEq(dao.activeMemberCount, 0);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.ACTIVE));
        assertEq(dao.parentDaoId, 0);
        assertEq(dao.generationLevel, 0);
    }
    
    function testCannotRegisterSameDAOTwice() public {
        vm.startPrank(daoAdmin);
        mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.expectRevert("DAO already registered");
        mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        vm.stopPrank();
    }
    
    function testRegisterChildDAO() public {
        vm.startPrank(daoAdmin);
        uint256 parentId = mitosis.registerDAO(daoAddress1, "DAO Parent", "QmHash1", 0);
        uint256 childId = mitosis.registerDAO(daoAddress2, "DAO Child", "QmHash2", parentId);
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory child = mitosis.getDAOInfo(childId);
        assertEq(child.parentDaoId, parentId);
        assertEq(child.generationLevel, 1);
        
        uint256[] memory children = mitosis.getChildDAOs(parentId);
        assertEq(children.length, 1);
        assertEq(children[0], childId);
    }
    
    // ============ MEMBER MANAGEMENT TESTS ============
    
    function testAddMember() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.prank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 1);
        assertEq(dao.totalMemberCount, 1);
        
        DAOMitosis.Member memory member = mitosis.getMemberInfo(daoId, members[0]);
        assertTrue(member.isActive);
        assertEq(member.memberAddress, members[0]);
    }
    
    function testCannotAddMemberTwice() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        
        vm.expectRevert("Member already active");
        mitosis.addMember(daoId, members[0], "QmProfile1");
        vm.stopPrank();
    }
    
    function testRemoveMember() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        
        // Avançar tempo além do cooldown
        vm.warp(block.timestamp + 2 hours);
        vm.roll(block.number + 1);
        
        mitosis.removeMember(daoId, members[0]);
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 0);
        
        DAOMitosis.Member memory member = mitosis.getMemberInfo(daoId, members[0]);
        assertFalse(member.isActive);
    }
    
    function testRecordActivity() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        
        // Captura o timestamp ANTES de adicionar o membro
        DAOMitosis.Member memory memberBefore = mitosis.getMemberInfo(daoId, members[0]);
        uint256 initialActivity = memberBefore.lastActivityAt;
        
        vm.warp(block.timestamp + 10 days);
        mitosis.recordActivity(daoId, members[0]);
        vm.stopPrank();
        
        DAOMitosis.Member memory member = mitosis.getMemberInfo(daoId, members[0]);
        assertTrue(member.lastActivityAt > initialActivity, "Activity should be updated");
    }
    
    function testUpdateActiveMemberCountRemovesInactive() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 3 members
        vm.startPrank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        mitosis.addMember(daoId, members[1], "QmProfile2");
        mitosis.addMember(daoId, members[2], "QmProfile3");
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 3);
        
        // Warp 91 days (past inactivity period)
        vm.warp(block.timestamp + 91 days);
        
        // Update count
        mitosis.updateActiveMemberCount(daoId);
        
        dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 0, "All members should be inactive");
    }
    
    // ============ DUNBAR LIMIT TESTS ============
    
    function testDunbarWarningAt450Members() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 449 members - no warning
        addMembersWithRateLimit(daoId, 0, 449);
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.ACTIVE));
        
        // Add 450th member - triggers warning
        vm.startPrank(memberTracker);
        vm.roll(block.number + 1);
        vm.expectEmit(true, false, false, true);
        emit DAOMitosis.DunbarWarning(daoId, 450, 500);
        mitosis.addMember(daoId, members[449], "QmProfile");
        vm.stopPrank();
        
        dao = mitosis.getDAOInfo(daoId);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.WARNING));
    }
    
    function testMitosisInitiatedAt500Members() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 499 members
        addMembersWithRateLimit(daoId, 0, 499);
        
        // Add 500th member - triggers mitosis
        vm.startPrank(memberTracker);
        vm.roll(block.number + 1);
        vm.warp(block.timestamp + 6 minutes); // New window
        mitosis.addMember(daoId, members[499], "QmProfile");
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.MITOSIS_VOTE));
        assertEq(dao.activeMemberCount, 500);
        
        // Verifica que processo de mitose foi criado
        assertTrue(mitosis.hasActiveMitosisProcess(daoId), "Should have active mitosis process");
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        assertGt(processId, 0, "Process ID should be > 0");
        
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        assertEq(process.daoId, daoId);
        assertEq(uint(process.status), uint(DAOMitosis.MitosisStatus.PENDING));
    }

    
    function testIsDunbarLimitApproaching() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 449 members
        addMembersWithRateLimit(daoId, 0, 449);
        
        assertFalse(mitosis.isDunbarLimitApproaching(daoId));
        
        // Add 450th
        vm.prank(memberTracker);
        mitosis.addMember(daoId, members[449], "QmProfile");
        
        assertTrue(mitosis.isDunbarLimitApproaching(daoId));
    }
    
    // ============ MITOSIS VOTING TESTS ============
    
    function testVoteOnMitosisCriteria() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members and trigger mitosis
        addMembersWithRateLimit(daoId, 0, 500);
        
        // Verifica que processo foi criado
        assertTrue(mitosis.hasActiveMitosisProcess(daoId), "Should have active process");
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        
        // Members vote
        vm.prank(members[0]);
        mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.RANDOM);
        
        vm.prank(members[1]);
        mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.GEOGRAPHIC);
        
        (uint256 geo, , uint256 rand, , uint256 total) = 
            mitosis.getMitosisVotingStats(processId);
        
        assertEq(geo, 1);
        assertEq(rand, 1);
        assertEq(total, 2);
    }
    
    function testCannotVoteTwice() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        
        vm.startPrank(members[0]);
        mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.RANDOM);
        
        vm.expectRevert("Already voted");
        mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.GEOGRAPHIC);
        vm.stopPrank();
    }
    
    function testCannotVoteAfterPeriodEnds() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        
        // Warp past voting period
        vm.warp(process.votingEndsAt + 1);
        
        vm.prank(members[0]);
        vm.expectRevert("Voting period ended");
        mitosis.voteOnMitosisCriteria(process.processId, DAOMitosis.DivisionCriteria.RANDOM);
    }
    
    function testFinalizeMitosisVoting() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        
        // 260 members vote (52% quorum - above 51%)
        for (uint256 i = 0; i < 200; i++) {
            vm.prank(members[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.RANDOM);
        }
        for (uint256 i = 200; i < 260; i++) {
            vm.prank(members[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.GEOGRAPHIC);
        }
        
        // Warp past voting period
        vm.warp(process.votingEndsAt + 1);
        
        // Finalize
        vm.prank(mitosisExecutor);
        mitosis.finalizeMitosisVoting(processId);
        
        process = mitosis.getActiveMitosisProcess(daoId);
        assertEq(uint(process.status), uint(DAOMitosis.MitosisStatus.APPROVED));
        assertEq(uint(process.selectedCriteria), uint(DAOMitosis.DivisionCriteria.RANDOM));
    }
    
    function testCannotFinalizeWithoutQuorum() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        
        // Only 100 members vote (20% - below 51% quorum)
        for (uint256 i = 0; i < 100; i++) {
            vm.prank(members[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.RANDOM);
        }
        
        // Warp past voting period
        vm.warp(process.votingEndsAt + 1);
        
        // Try to finalize
        vm.prank(mitosisExecutor);
        vm.expectRevert("Quorum not reached");
        mitosis.finalizeMitosisVoting(processId);
    }
    
    // ============ MITOSIS EXECUTION TESTS ============
    
    function testExecuteMitosis() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);
        
        // Vote and finalize
        for (uint256 i = 0; i < 260; i++) {
            vm.prank(members[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.RANDOM);
        }
        
        vm.warp(process.votingEndsAt + 1);
        
        vm.prank(mitosisExecutor);
        mitosis.finalizeMitosisVoting(processId);
        
        // Execute mitosis
        vm.prank(mitosisExecutor);
        mitosis.executeMitosis(
            processId,
            daoAddress2,
            daoAddress3,
            "QmSnapshotHash123"
        );
        
        // Após executar, busca processo pelo ID direto (já não está mais ativo)
        DAOMitosis.MitosisProcess memory process2 = mitosis.getMitosisProcess(processId);
        assertEq(uint(process2.status), uint(DAOMitosis.MitosisStatus.COMPLETED));
        
        // Check parent DAO is now legacy
        DAOMitosis.DAOInfo memory parentDao = mitosis.getDAOInfo(daoId);
        assertEq(uint(parentDao.status), uint(DAOMitosis.DAOStatus.LEGACY));
        
        // Check child DAOs were created
        uint256[] memory children = mitosis.getChildDAOs(daoId);
        assertEq(children.length, 2);
        
        DAOMitosis.DAOInfo memory child1 = mitosis.getDAOInfo(children[0]);
        assertEq(child1.daoAddress, daoAddress2);
        assertEq(child1.parentDaoId, daoId);
        assertEq(child1.generationLevel, 1);
        assertTrue(bytes(child1.name).length > 0);
        
        DAOMitosis.DAOInfo memory child2 = mitosis.getDAOInfo(children[1]);
        assertEq(child2.daoAddress, daoAddress3);
    }
    
    function testCannotExecuteMitosisWithoutApproval() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members

        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        
        // Try to execute without voting/approval
        vm.prank(mitosisExecutor);
        vm.expectRevert("Mitosis not approved");
        mitosis.executeMitosis(processId, daoAddress2, daoAddress3, "QmHash");
    }
    
    // ============ CANCELLATION TESTS ============
    
    function testMitosisCancelledWhenMembersLeave() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 500 members - triggers mitosis
        addMembersWithRateLimit(daoId, 0, 500);
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.MITOSIS_VOTE));
        
        // Remove 60 members - drops below 450 (need to respect cooldowns and rate limits)
        vm.startPrank(memberTracker);
        
        uint256 removedInBlock = 0;
        uint256 removedInWindow = 0;
        uint256 currentBlock = block.number + 1;
        uint256 currentTime = block.timestamp + 6 minutes; // New window + beyond cooldown
        
        vm.warp(currentTime);
        vm.roll(currentBlock);
        
        for (uint256 i = 0; i < 60; i++) {
            // Reset block every 10 operations
            if (removedInBlock >= 10) {
                currentBlock++;
                vm.roll(currentBlock);
                removedInBlock = 0;
            }
            
            // Reset window every 50 operations
            if (removedInWindow >= 50) {
                currentTime += 6 minutes;
                vm.warp(currentTime);
                removedInWindow = 0;
            }
            
            mitosis.removeMember(daoId, members[i]);
            removedInBlock++;
            removedInWindow++;
        }
        vm.stopPrank();
        
        dao = mitosis.getDAOInfo(daoId);
        assertEq(uint(dao.status), uint(DAOMitosis.DAOStatus.ACTIVE));
        assertEq(dao.activeMemberCount, 440);
        
        // Verifica que processo foi cancelado
        assertFalse(mitosis.hasActiveMitosisProcess(daoId), "Should not have active mitosis process");
        uint256 processId = mitosis.getActiveMitosisProcessId(daoId);
        assertEq(processId, 0, "Process ID should be 0");
    }
    
    // ============ EDGE CASES ============
    
    function testMultipleGenerations() public {
        vm.startPrank(daoAdmin);
        
        // Gen 0
        uint256 gen0 = mitosis.registerDAO(daoAddress1, "Gen 0", "QmHash", 0);
        
        // Gen 1
        uint256 gen1a = mitosis.registerDAO(address(0x201), "Gen 1a", "QmHash", gen0);
        uint256 gen1b = mitosis.registerDAO(address(0x202), "Gen 1b", "QmHash", gen0);
        
        // Gen 2
        uint256 gen2 = mitosis.registerDAO(address(0x301), "Gen 2", "QmHash", gen1a);
        
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(gen2);
        assertEq(dao.generationLevel, 2);
        assertEq(dao.parentDaoId, gen1a);
        
        uint256[] memory gen1Children = mitosis.getChildDAOs(gen0);
        assertEq(gen1Children.length, 2);
    }
    
    function testReactivateMember() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        vm.startPrank(memberTracker);
        mitosis.addMember(daoId, members[0], "QmProfile1");
        uint256 addTime = 1; // Initial timestamp
        
        // Avançar tempo além do cooldown para remover
        vm.warp(addTime + 2 hours);
        vm.roll(block.number + 1);
        
        mitosis.removeMember(daoId, members[0]);
        uint256 removeTime = addTime + 2 hours;
        
        // Avançar tempo além do cooldown para readicionar
        vm.warp(removeTime + 2 hours);
        vm.roll(block.number + 1);
        
        // Re-add member
        mitosis.addMember(daoId, members[0], "QmProfile1");
        vm.stopPrank();
        
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 1);
        assertEq(dao.totalMemberCount, 1); // Still 1 because member already existed
        
        DAOMitosis.Member memory member = mitosis.getMemberInfo(daoId, members[0]);
        assertTrue(member.isActive);
    }
    
    // ============ GAS OPTIMIZATION TESTS ============
    
    function testGas_Add500Members() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        uint256 gasBefore = gasleft();
        
        addMembersWithRateLimit(daoId, 0, 500);
        
        uint256 gasUsed = gasBefore - gasleft();
        emit log_named_uint("Gas used for 500 members", gasUsed);
        
        // Verify final state
        DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);
        assertEq(dao.activeMemberCount, 500);
    }
    
    function testGas_UpdateActiveMemberCount() public {
        vm.prank(daoAdmin);
        uint256 daoId = mitosis.registerDAO(daoAddress1, "DAO Alpha", "QmHash", 0);
        
        // Add 100 members with rate limiting
        addMembersWithRateLimit(daoId, 0, 100);
        
        vm.warp(block.timestamp + 91 days);
        
        uint256 gasBefore = gasleft();
        mitosis.updateActiveMemberCount(daoId);
        uint256 gasUsed = gasBefore - gasleft();
        
        emit log_named_uint("Gas used for updating 100 inactive members", gasUsed);
    }
    
    // ============ EVENTS ============
    
    event DAORegistered(uint256 indexed daoId, address indexed daoAddress, string name, uint256 parentDaoId);
    event DunbarWarning(uint256 indexed daoId, uint256 currentMembers, uint256 limit);
    event MitosisInitiated(uint256 indexed processId, uint256 indexed daoId, uint256 currentMembers, uint256 votingEndsAt);
}
