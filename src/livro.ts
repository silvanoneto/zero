/**
 * LIVRO: Entre Igrejas e Casas de Charlatanismo
 * Carregador de conteúdo com renderização Markdown
 */

import type { Concept } from './types';

// Declaração global do marked.js
declare const marked: {
    parse(markdown: string): string;
};

// Declaração global do JSZip
declare const JSZip: any;

// CORES POR CAMADA (sincronizado com CRIO e rizoma)
const LAYER_COLORS: Record<string, number> = {
    'ontologica': 0x66ccff,    // Azul claro
    'politica': 0xff6666,      // Vermelho
    'pratica': 0x99ccff,       // Azul mais claro
    'fundacional': 0x9966ff,   // Roxo
    'epistemica': 0xff9966,    // Laranja
    'ecologica': 0x66ff99,     // Verde
    'temporal': 0xcccccc,      // Cinza
    'etica': 0xffff66          // Amarelo
};

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

    try {
        // Carregar o arquivo markdown
        const response = await fetch('…_.md');
        
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
        }
        contentDiv.style.display = 'block';
        contentDiv.classList.remove('loading');
        contentDiv.setAttribute('aria-busy', 'false');
        
        // Carregar conceitos e inicializar links
        await loadConceptsAndActivateLinks();
        
        // Inicializar navegação
        initializeNavigation();
        
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
        console.log('Carregando conceitos...');
        const response = await fetch('assets/concepts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        concepts = await response.json();
        console.log(`✓ ${concepts.length} conceitos carregados`);
        console.log('Exemplos:', concepts.slice(0, 3).map(c => c.name));
        
        // Ativar links no conteúdo
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            console.log('Ativando links de conceitos...');
            activateConceptLinks(contentDiv);
            console.log('✓ Links ativados');
            
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
    console.log('Processando links no elemento:', element.id);
    
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

    console.log(`${nodesToProcess.length} nós de texto encontrados`);
    
    let linksCreated = 0;
    for (const textNode of nodesToProcess) {
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
    
    console.log(`✓ ${linksCreated} links criados`);
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
    const link = document.createElement('span');
    link.className = 'riz∅ma-link';
    link.textContent = text;
    link.setAttribute('data-concept-id', concept.id);
    link.setAttribute('data-concept-desc', concept.description);
    link.setAttribute('role', 'button');
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
        // Usar cor da layer
        const layerColor = LAYER_COLORS[concept.layer] || 0x66ccff;
        colorHex = '#' + layerColor.toString(16).padStart(6, '0');
    } else {
        // Fallback padrão
        colorHex = '#66ccff';
    }
    
    link.style.setProperty('--concept-color', colorHex);
    link.style.setProperty('color', colorHex, 'important');
    link.style.setProperty('text-decoration-color', colorHex, 'important');
    
    // Ao clirar, abrir o rizoma com foco nesse conceito
    const handleActivation = (e: Event) => {
        e.preventDefault();
        console.log(`Navegando para riz∅ma.html#${concept.id}`);
        window.location.href = `riz∅ma.html#${concept.id}`;
    };

    link.addEventListener('click', handleActivation);
    link.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleActivation(e);
        }
    });

    return link;
}

/**
 * Inicializa a navegação por capítulos
 */
