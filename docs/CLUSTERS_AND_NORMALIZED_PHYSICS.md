# Clusters por Camada e Física Normalizada

**Data:** 9 de novembro de 2025  
**Atualizações:** (1) Clusters iniciais por camada, (2) Repulsão normalizada 0-1

---

## 1. Clusters Iniciais por Camada

### Conceito

Na inicialização do rizoma, os conceitos são agrupados por **camada ontológica**, criando áreas de cores diferentes que correspondem às 8 camadas:

- `ontologica` (azul)
- `politica` (vermelho)
- `pratica` (azul claro)
- `fundacional` (roxo)
- `epistemica` (laranja)
- `ecologica` (verde)
- `temporal` (cinza)
- `etica` (amarelo)

### Implementação

**Arquivo:** `src/rizoma-full.ts`  
**Função:** `createNodes()`

#### Algoritmo

1. **Agrupar conceitos por camada:**
   ```typescript
   const conceptsByLayer = new Map();
   concepts.forEach(concept => {
       const layer = concept.layer || 'undefined';
       conceptsByLayer.set(layer, [...]);
   });
   ```

2. **Definir centros dos clusters:**
   - Distribui os centros das camadas ao redor da esfera usando Fibonacci Sphere
   - Cada camada recebe uma posição central única

3. **Posicionar conceitos dentro do cluster:**
   - Distribuição Fibonacci local dentro de um raio de 40% ao redor do centro
   - Projeção na superfície da esfera para manter geometria esférica
   
   ```typescript
   const clusterRadius = 0.4; // 40% do raio total
   // Posição local + centro do cluster → normalizar para esfera
   ```

### Estrutura Visual Inicial

```
        🟣 fundacional
    
🔴 politica          🟠 epistemica

    🔵 ontologica
    
🟢 ecologica         ⚪ temporal

        🟡 etica
```

Cada cor representa uma área inicial onde conceitos da mesma camada começam agrupados.

### Vantagens

✅ **Orientação visual imediata:** Usuário identifica camadas por cores  
✅ **Navegação intuitiva:** Começar explorando uma camada específica  
✅ **Emergência controlada:** Clusters dissolvem-se gradualmente pela física  
✅ **Pontes trans-camadas visíveis:** Conexões entre clusters destacam-se

---

## 2. Repulsão Normalizada (0 a 1)

### Conceito

A força de repulsão entre nós é **normalizada** para variar entre:
- **0** = conceito com **mínimo** de conexões (repulsão mínima)
- **1** = conceito com **máximo** de conexões (repulsão máxima)

### Motivação

**Antes:**
- Repulsão baseada em valor absoluto de conexões
- Relacionalismo Epistêmico (13 conn) → força arbitrária
- Virtualidade (3 conn) → força arbitrária
- Sem calibração relativa à rede

**Agora:**
- Repulsão relativa ao **range** da rede
- Mínimo atual (3 conn) → peso 0.0
- Máximo atual (13 conn) → peso 1.0
- Adaptação automática se a rede crescer

### Implementação

#### Cálculo do Range

**Função:** `calculateConnectionRange()`

```typescript
minConnections = Infinity;
maxConnections = 0;

nodes.forEach(node => {
    const connCount = node.userData.connections?.length || 0;
    minConnections = Math.min(minConnections, connCount);
    maxConnections = Math.max(maxConnections, connCount);
});

// Resultado atual: minConnections = 3, maxConnections = 13
```

#### Normalização

**Função:** `normalizeConnectionWeight(connectionCount)`

```typescript
function normalizeConnectionWeight(connectionCount) {
    if (maxConnections === minConnections) return 0.5; // Caso degenerado
    return (connectionCount - minConnections) / (maxConnections - minConnections);
}
```

**Exemplos (rede atual):**

| Conceito | Conexões | Peso Normalizado |
|----------|----------|------------------|
| Virtualidade | 3 | 0.0 (mínimo) |
| Processo | 6 | 0.3 |
| Multiplicidade | 10 | 0.7 |
| Relacionalismo Epistêmico | 13 | 1.0 (máximo) |

#### Força de Repulsão Atualizada

**Função:** `applyRepulsionForces()`

```typescript
const nodeWeightNormalized = normalizeConnectionWeight(nodeConnectionCount);
const otherWeightNormalized = normalizeConnectionWeight(otherConnectionCount);

// Média dos pesos normalizados
const combinedWeightNormalized = (nodeWeightNormalized + otherWeightNormalized) / 2;

// Força final: base 30% + até 70% adicional conforme peso
const distanceFactor = (1 - distance / REPULSION_DISTANCE);
const strength = REPULSION_FORCE * distanceFactor * (0.3 + combinedWeightNormalized * 0.7);
```

**Calibração:**
- **Base:** 30% da força sempre aplicada (evita repulsão zero)
- **Variável:** 70% adicional proporcional ao peso normalizado
- **Resultado:** Força varia de 30% (min-min) a 100% (max-max)

### Comparação de Cenários

