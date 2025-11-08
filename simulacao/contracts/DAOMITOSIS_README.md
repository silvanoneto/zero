# 🧬 DAOMitosis - Mitose Organizacional Automática

## 🎯 Visão Geral

**DAOMitosis** implementa o **Artigo 5º-C da Cybersyn 2.0**, um sistema biomimético inspirado em divisão celular que previne a ossificação e perda de coesão em organizações descentralizadas.

Baseado no **Número de Dunbar** (limite cognitivo de ~150 relações significativas), o contrato monitora automaticamente o tamanho das DAOs e inicia um processo democrático de divisão quando atingem 500 membros ativos.

## 📋 Características Principais

### ✅ Detecção Automática
- 🟡 **Warning aos 450 membros**: Notificação antecipada
- 🔴 **Mitose aos 500 membros**: Processo iniciado automaticamente
- 📊 **Rastreamento de atividade**: Membros inativos >90 dias são excluídos da contagem

### 🗳️ Votação Democrática
- **4 Critérios de Divisão**:
  - `GEOGRAPHIC`: Por localização geográfica
  - `AFFINITY`: Por similaridade de votação (clustering)
  - `RANDOM`: Divisão aleatória balanceada (mais justa)
  - `TEMPORAL`: Por antiguidade (veteranos vs novatos)
- **Período**: 30 dias de votação
- **Quórum**: 51% dos membros ativos
- **Cancelamento**: Se membros saírem e voltarmos <450, processo é cancelado

### 🧬 Execução de Mitose
- **Snapshot**: Estado completo armazenado em IPFS antes da divisão
- **DAOs Filhas**: Criadas automaticamente ("Alpha" e "Beta")
- **DAO Mãe**: Entra em modo `LEGACY` (read-only, histórico preservado)
- **Árvore Genealógica**: Sistema multi-geracional (raiz → filha → neta...)

## 🏗️ Arquitetura

### Estados de uma DAO

```
ACTIVE → WARNING → MITOSIS_VOTE → SPLITTING → LEGACY
  ↑         │          │              │
  │         └── (cancelado) ──────────┘
  │         se voltarmos < 450 membros
  └─────────────────────────────────────
```

### Estruturas de Dados

#### DAOInfo
```solidity
struct DAOInfo {
    uint256 id;                    // ID único
    address daoAddress;            // Endereço do contrato da DAO
    string name;                   // Nome da DAO
    uint256 activeMemberCount;     // Membros ativos (últimos 90 dias)
    DAOStatus status;              // ACTIVE, WARNING, MITOSIS_VOTE, etc
    uint256 parentDaoId;           // 0 se raiz, senão ID da mãe
    uint256[] childDaoIds;         // Array de DAOs filhas
    uint256 generationLevel;       // Profundidade na árvore (0 = raiz)
    string metadataIPFS;           // Metadados completos
}
```

#### MitosisProcess
```solidity
struct MitosisProcess {
    uint256 processId;
    uint256 daoId;
    DivisionCriteria selectedCriteria;  // Vencedor da votação
    uint256 totalVotes;
    MitosisStatus status;               // PENDING, APPROVED, COMPLETED
    uint256 childDao1Id;                // ID da primeira filha
    uint256 childDao2Id;                // ID da segunda filha
    string snapshotIPFS;                // Estado pré-divisão
}
```

## 📦 Instalação e Deploy

### Pré-requisitos
```bash
forge install
```

### Deploy
```bash
forge script script/Deploy.s.sol:DeployDAOMitosis --rpc-url $RPC_URL --broadcast
```

### Verificação
```bash
forge verify-contract <CONTRACT_ADDRESS> DAOMitosis --chain-id 1
```

## 🧪 Testes

### Executar todos os testes
```bash
forge test --match-contract DAOMitosisTest -vv
```

### Testes por categoria
```bash
# Registro de DAOs
forge test --match-test testRegister -vv

# Gerenciamento de membros
forge test --match-test testMember -vv

# Limite de Dunbar
forge test --match-test testDunbar -vv

# Processo de mitose
forge test --match-test testMitosis -vv
```

### Coverage
```bash
forge coverage --match-contract DAOMitosis
```

## 🔐 Roles e Permissões

| Role | Funções | Uso Recomendado |
|------|---------|-----------------|
| `DAO_ADMIN_ROLE` | `registerDAO()` | Multi-sig ou DAO de governança |
| `MEMBER_TRACKER_ROLE` | `addMember()`, `removeMember()`, `recordActivity()` | Contrato `FederationVoting` |
| `MITOSIS_EXECUTOR_ROLE` | `finalizeMitosisVoting()`, `executeMitosis()` | Bot automatizado com Keeper |

## 📖 Uso

### 1. Registrar uma DAO

```solidity
uint256 daoId = mitosis.registerDAO(
    0x123...,              // Endereço da DAO
    "DAO Alpha",           // Nome
    "QmHash...",           // Metadados IPFS
    0                      // parentDaoId (0 se raiz)
);
```

### 2. Adicionar Membros

```solidity
mitosis.addMember(
    daoId,
    memberAddress,
    "QmProfileHash..."    // Perfil IPFS
);
```

