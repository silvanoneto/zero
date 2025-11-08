// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../GovernanceToken.sol";
import "../FederationVoting.sol";

/**
 * @title InteractScript
 * @notice Exemplos de interação com os contratos
 * @dev Uso: forge script script/Interact.s.sol:InteractScript --rpc-url <url>
 */
contract InteractScript is Script {
    
    // Endereços dos contratos (substituir com valores reais)
    address constant TOKEN_ADDRESS = address(0); // Substituir
    address constant VOTING_ADDRESS = address(0); // Substituir
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        GovernanceToken token = GovernanceToken(TOKEN_ADDRESS);
        FederationVoting voting = FederationVoting(VOTING_ADDRESS);
        
        // Exemplo 1: Criar proposta procedural (Linear)
        createProceduralProposal(voting);
        
        // Exemplo 2: Criar proposta de recursos (Quadrática)
        createResourceProposal(voting);
        
        // Exemplo 3: Criar proposta técnica (Logarítmica)
        createTechnicalProposal(voting);
        
        // Exemplo 4: Criar proposta ética (Consenso)
        createEthicalProposal(voting);
        
        vm.stopBroadcast();
    }
    
    function createProceduralProposal(FederationVoting voting) internal {
        console.log("\n=== Creating Procedural Proposal (Linear) ===");
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: true,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Atualizar horario de reunioes",
            "ipfs://QmExample1...",
            tags,
            7 days
        );
        
        console.log("Procedural Proposal ID:", proposalId);
        console.log("Vote Type: LINEAR (1 token = 1 vote)");
    }
    
    function createResourceProposal(FederationVoting voting) internal {
        console.log("\n=== Creating Resource Allocation Proposal (Quadratic) ===");
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: true,
            isTechnical: false,
            isEthical: false,
            budgetImpact: 100000 * 10**18,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Alocacao de Fundos Q1 2025",
            "ipfs://QmExample2...",
            tags,
            14 days
        );
        
        console.log("Resource Proposal ID:", proposalId);
        console.log("Vote Type: QUADRATIC (sqrt(tokens) = votes)");
        console.log("Budget Impact: 100,000 IDS");
    }
    
    function createTechnicalProposal(FederationVoting voting) internal {
        console.log("\n=== Creating Technical Proposal (Logarithmic) ===");
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: true,
            isEthical: false,
            budgetImpact: 0,
            requiresExpertise: true, expertDomain: keccak256("blockchain-consensus")
        });
        
        uint256 proposalId = voting.createProposal(
            "Upgrade do protocolo de consenso",
            "ipfs://QmExample3...",
            tags,
            30 days
        );
        
        console.log("Technical Proposal ID:", proposalId);
        console.log("Vote Type: LOGARITHMIC (log2(tokens) = votes)");
        console.log("Requires Expertise: YES (2x multiplier)");
    }
    
    function createEthicalProposal(FederationVoting voting) internal {
        console.log("\n=== Creating Ethical Proposal (Consensus) ===");
        
        FederationVoting.ProposalTags memory tags = FederationVoting.ProposalTags({
            isProcedural: false,
            isResourceAllocation: false,
            isTechnical: false,
            isEthical: true,
            budgetImpact: 0,
            requiresExpertise: false, expertDomain: bytes32(0)
        });
        
        uint256 proposalId = voting.createProposal(
            "Declaracao de Direitos Digitais",
            "ipfs://QmExample4...",
            tags,
            30 days
        );
        
        console.log("Ethical Proposal ID:", proposalId);
        console.log("Vote Type: CONSENSUS (1 person = 1 vote)");
        console.log("Approval Threshold: 80%");
    }
}

/**
 * @title VoteScript
 * @notice Script para votar em propostas
 */
contract VoteScript is Script {
    
    function run() external {
        uint256 voterPrivateKey = vm.envUint("PRIVATE_KEY");
        address votingAddress = vm.envAddress("FEDERATION_VOTING_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");
        bool support = vm.envBool("SUPPORT"); // true or false
        uint256 tokens = vm.envUint("VOTE_TOKENS");
        
        vm.startBroadcast(voterPrivateKey);
        
        FederationVoting voting = FederationVoting(votingAddress);
        
        console.log("\n=== Voting ===");
        console.log("Proposal ID:", proposalId);
        console.log("Support:", support);
        console.log("Tokens:", tokens);
        
        voting.vote(proposalId, support, tokens);
        
        console.log("Vote cast successfully!");
        
        vm.stopBroadcast();
    }
}

/**
 * @title ExecuteScript
 * @notice Script para executar proposta após votação
 */
contract ExecuteScript is Script {
    
    function run() external {
        uint256 executorPrivateKey = vm.envUint("PRIVATE_KEY");
        address votingAddress = vm.envAddress("FEDERATION_VOTING_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");
        
        vm.startBroadcast(executorPrivateKey);
        
        FederationVoting voting = FederationVoting(votingAddress);
        
        console.log("\n=== Executing Proposal ===");
        console.log("Proposal ID:", proposalId);
        
        voting.executeProposal(proposalId);
        
        (
            ,
            string memory title,
            ,
            uint256 votesFor,
            uint256 votesAgainst,
            FederationVoting.ProposalState state
        ) = voting.getProposal(proposalId);
        
        console.log("Title:", title);
        console.log("Votes For:", votesFor);
        console.log("Votes Against:", votesAgainst);
        console.log("Final State:", uint256(state));
        
        vm.stopBroadcast();
    }
}
