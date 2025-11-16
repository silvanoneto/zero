# Processo de Rebalanceamento da Ontologia CRIOS

## 📊 Histórico do Balanceamento

### Estado Inicial (Novembro 2024)
- **Razão max/min:** 5.9x ❌ CRÍTICO
- **Maior camada:** pratica (95 conceitos)
- **Menor camada:** etica (16 conceitos)
- **Problema:** Camada "prática" sobrecarregada com conceitos heterogêneos

### Após 1º Rebalanceamento
- **Razão max/min:** 3.5x ⚠️ MODERADO
- **Ação:** Reclassificados 41 conceitos de "pratica" para outras camadas
- **Foco:** Conceitos epistêmicos, éticos, temporais e ecológicos mal categorizados

### Após 2º Rebalanceamento (Estado Atual)
- **Razão max/min:** 3.36x ⚠️ MODERADO/BOM
- **Ação:** Reclassificados 18 conceitos entre várias camadas
- **Foco:** Refinamento cross-layer para coerência ontológica
- **Melhoria total:** 43% desde o início

## 🎯 Distribuição Final

```
ontologica    74 (19.1%)  ████████████████████████████████████████
politica      70 (18.0%)  ███████████████████████████████████
pratica       61 (15.7%)  ██████████████████████████████
fundacional   49 (12.6%)  ████████████████████████
epistemica    46 (11.9%)  ███████████████████████
temporal      37 ( 9.5%)  ██████████████████
ecologica     29 ( 7.5%)  ██████████████
etica         22 ( 5.7%)  ███████████
```

## 📋 Reclassificações Realizadas

### Primeira Rodada (41 conceitos)

#### ÉTICA (de pratica) - +6 conceitos
- `bancostempo` - Reciprocidade horizontal
- `cuidado` - Cuidado como dimensão ética
- `justica-restaurativa` - Justiça como prática ética
- `relacionalidade-cuidado` - Cuidado relacional
- `infraestrutura-comum` - Responsabilidade coletiva
- `protocolo-inclusao-neurodiversa` - Ética da diferença

#### TEMPORAL (de pratica) - +12 conceitos
- `pratica` - Memórias relacionais (práxis institucional)
- `aporia-temporal` - Tempo como aporia
- `conselho-setima-geracao` - Temporalidade de longo prazo
- `clausulas-sunset` - Temporalidade reversível
- `analise-temporal` - Análise temporal obrigatória
- E mais 7 conceitos relacionados a tempo e processo

#### EPISTÊMICA (de pratica) - +15 conceitos
- `commons` - Conhecimento como bem comum
- `circuloscultura` - Pedagogia crítica (Freire)
- `softwarelivre` - Conhecimento aberto
- `educacaopopular` - Epistemologia popular
- `pedagogiaautonomia` - Pedagogia da autonomia
- `desescolarizacao` - Crítica epistêmica
- E mais 9 conceitos sobre conhecimento e aprendizagem

#### ECOLÓGICA (de pratica) - +5 conceitos
- `soberania-alimentar` - Relação com terra/alimentos
- `agroecologia` - Práticas ecológicas
- `permacultura` - Design ecológico
- `regeneracao` - Regeneração de sistemas
- `biomimetica` - Aprender da natureza

#### POLÍTICA (de pratica) - +3 conceitos
- `democracia-deliberativa` - Forma política
- `rotatividade-obrigatoria` - Estrutura de poder
- `consentimento-tacito` - Processo decisório

### Segunda Rodada (18 conceitos)

#### ONTOLÓGICA - +4 conceitos
- `recursao` (de epistemica) - Recursão como estrutura do real
- `agencia` (de politica) - Agência como capacidade ontológica
- `sujeito` (de politica) - Sujeito como categoria ontológica
- `performatividade` (de politica) - Performatividade constitui ser

#### TEMPORAL - +7 conceitos
- `ocasioes` (de ontologica) - Eventos temporais (Whitehead)
- `ressurgencia` (de ontologica) - Processo histórico
- `tempo` (de epistemica) - Tempo entrelaçado
- `sustentabilidade` (de etica) - Duração temporal
- `perdão` (de etica) - Processo temporal de cura
- `espaço-tempo` (de fundacional) - Categoria temporal
- `transformação` (de ontologica) - Mudança sistêmica

#### EPISTEMICA - +3 conceitos
- `indigena` (de ontologica) - Pensamento indígena como epistemologia
- `groundednormativity` (de ontologica) - Normatividade situada
- `whanaungatanga` (de ontologica) - Modo de conhecer maori

#### FUNDACIONAL - +2 conceitos
- `normatividade` (de politica) - Normatividade como fundamento
- `reciprocidade` (de politica) - Princípio fundamental

