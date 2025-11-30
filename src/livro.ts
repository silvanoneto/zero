/**
 * LIVRO: O Livro do Religare
 * Carregador de conteúdo com renderização Markdown
 */

import type { Concept } from './types.js';
import { initTooltips, activateTooltipForLink } from './livro-tooltips.js';
import { initProtocols } from './livro-protocols.js';

// Declaração global do marked.js
declare const marked: {
    parse(markdown: string): string;
};

// Declaração global do JSZip
declare const JSZip: any;

// CORES POR CAMADA (sincronizado com CRIO e rizoma)
const LAYER_COLORS: Record<string, number> = {
    // Camadas base (mantidas para compatibilidade)
    'ontologica': 0x66ccff,
    'politica': 0xff6666,
    'pratica': 0x99ccff,
    'fundacional': 0x9966ff,
    'epistemica': 0xff9966,
    'ecologica': 0x66ff99,
    'temporal': 0xcccccc,
    'etica': 0xffff66,
    
    // Subcamadas ontologica (azul claro: escuro → claro)
    'ontologica-0': 0x3399ff,
    'ontologica-1': 0x4db8ff,
    'ontologica-2': 0x66ccff,
    'ontologica-3': 0x99ddff,
    
    // Subcamadas politica (vermelho: escuro → claro)
    'politica-0': 0xcc3333,
    'politica-1': 0xff4d4d,
    'politica-2': 0xff6666,
    'politica-3': 0xff9999,
    
    // Subcamadas pratica (azul muito claro: escuro → claro)
    'pratica-0': 0x6699ff,
    'pratica-1': 0x80bdff,
    'pratica-2': 0x99ccff,
    'pratica-3': 0xcce6ff,
    
    // Subcamadas fundacional (roxo: escuro → claro)
    'fundacional-0': 0x6633cc,
    'fundacional-1': 0x8052ff,
    'fundacional-2': 0x9966ff,
    'fundacional-3': 0xc299ff,
    
    // Subcamadas epistemica (laranja: escuro → claro)
    'epistemica-0': 0xcc6633,
    'epistemica-1': 0xff8552,
    'epistemica-2': 0xff9966,
    'epistemica-3': 0xffc299,
    
    // Subcamadas ecologica (verde: escuro → claro)
    'ecologica-0': 0x33cc66,
    'ecologica-1': 0x52ff85,
    'ecologica-2': 0x66ff99,
    'ecologica-3': 0x99ffc2,
    
    // Subcamadas temporal (cinza: escuro → claro)
    'temporal-0': 0x999999,
    'temporal-1': 0xb8b8b8,
    'temporal-2': 0xcccccc,
    'temporal-3': 0xe0e0e0,
    
    // Subcamadas etica (amarelo: escuro → claro)
    'etica-0': 0xcccc33,
    'etica-1': 0xffff4d,
    'etica-2': 0xffff66,
    'etica-3': 0xffff99
};

/**
 * Obtém a cor de um conceito baseado na sua camada
 * Suporta subcamadas com variações cromáticas
 */
function getColorForLayer(layer: string): number {
    // Tenta match exato primeiro
    if (LAYER_COLORS[layer]) {
        return LAYER_COLORS[layer];
    }
    
    // Se é uma subcamada não mapeada, usa a cor base
    const baseLayer = layer.split('-')[0];
    return LAYER_COLORS[baseLayer] || 0x66ccff; // Azul como fallback
}

// Estado global
const state = {
    currentTheme: 'dark',
    fontSize: 'medium',
    navOpen: false
};

// Conceitos carregados
let concepts: Concept[] = [];

/**
 * Carrega e renderiza o conteúdo do livro
 */
