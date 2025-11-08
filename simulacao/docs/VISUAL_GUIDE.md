# 🎨 Guia Visual - Sistema de Governança

## Navegação Principal

### Site Principal (index.html)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│          REVOLUÇÃO CIBERNÉTICA                      │
│                                                     │
│  [Ordem Zero]  [Constituição]  [Manifesto]         │
│  [🧬 Mitose]   [🗳️ Votação]                         │
│                                                     │
│  ┌──────────────┐                                   │
│  │ Sistema      │                                   │
│  │  🌐 Cybersyn │                                   │
│  │  🧬 Mitose   │ ← NOVO                            │
│  │  🗳️ Votação  │ ← NOVO                            │
│  └──────────────┘                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Cores dos Botões**:
- 🟣 Ordem Zero: Roxo
- 🔵🟣 Constituição: Roxo→Azul
- 🔴🟢 Manifesto: Vermelho→Verde
- 🟠🔴 Mitose: Laranja→Vermelho
- 🔵🟣 Votação: Azul→Roxo

---

## Sistema de Mitose

### Página: `/dao-mitosis`

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    🧬 SISTEMA DE MITOSE - ARTIGO 5º-C              │
│    Governança Escalável via Divisão Orgânica       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 STATUS DA DAO                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Membros Ativos: 125 / 150                   │   │
│  │ [████████████████░░░░] 83%                   │   │
│  │ 🟡 Aproximando do limite                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🗳️ VOTAÇÃO DE MITOSE                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ Proposta #1: Divisão por Especialização     │   │
│  │ Status: 🟢 ATIVA                             │   │
│  │                                              │   │
│  │ Votos: ✅ 45  ❌ 12                          │   │
│  │                                              │   │
│  │ Grupos Propostos:                            │   │
│  │  Grupo A (Infraestrutura): 75 membros       │   │
│  │  Grupo B (Aplicações): 50 membros           │   │
│  │                                              │   │
│  │ [Votar A Favor] [Votar Contra]              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌳 ÁRVORE GENEALÓGICA                              │
│  ┌─────────────────────────────────────────────┐   │
│  │         DAO Genesis (Gen 0)                  │   │
│  │              ↓                               │   │
│  │    ┌────────┴────────┐                       │   │
│  │  DAO A            DAO B                      │   │
│  │  (Gen 1)          (Gen 1)                    │   │
│  │    ↓                ↓                        │   │
│  │  DAO A1          DAO B1                      │   │
│  │  (Gen 2)         (Gen 2)                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Componentes**:
1. ✅ **DAOStatusCard** - Monitor de membros e limite
2. ✅ **MitosisVoting** - Interface de votação de divisão
3. ✅ **DAOGenealogyTree** - Visualização da hierarquia

**Estados da Proposta**:
- 🟡 PENDENTE - Aguardando início
- 🟢 ATIVA - Votação em andamento
- ✅ APROVADA - Aprovada, aguardando execução
- ❌ REJEITADA - Não atingiu quorum
- 🔵 EXECUTADA - Divisão completada

---

## Sistema de Votação Federal

### Página: `/federation-voting`

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    🗳️ SISTEMA DE VOTAÇÃO FEDERAL                    │
│    Governança Descentralizada e Transparente       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 ESTATÍSTICAS                                    │
│  ┌───────────┬───────────┬──────────────────┐      │
│  │ Propostas │  Quorum   │ Período Votação  │      │
│  │    42     │    20%    │     7 dias       │      │
│  └───────────┴───────────┴──────────────────┘      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📋 PROPOSTAS ATIVAS                                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📝 Proposta #8                               │   │
│  │ Atualizar Sistema de Votação                │   │
│  │                                              │   │
│  │ Status: 🟢 ATIVA                             │   │
│  │ Tempo Restante: 3 dias, 12h                 │   │
│  │                                              │   │
│  │ Resultados:                                  │   │
│  │  ✅ A Favor:   [████████░░] 45% (150)       │   │
│  │  ❌ Contra:    [███░░░░░░░] 15% (50)        │   │
│  │  ⚪ Abstenção: [████░░░░░░] 20% (70)        │   │
│  │                                              │   │
│  │ Propositor: 0x742d...89Ab                   │   │
│  │ Criado: 4 dias atrás                         │   │
│  │                                              │   │
│  │ [Votar Agora]                                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📝 Proposta #7                               │   │
│  │ Implementar Novo Recurso                    │   │
│  │                                              │   │
│  │ Status: 🔴 ENCERRADA                         │   │
│  │ Encerrou: 1 dia atrás                        │   │
│  │                                              │   │
│  │ Resultados:                                  │   │
│  │  ✅ A Favor:   [██████░░░░] 30% (100)       │   │
│  │  ❌ Contra:    [████████░░] 40% (130)       │   │
│  │  ⚪ Abstenção: [███░░░░░░░] 15% (50)        │   │
│  │                                              │   │
│  │ ❌ Não Aprovada (quorum não atingido)       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Componentes**:
1. ✅ **VotingStats** - Estatísticas do sistema
2. ✅ **ProposalCard** - Cartão de proposta com resultados
3. ✅ **VoteModal** - Modal de votação