function initializeNavigation(): void {
    const content = document.getElementById('content');
    const navList = document.getElementById('nav-list');
    
    if (!content || !navList) return;
    
    // Encontrar todos os headings de capítulo (h1)
    const chapters = content.querySelectorAll('h1');
    navList.innerHTML = '';
    
    chapters.forEach((chapter, index) => {
        const id = `chapter-${index}`;
        chapter.id = id;
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = chapter.textContent || `Capítulo ${index + 1}`;
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
    const title = 'Entre Igrejas e Casas de Charlatanismo';
    const author = 'Revolução Cibernética';
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
    console.log('Inicializando Entre Igrejas e Casas de Charlatanismo...');
    
    // Carregar preferências
    loadPreferences();
    
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
    
    // Inicializar autoscroll
    initAutoScroll();
    
    // Progress bar
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement;
        if (progressFill) {
            progressFill.style.width = scrolled + '%';
        }
        
        const readingProgress = document.getElementById('reading-progress');
        if (readingProgress) {
            readingProgress.textContent = Math.round(scrolled) + '%';
        }
    });
    
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
// AUTOSCROLL MEDITATIVO
// ============================================================================

let autoScrollActive = false;
let autoScrollInterval: number | null = null;
const AUTO_SCROLL_SPEED = 0.3; // pixels por frame (ajustável)
const AUTO_SCROLL_FPS = 60;

function initAutoScroll(): void {
    console.log('Inicializando autoscroll meditativo no livro');
    
    // Criar botão de autoscroll
    const audioUI = document.querySelector('.audio-ui');
    if (!audioUI) {
        console.warn('Audio UI não encontrado para adicionar botão de autoscroll');
        return;
    }
    
    const autoScrollBtn = document.createElement('button');
    autoScrollBtn.className = 'auto-scroll-button';
    autoScrollBtn.id = 'auto-scroll-btn';
    autoScrollBtn.setAttribute('aria-label', 'Ativar autoscroll meditativo');
    autoScrollBtn.innerHTML = '<span aria-hidden="true">⬇</span>';
    autoScrollBtn.title = 'Autoscroll meditativo';
    
    // Inserir após o botão de fonte
    const fontBtn = document.getElementById('font-size-btn');
    if (fontBtn && fontBtn.nextSibling) {
        audioUI.insertBefore(autoScrollBtn, fontBtn.nextSibling);
    } else {
        audioUI.appendChild(autoScrollBtn);
    }
    
    autoScrollBtn.addEventListener('click', toggleAutoScroll);
    
    // Desativar autoscroll se usuário scrollar manualmente
    let userScrollTimeout: number | null = null;
    window.addEventListener('wheel', () => {
        if (autoScrollActive) {
            console.log('Scroll manual detectado - pausando autoscroll');
            pauseAutoScroll();
            
            // Reativar após 2 segundos de inatividade
            if (userScrollTimeout) clearTimeout(userScrollTimeout);
            userScrollTimeout = window.setTimeout(() => {
                if (autoScrollActive) {
                    resumeAutoScroll();
                }
            }, 2000);
        }
    }, { passive: true });
}

function toggleAutoScroll(): void {
    const btn = document.getElementById('auto-scroll-btn');
    if (!btn) return;
    
    autoScrollActive = !autoScrollActive;
    
    if (autoScrollActive) {
        console.log('Autoscroll ativado');
        btn.classList.add('active');
        btn.innerHTML = '<span aria-hidden="true">⏸</span>';
        btn.setAttribute('aria-label', 'Pausar autoscroll');
        startAutoScroll();
    } else {
        console.log('Autoscroll desativado');
        btn.classList.remove('active');
        btn.innerHTML = '<span aria-hidden="true">⬇</span>';
        btn.setAttribute('aria-label', 'Ativar autoscroll meditativo');
        stopAutoScroll();
    }
}

function startAutoScroll(): void {
    if (autoScrollInterval) return;
    
    autoScrollInterval = window.setInterval(() => {
        const currentScroll = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        if (currentScroll >= maxScroll) {
            // Chegou no final - desativar
            console.log('Fim da página alcançado - desativando autoscroll');
            toggleAutoScroll();
            return;
        }
        
        window.scrollBy({
            top: AUTO_SCROLL_SPEED,
            behavior: 'auto'
        });
    }, 1000 / AUTO_SCROLL_FPS);
}

function stopAutoScroll(): void {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function pauseAutoScroll(): void {
    stopAutoScroll();
}

function resumeAutoScroll(): void {
    if (autoScrollActive && !autoScrollInterval) {
        console.log('Retomando autoscroll');
        startAutoScroll();
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
