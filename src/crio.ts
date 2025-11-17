/**
 * CRIO - Carregador de Conteúdo Filosófico
 * Carrega e renderiza docs/CRIOS.md com funcionalidades interativas
 */

import type { Concept } from './types';

// ============================================================================
// DECLARAÇÕES GLOBAIS
// ============================================================================

declare const JSZip: any;

// ============================================================================
// TIPOS
// ============================================================================

interface CacheData {
    timestamp: number;
    content: string;
    etag?: string;
    lastModified?: string;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÃO
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos - verifica atualizações com frequência
const CHECK_UPDATE_INTERVAL = 30 * 1000; // Verifica a cada 30 segundos se há nova versão
const CRIOS_URL = 'docs/CRIOS.md';
const AUDIO_URL = 'assets/CRIO.mp3';
const CONCEPTS_URL = 'assets/concepts.json';

// CORES POR CAMADA (sincronizado com rizoma-full.ts)
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
    'ontologica-0': 0x3399ff,  // Geral - azul escuro
    'ontologica-1': 0x4db8ff,  // Relacional - azul médio-escuro
    'ontologica-2': 0x66ccff,  // Prática - azul médio-claro
    'ontologica-3': 0x99ddff,  // Mista - azul claro
    
    // Subcamadas politica (vermelho: escuro → claro)
    'politica-0': 0xcc3333,    // Geral - vermelho escuro
    'politica-1': 0xff4d4d,    // Relacional - vermelho médio-escuro
    'politica-2': 0xff6666,    // Prática - vermelho médio-claro
    'politica-3': 0xff9999,    // Mista - vermelho claro
    
    // Subcamadas pratica (azul muito claro: escuro → claro)
    'pratica-0': 0x6699ff,     // Geral - azul escuro
    'pratica-1': 0x80bdff,     // Relacional - azul médio-escuro
    'pratica-2': 0x99ccff,     // Prática - azul médio-claro
    'pratica-3': 0xcce6ff,     // Mista - azul claro
    
    // Subcamadas fundacional (roxo: escuro → claro)
    'fundacional-0': 0x6633cc,  // Geral - roxo escuro
    'fundacional-1': 0x8052ff,  // Relacional - roxo médio-escuro
    'fundacional-2': 0x9966ff,  // Prática - roxo médio-claro
    'fundacional-3': 0xc299ff,  // Mista - roxo claro
    
    // Subcamadas epistemica (laranja: escuro → claro)
    'epistemica-0': 0xcc6633,   // Geral - laranja escuro
    'epistemica-1': 0xff8552,   // Relacional - laranja médio-escuro
    'epistemica-2': 0xff9966,   // Prática - laranja médio-claro
    'epistemica-3': 0xffc299,   // Mista - laranja claro
    
    // Subcamadas ecologica (verde: escuro → claro)
    'ecologica-0': 0x33cc66,    // Geral - verde escuro
    'ecologica-1': 0x52ff85,    // Relacional - verde médio-escuro
    'ecologica-2': 0x66ff99,    // Prática - verde médio-claro
    'ecologica-3': 0x99ffc2,    // Mista - verde claro
    
    // Subcamadas temporal (cinza: escuro → claro)
    'temporal-0': 0x999999,     // Geral - cinza escuro
    'temporal-1': 0xb8b8b8,     // Relacional - cinza médio-escuro
    'temporal-2': 0xcccccc,     // Prática - cinza médio-claro
    'temporal-3': 0xe0e0e0,     // Mista - cinza claro
    
    // Subcamadas etica (amarelo: escuro → claro)
    'etica-0': 0xcccc33,        // Geral - amarelo escuro
    'etica-1': 0xffff4d,        // Relacional - amarelo médio-escuro
    'etica-2': 0xffff66,        // Prática - amarelo médio-claro
    'etica-3': 0xffff99         // Mista - amarelo claro
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
    return LAYER_COLORS[baseLayer] || 0xffffff; // Branco como fallback
}

// Estado global
let concepts: Concept[] = [];

// ============================================================================
// GERENCIAMENTO DE CACHE COM VERSIONAMENTO
// ============================================================================

function getCachedData(): CacheData | null {
    try {
        const cached = localStorage.getItem('crio-content');
        if (!cached) return null;
        
        const data: CacheData = JSON.parse(cached);
        const now = Date.now();
        
        // Cache expirou? Remove
        if ((now - data.timestamp) > CACHE_DURATION) {
            localStorage.removeItem('crio-content');
            return null;
        }
        
        return data;
    } catch (e) {
        console.error('Erro ao ler cache:', e);
        return null;
    }
}

function setCachedContent(content: string, etag?: string, lastModified?: string): void {
    try {
        const data: CacheData = {
            timestamp: Date.now(),
            content: content,
            etag,
            lastModified
        };
        localStorage.setItem('crio-content', JSON.stringify(data));
    } catch (e) {
        console.error('Erro ao salvar cache:', e);
    }
}

/**
 * Verifica se há uma nova versão do documento sem recarregar
 * Usa HEAD request para economizar banda
 */
async function checkForUpdates(): Promise<boolean> {
    try {
        const cached = getCachedData();
        if (!cached) return false;
        
        // HEAD request para verificar headers sem baixar o conteúdo
        const response = await fetch(CRIOS_URL, { 
            method: 'HEAD',
            cache: 'no-cache' // Força verificação no servidor
        });
        
        if (!response.ok) return false;
        
        const serverEtag = response.headers.get('etag');
        const serverLastModified = response.headers.get('last-modified');
        
        // Verifica se mudou
        if (serverEtag && cached.etag && serverEtag !== cached.etag) {
            console.log('Nova versão detectada via ETag');
            return true;
        }
        
        if (serverLastModified && cached.lastModified && serverLastModified !== cached.lastModified) {
            console.log('Nova versão detectada via Last-Modified');
            return true;
        }
        
        return false;
    } catch (e) {
        console.error('Erro ao verificar atualizações:', e);
        return false;
    }
}

