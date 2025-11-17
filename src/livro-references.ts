/**
 * LIVRO-REFERENCES: Sistema de painel de referências por capítulo
 * Mostra sidebar com referências bibliográficas e conceitos do capítulo atual
 */

import type { Concept } from './types.js';

interface ChapterMetadata {
    id: string;
    title: string;
    number: number;
    part: string;
    concepts: Array<{
        id: string;
        mentions: number;
    }>;
    authors: string[];
    protocols: string[];
    layerDistribution: Record<string, number>;
    wordCount: number;
}

interface ChapterMetadataFile {
    chapters: ChapterMetadata[];
}

// Estado
let chapterMetadata: ChapterMetadataFile | null = null;
let currentChapterIndex: number = 0;
let sidebarOpen: boolean = false;

/**
 * Inicializa o sistema de referências
 */
export async function initReferences(concepts: Concept[]): Promise<void> {
    console.log('Inicializando painel de referências...');
    
    // Carregar metadados dos capítulos
    await loadChapterMetadata();
    
    // Criar UI do sidebar
    createSidebar();
    
    // Observar scroll para detectar capítulo atual
    observeScroll();
    
    // Event listeners
    setupEventListeners();
}

/**
 * Carrega metadados dos capítulos
 */
async function loadChapterMetadata(): Promise<void> {
    try {
        const response = await fetch('assets/chapter-metadata.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        chapterMetadata = await response.json();
        console.log(`✓ ${chapterMetadata?.chapters.length || 0} capítulos de metadados carregados`);
    } catch (error) {
        console.error('Erro ao carregar metadados dos capítulos:', error);
        chapterMetadata = { chapters: [] };
    }
}

/**
 * Cria a estrutura HTML do sidebar
 */
function createSidebar(): void {
    // Verificar se já existe
    if (document.getElementById('references-sidebar')) return;
    
    const sidebar = document.createElement('aside');
    sidebar.id = 'references-sidebar';
    sidebar.className = 'references-sidebar';
    sidebar.setAttribute('aria-label', 'Referências do capítulo');
    
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h3>Referências</h3>
            <button 
                id="sidebar-close" 
                class="sidebar-close-btn" 
                aria-label="Fechar painel de referências"
            >
                ✕
            </button>
        </div>
        <div class="sidebar-content" id="sidebar-content">
            <p class="sidebar-placeholder">Carregando...</p>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    
    // Criar botão de toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'references-toggle';
    toggleBtn.className = 'references-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Abrir painel de referências');
    toggleBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <line x1="10" y1="8" x2="16" y2="8"></line>
            <line x1="10" y1="12" x2="16" y2="12"></line>
            <line x1="10" y1="16" x2="14" y2="16"></line>
        </svg>
    `;
    
    document.body.appendChild(toggleBtn);
}

/**
 * Configura event listeners
 */
function setupEventListeners(): void {
    const toggleBtn = document.getElementById('references-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('references-sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    
    // Fechar ao clicar fora
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            if (e.target === sidebar) {
                closeSidebar();
            }
        });
    }
    
    // Suporte para teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) {
            closeSidebar();
        }
    });
}

/**
 * Toggle sidebar
 */
function toggleSidebar(): void {
    if (sidebarOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

/**
 * Abre sidebar
 */
function openSidebar(): void {
    const sidebar = document.getElementById('references-sidebar');
    const toggleBtn = document.getElementById('references-toggle');
    
    if (sidebar) {
        sidebar.classList.add('open');
        sidebarOpen = true;
        
        // Atualizar conteúdo
        updateSidebarContent();
    }
    
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', 'Fechar painel de referências');
    }
}

/**
 * Fecha sidebar
 */
function closeSidebar(): void {
    const sidebar = document.getElementById('references-sidebar');
    const toggleBtn = document.getElementById('references-toggle');
    
    if (sidebar) {
        sidebar.classList.remove('open');
        sidebarOpen = false;
    }
    
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', 'Abrir painel de referências');
    }
}

/**
 * Observa scroll para detectar capítulo atual
 */
function observeScroll(): void {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chapterElement = entry.target as HTMLElement;
                    const chapterId = chapterElement.id;
                    
                    // Encontrar índice do capítulo
                    if (chapterMetadata) {
                        const index = chapterMetadata.chapters.findIndex(
                            ch => ch.id === chapterId
                        );
                        
                        if (index !== -1 && index !== currentChapterIndex) {
                            currentChapterIndex = index;
                            if (sidebarOpen) {
                                updateSidebarContent();
                            }
                        }
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        }
    );
    
    // Observar todos os h1 (capítulos)
    const chapters = document.querySelectorAll('h1[id^="capitulo-"]');
    chapters.forEach(ch => observer.observe(ch));
}

/**
 * Atualiza conteúdo do sidebar com dados do capítulo atual
 */
async function updateSidebarContent(): Promise<void> {
    const content = document.getElementById('sidebar-content');
    if (!content || !chapterMetadata) return;
    
    const chapter = chapterMetadata.chapters[currentChapterIndex];
    if (!chapter) {
        content.innerHTML = '<p class="sidebar-placeholder">Capítulo não encontrado</p>';
        return;
    }
    
    // Carregar conceitos para obter detalhes
    const conceptsResponse = await fetch('assets/concepts.json');
    const concepts: Concept[] = await conceptsResponse.json();
    const conceptMap = new Map(concepts.map(c => [c.id, c]));
    
    // Construir HTML
    let html = `
        <div class="chapter-info">
            <h4>${chapter.title}</h4>
            <div class="chapter-meta">
                <span>Parte ${chapter.part}</span>
                <span>•</span>
                <span>${chapter.wordCount.toLocaleString('pt-BR')} palavras</span>
            </div>
        </div>
    `;
    
    // Autores citados
    if (chapter.authors && chapter.authors.length > 0) {
        html += `
            <div class="sidebar-section">
                <h5>Autores Citados</h5>
                <ul class="authors-list">
                    ${chapter.authors.map(author => `
                        <li>
                            <a href="referencias.html?search=${encodeURIComponent(author)}" 
                               target="_blank"
                               rel="noopener">
                                ${escapeHtml(author)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Conceitos principais (top 10)
    if (chapter.concepts && chapter.concepts.length > 0) {
        const topConcepts = chapter.concepts.slice(0, 10);
        html += `
            <div class="sidebar-section">
                <h5>Conceitos Principais</h5>
                <div class="concepts-cloud">
                    ${topConcepts.map(({ id, mentions }) => {
                        const concept = conceptMap.get(id);
                        if (!concept) return '';
                        
                        const size = Math.min(1.2, 0.8 + (mentions / 10));
                        return `
                            <a href="riz∅ma.html?focus=${id}" 
                               class="concept-tag"
                               style="font-size: ${size}em"
                               title="${escapeHtml(concept.description)}">
                                ${escapeHtml(concept.name)}
                                <span class="mention-count">${mentions}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Distribuição por camadas
    if (chapter.layerDistribution && Object.keys(chapter.layerDistribution).length > 0) {
        const total = Object.values(chapter.layerDistribution).reduce((a, b) => a + b, 0);
        html += `
            <div class="sidebar-section">
                <h5>Distribuição Ontológica</h5>
                <div class="layer-distribution">
                    ${Object.entries(chapter.layerDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([layer, count]) => {
                            const percentage = ((count / total) * 100).toFixed(0);
                            return `
                                <div class="layer-bar">
                                    <div class="layer-label">${formatLayerName(layer)}</div>
                                    <div class="layer-bar-container">
                                        <div class="layer-bar-fill" 
                                             style="width: ${percentage}%; background-color: ${getLayerColor(layer)}">
                                        </div>
                                    </div>
                                    <div class="layer-count">${count}</div>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
        `;
    }
    
    // Protocolos
    if (chapter.protocols && chapter.protocols.length > 0) {
        html += `
            <div class="sidebar-section">
                <h5>Protocolos Práticos</h5>
                <ul class="protocols-list">
                    ${chapter.protocols.map(protocolId => `
                        <li>
                            <a href="#${protocolId}">
                                ${formatProtocolName(protocolId)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

/**
 * Formata nome de camada
 */
function formatLayerName(layer: string): string {
    const names: Record<string, string> = {
        'ontologica': 'Ontológica',
        'politica': 'Política',
        'pratica': 'Prática',
        'fundacional': 'Fundacional',
        'epistemica': 'Epistêmica',
        'ecologica': 'Ecológica',
        'temporal': 'Temporal',
        'etica': 'Ética'
    };
    return names[layer] || layer;
}

/**
 * Obtém cor de camada
 */
function getLayerColor(layer: string): string {
    const colors: Record<string, string> = {
        'ontologica': '#66ccff',
        'politica': '#ff6666',
        'pratica': '#99ccff',
        'fundacional': '#9966ff',
        'epistemica': '#ff9966',
        'ecologica': '#66ff99',
        'temporal': '#cccccc',
        'etica': '#ffff66'
    };
    return colors[layer] || '#66ccff';
}

/**
 * Formata nome de protocolo
 */
function formatProtocolName(protocolId: string): string {
    const names: Record<string, string> = {
        'auditoria-expectativas-implicitas': 'Auditoria de Expectativas Implícitas',
        'teste-reciprocidade-identitaria': 'Teste de Reciprocidade Identitária',
        'indice-reversibilidade-paradigmatica': 'Índice de Reversibilidade Paradigmática',
        'auditoria-transparencia-assimetrica': 'Auditoria de Transparência Assimétrica',
        'protocolo-divergencia-construtiva': 'Protocolo de Divergência Construtiva'
    };
    return names[protocolId] || protocolId;
}

/**
 * Escapa HTML
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