| Interação | Peso 1 | Peso 2 | Peso Combinado | Força Relativa |
|-----------|--------|--------|----------------|----------------|
| Periférico-Periférico | 0.0 | 0.0 | 0.0 | 30% (base) |
| Periférico-Médio | 0.0 | 0.5 | 0.25 | 47.5% |
| Médio-Médio | 0.5 | 0.5 | 0.5 | 65% |
| Médio-Hub | 0.5 | 1.0 | 0.75 | 82.5% |
| Hub-Hub | 1.0 | 1.0 | 1.0 | 100% (máximo) |

### Vantagens

✅ **Escalabilidade:** Adaptação automática ao crescimento da rede  
✅ **Equilíbrio:** Todos os conceitos contribuem proporcionalmente  
✅ **Interpretabilidade:** Força varia de forma previsível (0-1)  
✅ **Robustez:** Funciona com qualquer range de conexões

---

## 3. Integração: Clusters + Física Normalizada

### Comportamento Emergente

1. **Inicialização:**
   - Conceitos agrupados por camada (clusters coloridos)
   - Repulsão normalizada começa a agir

2. **Primeiros segundos:**
   - Clusters começam a se expandir
   - Hubs (peso 1.0) criam "bolhas" maiores
   - Periféricos (peso 0.0) movem mais livremente

3. **Estabilização (~30s):**
   - Clusters dissolvem-se parcialmente
   - Estrutura emergente: hubs no centro, periféricos na periferia
   - Trans-layer bridges criam pontes visuais entre cores

4. **Estado final:**
   - Auto-organização em núcleo-periferia
   - Camadas ainda identificáveis por cor
   - Topologia reflete tanto estrutura conceitual quanto física

### Métricas Esperadas

**Dispersão por Camada:**
- Camadas com muitos hubs (ex: `ontologica`) → dispersão maior
- Camadas com poucos conceitos (ex: `temporal`) → cluster mais coeso

**Centralidade Espacial:**
- Hubs de qualquer camada tendem ao centro
- Periféricos de qualquer camada tendem à periferia
- Hierarquia espacial sobrepõe-se à estrutura de camadas

---

## 4. Parâmetros de Calibração

### Clusters

```typescript
const clusterRadius = 0.4; // Raio do cluster (40% do raio total)
```

**Efeitos de ajuste:**
- ↑ `clusterRadius` → Clusters maiores, mais dispersos inicialmente
- ↓ `clusterRadius` → Clusters menores, mais concentrados

### Repulsão Normalizada

```typescript
const baseForce = 0.3;      // Força mínima (30%)
const variableForce = 0.7;  // Força adicional máxima (70%)
```

**Fórmula:**
```
strength = BASE * distanceFactor * (baseForce + weightNormalized * variableForce)
```

**Efeitos de ajuste:**
- ↑ `baseForce` → Todos repelem mais (rede mais dispersa)
- ↑ `variableForce` → Hubs repelem muito mais (maior diferenciação)

---

## 5. Exemplos Práticos

### Camada Ontológica (72 conceitos)

**Hubs:** Processo (12), Multiplicidade (10), Devir (10), Terra (10)  
**Cluster inicial:** Grande área azul com múltiplos centros de repulsão  
**Evolução:** Expande rapidamente, hubs criam sub-regiões

### Camada Temporal (18 conceitos)

**Hubs:** Tempo (10), Crono-Política (10)  
**Cluster inicial:** Área cinza compacta  
**Evolução:** Mantém-se mais coesa (menos conceitos), hubs dominam estrutura

### Camada Ética (16 conceitos)

**Hubs:** Nenhum super-hub (máx 4-5 conexões)  
**Cluster inicial:** Área amarela homogênea  
**Evolução:** Dispersão uniforme (pesos normalizados similares)

---

## 6. Debugging e Validação

### Logs de Inicialização

```
🎨 Criando 8 clusters por camada: [ontologica, politica, pratica, ...]
📊 Range de conexões: 3 - 13
✅ Nós criados: 300 esferas adicionadas à cena
```

### Console JavaScript

```javascript
// Verificar pesos normalizados
nodes.forEach(n => {
    const count = n.userData.connections?.length || 0;
    const normalized = normalizeConnectionWeight(count);
    console.log(`${n.userData.name}: ${count} → ${normalized.toFixed(2)}`);
});
```

### Inspeção Visual

1. **Pause inicial (0-3s):** Clusters coloridos distintos
2. **Expansão (3-10s):** Hubs começam a repelir fortemente
3. **Estabilização (10-30s):** Estrutura núcleo-periferia emerge
4. **Estado final (>30s):** Equilíbrio entre física e topologia

---

## 7. Próximos Passos

### Otimizações Potenciais

1. **Interpolação suave:** Transição gradual de clusters para estado final
2. **Atração por camada:** Força fraca que mantém conceitos da mesma camada próximos
3. **Visualização de densidade:** Heatmap mostrando concentração por camada

### Métricas Avançadas

1. **Índice de separação:** Quão distintos os clusters permanecem após física
2. **Entropia espacial:** Grau de mistura entre camadas
3. **Estabilidade temporal:** Taxa de mudança de posição ao longo do tempo

---

**Referências:**
- Fibonacci Sphere: https://arxiv.org/abs/0912.4540
- Force-Directed Graphs: Fruchterman & Reingold (1991)
- Normalização Min-Max: Estatística descritiva padrão
