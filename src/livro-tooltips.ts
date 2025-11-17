/**
 * LIVRO-TOOLTIPS: Sistema de tooltips para conceitos
 * Mostra preview de conceitos ao passar o mouse
 */

import type { Concept, Relation } from './types.js';

// Constantes
const TOOLTIP_DELAY_MS = 300; // Delay antes de mostrar tooltip
const TOOLTIP_OFFSET_X = 10;
const TOOLTIP_OFFSET_Y = -10;

// Estado do tooltip
let currentTooltip: HTMLElement | null = null;
let tooltipTimeout: number | null = null;
let activeConceptId: string | null = null;

// Cache de relações
let relationsCache: Relation[] | null = null;

/**
 * Inicializa o sistema de tooltips
 */
export async function initTooltips(): Promise<void> {
    // Carregar relações
    await loadRelations();
    
    // Criar container para tooltips se não existir
    if (!document.getElementById('tooltip-container')) {
        const container = document.createElement('div');
        container.id = 'tooltip-container';
        container.setAttribute('role', 'tooltip');
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);
    }
    
    // Event listeners globais para esconder tooltip
    document.addEventListener('scroll', hideTooltip, { passive: true });
    window.addEventListener('resize', hideTooltip);
}

/**
 * Carrega as relações do grafo
 */
async function loadRelations(): Promise<void> {
    if (relationsCache !== null) return;
    
    try {
        const response = await fetch('assets/relations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        relationsCache = await response.json();
    } catch (error) {
        console.error('Erro ao carregar relações:', error);
        relationsCache = [];
    }
}

/**
 * Calcula número de conexões de um conceito
 */
function getConnectionCount(conceptId: string): number {
    if (!relationsCache) return 0;
    
    return relationsCache.filter(rel => 
        rel.from === conceptId || rel.to === conceptId
    ).length;
}

/**
 * Ativa tooltips em um link de conceito
 */
export function activateTooltipForLink(link: HTMLAnchorElement, concept: Concept, concepts: Concept[]): void {
    // Verificar se já foi inicializado
    if (link.dataset.tooltipInitialized === 'true') {
        return;
    }
    link.dataset.tooltipInitialized = 'true';
    
    // Mouse enter - agendar tooltip
    link.addEventListener('mouseenter', (e: MouseEvent) => {
        scheduleTooltip(e, link, concept, concepts);
    });
    
    // Mouse leave - cancelar/esconder
    link.addEventListener('mouseleave', () => {
        cancelTooltip();
    });
    
    // Mouse move - atualizar posição
    link.addEventListener('mousemove', (e: MouseEvent) => {
        if (currentTooltip && activeConceptId === concept.id) {
            updateTooltipPosition(e);
        }
    });
    
    // Focus (keyboard) - mostrar imediatamente
    link.addEventListener('focus', (e: Event) => {
        const rect = link.getBoundingClientRect();
        const mockEvent = {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top
        } as MouseEvent;
        showTooltip(mockEvent, link, concept, concepts);
    });
    
    // Blur - esconder
    link.addEventListener('blur', () => {
        hideTooltip();
    });
}

/**
 * Agenda a exibição do tooltip
 */
function scheduleTooltip(
    event: MouseEvent, 
    link: HTMLAnchorElement, 
    concept: Concept,
    concepts: Concept[]
): void {
    // Cancelar tooltip anterior
    cancelTooltip();
    
    // Agendar novo tooltip
    tooltipTimeout = window.setTimeout(() => {
        showTooltip(event, link, concept, concepts);
    }, TOOLTIP_DELAY_MS);
}

/**
 * Cancela tooltip agendado
 */
function cancelTooltip(): void {
    if (tooltipTimeout !== null) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }
    hideTooltip();
}

/**
 * Mostra o tooltip
 */
function showTooltip(
    event: MouseEvent, 
    link: HTMLAnchorElement, 
    concept: Concept,
    concepts: Concept[]
): void {
    // Esconder qualquer tooltip anterior primeiro
    hideTooltip();
    
    // Criar tooltip
    const tooltip = createTooltipElement(concept, concepts);
    currentTooltip = tooltip;
    activeConceptId = concept.id;
    
    // Adicionar ao container
    const container = document.getElementById('tooltip-container');
    if (container) {
        container.appendChild(tooltip);
        container.setAttribute('aria-hidden', 'false');
    }
    
    // Posicionar
    updateTooltipPosition(event);
    
    // Animar entrada
    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });
}

/**
 * Esconde o tooltip
 */
export function hideTooltip(): void {
    // Limpar todos os tooltips do container
    const container = document.getElementById('tooltip-container');
    if (container) {
        // Remover todos os tooltips imediatamente
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.setAttribute('aria-hidden', 'true');
    }
    
    // Limpar referência
    currentTooltip = null;
    activeConceptId = null;
}

/**
 * Atualiza a posição do tooltip
 */
