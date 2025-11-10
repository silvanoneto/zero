# Física Ponderada por Peso de Conceitos

**Data:** 9 de novembro de 2025  
**Atualização:** Sistema de colisão considerando peso dos conceitos (número de relações)

## Mudanças Implementadas

### 1. Força de Repulsão Ponderada

**Arquivo:** `src/rizoma-full.ts`  
**Função:** `applyRepulsionForces()`

#### Comportamento Anterior
- Repulsão uniforme entre todos os nós
- Força dependia apenas da distância entre nós
- Fórmula: `strength = REPULSION_FORCE * (1 - distance / REPULSION_DISTANCE)`

#### Novo Comportamento
- **Repulsão proporcional ao peso combinado dos nós**
- Peso = número de conexões do conceito
- Nós mais conectados (hubs) geram e sofrem mais repulsão
- Simula "massa" conceitual em física

#### Fórmula Atualizada
```typescript
const nodeWeight = (node.userData.connections?.length || 1);
const otherWeight = (otherNode.userData.connections?.length || 1);
const combinedWeight = Math.sqrt(nodeWeight + otherWeight);
const strength = REPULSION_FORCE * (1 - distance / REPULSION_DISTANCE) * combinedWeight * 0.3;
```

**Justificativa para `sqrt()`:**
- Evita que hubs dominem excessivamente a física
- Relacionalismo Epistêmico (13 conexões) vs. Virtualidade (3 conexões)
- Sem sqrt: diferença de força = 4.3x
- Com sqrt: diferença de força = 1.3x (mais equilibrado)
- Fator 0.3 calibra a intensidade global

### 2. Força de Mola Ponderada (Spring Forces)

**Arquivo:** `src/rizoma-full.ts`  
**Função:** `applyEdgeSpringForces()`

#### Comportamento Anterior
- Força de mola igual para ambos os nós conectados
- Lei de Newton: força igual e oposta (F = -F)
- Não considerava diferença de "massa" entre nós

#### Novo Comportamento
- **Força distribuída inversamente proporcional ao peso**
- Simula **inércia**: nós mais conectados são mais "pesados" e movem menos
- Lei de Newton adaptada: F = ma → a = F/m

#### Fórmula Atualizada
```typescript
const sourceWeight = Math.max(1, sourceNode.userData.connections?.length || 1);
const targetWeight = Math.max(1, targetNode.userData.connections?.length || 1);

const totalWeight = sourceWeight + targetWeight;
const sourceRatio = targetWeight / totalWeight; // Quanto target é pesado, source move mais
const targetRatio = sourceWeight / totalWeight; // Quanto source é pesado, target move mais

// Aplicar forças proporcionalmente
sourceForce.add(direction.clone().multiplyScalar(sourceRatio));
targetForce.sub(direction.clone().multiplyScalar(targetRatio));
```

**Exemplo Prático:**

| Source | Target | Source Weight | Target Weight | Source Move | Target Move |
|--------|--------|---------------|---------------|-------------|-------------|
| Hub (10 conn) | Periférico (2 conn) | 10 | 2 | 16.7% | 83.3% |
| Médio (5 conn) | Médio (5 conn) | 5 | 5 | 50% | 50% |
| Periférico (2 conn) | Hub (10 conn) | 2 | 10 | 83.3% | 16.7% |

**Resultado:** Hubs ficam mais estáveis no centro, periféricos orbitam mais.

## Impactos Esperados na Visualização

### Estrutura Emergente

1. **Centralização de Hubs**
   - Conceitos com mais conexões tendem a ocupar posições centrais
   - Relacionalismo Epistêmico (13 conn) → centro gravitacional
   - Virtualidade (3 conn) → periferia mais dinâmica

2. **Estabilidade Diferencial**
   - Hubs movem menos → estabilidade estrutural
   - Periféricos movem mais → exploração espacial
   - Rede auto-organiza em "núcleo + periferia"

3. **Agrupamentos Mais Claros**
   - Conceitos de mesma camada tendem a agrupar
   - Hubs inter-camadas criam pontes visuais
   - Trans-layer bridges mais evidentes

### Navegação

1. **Landmarks Visuais**
   - Hubs servem como pontos de referência
   - Mais fácil localizar conceitos centrais
   - Estrutura hierárquica emerge naturalmente

2. **Densidade Controlada**
   - Repulsão ponderada evita sobreposição de hubs
   - Periféricos têm mais espaço para movimentar
   - Menos congestionamento visual no centro

## Parâmetros de Calibração

### Constantes Físicas
```typescript
const REPULSION_FORCE = 15;        // Força base de repulsão
const REPULSION_DISTANCE = 50;     // Raio de influência
const SPRING_STRENGTH = 0.015;     // Rigidez das molas
const MIN_EDGE_LENGTH = 30;        // Distância mínima entre conectados
const MAX_EDGE_LENGTH = 80;        // Distância máxima entre conectados
```

### Fatores de Ponderação
- **Repulsão:** `combinedWeight * 0.3` (calibrado para evitar dominância excessiva)
- **Mola:** `ratio = peso_oposto / peso_total` (distribuição proporcional)

## Validação

### Antes vs. Depois

**Antes (sem peso):**
- Todos os nós movem igualmente
- Estrutura mais caótica
- Hubs não se destacam visualmente
- Difícil identificar hierarquia

**Depois (com peso):**
- Hubs estabilizam no centro
- Periféricos mais dinâmicos
- Hierarquia visual clara
- Auto-organização em clusters

### Testes Recomendados

1. **Verificar centralização:**
   ```bash
   # Observar posição de Relacionalismo Epistêmico (13 conn)
   # Deve estar próximo ao centro da esfera
   ```

2. **Verificar estabilidade:**
   ```bash
   # Hubs devem oscilar menos que periféricos
   # Reduzir animationSpeed para observar
   ```

3. **Verificar repulsão:**
   ```bash
   # Dois hubs próximos devem repelir mais fortemente
   # Tipping Point (11 conn) vs. Processo (12 conn)
   ```

## Física Conceitual

### Analogia com Sistemas Reais

**Sistema Solar:**
- Sol (hub massivo) no centro
- Planetas (nós médios) em órbitas estáveis
- Cometas (periféricos) em trajetórias dinâmicas

**Rede Social:**
- Influenciadores (hubs) estáveis
- Usuários ativos (médios) conectados
- Lurkers (periféricos) navegando

**Rizoma Ontológico:**
- Conceitos fundamentais (hubs) estruturam a rede
- Conceitos intermediários criam pontes
- Conceitos especializados exploram extremidades

### Emergência de Ordem

A física ponderada permite que a estrutura conceitual **emerja organicamente**:

1. **Auto-organização:** Sem impor hierarquia explícita, o peso das conexões cria estratificação natural
2. **Resiliência:** Hubs estáveis mantêm coesão da rede mesmo com periféricos dinâmicos
3. **Navegabilidade:** Estrutura núcleo-periferia facilita exploração (começar no centro, expandir)

## Referências Teóricas

- **Física Newtoniana:** F = ma (inércia proporcional à massa)
- **Teoria de Grafos:** Centralidade por grau (degree centrality)
- **Redes Complexas:** Estrutura núcleo-periferia (core-periphery)
- **Barabási:** Scale-free networks (hubs emergentes)

---

**Próximos Passos:**

1. ⚠️ **Calibração Visual:** Testar valores de `0.3` na repulsão (pode precisar ajuste)
2. 💡 **Métricas:** Adicionar estatísticas de dispersão espacial por camada
3. 🎨 **Visual:** Considerar tamanho de nó proporcional ao peso (peso^0.5 para escala visual)
