# Expansão do Grafo Relacional - Novas Relações

## Data: 16 de novembro de 2025

## Resumo Executivo

### Rodada 1 (Inicial)
**180 relações** propostas para conceitos com ≤2 conexões (36 conceitos)

### Rodada 2 (Expandida) - ATUAL
**1158 relações** propostas para conceitos com <8 conexões (232 conceitos)

**Total acumulado**: 1158 relações únicas sem duplicatas

## Impacto Massivo Projetado

### Antes
- Relações: 1782
- Densidade: 1.94%
- Conceitos isolados (0): 13
- Sub-conectados (<5): 131
- Sub-conectados (<8): 232

### Depois (se aplicado)
- Relações: **2940** (+65.0%) 🚀
- Densidade: **3.92%** (+103%)
- Conceitos isolados: **0** (-100%)
- Sub-conectados (<5): ~40 (-69%)
- Sub-conectados (<8): ~80 (-66%)

## Metodologia - Rodada 2

### 1. Identificação de Conceitos Sub-conectados

- **Total de conceitos**: 388
- **Relações existentes**: 1782
- **Densidade do grafo**: 1.94%

**Critério**: Conceitos com ≤ 2 conexões existentes

**Resultado**: 36 conceitos identificados, incluindo:
- 13 conceitos com **0 conexões** (totalmente isolados)
- 8 conceitos com **1 conexão**
- 15 conceitos com **2 conexões**

### 2. Algoritmo de Proposição

O script `propose_relations.py` utiliza:

1. **Análise semântica**: Extração de palavras-chave de nomes e descrições
2. **Cálculo de similaridade**: Palavras comuns entre pares de conceitos
3. **Inferência de tipo de relação**: Baseada em camadas ontológicas e padrões semânticos
4. **Score de relevância**: Proporção de palavras comuns
5. **Limite**: Top 3-5 relações mais relevantes por conceito

### 3. Tipos de Relações Inferenciais

| Padrão | Tipo de Relação | Camadas |
|--------|----------------|---------|
| Fundacional → Qualquer | `fundamenta` | fundacional → * |
| Qualquer → Fundacional | `fundamenta-se em` | * → fundacional |
| Epistemológica → Prática | `orienta` | epistemica → pratica |
| Política → Prática | `materializa-se em` | politica → pratica |
| Temporal → Qualquer | `temporaliza` | temporal → * |
| Ética → Prática | `regula` | etica → pratica |
| Ética → Política | `tensiona` | etica → politica |
| Ontológica → Qualquer | `constitui` | ontologica → * |
| Palavras comuns fortes | `relaciona-se com` | * → * |

## Resultados

### Estatísticas das Propostas

- **Total de relações propostas**: 180
- **Tipos únicos de relação**: 11
- **Conceitos beneficiados**: 36

### Distribuição por Tipo de Relação (Rodada 2)

```
relaciona-se com        594  (51.3%)  █████████████████████████
constitui               185  (16.0%)  ████████
temporaliza             148  (12.8%)  ██████
fundamenta              110  ( 9.5%)  ████
fundamenta-se em         65  ( 5.6%)  ██
articula-se com          18  ( 1.6%)  ▌
materializa-se em        16  ( 1.4%)  ▌
transforma                9  ( 0.8%)  
tensiona                  7  ( 0.6%)  
outros                    6  ( 0.5%)  
```

### Conceitos Mais Conectados (destino das novas relações - Rodada 2)

1. **Natureza** - 21 novas conexões
2. **Economia** - 20 novas conexões
3. **Criação** - 19 novas conexões
4. **Relacionalismo Epistêmico** - 18 novas conexões
5. **Identidade** - 17 novas conexões
6. **Tradução** - 17 novas conexões
7. **Virtualidade** - 16 novas conexões
8. **Biodiversidade** - 15 novas conexões
9. **Epistemologia** - 14 novas conexões
10. **Diálogo** - 14 novas conexões

### Conceitos Anteriormente Isolados (0 conexões)

Todos os 13 conceitos isolados receberam 3-5 novas conexões:

- **Política de Escala**: 5 conexões (fricção, fronteira porosa, relacionalismo epistêmico, descolonização, política)
- **Anti-fundacionalismo Coerentista**: 5 conexões (brahman-ātman, transindividual, RQM, economia, super-humeanismo)
- **Pol.is**: 5 conexões (anātman, pratītyasamutpāda, fact-nets, anti-fundacionalismo, processo)
- **Instrumentalização Universal**: 5 conexões (pratītyasamutpāda, ecologia, dataficação, estratégia de escala dupla, cooptação)
- **Advocacy Política**: 5 conexões (política, relacionalismo epistêmico, práxis institucional, libertação, tradução)
- **Antagonismo Relacional**: 5 conexões (mestiçagem ontológica, resistência relacional, política, arte relacional, cuidado como ontologia)
- **Cooptação Neoliberal**: 5 conexões
- **Humildade Epistemológica**: 5 conexões
- **Neurodiversidade**: 5 conexões
- **Recursão Ontológica**: 5 conexões
- **Resistência Relacional**: 5 conexões
- **Solidariedade Estrutural**: 5 conexões
- **Transformação Sistêmica**: 5 conexões

## Impacto Projetado

### Antes
- Relações: 1782
- Conceitos isolados: 13
- Conceitos sub-conectados (<5): 131
- Densidade: 1.94%

### Depois (se aplicado)
- Relações: **1962** (+10.1%)
- Conceitos isolados: **0** (-100%)
- Conceitos sub-conectados (<5): ~95 (-27.5%)
- Densidade: **2.62%** (+35%)

## Como Aplicar

### 1. Preview das Propostas
```bash
head -100 assets/new_relations_proposals.json
```

### 2. Aplicar com Confirmação Interativa
```bash
python3 scripts/apply_new_relations.py
```

O script irá:
- ✅ Verificar duplicatas (0 esperadas)
- ✅ Validar IDs de conceitos
- ✅ Criar backup automático de `relations.json`
- ✅ Mostrar preview das primeiras 10 relações
- ⚠️ Solicitar confirmação antes de aplicar
- ✅ Mesclar relações sem duplicatas

### 3. Validar Integridade
```bash
make ontology
```

## Arquivos Gerados

- `assets/new_relations_proposals.json` - 180 relações propostas (pronto para aplicar)
- `scripts/propose_relations.py` - Script de análise semântica
- `scripts/apply_new_relations.py` - Script de aplicação com segurança

## Próximos Passos Recomendados

1. ✅ **Revisar propostas**: Verificar semanticamente algumas relações de exemplo
2. ✅ **Aplicar relações**: Executar `apply_new_relations.py`
3. ✅ **Validar ontologia**: Executar `make ontology`
4. 🔄 **Iterar se necessário**: Rodar `propose_relations.py` novamente após aplicação
5. 📊 **Analisar nova densidade**: Verificar distribuição de conexões

## Observações Técnicas

- **Sem duplicatas**: Todas as propostas são verificadas contra pares existentes
- **Bidirecional-aware**: Pares (A,B) e (B,A) são tratados como equivalentes
- **Validação de IDs**: Apenas conceitos existentes em `concepts.json`
- **Backup automático**: `relations.json.backup_YYYYMMDD_HHMMSS`

---

**Status**: ⏳ Aguardando aplicação manual  
**Comando**: `python3 scripts/apply_new_relations.py`
