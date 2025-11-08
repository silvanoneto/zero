# The Graph Subgraph - Cybersyn 2.0

Subgraph para indexação de dados da governança on-chain da Cybersyn 2.0.

## 🎯 Funcionalidades

- ✅ Indexação de propostas em tempo real
- ✅ Rastreamento de votos por múltiplas funções (Linear, Quadrática, Logarítmica, Consenso)
- ✅ Sistema de experts com domínios
- ✅ Estatísticas de governança agregadas
- ✅ Histórico completo de votações
- ✅ Queries GraphQL otimizadas

## 📦 Instalação

```bash
cd subgraph
npm install
```

## ⚙️ Configuração

1. **Instalar Graph CLI globalmente:**

```bash
npm install -g @graphprotocol/graph-cli
```

2. **Criar conta no [The Graph Studio](https://thegraph.com/studio/)**

3. **Atualizar subgraph.yaml** com endereço do contrato:

```yaml
dataSources:
  - kind: ethereum/contract
    name: FederationVoting
    network: mainnet  # ou sepolia, localhost
    source:
      address: "0xYOUR_CONTRACT_ADDRESS"
      startBlock: 0  # block de deploy
```

## 🚀 Deploy

### Local (Hardhat/Foundry)

```bash
# 1. Iniciar Graph Node local
docker-compose up -d

# 2. Criar subgraph local
graph create --node http://localhost:8020/ constituicao-2-0

# 3. Deploy local
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 constituicao-2-0
```

### The Graph Studio (Mainnet/Sepolia)

```bash
# 1. Autenticar
graph auth --studio YOUR_DEPLOY_KEY

# 2. Codegen
npm run codegen

# 3. Build
npm run build

# 4. Deploy
graph deploy --studio constituicao-2-0
```

## 📊 Schema

### Entities

#### Proposal
- `id`: Proposal ID
- `title`: Título
- `descriptionCID`: IPFS CID da descrição
- `proposer`: Endereço do criador
- `voteType`: Linear, Quadratic, Logarithmic, Consensus
- `votesFor/Against`: Peso total de votos
- `votersFor/Against`: Número de votantes
- `state`: Active, Executed, Defeated, Expired
- `timestamps`: createdAt, executedAt
- `tags`: Array de ProposalTag

#### Vote
- `id`: Composite key (proposalId-voterAddress)
- `proposal`: Referência à Proposal
- `voter`: Endereço do votante
- `support`: true (a favor) / false (contra)
- `weight`: Peso do voto
- `reason`: Justificativa (opcional)
- `timestamp`: Momento do voto

#### Expert
- `id`: Composite key (address-domain)
- `address`: Endereço do expert
- `domain`: Domínio de expertise (bytes32)
- `verifiedAt`: Timestamp de verificação
- `isActive`: Status ativo

#### Voter
- `id`: Endereço
- `voteCount`: Total de votos
- `proposalsCreated`: Propostas criadas
- `isExpert`: Se é expert verificado

#### GovernanceStats
- `id`: "global" (singleton)
- `totalProposals/Votes/Voters/Experts`: Contadores
- `activeProposals/executedProposals`: Estados

## 🔍 Exemplos de Queries

### Listar Propostas Ativas

```graphql
query ActiveProposals {
  proposals(
    where: { state: Active }
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    title
    proposer
    voteType
    votesFor
    votesAgainst
    createdAt
    tags {
      category
      expertDomain
    }
  }
}
```

### Votos de uma Proposta

```graphql
query ProposalVotes($proposalId: String!) {
  votes(
    where: { proposal: $proposalId }
    orderBy: timestamp
    orderDirection: desc
  ) {
    voter
    support
    weight
    reason
    timestamp
  }
}
```

### Estatísticas de um Votante

```graphql
query VoterStats($address: Bytes!) {
  voter(id: $address) {
    voteCount
    proposalsCreated
    isExpert
  }
  votes(where: { voter: $address }, first: 10) {
    proposal {
      title
    }
    support
    weight
    timestamp
  }
}
```

### Experts Verificados

```graphql
query VerifiedExperts {
  experts(where: { isActive: true }) {
    address
    domain
    verifiedAt
  }
}
```

### Estatísticas Globais

```graphql
query GlobalStats {
  governanceStats(id: "global") {
    totalProposals
    totalVotes
    totalVoters
    totalExperts
    activeProposals
    executedProposals
  }
}
```

### Propostas por Tipo de Voto

```graphql
query ProposalsByVoteType($voteType: VoteType!) {
  proposals(
    where: { voteType: $voteType }
    orderBy: votesFor
    orderDirection: desc
  ) {
    id
    title
    votesFor
    votesAgainst
  }
}
```

### Top Votantes

```graphql
query TopVoters {
  voters(
    orderBy: voteCount
    orderDirection: desc
    first: 10
  ) {
    address
    voteCount
    proposalsCreated
    isExpert
  }
}
```

## 🧪 Testes

```bash
npm run test
```

## 📈 Monitoramento

### Status do Subgraph

No The Graph Studio:
- Sync status
- Entity counts
- Query performance
- Error logs

### Query Playground

Acesse `https://thegraph.com/studio/subgraph/constituicao-2-0/playground`

## 🔧 Troubleshooting

### Erro "Failed to connect to IPFS"

```bash
# Verificar se IPFS está rodando
docker ps | grep ipfs

# Reiniciar IPFS
docker-compose restart ipfs
```

### Erro "Network not supported"

Atualizar `networks.json` e `subgraph.yaml` com network correta.

### Reindexar do Zero

```bash
graph deploy --studio constituicao-2-0 --version-label v1.0.1
```

## 📚 Documentação

- [The Graph Docs](https://thegraph.com/docs)
- [AssemblyScript](https://www.assemblyscript.org/)
- [GraphQL](https://graphql.org/)

## 🔄 Updates

Para atualizar o schema:

1. Modificar `schema.graphql`
2. Rodar `npm run codegen`
3. Atualizar `mapping.ts`
4. Rebuild e redeploy

## 📄 Licença

MIT