/**
 * Recarrega o conteúdo silenciosamente se houver nova versão
 */
async function silentReloadIfNeeded(): Promise<void> {
    const hasUpdate = await checkForUpdates();
    
    if (hasUpdate) {
        console.log('Atualizando conteúdo automaticamente...');
        
        try {
            const response = await fetch(CRIOS_URL, { cache: 'no-cache' });
            if (!response.ok) return;
            
            const markdown = await response.text();
            const etag = response.headers.get('etag') || undefined;
            const lastModified = response.headers.get('last-modified') || undefined;
            
            // Atualiza cache
            setCachedContent(markdown, etag, lastModified);
            
            // Re-renderiza
            renderContent(markdown);
            
            console.log('✓ Conteúdo atualizado para última versão');
        } catch (e) {
            console.error('Erro ao atualizar:', e);
        }
    }
}

function clearCache(): void {
    localStorage.removeItem('crio-content');
    console.log('Cache limpo');
}

// Atalho para limpar cache: Ctrl+Shift+C (ou Cmd+Shift+C no Mac)
document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearCache();
        location.reload();
    }
});

// ============================================================================
// CARREGAMENTO DE CONTEÚDO
// ============================================================================

async function loadConcepts(): Promise<void> {
    try {
        const response = await fetch(CONCEPTS_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Atribuir cores baseadas na camada
        concepts = data.map((concept: any) => ({
            ...concept,
            color: getColorForLayer(concept.layer)
        }));
    } catch (error) {
        console.error('Erro ao carregar conceitos:', error);
        concepts = [];
    }
}

async function loadCRIOSContent(): Promise<void> {
    const contentDiv = document.getElementById('content');
    const skeletonDiv = document.getElementById('skeleton-loader');
    
    if (!contentDiv) {
        console.error('Elemento #content não encontrado!');
        return;
    }
    
    // Verificar cache primeiro
    const cached = getCachedData();
    
    if (cached) {
        renderContent(cached.content);
        
        // Inicia verificação periódica de atualizações em background
        setInterval(silentReloadIfNeeded, CHECK_UPDATE_INTERVAL);
        
        return;
    }
    
    try {
        const response = await fetch(CRIOS_URL, { cache: 'no-cache' });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        
        if (!markdown || markdown.trim().length === 0) {
            throw new Error('Conteúdo vazio');
        }
        
        console.log('Conteúdo carregado com sucesso');
        
        // Captura headers de versionamento
        const etag = response.headers.get('etag') || undefined;
        const lastModified = response.headers.get('last-modified') || undefined;
        
        // Salvar no cache com metadados de versão
        setCachedContent(markdown, etag, lastModified);
        
        // Renderizar
        renderContent(markdown);
        
        // Inicia verificação periódica de atualizações em background
        setInterval(silentReloadIfNeeded, CHECK_UPDATE_INTERVAL);
        
    } catch (error) {
        console.error('Erro ao carregar CRIOS.md:', error);
        showError(error as Error);
    }
}

// ============================================================================
// RENDERIZAÇÃO DE CONTEÚDO
// ============================================================================

function renderContent(markdown: string): void {
    const contentDiv = document.getElementById('content');
    const skeletonDiv = document.getElementById('skeleton-loader');
    
    if (!contentDiv) {
        console.error('Elemento #content não encontrado!');
        return;
    }
    
    // Verificar se marked.js está disponível
    if (typeof (window as any).marked === 'undefined') {
        console.error('marked.js não está disponível!');
        showError(new Error('marked.js não está disponível'));
        return;
    }
    
    try {
        // Configurar marked
        (window as any).marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true
        });
        
        // Renderizar markdown
        let html = (window as any).marked.parse(markdown);
        
        // Adicionar classes semânticas para modo de leitura
        html = html
            .replace(/<h1>/g, '<h1 itemprop="headline">')
            .replace(/<h2>/g, '<h2 itemprop="alternativeHeadline">')
            .replace(/<p>/g, '<p itemprop="text">')
            .replace(/<blockquote>/g, '<blockquote itemprop="citation">');
        
        // Ocultar skeleton e mostrar conteúdo
        if (skeletonDiv) {
            skeletonDiv.style.display = 'none';
        }
        
        contentDiv.innerHTML = html;
        contentDiv.classList.remove('loading');
        contentDiv.style.display = 'block';
        contentDiv.setAttribute('aria-busy', 'false');
        
        // Inicializar navegação
        initNavigation();
        
        // Inicializar funcionalidades interativas
        initInteractiveFeatures();
        
    } catch (error) {
        console.error('Erro ao renderizar markdown:', error);
        showError(error as Error);
    }
}

