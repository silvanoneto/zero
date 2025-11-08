# 🚀 Deploy para GitHub Pages - Modo Demo

Este documento explica como o frontend está configurado para funcionar no GitHub Pages com armazenamento local.

## 📋 Configuração

### Modo Demo vs. Modo Produção

O frontend pode operar em dois modos:

#### **Modo Demo (GitHub Pages)**
- ✅ Usa `localStorage` do navegador
- ✅ Não requer blockchain ou IPFS
- ✅ Propostas de demonstração pré-carregadas
- ✅ Totalmente funcional para demonstração
- ⚙️ Ativado por: `NEXT_PUBLIC_DEMO_MODE=true`

#### **Modo Produção (Docker/Local)**
- 🔗 Usa smart contracts blockchain
- 🌐 Usa IPFS/Helia para armazenamento
- 📊 Usa The Graph para queries
- ⚙️ Ativado por: `NEXT_PUBLIC_DEMO_MODE=false`

## 🔧 Como Funciona

### Armazenamento Local

No modo demo, o arquivo `src/hooks/useLocalStorage.ts` implementa:

1. **LocalStorageAdapter**: Gerencia propostas no localStorage
2. **Dados Demo**: Propostas de exemplo pré-carregadas
3. **CRUD Completo**: Criar, ler, atualizar propostas
4. **Votação**: Simula votação com contadores locais

### Hooks Adaptados

#### `useProposals`
```typescript
// Detecta modo demo e usa localStorage
if (DEMO_MODE) {
  const storedProposals = LocalStorageAdapter.getProposals();
  // ... retorna propostas do localStorage
}
```

#### `useCreateProposal`
```typescript
// Em modo demo, salva no localStorage ao invés do contrato
if (DEMO_MODE) {
  LocalStorageAdapter.saveProposal({
    title,
    description,
    // ... demais campos
  });
}
```

## 🚀 Deploy Automático

O workflow `.github/workflows/gh-pages.yml` faz:

1. ✅ Valida arquivos gerados
2. 📦 Instala dependências do frontend
3. 🏗️ Build do Next.js com `NEXT_PUBLIC_DEMO_MODE=true`
4. 📤 Exporta site estático
5. 🌐 Deploy no branch `gh-pages`

### Comando Manual

Para testar localmente:

```bash
cd frontend

# Define modo demo
export NEXT_PUBLIC_DEMO_MODE=true

# Build e export
npm run build

# Serve localmente (usando 'serve' ou similar)
npx serve out
```

## 📝 Estrutura de Dados

### Proposta no localStorage

```typescript
interface StoredProposal {
  id: number;
  title: string;
  description: string;
  ipfsHash: string; // Hash simulado
  proposer: string;
  voteType: 'LINEAR' | 'QUADRATIC' | 'LOGARITHMIC' | 'CONSENSUS';
  startTime: number; // timestamp em ms
  endTime: number;
  votesFor: string; // BigInt como string
  votesAgainst: string;
  totalVoters: number;
  state: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED';
  tags?: {
    isProcedural?: boolean;
    isResourceAllocation?: boolean;
    isTechnical?: boolean;
    isEthical?: boolean;
    budgetImpact?: string;
    requiresExpertise?: boolean;
  };
}
```

### Chaves do localStorage

- `revolucao_cibernetica_proposals`: Array de propostas
- `revolucao_cibernetica_proposal_counter`: Contador de IDs

## 🎯 Funcionalidades Demo

### Propostas Pré-carregadas

Ao acessar pela primeira vez, três propostas demo são criadas:

1. **Sistema de Reputação Descentralizada** (Quadratic Voting)
2. **Alocar Recursos para Educação Digital** (Linear Voting)
3. **Código de Ética para IA** (Consensus Voting)

### Criar Nova Proposta

Usuários podem criar novas propostas que são:
- ✅ Salvas no localStorage
- ✅ Persistem entre sessões
- ✅ Visíveis imediatamente
- ✅ Sincronizadas apenas no mesmo navegador

### Limitações do Modo Demo

- ⚠️ Dados são locais (não compartilhados entre usuários)
- ⚠️ Limpeza de dados do navegador apaga propostas
- ⚠️ Não há carteira Web3 real
- ⚠️ Votação é simulada (sem blockchain)

## 🔄 Migrando para Produção

Para usar o modo produção com blockchain:

1. Configure as variáveis de ambiente:
```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
# ... outras variáveis
```

2. Suba os serviços necessários:
```bash
cd ..
docker-compose up -d
```

3. Deploy dos contratos:
```bash
cd contracts
make deploy-local
```

4. Execute o frontend:
```bash
cd ../frontend
npm run dev
```

## 🐛 Debug

### Ver dados do localStorage

Abra o DevTools do navegador:

```javascript
// Console
localStorage.getItem('revolucao_cibernetica_proposals')
localStorage.getItem('revolucao_cibernetica_proposal_counter')
```

### Limpar dados

```javascript
// Console
localStorage.removeItem('revolucao_cibernetica_proposals')
localStorage.removeItem('revolucao_cibernetica_proposal_counter')
// ou
localStorage.clear()
```

### Reiniciar dados demo

```javascript
// Console
import { LocalStorageAdapter } from './src/hooks/useLocalStorage'
LocalStorageAdapter.clearAll()
LocalStorageAdapter.initializeDemoData()
```

## 📚 Links Úteis

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages](https://pages.github.com/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 🤝 Contribuindo

Para adicionar mais funcionalidades ao modo demo:

1. Edite `src/hooks/useLocalStorage.ts`
2. Adicione métodos ao `LocalStorageAdapter`
3. Atualize hooks relevantes para detectar `DEMO_MODE`
4. Teste localmente antes de fazer push

---

**Nota**: O modo demo é apenas para demonstração. Para uso em produção, configure os serviços completos com blockchain, IPFS e The Graph.