### 3. Registrar Atividade (Integração com Votação)

```solidity
// Em FederationVoting.sol
function vote(uint256 proposalId, bool support) external {
    // ... lógica de votação ...
    
    // Registra atividade
    mitosisContract.recordActivity(daoId, msg.sender);
}
```

### 4. Votar em Critério de Divisão

```solidity
mitosis.voteOnMitosisCriteria(
    processId,
    DAOMitosis.DivisionCriteria.RANDOM
);
```

### 5. Executar Mitose (Após Votação)

```solidity
// Finalizar votação
mitosis.finalizeMitosisVoting(processId);

// Executar divisão
mitosis.executeMitosis(
    processId,
    childDao1Address,      // Endereço nova DAO 1
    childDao2Address,      // Endereço nova DAO 2
    "QmSnapshotHash..."    // Snapshot completo
);
```

## 🔄 Integração com Outros Contratos

### FederationVoting.sol

```solidity
contract FederationVoting {
    DAOMitosis public mitosisContract;
    
    function vote(uint256 proposalId, bool support) external {
        // ... validações ...
        
        // Registra atividade do membro
        if (address(mitosisContract) != address(0)) {
            mitosisContract.recordActivity(currentDaoId, msg.sender);
        }
        
        // ... resto da lógica ...
    }
}
```

### GovernanceToken.sol

```solidity
// Após executar mitose, distribuir tokens
function distributeDuringMitosis(
    uint256 parentDaoId,
    uint256 childDao1Id,
    uint256 childDao2Id
) external onlyRole(MITOSIS_EXECUTOR_ROLE) {
    // Snapshot de holders
    // Mintear 1:1 para DAOs filhas
}
```

## 📊 Métricas e Monitoramento

### Views Importantes

```solidity
// Verificar se DAO está próxima do limite
bool approaching = mitosis.isDunbarLimitApproaching(daoId);

// Pegar informações completas
DAOMitosis.DAOInfo memory dao = mitosis.getDAOInfo(daoId);

// Verificar processo ativo
DAOMitosis.MitosisProcess memory process = mitosis.getActiveMitosisProcess(daoId);

// Ver DAOs filhas
uint256[] memory children = mitosis.getChildDAOs(daoId);
```

### Events para Indexação

```solidity
event MemberJoined(uint256 indexed daoId, address indexed member, uint256 timestamp);
event DunbarWarning(uint256 indexed daoId, uint256 currentMembers, uint256 limit);
event MitosisInitiated(uint256 indexed processId, uint256 indexed daoId, ...);
event MitosisVoteCast(uint256 indexed processId, address indexed voter, DivisionCriteria criteria);
event MitosisExecuted(uint256 indexed processId, uint256 parentDaoId, uint256 childDao1Id, uint256 childDao2Id);
```

## 🚀 Roadmap

### ✅ Fase 1: Core (Concluído)
- [x] Sistema de registro de DAOs
- [x] Gerenciamento de membros
- [x] Detecção automática de limite
- [x] Votação de critério
- [x] Execução de mitose

### 🔄 Fase 2: Integração (Em Progresso)
- [ ] Hook em `FederationVoting` para tracking automático
- [ ] Distribuição automática de `GovernanceToken`
- [ ] Migração de propostas ativas
- [ ] Sistema de snapshot off-chain

### 📋 Fase 3: Frontend (Planejado)
- [ ] Dashboard de status da DAO
- [ ] Interface de votação de mitose
- [ ] Visualizador de árvore genealógica
- [ ] Notificações de warning

### 🔬 Fase 4: Otimização (Futuro)
- [ ] Gas optimization
- [ ] Clustering inteligente (affinity)
- [ ] Sistema de reputação transferível
- [ ] Auditoria externa

## 📚 Documentação Adicional

- **Especificação Completa**: [`docs/ARTIGO_5C_MITOSIS_IMPLEMENTATION.md`](../docs/ARTIGO_5C_MITOSIS_IMPLEMENTATION.md)
- **Gap Analysis**: [`docs/CONSTITUTIONAL_IMPLEMENTATION_GAP.md`](../docs/CONSTITUTIONAL_IMPLEMENTATION_GAP.md)
- **Cybersyn 2.0**: [`constituicao_2.0.html`](../constituicao_2.0.html)

## 🤝 Contribuindo

### Reportar Bugs
Abra uma issue com:
- Descrição do problema
- Steps para reproduzir
- Expected vs actual behavior
- Logs/traces relevantes

### Propor Melhorias
Crie uma BIP (Brasil Improvement Proposal) via `FederationVoting`

### Code Style
```bash
forge fmt
solhint 'contracts/**/*.sol'
```

## 📄 Licença

MIT License - Ver [LICENSE](../LICENSE)

## 🙏 Agradecimentos

- **Robin Dunbar**: Pela pesquisa em limites cognitivos sociais
- **Stafford Beer**: Criador do Cybersyn original
- **Comunidade Ethereum**: Por ferramentas incríveis como Foundry

---

**Versão**: 1.0.0  
**Status**: ✅ Core Implementation Complete  
**Última Atualização**: 2025-11-03
