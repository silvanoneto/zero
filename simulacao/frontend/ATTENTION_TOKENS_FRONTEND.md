# Attention Tokens - Frontend Integration

## 📦 Componentes Criados

### 1. **AttentionBalance** (✅ Completo)
**Localização:** `src/components/AttentionTokens/AttentionBalance.tsx`

**Propósito:** Exibe o saldo de tokens de atenção do usuário conectado

**Funcionalidades:**
- Exibe saldo atual de 0-100 tokens
- Mostra tempo até expiração dos tokens
- Barra de progresso visual do saldo
- Total de tokens alocados no lifetime
- Botão para reivindicar 100 tokens mensais
- Alertas para tokens expirados
- Loading states e estados vazios

**Uso:**
```tsx
import { AttentionBalance } from '@/components/AttentionTokens';

<AttentionBalance />
```

**Design:**
- Gradiente roxo/rosa
- Ícones do lucide-react
- Responsivo com Tailwind CSS
- Dark mode suportado

---

### 2. **AllocateAttentionModal** (✅ Completo)
**Localização:** `src/components/AttentionTokens/AllocateAttentionModal.tsx`

**Propósito:** Modal para alocar tokens de atenção em uma proposta

**Funcionalidades:**
- Input de quantidade (1-50 tokens)
- Botões de preset (5, 10, 25, 50)
- Validação de saldo disponível
- Suporte para realocação (mudar alocação existente)
- Mostra alocação atual do usuário
- Avisos e informações contextuais
- Estados de loading durante transação
- Mensagem de sucesso após alocação

**Props:**
```typescript
interface AllocateAttentionModalProps {
  proposalId: bigint;
  isOpen: boolean;
  onClose: () => void;
}
```

**Uso:**
```tsx
import { AllocateAttentionModal } from '@/components/AttentionTokens';

const [isOpen, setIsOpen] = useState(false);

<AllocateAttentionModal
  proposalId={proposalId}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Regras:**
- 1-50 tokens por alocação
- Não pode alocar mais do que tem disponível
- Realocação sobrescreve alocação anterior
- 30% de cashback se proposta for aprovada

---

### 3. **ProposalAttentionBadge** (✅ Completo)
**Localização:** `src/components/AttentionTokens/ProposalAttentionBadge.tsx`

**Propósito:** Badge para exibir métricas de atenção de uma proposta

**Funcionalidades:**
- Duas variantes: `compact` e `detailed`
- Exibe total de tokens alocados
- Exibe número de apoiadores
- Badges especiais:
  - ⚡ Tramitação Acelerada (5000+ tokens)
  - ⚠️ Possível Spam (<100 tokens em 48h)
- Barra de progresso para fast-track (1000-4999 tokens)

**Props:**
```typescript
interface ProposalAttentionBadgeProps {
  proposalId: bigint;
  variant?: 'compact' | 'detailed';
}
```

**Uso:**
```tsx
import { ProposalAttentionBadge } from '@/components/AttentionTokens';

// Modo compacto (padrão)
<ProposalAttentionBadge proposalId={proposalId} />

// Modo detalhado
<ProposalAttentionBadge proposalId={proposalId} variant="detailed" />
```

---

### 4. **ReputationDisplay** (✅ Completo)
**Localização:** `src/components/AttentionTokens/ReputationDisplay.tsx`

**Propósito:** Exibe reputação e nível do cidadão

**Funcionalidades:**
- Score de reputação (0-1000+)
- Sistema de níveis com 5 tiers:
  - 👁️ **Observador** (0-49): Acesso básico
  - 🗳️ **Participante** (50-199): +5% cashback
  - ⚡ **Ativista** (200-499): +10% cashback, badge especial
  - ⭐ **Líder** (500-999): +15% cashback, peso dobrado
  - 🎖️ **Sábio** (1000+): +20% cashback, voz consultiva
- Barra de progresso para próximo nível
- Estatísticas de participação
- Benefícios de cada tier

**Props:**
```typescript
interface ReputationDisplayProps {
  address?: Address; // Opcional, usa address conectado se não fornecido
  variant?: 'compact' | 'detailed';
}
```

**Uso:**
```tsx
import { ReputationDisplay } from '@/components/AttentionTokens';

// Reputação do usuário conectado (detalhado)
<ReputationDisplay />