function showError(error: Error): void {
    const contentDiv = document.getElementById('content');
    const skeletonDiv = document.getElementById('skeleton-loader');
    
    if (!contentDiv) return;
    
    if (skeletonDiv) {
        skeletonDiv.style.display = 'none';
    }
    
    contentDiv.classList.remove('loading');
    contentDiv.style.display = 'block';
    contentDiv.setAttribute('aria-busy', 'false');
    contentDiv.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h2>Erro ao carregar conteúdo</h2>
            <p class="error-description">
                Não foi possível carregar o conteúdo de CRIOS.md
            </p>
            <div class="error-section">
                <h3>Detalhes do erro:</h3>
                <p class="info-text">${error.message}</p>
            </div>
            <div class="error-section">
                <h3>Soluções:</h3>
                <ul class="error-list">
                    <li>Verifique se o arquivo docs/CRIOS.md existe</li>
                    <li>Verifique a conexão com o servidor</li>
                    <li>Tente limpar o cache (Ctrl+Shift+C)</li>
                </ul>
            </div>
            <button onclick="location.reload()" class="retry-button">
                Tentar novamente
            </button>
        </div>
    `;
}

// ============================================================================
// NAVEGAÇÃO
// ============================================================================

function initNavigation(): void {
    const contentDiv = document.getElementById('content');
    const navList = document.getElementById('nav-list');
    const progressMarkers = document.querySelector('.progress-markers');
    
    if (!contentDiv || !navList || !progressMarkers) {
        console.warn('Elementos de navegação não encontrados:', { contentDiv, navList, progressMarkers });
        return;
    }
    
    // Encontrar todos os H2 (CRIOS)
    const headers = contentDiv.querySelectorAll('h2');
    
    if (headers.length === 0) {
        console.warn('Nenhum header H2 encontrado no conteúdo');
        return;
    }
    
    navList.innerHTML = '';
    progressMarkers.innerHTML = '';
    
    headers.forEach((header, index) => {
        // Adicionar ID ao header se não tiver
        if (!header.id) {
            header.id = `crio-${index}`;
        }
        
        // Extrair preview (primeiros 80 caracteres do próximo parágrafo)
        let preview = '';
        let nextElement = header.nextElementSibling;
        while (nextElement && preview.length < 80) {
            if (nextElement.tagName === 'P') {
                preview = nextElement.textContent?.substring(0, 80) + '...' || '';
                break;
            }
            nextElement = nextElement.nextElementSibling;
        }
        
        // Adicionar item de navegação dinâmico
        const li = document.createElement('li');
        li.setAttribute('data-crio-index', index.toString());
        
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.setAttribute('data-crio-id', header.id);
        
        // Estrutura do link: número + título + preview
        const navNumber = document.createElement('span');
        navNumber.className = 'nav-number';
        navNumber.textContent = `${index + 1}`;
        
        const navTitle = document.createElement('span');
        navTitle.className = 'nav-title';
        navTitle.textContent = header.textContent || `CRIO ${index + 1}`;
        
        const navPreview = document.createElement('span');
        navPreview.className = 'nav-preview';
        navPreview.textContent = preview;
        
        const navProgress = document.createElement('div');
        navProgress.className = 'nav-progress';
        
        a.appendChild(navNumber);
        a.appendChild(navTitle);
        a.appendChild(navPreview);
        a.appendChild(navProgress);
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            header.scrollIntoView({ behavior: 'smooth' });
        });
        
        li.appendChild(a);
        navList.appendChild(li);
        
        // Adicionar marcador de progresso lateral
        const marker = document.createElement('div');
        marker.className = 'progress-marker';
        marker.setAttribute('data-crio-index', index.toString());
        marker.title = header.textContent || `CRIO ${index + 1}`;
        marker.setAttribute('role', 'button');
        marker.setAttribute('tabindex', '0');
        marker.setAttribute('aria-label', header.textContent || `CRIO ${index + 1}`);
        
        // Adicionar evento de clique no marcador
        marker.addEventListener('click', () => {
            header.scrollIntoView({ behavior: 'smooth' });
        });
        
        // Adicionar evento de teclado (Enter/Space)
        marker.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        progressMarkers.appendChild(marker);
    });
    
    // Adicionar observador de scroll para atualizar marcadores ativos e progresso
    updateActiveMarkers();
    window.addEventListener('scroll', updateActiveMarkers);
}

function updateActiveMarkers(): void {
    const contentDiv = document.getElementById('content');
    const markers = document.querySelectorAll('.progress-marker');
    const navLinks = document.querySelectorAll('#nav-list a');
    
    if (!contentDiv || markers.length === 0) return;
    
    const headers = contentDiv.querySelectorAll('h2');
    if (headers.length === 0) return;
    
    let activeIndex = -1;
    let maxProgress = 0;
    
    headers.forEach((header, index) => {
        const rect = header.getBoundingClientRect();
        const nextHeader = headers[index + 1];
        
        // Determinar se este CRIO está visível
        if (rect.top <= window.innerHeight / 3) {
            activeIndex = index;
            
            // Calcular progresso dentro desta seção
            if (nextHeader) {
                const nextRect = nextHeader.getBoundingClientRect();
                const sectionHeight = nextRect.top - rect.top;
                const scrolledInSection = Math.max(0, -rect.top);
                const progress = Math.min(100, (scrolledInSection / sectionHeight) * 100);
                maxProgress = progress;
            } else {
                // Última seção - usar altura do documento
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = window.scrollY;
                const headerTop = (header as HTMLElement).offsetTop;
                const sectionHeight = docHeight - headerTop;
                const scrolledInSection = scrolled - headerTop;
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
    
    // Atualizar links do menu
    navLinks.forEach((link, index) => {
        const li = link.parentElement;
        if (!li) return;
        
        const progressBar = link.querySelector('.nav-progress') as HTMLElement;
        
        if (index === activeIndex) {
            link.classList.add('active');
            li.classList.add('active');
            link.classList.remove('completed');
            li.classList.remove('completed');
            if (progressBar) {
                progressBar.style.transform = `scaleX(${maxProgress / 100})`;
            }
        } else if (index < activeIndex) {
            link.classList.remove('active');
            link.classList.add('completed');
            li.classList.remove('active');
            li.classList.add('completed');
            if (progressBar) {
                progressBar.style.transform = 'scaleX(1)';
            }
        } else {
            link.classList.remove('active', 'completed');
            li.classList.remove('active', 'completed');
            if (progressBar) {
                progressBar.style.transform = 'scaleX(0)';
            }
        }
    });
}

function initInteractiveFeatures(): void {
    initAudio();
    initProgressBar();
    initThemeToggle();
    initFontSize();
    initNavToggle();
    initVoidSymbol();
    initBackgroundParticles();
    initTextTremor();
    initAutoScroll();
    initExport();
    linkConceptsInContent();
}

// ============================================================================
// LINKAGEM DE CONCEITOS DO RIZOMA
// ============================================================================

function linkConceptsInContent(): void {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) {
        console.warn('Linkagem de conceitos: elemento #content não encontrado');
        return;
    }
    
    if (concepts.length === 0) {
        console.warn('Linkagem de conceitos: nenhum conceito carregado - tentando carregar novamente');
        // Tentar carregar conceitos novamente se ainda não foram carregados
        loadConcepts().then(() => {
            if (concepts.length > 0) {
                linkConceptsInContent();
            }
        });
        return;
    }

    // Criar mapa de conceitos para busca mais eficiente
    const conceptMap = new Map<string, Concept>();
    const conceptNames: string[] = [];

    concepts.forEach(concept => {
        conceptMap.set(concept.name.toLowerCase(), concept);
        conceptNames.push(concept.name);
        
        // Adicionar variações comuns
        const variations = generateConceptVariations(concept.name);
        variations.forEach(v => conceptMap.set(v.toLowerCase(), concept));
    });

    // Processar todos os parágrafos e listas
    const textElements = contentDiv.querySelectorAll('p, li, blockquote');
    
    let linksCreated = 0;
    
    textElements.forEach((element, index) => {
        if (element.classList.contains('concept-processed')) return;
        
        const initialLinks = element.querySelectorAll('.riz∅ma-link').length;
        linkConceptsInElement(element as HTMLElement, conceptMap);
        element.classList.add('concept-processed');
        const finalLinks = element.querySelectorAll('.riz∅ma-link').length;
        const newLinks = finalLinks - initialLinks;
        linksCreated += newLinks;
    });

    // Log de verificação final
    const allLinks = contentDiv.querySelectorAll('.riz∅ma-link');
}

function generateConceptVariations(name: string): string[] {
    const variations: string[] = [name];
    
    // Adicionar variações sem acentos
    const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized !== name) {
        variations.push(normalized);
    }
    
    // Se tiver parênteses, adicionar alternativa sem parênteses
    const withoutParens = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
    if (withoutParens !== name && withoutParens.length > 0) {
        variations.push(withoutParens);
    }
    
    // Adicionar apenas a primeira palavra se for composto (para matches parciais)
    const firstWord = name.split(/[\s(]/)[0];
    if (firstWord.length >= 4) { // Só palavras com 4+ caracteres
        variations.push(firstWord);
    }
    
    // Adicionar forma singular/plural simples
    if (name.endsWith('s') && !name.endsWith('ss')) {
        variations.push(name.slice(0, -1));
    } else if (!name.endsWith('s')) {
        variations.push(name + 's');
    }
    
    return variations;
}

function linkConceptsInElement(element: HTMLElement, conceptMap: Map<string, Concept>): void {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Não processar se já está dentro de um link
                if (node.parentElement?.classList.contains('riz∅ma-link')) {
                    return NodeFilter.FILTER_REJECT;
                }
                // Não processar links existentes
                if (node.parentElement?.tagName === 'A') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const textNodes: Text[] = [];
    let currentNode: Node | null;
    
    while (currentNode = walker.nextNode()) {
        textNodes.push(currentNode as Text);
    }

    // Processar cada nó de texto
    textNodes.forEach(textNode => {
        const text = textNode.textContent || '';
        if (text.trim().length === 0) return;

        const fragments = createConceptLinks(text, conceptMap);
        
        if (fragments.length > 1) {
            const parent = textNode.parentElement;
            if (!parent) return;

            // Substituir o nó de texto pelos fragmentos
            const tempContainer = document.createElement('span');
            fragments.forEach(frag => tempContainer.appendChild(frag));

            parent.replaceChild(tempContainer, textNode);
            
            // Desembrulhar o container temporário
            while (tempContainer.firstChild) {
                parent.insertBefore(tempContainer.firstChild, tempContainer);
            }
            parent.removeChild(tempContainer);
        }
    });
}

function createConceptLinks(text: string, conceptMap: Map<string, Concept>): (Text | HTMLElement)[] {
    const fragments: (Text | HTMLElement)[] = [];
    
    // Criar array de conceitos ordenado por tamanho (maiores primeiro)
    const conceptNames = Array.from(new Set(conceptMap.keys()));
    conceptNames.sort((a, b) => b.length - a.length);
    
    // Criar pattern que busca conceitos completos (case-insensitive)
    const escapedNames = conceptNames.map(n => escapeRegex(n));
    const pattern = new RegExp(
        '(^|[^\\wÀ-ÿ])(' + escapedNames.join('|') + ')(?![\\wÀ-ÿ])',
        'gi'
    );

    let lastIndex = 0;
    const matches: Array<{start: number, end: number, text: string, concept: Concept, prefixLen: number}> = [];
    
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
                concept: concept,
                prefixLen: prefix.length
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
    filteredMatches.forEach((match, index) => {
        // Adicionar texto antes do match
        if (match.start > lastIndex) {
            fragments.push(document.createTextNode(text.slice(lastIndex, match.start)));
        }

        // Criar link para o conceito
        const link = createConceptLink(match.text, match.concept);
        fragments.push(link);

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

function createConceptLink(text: string, concept: Concept): HTMLElement {
    const link = document.createElement('span');
    link.className = 'riz∅ma-link';
    link.textContent = text;
    link.setAttribute('data-concept-id', concept.id);
    link.setAttribute('data-concept-desc', concept.description);
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');
    
    // Converter cor (pode ser número ou string com "0x")
    let colorHex: string;
    if (typeof concept.color === 'string') {
        // Se for string tipo "0x9966ff", converter para "#9966ff"
        colorHex = '#' + concept.color.replace('0x', '');
    } else {
        // Se for número, converter para hex
        colorHex = '#' + concept.color.toString(16).padStart(6, '0');
    }
    
    link.style.setProperty('--concept-color', colorHex);
    link.style.color = colorHex; // Aplicar cor diretamente também
    link.style.textDecorationColor = colorHex;
    
    // Ao clicar, abrir o rizoma com foco nesse conceito
    const handleActivation = (e: Event) => {
        e.preventDefault();
        console.log(`Abrindo riz∅ma no conceito: ${concept.name} (${concept.id})`);
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

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// FUNCIONALIDADES INTERATIVAS
// ============================================================================

// Áudio
let currentAudio: HTMLAudioElement | null = null;

function initAudio(): void {
    const playBtn = document.getElementById('play-btn');
    const muteBtn = document.getElementById('mute-btn');
    const audio = document.getElementById('bg-audio') as HTMLAudioElement;
    const statusSpan = document.getElementById('audio-status');
    
    if (!playBtn || !muteBtn || !audio || !statusSpan) {
        console.warn('Elementos de áudio não encontrados:', { playBtn, muteBtn, audio, statusSpan });
        return;
    }
    
    currentAudio = audio;
    
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.textContent = '⏸';
                playBtn.setAttribute('aria-label', 'Pausar áudio');
                statusSpan.textContent = '♪';
                console.log('Áudio reproduzindo - tremor pausado');
                updateTextTremor(); // Atualizar tremor (vai zerar)
            }).catch(e => {
                console.error('Erro ao reproduzir áudio:', e);
                statusSpan.textContent = '✕';
            });
        } else {
            audio.pause();
            playBtn.textContent = '▶';
            playBtn.setAttribute('aria-label', 'Reproduzir áudio');
            statusSpan.textContent = '';
            console.log('Áudio pausado - tremor retomado');
            updateTextTremor(); // Atualizar tremor (vai retomar)
        }
    });
    
    muteBtn.addEventListener('click', () => {
        console.log('Alternando tema');
        
        // Reduzir tremor temporariamente
        reduceTextTremorTemporarily();
        
        // Apenas alternar tema
        document.body.classList.toggle('light-theme');
        const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('crio-theme', theme);
        updateThemeIcon();
        console.log(`Tema alterado para: ${theme}`);
    });
}

// Barra de progresso
function initProgressBar(): void {
    const progressBar = document.querySelector('.progress-bar-fill') as HTMLElement;
    const progressText = document.getElementById('reading-progress');
    
    if (!progressBar || !progressText) {
        console.warn('Elementos de progresso não encontrados:', { progressBar, progressText });
        return;
    }
    
    // Throttle and use transform for progress updates
    let ticking = false;
    let lastPos = 0;
    const onScroll = () => {
        lastPos = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const progress = (lastPos / (documentHeight - windowHeight)) * 100;
                const clampedProgress = Math.min(Math.max(progress, 0), 100);

                progressBar.style.transform = `scaleX(${clampedProgress / 100})`;
                progressBar.parentElement?.setAttribute('aria-valuenow', String(Math.round(clampedProgress)));
                const percent = Math.round(clampedProgress);
                progressText.textContent = percent > 0 ? `CRIO ${percent}%` : 'CRIO';

                ticking = false;
            });
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ============================================================================
// EXPORTAÇÃO EPUB
// ============================================================================

// Flag para prevenir exportação dupla
let isExporting = false;

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
    const title = '∅ → CRIO';
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
        a.download = 'crio.epub';
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

// ============================================================================
// CONTROLES DE INTERFACE
// ============================================================================

// Alternar tema
function initThemeToggle(): void {
    const savedTheme = localStorage.getItem('crio-theme');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) {
            themeIcon.textContent = '☀';
        }
        console.log('Tema claro aplicado (salvo)');
    }
    
    // Atualizar ícone quando o tema mudar
    updateThemeIcon();
}

function updateThemeIcon(): void {
    const themeIcon = document.querySelector('.theme-icon');
    if (!themeIcon) return;
    
    const isLightTheme = document.body.classList.contains('light-theme');
    themeIcon.textContent = isLightTheme ? '☀' : '☾';
}

// Tamanho da fonte
let currentFontSize = 1;
const fontSizes = [0.9, 1, 1.1, 1.2, 1.3];

function initFontSize(): void {
    const fontSizeBtn = document.getElementById('font-size-btn');
    
    if (!fontSizeBtn) {
        console.warn('Botão de tamanho de fonte não encontrado');
        return;
    }
    
    fontSizeBtn.addEventListener('click', () => {
        currentFontSize = (currentFontSize + 1) % fontSizes.length;
        const size = fontSizes[currentFontSize];
        document.documentElement.style.fontSize = `${size}rem`;
        localStorage.setItem('crio-font-size', currentFontSize.toString());
        console.log(`Tamanho de fonte alterado para: ${size}rem`);
    });
    
    // Restaurar tamanho salvo
    const savedSize = localStorage.getItem('crio-font-size');
    if (savedSize !== null) {
        currentFontSize = parseInt(savedSize);
        document.documentElement.style.fontSize = `${fontSizes[currentFontSize]}rem`;
        console.log(`Tamanho de fonte restaurado: ${fontSizes[currentFontSize]}rem`);
    }
}

// Botão de exportação
function initExport(): void {
    const exportBtn = document.getElementById('export-btn');
    
    if (!exportBtn) {
        console.warn('Botão de exportação não encontrado');
        return;
    }
    
    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        exportAsEpub();
    });
}

// Toggle de navegação
function initNavToggle(): void {
    const navToggle = document.getElementById('nav-toggle');
    const navIndex = document.getElementById('nav-index');
    
    if (!navToggle || !navIndex) {
        console.warn('Elementos de toggle de navegação não encontrados:', { navToggle, navIndex });
        return;
    }
    
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        navIndex.setAttribute('aria-hidden', isExpanded.toString());
        navIndex.classList.toggle('visible');
        console.log(`Navegação ${isExpanded ? 'fechada' : 'aberta'}`);
    });
}

// Símbolo do Vazio (∅)
let voidSymbolTimeout: number | null = null;
const VOID_TRIGGER_PHRASES = ['vazio', 'nada', 'zero', '∅', 'null', 'void'];

function initVoidSymbol(): void {
    const voidSymbol = document.querySelector('.void-symbol');
    
    if (!voidSymbol) {
        console.warn('Símbolo do vazio não encontrado');
        return;
    }
    
    // Observador de scroll para trigger em seções específicas e pulsar
    window.addEventListener('scroll', checkVoidTrigger);
    window.addEventListener('scroll', updateVoidPulse);
    
    // Trigger por palavras-chave no texto
    document.addEventListener('selectionchange', checkTextSelection);
    
    // Pulsar inicialmente
    updateVoidPulse();
}

function checkVoidTrigger(): void {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) return;
    
    const headers = contentDiv.querySelectorAll('h2');
    const voidSymbol = document.querySelector('.void-symbol');
    if (!voidSymbol || headers.length === 0) return;
    
    const scrollPos = window.scrollY + window.innerHeight / 2;
    
    // Trigger no primeiro CRIO (vazio)
    const firstHeader = headers[0] as HTMLElement;
    if (firstHeader) {
        const headerTop = firstHeader.offsetTop;
        const headerBottom = headerTop + firstHeader.offsetHeight * 3;
        
        if (scrollPos >= headerTop && scrollPos < headerBottom) {
            if (!voidSymbol.classList.contains('active')) {
                activateVoidSymbol();
            }
        } else {
            deactivateVoidSymbol();
        }
    }
    
    // Intensificar tremor em CRIOS específicos
    headers.forEach((header, index) => {
        const headerElement = header as HTMLElement;
        const headerTop = headerElement.offsetTop;
        const headerBottom = headerTop + headerElement.offsetHeight;
        const headerText = header.textContent?.toLowerCase() || '';
        
        if (scrollPos >= headerTop && scrollPos < headerBottom) {
            // CRIOS que devem ter tremor intenso
            if (headerText.includes('multiplicidade') || 
                headerText.includes('recursão') || 
                headerText.includes('caos') ||
                headerText.includes('entrelaçado')) {
                
                const main = document.querySelector('main') as HTMLElement;
                if (main) {
                    // Adicionar tremor extra para estes CRIOS
                    const baseIntensity = parseFloat(main.style.getPropertyValue('--tremor-intensity') || '0');
                    main.style.setProperty('--tremor-intensity', Math.min(baseIntensity + 1.5, MAX_TREMOR + 2).toString());
                }
            }
        }
    });
}

function checkTextSelection(): void {
    const selection = window.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString().toLowerCase().trim();
    
    if (VOID_TRIGGER_PHRASES.some(phrase => selectedText.includes(phrase))) {
        activateVoidSymbol(true); // Com zoom
        intensifyTremor(5, 2000); // Intensificar tremor durante seleção
    }
}

function activateVoidSymbol(withZoom: boolean = false): void {
    const voidSymbol = document.querySelector('.void-symbol');
    if (!voidSymbol) return;
    
    voidSymbol.classList.add('active');
    
    if (withZoom) {
        voidSymbol.classList.add('zoom');
        document.body.classList.add('symbol-takeover');
        
        // Remover após animação
        if (voidSymbolTimeout) {
            clearTimeout(voidSymbolTimeout);
        }
        
        voidSymbolTimeout = window.setTimeout(() => {
            deactivateVoidSymbol();
        }, 12000); // 12 segundos da animação
    }
}

function deactivateVoidSymbol(): void {
    const voidSymbol = document.querySelector('.void-symbol');
    if (!voidSymbol) return;
    
    voidSymbol.classList.remove('active', 'zoom');
    document.body.classList.remove('symbol-takeover');
}

// Pulsar do símbolo do vazio baseado no scroll
function updateVoidPulse(): void {
    const voidSymbol = document.querySelector('.void-symbol') as HTMLElement;
    if (!voidSymbol) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calcular progresso de leitura (0 a 1)
    const progress = scrollTop / (documentHeight - windowHeight);
    
    // Opacidade aumenta com o progresso
    // 0% = 0.05 (quase invisível)
    // 100% = 0.5 (bem visível)
    const baseOpacity = 0.05 + (progress * 0.45);
    
    // Tamanho aumenta levemente com o progresso
    // 0% = 18rem
    // 100% = 25rem
    const baseFontSize = 18 + (progress * 7);
    
    // Aplicar apenas se não estiver em estado especial (active/zoom)
    if (!voidSymbol.classList.contains('active') && !voidSymbol.classList.contains('zoom')) {
        voidSymbol.style.opacity = baseOpacity.toString();
        voidSymbol.style.fontSize = `${baseFontSize}rem`;
    }
}

// Partículas de fundo (luzes/escuridão)
function initBackgroundParticles(): void {
    const particleCount = 30; // Número reduzido para performance
    const body = document.body;
    
    // Criar container de partículas
    let particleContainer = document.querySelector('.particles-container') as HTMLElement;
    
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.className = 'particles-container';
        particleContainer.setAttribute('aria-hidden', 'true');
        body.insertBefore(particleContainer, body.firstChild);
    }
    
    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer, i);
    }
}

function createParticle(container: HTMLElement, index: number): void {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Posição aleatória
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 3 + 1; // 1-4px
    const duration = Math.random() * 20 + 15; // 15-35s
    const delay = Math.random() * 10; // 0-10s
    
    // Movimento aleatório
    const tx1 = (Math.random() - 0.5) * 100;
    const ty1 = (Math.random() - 0.5) * 100;
    const tx2 = (Math.random() - 0.5) * 100;
    const ty2 = (Math.random() - 0.5) * 100;
    const tx3 = (Math.random() - 0.5) * 100;
    const ty3 = (Math.random() - 0.5) * 100;
    
    particle.style.cssText = `
        position: fixed;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: var(--emergence);
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.3;
        animation: float ${duration}s infinite ease-in-out ${delay}s;
        --tx1: ${tx1}px;
        --ty1: ${ty1}px;
        --tx2: ${tx2}px;
        --ty2: ${ty2}px;
        --tx3: ${tx3}px;
        --ty3: ${ty3}px;
        box-shadow: 0 0 ${size * 2}px var(--emergence);
    `;
    
    container.appendChild(particle);
}

// Tremulação Progressiva do Texto
let tremorIntensity = 0;
const MAX_TREMOR = 3; // Intensidade máxima da tremulação
const TREMOR_START = 0.2; // Começa a tremular após 20% da página
const TREMOR_PEAK = 0.8; // Atinge máximo em 80% da página

function initTextTremor(): void {
    // Atualizar tremor durante scroll
    window.addEventListener('scroll', updateTextTremor);
    
    // Atualizar inicialmente
    updateTextTremor();
}

function updateTextTremor(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calcular progresso de leitura (0 a 1)
    const progress = scrollTop / (documentHeight - windowHeight);
    
    // Verificar se o áudio está tocando
    const audio = document.getElementById('bg-audio') as HTMLAudioElement;
    const isAudioPlaying = audio && !audio.paused;
    
    // Se áudio estiver tocando, tremor é zero (caos passa para o áudio)
    let intensity = 0;
    
    if (!isAudioPlaying) {
        // Calcular intensidade do tremor baseado no progresso
        if (progress < TREMOR_START) {
            // Antes de 20%: sem tremor
            intensity = 0;
        } else if (progress < TREMOR_PEAK) {
            // Entre 20% e 80%: crescimento gradual
            const tremorProgress = (progress - TREMOR_START) / (TREMOR_PEAK - TREMOR_START);
            intensity = tremorProgress * MAX_TREMOR;
        } else {
            // Após 80%: tremor máximo
            intensity = MAX_TREMOR;
        }
    }
    
    // Aplicar intensidade ao elemento main
    const main = document.querySelector('main') as HTMLElement;
    if (main) {
        main.style.setProperty('--tremor-intensity', intensity.toString());
        
        // Log periódico (a cada 10%)
        if (Math.floor(progress * 10) !== Math.floor((tremorIntensity / MAX_TREMOR) * 10)) {
            console.log(`Tremor: ${intensity.toFixed(2)} (${(progress * 100).toFixed(0)}% da página)${isAudioPlaying ? ' [ÁUDIO TOCANDO - tremor pausado]' : ''}`);
        }
        
        // Adicionar classe para tremor alto
        if (intensity >= MAX_TREMOR * 0.7) {
            main.classList.add('high-tremor');
        } else {
            main.classList.remove('high-tremor');
        }
    }
    
    // Atualizar variável global
    tremorIntensity = intensity;
    
    // Trigger do vazio no fim da página
    checkEndOfPage(progress);
}

// Função para intensificar temporariamente o tremor (ex: em momentos específicos)
function intensifyTremor(multiplier: number = 2, duration: number = 3000): void {
    const main = document.querySelector('main') as HTMLElement;
    if (!main) return;
    
    const currentIntensity = tremorIntensity;
    const intensifiedValue = currentIntensity * multiplier;
    
    main.style.setProperty('--tremor-intensity', intensifiedValue.toString());
    
    setTimeout(() => {
        main.style.setProperty('--tremor-intensity', currentIntensity.toString());
    }, duration);
}

// Função para reduzir temporariamente o tremor (ao trocar de tema)
function reduceTextTremorTemporarily(): void {
    const main = document.querySelector('main') as HTMLElement;
    if (!main) return;
    
    const currentIntensity = tremorIntensity;
    const reducedIntensity = currentIntensity * 0.1; // Reduz para 10%
    
    // Calcular duração baseada na intensidade atual
    // 0 intensidade = 1s, máxima intensidade = 9s
    const intensityRatio = currentIntensity / MAX_TREMOR;
    const returnDuration = 1000 + (intensityRatio * 8000); // 1s a 9s
    const reductionDuration = 300 + (intensityRatio * 500); // 0.3s a 0.8s
    
    console.log(`Reduzindo tremor temporariamente: ${currentIntensity.toFixed(2)} → ${reducedIntensity.toFixed(2)} (retorno em ${(returnDuration/1000).toFixed(1)}s)`);
    
    // Animar redução para 10%
    animateTremorChange(currentIntensity, reducedIntensity, reductionDuration, () => {
        console.log(`Tremor reduzido, aguardando antes de retornar em ${(returnDuration/1000).toFixed(1)}s...`);
        
        // Aguardar um pouco e retornar gradualmente
        setTimeout(() => {
            console.log(`Tremor retornando gradualmente: ${reducedIntensity.toFixed(2)} → ${currentIntensity.toFixed(2)}`);
            animateTremorChange(reducedIntensity, currentIntensity, returnDuration);
        }, 500);
    });
}

// Função auxiliar para animar mudanças de tremor
function animateTremorChange(from: number, to: number, duration: number, onComplete?: () => void): void {
    const main = document.querySelector('main') as HTMLElement;
    if (!main) return;
    
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: ease-in-out
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentValue = from + (to - from) * eased;
        main.style.setProperty('--tremor-intensity', currentValue.toString());
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    requestAnimationFrame(animate);
}

// Vazio no fim da página
let endOfPageTriggered = false;
const END_PAGE_THRESHOLD = 0.95; // Trigger aos 95% da página

function checkEndOfPage(progress: number): void {
    if (progress >= END_PAGE_THRESHOLD && !endOfPageTriggered) {
        endOfPageTriggered = true;
        triggerEndOfPageVoid();
    } else if (progress < END_PAGE_THRESHOLD && endOfPageTriggered) {
        // Reset se voltar
        endOfPageTriggered = false;
    }
}

function triggerEndOfPageVoid(): void {
    console.log('🌀 FIM DA PÁGINA - Invocando o vazio...');
    
    const voidSymbol = document.querySelector('.void-symbol');
    if (!voidSymbol) return;
    
    // Ativar com zoom
    voidSymbol.classList.add('active', 'zoom');
    document.body.classList.add('symbol-takeover');
    
    // Tremor máximo
    intensifyTremor(10, 12000);
    
    // Fade out do conteúdo
    const main = document.querySelector('main') as HTMLElement;
    
    if (main) {
        main.style.transition = 'opacity 6s ease-out';
        main.style.opacity = '0';
    }
    
    // Intensificar partículas
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const htmlParticle = particle as HTMLElement;
        setTimeout(() => {
            htmlParticle.style.transition = 'all 2s ease-out';
            htmlParticle.style.opacity = '0.8';
            htmlParticle.style.transform = `scale(${2 + Math.random() * 2})`;
        }, index * 50);
    });
    
    // Aguardar 9 segundos antes de retornar ao início
    setTimeout(() => {
        console.log('🔄 Retornando ao início...');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reset após scroll
        setTimeout(() => {
            resetEndOfPage();
        }, 1000);
    }, 9000); // 9 segundos de delay
}

function resetEndOfPage(): void {
    console.log('Reset do efeito de fim de página');
    
    const main = document.querySelector('main') as HTMLElement;
    const voidSymbol = document.querySelector('.void-symbol');
    
    // Restaurar opacity do main
    if (main) {
        main.style.transition = 'opacity 1s ease-in';
        main.style.opacity = '1';
        
        // Limpar após transição
        setTimeout(() => {
            main.style.transition = '';
        }, 1000);
    }
    
    if (voidSymbol) {
        voidSymbol.classList.remove('active', 'zoom');
    }
    
    document.body.classList.remove('symbol-takeover');
    
    // Reset partículas
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle) => {
        const htmlParticle = particle as HTMLElement;
        htmlParticle.style.transition = '';
        htmlParticle.style.opacity = '';
        htmlParticle.style.transform = '';
    });
    
    // Permitir re-trigger se rolar novamente
    endOfPageTriggered = false;
}

// ============================================================================
// AUTOSCROLL MEDITATIVO
// ============================================================================

let autoScrollActive = false;
let autoScrollInterval: number | null = null;
const AUTO_SCROLL_SPEED = 0.5; // pixels por frame (ajustável)
const AUTO_SCROLL_FPS = 60;

function initAutoScroll(): void {
    // Criar botão de autoscroll
    const audioUI = document.querySelector('.audio-ui');
    if (!audioUI) {
        console.warn('Audio UI não encontrado para adicionar botão de autoscroll');
        return;
    }
    
    const autoScrollBtn = document.createElement('button');
    autoScrollBtn.className = 'nav-action-btn';
    autoScrollBtn.id = 'auto-scroll-btn';
    autoScrollBtn.setAttribute('aria-label', 'Ativar autoscroll meditativo');
    autoScrollBtn.innerHTML = '<span class="nav-action-icon" aria-hidden="true">⬇</span><span class="nav-action-text">Autoscroll</span>';
    autoScrollBtn.title = 'Autoscroll meditativo';
    
    // Inserir no menu de ações (nav-actions)
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        navActions.appendChild(autoScrollBtn);
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

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Carregar conceitos primeiro
    await loadConcepts();
    
    // Depois carregar e renderizar o conteúdo
    await loadCRIOSContent();
});
