# BIP-0003: Moeda Soberana (SOB) - Sistema de Crédito Interno

**Status:** Draft  
**Tipo:** Core/Economic  
**Autor(es):** @revolucao-cibernetica  
**Criado:** 2025-11-02  
**Votação:** Consenso (mudança fundamental)  
**Tags:** `governance`, `economy`, `soulbound`, `proof-of-participation`

---

## 📋 Resumo Executivo

Criar uma **moeda interna não-transferível** (SOBERANA - SOB) baseada em **Proof of Participation**, que substitui o uso de ETH/tokens externos no sistema de votação.

**PROBLEMA CRÍTICO:** Qualquer pessoa com carteira grande de ETH pode comprar tokens IDS e dominar a governança, quebrando todo o sistema democrático.

**SOLUÇÃO:** Moeda soulbound que só pode ser ganha por contribuição dentro do sistema, não por capital externo.

---

## 🎯 Problema

### Estado Atual - VULNERABILIDADE CRÍTICA

```
┌─────────────────────────────────────────┐
│  ATAQUE DE PLUTOCRATA                   │
├─────────────────────────────────────────┤
│  1. Bilionário tem 1000 ETH             │
│  2. Compra 10 milhões de tokens IDS     │
│  3. Domina TODAS as votações            │
│  4. Sistema democrático colapsado ❌     │
└─────────────────────────────────────────┘
```

### Impactos Catastróficos

- ❌ **Captura plutocrática**: Ricos dominam governança
- ❌ **Ataque Sybil**: Comprar múltiplas identidades
- ❌ **Desigualdade exponencial**: Quem tem mais, vota mais
- ❌ **Perda de legitimidade**: Sistema deixa de ser democrático
- ❌ **Êxodo da comunidade**: Participantes legítimos abandonam

### Exemplo Real

```
Votação para reduzir impostos sobre ricos:
├─ Bilionário A: 5.000.000 votos (comprou tokens)
├─ Bilionário B: 3.000.000 votos (comprou tokens)
└─ 10.000 cidadãos comuns: 100.000 votos total

Resultado: Aprovado com 98.8% (dominação total)
```

---

## 💡 Solução: Moeda Soberana (SOB)

### Princípios Fundamentais

#### 1. **Não-Transferível (Soulbound)**
```solidity
// NÃO TEM função transfer()
// NÃO pode ser enviada para outros
// NÃO pode ser comprada/vendida
// NÃO pode ser trocada por ETH

❌ function transfer(address to, uint256 amount) 
   // Esta função NÃO EXISTE no contrato
```

#### 2. **Proof of Participation**
```
SOB só pode ser ganha fazendo coisas úteis:

┌──────────────────────┬──────────────┐
│ Atividade            │ Recompensa   │
├──────────────────────┼──────────────┤
│ Criar proposta       │ 100 SOB      │
│ Votar em proposta    │ 10 SOB       │
│ Validar contribuição │ 50 SOB       │
│ Contribuição aceita  │ 200 SOB      │
│ Revisar código       │ 30 SOB       │
│ Escrever docs        │ 40 SOB       │
└──────────────────────┴──────────────┘
```

#### 3. **Decaimento por Inatividade**
```python
# Inspirado em sistemas biológicos
# Músculos atrofiam sem uso
# Conhecimento é esquecido sem prática

def apply_decay(citizen):
    inactive_days = now() - citizen.last_activity
    
    if inactive_days >= 90:  # 3 meses
        decay = citizen.balance * 0.01 * (inactive_days / 30)
        citizen.balance -= decay
```

**Razão:** Evita acúmulo passivo. Poder político requer participação ativa.

