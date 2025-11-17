# PLANO DE MELHORIAS: LIVRO-READER

> **Objetivo:** Enriquecer a experiência de leitura do livro "Entre Igrejas e Casas de Charlatanismo" integrando funcionalidades dos sistemas **Referências** e **Rizoma**.

---

## VISÃO GERAL

O livro atualmente funciona como um reader markdown estático com links básicos para conceitos. As melhorias propostas visam transformá-lo em uma ferramenta de estudo interativa que aproveita:

- **Sistema de conceitos do Rizoma:** Visualização, navegação e exploração de relações
- **Sistema de referências:** Contexto bibliográfico, histórico e acadêmico
- **Protocolos práticos do livro:** Ferramentas de diagnóstico e aplicação

---

## PRIORIZAÇÃO

### 🔴 PRIORIDADE ALTA (Impacto alto, esforço baixo-médio)

#### 1. Tooltips de Conceitos com Preview
**Problema atual:** Usuário precisa clicar no conceito para ver informações  
**Solução:** Ao passar mouse sobre conceito linkado, mostrar tooltip com:
- Nome do conceito
- Descrição curta (primeiras 100 chars)
- Camada ontológica (com cor)
- Número de conexões
- Botão "Ver no Rizoma"

**Implementação:**
```typescript
// src/livro.ts - adicionar event listeners
function activateConceptLinks(element: HTMLElement): void {
    // ... código existente ...
    
    link.addEventListener('mouseenter', (e) => {
        showConceptTooltip(e.target, concept);
    });
    
    link.addEventListener('mouseleave', () => {
        hideConceptTooltip();
    });
}

function showConceptTooltip(target: HTMLElement, concept: Concept): void {
    const tooltip = document.createElement('div');
    tooltip.className = 'concept-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header" style="border-left: 3px solid ${getColorHex(concept.layer)}">
            <strong>${concept.name}</strong>
            <span class="layer-tag">${concept.layer}</span>
        </div>
        <p class="tooltip-desc">${concept.description.slice(0, 100)}...</p>
        <div class="tooltip-footer">
            <span>${concept.connections.length} conexões</span>
            <a href="rizoma.html?concept=${concept.id}">Ver no Rizoma →</a>
        </div>
    `;
    document.body.appendChild(tooltip);
    positionTooltip(tooltip, target);
}
```

**Esforço:** ~4h  
**Impacto:** Alto - melhora UX sem quebrar fluxo de leitura

---

#### 2. Painel de Referências por Capítulo
**Problema atual:** Referências bibliográficas ficam isoladas em página separada  
**Solução:** Sidebar dobrável mostrando referências citadas no capítulo atual

**Implementação:**
```typescript
// src/livro.ts
interface ChapterReferences {
    chapter: string;
    authors: string[];  // extraídos do texto
    concepts: string[]; // conceitos mencionados
}

function extractChapterReferences(): ChapterReferences[] {
    const chapters = document.querySelectorAll('h1[id^="capítulo-"]');
    return Array.from(chapters).map(chapter => {
        const content = getChapterContent(chapter);
        return {
            chapter: chapter.textContent,
            authors: extractAuthorCitations(content),
            concepts: extractConceptLinks(content)
        };
    });
}

function renderReferenceSidebar(chapterRefs: ChapterReferences): void {
    const sidebar = document.getElementById('references-sidebar');
    sidebar.innerHTML = `
        <h3>Referências deste capítulo</h3>
        <div class="ref-authors">
            ${chapterRefs.authors.map(author => `
                <a href="referencias.html?search=${author}">${author}</a>
            `).join('')}
        </div>
        <div class="ref-concepts">
            <h4>Conceitos (${chapterRefs.concepts.length})</h4>
            ${renderConceptCloud(chapterRefs.concepts)}
        </div>
    `;
}
```

**Esforço:** ~6h  
**Impacto:** Alto - conecta leitura com fontes bibliográficas

---

#### 3. Protocolos Práticos Interativos
**Problema atual:** Protocolos são texto estático, usuário precisa copiar para usar  
**Solução:** Tornar cada protocolo um formulário interativo com cálculo automático

**Exemplo - Protocolo "Auditoria de Expectativas Implícitas":**
```typescript
// src/livro.ts
interface Protocol {
    id: string;
    title: string;
    questions: Question[];
    calculate: (responses: Response[]) => ProtocolResult;
}

