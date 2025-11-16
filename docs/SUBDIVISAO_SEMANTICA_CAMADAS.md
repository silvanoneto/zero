# Subdivisão Semântica de Camadas

**Data:** 16 de novembro de 2025  
**Status:** ✅ Implementado

## Visão Geral

Sistema de subdivisão das 8 camadas ontológicas em 32 subcamadas, criando variações cromáticas que mantêm a estrutura rizomática (não-hierárquica) enquanto balanceiam a distribuição de conceitos e conectividade.

## Estrutura das Subcamadas

### Padrão de Nomenclatura
Cada camada base possui 4 variações numeradas de 0 a 3:
- `{camada}-0` → **Geral** (conceitos abstratos, teóricos, fundamentos)
- `{camada}-1` → **Relacional** (conexões, vínculos, redes, interdependências)
- `{camada}-2` → **Prática** (aplicação, ação, institucional, métodos)
- `{camada}-3` → **Mista** (conceitos híbridos, transversais, integrados)

### 8 Famílias × 4 Variações = 32 Subcamadas

```
ONTOLÓGICA (154 conceitos)
├─ ontologica-0: Geral
├─ ontologica-1: Relacional  
├─ ontologica-2: Prática
└─ ontologica-3: Mista

POLÍTICA (103 conceitos)
├─ politica-0: Geral
├─ politica-1: Relacional
├─ politica-2: Prática
└─ politica-3: Mista

PRÁTICA (82 conceitos)
├─ pratica-0: Geral
├─ pratica-1: Relacional
├─ pratica-2: Prática
└─ pratica-3: Mista

FUNDACIONAL (98 conceitos)
├─ fundacional-0: Geral
├─ fundacional-1: Relacional
├─ fundacional-2: Prática
└─ fundacional-3: Mista

EPISTÊMICA (87 conceitos)
├─ epistemica-0: Geral (25)
├─ epistemica-1: Relacional (9)
├─ epistemica-2: Prática (31)
└─ epistemica-3: Mista (22)

ECOLÓGICA (67 conceitos)
├─ ecologica-0: Geral (16)
├─ ecologica-1: Relacional (21)
├─ ecologica-2: Prática (19)
└─ ecologica-3: Mista (11)

TEMPORAL (73 conceitos)
├─ temporal-0: Geral (11)
├─ temporal-1: Relacional (21)
├─ temporal-2: Prática (25)
└─ temporal-3: Mista (16)

ÉTICA (63 conceitos)
├─ etica-0: Geral (11)
├─ etica-1: Relacional (11)
├─ etica-2: Prática (29)
└─ etica-3: Mista (12)
```

## Sistema de Cores

### Gradiente Escuro → Claro
Cada família segue progressão tonal consistente:
- **0 (Geral)** → Tom escuro (fundamento conceitual)
- **1 (Relacional)** → Tom médio-escuro (conexões)
- **2 (Prática)** → Tom médio-claro (aplicação)
- **3 (Mista)** → Tom claro (integração)

### Paleta por Família

```typescript
// Ontológica - Azul claro
ontologica-0: #3399ff  // Geral
ontologica-1: #4db8ff  // Relacional
ontologica-2: #66ccff  // Prática
ontologica-3: #99ddff  // Mista

// Política - Vermelho
politica-0: #cc3333
politica-1: #ff4d4d
politica-2: #ff6666
politica-3: #ff9999

// Prática - Azul muito claro
pratica-0: #6699ff
pratica-1: #80bdff
pratica-2: #99ccff
pratica-3: #cce6ff

// Fundacional - Roxo
fundacional-0: #6633cc
fundacional-1: #8052ff
fundacional-2: #9966ff
fundacional-3: #c299ff

// Epistêmica - Laranja
epistemica-0: #cc6633
epistemica-1: #ff8552
epistemica-2: #ff9966
epistemica-3: #ffc299

// Ecológica - Verde
ecologica-0: #33cc66
ecologica-1: #52ff85
ecologica-2: #66ff99
ecologica-3: #99ffc2

// Temporal - Cinza
temporal-0: #999999
temporal-1: #b8b8b8
temporal-2: #cccccc
temporal-3: #e0e0e0

// Ética - Amarelo
etica-0: #cccc33
etica-1: #ffff4d
etica-2: #ffff66
etica-3: #ffff99
```

## Categorização Semântica

### Algoritmo de Classificação

O script `scripts/categorize_sublayers_semantic.py` utiliza análise de palavras-chave para categorizar conceitos:

```python
# Palavras-chave por categoria
pratica_keywords = [
    'prática', 'ação', 'fazer', 'aplicação', 'institucional',
    'pedagógica', 'educação', 'ensino', 'método', 'técnica',
    'política', 'governo', 'estado', 'organização', 'movimento'
]

relacional_keywords = [
    'relação', 'conexão', 'rede', 'vínculo', 'interação',
    'reciprocidade', 'mutualidade', 'interdependência', 'co-',
    'simbiose', 'colaboração', 'cooperação', 'encontro'
]

geral_keywords = [
    'conceito', 'teoria', 'abstrato', 'ideia', 'noção',
    'princípio', 'fundamento', 'base', 'essência', 'natureza',
    'ontologia', 'epistemologia', 'metafísica', 'universal'
]
```

### Lógica de Categorização

1. **Análise textual:** Nome + descrição do conceito
2. **Scoring:** Contagem de ocorrências de palavras-chave
3. **Detecção de híbridos:** Scores altos em múltiplas categorias → Mista
4. **Classificação:** Maior score determina categoria principal

## Interface de Usuário

### Painel de Legenda Colapsável

```html
<div class="layer-group">
    <div class="layer-group-header">
        <span class="layer-group-toggle">▶</span>
        <div class="legend-color"></div>
        <span>Nome da Camada</span>
        <span class="legend-count" id="{camada}-total">0</span>
    </div>
    <div class="layer-group-sublayers">
        <!-- 4 subcamadas -->
    </div>
</div>
```

### Funcionalidades Interativas

1. **Expansão/Colapso**
   - Clicar na seta (▶/▼) → Expande/colapsa o grupo
   - Estado inicial: Todos os grupos colapsados

2. **Filtragem por Grupo**
   - Clicar no header → Ativa/desativa todas as 4 subcamadas
   - Visual destacado quando todas estão ativas (classe `group-active`)

3. **Filtragem Individual**
   - Clicar em subcamada → Filtra apenas aquela variação
   - Múltiplas seleções permitidas

4. **Contadores Dinâmicos**
   - Contador individual: Conceitos em cada subcamada
   - Contador de grupo: Total de conceitos visíveis no grupo

### Visibilidade de Relações

**Sistema de opacidade graduada:**

- **Relações internas** (ambos nós ativos):
  - Opacidade total: 0.8-1.0
  - Totalmente visíveis

- **Relações cruzadas** (um nó ativo):
  - Opacidade baixa: 0.05-0.2
  - Mostram conexões com outras camadas

- **Relações externas** (nenhum nó ativo):
  - Ocultas
  - Reduz ruído visual

## Impacto na Conectividade

### Antes da Subdivisão
- 101 conceitos com ≤5 conexões
- Distribuição desigual entre camadas
- Camadas grandes vs pequenas (154 vs 63)

### Após Subdivisão + Boost
- 0 conceitos sub-conectados
- +212 novas relações semânticas
- Distribuição mais equilibrada em 32 subcamadas
- Total: 7.064 relações

## Arquivos Modificados

### Dados
- `assets/concepts.json` - 727 conceitos com campo `layer` atualizado
- `assets/relations.json` - 7.064 relações (boosted)

### Código TypeScript
- `src/rizoma-full.ts`
  - `LAYER_COLORS` com 32 definições
  - `updateLegendCounts()` atualizado
  - `setupLegendListeners()` para grupos e subcamadas
  - `applyLayerFilters()` nova função auxiliar
  - `getColorForLayer()` com fallback para base layer

- `src/crio.ts`
  - Sincronização de `LAYER_COLORS`

### Interface
- `riz∅ma.html`
  - Estrutura de grupos colapsáveis
  - CSS para `.layer-group`, `.layer-group-header`, `.layer-group-sublayers`
  - JavaScript: `toggleLayerGroup()`, `toggleLegend()`
  - Inicialização de grupos colapsados no `DOMContentLoaded`

### Scripts Python
- `scripts/categorize_sublayers_semantic.py` - Categorização semântica
- `scripts/boost_low_connectivity.py` - Boost de conectividade

## Ordem Lógica das Variações

A ordem segue progressão conceitual:

```
GERAL → RELACIONAL → PRÁTICA → MISTA
 (0)       (1)         (2)       (3)

Abstrato → Conexões → Aplicação → Integração
Fundamento → Vínculos → Métodos → Híbrido
Teórico → Redes → Institucional → Transversal
```

Esta progressão permite navegação intuitiva do abstrato ao concreto, culminando em conceitos híbridos que integram múltiplas dimensões.

## Benefícios

1. **Visual:** 32 variações cromáticas facilitam identificação
2. **Navegação:** Filtragem granular por grupo ou subcamada
3. **Conectividade:** Distribuição mais equilibrada
4. **Semântica:** Categorização baseada em significado real
5. **Não-hierárquico:** Mantém estrutura rizomática
6. **Performance:** Contadores e filtros otimizados

## Próximos Passos

- [ ] Ajustar limites de categorização semântica se necessário
- [ ] Testar com usuários a intuitividade das 4 variações
- [ ] Considerar visualização de densidade por subcamada
- [ ] Explorar outras formas de agrupamento visual