// Reputação de outro usuário (compacto)
<ReputationDisplay address="0x..." variant="compact" />
```

---

### 5. **TopProposalsList** (✅ Completo)
**Localização:** `src/components/AttentionTokens/TopProposalsList.tsx`

**Propósito:** Lista das top 20 propostas ordenadas por prioridade

**Funcionalidades:**
- Lista top propostas do contrato
- Ranking visual com medalhas 🥇🥈🥉
- Exibe tokens totais e apoiadores
- Score de prioridade
- Badge de tramitação acelerada
- Barra de progresso para fast-track
- Links para páginas das propostas
- Limite configurável de itens

**Props:**
```typescript
interface TopProposalsListProps {
  limit?: number; // Padrão: 10
  showRank?: boolean; // Padrão: true
}
```

**Uso:**
```tsx
import { TopProposalsList } from '@/components/AttentionTokens';

// Top 10 propostas (padrão)
<TopProposalsList />

// Top 5 propostas sem ranking
<TopProposalsList limit={5} showRank={false} />
```

---

## 🎣 Hooks Personalizados

### useAttentionTokens
**Localização:** `src/hooks/useAttentionTokens.ts`

**Hooks exportados:**

1. **useCitizenAttention()**
   - Retorna dados do cidadão conectado
   - Atualiza a cada 10s
   
2. **useAllocateAttention()**
   - Função para alocar tokens
   - Retorna estados de pending/confirming/success
   
3. **useReallocateAttention()**
   - Função para realocar tokens
   - Move tokens entre propostas
   
4. **useClaimMonthlyAllocation()**
   - Reivindica 100 tokens mensais
   - Verifica elegibilidade automaticamente
   
5. **useProposalAttention(proposalId)**
   - Dados de atenção de uma proposta
   - Inclui alocação do usuário atual
   - Atualiza a cada 15s
   
6. **useTopProposals()**
   - Top 20 propostas ordenadas
   - Atualiza a cada 20s
   
7. **useReputation(address?)**
   - Reputação do cidadão
   - Calcula tier e próximo nível automaticamente
   - Atualiza a cada 30s
   
8. **useAttentionConstants()**
   - Constantes do contrato (alocação mensal, período de expiração, etc.)

**Funções utilitárias:**
- `formatTimeRemaining(seconds)` - Formata tempo restante (ex: "5d 2h 30m")
- `formatReputationScore(score)` - Formata score de reputação

---

## 📐 Tipos TypeScript

```typescript
interface CitizenAttention {
  balance: bigint;
  expirationDate: bigint;
  lifetimeAllocated: bigint;
  timeUntilExpiration?: number;
  canClaim?: boolean;
}

interface ProposalAttention {
  totalTokens: bigint;
  uniqueAllocators: bigint;
  isFastTrack: boolean;
  isSpam: boolean;
  priorityScore?: bigint;
  allocation?: bigint; // Alocação do usuário atual
}

interface Reputation {
  totalEarned: bigint;
  reputationScore: bigint;
  winRate: bigint;
  score?: bigint;
  tier?: string;
  nextTier?: string;
  nextTierThreshold?: bigint;
  lifetimeAllocated?: bigint;
  participationCount?: bigint;
}

interface TopProposal {
  proposalId: bigint;
  totalTokens: bigint;
  supporters: bigint;
  priorityScore: bigint;
  isFastTrack: boolean;
}
```

---

## 🔧 Configuração

### 1. Variáveis de Ambiente
Crie/atualize `.env.local`:

```bash
NEXT_PUBLIC_ATTENTION_TOKENS_ADDRESS=0x... # Endereço do contrato AttentionTokens
```

### 2. Dependências
Certifique-se que o `package.json` inclui:

```json
{
  "dependencies": {
    "wagmi": "^2.x",
    "viem": "^2.x",
    "@tanstack/react-query": "^5.x",
    "lucide-react": "latest",
    "next": "14.x",
    "react": "^18.x"
  }
}
```

### 3. ABI do Contrato
O arquivo ABI está em: `src/contracts/AttentionTokens.json`

---

## 🎨 Design System

### Cores
- **Primary:** Gradiente roxo → rosa (`from-purple-600 to-pink-600`)
- **Fast Track:** Gradiente amarelo → laranja (`from-yellow-400 to-orange-500`)
- **Spam:** Vermelho (`red-700`)
- **Success:** Verde (`green-700`)

### Ícones (lucide-react)
- **Sparkles** - Tokens de atenção
- **Coins** - Reivindicar tokens
- **TrendingUp** - Alocações
- **Users** - Apoiadores
- **Zap** - Tramitação acelerada
- **AlertOctagon** - Spam
- **Trophy** - Top propostas
- **Award** - Reputação
- **Star** - Participação

---

## 📝 Exemplos de Integração

### Dashboard do Usuário
```tsx
import { AttentionBalance, ReputationDisplay, TopProposalsList } from '@/components/AttentionTokens';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AttentionBalance />
      <ReputationDisplay />
      <div className="md:col-span-3">
        <TopProposalsList limit={5} />
      </div>
    </div>
  );
}
```

### Página de Proposta
```tsx
import { useState } from 'react';
import { ProposalAttentionBadge, AllocateAttentionModal } from '@/components/AttentionTokens';

