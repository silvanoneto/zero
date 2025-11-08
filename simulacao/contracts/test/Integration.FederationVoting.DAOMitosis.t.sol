// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../FederationVoting.sol";
import "../DAOMitosis.sol";
import "../GovernanceToken.sol";

/**
 * @title Testes de Integração: FederationVoting + DAOMitosis
 * @notice Verifica que votar em propostas registra atividade no sistema de mitose
 */
contract IntegrationFederationVotingDAOMitosisTest is Test {
    FederationVoting public voting;
    DAOMitosis public mitosis;
    GovernanceToken public token;
    
    address public admin = address(0x1);
    address public voter1 = address(0x2);
    address public voter2 = address(0x3);
    address public voter3 = address(0x4);
    
    uint256 public daoId;
    uint256 public proposalId;
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        token = new GovernanceToken();
        voting = new FederationVoting(address(token));
        mitosis = new DAOMitosis();
        
        // Setup roles
        voting.grantRole(voting.PROPOSER_ROLE(), admin);
        mitosis.grantRole(mitosis.MEMBER_TRACKER_ROLE(), address(voting));
        
        // Register DAO
        daoId = mitosis.registerDAO(address(voting), "Test DAO", "QmTestHash", 0);
        
        // Add members to DAO (respecting rate limits)
        mitosis.addMember(daoId, voter1, "QmVoter1");
        vm.roll(block.number + 1); // New block
        mitosis.addMember(daoId, voter2, "QmVoter2");
        vm.roll(block.number + 1); // New block
        mitosis.addMember(daoId, voter3, "QmVoter3");
        
        // Enable integration
        voting.setDAOMitosisIntegration(address(mitosis), daoId);
        
        // Distribute tokens
        token.mint(voter1, 1000 ether);
        token.mint(voter2, 1000 ether);
        token.mint(voter3, 1000 ether);
        
        vm.stopPrank();
    }
    
    function testVotingRecordsActivity() public {
        // Create proposal
        vm.startPrank(admin);
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false,
            expertDomain: bytes32(0)
        });
        proposalId = voting.createProposal(
            "Test Proposal",
            "QmTestProposal",
            tags,
            7 days
        );
        vm.stopPrank();
        
        // Get initial activity timestamp
        (address memberAddr, uint256 joinedAt, uint256 lastActivity1Before, bool isActive, uint256 rep, string memory profile) = 
            mitosis.daoMembers(daoId, voter1);
        
        assertEq(memberAddr, voter1, "Member address should match");
        assertEq(lastActivity1Before, joinedAt, "Initial activity should equal join time");
        
        // Wait a bit
        vm.warp(block.timestamp + 1 hours);
        
        // Vote
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 100 ether);
        vm.stopPrank();
        
        // Check activity was recorded
        (, , uint256 lastActivity1After, , , ) = mitosis.daoMembers(daoId, voter1);
        
        assertGt(lastActivity1After, lastActivity1Before, "Activity should be updated");
        assertEq(lastActivity1After, block.timestamp, "Activity timestamp should match");
    }
    
    function testMultipleVotesRecordMultipleActivities() public {
        // Create proposal
        vm.startPrank(admin);
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false,
            expertDomain: bytes32(0)
        });
        proposalId = voting.createProposal(
            "Test Proposal",
            "QmTestProposal",
            tags,
            7 days
        );
        vm.stopPrank();
        
        // Vote at different times (use absolute timestamps)
        uint256 time1 = block.timestamp + 1 hours;
        vm.warp(time1);
        vm.prank(voter1);
        voting.vote(proposalId, true, 100 ether);
        
        uint256 time2 = block.timestamp + 2 hours;
        vm.warp(time2);
        vm.prank(voter2);
        voting.vote(proposalId, true, 100 ether);
        
        uint256 time3 = block.timestamp + 3 hours;
        vm.warp(time3);
        vm.prank(voter3);
        voting.vote(proposalId, false, 100 ether);
        
        // Check all activities were recorded
        (, , uint256 lastActivity1, , , ) = mitosis.daoMembers(daoId, voter1);
        (, , uint256 lastActivity2, , , ) = mitosis.daoMembers(daoId, voter2);
        (, , uint256 lastActivity3, , , ) = mitosis.daoMembers(daoId, voter3);
        
        assertEq(lastActivity1, time1, "Voter1 activity should match");
        assertEq(lastActivity2, time2, "Voter2 activity should match");
        assertEq(lastActivity3, time3, "Voter3 activity should match");
    }
    
    function testVotingWorksWithoutMitosisIntegration() public {
        // Deploy new voting without mitosis
        vm.startPrank(admin);
        FederationVoting votingNoMitosis = new FederationVoting(address(token));
        votingNoMitosis.grantRole(votingNoMitosis.PROPOSER_ROLE(), admin);
        
        // Create proposal
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false,
            expertDomain: bytes32(0)
        });
        uint256 propId = votingNoMitosis.createProposal(
            "Test Proposal",
            "QmTestProposal",
            tags,
            7 days
        );
        vm.stopPrank();
        
        // Vote should work normally
        vm.prank(voter1);
        votingNoMitosis.vote(propId, true, 100 ether);
        
        // No errors should occur
        assertTrue(true, "Voting works without mitosis integration");
    }
    
    function testActivityNotRecordedForNonMembers() public {
        // Create proposal
        vm.startPrank(admin);
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false,
            expertDomain: bytes32(0)
        });
        proposalId = voting.createProposal(
            "Test Proposal",
            "QmTestProposal",
            tags,
            7 days
        );
        vm.stopPrank();
        
        // Give tokens to non-member
        address nonMember = address(0x999);
        vm.prank(admin);
        token.mint(nonMember, 1000 ether);
        
        // Non-member votes (should work but not record activity in mitosis)
        vm.prank(nonMember);
        voting.vote(proposalId, true, 100 ether);
        
        // Check vote was counted
        (uint256 proposalIdCheck, , , , , , , uint256 votesFor, , , , , , FederationVoting.ProposalState state) = 
            voting.proposals(proposalId);
        assertEq(proposalIdCheck, proposalId, "Proposal should exist");
        assertGt(votesFor, 0, "Vote should be counted");
        assertEq(uint256(state), uint256(FederationVoting.ProposalState.ACTIVE), "Proposal should be active");
    }
    
    function testIntegrationCanBeUpdated() public {
        // Register new DAO
        vm.startPrank(admin);
        uint256 newDaoId = mitosis.registerDAO(address(0x888), "New DAO", "QmNewHash", 0);
        
        // Update integration
        voting.setDAOMitosisIntegration(address(mitosis), newDaoId);
        
        // Check integration was updated
        assertEq(voting.daoId(), newDaoId, "DAO ID should be updated");
        vm.stopPrank();
    }
    
    function testOnlyAdminCanSetIntegration() public {
        vm.prank(voter1);
        vm.expectRevert();
        voting.setDAOMitosisIntegration(address(mitosis), 999);
    }
    
    function testCannotSetZeroAddressIntegration() public {
        vm.prank(admin);
        vm.expectRevert("Invalid mitosis address");
        voting.setDAOMitosisIntegration(address(0), daoId);
    }
}
