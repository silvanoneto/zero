# Componentes Frontend - Sistema de Votação Federal

## 📦 Componentes Criados

### 1. ProposalCard
Exibe uma proposta com resultados de votação em tempo real.

**Funcionalidades:**
- 📊 Status visual (Ativa, Encerrada, Executada, Cancelada)
- 📈 Barras de progresso para cada tipo de voto
- ⏰ Contador de tempo restante
- 👤 Informações do propositor
- 🗳️ Botão para votar (apenas em propostas ativas)

**Props:**
```typescript
{
  proposalId: bigint;              // ID da proposta
  votingAddress: `0x${string}`;    // Endereço do contrato
  onVote: (proposalId: bigint) => void; // Callback ao clicar em votar
}
```

**Estados da Proposta:**
- ✅ **ATIVA**: Votação em andamento
- ⏰ **AGENDADA**: Ainda não iniciou
- 🔴 **ENCERRADA**: Período de votação terminou
- ✅ **EXECUTADA**: Proposta foi executada
- ❌ **CANCELADA**: Proposta foi cancelada

---

### 2. VoteModal
Modal interativo para registrar voto em uma proposta.

**Funcionalidades:**
- 🎯 3 opções de voto com descrições
- 🔄 Estados de loading durante transação
- ✅ Confirmação de sucesso
- 🔒 Prevenção de duplo voto
- 💡 Avisos informativos

**Opções de Voto:**
- ✅ **A Favor** (support: 1): Aprovo a proposta
- ❌ **Contra** (support: 0): Rejeito a proposta
- ⚪ **Abstenção** (support: 2): Neutro

**Props:**
```typescript
{
  proposalId: bigint;
  votingAddress: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

---

### 3. VotingStats
Painel de estatísticas do sistema de votação.

**Exibe:**
- 📋 Total de propostas criadas
- ✓ Quorum necessário para aprovação
- ⏰ Duração padrão da votação

**Props:**
```typescript
{
  votingAddress: `0x${string}`;
}
```

---

## 🚀 Como Usar

### 1. Instalação

Os componentes já estão criados em `src/components/FederationVoting/`.

### 2. Configuração

Adicione o endereço do contrato no `.env.local`:

```bash
NEXT_PUBLIC_FEDERATION_VOTING_ADDRESS=0x...
```

### 3. Importação

```typescript
import { 
  ProposalCard, 
  VoteModal, 
  VotingStats 
} from '@/components/FederationVoting';
```

### 4. Uso Básico

```tsx
export default function VotingPage() {
  const [selectedProposal, setSelectedProposal] = useState<bigint | null>(null);
  const votingAddress = process.env.NEXT_PUBLIC_FEDERATION_VOTING_ADDRESS as `0x${string}`;

  return (
    <div>
      {/* Estatísticas */}
      <VotingStats votingAddress={votingAddress} />
      
      {/* Lista de Propostas */}
      <ProposalCard 
        proposalId={1n}
        votingAddress={votingAddress}
        onVote={(id) => setSelectedProposal(id)}
      />
      
      {/* Modal de Votação */}
      {selectedProposal && (
        <VoteModal
          proposalId={selectedProposal}
          votingAddress={votingAddress}
          isOpen={true}
          onClose={() => setSelectedProposal(null)}
          onSuccess={() => {
            // Atualizar dados
            setSelectedProposal(null);
          }}
        />
      )}
    </div>
  );
}
```

---

## 📄 Página de Exemplo

Uma página completa de demonstração foi criada em:
```
src/app/federation-voting/page.tsx
```

Acesse em: `http://localhost:3000/federation-voting`

**Recursos da página:**
- 📊 Estatísticas do sistema
- 📋 Lista de todas as propostas
- 🗳️ Interface de votação
- 📚 Informações educacionais
- 🔄 Integração com sistema de mitose

---

## 🎨 Customização

### Cores dos Status

```typescript
// Status da proposta
const STATUS_COLORS = {
  ACTIVE: 'bg-blue-500',
  SCHEDULED: 'bg-yellow-500',
  ENDED: 'bg-red-500',
  EXECUTED: 'bg-green-500',
  CANCELED: 'bg-gray-500',
};
```

### Cores dos Votos