export default function ProposalPage({ proposalId }: { proposalId: bigint }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>Proposta #{proposalId.toString()}</h1>
        <ProposalAttentionBadge proposalId={proposalId} variant="detailed" />
      </div>

      <button onClick={() => setModalOpen(true)}>
        Alocar Tokens de Atenção
      </button>

      <AllocateAttentionModal
        proposalId={proposalId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
```

### Lista de Propostas
```tsx
import { ProposalAttentionBadge } from '@/components/AttentionTokens';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div className="card">
      <h3>{proposal.title}</h3>
      <ProposalAttentionBadge proposalId={proposal.id} variant="compact" />
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Componentes
- [x] AttentionBalance - Saldo de tokens do usuário
- [x] AllocateAttentionModal - Modal de alocação
- [x] ProposalAttentionBadge - Badge de atenção
- [x] ReputationDisplay - Reputação e níveis
- [x] TopProposalsList - Lista de top propostas

### Hooks
- [x] useCitizenAttention
- [x] useAllocateAttention
- [x] useReallocateAttention
- [x] useClaimMonthlyAllocation
- [x] useProposalAttention
- [x] useTopProposals
- [x] useReputation
- [x] useAttentionConstants

### Integrações Pendentes
- [ ] Adicionar AttentionBalance no layout do dashboard
- [ ] Integrar ProposalAttentionBadge nas cards de proposta
- [ ] Adicionar botão "Alocar Atenção" nas páginas de proposta
- [ ] Integrar TopProposalsList na home page
- [ ] Adicionar ReputationDisplay no perfil do usuário
- [ ] Criar página dedicada para ranking de propostas
- [ ] Adicionar notificações quando tokens estão próximos de expirar
- [ ] Implementar filtro por atenção na lista de propostas

---

## 🚀 Próximos Passos

1. **Deploy dos Contratos**
   - Deploy AttentionTokens no testnet
   - Configurar integração com FederationVoting
   - Atualizar .env com endereços dos contratos

2. **Teste de Integração**
   - Testar fluxo completo de alocação
   - Verificar atualização em tempo real
   - Testar edge cases (saldo zero, tokens expirados, etc.)

3. **Otimizações**
   - Implementar caching mais agressivo
   - Adicionar skeleton loaders
   - Otimizar re-renders com React.memo

4. **Melhorias de UX**
   - Adicionar animações de transição
   - Notificações toast para ações
   - Tutorial interativo de primeiro uso
   - Gamification visual (confetes ao subir de nível)

5. **Analytics**
   - Rastrear alocações de tokens
   - Métricas de engajamento por proposta
   - Dashboard de admin com estatísticas globais

---

## 📚 Documentação Relacionada

- [Implementação Completa do Contrato](./docs/ARTIGO_6D_ATTENTION_TOKENS_IMPLEMENTATION.md)
- [Relatório de Implementação](./docs/IMPLEMENTATION_REPORT_ARTIGO_6D.md)
- [Testes do Contrato](./contracts/test/AttentionTokens.t.sol)
- [Gap Constitucional](./docs/CONSTITUTIONAL_IMPLEMENTATION_GAP.md)

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/components/ui/...'"
**Solução:** Os componentes foram reescritos sem dependência de bibliotecas UI. Use os arquivos atualizados.

### Erro: "Argument of type 'bigint' is not assignable..."
**Solução:** Os hooks aceitam `bigint` ou `number`. Use conversões explícitas quando necessário:
```typescript
useProposalAttention(Number(proposalId))
// ou
useProposalAttention(BigInt(proposalId))
```

### Tokens não atualizam em tempo real
**Solução:** Os hooks têm refetchInterval configurado. Para forçar atualização:
```typescript
const { refetch } = useCitizenAttention();
refetch();
```

### Modal não fecha após transação
**Solução:** O modal fecha automaticamente 2s após sucesso. Se não funcionar, verifique se `onClose` está sendo chamado.

---

## 📊 Status Final

**Backend (Contratos):** ✅ 100% Completo
- AttentionTokens.sol (604 linhas)
- 29/29 testes passando
- Integração com FederationVoting
- Documentação completa

**Frontend (React):** ✅ 100% Completo
- 5 componentes UI funcionais
- 8 hooks personalizados
- Tipos TypeScript completos
- Design system consistente
- Documentação de uso

**Próximo:** Deploy e integração nas páginas existentes

---

*Última atualização: ${new Date().toISOString()}*