interface Question {
    id: string;
    text: string;
    type: 'scale' | 'text' | 'multiselect';
    options?: string[];
}

function renderInteractiveProtocol(protocol: Protocol): void {
    const container = document.getElementById(`protocol-${protocol.id}`);
    container.innerHTML = `
        <div class="protocol-form">
            <h4>${protocol.title}</h4>
            ${protocol.questions.map(q => renderQuestion(q)).join('')}
            <button onclick="calculateProtocol('${protocol.id}')">
                Calcular Resultado
            </button>
            <div id="protocol-result-${protocol.id}"></div>
        </div>
    `;
}

function calculateProtocol(protocolId: string): void {
    const responses = collectResponses(protocolId);
    const result = protocols[protocolId].calculate(responses);
    
    displayResult(protocolId, result);
    saveToLocalStorage(protocolId, { responses, result, date: new Date() });
}
```

**Protocolos a implementar:**
1. ✅ Auditoria de Expectativas Implícitas
2. ✅ Teste de Reciprocidade Identitária
3. ✅ Índice de Reversibilidade Paradigmática
4. ✅ Auditoria de Transparência Assimétrica
5. ✅ Protocolo de Divergência Construtiva

**Esforço:** ~12h (todos os protocolos)  
**Impacto:** Muito alto - transforma livro de teórico para aplicado

---

### 🟡 PRIORIDADE MÉDIA (Impacto médio-alto, esforço médio)

#### 4. Mapa Conceitual por Capítulo
**Solução:** Visualização mostrando densidade e distribuição de conceitos

```typescript
// src/livro.ts
interface ChapterConceptMap {
    chapter: string;
    concepts: {
        id: string;
        name: string;
        layer: string;
        mentions: number; // quantas vezes aparece
    }[];
    layerDistribution: Record<string, number>; // quantos conceitos por camada
}

function generateChapterMap(): void {
    const map = analyzeChapterConcepts();
    renderConceptHeatmap(map);
    renderLayerPieChart(map.layerDistribution);
}
```

**Visualizações:**
- Heatmap de densidade conceitual (quais capítulos são mais densos)
- Gráfico de pizza por camada ontológica
- Lista ordenada por frequência de menção

**Esforço:** ~8h  
**Impacto:** Médio - útil para visão geral, navegação alternativa

---

#### 5. Navegação Conceitual (Breadcrumbs Semânticos)
**Problema atual:** Navegação apenas por estrutura do livro (sumário)  
**Solução:** Trilhas conceituais através do conteúdo

```typescript
// src/livro.ts
interface ConceptTrail {
    concept: string;
    appearances: {
        chapter: string;
        section: string;
        context: string; // parágrafo onde aparece
    }[];
}

function renderConceptBreadcrumbs(conceptId: string): void {
    const trail = buildConceptTrail(conceptId);
    const breadcrumbs = document.getElementById('concept-breadcrumbs');
    
    breadcrumbs.innerHTML = `
        <div class="concept-trail">
            <strong>Trilha do conceito "${trail.concept}":</strong>
            ${trail.appearances.map(app => `
                <a href="#${app.section}">
                    ${app.chapter} → ${app.section}
                </a>
            `).join(' • ')}
        </div>
    `;
}
```

**Features:**
- "Seguir conceito através do livro"
- "Conceitos relacionados nesta seção"
- "Próxima aparição deste conceito"

**Esforço:** ~10h  
**Impacto:** Médio - útil para leitura não-linear, estudo focado

---

#### 6. Busca Semântica Unificada
**Solução:** Busca que retorna resultados dos 3 sistemas integrados

```typescript
// src/search.ts
interface UnifiedSearchResult {
    bookPassages: {
        text: string;
        chapter: string;
        relevance: number;
    }[];
    concepts: Concept[];
    references: Referencia[];
}

