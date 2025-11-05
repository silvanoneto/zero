# BIP-0009: Sistema de Justiça Restaurativa

**Status:** ✅ IMPLEMENTADO  
**Artigo Constitucional:** Artigo 6º — Sistema de Justiça Restaurativa  
**Autor:** Cybersyn 2.0 Team  
**Data de Implementação:** Novembro 2025  
**Versão:** 1.0.0

---

## 📋 Resumo Executivo

Este BIP implementa o **Artigo 6º da Constituição Viva 2.0**, estabelecendo um sistema de justiça restaurativa baseado em blockchain que prioriza mediação, resolução de conflitos via júris populares descentralizados, e punições focadas em restauração ao invés de punição.

**Contratos Implementados:**
- `RestorativeJustice.sol` — Contrato principal (592 linhas)
- `IRestorativeJustice.sol` — Interface pública (268 linhas)

**Testes:** ✅ 22/22 passando (100%)

---

## 🎯 Requisitos Constitucionais

### Artigo 6º — Princípios Fundamentais

> *"A justiça não é retributiva, é restaurativa. Conflitos são resolvidos por júris populares descentralizados, com mediação obrigatória antes de julgamento. Mediadores têm reputação pública, e resoluções focam em reparação de danos e reintegração social."*

**Pilares Implementados:**

1. ✅ **Júris Populares Descentralizados**
   - 12 jurados selecionados aleatoriamente
   - Votação transparente e justificada
   - Maioria simples (7/12) para condenação

2. ✅ **Mediação Obrigatória**
   - Toda disputa passa por mediação antes de ir a júri
   - Prazo de 14 dias para mediação
   - Mediadores certificados com reputação mínima

3. ✅ **Sistema de Reputação para Mediadores**
   - Reputação inicial: 700/1000
   - +20 pontos por mediação bem-sucedida
   - -10 pontos por mediação falha
   - Mínimo de 500 pontos para mediar

4. ✅ **Punições Restaurativas**
   - 6 tipos de resolução (sem prisão)
   - Foco em reparação e reintegração
   - Transparência total do processo

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE JUSTIÇA RESTAURATIVA              │
└─────────────────────────────────────────────────────────────────┘

1. CRIAÇÃO DE DISPUTA
   ┌───────────┐
   │  Plaintiff │──┐
   └───────────┘  │
                  ├──> createDispute(defendant, evidenceIPFS)
   ┌───────────┐  │
   │ Defendant │──┘
   └───────────┘
         │
         v
   [PENDING_MEDIATION]

2. FASE DE MEDIAÇÃO (Obrigatória)
   ┌──────────┐
   │ Mediador │──> registerAsMediator()
   └──────────┘
         │
         ├──> acceptMediation(disputeId)
         │
         v
   [IN_MEDIATION] ──> 14 dias de prazo
         │
         ├──> completeMediationSuccessfully() ──> [RESOLVED] ✓
         │
         └──> failMediation() ──> [MEDIATION_FAILED]
                                        │
                                        v
3. FASE DE JÚRI (Apenas se mediação falhar)
   ┌─────────┐
   │ Sistema │──> conveneJury(disputeId)
   └─────────┘
         │
         v
   [IN_TRIAL] ──> Seleciona 12 jurados aleatórios
         │
         ├──> Jurado 1 vota ──┐
         ├──> Jurado 2 vota ──┤
         ├──> ...             ├──> castJuryVote()
         └──> Jurado 12 vota ─┘
                │
                v
         finalizeVerdict()
                │
         ┌──────┴──────┐
         │             │
    GUILTY (7+)    NOT GUILTY (6-)
         │             │
         v             v
   [PENDING_JURY]  [RESOLVED] ✓
         │
         v
   completeResolution(proofIPFS)
         │
         v
   [RESOLUTION_COMPLETED] ✓
