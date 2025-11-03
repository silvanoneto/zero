import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProposalCreated,
  VoteCast,
  ProposalExecuted,
  ExpertVerified,
  ExpertRemoved,
  FederationVoting,
} from "../generated/FederationVoting/FederationVoting";
import {
  Proposal,
  Vote,
  Expert,
  Voter,
  GovernanceStats,
  ProposalTag,
} from "../generated/schema";

// Helper to get or create GovernanceStats
function getOrCreateStats(): GovernanceStats {
  let stats = GovernanceStats.load("global");
  if (!stats) {
    stats = new GovernanceStats("global");
    stats.totalProposals = BigInt.fromI32(0);
    stats.totalVotes = BigInt.fromI32(0);
    stats.totalVoters = BigInt.fromI32(0);
    stats.totalExperts = BigInt.fromI32(0);
    stats.activeProposals = BigInt.fromI32(0);
    stats.executedProposals = BigInt.fromI32(0);
    stats.save();
  }
  return stats;
}

// Helper to get or create Voter
function getOrCreateVoter(address: Bytes): Voter {
  let voter = Voter.load(address);
  if (!voter) {
    voter = new Voter(address);
    voter.address = address;
    voter.voteCount = BigInt.fromI32(0);
    voter.proposalsCreated = BigInt.fromI32(0);
    voter.isExpert = false;
    voter.save();

    // Increment total voters
    let stats = getOrCreateStats();
    stats.totalVoters = stats.totalVoters.plus(BigInt.fromI32(1));
    stats.save();
  }
  return voter;
}

// Handle ProposalCreated event
export function handleProposalCreated(event: ProposalCreated): void {
  // Create Proposal entity
  let proposal = new Proposal(event.params.proposalId.toString());
  proposal.proposalId = event.params.proposalId;
  proposal.title = event.params.title;
  proposal.descriptionCID = event.params.descriptionCID;
  proposal.proposer = event.params.proposer;
  proposal.voteType = mapVoteType(event.params.voteType);
  proposal.votesFor = BigInt.fromI32(0);
  proposal.votesAgainst = BigInt.fromI32(0);
  proposal.votersFor = BigInt.fromI32(0);
  proposal.votersAgainst = BigInt.fromI32(0);
  proposal.state = "Active";
  proposal.createdAt = event.block.timestamp;
  proposal.executedAt = null;

  // Get proposal details from contract
  let contract = FederationVoting.bind(event.address);
  let proposalData = contract.try_getProposalDetails(event.params.proposalId);
  
  if (!proposalData.reverted) {
    proposal.startTime = proposalData.value.value3;
    proposal.endTime = proposalData.value.value4;
    proposal.quorumRequired = proposalData.value.value5;
  }

  // Create ProposalTag entities
  let tags = event.params.tags;
  for (let i = 0; i < tags.length; i++) {
    let tagId = event.params.proposalId.toString() + "-" + i.toString();
    let tag = new ProposalTag(tagId);
    tag.proposal = proposal.id;
    tag.category = tags[i].category;
    tag.expertDomain = tags[i].expertDomain;
    tag.save();
  }

  proposal.save();

  // Update proposer's stats
  let proposer = getOrCreateVoter(event.params.proposer);
  proposer.proposalsCreated = proposer.proposalsCreated.plus(BigInt.fromI32(1));
  proposer.save();

  // Update global stats
  let stats = getOrCreateStats();
  stats.totalProposals = stats.totalProposals.plus(BigInt.fromI32(1));
  stats.activeProposals = stats.activeProposals.plus(BigInt.fromI32(1));
  stats.save();
}

// Handle VoteCast event
export function handleVoteCast(event: VoteCast): void {
  // Create Vote entity
  let voteId = event.params.proposalId.toString() + "-" + event.params.voter.toHexString();
  let vote = new Vote(voteId);
  vote.proposal = event.params.proposalId.toString();
  vote.voter = event.params.voter;
  vote.support = event.params.support;
  vote.weight = event.params.weight;
  vote.timestamp = event.block.timestamp;
  vote.reason = event.params.reason;
  vote.save();

  // Update proposal vote counts
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    if (event.params.support) {
      proposal.votesFor = proposal.votesFor.plus(event.params.weight);
      proposal.votersFor = proposal.votersFor.plus(BigInt.fromI32(1));
    } else {
      proposal.votesAgainst = proposal.votesAgainst.plus(event.params.weight);
      proposal.votersAgainst = proposal.votersAgainst.plus(BigInt.fromI32(1));
    }
    proposal.save();
  }

  // Update voter stats
  let voter = getOrCreateVoter(event.params.voter);
  voter.voteCount = voter.voteCount.plus(BigInt.fromI32(1));
  voter.save();

  // Update global stats
  let stats = getOrCreateStats();
  stats.totalVotes = stats.totalVotes.plus(BigInt.fromI32(1));
  stats.save();
}

// Handle ProposalExecuted event
export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    proposal.state = "Executed";
    proposal.executedAt = event.block.timestamp;
    proposal.save();

    // Update global stats
    let stats = getOrCreateStats();
    stats.activeProposals = stats.activeProposals.minus(BigInt.fromI32(1));
    stats.executedProposals = stats.executedProposals.plus(BigInt.fromI32(1));
    stats.save();
  }
}

// Handle ExpertVerified event
export function handleExpertVerified(event: ExpertVerified): void {
  // Create Expert entity
  let expertId = event.params.expert.toHexString() + "-" + event.params.domain.toString();
  let expert = new Expert(expertId);
  expert.address = event.params.expert;
  expert.domain = event.params.domain;
  expert.verifiedAt = event.block.timestamp;
  expert.isActive = true;
  expert.save();

  // Update voter as expert
  let voter = getOrCreateVoter(event.params.expert);
  voter.isExpert = true;
  voter.save();

  // Update global stats
  let stats = getOrCreateStats();
  stats.totalExperts = stats.totalExperts.plus(BigInt.fromI32(1));
  stats.save();
}

// Handle ExpertRemoved event
export function handleExpertRemoved(event: ExpertRemoved): void {
  let expertId = event.params.expert.toHexString() + "-" + event.params.domain.toString();
  let expert = Expert.load(expertId);
  if (expert) {
    expert.isActive = false;
    expert.save();

    // Check if voter still has other active expert domains
    let voter = Voter.load(event.params.expert);
    if (voter) {
      // This would require querying all Expert entities for this address
      // For simplicity, we keep isExpert as true if they were ever an expert
      voter.save();
    }

    // Update global stats
    let stats = getOrCreateStats();
    stats.totalExperts = stats.totalExperts.minus(BigInt.fromI32(1));
    stats.save();
  }
}

// Helper function to map vote type enum
function mapVoteType(voteType: i32): string {
  if (voteType == 0) return "Linear";
  if (voteType == 1) return "Quadratic";
  if (voteType == 2) return "Logarithmic";
  if (voteType == 3) return "Consensus";
  return "Linear"; // Default
}