async function loadLivroContent(): Promise<void> {
    const contentDiv = document.getElementById('content');
    const skeletonLoader = document.getElementById('skeleton-loader');
    
    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }

    // Se o conteúdo já existe (para reader mode), não recarregar
    if (contentDiv.children.length > 0 && !contentDiv.classList.contains('loading')) {
        console.log('Content already loaded, skipping fetch');
        await loadConceptsAndActivateLinks();
        initializeNavigation();
        return;
    }

    try {
        // Carregar o arquivo markdown (com cache-busting)
        const timestamp = new Date().getTime();
        const response = await fetch(`…_.md?v=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        
        // Renderizar markdown usando marked.js
        if (typeof marked !== 'undefined' && marked.parse) {
            const html = marked.parse(markdown);
            contentDiv.innerHTML = html;
        } else {
            // Fallback se marked.js não estiver disponível
            contentDiv.innerHTML = `<pre>${markdown}</pre>`;
        }
        
        // Ocultar skeleton loader e mostrar conteúdo
        if (skeletonLoader) {
            skeletonLoader.style.display = 'none';
            skeletonLoader.setAttribute('aria-hidden', 'true');
        }
        contentDiv.classList.remove('loading');
        contentDiv.classList.add('loaded');
        contentDiv.setAttribute('aria-busy', 'false');
        
        // Carregar conceitos e inicializar links
        await loadConceptsAndActivateLinks();
        
        // Inicializar navegação
        initializeNavigation();
        
        // Inicializar protocolos interativos
        initProtocols();
        
    } catch (error) {
        console.error('Error loading livro content:', error);
        contentDiv.classList.remove('loading');
        contentDiv.innerHTML = `
            <div class="error-container">
                <div class="error-icon">📖</div>
                <h2>Erro ao carregar livro</h2>
                <p class="error-description">
                    Não foi possível carregar o conteúdo do livro.
                </p>
                <div class="error-section">
                    <h3>Detalhes técnicos:</h3>
                    <p class="info-text">${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
                </div>
                <button onclick="location.reload()" class="retry-button">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

/**
 * Carrega conceitos e ativa links do rizoma
 */
async function loadConceptsAndActivateLinks(): Promise<void> {
    try {
        const response = await fetch('assets/concepts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        concepts = await response.json();
        
        // Ativar links no conteúdo
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            activateConceptLinks(contentDiv);
            
            // Identificar conceitos não mapeados (desabilitado)
            // identifyUnmappedConcepts(contentDiv);
        } else {
            console.error('Content div não encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar conceitos:', error);
    }
}

/**
 * Identifica conceitos mencionados no texto que não estão no rizoma
 */
function identifyUnmappedConcepts(element: HTMLElement): void {
    console.log('\n🔍 Identificando conceitos não mapeados...');
    
    const text = element.textContent || '';
    
    // Lista de termos conceituais comuns que podem não estar mapeados
    const potentialConcepts = new Set<string>();
    
    // Palavras capitalizadas que podem ser conceitos (uma ou mais palavras sem quebra de linha)
    // Evita capturar quebras de linha e palavras soltas
    const capitalizedPattern = /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{3,}(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+){0,3})\b/g;
    let match: RegExpExecArray | null;
    
    while ((match = capitalizedPattern.exec(text)) !== null) {
        const term = match[1].trim();
        
        // Ignorar se contém quebra de linha ou caracteres especiais
        if (term.includes('\n') || term.includes('\r') || term.includes('\t')) {
            continue;
        }
        
        // Filtrar palavras comuns e termos irrelevantes
        if (!isCommonWord(term) && isConceptualTerm(term)) {
            potentialConcepts.add(term);
        }
    }
    
    // Nomes dos conceitos existentes
    const existingConcepts = new Set(concepts.map(c => c.name.toLowerCase()));
    
    // Identificar termos não mapeados
    const unmappedConcepts: string[] = [];
    for (const term of potentialConcepts) {
        if (!existingConcepts.has(term.toLowerCase())) {
            unmappedConcepts.push(term);
        }
    }
    
    if (unmappedConcepts.length > 0) {
        console.log('\n📋 Conceitos importantes não mapeados:');
        const filtered = unmappedConcepts.sort();
        console.log(filtered.join(', '));
        console.log(`\nTotal: ${filtered.length} termos conceituais`);
        
        // Formato para fácil adição ao JSON
        console.log('\n💡 Para adicionar ao concepts.json, use este formato:');
        console.log('```json');
        filtered.slice(0, 5).forEach(term => {
            const id = term.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-');
            console.log(`{
  "id": "${id}",
  "name": "${term}",
  "description": "...",
  "color": "0x...",
  "connections": [],
  "layer": "..."
},`);
        });
        console.log('```');
        
        // Salvar no sessionStorage para análise
        sessionStorage.setItem('unmappedConcepts', JSON.stringify(filtered));
    } else {
        console.log('✓ Todos os conceitos importantes parecem estar mapeados');
    }
}

/**
 * Verifica se é uma palavra comum (não é um conceito)
 */
function isCommonWord(word: string): boolean {
    const commonWords = new Set([
        // Conectivos e conjunções
        'Como', 'Quando', 'Onde', 'Porque', 'Portanto', 'Além', 'Embora',
        'Entretanto', 'Contudo', 'Todavia', 'Assim', 'Enquanto', 'Durante',
        'Através', 'Entre', 'Sobre', 'Após', 'Antes', 'Desde', 'Segundo',
        'Então', 'Apenas', 'Sempre', 'Nunca', 'Mesmo', 'Até', 'Para',
        // Numerais e estrutura
        'Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Parte',
        'Capítulo', 'Seção', 'Apêndice', 'Introdução', 'Conclusão',
        // Pronomes e determinantes
        'Esta', 'Este', 'Esse', 'Essa', 'Aquela', 'Aquele', 'Esses', 'Essas',
        'Nosso', 'Nossa', 'Vosso', 'Vossa', 'Outro', 'Mesmos', 'Ambas',
        // Nomes próprios religiosos
        'Deus', 'Cristo', 'Jesus',
        // Verbos de instrução comuns
        'Aceitar', 'Agrupe', 'Alocar', 'Analisaremos', 'Avaliar', 'Avalie',
        'Busca', 'Busque', 'Chegar', 'Chegamos', 'Conectar', 'Considere',
        'Construir', 'Continuar', 'Criticar', 'Critique', 'Deixar', 'Desenvolver',
        'Discuta', 'Distinguir', 'Distinga', 'Divida', 'Elogiar', 'Enquadrar',
        'Entregar', 'Escolher', 'Escolha', 'Estabelecer', 'Estaríamos', 'Evitar',
        'Expandir', 'Falar', 'Focar', 'Foque', 'Formalize', 'Fornecer', 'Fortalecer',
        'Garfield', 'Habitar', 'Identificar', 'Imagine', 'Incluir', 'Incorpore',
        'Indica', 'Justificar', 'Levaremos', 'Listar', 'Liste', 'Lutar', 'Manter',
        'Mapear', 'Medir', 'Mover', 'Mudar', 'Oferecer', 'Opera', 'Parecer',
        'Permitir', 'Permita', 'Pode', 'Podemos', 'Promova', 'Promover', 'Projetar',
        'Questionar', 'Reconhecer', 'Responder', 'Sair', 'Suspender', 'Tenha',
        'Tornar', 'Usar', 'Vamos', 'Verificação', 'Vivemos',
        // Palavras genéricas
        'Alta', 'Alto', 'Ambiente', 'Arma', 'Ação', 'Baixas', 'Cabo', 'Cadeia',
        'Cargo', 'Casa', 'Cascata', 'Chave', 'Conceito', 'Conceitos', 'Concreto',
        'Contextos', 'Custo', 'Depois', 'Diferentes', 'Diferença', 'Dimensões',
        'Distâncias', 'Dupla', 'Efeito', 'Então', 'Escala', 'Espelho', 'Estágios',
        'Evidência', 'Existe', 'Externo', 'Ferramenta', 'Fluxo', 'Frase', 'Global',
        'Glossário', 'Golfo', 'Grupo', 'Ideias', 'Impacto', 'Infraestrutura',
        'Interesses', 'Isolamento', 'Lista', 'Luta', 'Matriz', 'Menu', 'Meta',
        'Modelo', 'Modos', 'Múltiplos', 'Ninguém', 'Nomes', 'Nossos', 'Objetivo',
        'Observação', 'Opcional', 'Origem', 'Orçamento', 'Paradoxo', 'Parecer',
        'Partes', 'Pessoa', 'Plataforma', 'Pontos', 'Pontuação', 'Pontuações',
        'Posições', 'Possibilidades', 'Postura', 'Predição', 'Princípio', 'Problema',
        'Processo', 'Projetos', 'Protocolo', 'Protocolos', 'Prática', 'Práticas',
        'Quais', 'Qual', 'Qualquer', 'Quanto', 'Quem', 'Quão', 'Ranking', 'Rede',
        'Regional', 'Regras', 'Renda', 'Resultados', 'Reuniões', 'Rigidez',
        'Segredo', 'Sempre', 'Singularidade', 'Sistema', 'Situação', 'Tipo',
        'Toolkit', 'Tratamento', 'Unidade', 'Valor', 'Vazio', 'Venda', 'Vias',
        'Você', 'Seja', 'Menu', 'Novo Passo', 'Este Livro'
    ]);
    return commonWords.has(word);
}

/**
 * Verifica se o termo tem características de conceito teórico/filosófico
 */
function isConceptualTerm(word: string): boolean {
    // Termos que definitivamente são conceitos (contêm palavras-chave)
    const conceptKeywords = [
        'Relacional', 'Ontologia', 'Política', 'Temporal', 'Epistemo', 
        'Estrutural', 'Sistêmica', 'Normativa', 'Cooptação', 'Dominação',
        'Instrumentalização', 'Autenticidade', 'Neurodiversidade', 'Recursão',
        'Multiplicidade', 'Vacuidade', 'Performativa', 'Diagnóstico',
        'Mediação', 'Algorítmica', 'Solidariedade', 'Privilégio',
        'Reconhecibilidade', 'Reversibilidade', 'Irreversibilidade',
        'Advocacy', 'Charlatanismo', 'Intersticial', 'Interescalares',
        'Externalidades', 'Imunológicos', 'Antagonismo', 'Assimetria',
        'Coerência', 'Aporias', 'Universalismo', 'Psíquico', 'Distributed'
    ];
    
    return conceptKeywords.some(keyword => word.includes(keyword));
}

/**
 * Ativa links de conceitos no conteúdo
 */
function activateConceptLinks(element: HTMLElement): void {
    // Criar mapa de conceitos (nome -> conceito)
    const conceptMap = new Map<string, Concept>();
    concepts.forEach(concept => {
        conceptMap.set(concept.name.toLowerCase(), concept);
    });
    
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                const tagName = parent.tagName.toLowerCase();
                if (['code', 'pre', 'script', 'style', 'a'].includes(tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                if (parent.classList.contains('riz∅ma-link')) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodesToProcess: Text[] = [];
    let node: Node | null;
    
    while ((node = walker.nextNode())) {
        nodesToProcess.push(node as Text);
    }

    // Processar em blocos para evitar travar a UI em documentos muito grandes
    const CHUNK_SIZE = 200;
    let linksCreated = 0;
    let index = 0;

    const processChunk = () => {
        const end = Math.min(index + CHUNK_SIZE, nodesToProcess.length);
        for (let i = index; i < end; i++) {
            const textNode = nodesToProcess[i];
            const fragments = linkifyText(textNode.textContent || '', conceptMap);
            if (fragments.length > 1 || (fragments.length === 1 && fragments[0] instanceof HTMLElement)) {
                const parent = textNode.parentNode;
                if (parent) {
                    fragments.forEach(fragment => {
                        parent.insertBefore(fragment, textNode);
                        if (fragment instanceof HTMLElement) linksCreated++;
                    });
                    parent.removeChild(textNode);
                }
            }
        }

        index = end;

        if (index < nodesToProcess.length) {
            // Use requestIdleCallback if disponível para processar sem bloquear
            if (typeof (window as any).requestIdleCallback === 'function') {
                (window as any).requestIdleCallback(processChunk, { timeout: 50 });
            } else {
                setTimeout(processChunk, 15);
            }
        }
    };

    processChunk();
}

/**
 * Converte texto em fragmentos com links para conceitos
 */
function linkifyText(text: string, conceptMap: Map<string, Concept>): (Text | HTMLElement)[] {
    if (!text || text.trim().length === 0) {
        return [document.createTextNode(text)];
    }

    const fragments: (Text | HTMLElement)[] = [];
    
    // Criar array de nomes de conceitos ordenado por tamanho (maiores primeiro)
    const conceptNames = Array.from(conceptMap.keys());
    conceptNames.sort((a, b) => b.length - a.length);
    
    // Criar pattern que busca conceitos completos (case-insensitive)
    const escapedNames = conceptNames.map(n => escapeRegex(n));
    const pattern = new RegExp(
        '(^|[^\\wÀ-ÿ])(' + escapedNames.join('|') + ')(?![\\wÀ-ÿ])',
        'gi'
    );

    let lastIndex = 0;
    const matches: Array<{start: number, end: number, text: string, concept: Concept}> = [];
    
    // Coletar todos os matches
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
        const prefix = match[1] || '';
        const matchedText = match[2];
        const concept = conceptMap.get(matchedText.toLowerCase());
        if (concept) {
            matches.push({
                start: match.index + prefix.length,
                end: match.index + match[0].length,
                text: matchedText,
                concept: concept
            });
        }
    }
    
    // Remover overlaps (preferir matches mais longos)
    const filteredMatches = matches.filter((m1, i) => {
        return !matches.some((m2, j) => {
            if (i === j) return false;
            // Se m2 overlaps m1 e é mais longo, filtrar m1
            if (m2.start <= m1.start && m2.end >= m1.end && m2.text.length > m1.text.length) {
                return true;
            }
            // Se m2 overlaps m1 de qualquer forma e começa antes, filtrar m1
            if (m2.start < m1.start && m2.end > m1.start) {
                return true;
            }
            return false;
        });
    });
    
    // Criar fragmentos
    filteredMatches.forEach(match => {
        // Adicionar texto antes do match
        if (match.start > lastIndex) {
            fragments.push(document.createTextNode(text.slice(lastIndex, match.start)));
        }

        // Criar link para o conceito
        fragments.push(createConceptLink(match.text, match.concept));
        lastIndex = match.end;
    });

    // Adicionar texto restante
    if (lastIndex < text.length) {
        fragments.push(document.createTextNode(text.slice(lastIndex)));
    }

    // Se não houve matches, retornar o texto original
    if (fragments.length === 0) {
        fragments.push(document.createTextNode(text));
    }

    return fragments;
}

/**
 * Escapa caracteres especiais de regex
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cria um link para um conceito
 */
function createConceptLink(text: string, concept: Concept): HTMLElement {
    const link = document.createElement('a');
    link.className = 'riz∅ma-link';
    link.textContent = text;
    link.href = `riz∅ma.html#${encodeURIComponent(concept.id)}`;
    link.setAttribute('data-concept-id', concept.id);
    link.setAttribute('data-concept-desc', concept.description);
    link.setAttribute('role', 'link');
    link.setAttribute('tabindex', '0');
    
    // Converter cor (usar layer se color não estiver definido)
    let colorHex: string;
    
    if (concept.color !== undefined && concept.color !== null) {
        // Conceito tem cor específica
        if (typeof concept.color === 'string') {
            colorHex = '#' + concept.color.replace('0x', '');
        } else {
            colorHex = '#' + concept.color.toString(16).padStart(6, '0');
        }
    } else if (concept.layer) {
        // Usar cor da layer (com suporte a subcamadas)
        const layerColor = getColorForLayer(concept.layer);
        colorHex = '#' + layerColor.toString(16).padStart(6, '0');
    } else {
        // Fallback padrão
        colorHex = '#66ccff';
    }
    
    link.style.setProperty('--concept-color', colorHex);
    link.style.setProperty('color', colorHex, 'important');
    link.style.setProperty('text-decoration-color', colorHex, 'important');
    
    // Ativar tooltip para este link
    activateTooltipForLink(link, concept, concepts);
    
    // Prevenir navegação padrão e usar navegação customizada
    link.addEventListener('click', (e: Event) => {
        e.preventDefault();
        console.log(`Navegando para riz∅ma.html?focus=${concept.id}`);
        window.location.href = `riz∅ma.html#${encodeURIComponent(concept.id)}`;
    });

    return link;
}

/**
 * Inicializa a navegação por capítulos
 */
function initializeNavigation(): void {
    const content = document.getElementById('content');
    const navList = document.getElementById('nav-list');
    const progressMarkers = document.querySelector('.progress-markers');
    
    if (!content || !navList) return;
    
    // Encontrar todos os headings de capítulo (h1)
    const chapters = content.querySelectorAll('h1');
    navList.innerHTML = '';
    
    if (progressMarkers) {
        progressMarkers.innerHTML = '';
    }
    
    chapters.forEach((chapter, index) => {
        const id = `chapter-${index}`;
        chapter.id = id;
        
        // Criar item de navegação
        const li = document.createElement('li');
        li.setAttribute('data-chapter-index', index.toString());
        
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.setAttribute('data-chapter-id', id);
        
        // Estrutura do link: número + título + progresso
        const navNumber = document.createElement('span');
        navNumber.className = 'nav-number';
        navNumber.textContent = `${index + 1}`;
        
        const navTitle = document.createElement('span');
        navTitle.className = 'nav-title';
        navTitle.textContent = chapter.textContent || `Capítulo ${index + 1}`;
        
        const navProgress = document.createElement('div');
        navProgress.className = 'nav-progress';
        
        a.appendChild(navNumber);
        a.appendChild(navTitle);
        a.appendChild(navProgress);
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            chapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Fechar navegação em mobile
            if (window.innerWidth <= 768) {
                toggleNav();
            }
        });
        
        li.appendChild(a);
        navList.appendChild(li);
        
        // Adicionar marcador de progresso lateral
        if (progressMarkers) {
            const marker = document.createElement('div');
            marker.className = 'progress-marker';
            marker.setAttribute('data-chapter-index', index.toString());
            marker.title = chapter.textContent || `Capítulo ${index + 1}`;
            marker.setAttribute('role', 'button');
            marker.setAttribute('tabindex', '0');
            marker.setAttribute('aria-label', chapter.textContent || `Capítulo ${index + 1}`);
            
            // Adicionar evento de clique no marcador
            marker.addEventListener('click', () => {
                chapter.scrollIntoView({ behavior: 'smooth' });
            });
            
            // Adicionar evento de teclado (Enter/Space)
            marker.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chapter.scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            progressMarkers.appendChild(marker);
        }
    });
    
    // Adicionar observador de scroll para atualizar marcadores ativos
    updateActiveMarkers();
    window.addEventListener('scroll', updateActiveMarkers);
}

/**
 * Atualiza os marcadores ativos baseado no scroll
 */
function updateActiveMarkers(): void {
    const content = document.getElementById('content');
    const markers = document.querySelectorAll('.progress-marker');
    const navLinks = document.querySelectorAll('#nav-list a');
    
    if (!content || markers.length === 0) return;
    
    const chapters = content.querySelectorAll('h1');
    if (chapters.length === 0) return;
    
    let activeIndex = -1;
    let maxProgress = 0;
    
    chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const nextChapter = chapters[index + 1];
        
        // Determinar se este capítulo está visível
        if (rect.top <= window.innerHeight / 3) {
            activeIndex = index;
            
            // Calcular progresso dentro desta seção
            if (nextChapter) {
                const nextRect = nextChapter.getBoundingClientRect();
                const sectionHeight = nextRect.top - rect.top;
                const scrolledInSection = Math.max(0, -rect.top);
                const progress = Math.min(100, (scrolledInSection / sectionHeight) * 100);
                maxProgress = progress;
            } else {
                // Última seção - usar altura do documento
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = window.scrollY;
                const chapterTop = (chapter as HTMLElement).offsetTop;
                const sectionHeight = docHeight - chapterTop;
                const scrolledInSection = scrolled - chapterTop;
                maxProgress = Math.min(100, (scrolledInSection / sectionHeight) * 100);
            }
        }
    });
    
    // Atualizar marcadores laterais
    markers.forEach((marker, index) => {
        const markerEl = marker as HTMLElement;
        if (index === activeIndex) {
            markerEl.classList.add('active');
            markerEl.classList.remove('completed');
            markerEl.style.setProperty('--progress', `${maxProgress}%`);
        } else if (index < activeIndex) {
            markerEl.classList.remove('active');
            markerEl.classList.add('completed');
            markerEl.style.setProperty('--progress', '100%');
        } else {
            markerEl.classList.remove('active', 'completed');
            markerEl.style.setProperty('--progress', '0%');
        }
    });
    
    // Atualizar links de navegação
    navLinks.forEach((link, index) => {
        const linkEl = link as HTMLElement;
        const li = linkEl.parentElement;
        if (index === activeIndex) {
            linkEl.classList.add('active');
            li?.classList.add('active');
        } else if (index < activeIndex) {
            linkEl.classList.remove('active');
            linkEl.classList.add('completed');
            li?.classList.remove('active');
            li?.classList.add('completed');
        } else {
            linkEl.classList.remove('active', 'completed');
            li?.classList.remove('active', 'completed');
        }
    });
}