```typescript
// Tipos de voto
const VOTE_COLORS = {
  FOR: 'text-green-400',      // A Favor
  AGAINST: 'text-red-400',    // Contra
  ABSTAIN: 'text-gray-400',   // Abstenção
};
```

---

## 🔌 Integrações

### Com DAOMitosis

O sistema de votação está integrado com o sistema de mitose:

```solidity
// FederationVoting.sol
function vote(uint256 proposalId, uint8 support) external {
    // ... lógica de votação ...
    
    // Registrar atividade no sistema de mitose
    if (address(daoMitosis) != address(0)) {
        try daoMitosis.recordActivity(daoId, msg.sender) {} catch {}
    }
}
```

Isso significa que:
- ✅ Cada voto registra atividade do membro
- ✅ Mantém contador de membros ativos atualizado
- ✅ Influencia decisões de mitose da DAO

### Com GovernanceToken

```typescript
// Peso do voto pode ser baseado em tokens de governança
// (se implementado no contrato)
```

---

## 📊 Estados e Loading

Todos os componentes incluem:
- ⏳ **Loading states**: Skeleton loaders enquanto carrega
- ❌ **Error states**: Mensagens amigáveis para erros
- 🔄 **Transaction states**: Feedback durante transações
- ✅ **Success states**: Confirmações visuais

---

## 🧪 Testando Localmente

### 1. Com contrato local (Anvil)

```bash
# Terminal 1: Inicie o Anvil
cd contracts
make anvil

# Terminal 2: Deploy os contratos
make deploy-local

# Terminal 3: Inicie o frontend
cd frontend
npm run dev
```

### 2. Criar proposta de teste

```bash
# No terminal com Anvil rodando
cast send $VOTING_ADDRESS "createProposal(string)" \
  "Proposta de Teste #1" \
  --private-key $PRIVATE_KEY
```

### 3. Votar na proposta

Use a interface web em `http://localhost:3000/federation-voting`

---

## 🎯 Próximos Passos

### Melhorias Futuras

1. **Filtros e Busca**
   - [ ] Filtrar por status (ativa, encerrada, etc.)
   - [ ] Buscar por palavra-chave na descrição
   - [ ] Ordenar por data/votos

2. **Detalhes Expandidos**
   - [ ] Ver lista de votantes
   - [ ] Histórico de mudanças na proposta
   - [ ] Comentários e discussões

3. **Notificações**
   - [ ] Alerta quando nova proposta é criada
   - [ ] Lembrete para votar em propostas próximas do fim
   - [ ] Notificação de execução de proposta

4. **Analytics**
   - [ ] Gráficos de participação ao longo do tempo
   - [ ] Taxa de aprovação por tipo de proposta
   - [ ] Análise de comportamento de votantes

5. **Criação de Propostas**
   - [ ] Interface para criar novas propostas
   - [ ] Editor rich text para descrições
   - [ ] Preview antes de publicar
   - [ ] Templates de propostas comuns

---

## 🐛 Troubleshooting

### Componente não carrega

**Problema**: "Proposta não encontrada"
**Solução**: Verifique se o `proposalId` existe e se o endereço do contrato está correto.

### Votação não funciona

**Problema**: Botão desabilitado ou erro
**Solução**: 
1. Certifique-se de que está conectado com wallet
2. Verifique se a proposta está ativa
3. Confirme que você é um membro autorizado

### Modal não abre

**Problema**: Click no botão de votar não abre modal
**Solução**: 
1. Verifique se `isOpen` prop está sendo controlado corretamente
2. Confirme que `onVote` callback está definido
3. Veja o console para erros de estado

---

## 📚 Referências

- **FederationVoting.sol**: [Contrato Principal](../../contracts/FederationVoting.sol)
- **Testes**: [Integration Tests](../../contracts/test/)
- **DAOMitosis Integration**: [INTEGRATION_COMPLETE.md](../../contracts/INTEGRATION_COMPLETE.md)
- **wagmi Docs**: https://wagmi.sh
- **date-fns Docs**: https://date-fns.org

---

## 💡 Contribuindo

Sinta-se livre para:
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🎨 Propor novos designs
- 📝 Melhorar documentação

---

**Desenvolvido com ❤️ para a Revolução Cibernética**
*Sistema de Votação Federal - Governança Descentralizada*
