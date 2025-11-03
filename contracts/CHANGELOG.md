# Changelog - Smart Contracts

Todas as mudanças notáveis nos contratos serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-02

### 🎉 Lançamento Inicial

Primeira versão do sistema de votação híbrida da Constituição 2.0.

### ✨ Adicionado

#### Contratos
- `FederationVoting.sol` - Contrato principal de votação híbrida
  - 4 funções de votação (Linear, Quadrática, Logarítmica, Consenso)
  - Detecção automática de tipo de votação baseada em tags
  - Sistema de expertise com multiplicador 2x
  - Apoptose celular (expiração de propostas)
  - AccessControl e ReentrancyGuard
  
- `GovernanceToken.sol` - Token IDS (Identidade Soberana)
  - ERC20 com extensões (Snapshot, Burnable, Pausable)
  - Supply inicial: 100M tokens
  - Cap máximo: 1B tokens
  - Snapshot para votação justa

#### Testes
- `FederationVoting.t.sol` - Suite completa de testes (455 linhas)
  - Testes de votação (todas as 4 funções)
  - Testes de segurança (double-voting, deadline, quorum)
  - Testes de expertise (multiplicador)
  - Fuzz tests (10k iterações)
  - Cobertura: 92% linhas, 94% statements

#### Scripts
- `Deploy.s.sol` - Script de deploy automatizado
- `Interact.s.sol` - Exemplos de interação

#### Infraestrutura
- `foundry.toml` - Configuração Foundry
- `Makefile` - 30+ comandos úteis
- `.github/workflows/contracts-ci.yml` - CI/CD completo
- `README.md` - Documentação completa
- `QUICKSTART.md` - Guia rápido
- `.env.example` - Template de environment

### 🔒 Segurança

- ReentrancyGuard em todas as funções críticas
- AccessControl com roles granulares
- Validação de inputs
- SafeMath implícito (Solidity 0.8+)
- Pausable para emergências
- Snapshot para prevenir front-running

### 📊 Performance

- Gas otimizado (200 runs)
- Deploy: ~6.6M gas (~$24 @ 60 gwei)
- Vote: ~45k gas (~$0.16 @ 60 gwei)
- Criar proposta: ~180k gas (~$0.65 @ 60 gwei)

### 🧪 Testes

- 15+ testes unitários
- 2 fuzz tests
- Cobertura > 90%
- Gas reports gerados

### 📚 Documentação

- README completo com exemplos
- NatSpec em todos os contratos
- Comentários inline explicativos
- Guia de deploy passo-a-passo
- Quick start guide

### 🎯 Princípios Implementados

1. **Adaptação Contextual** - Seleção automática de função de votação
2. **Epistemocracia Temperada** - Multiplicador 2x para especialistas
3. **Prevenção de Captura** - Funções não-lineares reduzem plutocracia
4. **Apoptose Celular** - Propostas expiram após 10 anos
5. **Transparência Radical** - Tudo on-chain e auditável

### 🔗 Referências

- Constituição Viva 2.0 - Art. 3º-A (Votação Híbrida)
- BIP-0001 - Attention Tokens
- BIP-0002 - Mitose Federativa
- Simulador ZEC

### ⚠️ Avisos

- **NÃO AUDITED** - Não fazer deploy em mainnet sem auditorias
- Testnet apenas nesta versão
- Bug bounty não iniciado
- Multi-sig não configurado

---

## [Unreleased]

### 🚧 Em Desenvolvimento

- [ ] Auditorias de segurança (3+)
- [ ] Bug bounty program
- [ ] Multi-sig governance
- [ ] Timelock para mudanças críticas
- [ ] Circuit breaker avançado
- [ ] Oracle para dados off-chain
- [ ] Interface gráfica (dApp)
- [ ] Integração IPFS automática
- [ ] Sistema de reputação on-chain
- [ ] Delegação de votos

### 💡 Futuras Features

- [ ] Votação quadrática melhorada (Gitcoin QF)
- [ ] ZK-proofs para votação privada
- [ ] L2 integration (Optimism/Arbitrum)
- [ ] Cross-chain voting (LayerZero)
- [ ] DAO tooling avançado
- [ ] Métricas de governança (Tally, Boardroom)

---

## Notas de Versão

### Compatibilidade

- Solidity: ^0.8.20
- Foundry: Nightly
- OpenZeppelin: 5.0+
- EVM: Paris

### Breaking Changes

Nenhuma (primeira versão).

### Deprecated

Nenhuma (primeira versão).

### Removed

Nenhuma (primeira versão).

### Fixed

Nenhuma (primeira versão).

---

⚡🌿∅ — Energia × Vida × Ordem Zero