/**
 * Toggle do menu de navegação
 */
function toggleNav(): void {
    const navIndex = document.getElementById('nav-index');
    const navToggle = document.getElementById('nav-toggle');
    
    if (!navIndex || !navToggle) return;
    
    state.navOpen = !state.navOpen;
    navIndex.classList.toggle('visible', state.navOpen);
    navToggle.setAttribute('aria-expanded', String(state.navOpen));
    navIndex.setAttribute('aria-hidden', String(!state.navOpen));
}

/**
 * Alternar tema claro/escuro
 */
function toggleTheme(): void {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', state.currentTheme === 'light');
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = state.currentTheme === 'dark' ? '☾' : '☀';
    }
    
    // Salvar preferência
    localStorage.setItem('theme', state.currentTheme);
}

/**
 * Alternar tamanho da fonte
 */
function toggleFontSize(): void {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(state.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    state.fontSize = sizes[nextIndex];
    
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${state.fontSize}`);
    
    // Salvar preferência
    localStorage.setItem('fontSize', state.fontSize);
}

/**
 * Limpa HTML para ser compatível com XHTML
 */
function cleanHTMLForXHTML(html: string): string {
    // Substituir entidades HTML por caracteres Unicode ou equivalentes XHTML
    let cleaned = html;
    
    // Entidades comuns que precisam ser substituídas
    const entities: Record<string, string> = {
        '&nbsp;': '&#160;',
        '&ndash;': '&#8211;',
        '&mdash;': '&#8212;',
        '&hellip;': '&#8230;',
        '&ldquo;': '&#8220;',
        '&rdquo;': '&#8221;',
        '&lsquo;': '&#8216;',
        '&rsquo;': '&#8217;',
        '&bull;': '&#8226;',
        '&middot;': '&#183;',
        '&trade;': '&#8482;',
        '&copy;': '&#169;',
        '&reg;': '&#174;',
        '&deg;': '&#176;',
        '&plusmn;': '&#177;',
        '&para;': '&#182;',
        '&sect;': '&#167;',
        '&dagger;': '&#8224;',
        '&Dagger;': '&#8225;',
        '&permil;': '&#8240;',
        '&laquo;': '&#171;',
        '&raquo;': '&#187;',
        '&times;': '&#215;',
        '&divide;': '&#247;'
    };
    
    // Substituir todas as entidades
    for (const [entity, replacement] of Object.entries(entities)) {
        cleaned = cleaned.split(entity).join(replacement);
    }
    
    // Fechar tags auto-fecháveis para XHTML
    cleaned = cleaned.replace(/<br>/gi, '<br/>');
    cleaned = cleaned.replace(/<hr>/gi, '<hr/>');
    cleaned = cleaned.replace(/<img([^>]+)(?<!\/)>/gi, '<img$1/>');
    
    // Remover atributos problemáticos
    cleaned = cleaned.replace(/\s+aria-\w+="[^"]*"/g, '');
    cleaned = cleaned.replace(/\s+data-\w+="[^"]*"/g, '');
    
    return cleaned;
}

// Flag para prevenir exportação dupla
let isExporting = false;

/**
 * Exporta o conteúdo como arquivo .epub
 */
async function exportAsEpub(): Promise<void> {
    // Prevenir execução dupla
    if (isExporting) {
        console.log('Exportação já em andamento...');
        return;
    }
    
    const contentDiv = document.getElementById('content');
    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }
    
    if (typeof JSZip === 'undefined') {
        alert('Biblioteca JSZip não carregada. Não é possível exportar EPUB.');
        return;
    }
    
    isExporting = true;
    
    const zip = new JSZip();
    
    // Metadados
    const title = 'O Livro do Religare';
    const author = 'Silvano Neto';
    const uuid = `urn:uuid:${generateUUID()}`;
    const date = new Date().toISOString().split('T')[0];
    
    // 1. mimetype (deve ser o primeiro arquivo, sem compressão)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    
    // 2. META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`;
    zip.folder('META-INF')!.file('container.xml', containerXml);
    
    // 3. OEBPS/content.opf (Package Document)
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="uid">${uuid}</dc:identifier>
        <dc:title>${title}</dc:title>
        <dc:creator>${author}</dc:creator>
        <dc:language>pt-BR</dc:language>
        <dc:date>${date}</dc:date>
        <meta property="dcterms:modified">${new Date().toISOString()}</meta>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
        <item id="css" href="style.css" media-type="text/css"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="nav"/>
        <itemref idref="content"/>
    </spine>
</package>`;
    zip.folder('OEBPS')!.file('content.opf', contentOpf);
    
    // 4. OEBPS/toc.ncx (NCX para compatibilidade EPUB 2)
    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${uuid}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${title}</text>
    </docTitle>
    <navMap>
        <navPoint id="navpoint-1" playOrder="1">
            <navLabel>
                <text>${title}</text>
            </navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>`;
    zip.folder('OEBPS')!.file('toc.ncx', tocNcx);
    
    // 5. OEBPS/nav.xhtml (Navigation Document para EPUB 3)
    const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>Navegação</title>
    <meta charset="UTF-8"/>
</head>
<body>
    <nav epub:type="toc">
        <h1>Sumário</h1>
        <ol>
            <li><a href="content.xhtml">${title}</a></li>
        </ol>
    </nav>
</body>
</html>`;
    zip.folder('OEBPS')!.file('nav.xhtml', navXhtml);
    
    // Limpar conteúdo HTML para XHTML
    const cleanedContent = cleanHTMLForXHTML(contentDiv.innerHTML);
    
    // 6. OEBPS/content.xhtml (Conteúdo principal)
    const contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>${title}</title>
    <meta charset="UTF-8"/>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${title}</h1>
    <p><em>por ${author}</em></p>
    <hr/>
    ${cleanedContent}
</body>
</html>`;
    zip.folder('OEBPS')!.file('content.xhtml', contentXhtml);
    
    // 7. OEBPS/style.css
    const styleCss = `
body {
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.6;
    margin: 1em;
    padding: 0;
}
h1, h2, h3, h4, h5, h6 {
    line-height: 1.3;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
}
h1 { font-size: 2em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.17em; }
p {
    margin: 1em 0;
    text-align: justify;
}
a {
    color: #0066cc;
    text-decoration: none;
}
blockquote {
    border-left: 3px solid #ccc;
    margin: 1.5em 0;
    padding-left: 1em;
    font-style: italic;
}
`;
    zip.folder('OEBPS')!.file('style.css', styleCss);
    
    // Gerar arquivo EPUB
    try {
        const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entre-igrejas-e-casas-de-charlatanismo.epub';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Arquivo EPUB exportado com sucesso');
        isExporting = false;
    } catch (error) {
        console.error('Erro ao gerar EPUB:', error);
        alert('Erro ao exportar EPUB. Veja o console para detalhes.');
        isExporting = false;
    }
}

