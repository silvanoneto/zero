// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../GovernanceToken.sol";
import "../FederationVoting.sol";
import "../ProofOfLife.sol";
import "../MultiWalletIdentity.sol";
import "../FraudDetection.sol";
import "../WalletRecovery.sol";
import "../SovereignCurrency.sol";
import "../SovereignWallet.sol";

/**
 * @title DeployAllScript
 * @notice Script completo para deploy de todos os contratos (Governança + Segurança)
 * @dev Uso: forge script script/DeployAll.s.sol:DeployAllScript --rpc-url <url> --broadcast
 */
contract DeployAllScript is Script {
    
    function run() external {
        // Pega private key do ambiente
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("\n=== STARTING DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Network Chain ID:", block.chainid);
        console.log("===========================\n");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ===== GOVERNANÇA =====
        console.log("1/8 Deploying GovernanceToken (IDS)...");
        GovernanceToken token = new GovernanceToken();
        console.log("    -> GovernanceToken deployed at:", address(token));
        
        console.log("\n2/8 Deploying FederationVoting...");
        FederationVoting voting = new FederationVoting(address(token));
        console.log("    -> FederationVoting deployed at:", address(voting));
        
        // ===== CAMADA 1: PROVA DE VIDA =====
        console.log("\n3/8 Deploying ProofOfLife...");
        ProofOfLife proofOfLife = new ProofOfLife();
        console.log("    -> ProofOfLife deployed at:", address(proofOfLife));
        
        // ===== CAMADA 2: MULTI-WALLET =====
        console.log("\n4/8 Deploying MultiWalletIdentity...");
        MultiWalletIdentity multiWallet = new MultiWalletIdentity();
        console.log("    -> MultiWalletIdentity deployed at:", address(multiWallet));
        
        // ===== CAMADA 3: DETECÇÃO DE FRAUDE =====
        console.log("\n5/8 Deploying FraudDetection...");
        FraudDetection fraudDetection = new FraudDetection();
        console.log("    -> FraudDetection deployed at:", address(fraudDetection));
        
        // ===== CAMADA 4: RECUPERAÇÃO =====
        console.log("\n6/8 Deploying WalletRecovery...");
        WalletRecovery recovery = new WalletRecovery();
        console.log("    -> WalletRecovery deployed at:", address(recovery));
        
        // ===== CAMADA 5: TOKEN SOBERANO =====
        console.log("\n7/8 Deploying SovereignCurrency (SOB)...");
        SovereignCurrency sob = new SovereignCurrency();
        console.log("    -> SovereignCurrency deployed at:", address(sob));
        
        // ===== INTEGRAÇÃO: CARTEIRA SOBERANA =====
        console.log("\n8/8 Deploying SovereignWallet (Integration)...");
        SovereignWallet wallet = new SovereignWallet(
            address(proofOfLife),
            address(multiWallet),
            address(fraudDetection),
            address(recovery),
            address(sob)
        );
        console.log("    -> SovereignWallet deployed at:", address(wallet));
        
        // Configurar permissões
        console.log("\n=== CONFIGURING PERMISSIONS ===");
        
        // SovereignCurrency não usa roles tradicionais do OpenZeppelin
        // O contrato já tem mecanismos próprios de controle
        console.log("No additional permissions needed - contracts are self-contained");
        console.log("Permissions configured!");
        
        vm.stopBroadcast();
        
        // ===== RESUMO FINAL =====
        console.log("\n");
        console.log("====================================");
        console.log("===   DEPLOYMENT SUCCESSFUL!     ===");
        console.log("====================================");
        console.log("");
        console.log("Network Chain ID:", block.chainid);
        console.log("Deployer Address:", deployer);
        console.log("");
        console.log("--- GOVERNANCE CONTRACTS ---");
        console.log("GovernanceToken (IDS):", address(token));
        console.log("FederationVoting:    ", address(voting));
        console.log("");
        console.log("--- SECURITY LAYER CONTRACTS ---");
        console.log("ProofOfLife:         ", address(proofOfLife));
        console.log("MultiWalletIdentity: ", address(multiWallet));
        console.log("FraudDetection:      ", address(fraudDetection));
        console.log("WalletRecovery:      ", address(recovery));
        console.log("SovereignCurrency:   ", address(sob));
        console.log("SovereignWallet:     ", address(wallet));
        console.log("");
        console.log("--- TOKEN INFORMATION ---");
        console.log("IDS Total Supply:", token.totalSupply() / 10**18, "IDS");
        console.log("IDS Decimals:", token.decimals());
        console.log("SOB Total Supply:", sob.totalSupply() / 10**18, "SOB");
        console.log("");
        console.log("====================================");
        console.log("");
        
        // Salvar endereços em arquivo JSON para o frontend
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "contracts": {\n',
            '    "GovernanceToken": "', vm.toString(address(token)), '",\n',
            '    "FederationVoting": "', vm.toString(address(voting)), '",\n',
            '    "ProofOfLife": "', vm.toString(address(proofOfLife)), '",\n',
            '    "MultiWalletIdentity": "', vm.toString(address(multiWallet)), '",\n',
            '    "FraudDetection": "', vm.toString(address(fraudDetection)), '",\n',
            '    "WalletRecovery": "', vm.toString(address(recovery)), '",\n',
            '    "SovereignCurrency": "', vm.toString(address(sob)), '",\n',
            '    "SovereignWallet": "', vm.toString(address(wallet)), '"\n',
            '  }\n',
            '}\n'
        ));
        
        vm.writeFile("deployment-addresses.json", json);
        console.log("Addresses saved to: deployment-addresses.json");
        console.log("");
    }
}
