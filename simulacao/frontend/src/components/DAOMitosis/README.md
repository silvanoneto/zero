# Componentes Frontend - Sistema de Mitose (Artigo 5º-C)

## 📦 Componentes Criados

### 1. DAOStatusCard
Exibe o status atual da DAO com indicadores visuais do limite de Dunbar.

**Funcionalidades:**
- 📊 Contador de membros ativos vs limite
- 📈 Barra de progresso colorida (verde → amarelo → vermelho)
- ⚠️ Alertas quando aproxima do limite (450 membros)
- 🏷️ Badge de status (Ativa, Alerta, Votação, etc.)
- 📱 Responsivo e com dark mode

**Props:**
```typescript
{
  daoId: bigint;              // ID da DAO
  daoMitosisAddress: `0x${string}`; // Endereço do contrato
}
```

**Estados da DAO:**
- ✅ **ACTIVE**: Operação normal (< 450 membros)
- ⚠️ **WARNING**: Alerta Dunbar (450-499 membros)
- 🗳️ **MITOSIS_VOTE**: Votação em andamento (≥ 500 membros)
- 🔄 **SPLITTING**: Processo de divisão em execução
- 📚 **LEGACY**: DAO dividida, veja as filhas

---

### 2. MitosisVoting
Interface de votação para escolher o critério de divisão da DAO.

**Funcionalidades:**
- 🗳️ 4 critérios de divisão com descrições
- 📊 Resultados em tempo real com barras de progresso
- ⏰ Contador de tempo restante
- ✅ Confirmação de voto com feedback visual
- 🔄 Loading states durante transações

**Critérios de Divisão:**
1. ❤️ **Afinidade**: Grupos de interesse e conexões sociais
2. 🧠 **Cognitivo**: Áreas de expertise e conhecimento
3. 🎲 **Aleatório**: Divisão aleatória para diversidade
4. ⏰ **Temporal**: Veteranos vs novatos (tempo de entrada)

**Props:**
```typescript
{
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
}
```

---

### 3. DAOGenealogyTree
Visualização hierárquica da árvore genealógica de DAOs.

**Funcionalidades:**
- 🌳 Árvore expansível/colapsável
- 🔗 Links para navegar entre DAOs
- 📊 Indicadores de status para cada nó
- 🏷️ Badges de geração (Gen 0, Gen 1, etc.)
- 📱 Recursivo para múltiplas gerações

**Props:**
```typescript
{
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
}
```

---

## 🚀 Como Usar

### 1. Instalação

Os componentes já estão criados em `src/components/DAOMitosis/`.

```bash
# Dependências necessárias (já instaladas)
npm install wagmi viem date-fns
```

### 2. Configuração

Adicione o endereço do contrato no `.env.local`:

```bash
NEXT_PUBLIC_DAO_MITOSIS_ADDRESS=0x...
```

### 3. Importação

```typescript
import { 
  DAOStatusCard, 
  MitosisVoting, 
  DAOGenealogyTree 
} from '@/components/DAOMitosis';
```

### 4. Uso Básico

```tsx
export default function MyDAOPage() {
  const daoId = 1n;
  const daoMitosisAddress = process.env.NEXT_PUBLIC_DAO_MITOSIS_ADDRESS as `0x${string}`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <DAOStatusCard 
        daoId={daoId}
        daoMitosisAddress={daoMitosisAddress}
      />
      
      <MitosisVoting
        daoId={daoId}
        daoMitosisAddress={daoMitosisAddress}
      />
      
      <DAOGenealogyTree
        daoId={daoId}
        daoMitosisAddress={daoMitosisAddress}
      />
    </div>
  );
}
```

---

## 📄 Página de Exemplo

Uma página completa de demonstração foi criada em:
```
src/app/dao-mitosis/page.tsx
```

Acesse em: `http://localhost:3000/dao-mitosis`

**Recursos da página:**
- 🎯 Seletor de DAO por ID
- 📊 Layout em grid responsivo
- 📚 Card informativo sobre o Artigo 5º-C
- 🛡️ Seção de proteções de segurança
- 🌓 Suporte a dark mode

---

## 🎨 Customização

### Cores e Temas

Os componentes usam Tailwind CSS com dark mode:

```typescript
// Exemplo: Customizar cores do status
const STATUS_INFO = {
  ACTIVE: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    // ...
  },
};
```

### Limites e Constantes

```typescript
const DUNBAR_LIMIT = 500;        // Limite máximo de membros
const WARNING_THRESHOLD = 450;   // Quando começa o alerta
```

---

## 🔌 Integrações

### Com FederationVoting

```typescript
// Votar em proposta registra atividade automaticamente
import { FederationVoting } from '@/components';

<FederationVoting onVoteSuccess={() => {
  // Atividade registrada no DAOMitosis automaticamente
  // via smart contract integration
}} />
```

### Com GovernanceToken

```typescript
// Tokens são distribuídos 1:1 durante mitose
// Não requer código adicional - acontece automaticamente no contrato
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

### 1. Sem contrato (UI apenas)

Os componentes mostram estados de loading/empty quando não conectado.

### 2. Com contrato na testnet

```bash
# Configure o endereço
echo "NEXT_PUBLIC_DAO_MITOSIS_ADDRESS=0x..." >> .env.local

# Inicie o servidor
npm run dev
```

### 3. Testar diferentes estados

Você pode simular diferentes estados da DAO usando o ID:
- DAO ID 1: Estado ACTIVE
- DAO ID 2: Estado WARNING
- DAO ID 3: Estado MITOSIS_VOTE (se configurado nos testes)

---

## 🎯 Próximos Passos

### Melhorias Futuras

1. **Notificações em Tempo Real**
   - [ ] WebSocket para atualização automática
   - [ ] Toast notifications para eventos
   - [ ] Sound alerts para mitose iniciada

2. **Visualizações Avançadas**
   - [ ] Gráfico de crescimento de membros
   - [ ] Heatmap de atividade
   - [ ] Timeline de eventos da DAO

3. **Interações Sociais**
   - [ ] Perfis de membros
   - [ ] Chat durante votação
   - [ ] Fórum de discussão sobre divisão

4. **Analytics**
   - [ ] Dashboard de métricas
   - [ ] Histórico de mitoses
   - [ ] Comparação entre gerações

---

## 🐛 Troubleshooting

### Componente não carrega

**Problema**: "DAO não encontrada"
**Solução**: Verifique se o `daoId` existe e se o endereço do contrato está correto.

### Votação não funciona

**Problema**: Botão desabilitado
**Solução**: 
1. Certifique-se de que está conectado com wallet
2. Verifique se é um membro ativo da DAO
3. Confirme que o período de votação está ativo

### Dark mode não funciona

**Problema**: Cores não mudam
**Solução**: Certifique-se de que o Tailwind dark mode está configurado no `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class', // ou 'media'
  // ...
};
```

---

## 📚 Referências

- **Artigo 5º-C**: [ARTIGO_5C_MITOSIS_IMPLEMENTATION.md](../../contracts/ARTIGO_5C_MITOSIS_IMPLEMENTATION.md)
- **Smart Contracts**: [DAOMitosis.sol](../../contracts/DAOMitosis.sol)
- **Testes**: [Integration Tests](../../contracts/test/)
- **Wagmi Docs**: https://wagmi.sh
- **Tailwind CSS**: https://tailwindcss.com

---

## 💡 Contribuindo

Sinta-se livre para:
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🎨 Propor novos designs
- 📝 Melhorar documentação

---

**Desenvolvido com ❤️ para a Revolução Cibernética**
*Artigo 5º-C: Limites de Dunbar e Mitose Organizacional*