/**
 * Gera um UUID v4 simples
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Carregar preferências salvas
 */
function loadPreferences(): void {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' | null;
    
    if (savedTheme) {
        state.currentTheme = savedTheme;
        document.body.classList.toggle('light-theme', savedTheme === 'light');
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☾' : '☀';
        }
    }
    
    if (savedFontSize) {
        state.fontSize = savedFontSize;
        document.body.classList.add(`font-${savedFontSize}`);
    } else {
        // Definir medium como padrão se não houver preferência salva
        document.body.classList.add('font-medium');
    }
}

/**
 * Inicialização principal
 */
function init(): void {
    // Carregar preferências
    loadPreferences();
    
    // Inicializar sistema de tooltips
    initTooltips();
    
    // Carregar conteúdo
    loadLivroContent();
    
    // Event listeners
    const navToggleBtn = document.getElementById('nav-toggle');
    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', toggleNav);
    }
    
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleTheme);
    }
    
    const fontSizeBtn = document.getElementById('font-size-btn');
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', toggleFontSize);
    }
    
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exportAsEpub();
        });
    }

    // Debounced resize to recalculate nav and avoid layout thrash
    const resizeTimeouts: { id?: number } = {};
    const onResize = () => {
        if (resizeTimeouts.id) window.clearTimeout(resizeTimeouts.id);
        resizeTimeouts.id = window.setTimeout(() => {
            console.log('Window resized — reinitializing navigation');
            initializeNavigation();
        }, 150) as unknown as number;
    };
    window.addEventListener('resize', onResize, { passive: true });
    
    // Progress bar updates - throttled with requestAnimationFrame for smoother updates
    const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement | null;
    const readingProgress = document.getElementById('reading-progress');
    let ticking = false;
    let lastScrollY = 0;

    const onScroll = () => {
        lastScrollY = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(() => {
                const height = Math.max(1, document.documentElement.scrollHeight - document.documentElement.clientHeight);
                const scrolled = Math.max(0, Math.min(100, (lastScrollY / height) * 100));

                if (progressFill) {
                    progressFill.style.transform = `scaleX(${scrolled / 100})`;
                    const progressParent = progressFill.parentElement;
                    if (progressParent) progressParent.setAttribute('aria-valuenow', String(Math.round(scrolled)));
                }

                if (readingProgress) {
                    const percent = Math.round(scrolled);
                    readingProgress.textContent = percent > 0 ? `LIVRO ${percent}%` : 'LIVRO';
                }

                ticking = false;
            });
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Fechar navegação ao clicar fora em mobile
    document.addEventListener('click', (e) => {
        const navIndex = document.getElementById('nav-index');
        const navToggleBtn = document.getElementById('nav-toggle');
        
        if (state.navOpen && navIndex && navToggleBtn) {
            if (!navIndex.contains(e.target as Node) && !navToggleBtn.contains(e.target as Node)) {
                toggleNav();
            }
        }
    });
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
