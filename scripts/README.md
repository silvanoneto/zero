# Scripts de Atualização da Ontologia CRIOS

Scripts para manutenção, validação e atualização da base de conhecimento ontológico.

## 📁 Arquivos

### `update_ontology.py`
**Script principal de validação e análise completa**

Executa verificações abrangentes sobre a integridade da ontologia:

- ✅ Verificação de duplicatas (IDs e nomes)
- ✅ Validação de campos obrigatórios
- ✅ Detecção de referências órfãs
- ✅ Análise de distribuição por camada
- ✅ Estatísticas de conexões
- ✅ Verificação de integridade das relações
- ✅ Análise de verbos semânticos
- ✅ Comparação com literatura mapeada

**Uso:**
```bash
python3 scripts/update_ontology.py
# ou via Make
make validate
make ontology
```

**Saída:** Relatório completo de validação com estatísticas detalhadas

---

### `fix_relations.py`
**Script de correção de relações quebradas**

Corrige automaticamente relações após mesclas de conceitos:

- 🔄 Mapeia IDs antigos para novos
- 🗑️ Remove relações inválidas
- 🗑️ Remove auto-relações
- 🗑️ Remove duplicatas

**Uso:**
```bash
python3 scripts/fix_relations.py
# ou via Make
make fix-relations
```

**Quando usar:**
- Após mesclar conceitos duplicados
- Após renomear IDs de conceitos
- Quando `update_ontology.py` reportar relações inválidas

---

## 🎯 Comandos Make

```bash
# Validação completa
make validate

# Correção de relações
make fix-relations

# Estatísticas rápidas
make stats
```

---

## 🔧 Estrutura da Ontologia

### Arquivos de Dados

- `assets/concepts.json` - 246 conceitos com descrições e conexões
- `assets/relations.json` - 1231 relações entre conceitos
- `assets/referencias.json` - 117 referências bibliográficas

### Camadas Ontológicas

1. **fundacional** (37) - Base filosófica e conceitual
2. **ontologica** (59) - Natureza do ser relacional
3. **epistemica** (23) - Conhecimento e cognição
4. **politica** (55) - Organização e poder
5. **etica** (9) - Valores e responsabilidade
6. **temporal** (9) - Tempo e história
7. **ecologica** (17) - Relações multiespécies
8. **pratica** (37) - Implementações e práticas

---

## 📊 Métricas de Qualidade

**Validação bem-sucedida:**
- ✅ 0 duplicatas de ID
- ✅ 0 duplicatas de nome
- ✅ 0 referências órfãs
- ✅ 0 auto-relações
- ✅ 100% campos obrigatórios
- ✅ Média de 5.0 conexões/conceito

**Verbos Semânticos:**
- 139 verbos únicos
- Distribuição balanceada por camada
- Top 3: `emancipa-se via` (171), `compõe` (163), `possibilita` (108)

---

## 🚀 Workflow de Atualização

### 1. Adicionar Novo Conceito

```json
{
  "id": "novo-conceito",
  "name": "Novo Conceito",
  "description": "Descrição detalhada (mínimo 20 caracteres)",
  "connections": ["conceito1", "conceito2"],
  "layer": "ontologica",
  "color": "0x66ccff"
}
```

### 2. Validar

```bash
make validate
```

### 3. Corrigir Problemas (se houver)

```bash
make fix-relations
```

### 4. Confirmar

```bash
make stats
```

---

## 🎨 Cores por Camada

```javascript
const LAYER_COLORS = {
  fundacional: 0x9966ff,  // Roxo
  ontologica:  0x66ccff,  // Azul claro
  epistemica:  0x66ff99,  // Verde claro
  politica:    0xff6666,  // Vermelho
  etica:       0xffcc66,  // Laranja
  temporal:    0xff66cc,  // Rosa
  ecologica:   0x66ffcc,  // Turquesa
  pratica:     0xccff66   // Verde-amarelo
}
```

---

## 📝 Convenções

### IDs
- Lowercase, sem acentos
- Usar hífen ou camelCase: `arte-relacional` ou `arterelacional`
- Evitar espaços e caracteres especiais (exceto `-`, `∅`)

### Nomes
- Capitalização adequada
- Acentos corretos em português
- Caracteres especiais permitidos: `ā`, `ū`, `ī`, `∅`

### Descrições
- Mínimo 20 caracteres
- Contexto filosófico/teórico
- Evitar jargão sem explicação

### Conexões
- Mínimo 3 conexões por conceito
- IDs válidos (existentes em `concepts.json`)
- Evitar auto-referências

---

## 🔍 Debugging

### Problema: Relações quebradas

```bash
# Ver relações inválidas
make validate | grep "ID origem não existe"

# Corrigir automaticamente
make fix-relations
```

### Problema: Conceitos duplicados

```bash
# Ver duplicatas
make validate | grep "DUPLICAÇÃO"

# Mesclar manualmente em concepts.json
# Depois executar:
make fix-relations
```

### Problema: Conexões órfãs

```bash
# Identificar
make validate | grep "órfãs"

# Corrigir IDs em concepts.json
# Validar novamente
make validate
```

---

## 📚 Referências

- **Ontologia:** CRIOS - Criações Rizomáticas e Inteligências Operantes Sociais
- **Visualização:** `riz∅ma.html` (grafo interativo 3D)
- **Bibliografia:** `referencias.html` (filtros e busca)
- **Documentação:** `docs/CRIOS.md`

---

**Última atualização:** Novembro 2025  
**Versão da ontologia:** 1.0.0  
**Conceitos:** 246 | **Relações:** 1231 | **Camadas:** 8