async function unifiedSearch(query: string): Promise<UnifiedSearchResult> {
    const [bookResults, conceptResults, refResults] = await Promise.all([
        searchInBook(query),
        searchInConcepts(query),
        searchInReferences(query)
    ]);
    
    return {
        bookPassages: bookResults,
        concepts: conceptResults,
        references: refResults
    };
}
```

**Esforço:** ~8h  
**Impacto:** Médio-alto - facilita pesquisa cross-sistema

---

### 🟢 PRIORIDADE BAIXA (Impacto médio, esforço alto)

#### 7. Modo Split-View (Estudo Acadêmico)
**Solução:** Layout com 3 painéis sincronizados

```html
<!-- livro-reader.html - modo estudo -->
<div class="study-mode">
    <aside class="panel-left" id="rizoma-panel">
        <!-- Mini-rizoma com conceitos do trecho visível -->
    </aside>
    
    <main class="panel-center" id="book-content">
        <!-- Conteúdo do livro -->
    </main>
    
    <aside class="panel-right" id="references-panel">
        <!-- Referências e notas -->
    </aside>
</div>
```

**Funcionalidades:**
- Scroll do livro atualiza painéis laterais
- Click em conceito sincroniza os 3 painéis
- Modo "apresentação" para ensino

**Esforço:** ~16h  
**Impacto:** Médio - útil para uso acadêmico, mas nicho

---

#### 8. Sistema de Anotações Pessoais
**Solução:** Highlights + notas conectadas ao grafo de conceitos

```typescript
// src/annotations.ts
interface Annotation {
    id: string;
    text: string; // texto selecionado
    note: string; // nota do usuário
    concepts: string[]; // conceitos marcados
    location: {
        chapter: string;
        paragraph: number;
    };
    createdAt: Date;
}

class AnnotationSystem {
    save(annotation: Annotation): void {
        const existing = this.load();
        existing.push(annotation);
        localStorage.setItem('livro-annotations', JSON.stringify(existing));
    }
    
    export(): string {
        // Exporta como markdown com links para conceitos
        const annotations = this.load();
        return generateMarkdownExport(annotations);
    }
}
```

**Esforço:** ~12h  
**Impacto:** Médio - útil para leitores engajados

---

#### 9. Modo de Leitura por Camadas Ontológicas
**Solução:** Filtro visual que destaca apenas conceitos de uma camada

```typescript
// src/livro.ts
function filterByLayer(layer: string): void {
    const allConceptLinks = document.querySelectorAll('.concept-link');
    
    allConceptLinks.forEach(link => {
        const concept = findConceptById(link.dataset.conceptId);
        if (concept.layer === layer || concept.layer.startsWith(layer)) {
            link.classList.add('highlighted');
            link.classList.remove('dimmed');
        } else {
            link.classList.add('dimmed');
            link.classList.remove('highlighted');
        }
    });
}
```

**UI:**
```html
<div class="layer-filter">
    <button onclick="filterByLayer('ontologica')">Ontológica</button>
    <button onclick="filterByLayer('politica')">Política</button>
    <button onclick="filterByLayer('pratica')">Prática</button>
    <button onclick="filterByLayer('all')">Todas</button>
</div>
```

**Esforço:** ~6h  
**Impacto:** Baixo-médio - útil para análise temática

---

## ARQUITETURA TÉCNICA

### Estrutura de Arquivos Proposta

```
src/
├── livro.ts                    # Código principal (existente)
├── livro-tooltips.ts          # Sistema de tooltips
├── livro-protocols.ts         # Protocolos interativos
├── livro-references.ts        # Integração com referencias.ts
├── livro-concepts.ts          # Integração com rizoma
├── livro-search.ts            # Busca unificada
└── livro-annotations.ts       # Sistema de anotações

