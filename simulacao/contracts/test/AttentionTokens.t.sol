// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../AttentionTokens.sol";
import "../GovernanceToken.sol";

/**
 * @title AttentionTokensTest
 * @notice Testes para o sistema de Tokens de Atenção (Art. 6º-D)
 */
contract AttentionTokensTest is Test {
    
    AttentionTokens public attentionTokens;
    GovernanceToken public governanceToken;
    
    address public admin = address(1);
    address public citizen1 = address(2);
    address public citizen2 = address(3);
    address public citizen3 = address(4);
    address public votingContract = address(5);
    
    uint256 constant MONTHLY_ALLOCATION = 100;
    uint256 constant ALLOCATION_PERIOD = 30 days;
    uint256 constant FAST_TRACK_THRESHOLD = 5000;
    uint256 constant SPAM_THRESHOLD = 100;
    uint256 constant SPAM_WINDOW = 48 hours;
    
    event MonthlyAllocation(address indexed citizen, uint256 amount, uint256 expirationDate);
    event AttentionAllocated(address indexed citizen, uint256 indexed proposalId, uint256 amount);
    event FastTrackAchieved(uint256 indexed proposalId, uint256 totalTokens);
    event SpamFlagged(uint256 indexed proposalId, uint256 totalTokens);
    event CashbackAwarded(address indexed citizen, uint256 indexed proposalId, uint256 amount);
    
    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy tokens
        governanceToken = new GovernanceToken();
        attentionTokens = new AttentionTokens(address(governanceToken));
        
        // Configure voting contract role
        attentionTokens.setVotingContract(votingContract);
        
        // Register citizens
        attentionTokens.registerCitizen(citizen1);
        attentionTokens.registerCitizen(citizen2);
        attentionTokens.registerCitizen(citizen3);
        
        vm.stopPrank();
    }
    
    // ============ REGISTRATION TESTS ============
    
    function test_RegisterCitizen() public {
        address newCitizen = address(10);
        
        vm.prank(admin);
        attentionTokens.registerCitizen(newCitizen);
        
        (uint256 balance, uint256 expiration, uint256 lifetime) = 
            attentionTokens.getCitizenAttention(newCitizen);
        
        assertEq(balance, MONTHLY_ALLOCATION, "Should receive 100 tokens");
        assertGt(expiration, block.timestamp, "Expiration should be in future");
        assertEq(lifetime, 0, "Lifetime allocated should be 0");
    }
    
    function test_CannotRegisterTwice() public {
        vm.prank(admin);
        vm.expectRevert("Already registered");
        attentionTokens.registerCitizen(citizen1);
    }
    
    function test_CannotRegisterZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Invalid address");
        attentionTokens.registerCitizen(address(0));
    }
    
    // ============ MONTHLY ALLOCATION TESTS ============
    
    function test_ClaimMonthlyAllocation() public {
        // Fast forward 30 days
        vm.warp(block.timestamp + ALLOCATION_PERIOD);
        
        vm.expectEmit(true, false, false, false);
        emit MonthlyAllocation(citizen1, MONTHLY_ALLOCATION, block.timestamp + ALLOCATION_PERIOD);
        
        vm.prank(citizen1);
        attentionTokens.claimMonthlyAllocation(citizen1);
        
        (uint256 balance,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balance, MONTHLY_ALLOCATION, "Should reset to 100 tokens");
    }
    
    function test_CannotClaimTooSoon() public {
        vm.warp(block.timestamp + 15 days); // Only 15 days
        
        vm.prank(citizen1);
        vm.expectRevert("Too soon to claim");
        attentionTokens.claimMonthlyAllocation(citizen1);
    }
    
    function test_UnusedTokensExpire() public {
        // Allocate some tokens
        vm.prank(citizen1);
        attentionTokens.allocateAttention(1, 50);
        
        (uint256 balanceBefore,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balanceBefore, 50, "Should have 50 tokens left");
        
        // Fast forward 30 days and claim new allocation
        vm.warp(block.timestamp + ALLOCATION_PERIOD);
        
        vm.prank(citizen1);
        attentionTokens.claimMonthlyAllocation(citizen1);
        
        (uint256 balanceAfter,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balanceAfter, MONTHLY_ALLOCATION, "Old tokens should expire");
    }
    
    // ============ ALLOCATION TESTS ============
    
    function test_AllocateAttention() public {
        uint256 proposalId = 1;
        uint256 amount = 25;
        
        vm.expectEmit(true, true, false, true);
        emit AttentionAllocated(citizen1, proposalId, amount);
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, amount);
        
        // Check citizen balance
        (uint256 balance,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balance, MONTHLY_ALLOCATION - amount, "Balance should decrease");
        
        // Check proposal attention
        (uint256 totalTokens, uint256 uniqueAllocators,,) = 
            attentionTokens.getProposalAttention(proposalId);
        assertEq(totalTokens, amount, "Proposal should receive tokens");
        assertEq(uniqueAllocators, 1, "Should have 1 unique allocator");
    }
    
    function test_MultipleAllocations() public {
        uint256 proposalId = 1;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 30);
        
        vm.prank(citizen2);
        attentionTokens.allocateAttention(proposalId, 40);
        
        vm.prank(citizen3);
        attentionTokens.allocateAttention(proposalId, 50);
        
        (uint256 totalTokens, uint256 uniqueAllocators,,) = 
            attentionTokens.getProposalAttention(proposalId);
        
        assertEq(totalTokens, 120, "Should sum all allocations");
        assertEq(uniqueAllocators, 3, "Should have 3 unique allocators");
    }
    
    function test_CannotAllocateBelowMinimum() public {
        vm.prank(citizen1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttentionTokens.InvalidAllocationAmount.selector,
                0
            )
        );
        attentionTokens.allocateAttention(1, 0);
    }
    
    function test_CannotAllocateAboveMaximum() public {
        vm.prank(citizen1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttentionTokens.InvalidAllocationAmount.selector,
                51
            )
        );
        attentionTokens.allocateAttention(1, 51);
    }
    
    function test_CannotAllocateInsufficientBalance() public {
        // First allocate 51 tokens (leaving 49)
        vm.prank(citizen1);
        attentionTokens.allocateAttention(1, 50); // Use 50 tokens
        
        // Now try to allocate another 50 (only 50 left, which is exactly the balance)
        // This should work
        vm.prank(citizen1);
        attentionTokens.allocateAttention(2, 50); // This works
        
        // Now balance is 0, try to allocate 1 more
        vm.prank(citizen1);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttentionTokens.InsufficientBalance.selector,
                0,  // balance left
                1   // trying to allocate
            )
        );
        attentionTokens.allocateAttention(3, 1);
    }
    
    function test_CannotAllocateAfterExpiration() public {
        // Fast forward past expiration
        vm.warp(block.timestamp + ALLOCATION_PERIOD + 1);
        
        vm.prank(citizen1);
        vm.expectRevert(AttentionTokens.TokensAlreadyExpired.selector);
        attentionTokens.allocateAttention(1, 10);
    }
    
    // ============ REALLOCATION TESTS ============
    
    function test_ReallocateAttention() public {
        uint256 proposal1 = 1;
        uint256 proposal2 = 2;
        
        // Initial allocation
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposal1, 50);
        
        // Reallocate 30 tokens to proposal 2
        vm.prank(citizen1);
        attentionTokens.reallocateAttention(proposal1, proposal2, 30);
        
        // Check proposal 1
        (uint256 tokens1, uint256 allocators1,,) = 
            attentionTokens.getProposalAttention(proposal1);
        assertEq(tokens1, 20, "Proposal 1 should have 20 tokens");
        assertEq(allocators1, 1, "Proposal 1 should still have allocator");
        
        // Check proposal 2
        (uint256 tokens2, uint256 allocators2,,) = 
            attentionTokens.getProposalAttention(proposal2);
        assertEq(tokens2, 30, "Proposal 2 should have 30 tokens");
        assertEq(allocators2, 1, "Proposal 2 should have 1 allocator");
    }
    
    function test_ReallocateAll() public {
        uint256 proposal1 = 1;
        uint256 proposal2 = 2;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposal1, 50);
        
        vm.prank(citizen1);
        attentionTokens.reallocateAttention(proposal1, proposal2, 50);
        
        (uint256 tokens1, uint256 allocators1,,) = 
            attentionTokens.getProposalAttention(proposal1);
        assertEq(tokens1, 0, "Proposal 1 should have 0 tokens");
        assertEq(allocators1, 0, "Proposal 1 should have 0 allocators");
    }
    
    // ============ FAST-TRACK TESTS ============
    
    function test_FastTrackThreshold() public {
        uint256 proposalId = 1;
        
        // Need 5000 tokens, allocate in batches
        // Create 100 citizens, each allocating 50 tokens
        for (uint256 i = 0; i < 100; i++) {
            address citizen = address(uint160(100 + i));
            
            vm.prank(admin);
            attentionTokens.registerCitizen(citizen);
            
            vm.prank(citizen);
            attentionTokens.allocateAttention(proposalId, 50);
        }
        
        (uint256 totalTokens,, bool isFastTrack,) = 
            attentionTokens.getProposalAttention(proposalId);
        
        assertGe(totalTokens, FAST_TRACK_THRESHOLD, "Should reach fast-track threshold");
        assertTrue(isFastTrack, "Should be marked as fast-track");
    }
    
    function test_FastTrackEvent() public {
        uint256 proposalId = 1;
        
        // Allocate 4950 tokens (just below threshold)
        for (uint256 i = 0; i < 99; i++) {
            address citizen = address(uint160(100 + i));
            vm.prank(admin);
            attentionTokens.registerCitizen(citizen);
            vm.prank(citizen);
            attentionTokens.allocateAttention(proposalId, 50);
        }
        
        // Last allocation should trigger fast-track
        address lastCitizen = address(200);
        vm.prank(admin);
        attentionTokens.registerCitizen(lastCitizen);
        
        vm.expectEmit(true, false, false, false);
        emit FastTrackAchieved(proposalId, FAST_TRACK_THRESHOLD);
        
        vm.prank(lastCitizen);
        attentionTokens.allocateAttention(proposalId, 50);
    }
    
    // ============ SPAM DETECTION TESTS ============
    
    function test_SpamDetection() public {
        uint256 proposalId = 1;
        
        // Allocate less than threshold
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        // Fast forward past spam window
        vm.warp(block.timestamp + SPAM_WINDOW + 1);
        
        // Try to allocate again (this will check spam)
        vm.prank(citizen2);
        attentionTokens.allocateAttention(proposalId, 20);
        
        (,,, bool isSpam) = attentionTokens.getProposalAttention(proposalId);
        assertTrue(isSpam, "Should be marked as spam");
    }
    
    // ============ CASHBACK TESTS ============
    
    function test_AwardCashback() public {
        uint256 proposalId = 1;
        
        // Allocate tokens
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        vm.prank(citizen2);
        attentionTokens.allocateAttention(proposalId, 30);
        
        // Award cashback to winners
        address[] memory winners = new address[](2);
        winners[0] = citizen1;
        winners[1] = citizen2;
        
        vm.prank(votingContract);
        attentionTokens.awardCashback(proposalId, winners);
        
        // Check balances (30% cashback)
        (uint256 balance1,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balance1, 50 + 15, "Citizen1 should receive 15 tokens back (30% of 50)");
        
        (uint256 balance2,,) = attentionTokens.getCitizenAttention(citizen2);
        assertEq(balance2, 70 + 9, "Citizen2 should receive 9 tokens back (30% of 30)");
    }
    
    function test_CashbackReputation() public {
        uint256 proposalId = 1;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        address[] memory winners = new address[](1);
        winners[0] = citizen1;
        
        vm.prank(votingContract);
        attentionTokens.awardCashback(proposalId, winners);
        
        (uint256 totalEarned, uint256 reputationScore, uint256 winRate) = 
            attentionTokens.getReputation(citizen1);
        
        assertEq(totalEarned, 15, "Should have earned 15 tokens");
        assertEq(reputationScore, 1000, "Should have perfect score (1000/1000)");
        assertEq(winRate, 100, "Should have 100% win rate");
    }
    
    function test_RecordLosingVote() public {
        uint256 proposalId = 1;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        address[] memory losers = new address[](1);
        losers[0] = citizen1;
        
        vm.prank(votingContract);
        attentionTokens.recordLosingVote(proposalId, losers);
        
        (uint256 totalEarned, uint256 reputationScore, uint256 winRate) = 
            attentionTokens.getReputation(citizen1);
        
        assertEq(totalEarned, 0, "Should have earned nothing");
        assertEq(reputationScore, 0, "Should have 0 score (0/1000)");
        assertEq(winRate, 0, "Should have 0% win rate");
    }
    
    // ============ PRIORITY SCORE TESTS ============
    
    function test_CalculatePriorityScore() public {
        uint256 proposalId = 1;
        
        // Allocate tokens
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        vm.prank(citizen2);
        attentionTokens.allocateAttention(proposalId, 30);
        
        uint256 score = attentionTokens.calculatePriorityScore(proposalId);
        
        assertGt(score, 0, "Score should be greater than 0");
        assertLe(score, 10000, "Score should not exceed 10000");
    }
    
    function test_PriorityScoreDecay() public {
        uint256 proposalId = 1;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        uint256 scoreInitial = attentionTokens.calculatePriorityScore(proposalId);
        
        // Fast forward 15 days
        vm.warp(block.timestamp + 15 days);
        
        uint256 scoreAfter = attentionTokens.calculatePriorityScore(proposalId);
        
        assertLt(scoreAfter, scoreInitial, "Score should decay over time");
    }
    
    // ============ TOP PROPOSALS TESTS ============
    
    function test_TopProposalsUpdated() public {
        // Create multiple proposals with different attention levels
        vm.prank(citizen1);
        attentionTokens.allocateAttention(1, 50);
        
        vm.prank(citizen2);
        attentionTokens.allocateAttention(2, 40);
        
        vm.prank(citizen3);
        attentionTokens.allocateAttention(3, 30);
        
        uint256[] memory topProposals = attentionTokens.getTopProposals();
        
        assertGe(topProposals.length, 3, "Should have at least 3 proposals");
        
        // Check ordering (highest score first)
        if (topProposals.length >= 2) {
            uint256 score1 = attentionTokens.calculatePriorityScore(topProposals[0]);
            uint256 score2 = attentionTokens.calculatePriorityScore(topProposals[1]);
            assertGe(score1, score2, "Should be sorted by score");
        }
    }
    
    function test_TopProposalsLimit() public {
        // Register enough citizens
        for (uint256 i = 0; i < 25; i++) {
            address citizen = address(uint160(100 + i));
            vm.prank(admin);
            attentionTokens.registerCitizen(citizen);
        }
        
        // Create 25 proposals (more than 20 limit)
        for (uint256 i = 1; i <= 25; i++) {
            address citizen = address(uint160(100 + i - 1));
            vm.prank(citizen);
            attentionTokens.allocateAttention(i, 10);
        }
        
        uint256[] memory topProposals = attentionTokens.getTopProposals();
        
        assertLe(topProposals.length, 20, "Should not exceed 20 proposals");
    }
    
    // ============ ADMIN TESTS ============
    
    function test_SetVotingContract() public {
        address newVoting = address(100);
        
        vm.prank(admin);
        attentionTokens.setVotingContract(newVoting);
        
        // Should now have permission
        assertTrue(
            attentionTokens.hasRole(
                attentionTokens.VOTING_CONTRACT_ROLE(),
                newVoting
            ),
            "Should have voting contract role"
        );
    }
    
    function test_RemoveFromTop() public {
        uint256 proposalId = 1;
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        vm.prank(admin);
        attentionTokens.removeFromTop(proposalId);
        
        assertFalse(
            attentionTokens.isInTop(proposalId),
            "Should be removed from top"
        );
    }
    
    // ============ INTEGRATION TESTS ============
    
    function test_FullLifecycle() public {
        uint256 proposalId = 1;
        
        // 1. Citizens allocate attention
        vm.prank(citizen1);
        attentionTokens.allocateAttention(proposalId, 50);
        
        vm.prank(citizen2);
        attentionTokens.allocateAttention(proposalId, 30);
        
        vm.prank(citizen3);
        attentionTokens.allocateAttention(proposalId, 20);
        
        // 2. Check proposal is in top
        uint256[] memory topProposals = attentionTokens.getTopProposals();
        bool found = false;
        for (uint256 i = 0; i < topProposals.length; i++) {
            if (topProposals[i] == proposalId) {
                found = true;
                break;
            }
        }
        assertTrue(found, "Proposal should be in top");
        
        // 3. Award cashback to winners
        address[] memory winners = new address[](2);
        winners[0] = citizen1;
        winners[1] = citizen2;
        
        address[] memory losers = new address[](1);
        losers[0] = citizen3;
        
        vm.prank(votingContract);
        attentionTokens.awardCashback(proposalId, winners);
        
        vm.prank(votingContract);
        attentionTokens.recordLosingVote(proposalId, losers);
        
        // 4. Check reputation
        (,, uint256 winRate1) = attentionTokens.getReputation(citizen1);
        assertEq(winRate1, 100, "Winner should have 100% win rate");
        
        (,, uint256 winRate3) = attentionTokens.getReputation(citizen3);
        assertEq(winRate3, 0, "Loser should have 0% win rate");
    }
    
    // ============ FUZZ TESTS ============
    
    function testFuzz_AllocateAttention(uint256 amount) public {
        amount = bound(amount, 1, 50); // Valid range
        
        vm.prank(citizen1);
        attentionTokens.allocateAttention(1, amount);
        
        (uint256 balance,,) = attentionTokens.getCitizenAttention(citizen1);
        assertEq(balance, MONTHLY_ALLOCATION - amount, "Balance mismatch");
    }
    
    function testFuzz_MultipleProposals(uint8 numProposals) public {
        numProposals = uint8(bound(numProposals, 1, 10)); // Limit to 10 to avoid running out of tokens
        
        uint256 tokensPerProposal = MONTHLY_ALLOCATION / numProposals;
        if (tokensPerProposal == 0) tokensPerProposal = 1;
        if (tokensPerProposal > 50) tokensPerProposal = 50; // Respect MAX_ALLOCATION
        
        vm.startPrank(citizen1);
        uint256 totalAllocated = 0;
        for (uint256 i = 1; i <= numProposals && totalAllocated + tokensPerProposal <= MONTHLY_ALLOCATION; i++) {
            attentionTokens.allocateAttention(i, tokensPerProposal);
            totalAllocated += tokensPerProposal;
        }
        vm.stopPrank();
        
        (uint256 balance,,) = attentionTokens.getCitizenAttention(citizen1);
        assertLe(balance, MONTHLY_ALLOCATION, "Should not exceed initial allocation");
    }
}