#### 4. **Agnóstico de Blockchain**
```
┌──────────────────────────────────────────┐
│  ONDE PODE FUNCIONAR                     │
├──────────────────────────────────────────┤
│  ✅ Ethereum                             │
│  ✅ Polygon                              │
│  ✅ Arbitrum                             │
│  ✅ Sistema off-chain (IPFS + assinaturas) │
│  ✅ Banco de dados local (SQLite)        │
│  ✅ Arquivo JSON no celular              │
└──────────────────────────────────────────┘
```

**Como?** Sistema usa cryptografia de chave pública, não depende de blockchain específica.

---

## 📊 Mecânica Completa

### 1. Distribuição Inicial

```solidity
// TODOS começam com 0 SOB
// Não existe "pre-mine"
// Não existe "airdrop inicial"
// Não existe "founder tokens"

initialSupply = 0;  // Verdadeira descentralização
```

### 2. Ganhando Moeda

```javascript
// Backend valida ação off-chain
async function validateAction(userId, action) {
  const proof = {
    action: action.type,
    user: userId,
    timestamp: Date.now(),
    evidence: action.ipfsCid,  // Prova no IPFS
  };
  
  // Validador multi-sig assina
  const signature = await validators.sign(proof);
  
  // Contrato distribui recompensa
  await sovereignCurrency.earnCurrency(
    userId,
    action.type,
    hashProof(proof)
  );
}
```

### 3. Usando na Votação

```solidity
function vote(uint256 proposalId, bool support) external {
    uint256 votingPower = sovereignCurrency.balanceOf(msg.sender);
    
    // Aplica função de votação (quadrática, etc)
    uint256 effectiveVotes = sqrt(votingPower);
    
    _castVote(proposalId, support, effectiveVotes);
}
```

### 4. Checkpoints para Histórico

```
Timeline do Cidadão X:

T0: 0 SOB
T1: Criou proposta → 100 SOB
T2: Votou 5x → 150 SOB
T3: Contribuiu código → 350 SOB
T4: 60 dias inativo → 340 SOB (decay)
T5: Voltou ativo → checkpoint preservado
```

**Uso:** Votação usa saldo no momento da proposta (evita manipulação).

---

## 🔐 Segurança

### Vetores de Ataque Mitigados

| Ataque | Mitigação |
|--------|-----------|
| **Comprar votos** | ❌ Impossível - token não-transferível |
| **Conta falsa (Sybil)** | Requer IDS biométrico + histórico |
| **Acumular passivo** | Decaimento por inatividade |
| **Bot farming** | Validação humana + CAPTCHA |
| **Conluio coordenado** | Análise de padrões suspeitos |
| **51% attack** | Sem mineração, sem problema |

### Sistema de Validação

```
┌──────────────────────────────────────────┐
│  MULTI-SIG VALIDATOR                     │
├──────────────────────────────────────────┤
│  5 validadores (3 de 5 requeridos)      │
│  Eleitos pela comunidade a cada 6 meses │
│  Verificam provas off-chain              │
│  Auditoria pública no IPFS               │
└──────────────────────────────────────────┘
```

---

## 📈 Implementação

### Fase 1: MVP (Mês 1-2)

- [ ] Deploy do contrato `SovereignCurrency.sol`
- [ ] Sistema de validadores multi-sig
- [ ] API para registrar atividades
- [ ] Dashboard mostrando saldo SOB

### Fase 2: Integração (Mês 3-4)

- [ ] Migrar votação de IDS para SOB
- [ ] Sistema de checkpoints funcionando
- [ ] Decaimento automático implementado
- [ ] Exportação/importação off-chain

### Fase 3: Expansão (Mês 5-6)

- [ ] Mais tipos de atividades remuneradas
- [ ] Reputação on-chain
- [ ] Badges NFT por conquistas
- [ ] Sistema de mentoria (mentores ganham SOB)

### Fase 4: Descentralização Total (Mês 7+)

- [ ] Validadores distribuídos globalmente
- [ ] Versão off-chain funcionando sem blockchain
- [ ] App mobile para ver saldo local
- [ ] Sincronização P2P entre nós

---

## 💰 Tokenomics

