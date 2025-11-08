# Quick Start: Wallet-Token Binding System

**Para desenvolvedores que querem começar rapidamente** 🚀

---

## ⚡ 1 Minuto Setup

```bash
# Clone e compile
cd contracts
forge build

# Rode os testes
forge test --match-contract SovereignCurrencyWalletBindingTest -vv
# ✅ 12/12 testes passando
```

---

## 🎯 Como Funciona (30 segundos)

**Antes:**
- Token SOB era vinculado à **carteira**
- Carteira roubada = tokens roubados
- Sem recuperação possível

**Agora:**
- Token SOB vinculado à **identidade** (ProofOfLife)
- Carteira roubada = tokens auto-destruídos
- Recuperação fácil via guardiões
- Suporte para 5 wallets por pessoa

---

## 🔧 API Essencial

### SovereignCurrency

```solidity
// Vincular wallet à identidade (automático via ProofOfLife/MultiWallet)
sob.linkWalletToIdentity(wallet, identityId);

// Validar tokens de uma wallet
(bool valid, string memory reason) = sob.validateWalletTokens(wallet);

// Migrar tokens entre wallets (automático via MultiWallet)
sob.migrateTokensBetweenWallets(fromWallet, toWallet, amount);

// Ver identidade de uma wallet
bytes32 identityId = sob.getWalletIdentity(wallet);
```

### ProofOfLife

```solidity
// Registra cidadão e vincula automaticamente ao SOB
bytes32 identityId = pol.registerCitizen(citizen, proofHash);
// Auto-link: citizen agora vinculado ao SOB com identityId

// Configurar referência ao SOB (admin, uma vez)
pol.setSovereignCurrency(address(sob));
```

### MultiWalletIdentity

```solidity
// Adicionar nova wallet (vincula automaticamente ao SOB após período)
mwi.requestAddWallet(newWallet, "Label");
// ... esperar 7 dias ...
mwi.executeAddWallet(newWallet);
// Auto-link: newWallet vinculada à mesma identidade no SOB

// Migrar tokens entre suas wallets
mwi.migrateTokens(fromWallet, toWallet, amount);

// Configurar referência ao SOB (admin, uma vez)
mwi.setSovereignCurrency(address(sob));
```

### WalletRecovery

```solidity
// Iniciar recuperação
wr.initiateRecovery(identityId, compromisedWallet, newWallet, amount);
// ... guardiões aprovam ...
// ... esperar 72h ...
wr.executeRecovery(identityId);
// Auto-link + migração: newWallet recebe os tokens

// Configurar referência ao SOB (admin, uma vez)
wr.setSovereignCurrency(address(sob));
```

---

## 📝 Exemplo Completo

```solidity
// Setup (uma vez)
SovereignCurrency sob = new SovereignCurrency();
ProofOfLife pol = new ProofOfLife();
MultiWalletIdentity mwi = new MultiWalletIdentity();

pol.setSovereignCurrency(address(sob));
mwi.setSovereignCurrency(address(sob));

sob.grantRole(sob.VALIDATOR_ROLE(), address(pol));
sob.grantRole(sob.VALIDATOR_ROLE(), address(mwi));

// Uso
bytes32 aliceId = pol.registerCitizen(alice, proof);
// ✅ alice automaticamente vinculada ao SOB

sob.earnCurrency(alice, "Voted", proof);
// ✅ alice tem 100 SOB, originalWallet = alice

mwi.requestAddWallet(aliceMobile, "Mobile");
vm.warp(block.timestamp + 7 days);
mwi.executeAddWallet(aliceMobile);
// ✅ aliceMobile automaticamente vinculada à mesma identidade

vm.prank(alice);
mwi.migrateTokens(alice, aliceMobile, 50 * 1e18);
// ✅ alice: 50 SOB, aliceMobile: 50 SOB (ambas válidas)
```

---

## 🧪 Testar Localmente

```bash
# Teste básico de binding
forge test --match-test testTokensBoundToOriginalWallet -vvv

# Teste de migração
forge test --match-test testMigrateBetweenSameIdentityWallets -vvv

# Teste de roubo (auto-destruição)
forge test --match-test testDestroyInvalidTokens -vvv

# Todos os testes
forge test --match-contract SovereignCurrencyWalletBindingTest
```

---

## 🚨 Cenários Importantes

### ✅ Usuário Legítimo com 2+ Wallets

```solidity
// Alice tem 2 wallets
bytes32 id = pol.registerCitizen(alice, proof);
mwi.executeAddWallet(alice2);  // após período

// Ambas validam como OK
(bool v1,) = sob.validateWalletTokens(alice);   // true
(bool v2,) = sob.validateWalletTokens(alice2);  // true

// Pode migrar entre elas
mwi.migrateTokens(alice, alice2, 50);  // ✅
```

### ❌ Tokens Roubados

```solidity
// Bob rouba wallet de Alice
address stolenWallet = alice;
bytes32 aliceId = sob.getWalletIdentity(alice);
bytes32 bobId = pol.getIdentityOf(bob);

// Bob tenta usar
(bool valid,) = sob.validateWalletTokens(stolenWallet);
// valid = false, reason = "Tokens stolen - different identity"

// Próxima transação: tokens destruídos automaticamente
sob.transfer(bob, 100);  // REVERT + auto-destruct
```

---

## 📚 Documentação Completa

- **Sistema completo:** `/contracts/WALLET_TOKEN_BINDING.md`
- **Integração:** `/contracts/INTEGRATION_COMPLETE.md`
- **Resumo:** `/contracts/INTEGRATION_SUMMARY.md`
- **Testes:** `/contracts/test/SovereignCurrencyWalletBinding.t.sol`

---

## 🎯 Próximo Passo

Leia a documentação completa em:
- `WALLET_TOKEN_BINDING.md` - Arquitetura e design
- `INTEGRATION_COMPLETE.md` - Guia de integração

Ou rode os testes e explore o código! 🚀
