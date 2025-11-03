# 🚀 Quick Start Guide

Guia rápido para começar a trabalhar com os contratos da Constituição 2.0.

## ⚡ Setup em 5 Minutos

### 1. Instalar Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Clonar e Instalar

```bash
cd revolucao-cibernetica/contracts
make install
```

### 3. Compilar

```bash
make build
```

### 4. Testar

```bash
make test
```

Pronto! 🎉

## 📝 Fluxo Básico

### Criar Proposta

```solidity
// 1. Definir tags
ProposalTags memory tags = ProposalTags({
    isProcedural: false,
    isResourceAllocation: true,
    isTechnical: false,
    isEthical: false,
    budgetImpact: 100000 * 10**18,
    requiresExpertise: false
});

// 2. Criar proposta (7 dias de votação)
uint256 proposalId = voting.createProposal(
    "Alocação de Fundos Q1 2025",
    "ipfs://QmXxx...",
    tags,
    7 days
);
```

### Votar

```solidity
// Votar com 1000 tokens
voting.vote(proposalId, true, 1000 * 10**18);
```

### Executar

```solidity
// Após deadline
voting.executeProposal(proposalId);
```

## 🧪 Testar Localmente

```bash
# Terminal 1: Iniciar node local
anvil

# Terminal 2: Deploy
make deploy-local

# Terminal 3: Interagir
cast call <VOTING_ADDRESS> "proposalCount()(uint256)"
```

## 📊 Comandos Úteis

```bash
# Ver ajuda
make help

# Rodar testes com gas
make test-gas

# Coverage
make coverage

# Formatar código
make format

# Deploy testnet
make deploy-testnet

# Verificar tamanhos
make size
```

## 🔐 Segurança Checklist

Antes de deploy mainnet:

- [ ] 3+ auditorias independentes
- [ ] Bug bounty ativo ($500k+)
- [ ] Multi-sig configurado (5-of-9)
- [ ] Timelock de 48h testado
- [ ] Circuit breaker implementado
- [ ] Testnet com 1000+ usuários reais
- [ ] Formal verification completa
- [ ] Seguro on-chain ativo

## 🆘 Troubleshooting

### "Library not found"

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

### "RPC not responding"

```bash
# Adicione RPC URL no .env
cp .env.example .env
# Edite .env com suas keys
```

### "Gas too high"

```bash
# Use optimizer
forge build --optimize --optimizer-runs 200
```

## 📚 Próximos Passos

1. Ler [README.md](README.md) completo
2. Estudar [FederationVoting.sol](FederationVoting.sol)
3. Rodar [testes](test/FederationVoting.t.sol)
4. Ver [documentação HTML](../contracts.html)

---

⚡🌿∅