assets/
├── concepts.json              # Existente
├── references.json            # Existente
└── chapter-metadata.json      # NOVO - metadados por capítulo
```

### Exemplo de `chapter-metadata.json`

```json
{
  "chapters": [
    {
      "id": "capitulo-1-o-vazio-que-povoa",
      "title": "O Vazio Que Povoa",
      "part": "I",
      "concepts": [
        {
          "id": "vacuidade",
          "mentions": 8,
          "firstMention": "linha-120"
        },
        {
          "id": "instrumentalizacao",
          "mentions": 5,
          "firstMention": "linha-45"
        }
      ],
      "authors": [
        "Nāgārjuna",
        "Carlo Rovelli",
        "Karen Barad",
        "Jay Garfield"
      ],
      "protocols": [
        "auditoria-expectativas-implicitas"
      ],
      "layerDistribution": {
        "ontologica": 12,
        "politica": 3,
        "epistemica": 5
      }
    }
  ]
}
```

---

## ROADMAP DE IMPLEMENTAÇÃO

### Sprint 1 (Semana 1) - Quick Wins
- [ ] Tooltips de conceitos com preview
- [ ] Extração de metadados por capítulo (script)
- [ ] CSS para suporte visual

**Entrega:** Experiência de leitura melhorada, sem quebrar funcionalidade existente

### Sprint 2 (Semana 2) - Referências
- [ ] Painel lateral de referências
- [ ] Detecção automática de citações de autores
- [ ] Links bidirecionais livro ↔ referencias.html

**Entrega:** Contexto bibliográfico integrado

### Sprint 3 (Semana 3-4) - Protocolos
- [ ] Framework de protocolos interativos
- [ ] Implementar 5 protocolos principais
- [ ] Sistema de salvamento local
- [ ] Exportação de resultados

**Entrega:** Ferramentas práticas utilizáveis

### Sprint 4 (Opcional) - Avançado
- [ ] Mapa conceitual
- [ ] Navegação conceitual
- [ ] Busca unificada
- [ ] Modo split-view

**Entrega:** Ferramenta de estudo acadêmico completa

---

## MÉTRICAS DE SUCESSO

### Métricas Quantitativas
- Tempo médio de sessão de leitura (aumentar)
- Número de conceitos explorados por sessão
- Uso de protocolos interativos
- Taxa de retorno (revisitas)

### Métricas Qualitativas
- Facilidade de navegação entre conteúdos relacionados
- Compreensão de conceitos complexos
- Utilidade dos protocolos práticos
- Satisfação geral (feedback)

---

## CONSIDERAÇÕES TÉCNICAS

### Performance
- Lazy loading de tooltips (criar apenas quando necessário)
- Debounce em eventos de scroll/hover
- Cache de metadados em localStorage
- Virtualização para listas longas

### Acessibilidade
- Tooltips navegáveis por teclado (Tab + Enter)
- ARIA labels para componentes interativos
- Contraste adequado para highlights
- Suporte a leitores de tela

### Compatibilidade
- Fallback para navegadores sem suporte a features modernas
- Progressive enhancement (core experience funciona sem JS)
- Responsive design para mobile/tablet

---

## DECISÕES DE DESIGN

### Princípios
1. **Não quebrar o fluxo de leitura:** Informações extras são opcionais, não obstrutivas
2. **Progressividade:** Usuário casual vê livro normal, usuário avançado descobre features
3. **Interoperabilidade:** Sistemas livro/rizoma/referencias se complementam, não competem
4. **Praticidade:** Protocolos devem ser usáveis de verdade, não apenas decorativos

### Identidade Visual
- Manter consistência com tema atual (dark/light)
- Usar cores de camadas ontológicas como sistema visual unificador
- Tooltips discretos, não chamativos
- Animações sutis (200-300ms)

---

## RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade excessiva afasta leitores casuais | Média | Alto | UI progressiva, features descobríveis |
| Performance degradada em textos longos | Média | Médio | Lazy loading, virtualização |
| Manutenção de metadados manual trabalhosa | Alta | Médio | Scripts de extração automática |
| Inconsistência entre os 3 sistemas | Média | Alto | Source of truth único (concepts.json) |

---

## PRÓXIMOS PASSOS IMEDIATOS

1. **Validar proposta:** Revisar prioridades com stakeholders
2. **Protótipo tooltips:** Implementar versão básica para testar UX
3. **Extrair metadados:** Script para gerar chapter-metadata.json
4. **Design de UI:** Mockups de sidebar e protocolos interativos
5. **Iniciar Sprint 1:** Tooltips + infraestrutura básica

---

**Última atualização:** 16 de novembro de 2025  
**Versão:** 1.0  
**Autor:** Sistema de melhorias contínuas do PAÊBIRÚ
