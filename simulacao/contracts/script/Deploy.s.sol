// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../GovernanceToken.sol";
import "../FederationVoting.sol";

/**
 * @title DeployScript
 * @notice Script para deploy do sistema completo
 * @dev Uso: forge script script/Deploy.s.sol:DeployScript --rpc-url <url> --broadcast
 */
contract DeployScript is Script {
    
    function run() external {
        // Pega private key do ambiente
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy do token IDS
        console.log("Deploying GovernanceToken...");
        GovernanceToken token = new GovernanceToken();
        console.log("GovernanceToken deployed at:", address(token));
        
        // 2. Deploy do contrato de votação
        console.log("Deploying FederationVoting...");
        FederationVoting voting = new FederationVoting(address(token));
        console.log("FederationVoting deployed at:", address(voting));
        
        // 3. Log de informações importantes
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", block.chainid);
        console.log("Deployer:", msg.sender);
        console.log("GovernanceToken:", address(token));
        console.log("FederationVoting:", address(voting));
        console.log("Initial Supply:", token.totalSupply() / 10**18, "IDS");
        console.log("========================\n");
        
        vm.stopBroadcast();
    }
}