```

---

## 📊 Estados da Disputa

| Estado | Descrição | Próxima Ação |
|--------|-----------|--------------|
| `PENDING_MEDIATION` | Aguardando mediador aceitar | `acceptMediation()` |
| `IN_MEDIATION` | Mediação em andamento | `completeMediationSuccessfully()` ou `failMediation()` |
| `MEDIATION_FAILED` | Mediação falhou, vai para júri | `conveneJury()` |
| `IN_TRIAL` | Julgamento em andamento | Jurados votam com `castJuryVote()` |
| `VERDICT_REACHED` | Veredito alcançado (culpado) | `completeResolution()` |
| `RESOLUTION_COMPLETED` | Resolução completa ✅ | — |
| `DISMISSED` | Caso arquivado (acordo mútuo) | — |

---

## 🔧 Tipos de Resolução Restaurativa

Ao invés de prisão ou multas punitivas, o sistema oferece 6 tipos de resolução focados em restauração:

```solidity
enum RestorationType {
    COMMUNITY_SERVICE,    // Serviço comunitário (ex: 100h educando sobre o tema)
    RESTITUTION,          // Restituição de danos (devolver valor roubado + juros)
    EDUCATION,            // Programa educacional (curso de ética, consenso, etc.)
    MEDIATED_AGREEMENT,   // Acordo mediado (solução customizada)
    PUBLIC_APOLOGY,       // Desculpa pública (reparação de reputação)
    REPUTATION_PENALTY    // Penalidade de reputação (reduz peso de voto temporariamente)
}
```

**Exemplos de Uso:**
- **Fraude em votação:** `COMMUNITY_SERVICE` + `EDUCATION` (educar comunidade sobre votação)
- **Roubo de tokens:** `RESTITUTION` (devolver + 20% compensação)
- **Difamação:** `PUBLIC_APOLOGY` + `REPUTATION_PENALTY`
- **Violação de protocolo:** `EDUCATION` (curso sobre governança)

---

## 🎓 Interface Pública

### Criar Disputa

```solidity
function createDispute(
    address defendant,
    string calldata evidenceIPFSHash
) external returns (uint256 disputeId);
```

**Parâmetros:**
- `defendant`: Endereço do réu
- `evidenceIPFSHash`: Hash IPFS com evidências (fotos, logs, transações, etc.)

**Retorna:** ID da disputa criada

**Exemplo:**
```solidity
// Alice acusa Bob de violação de protocolo
uint256 disputeId = justice.createDispute(
    0xBob...,
    "QmXhZ8K9...abc123"  // IPFS contendo: prints, timestamps, testemunhas
);
```

---

### Sistema de Mediação

#### Registrar-se como Mediador

```solidity
function registerAsMediator() external;
```

**Requisitos:**
- Não estar registrado anteriormente
- Ter reputação mínima na DAO (implementação futura)

**Efeitos:**
- Reputação inicial: 700/1000
- Entra no pool de mediadores ativos

#### Aceitar Mediação

```solidity
function acceptMediation(uint256 disputeId) external;
```

**Requisitos:**
- Ser mediador registrado
- Reputação ≥ 500
- Disputa em estado `PENDING_MEDIATION`

**Efeitos:**
- Inicia prazo de 14 dias
- Status muda para `IN_MEDIATION`
- Mediador recebe notificação

#### Completar Mediação (Sucesso)

```solidity
function completeMediationSuccessfully(
    uint256 disputeId,
    string calldata resolution
) external;
```

**Efeitos:**
- ✅ Disputa resolvida
- Reputação do mediador +20
- `successfulMediations++`
- Status: `RESOLUTION_COMPLETED`

#### Falhar Mediação

```solidity
function failMediation(
    uint256 disputeId,
    string calldata reason
) external;
```

**Efeitos:**
- ❌ Vai para júri
- Reputação do mediador -10
- `failedMediations++`
- Status: `MEDIATION_FAILED`

---

### Sistema de Júri

#### Convocar Júri

```solidity
function conveneJury(uint256 disputeId) external;
```

**Requisitos:**
- Disputa em `MEDIATION_FAILED`

**Processo:**
1. Seleciona 12 cidadãos aleatórios (VRF)
2. Cria sala de julgamento
3. Notifica jurados
4. Inicia prazo de 21 dias

**⚠️ NOTA:** Implementação atual usa pseudo-aleatoriedade. **Em produção, integrar Chainlink VRF para aleatoriedade segura.**

#### Votar como Jurado

```solidity
function castJuryVote(
    uint256 disputeId,
    bool guiltyVote,
    RestorationType suggestedResolution,
    string calldata reasoning
) external;
```

**Requisitos:**
- Ser jurado da disputa
- Não ter votado antes
- Fornecer justificativa escrita

**Exemplo:**
```solidity
justice.castJuryVote(
    42,
    true, // culpado
    RestorationType.COMMUNITY_SERVICE,
    "Evidências mostram clara violação do protocolo. Réu admitiu erro. Recomendo serviço comunitário educando novos membros."
);
```

#### Finalizar Veredito

```solidity
function finalizeVerdict(uint256 disputeId) external;
```

**Requisitos:**
- Todos 12 jurados votaram

**Lógica:**
- **Maioria simples:** ≥ 7 votos = culpado
- **Tipo de resolução:** Mais votado entre jurados que votaram "culpado"

**Resultados:**
- **Culpado:** Status → `PENDING_JURY` (aguarda cumprimento)
- **Inocente:** Status → `RESOLUTION_COMPLETED` (caso encerrado)

---

## 📈 Sistema de Reputação

### Mecânica de Reputação de Mediadores

| Evento | Impacto | Nova Reputação |
|--------|---------|----------------|
| **Registro inicial** | +700 | 700 |
| **Mediação bem-sucedida** | +20 | 720 |
| **Mediação falha** | -10 | 690 |
| **Múltiplas falhas** | Acumulativo | Pode cair abaixo de 500 (perde direito de mediar) |
| **Múltiplos sucessos** | Acumulativo | Máximo 1000 |

**Fórmula:**
```
Nova Reputação = min(Reputação Atual ± Δ, MAX_REPUTATION)
MAX_REPUTATION = 1000
MIN_MEDIATION_REPUTATION = 500
```

**Exemplos de Trajetórias:**

```
Mediador A (Bom):
Registro    → 700
Sucesso #1  → 720
Sucesso #2  → 740
Falha #1    → 730
Sucesso #3  → 750
Sucesso #4  → 770
...após 15 sucessos → 1000 (máximo)

