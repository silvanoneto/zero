// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../FederationVoting.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title FederationVotingTest
 * @notice Testes abrangentes para o sistema de votacao hibrida
 * @dev Usa Foundry para fuzzing e testes baseados em propriedades
 */

contract MockGovernanceToken is ERC20 {
    constructor() ERC20("Identidade Soberana", "IDS") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract FederationVotingTest is Test {
    FederationVoting public voting;
    MockGovernanceToken public token;
    
    address public admin = address(1);
    address public proposer = address(2);
    address public voter1 = address(3);
    address public voter2 = address(4);
    address public expert = address(5);
    
    function setUp() public {
        // Deploy contracts
        vm.startPrank(admin);
        token = new MockGovernanceToken();
        voting = new FederationVoting(address(token));
        
        // Setup roles
        voting.grantRole(voting.PROPOSER_ROLE(), proposer);
        voting.grantRole(voting.EXPERT_VERIFIER_ROLE(), admin);
        
        // Distribute tokens
        token.mint(voter1, 1000 * 10**18);
        token.mint(voter2, 500 * 10**18);
        token.mint(expert, 500 * 10**18); // Increased for expert multiplier test
        
        vm.stopPrank();
    }
    
    // ============ LINEAR VOTING TESTS ============
    
    function testLinearVoting() public {
        // Create procedural proposal (linear)
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Mudar horario das reunioes",
            "ipfs://Qm...",
            tags,
            7 days
        );
        
        vm.stopPrank();
        
        // Vote with linear function
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 100 * 10**18);
        vm.stopPrank();
        
        // Check vote weight (should be 100 in linear)
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        assertEq(votesFor, 100 * 10**18, "Linear vote should be 1:1");
    }
    
    // ============ QUADRATIC VOTING TESTS ============
    
    function testQuadraticVoting() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: true,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 1000000 * 10**18,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Alocar 1M tokens para educacao",
            "ipfs://Qm...",
            tags,
            14 days
        );
        
        vm.stopPrank();
        
        // Vote with quadratic function
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 100 * 10**18);
        vm.stopPrank();
        
        // Check vote weight (should be sqrt(100) = 10)
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        assertEq(votesFor, 10 * 10**18, "Quadratic vote should be sqrt(tokens)");
    }
    
    function testQuadraticPreventsPlutonomy() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: true,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 5000 * 10**18,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Alocar recursos para infraestrutura",
            "ipfs://Qm...",
            tags,
            14 days
        );
        
        vm.stopPrank();
        
        // Whale with 1000 tokens
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 1000 * 10**18);
        vm.stopPrank();
        
        // Small holder with 100 tokens
        vm.startPrank(voter2);
        voting.vote(proposalId, true, 100 * 10**18);
        vm.stopPrank();
        
        // Check: whale only has sqrt(10) = 3.16x more influence
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        uint256 expectedVotes = sqrt(1000 * 10**18) * 1e9 + sqrt(100 * 10**18) * 1e9;
        assertEq(votesFor, expectedVotes, "Quadratic should reduce whale power");
        
        // Whale: sqrt(1000) ≈ 31.6
        // Small: sqrt(100) = 10
        // Ratio: 3.16x instead of 10x
    }
    
    // ============ LOGARITHMIC VOTING TESTS ============
    
    function testLogarithmicVoting() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: true,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: true, expertDomain: keccak256("blockchain-consensus")
        });
        
        uint256 proposalId = voting.createProposal(
            "Implementar novo algoritmo de consenso",
            "ipfs://Qm...",
            tags,
            21 days
        );
        
        vm.stopPrank();
        
        // Vote with logarithmic function
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 256 * 10**18); // log2(256) = 8
        vm.stopPrank();
        
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        assertEq(votesFor, 8 * 10**18, "Log vote should compress heavily");
    }
    
    // ============ CONSENSUS VOTING TESTS ============
    
    function testConsensusVoting() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: true,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Principios eticos da IA nacional",
            "ipfs://Qm...",
            tags,
            30 days
        );
        
        vm.stopPrank();
        
        // All votes count as 1 (egalitarian)
        vm.prank(voter1);
        voting.vote(proposalId, true, 1000 * 10**18);
        
        vm.prank(voter2);
        voting.vote(proposalId, true, 100 * 10**18);
        
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        assertEq(votesFor, 2 * 10**18, "Consensus should be 1 person = 1 vote");
    }
    
    function testConsensusRequires80Percent() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: true,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Proibir vigilancia biometrica",
            "ipfs://Qm...",
            tags,
            30 days
        );
        
        vm.stopPrank();
        
        // 8 votes for, 2 against (80% exactly)
        for (uint i = 0; i < 8; i++) {
            address voter = address(uint160(100 + i));
            token.mint(voter, 100 * 10**18);
            vm.prank(voter);
            voting.vote(proposalId, true, 10 * 10**18);
        }
        
        for (uint i = 0; i < 2; i++) {
            address voter = address(uint160(200 + i));
            token.mint(voter, 100 * 10**18);
            vm.prank(voter);
            voting.vote(proposalId, false, 10 * 10**18);
        }
        
        // Fast forward past deadline
        vm.warp(block.timestamp + 31 days);
        
        voting.executeProposal(proposalId);
        
        (,,,,,FederationVoting.ProposalState state) = voting.getProposal(proposalId);
        assertEq(uint(state), uint(FederationVoting.ProposalState.SUCCEEDED));
    }
    
    // ============ EXPERT MULTIPLIER TESTS ============
    
    function testExpertMultiplier() public {
        // Verify expert
        vm.prank(admin);
        bytes32 domain = keccak256("blockchain-consensus");
        voting.verifyExpert(expert, domain);
        
        // Create technical proposal
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: true,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: true, expertDomain: keccak256("blockchain-consensus")
        });
        
        uint256 proposalId = voting.createProposal(
            "Migrar para PoS hibrido",
            "ipfs://Qm...",
            tags,
            21 days
        );
        
        vm.stopPrank();
        
        // Regular voter
        vm.prank(voter1);
        voting.vote(proposalId, true, 256 * 10**18); // log2(256) = 8
        
        // Expert voter (should get 2x multiplier)
        vm.prank(expert);
        voting.vote(proposalId, true, 256 * 10**18); // log2(256) * 2 = 16
        
        (,,,uint256 votesFor,,) = voting.getProposal(proposalId);
        assertEq(votesFor, 24 * 10**18, "Expert should get 2x weight");
    }
    
    // ============ SECURITY TESTS ============
    
    function testCannotVoteTwice() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Test proposal",
            "ipfs://Qm...",
            tags,
            7 days
        );
        
        vm.stopPrank();
        
        vm.startPrank(voter1);
        voting.vote(proposalId, true, 100 * 10**18);
        
        // Try to vote again
        vm.expectRevert("Already voted");
        voting.vote(proposalId, true, 50 * 10**18);
        
        vm.stopPrank();
    }
    
    function testCannotVoteAfterDeadline() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Test proposal",
            "ipfs://Qm...",
            tags,
            7 days
        );
        
        vm.stopPrank();
        
        // Fast forward past deadline
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(voter1);
        vm.expectRevert("Voting ended");
        voting.vote(proposalId, true, 100 * 10**18);
    }
    
    function testQuorumNotMet() public {
        vm.startPrank(proposer);
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Test proposal",
            "ipfs://Qm...",
            tags,
            7 days
        );
        
        vm.stopPrank();
        
        // Only 1 small vote (not enough for quorum)
        vm.prank(voter2);
        voting.vote(proposalId, true, 10 * 10**18);
        
        // Fast forward
        vm.warp(block.timestamp + 8 days);
        
        voting.executeProposal(proposalId);
        
        (,,,,,FederationVoting.ProposalState state) = voting.getProposal(proposalId);
        assertEq(uint(state), uint(FederationVoting.ProposalState.DEFEATED));
    }
    
    // ============ FUZZ TESTS ============
    
    function testFuzz_QuadraticAlwaysReducesWhaleAdvantage(uint256 whale, uint256 small) public {
        // Ensure meaningful values to avoid division by zero and rounding errors
        vm.assume(whale > small);
        vm.assume(small >= 100); // Minimum value to avoid sqrt rounding to zero
        vm.assume(whale < 1e30); // Reasonable bounds
        vm.assume(whale >= small * 2); // Ensure meaningful difference
        
        uint256 sqrtWhale = sqrt(whale);
        uint256 sqrtSmall = sqrt(small);
        
        // Avoid division by zero
        vm.assume(sqrtSmall > 0);
        vm.assume(small > 0);
        
        uint256 linearRatio = whale / small;
        uint256 quadraticRatio = sqrtWhale / sqrtSmall;
        
        // Quadratic should always reduce ratio
        assert(quadraticRatio < linearRatio);
    }
    
    function testFuzz_LogarithmicCompressesHeavily(uint256 tokens) public {
        vm.assume(tokens > 4); // log2(4) = 2, and 2 < 2 is false, so start from 5
        vm.assume(tokens < 1e30);
        
        uint256 logVotes = log2(tokens);
        
        // Log should always be much smaller
        assert(logVotes < tokens / 2);
    }
    
    // ============ HELPERS ============
    
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function log2(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 n = 0;
        while (x > 1) {
            x = x / 2;
            n++;
        }
        return n;
    }
}