**Estados da Proposta**:
- 🟡 AGENDADA - Ainda não iniciou
- 🟢 ATIVA - Votação aberta
- 🔴 ENCERRADA - Período terminou
- ✅ EXECUTADA - Proposta executada
- ❌ CANCELADA - Proposta cancelada

---

## Modal de Votação

### Quando clicar em "Votar Agora"

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🗳️ VOTAR NA PROPOSTA #8                            │
│                                                     │
│  Escolha sua opção de voto:                        │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ ✅ A FAVOR                                 │     │
│  │ Aprovo esta proposta                      │     │
│  │                                            │     │
│  │ [Selecionar]                               │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ ❌ CONTRA                                   │     │
│  │ Rejeito esta proposta                     │     │
│  │                                            │     │
│  │ [Selecionar]                               │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ ⚪ ABSTENÇÃO                                │     │
│  │ Prefiro não opinar                        │     │
│  │                                            │     │
│  │ [Selecionar]                               │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ℹ️ Após votar, sua decisão não pode ser          │
│  alterada. Certifique-se de sua escolha.          │
│                                                     │
│  [Cancelar]                                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Fluxo de Votação**:
1. Usuário clica em "Votar Agora"
2. Modal abre com 3 opções
3. Usuário seleciona opção
4. 🔄 Confirmação na wallet
5. ⏳ Aguarda confirmação da transação
6. ✅ Voto registrado com sucesso
7. 📊 Resultados atualizados automaticamente

---

## Cards Informativos

### Na página de votação

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  📚 COMO FUNCIONA                                   │
│  1. Qualquer membro pode criar propostas           │
│  2. Membros votam A Favor, Contra ou Abstenção    │
│  3. Proposta precisa atingir quorum (20%)          │
│  4. Após aprovação, pode ser executada             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🗳️ TIPOS DE VOTO                                   │
│  • A Favor (1): Aprovo a proposta                  │
│  • Contra (0): Rejeito a proposta                  │
│  • Abstenção (2): Neutro, não opino               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔗 INTEGRAÇÃO MITOSE                               │
│  Cada voto registra sua atividade no sistema       │
│  de mitose, mantendo o contador atualizado.        │
│  Isso ajuda a DAO a tomar decisões sobre divisão.  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Fluxo de Usuário Completo

### 1. Acesso Inicial

```
Usuário acessa index.html
  ↓
Vê botões principais
  ↓
Clica em [🧬 Sistema de Mitose]
  ou
Clica em [🗳️ Sistema de Votação]
```

### 2. Fluxo: Sistema de Mitose

```
Entra em /dao-mitosis
  ↓
Conecta wallet
  ↓
Vê status da DAO (membros/limite)
  ↓
Se próximo do limite:
  ↓
  Vê proposta de divisão ativa
    ↓
    Revisa grupos propostos
      ↓
      Vota A Favor ou Contra
        ↓
        Aguarda execução
          ↓
          DAO divide em 2 novas DAOs
            ↓
            Visualiza árvore atualizada
```

### 3. Fluxo: Sistema de Votação

```
Entra em /federation-voting
  ↓
Conecta wallet
  ↓
Vê estatísticas gerais
  ↓
Navega lista de propostas
  ↓
Clica em proposta de interesse
  ↓
Lê descrição e resultados atuais
  ↓
Clica em [Votar Agora]
  ↓
Escolhe opção (A Favor/Contra/Abstenção)
  ↓
Confirma na wallet
  ↓
Aguarda confirmação blockchain
  ↓
✅ Voto registrado
  ↓
📊 Resultados atualizam automaticamente
  ↓
🧬 Atividade registrada no sistema de mitose
```

### 4. Cross-Navigation

```
Usuário em /federation-voting
  ↓
Vê card "Integração Mitose"
  ↓
Clica no link
  ↓
Navegado para /dao-mitosis
  ↓
(e vice-versa)
```

---

## Paleta de Cores

