# Distribuição Espacial dos Conceitos no Riz∅ma

## Estratégia Híbrida: Clusters Proporcionais

### Problema Identificado

A distribuição anterior usava clusters de tamanho fixo (40% do raio) para todas as camadas, independente do número de conceitos. Isso resultava em:

- **Camadas pequenas** (ex: `etica` com 29 conceitos): espaço desperdiçado
- **Camadas grandes** (ex: `pratica` com 97 conceitos): conceitos muito agrupados
- **Densidade visual desigual**: algumas áreas da esfera muito povoadas, outras vazias

### Solução Implementada

**Distribuição proporcional baseada em volume esférico:**

```
raio_cluster = ³√(conceitos_camada / conceitos_total) × 0.85
```

#### Fundamento Matemático

- Volume de uma esfera: `V = 4/3 × π × r³`
- Para distribuir área uniformemente: `r ∝ ³√(n)`
- Cada camada recebe volume proporcional ao seu número de conceitos

#### Parâmetros

- **Raio base da esfera**: 300 unidades (constante)
- **Raio máximo de cluster**: 85% do raio calculado (evita sobreposição)
- **Centros de clusters**: Distribuídos uniformemente usando sequência de Fibonacci
- **Distribuição interna**: Fibonacci dentro de cada cluster

### Exemplo com 388 Conceitos

| Camada | Conceitos | Proporção | Raio do Cluster |
|--------|-----------|-----------|-----------------|
| pratica | 97 | 25.0% | ~54% do raio |
| ontologica | 66 | 17.0% | ~47% do raio |
| epistemica | 65 | 16.8% | ~47% do raio |
| politica | 50 | 12.9% | ~43% do raio |
| fundacional | 38 | 9.8% | ~39% do raio |
| ecologica | 30 | 7.7% | ~36% do raio |
| etica | 29 | 7.5% | ~36% do raio |
| temporal | 13 | 3.4% | ~28% do raio |

### Vantagens

✅ **Densidade uniforme**: Todos os clusters têm densidade visual similar  
✅ **Uso eficiente do espaço**: Nenhuma área desperdiçada ou superlotada  
✅ **Clusters mantidos**: Conceitos da mesma camada permanecem próximos  
✅ **Proporcionalidade justa**: Raio baseado em volume cúbico (geometria esférica)  
✅ **Escalabilidade**: Funciona bem com qualquer distribuição de conceitos  

### Implementação

```typescript
// Calcular raio proporcional à raiz cúbica (volume esférico)
const calculateClusterRadius = (layerSize: number, totalSize: number): number => {
    const proportion = Math.cbrt(layerSize / totalSize);
    return proportion * 0.85; // 85% para evitar sobreposição
};

// Distribuir centros usando Fibonacci
layers.forEach((layer, idx) => {
    const phi = Math.acos(1 - 2 * (idx + 0.5) / layers.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
    
    const clusterRadius = calculateClusterRadius(layerSize, totalSize);
    
    layerCenters.set(layer, {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        radius: clusterRadius
    });
});
```

### Comparação Visual

#### Antes (Clusters Fixos)
```
pratica  [========================================] 97 conceitos em 40%
etica    [=============                          ] 29 conceitos em 40%
temporal [======                                 ] 13 conceitos em 40%
```

#### Depois (Clusters Proporcionais)
```
pratica  [========================================] 97 conceitos em 54%
etica    [=====================                  ] 29 conceitos em 36%
temporal [=============                          ] 13 conceitos em 28%
```

### Arquivo Modificado

- `src/rizoma-full.ts` (função `createNodes()`, linhas ~536-580)

### Data de Implementação

16 de novembro de 2025

---

**Riz∅ma**: Distribuição geométrica justa - cada camada ocupa o espaço que merece. ∅
