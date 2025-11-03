# Constituição 2.0 - Frontend

Interface Web3 para o sistema de governança on-chain da Constituição 2.0.

## 🚀 Funcionalidades

- ✅ Conexão de carteira via RainbowKit
- ✅ Visualização de propostas ativas
- ✅ Criação de novas propostas (BIPs)
- ✅ Votação com 4 funções diferentes
- ✅ Dashboard com estatísticas em tempo real
- ✅ Integração com IPFS para armazenamento
- ✅ Suporte a The Graph para queries rápidas

## 📦 Instalação

```bash
cd frontend
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_FEDERATION_VOTING_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/constituicao2.0
NEXT_PUBLIC_IPFS_GATEWAY=http://localhost:8080/ipfs/
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

### Produção

```bash
npm run build
npm start
```

## 🎨 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Web3**: Wagmi v2 + Viem
- **Wallet Connection**: RainbowKit
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **GraphQL**: Apollo Client (para The Graph)
- **IPFS**: ipfs-http-client

## 📂 Estrutura

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Layout raiz
│   │   ├── page.tsx         # Página principal
│   │   ├── globals.css      # Estilos globais
│   │   └── providers.tsx    # Providers (Wagmi, RainbowKit)
│   ├── components/          # Componentes React
│   │   ├── ProposalsList.tsx
│   │   ├── ProposalCard.tsx
│   │   ├── CreateProposal.tsx
│   │   ├── VoteModal.tsx
│   │   └── VotingStats.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useProposals.ts
│   │   ├── useVoting.ts
│   │   └── useIPFS.ts
│   ├── lib/                 # Utilitários
│   │   ├── contracts.ts     # ABIs e endereços
│   │   ├── ipfs.ts          # Cliente IPFS
│   │   └── graph.ts         # Cliente The Graph
│   └── types/               # TypeScript types
│       └── generated/       # Types gerados do Typechain
├── public/                  # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.mjs
```

## 🎯 Componentes Principais

### ProposalsList
Lista todas as propostas ativas com filtros e paginação.

### CreateProposal
Formulário para criar novas propostas (BIPs) com upload para IPFS.

### VoteModal
Modal para votar em propostas com preview do poder de voto baseado na função matemática.

### VotingStats
Dashboard com estatísticas:
- Total de propostas
- Taxa de participação
- Distribuição de tipos de voto
- Gráficos de votação ao longo do tempo

## 🔗 Integração com Contratos

Os contratos são importados automaticamente de `../contracts/out/`:

```typescript
import FederationVotingABI from '@/lib/abis/FederationVoting.json';
import GovernanceTokenABI from '@/lib/abis/GovernanceToken.json';
```

## 🌐 Redes Suportadas

- Hardhat (local development) - Chain ID: 31337
- Sepolia (testnet) - Chain ID: 11155111
- Ethereum Mainnet - Chain ID: 1

## 📱 Responsivo

O frontend é totalmente responsivo e funciona em:
- 🖥️ Desktop
- 📱 Mobile
- 📲 Tablet

## 🎨 Temas

Suporta tema claro e escuro com detecção automática das preferências do sistema.

## 🧪 Testes

```bash
npm run test
```

## 📄 Licença

MIT