### Sistema de Mitose
- **Primária**: 🟠 Laranja (#f97316)
- **Secundária**: 🔴 Vermelho (#ef4444)
- **Status**: 
  - 🟢 Verde (ativo)
  - 🟡 Amarelo (alerta)
  - 🔵 Azul (executado)

### Sistema de Votação
- **Primária**: 🔵 Azul (#3b82f6)
- **Secundária**: 🟣 Roxo (#8b5cf6)
- **Votos**:
  - 🟢 Verde (a favor - #22c55e)
  - 🔴 Vermelho (contra - #ef4444)
  - ⚪ Cinza (abstenção - #9ca3af)

### Geral
- **Fundo**: 🌑 Preto/Cinza escuro
- **Texto**: ⚪ Branco/Cinza claro
- **Gradientes**: Todos os botões usam gradientes suaves

---

## Responsividade

### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────────┐
│  [Header]                                           │
│                                                     │
│  [Stats: 3 colunas lado a lado]                    │
│                                                     │
│  [Proposta 1] [Proposta 2]                         │
│  [Proposta 3] [Proposta 4]                         │
│  (Grid 2 colunas)                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────┐
│  [Header]                      │
│                                │
│  [Stats: 3 colunas ajustadas]  │
│                                │
│  [Proposta 1]                  │
│  [Proposta 2]                  │
│  [Proposta 3]                  │
│  (1 coluna)                    │
│                                │
└────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────┐
│  [Header]        │
│                  │
│  [Stat 1]        │
│  [Stat 2]        │
│  [Stat 3]        │
│  (Stack vertical)│
│                  │
│  [Proposta 1]    │
│  (Compacto)      │
│                  │
│  [Proposta 2]    │
│  (Compacto)      │
│                  │
└──────────────────┘
```

---

## Animações e Interações

### Hover States

**Botões**:
```
Normal:    [████████]
Hover:     [████████] ↗️ (escala 1.05)
Active:    [████████] ↘️ (escala 0.95)
```

**Cards de Proposta**:
```
Normal:    ┌────────┐
           │        │
           └────────┘

Hover:     ┌────────┐ ↑ Levanta
           │ 🔦     │   + sombra
           └────────┘
```

### Loading States

**Carregando dados**:
```
┌─────────────────────┐
│ ░░░░░░░░░░░░░░░░   │ (skeleton)
│ ░░░░░░░░            │
│ ░░░░░░░░░░░░        │
└─────────────────────┘
```

**Transação pendente**:
```
⏳ Confirmando transação...
[=================>  ] 85%
```

**Sucesso**:
```
✅ Transação confirmada!
   Hash: 0xabc...def
```

---

## Acessibilidade

### Elementos Visuais

- ✅ **Contraste alto**: Texto branco em fundo escuro
- ✅ **Ícones + Texto**: Cada ícone tem label descritivo
- ✅ **Estados claros**: Cores + ícones para cada estado
- ✅ **Feedback visual**: Hover, focus, active states

### Navegação por Teclado

- `Tab` - Navega entre elementos
- `Enter` - Ativa botões/links
- `Esc` - Fecha modals
- `Arrow keys` - Navega em listas (futuro)

### Screen Readers

- Todos os botões têm `aria-label`
- Estados comunicados via `aria-live`
- Estrutura semântica (`header`, `nav`, `main`, `article`)

---

## Performance

### Otimizações Implementadas

- ✅ **Code splitting**: Páginas carregam apenas o necessário
- ✅ **Lazy loading**: Componentes carregam sob demanda
- ✅ **Skeleton loaders**: Feedback imediato durante loading
- ✅ **Memoization**: `React.memo` em componentes pesados
- ✅ **Debouncing**: Em buscas e filtros (futuro)

### Métricas Alvo

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

---

## Troubleshooting Visual

### Proposta não aparece

**Sintoma**: Lista de propostas vazia

**Verificar**:
1. ✅ Wallet conectada?
2. ✅ Endereço do contrato correto?
3. ✅ Rede correta (Anvil/Sepolia)?
4. ✅ Console do navegador tem erros?

### Botão de votar desabilitado

**Sintoma**: Não consegue clicar em "Votar"

**Possíveis causas**:
- ❌ Proposta não está ativa
- ❌ Você já votou
- ❌ Você não é membro autorizado
- ❌ Transação ainda processando

### Modal não fecha

**Sintoma**: Modal fica preso na tela

**Solução**:
1. Clique em "Cancelar"
2. Pressione `Esc`
3. Recarregue a página (`Ctrl+R`)

---

## Conclusão

O sistema de governança possui uma interface visual moderna, intuitiva e totalmente funcional. Os dois sistemas principais (Mitose e Votação) estão perfeitamente integrados com:

- ✅ Design consistente
- ✅ Navegação clara
- ✅ Feedback visual constante
- ✅ Responsividade completa
- ✅ Acessibilidade implementada

**Acesse agora**:
- 🧬 Mitose: `http://localhost:3000/dao-mitosis`
- 🗳️ Votação: `http://localhost:3000/federation-voting`

---

**Desenvolvido com ❤️ para a Revolução Cibernética**
