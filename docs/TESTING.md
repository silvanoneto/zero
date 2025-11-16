# Guia de Testes - Rizoma

## 🎯 Como Testar

### 1. Teste Manual (Navegador)

1. Abra `index.html` no navegador
2. Abra DevTools (F12)
3. Verifique o console para erros
4. Execute comandos de teste

### 2. Script de Validação Automática

No console do navegador (F12), copie e cole o conteúdo de:
```
scripts/validate_rizoma.js
```

Ou execute diretamente:
```javascript
// Copie o código do arquivo e cole no console
```

### 3. Checklist Manual

Consulte `TEST_CHECKLIST.md` para lista completa de funcionalidades a testar.

## 🧪 Testes Principais

### Comandos Console Básicos

```javascript
// Ver ajuda
rizoma.help()

// Informações do sistema
rizoma.info()

// Estatísticas
rizoma.stats()

// Estatísticas em tempo real
rizoma.stats(true)

// Navegar para conceito
rizoma.goto("rizoma")

// Conceito aleatório
rizoma.random()

// Encontrar hub
rizoma.findHub()

// Resetar visualização
rizoma.reset()
```

### Comandos de Análise

```javascript
// Análise detalhada
rizoma.analyze("rizoma")

// Informações de camadas
rizoma.layers()

// Listar pontes
rizoma.bridges()

// Listar hubs
rizoma.hubs()
```

### Sistemas Avançados

```javascript
// Estado quântico
rizoma.quantum()

// Métricas topológicas (PageRank, Betweenness, etc)
rizoma.topology()

// Análise geométrica
rizoma.geometry()

// Sistema de memória
rizoma.memory()

// Dimensões extras
rizoma.dimensions()

// Efeitos relativísticos
rizoma.relativity()

// Comunidades detectadas
rizoma.communities()

// Fluxo de rede
rizoma.networkFlow()

// Campos adaptativos
rizoma.fields()

// Distribuição radial (gravidade)
rizoma.gravity()
```

## 🔍 Validações Esperadas

### Carregamento
- ✅ 727 conceitos carregados
- ✅ 9087+ relações carregadas
- ✅ Sem erros no console
- ✅ Renderização em < 3 segundos

### Performance
- ✅ FPS estável em ~30
- ✅ FPS mínimo > 15 (não trava)
- ✅ Topology update: 30s interval
- ✅ Fields update: 10s interval
- ✅ Sem memory leaks

### Física
- ✅ Gravidade radial ativa
- ✅ Hubs em camadas externas (250-340)
- ✅ Forças balanceadas (sem pulos)
- ✅ Arestas acompanham nós

### Visual
- ✅ Cores sutis (não totalmente aceso)
- ✅ Emissividade moderada (0.3-0.5 para hubs)
- ✅ Opacidade diferenciada (hubs ~0.95, comuns ~0.56)
- ✅ Reset restaura estado original

### Interação
- ✅ Click seleciona nó
- ✅ Hover destaca nó
- ✅ OrbitControls funciona
- ✅ Auto-rotação pausa/resume
- ✅ Filtros funcionam
- ✅ Busca funciona

## 🐛 Problemas Conhecidos

Nenhum problema crítico conhecido após otimizações.

## 📊 Métricas de Referência

### Sistema
- Nós: 727
- Arestas: ~9087
- Raio esfera: 300
- Camadas radiais: 4 (inner, middle, outer, corona)

### Performance
- Target FPS: 30
- Min FPS: 15
- Topology update: 30000ms
- Fields update: 10000ms
- Edge update: a cada 2 frames
- Lines update: a cada 3 frames

### Física
- MIN_HUB_RADIUS: 250
- MAX_HUB_RADIUS: 340
- SPRING_STRENGTH: 0.035
- ATTRACTION_FORCE: 0.08
- REPULSION_FORCE: 0.08
- DAMPING: 0.65
- SPRING_DAMPING: 0.4

### Rendering
- Tone mapping exposure: 1.0
- Ambient light: 0.4 (light) / 0.3 (dark)
- Directional 1: 0.5
- Directional 2: 0.3
- Hub emissive: 0.3-0.5
- Hub opacity: 0.85-0.95
- Common opacity: 0.56 (BASE_OPACITY * 0.8)

## 🔧 Troubleshooting

### Página não carrega
1. Verifique console para erros
2. Confirme que `concepts.json`, `relations.json` existem
3. Verifique permissões de arquivo

### Performance baixa
1. Feche outras abas
2. Use navegador moderno (Chrome/Firefox/Edge)
3. Verifique `rizoma.stats()` para métricas

### Nós não aparecem
1. Verifique `nodes.length` no console
2. Confirme que `concepts.length === 727`
3. Recarregue a página

### Reset não funciona corretamente
1. Verifique que `originalColor`, `originalOpacity`, `originalEmissive` existem em `userData`
2. Execute `rizoma.reset()` novamente
3. Recarregue se necessário

## 📝 Reportar Problemas

Ao reportar problemas, inclua:
1. Navegador e versão
2. Output de `rizoma.stats()`
3. Erros do console (se houver)
4. Passos para reproduzir

---
**Última atualização:** 2025-11-16
**Versão:** 1.0
