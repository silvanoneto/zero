// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../DAOMitosis.sol";
import "../GovernanceToken.sol";

/**
 * @title Testes de Integração: DAOMitosis + GovernanceToken
 * @notice Verifica distribuição 1:1 de tokens durante mitose
 */
contract IntegrationDAOMitosisGovernanceTokenTest is Test {
    DAOMitosis public mitosis;
    GovernanceToken public token;
    
    address public admin = address(0x1);
    address public member1 = address(0x2);
    address public member2 = address(0x3);
    address public member3 = address(0x4);
    address public childDao1 = address(0x101);
    address public childDao2 = address(0x102);
    
    uint256 public daoId;
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        token = new GovernanceToken();
        mitosis = new DAOMitosis();
        
        // Setup roles
        mitosis.grantRole(mitosis.MEMBER_TRACKER_ROLE(), admin);
        mitosis.grantRole(mitosis.MITOSIS_EXECUTOR_ROLE(), admin);
        token.grantRole(token.MINTER_ROLE(), address(mitosis));
        
        // Set governance token in mitosis
        mitosis.setGovernanceToken(address(token));
        
        // Register DAO
        daoId = mitosis.registerDAO(address(this), "Test DAO", "QmTestHash", 0);
        
        vm.stopPrank();
    }
    
    function addMembersWithRateLimit(uint256 _daoId, address[] memory members) internal {
        uint256 addedInBlock = 0;
        uint256 addedInWindow = 0;
        uint256 currentBlock = block.number + 1;
        uint256 currentTime = block.timestamp + 6 minutes;
        
        vm.warp(currentTime);
        vm.roll(currentBlock);
        
        for (uint256 i = 0; i < members.length; i++) {
            if (addedInBlock >= 10) {
                currentBlock++;
                vm.roll(currentBlock);
                addedInBlock = 0;
            }
            
            if (addedInWindow >= 50) {
                currentTime += 6 minutes;
                vm.warp(currentTime);
                addedInWindow = 0;
            }
            
            mitosis.addMember(_daoId, members[i], string(abi.encodePacked("QmMember", vm.toString(i))));
            addedInBlock++;
            addedInWindow++;
        }
    }
    
    function testTokensDistributedDuringMitosis() public {
        // Create 3 members with tokens
        address[] memory members = new address[](3);
        members[0] = member1;
        members[1] = member2;
        members[2] = member3;
        
        vm.startPrank(admin);
        
        // Add members
        addMembersWithRateLimit(daoId, members);
        
        // Give tokens to members
        token.mint(member1, 100 ether);
        token.mint(member2, 200 ether);
        token.mint(member3, 300 ether);
        
        vm.stopPrank();
        
        // Record initial balances
        uint256 member1BalanceBefore = token.balanceOf(member1);
        uint256 member2BalanceBefore = token.balanceOf(member2);
        uint256 member3BalanceBefore = token.balanceOf(member3);
        
        // Add 497 more members to trigger mitosis (total 500)
        address[] memory extraMembers = new address[](497);
        for (uint256 i = 0; i < 497; i++) {
            extraMembers[i] = address(uint160(1000 + i));
        }
        
        vm.startPrank(admin);
        addMembersWithRateLimit(daoId, extraMembers);
        
        // DAO should now be in MITOSIS_VOTE status - check member count
        (, , , , uint256 activeMemberCount, , , , , ) = mitosis.daos(daoId);
        assertEq(activeMemberCount, 500, "Should have 500 members");
        
        vm.stopPrank();
        
        // Get the active mitosis process
        uint256 processId = mitosis.activeMitosisProcess(daoId);
        assertTrue(processId > 0, "Mitosis process should be active");
        
        // Vote on mitosis (need at least 51% to reach quorum)
        // Vote as 300 members (60% of 500)
        for (uint256 i = 0; i < 300; i++) {
            vm.prank(extraMembers[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.AFFINITY);
        }
        
        // Finalize voting (approve mitosis)
        vm.warp(block.timestamp + 31 days); // After voting period
        
        vm.startPrank(admin);
        mitosis.finalizeMitosisVoting(processId);
        
        // Execute mitosis
        mitosis.executeMitosis(processId, childDao1, childDao2, "QmSnapshot");
        
        vm.stopPrank();
        
        // Check that tokens were distributed 1:1
        uint256 member1BalanceAfter = token.balanceOf(member1);
        uint256 member2BalanceAfter = token.balanceOf(member2);
        uint256 member3BalanceAfter = token.balanceOf(member3);
        
        // Each member should have 3x their original balance
        // (original + 1x for childDao1 + 1x for childDao2)
        assertEq(member1BalanceAfter, member1BalanceBefore * 3, "Member1 should have 3x tokens");
        assertEq(member2BalanceAfter, member2BalanceBefore * 3, "Member2 should have 3x tokens");
        assertEq(member3BalanceAfter, member3BalanceBefore * 3, "Member3 should have 3x tokens");
    }
    
    function testMitosisWorksWithoutTokenIntegration() public {
        // Create new mitosis without token
        vm.startPrank(admin);
        DAOMitosis mitosisNoToken = new DAOMitosis();
        mitosisNoToken.grantRole(mitosisNoToken.MEMBER_TRACKER_ROLE(), admin);
        mitosisNoToken.grantRole(mitosisNoToken.MITOSIS_EXECUTOR_ROLE(), admin);
        
        uint256 dao2Id = mitosisNoToken.registerDAO(address(this), "Test DAO 2", "QmTestHash2", 0);
        
        // Add 500 members
        address[] memory members = new address[](500);
        for (uint256 i = 0; i < 500; i++) {
            members[i] = address(uint160(2000 + i));
        }
        
        uint256 addedInBlock = 0;
        uint256 addedInWindow = 0;
        uint256 currentBlock = block.number + 1;
        uint256 currentTime = block.timestamp + 6 minutes;
        
        vm.warp(currentTime);
        vm.roll(currentBlock);
        
        for (uint256 i = 0; i < 500; i++) {
            if (addedInBlock >= 10) {
                currentBlock++;
                vm.roll(currentBlock);
                addedInBlock = 0;
            }
            
            if (addedInWindow >= 50) {
                currentTime += 6 minutes;
                vm.warp(currentTime);
                addedInWindow = 0;
            }
            
            mitosisNoToken.addMember(dao2Id, members[i], string(abi.encodePacked("QmMember", vm.toString(i))));
            addedInBlock++;
            addedInWindow++;
        }
        
        vm.stopPrank();
        
        // Get the process and vote
        uint256 processId = mitosisNoToken.activeMitosisProcess(dao2Id);
        
        // Vote as 300 members (60% quorum)
        for (uint256 i = 0; i < 300; i++) {
            vm.prank(members[i]);
            mitosisNoToken.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.AFFINITY);
        }
        
        vm.warp(block.timestamp + 31 days);
        
        vm.startPrank(admin);
        mitosisNoToken.finalizeMitosisVoting(processId);
        
        // Execute mitosis (should work without tokens)
        mitosisNoToken.executeMitosis(processId, childDao1, childDao2, "QmSnapshot");
        
        vm.stopPrank();
        
        // Check mitosis completed - processId should exist
        (uint256 processIdCheck, , , , , , , , , , , , , ) = mitosisNoToken.mitosisProcesses(processId);
        assertEq(processIdCheck, processId, "Mitosis process should exist");
    }
    
    function testOnlyAdminCanSetGovernanceToken() public {
        vm.prank(member1);
        vm.expectRevert();
        mitosis.setGovernanceToken(address(token));
    }
    
    function testCannotSetZeroAddressToken() public {
        vm.prank(admin);
        vm.expectRevert("Invalid token address");
        mitosis.setGovernanceToken(address(0));
    }
    
    function testTokensNotDistributedForInactiveMembers() public {
        vm.startPrank(admin);
        
        // Add and then remove a member
        mitosis.addMember(daoId, member1, "QmMember1");
        token.mint(member1, 100 ether);
        
        vm.roll(block.number + 1);
        vm.warp(block.timestamp + 2 hours); // Past cooldown
        
        mitosis.removeMember(daoId, member1);
        
        uint256 member1BalanceBefore = token.balanceOf(member1);
        
        // Add 500 more members to trigger mitosis
        address[] memory members = new address[](500);
        for (uint256 i = 0; i < 500; i++) {
            members[i] = address(uint160(3000 + i));
        }
        addMembersWithRateLimit(daoId, members);
        
        vm.stopPrank();
        
        uint256 processId = mitosis.activeMitosisProcess(daoId);
        
        // Vote as 300 members (60% quorum)
        for (uint256 i = 0; i < 300; i++) {
            vm.prank(members[i]);
            mitosis.voteOnMitosisCriteria(processId, DAOMitosis.DivisionCriteria.AFFINITY);
        }
        
        vm.warp(block.timestamp + 31 days);
        
        vm.startPrank(admin);
        mitosis.finalizeMitosisVoting(processId);
        mitosis.executeMitosis(processId, childDao1, childDao2, "QmSnapshot");
        
        vm.stopPrank();
        
        // Inactive member should not receive additional tokens
        uint256 member1BalanceAfter = token.balanceOf(member1);
        assertEq(member1BalanceAfter, member1BalanceBefore, "Inactive member should not receive tokens");
    }
}