Mediador B (Ruim):
Registro    → 700
Falha #1    → 690
Falha #2    → 680
Falha #3    → 670
Falha #4    → 660
...após 20 falhas → 500 (perda de qualificação)
```

---

## 🔍 Funções View (Leitura)

### Obter Disputa Completa

```solidity
function getDispute(uint256 disputeId) external view returns (Dispute memory);
```

**Retorna:**
```solidity
struct Dispute {
    uint256 id;
    address plaintiff;
    address defendant;
    string evidenceIPFSHash;
    DisputeStatus status;
    address mediator;
    uint256 mediationDeadline;
    address[] jurors;
    uint256 trialDeadline;
    RestorationType resolutionType;
    string resolutionDetails;
    uint256 createdAt;
    uint256 resolvedAt;
}
```

### Obter Dados de Mediador

```solidity
function getMediator(address mediatorAddress) external view returns (Mediator memory);
```

**Retorna:**
```solidity
struct Mediator {
    address mediatorAddress;
    uint256 casesMediated;
    uint256 successfulMediations;
    uint256 failedMediations;
    uint256 reputationScore;  // 0-1000
    bool isActive;
    uint256 registeredAt;
}
```

### Obter Votos do Júri

```solidity
function getJuryVotes(uint256 disputeId) external view returns (JuryVote[] memory);
```

**Transparência Total:** Qualquer cidadão pode ver como cada jurado votou e sua justificativa.

### Estatísticas do Sistema

```solidity
function getSystemStats() external view returns (
    uint256 totalDisputes,
    uint256 activeMediations,
    uint256 activeTrials,
    uint256 resolutionRate  // % de mediações bem-sucedidas
);
```

---

## 🧪 Cobertura de Testes

**Total:** 22 testes, 100% passando ✅

### Testes de Criação de Disputa (5 testes)
- ✅ `testCreateDispute()` — Criação básica
- ✅ `testCannotDisputeYourself()` — Validação de auto-disputa
- ✅ `testCannotCreateDisputeWithoutEvidence()` — Validação de evidências
- ✅ `testCannotDisputeZeroAddress()` — Validação de endereço
- ✅ `testGetDisputesByParticipant()` — Busca de disputas

### Testes de Mediação (7 testes)
- ✅ `testRegisterAsMediator()` — Registro de mediador
- ✅ `testCannotRegisterTwice()` — Validação de duplicação
- ✅ `testAcceptMediation()` — Aceitação de mediação
- ✅ `testCannotAcceptMediationWithLowReputation()` — Validação de reputação
- ✅ `testCompleteMediationSuccessfully()` — Mediação bem-sucedida
- ✅ `testMediationFails()` — Mediação falha
- ✅ `testDismissDispute()` — Arquivamento de disputa

### Testes de Júri (6 testes)
- ✅ `testConveneJury()` — Convocação de júri
- ✅ `testCastJuryVote()` — Voto de jurado
- ✅ `testCannotVoteTwice()` — Validação de voto duplo
- ✅ `testFinalizeVerdictGuilty()` — Veredito culpado (10/12)
- ✅ `testFinalizeVerdictNotGuilty()` — Veredito inocente (5/12)
- ✅ `testCompleteResolution()` — Cumprimento de resolução

### Testes de Estatísticas (2 testes)
- ✅ `testGetSystemStats()` — Estatísticas globais
- ✅ `testGetActiveMediators()` — Lista de mediadores

### Testes de Integração (2 testes)
- ✅ `testFullDisputeFlowWithMediation()` — Fluxo completo com mediação
- ✅ `testFullDisputeFlowWithTrial()` — Fluxo completo com júri

**Comando:**
```bash
forge test --match-contract RestorativeJusticeTest -vv
```

---

## 🚀 Casos de Uso

### Caso 1: Fraude em Votação

**Cenário:** Alice detecta que Bob criou múltiplas carteiras para votar 10x na mesma proposta.

**Fluxo:**
1. Alice cria disputa: `createDispute(Bob, "QmEvidenceOfMultipleVotes")`
2. Mediador Charlie aceita: `acceptMediation(disputeId)`
3. Bob admite erro, aceita penalidade
4. Charlie completa mediação: `completeMediationSuccessfully(disputeId, "Bob devolve tokens ganhos + 100h serviço comunitário educando sobre voto único")`
5. Status: ✅ RESOLVIDO (sem júri)

**Resolução:**
- Tipo: `COMMUNITY_SERVICE` + `RESTITUTION`
- Bob devolve tokens
- Bob ensina 100h sobre importância de voto único
- Reputação de Charlie aumenta +20

---

### Caso 2: Disputa de Propriedade Intelectual

**Cenário:** Alice acusa Bob de plagiar seu código open-source sem atribuição.

**Fluxo:**
1. Alice: `createDispute(Bob, "QmCodeComparisonProof")`
2. Mediador tenta acordo, mas Bob nega plágio
3. Mediador: `failMediation(disputeId, "Defendant denies claims")`
4. Sistema convoca 12 jurados: `conveneJury(disputeId)`
5. Jurados analisam código (IPFS) e votam:
   - 8 votam CULPADO (código 95% idêntico)
   - 4 votam INOCENTE (código é padrão da indústria)
6. Veredito: **CULPADO** (8/12)
7. Tipo de resolução mais votado: `PUBLIC_APOLOGY` + `RESTITUTION`
8. Bob: `completeResolution(disputeId, "QmPublicApologyVideo")`

**Resultado:**
- Bob pública vídeo de desculpas
- Bob adiciona atribuição no código
- Bob doa 1000 tokens para Alice (restituição)
- Caso encerrado ✅

---

### Caso 3: Violação de Protocolo de DAO

**Cenário:** Membro usa voto de especialista falsamente (não é especialista).

**Fluxo:**
1. DAO cria disputa automaticamente (FraudDetection.sol integrado)
2. Mediação falha (membro não responde)
3. Júri vota 12/12 CULPADO (evidência clara)
4. Resolução: `REPUTATION_PENALTY` + `EDUCATION`

**Efeitos:**
- Peso de voto reduzido 50% por 6 meses
- Obrigado a completar curso sobre especialização
- Após 6 meses + curso, pode solicitar reabilitação

---

## ⚙️ Integração com Outros Contratos

### FederationVoting.sol

```solidity
// Quando usuário tenta votar com voto de especialista
function vote(uint256 proposalId, bool support, bool useExpertVote) public {
    if (useExpertVote) {
        require(expertSystem.isExpert(msg.sender), "Not an expert");
        
        // NOVO: Checa se usuário tem penalidade ativa
        require(!restorativeJustice.hasActivePenalty(msg.sender), "Active reputation penalty");
    }
    // ... resto da lógica
}
```

### FraudDetection.sol

```solidity
// Quando fraude é detectada, auto-cria disputa
function _handleFraudDetection(address fraudster, string memory evidence) internal {
    uint256 disputeId = restorativeJustice.createDispute(
        fraudster,
        evidence // IPFS hash com logs, transações, etc.
    );
    
    emit FraudDisputeCreated(fraudster, disputeId);
}
```

### DAOMitosis.sol

```solidity
// Ao criar DAO filha, transfere sistema de justiça
function _createChildDAO() internal {
    ChildDAO childDAO = new ChildDAO();
    
    // Cria nova instância de RestorativeJustice para DAO filha
    RestorativeJustice childJustice = new RestorativeJustice();
    childDAO.setJusticeSystem(address(childJustice));
}
```

---

## 🔒 Considerações de Segurança

### 1. Aleatoriedade de Júri (CRÍTICO)

**Problema Atual:** Implementação usa `keccak256(blockhash)` que é **manipulável por mineradores**.

**Solução Produção:**
```solidity
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract RestorativeJustice is VRFConsumerBaseV2 {
    function conveneJury(uint256 disputeId) external {
        // Solicita número aleatório verificável
        uint256 requestId = requestRandomWords(
            keyHash,
            subscriptionId,
            3, // confirmations
            500000, // callbackGasLimit
            1 // numWords
        );
        
        _pendingJuryRequests[requestId] = disputeId;
    }
    
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 disputeId = _pendingJuryRequests[requestId];
        address[] memory jurors = _selectJurorsWithVRF(randomWords[0]);
        // ...
    }
}
```

### 2. Sybil Attacks em Júri

**Problema:** Atacante pode criar 100 identidades e esperar ser sorteado como 7+ jurados.

**Mitigações:**
- ✅ **Proof of Humanity:** Integrar com Worldcoin ou similar
- ✅ **Proof of Life:** Usar `ProofOfLife.sol` (BIP-0004)
- ✅ **Staking:** Jurados devem ter ≥ X tokens stakados há ≥ Y meses
- ✅ **Histórico:** Priorizar cidadãos com histórico de participação

### 3. Collusion entre Jurados

**Problema:** Jurados podem combinar votos off-chain.

**Mitigações:**
- ✅ **Commit-Reveal:** Jurados commitam hash do voto antes de revelar
- ✅ **Time-locks:** Janela de votação com deadline rígido
- ✅ **Slash:** Jurados detectados coludindo perdem stake

### 4. Spam de Disputas

**Problema:** Atacante cria 1000 disputas falsas para sobrecarregar sistema.

**Mitigações:**
- ✅ **Taxa de Disputa:** Custo de 100 tokens para criar disputa (devolvido se vencer)
- ✅ **Cooldown:** Máximo 3 disputas por endereço por mês
- ✅ **Reputação:** Endereços com histórico de disputas frivolosas têm custo 10x maior

---

## 📊 Métricas de Sucesso

### KPIs do Sistema

1. **Taxa de Resolução por Mediação**
   - Meta: ≥ 70%
   - Atual: Calculado em `getSystemStats()`

2. **Tempo Médio de Resolução**
   - Meta: ≤ 21 dias
   - Tracking: `resolvedAt - createdAt`

3. **Reputação Média de Mediadores**
   - Meta: ≥ 750
   - Tracking: `AVG(mediator.reputationScore)`

4. **Taxa de Apelação**
   - Meta: ≤ 5% (futura feature)

5. **Satisfação das Partes**
   - Meta: ≥ 80% (pesquisa pós-resolução)

---

## 🛣️ Roadmap de Melhorias

### Fase 1 — Produção (Q1 2025)
- [ ] Integrar Chainlink VRF para júri aleatório
- [ ] Implementar Proof of Humanity (Worldcoin)
- [ ] Sistema de taxa/stake para disputas
- [ ] Dashboard web de disputas ativas

### Fase 2 — Aperfeiçoamento (Q2 2025)
- [ ] Sistema de apelação (re-julgamento com novo júri)
- [ ] Commit-reveal para votos de júri
- [ ] Mediadores especializados por categoria (técnico, social, financeiro)
- [ ] Sistema de recompensas para jurados (tokens)

### Fase 3 — Governança Avançada (Q3 2025)
- [ ] IA auxiliar (análise de evidências em IPFS)
- [ ] Sistema de precedentes (casos similares)
- [ ] Cross-chain dispute resolution (disputas entre DAOs de chains diferentes)
- [ ] ZK-proofs para privacidade seletiva (casos sensíveis)

---

## 📚 Referências

### Constituição Viva 2.0
- **Artigo 6º:** Sistema de Justiça Restaurativa

### Contratos Relacionados
- `FraudDetection.sol` — Detecção automática de fraudes
- `ProofOfLife.sol` — Verificação de identidade única
- `GovernanceToken.sol` — Tokens para stake/penalidades

### Inspirações
- [Kleros](https://kleros.io/) — Corte descentralizada (mas com foco em arbitragem, não restauração)
- [Aragon Court](https://court.aragon.org/) — Sistema de júris (descontinuado)
- [Ubuntu Justice](https://en.wikipedia.org/wiki/Ubuntu_philosophy) — Filosofia restaurativa africana

---

## 👥 Contribuidores

- **Arquitetura:** Cybersyn 2.0 Core Team
- **Implementação Solidity:** Cybersyn 2.0 Core Team
- **Testes:** Cybersyn 2.0 Core Team
- **Documentação:** Cybersyn 2.0 Core Team

---

## 📝 Changelog

### v1.0.0 (Novembro 2025)
- ✅ Implementação inicial completa
- ✅ 22 testes passando
- ✅ Sistema de mediação obrigatória
- ✅ Júri de 12 membros
- ✅ 6 tipos de resolução restaurativa
- ✅ Sistema de reputação de mediadores
- ⚠️ VRF pendente (usar Chainlink em produção)

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/cybersyn/contracts/issues)
- **Discussões:** [Discord #restorative-justice](https://discord.gg/cybersyn)
- **Email:** justice@cybersyn.org

---

**🌿 Justiça não é vingança. É restauração. É Ubuntu. É Nhandereko.**

*"Eu sou porque nós somos. Quando um membro da comunidade causa dano, a comunidade inteira trabalha para restaurar o equilíbrio."*

— Filosofia Ubuntu, adaptada para blockchain