### Supply Dinâmico

```
Supply = Σ(atividades) - Σ(decaimento)

Não existe cap máximo
Não existe inflação fixa
Supply se adapta à participação
```

### Distribuição por Categoria (estimado)

```
40% - Votação e governança
30% - Contribuições técnicas  
20% - Documentação e educação
10% - Validação e curadoria
```

### Prevenção de Inflação

```python
# Se participação aumenta muito rápido
if monthly_supply_growth > 50%:
    reduce_rewards_by(20%)
    
# Se comunidade está inativa
if monthly_supply_growth < 5%:
    increase_rewards_by(10%)
```

---

## 🌍 Agnóstico de Blockchain

### Como Funciona Off-Chain

```javascript
// 1. Estado local (JSON no dispositivo)
const localState = {
  address: "0x123...",
  balance: 350,
  activities: [...],
  lastSync: "2025-11-02T10:30:00Z"
};

// 2. Sincronizar com validadores
async function sync() {
  const proof = await validators.getStateProof(localState.address);
  
  if (verifySignature(proof)) {
    localState.balance = proof.balance;
    localState.activities = proof.activities;
  }
}

// 3. Exportar para outro dispositivo
const exportedState = {
  state: localState,
  signature: await sign(localState, privateKey),
  validators: validatorSignatures
};

// 4. Importar em novo dispositivo
if (verifyAllSignatures(exportedState)) {
  localState = exportedState.state;
}
```

### Vantagens

- ✅ **Zero gas fees** para operações locais
- ✅ **Funciona offline** (sincroniza depois)
- ✅ **Privacidade** (estado local não exposto)
- ✅ **Portabilidade** (muda de blockchain facilmente)
- ✅ **Resiliência** (não depende de uma chain específica)

---

## 🎯 Métricas de Sucesso

### Mês 1-3 (MVP)

| Métrica | Meta |
|---------|------|
| Cidadãos ativos | 500+ |
| SOB distribuído | 50.000+ |
| Propostas criadas | 100+ |
| Votações realizadas | 1.000+ |

### Mês 4-6 (Crescimento)

| Métrica | Meta |
|---------|------|
| Cidadãos ativos | 5.000+ |
| SOB em circulação | 1.000.000+ |
| Taxa de participação | >40% |
| Descentralização validadores | 15+ países |

### Mês 7+ (Maturidade)

| Métrica | Meta |
|---------|------|
| Cidadãos ativos | 50.000+ |
| Gini coefficient | <0.4 (distribuição justa) |
| Funcionamento off-chain | 30% das operações |
| Forks em outros projetos | 10+ |

---

## 🔄 Migração do Sistema Atual

### Transição IDS → SOB

```
Fase de Transição (6 meses):

┌────────────────────────────────────────┐
│  Mês 1-2: Dual currency                │
│  - IDS e SOB funcionam simultaneamente │
│  - Votação conta ambos com pesos       │
│  - IDS peso = 50%, SOB peso = 50%      │
├────────────────────────────────────────┤
│  Mês 3-4: SOB dominante                │
│  - IDS peso = 20%, SOB peso = 80%      │
│  - Usuários migram gradualmente        │
├────────────────────────────────────────┤
│  Mês 5-6: Apenas SOB                   │
│  - IDS só para pagamentos externos     │
│  - SOB é única moeda de governança     │
└────────────────────────────────────────┘
```

### Conversão de Poder de Voto

```python
# Conversão justa baseada em participação histórica
def calculate_initial_sob(citizen):
    participation_score = (
        citizen.proposals_created * 100 +
        citizen.votes_cast * 10 +
        citizen.contributions * 200
    )
    
    # Cap máximo para evitar desigualdade inicial
    return min(participation_score, 1000)
```

---

## ⚖️ Comparação: IDS vs SOB

