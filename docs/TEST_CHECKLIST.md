# Checklist de Testes - Rizoma

Data: 2025-11-16

## ✅ Testes de Carregamento e Inicialização

- [ ] Página carrega sem erros no console
- [ ] Conceitos carregam corretamente (727 nós esperados)
- [ ] Relações carregam corretamente (9087 arestas esperadas)
- [ ] Cluster metadata carrega
- [ ] Rizoma aparece com cores sutis (não totalmente aceso)
- [ ] Nós distribuídos na esfera (raio 300)
- [ ] Hierarquia radial visível (hubs em camadas externas)

## ✅ Testes de Física e Movimento

- [ ] Gravidade radial funciona (hubs se afastam para exterior)
- [ ] Camadas radiais: inner (r<270), middle (270-300), outer (300-330), corona (>330)
- [ ] Forças de spring aplicadas sem "pulos"
- [ ] Forças de repulsão evitam sobreposição
- [ ] Forças de atração aproximam nós conectados
- [ ] Arestas acompanham movimento dos nós (sem flashing)
- [ ] Movimento suave sem travamentos (30 FPS)

## ✅ Testes de Interação

### Navegação
- [ ] OrbitControls: rotação com mouse funciona
- [ ] OrbitControls: zoom com scroll funciona
- [ ] OrbitControls: pan com botão direito funciona
- [ ] Auto-rotação ativa quando não há interação
- [ ] Auto-rotação pausa durante interação do usuário

### Seleção de Nós
- [ ] Click em nó: seleciona e mostra info panel
- [ ] Nó selecionado: aumenta opacidade
- [ ] Nós conectados: propagação de luz em 3 níveis
- [ ] Hover em nó: destaca temporariamente
- [ ] Double-click: foca câmera no nó

### Reset
- [ ] Resetar view: restaura câmera
- [ ] Reset: restaura cores originais (não fica sólido)
- [ ] Reset: restaura opacidade original (hubs diferente de comuns)
- [ ] Reset: restaura intensidade emissiva
- [ ] Reset: limpa seleções e filtros

## ✅ Testes de Comandos Console (rizoma.*)

### Navegação
- [ ] `rizoma.help()` - mostra todos os comandos
- [ ] `rizoma.info()` - informações do sistema
- [ ] `rizoma.stats()` - estatísticas detalhadas
- [ ] `rizoma.stats(true)` - estatísticas em tempo real
- [ ] `rizoma.goto("conceito")` - navega para conceito específico
- [ ] `rizoma.random()` - vai para conceito aleatório
- [ ] `rizoma.findHub()` - encontra hub aleatório
- [ ] `rizoma.findBridge()` - encontra ponte entre camadas

### Visualização
- [ ] `rizoma.toggleMode()` - alterna inside/outside
- [ ] `rizoma.reset()` - reseta visualização
- [ ] `rizoma.explode(2.5)` - expande rizoma
- [ ] `rizoma.collapse()` - colapsa ao normal

### Análise
- [ ] `rizoma.analyze("conceito")` - análise detalhada
- [ ] `rizoma.layers()` - info sobre camadas
- [ ] `rizoma.bridges()` - lista pontes
- [ ] `rizoma.hubs()` - lista hubs

### Sistemas Avançados
- [ ] `rizoma.quantum()` - estado quântico
- [ ] `rizoma.topology()` - métricas topológicas (PageRank, Betweenness)
- [ ] `rizoma.geometry()` - análise geométrica
- [ ] `rizoma.memory()` - sistema de memória
- [ ] `rizoma.dimensions()` - dimensões extras
- [ ] `rizoma.relativity()` - efeitos relativísticos
- [ ] `rizoma.communities()` - detecção de comunidades
- [ ] `rizoma.networkFlow()` - fluxo de rede
- [ ] `rizoma.fields()` - campos adaptativos
- [ ] `rizoma.gravity()` - distribuição radial

## ✅ Testes de Otimização

### Performance
- [ ] PageRank: 5 iterações (não trava navegador)
- [ ] Betweenness: 10% sampling (rápido)
- [ ] Communities: 3 iterações Louvain
- [ ] Topology update: a cada 30s (não todo frame)
- [ ] Fields update: a cada 10s
- [ ] Edge positions: a cada 2 frames (throttled)
- [ ] updateLines: a cada 3 frames (throttled)
- [ ] FPS mantém ~30 (não cai abaixo de 15)

### Memória
- [ ] Sem memory leaks (geometrias dispostas corretamente)
- [ ] Buffer attributes atualizados (não recriados)
- [ ] Adjacency caching funcionando

## ✅ Testes de UI

### Filtros
- [ ] Filtro por camada ontológica funciona
- [ ] Filtro mostra/esconde nós corretamente
- [ ] Legenda atualiza contagens
- [ ] Resetar filtros restaura todos os nós

### Busca
- [ ] Busca por nome encontra conceitos
- [ ] Busca fuzzy funciona
- [ ] Resultado da busca seleciona nó

### Tema
- [ ] Tema claro/escuro alterna corretamente
- [ ] Cores das linhas mudam com tema
- [ ] Background muda com tema
- [ ] Esfera muda cor com tema

## ✅ Testes de Edge Cases

- [ ] Nó sem conexões não quebra sistema
- [ ] Geometria inválida tratada com fallback
- [ ] NaN/Infinity tratados corretamente
- [ ] Resize da janela mantém proporções
- [ ] Mobile: touch funciona
- [ ] Performance mode ativa em baixo FPS (<15)

## 📊 Métricas Esperadas

### Carregamento
- Conceitos: **727 nós**
- Relações: **9087 arestas**
- Tempo de carregamento: < 3s

### Performance
- FPS alvo: **30 FPS**
- FPS mínimo aceitável: **15 FPS**
- Topology update: **30000ms** interval
- Fields update: **10000ms** interval

### Física
- Raio esfera: **300**
- MIN_HUB_RADIUS: **250** (interior)
- MAX_HUB_RADIUS: **340** (corona)
- SPRING_STRENGTH: **0.035**
- ATTRACTION_FORCE: **0.08**
- REPULSION_FORCE: **0.08**

### Rendering
- Tone mapping exposure: **1.0** (neutro)
- Ambient light: **0.4** (light) / **0.3** (dark)
- Emissive hubs: **0.3-0.5** (sutil)
- Opacity hubs: **até 0.95** (quase opaco)

## 🔧 Bugs Corrigidos Nesta Sessão

1. ✅ Timeout de topologia (otimizado algoritmos)
2. ✅ Tensão invertida (gravidade radial para exterior)
3. ✅ Contenção visual (limitar expansão)
4. ✅ Cálculo de posição melhorado (multi-fator importance)
5. ✅ Arestas não acompanhavam esferas (updateEdgePositions)
6. ✅ Esferas pulando (forças de spring reduzidas)
7. ✅ Muitos flashes (throttling + buffer update)
8. ✅ Reset mudava cores (restaurar originalColor/Emissive/Opacity)
9. ✅ Rizoma muito aceso ao carregar (emissive + exposure reduzidos)

## 🎯 Status Final

**Funcionalidades Críticas:** [ ] PASS / [ ] FAIL
**Performance:** [ ] PASS / [ ] FAIL  
**Interatividade:** [ ] PASS / [ ] FAIL
**Comandos Console:** [ ] PASS / [ ] FAIL
**Otimizações:** [ ] PASS / [ ] FAIL

---
*Testar no navegador: abrir `index.html`, verificar console (F12), testar comandos `rizoma.*`*