function updateTooltipPosition(event: MouseEvent): void {
    if (!currentTooltip) return;
    
    const x = event.clientX + TOOLTIP_OFFSET_X;
    const y = event.clientY + TOOLTIP_OFFSET_Y;
    
    // Obter dimensões do tooltip
    const rect = currentTooltip.getBoundingClientRect();
    const tooltipWidth = rect.width;
    const tooltipHeight = rect.height;
    
    // Ajustar para não sair da viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    // Se sair pela direita, mostrar à esquerda do cursor
    if (x + tooltipWidth > viewportWidth - 10) {
        finalX = event.clientX - tooltipWidth - TOOLTIP_OFFSET_X;
    }
    
    // Se sair por baixo, mostrar acima do cursor
    if (y + tooltipHeight > viewportHeight - 10) {
        finalY = event.clientY - tooltipHeight - Math.abs(TOOLTIP_OFFSET_Y);
    }
    
    // Se sair pela esquerda, reposicionar
    if (finalX < 10) {
        finalX = 10;
    }
    
    // Se sair por cima, reposicionar
    if (finalY < 10) {
        finalY = 10;
    }
    
    currentTooltip.style.left = `${finalX}px`;
    currentTooltip.style.top = `${finalY}px`;
}

/**
 * Cria o elemento HTML do tooltip
 */
function createTooltipElement(concept: Concept, concepts: Concept[]): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'concept-tooltip';
    
    // Obter cor da camada
    const layerColor = getColorHex(concept.layer);
    
    // Contar conexões usando relações
    const connections = getConnectionCount(concept.id);
    
    // Descrição truncada
    const maxDescLength = 150;
    const description = concept.description || 'Sem descrição disponível.';
    const truncatedDesc = description.length > maxDescLength
        ? description.slice(0, maxDescLength) + '...'
        : description;
    
    // Obter nome da camada formatado
    const layerName = formatLayerName(concept.layer);
    
    tooltip.innerHTML = `
        <div class="tooltip-header" style="border-left: 4px solid ${layerColor}">
            <strong class="tooltip-title">${escapeHtml(concept.name)}</strong>
            <span class="layer-tag" style="background-color: ${layerColor}20; color: ${layerColor}">
                ${layerName}
            </span>
        </div>
        <p class="tooltip-desc">${escapeHtml(truncatedDesc)}</p>
        <div class="tooltip-footer">
            <span class="tooltip-connections">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                    <line x1="12" y1="9" x2="12" y2="6"/>
                    <line x1="15" y1="12" x2="18" y2="12"/>
                    <line x1="12" y1="15" x2="12" y2="18"/>
                    <line x1="9" y1="12" x2="6" y2="12"/>
                </svg>
                ${connections} ${connections === 1 ? 'conexão' : 'conexões'}
            </span>
            <a href="riz∅ma.html?concept=${concept.id}" class="tooltip-link" onclick="event.stopPropagation()">
                Ver no Rizoma →
            </a>
        </div>
    `;
    
    return tooltip;
}

/**
 * Formata nome da camada para exibição
 */
function formatLayerName(layer: string): string {
    // Remove sufixo numérico de subcamadas
    const baseName = layer.split('-')[0];
    
    const names: Record<string, string> = {
        'ontologica': 'Ontológica',
        'politica': 'Política',
        'pratica': 'Prática',
        'fundacional': 'Fundacional',
        'epistemica': 'Epistêmica',
        'ecologica': 'Ecológica',
        'temporal': 'Temporal',
        'etica': 'Ética',
        'epistemologica': 'Epistemológica',
        'ecologica-material': 'Ecológica-Material',
        'pedagogica': 'Pedagógica',
        'indigena-comunitaria': 'Indígena-Comunitária',
        'pratica-institucional': 'Prática-Institucional'
    };
    
    return names[baseName] || baseName.charAt(0).toUpperCase() + baseName.slice(1);
}

/**
 * Converte cor numérica para hex
 */
function getColorHex(layer: string): string {
    const LAYER_COLORS: Record<string, number> = {
        'ontologica': 0x66ccff,
        'politica': 0xff6666,
        'pratica': 0x99ccff,
        'fundacional': 0x9966ff,
        'epistemica': 0xff9966,
        'ecologica': 0x66ff99,
        'temporal': 0xcccccc,
        'etica': 0xffff66,
        
        'ontologica-0': 0x3399ff,
        'ontologica-1': 0x4db8ff,
        'ontologica-2': 0x66ccff,
        'ontologica-3': 0x99ddff,
        
        'politica-0': 0xcc3333,
        'politica-1': 0xff4d4d,
        'politica-2': 0xff6666,
        'politica-3': 0xff9999,
        
        'pratica-0': 0x6699ff,
        'pratica-1': 0x80bdff,
        'pratica-2': 0x99ccff,
        'pratica-3': 0xcce6ff,
        
        'fundacional-0': 0x6633cc,
        'fundacional-1': 0x8052ff,
        'fundacional-2': 0x9966ff,
        'fundacional-3': 0xc299ff,
        
        'epistemica-0': 0xcc6633,
        'epistemica-1': 0xff8552,
        'epistemica-2': 0xff9966,
        'epistemica-3': 0xffc299,
        
        'ecologica-0': 0x33cc66,
        'ecologica-1': 0x52ff85,
        'ecologica-2': 0x66ff99,
        'ecologica-3': 0x99ffc2,
        
        'temporal-0': 0x999999,
        'temporal-1': 0xb8b8b8,
        'temporal-2': 0xcccccc,
        'temporal-3': 0xe0e0e0,
        
        'etica-0': 0xcccc33,
        'etica-1': 0xffff4d,
        'etica-2': 0xffff66,
        'etica-3': 0xffff99
    };
    
    const color = LAYER_COLORS[layer] || LAYER_COLORS[layer.split('-')[0]] || 0x66ccff;
    return '#' + color.toString(16).padStart(6, '0');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