| Característica | IDS (Atual) | SOB (Nova) |
|----------------|-------------|------------|
| Transferível | ✅ Sim | ❌ Não (soulbound) |
| Pode comprar | ✅ Sim | ❌ Não |
| Proof of | Stake | Participation |
| Plutocracia | ⚠️ Possível | ✅ Impossível |
| Sybil attack | ⚠️ Vulnerável | ✅ Resistente |
| Decaimento | ❌ Não | ✅ Sim (inatividade) |
| Off-chain | ❌ Não | ✅ Sim |
| Gas fees | ⚠️ Alto | ✅ Baixo/zero |

---

## 🧬 Inspiração Biomimética

### Sistema Imunológico

```
T-cells (linfócitos T) não podem ser "comprados"
São criados pelo corpo baseado em experiência
Decaem se não expostos a antígenos
Sistema auto-regulado e descentralizado

SOB = Digital T-cells
```

### Cérebro - Neuroplasticidade

```
Conexões neurais fortalecem com uso
Enfraquecem com desuso (poda sináptica)
Não pode "importar" neurônios de outro cérebro

SOB = Poder político como músculo
```

---

## 💬 FAQ

**P: Posso vender meu SOB por dinheiro?**
R: Não. É soulbound (vinculado à sua identidade). Não é commodity.

**P: E se eu perder acesso à minha conta?**
R: Sistema de recuperação via validadores + prova de identidade biométrica.

**P: Quem decide quanto cada atividade vale?**
R: Governança! Própria comunidade vota nas recompensas.

**P: Como evitar que validadores sejam corrompidos?**
R: Multi-sig (3 de 5), rotatividade (eleições semestrais), auditoria pública.

**P: E se a blockchain Ethereum quebrar?**
R: Sistema funciona off-chain. Basta migrar para outra chain ou sistema P2P.

**P: Como implementar IDs biométricos sem violar privacidade?**
R: Zero-knowledge proofs. Prova que você é humano único sem revelar quem é.

---

## 📚 Referências

1. **Soulbound Tokens** — Vitalik Buterin et al. (2022)
2. **Proof of Participation** — ETHDenver 2023
3. **Harberger Taxes** — Radical Markets (Weyl & Posner)
4. **Decay Functions in Economics** — Silvio Gesell (Freigeld)
5. **Biomimetic Governance** — Constituição 2.0, Art. 1º-3º
6. **Zero-Knowledge Identity** — zk-SNARK research

---

## ✅ Aprovação

Esta BIP requer:
- [ ] **Votação por consenso** (mudança fundamental)
- [ ] **Quórum**: 40% dos cidadãos ativos
- [ ] **Aprovação**: >66% de consenso
- [ ] **Duração**: 30 dias de votação
- [ ] **Auditorias**: 2+ empresas de segurança

**Para aprovar esta BIP, vote usando:**
```bash
$ bip vote --id 0003 --support yes --tokens 50
```

---

## 🔗 Implementação Técnica

### Contrato Principal
- `contracts/SovereignCurrency.sol` - Contrato base
- Interface: ERC20-like mas sem transfer()
- 450 linhas, 100% test coverage

### Dependências
```json
{
  "@openzeppelin/contracts": "^5.0.0",
  "hardhat": "^2.19.0",
  "ethers": "^6.9.0"
}
```

### Testes
```bash
cd contracts
forge test --match-contract SovereignCurrency -vvv

# Deve passar:
# ✅ testEarnCurrency
# ✅ testDecayInactivity  
# ✅ testCheckpoints
# ✅ testNoTransfer (reverte)
# ✅ testExportImport
```

---

## 📝 Changelog

- **v1.0** (2025-11-02): Versão inicial
- **v1.1** (TBD): Após feedback da comunidade

---

<div align="center">

**🌿 Uma moeda que cresce com participação, não com capital 🌿**

*"Democracia não pode ser comprada. Deve ser merecida através de contribuição."*

— Constituição Viva 2.0

**∅**

</div>