#### ÉTICA - +2 conceitos
- `vulnerabilidade` (de politica) - Condição ética de interdependência
- `precariedade` (de politica) - Vulnerabilidade como condição ética

## 🔍 Critérios de Reclassificação

### Camada FUNDACIONAL
**Princípios irredutíveis, base filosófica**
- Conceitos que fundamentam a ontologia
- Princípios não deriváveis de outros
- Exemplo: `reciprocidade`, `normatividade`

### Camada ONTOLÓGICA
**Natureza do ser, constituição da realidade**
- Categorias sobre modos de existência
- Estruturas constitutivas do real
- Exemplo: `sujeito`, `agencia`, `performatividade`

### Camada EPISTÊMICA
**Conhecimento, saberes, modos de conhecer**
- Processos de produção de conhecimento
- Pedagogias e epistemologias
- Exemplo: `educacaopopular`, `indigena`, `commons`

### Camada POLÍTICA
**Poder, organização, estruturas sociais**
- Relações de poder e governança
- Formas de organização coletiva
- Economia política
- Exemplo: (mantém conceitos de poder e organização)

### Camada ÉTICA
**Valores, responsabilidade, cuidado**
- Dimensões de responsabilidade
- Valores e princípios éticos
- Relações de cuidado
- Exemplo: `vulnerabilidade`, `cuidado`, `justica-restaurativa`

### Camada TEMPORAL
**Tempo, processo, mudança, memória**
- Processos temporais e históricos
- Transformação e devir
- Memória e futuridade
- Exemplo: `tempo`, `ressurgencia`, `sustentabilidade`

### Camada ECOLÓGICA
**Relações com biosfera, multiespécies**
- Relações ecológicas
- Práticas de regeneração
- Multiespécies e terra
- Exemplo: `soberania-alimentar`, `agroecologia`

### Camada PRÁTICA
**Implementações, tecnologias, práticas concretas**
- Ferramentas e tecnologias conviviais
- Práticas institucionais específicas
- Experimentos concretos
- Exemplo: `cooperativa`, `assembleia`, `softwarelivre` → movido

## 🛠️ Ferramentas de Análise

### Comandos Make

```bash
# Verificar balanceamento atual
make balance-check

# Validar integridade
make ontology

# Estatísticas rápidas
make stats-quick

# Análise completa
make stats-full
```

### Scripts Python

```bash
# Análise de balanceamento
python3 scripts/analyze_balance.py

# Validação completa
python3 scripts/update_ontology.py

# Correção de relações
python3 scripts/fix_relations.py
```

## 📏 Métricas de Qualidade

### Thresholds de Balanceamento
- **Razão < 3.0x:** ✅ Balanceamento BOM
- **Razão 3.0-5.0x:** ⚠️ Balanceamento MODERADO
- **Razão > 5.0x:** ❌ Desbalanceamento CRÍTICO

### Estado Atual
- ✅ Razão: 3.36x (MODERADO/BOM)
- ✅ 0 erros de validação
- ✅ 1782 relações válidas
- ✅ 388 conceitos bem conectados
- ✅ Média: 4.5 conexões/conceito

## 💡 Lições Aprendidas

1. **"Prática" não é camada catch-all**
   - Muitos conceitos rotulados como "práticos" têm natureza epistêmica, temporal ou ética
   - Práticas específicas ≠ implementações concretas

2. **Temporalidade é transversal**
   - Processos temporais permeiam todas as camadas
   - Importante ter camada dedicada ao tempo/transformação

3. **Política inclui economia política**
   - Não é necessária camada "econômica" separada
   - Economia é sempre política

4. **8 camadas são adequadas**
   - Análise de clusters temáticos confirmou adequação
   - Fragmentação excessiva prejudicaria coerência

5. **Balanceamento ≠ igualdade estrita**
   - Razão 3-4x é aceitável para ontologia complexa
   - Coerência semântica > distribuição perfeita

## 🔄 Processo Recomendado para Futuras Reclassificações

1. **Identificar desbalanceamentos** com `make balance-check`
2. **Analisar conceitos** na camada sobre-representada
3. **Verificar descrições** para identificar natureza real do conceito
4. **Propor reclassificações** com justificativas claras
5. **Aplicar mudanças** em lote pequeno (10-20 conceitos)
6. **Validar** com `make ontology`
7. **Verificar novo balanceamento** com `make balance-check`
8. **Iterar** se necessário

---

**Última atualização:** Novembro 16, 2025  
**Total de reclassificações:** 59 conceitos em 2 rodadas  
**Melhoria de balanceamento:** 43% (5.9x → 3.36x)
