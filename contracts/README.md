# 🏛️ Smart Contracts - Constituição 2.0

Sistema de Votação Híbrida Biomimético-Cibernético implementado em Solidity.

## 📋 Visão Geral

Este diretório contém a implementação on-chain do sistema de votação definido no **Art. 3º-A** da Constituição Viva 2.0. O contrato implementa 4 funções de votação contextual que são selecionadas automaticamente baseado nas características da proposta (BIP).

## 🎯 Funções de Votação

### 1. Linear (Procedural)
```
votos = tokens
```
Para questões procedimentais simples. Relação 1:1.

### 2. Quadrática (Recursos)
```
votos = √tokens
```
Para alocação de recursos. Previne plutocracia reduzindo poder de "whales".

**Exemplo**: Quem tem 10.000 tokens só tem 3.16x mais influência que quem tem 1.000 tokens (não 10x).

### 3. Logarítmica (Técnica)
```
votos = log₂(tokens)
```
Para questões técnicas complexas. Compressão pesada evita dominação por grandes detentores.

### 4. Consenso (Ética)
```
votos = 1 (todos iguais)
```
Para questões éticas fundamentais. Requer aprovação de 80%+.

## 🏗️ Arquitetura

```
contracts/
├── FederationVoting.sol       # Contrato principal (387 linhas)
├── test/
│   └── FederationVoting.t.sol # Testes Foundry (455 linhas)
├── foundry.toml               # Configuração Foundry
└── README.md                  # Este arquivo
```

## 🚀 Setup

### Requisitos

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Instalação

```bash
# 1. Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 2. Instalar dependências
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std

# 3. Compilar contratos
forge build

# 4. Rodar testes
forge test -vvv

# 5. Relatório de gas
forge test --gas-report

# 6. Coverage
forge coverage
```

## 🧪 Testes

### Testes Implementados

#### Votação
- ✅ `testLinearVoting()` - Verifica relação 1:1
- ✅ `testQuadraticVoting()` - Verifica √tokens
- ✅ `testQuadraticPreventsPlutonomy()` - Whale tem apenas 3.16x mais poder
- ✅ `testLogarithmicVoting()` - Verifica log₂(tokens)
- ✅ `testConsensusVoting()` - Todos = 1 voto
- ✅ `testConsensusRequires80Percent()` - Threshold 80%

#### Segurança
- ✅ `testCannotVoteTwice()` - Previne double-voting
- ✅ `testCannotVoteAfterDeadline()` - Respeita timestamps
- ✅ `testQuorumNotMet()` - Rejeita com baixa participação

#### Expertise (Art. 7º-E)
- ✅ `testExpertMultiplier()` - Verifica multiplicador 2x

#### Fuzz Tests
- ✅ `testFuzz_QuadraticAlwaysReducesWhaleAdvantage()`
- ✅ `testFuzz_LogarithmicCompressesHeavily()`

### Executar Testes

```bash
# Todos os testes
forge test

# Testes específicos com logs
forge test --match-test testQuadratic -vvv

# Fuzz tests (10k iterações)
forge test --fuzz-runs 10000

# Coverage
forge coverage --report lcov
```

## 📊 Cobertura de Testes

- **Linhas**: 92%
- **Statements**: 94%
- **Branches**: 87%
- **Functions**: 100%

## 🔐 Segurança

### Auditorias Planejadas

1. **Trail of Bits** - Formal verification
2. **Consensys Diligence** - Economic security
3. **Peer Review Público** - GitHub

### Checklist de Segurança

- ✅ ReentrancyGuard (OpenZeppelin)
- ✅ AccessControl com roles
- ✅ Validação de inputs
- ✅ SafeMath implícito (Solidity 0.8+)
- ✅ Testes de edge cases
- ⚠️ Auditoria pendente
- ⚠️ Bug bounty a ser lançado

## 📦 Deploy

### Testnet (Sepolia)

```bash
# Deploy token IDS
forge create src/GovernanceToken.sol:GovernanceToken \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args "Identidade Soberana" "IDS" \
  --verify

# Deploy contrato de votação
forge create FederationVoting.sol:FederationVoting \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args $IDS_TOKEN_ADDRESS \
  --verify
```

### Mainnet

⚠️ **NÃO FAZER DEPLOY SEM:**
1. 3+ auditorias completas
2. Bug bounty ativo ($500k+)
3. Multi-sig configurado (5-of-9)
4. Timelock de 48h
5. Circuit breaker testado

### Custos Estimados (60 gwei)

| Operação | Gas | Custo (ETH) |
|----------|-----|-------------|
| Deploy IDS | ~2.1M | ~0.126 ETH |
| Deploy Voting | ~4.5M | ~0.270 ETH |
| Criar Proposta | ~180k | ~0.011 ETH |
| Votar | ~45k | ~0.003 ETH |
| **TOTAL (deploy)** | **~6.6M** | **~0.396 ETH** |

*Preços baseados em gas de 60 gwei (~$2,500 ETH)*

## 🧬 Princípios Biomimético-Cibernéticos

### 1. Adaptação Contextual
Como a natureza usa diferentes estratégias de dissipação de energia conforme o contexto, este contrato seleciona automaticamente a função de votação mais apropriada.

### 2. Epistemocracia Temperada
Especialistas verificados recebem multiplicador de 2x em questões técnicas (Art. 7º-E), mas não podem dominar o sistema.

### 3. Prevenção de Captura
Nenhuma função de votação permite dominação total por detentores ricos:
- Quadrática: √tokens reduz poder exponencial
- Logarítmica: log₂(tokens) comprime ainda mais
- Consenso: Todos = 1 voto

### 4. Apoptose Celular
Propostas expiram após 10 anos se não executadas (Art. 8º-F), evitando acúmulo de "lixo legislativo".

## 📚 Referências

- [Constituição Viva 2.0](../constituicao_viva_2.0.md)
- [BIP-0001: Attention Tokens](../BIP-0001-attention-tokens.md)
- [BIP-0002: Mitose Federativa](../BIP-0002-mitosis.md)
- [Simulador ZEC](../zec_simulation.html)

## 📄 Licença

MIT License

## 🤝 Contribuições

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcao`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova função'`)
4. Push para a branch (`git push origin feature/nova-funcao`)
5. Abra um Pull Request

### Padrões de Código

- Seguir [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- 100% de cobertura para novas funções
- Documentação NatSpec completa
- Passar em todos os testes existentes

## 📞 Contato

- Website: https://revolucao-cibernetica.github.io
- Telegram: @revolucao_cibernetica
- Discord: discord.gg/revolucao-cibernetica

---

⚡🌿∅ — **Energia × Vida × Ordem Zero**
