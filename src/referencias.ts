// referencias.ts - Gerenciamento da página de referências do PAÊBIRÚ

interface Referencia {
    autor: string;
    titulo: string;
    ano: string | number;
    editora?: string;
    publicacao?: string;
    relevancia: string;
    categoria: string;
    conceitos?: string[];
}

interface ConceptRizoma {
    id: string;
    name: string;
    description: string;
    connections: string[];
    layer: string;
}

// Estado global
let referencias: Referencia[] = [];
let conceptsRizoma: ConceptRizoma[] = [];
let currentFilter = 'todos';
let searchTerm = '';
let yearMin = -600;
let yearMax = 2030;

// Carregar tema salvo
const savedTheme = localStorage.getItem('crio-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// Extrair ano numérico de uma string
function extractYear(ano: string | number): number {
    if (typeof ano === 'number') return ano;
    if (typeof ano === 'string') {
        // Trata anos negativos (AC/BCE)
        const negativeMatch = ano.match(/-?\d{1,4}/);
        if (negativeMatch) return parseInt(negativeMatch[0]);
        
        // Tenta "c. 200 EC" ou similar
        const match = ano.match(/\d{4}/);
        if (match) return parseInt(match[0]);
        
        // Se for algo como "c. 200 AC", extrai e nega
        if (ano.includes('AC') || ano.includes('BCE')) {
            const numMatch = ano.match(/\d+/);
            if (numMatch) return -parseInt(numMatch[0]);
        }
        
        // Padrão geral
        const numMatch = ano.match(/\d+/);
        if (numMatch) return parseInt(numMatch[0]);
    }
    return 0;
}

// Configurar sliders de período
function setupPeriodSliders(): void {
    const yearMinSlider = document.getElementById('year-min') as HTMLInputElement;
    const yearMaxSlider = document.getElementById('year-max') as HTMLInputElement;
    const yearMinDisplay = document.getElementById('year-min-display') as HTMLElement;
    const yearMaxDisplay = document.getElementById('year-max-display') as HTMLElement;

    if (!yearMinSlider || !yearMaxSlider || !yearMinDisplay || !yearMaxDisplay) return;

    yearMinSlider.addEventListener('input', (e) => {
        yearMin = parseInt((e.target as HTMLInputElement).value);
        if (yearMin > yearMax) {
            yearMin = yearMax;
            yearMinSlider.value = yearMin.toString();
        }
        yearMinDisplay.textContent = yearMin.toString();
        renderReferencias();
    });

    yearMaxSlider.addEventListener('input', (e) => {
        yearMax = parseInt((e.target as HTMLInputElement).value);
        if (yearMax < yearMin) {
            yearMax = yearMin;
            yearMaxSlider.value = yearMax.toString();
        }
        yearMaxDisplay.textContent = yearMax.toString();
        renderReferencias();
    });
}

// Definir período predefinido
(window as any).setPeriod = function(min: number, max: number): void {
    yearMin = min;
    yearMax = max;
    
    const yearMinSlider = document.getElementById('year-min') as HTMLInputElement;
    const yearMaxSlider = document.getElementById('year-max') as HTMLInputElement;
    const yearMinDisplay = document.getElementById('year-min-display') as HTMLElement;
    const yearMaxDisplay = document.getElementById('year-max-display') as HTMLElement;
    
    if (yearMinSlider) yearMinSlider.value = min.toString();
    if (yearMaxSlider) yearMaxSlider.value = max.toString();
    if (yearMinDisplay) yearMinDisplay.textContent = min.toString();
    if (yearMaxDisplay) yearMaxDisplay.textContent = max.toString();
    
    // Atualizar botões ativos
    document.querySelectorAll('.period-preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Marcar o botão clicado como ativo
    if ((event as any) && (event as any).target) {
        (event as any).target.classList.add('active');
    }
    
    renderReferencias();
}

// Carregar referências
async function loadReferencias(): Promise<void> {
    try {
        const [refResponse, conceptsResponse] = await Promise.all([
            fetch('assets/referencias.json'),
            fetch('assets/concepts.json')
        ]);
        
        referencias = await refResponse.json();
        conceptsRizoma = await conceptsResponse.json();
        
        // Atualizar contagem de referências no header
        const totalRefsText = document.getElementById('total-referencias-text');
        if (totalRefsText) {
            totalRefsText.textContent = `${referencias.length} obras`;
        }
        
        setupPeriodSliders();
        updateStats();
        renderFilterButtons();
        renderReferencias();
        renderUnmappedConcepts();
    } catch (error) {
        console.error('Erro ao carregar referências:', error);
    }
}

// Atualizar estatísticas
function updateStats(): void {
    const categorias = new Set(referencias.map(r => r.categoria));
    
    // Contar conceitos únicos normalizados
    const conceitosMap = new Map<string, string>();
    referencias.forEach(r => {
        if (r.conceitos) {
            r.conceitos.forEach(c => {
                const normalized = normalizeString(c);
                if (!conceitosMap.has(normalized)) {
                    conceitosMap.set(normalized, c);
                }
            });
        }
    });

    const totalRefs = document.getElementById('total-refs');
    const totalCategorias = document.getElementById('total-categorias');
    const totalConceitos = document.getElementById('total-conceitos');
    
    if (totalRefs) totalRefs.textContent = referencias.length.toString();
    if (totalCategorias) totalCategorias.textContent = categorias.size.toString();
    if (totalConceitos) totalConceitos.textContent = conceitosMap.size.toString();
    
    // Adicionar estatísticas de mapeamento
    updateMappingStats();
}

// Normalizar string para comparação
function normalizeString(str: string): string {
    let normalized = str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
    
    // Remove hífens e underscores primeiro
    normalized = normalized.replace(/[-_]/g, ' ');
    
    // Remove espaços duplos
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    // Remover sufixos comuns para detectar radicais similares
    // Sempre mantém pelo menos 4 caracteres no radical (3 para alguns sufixos)
    
    // Derivações -ano/-ana: africano/africana -> afric (antes de -ica!)
    let temp = normalized.replace(/(?:ano|ana|anos|anas)$/, '');
    if (temp.length >= 4) normalized = temp;
    
    // Adjetivos/substantivos: ontológica -> ontolog
    temp = normalized.replace(/(?:ica|ico|icas|icos)$/, '');
    if (temp.length >= 4) normalized = temp;
    
    // -ista: budista, marxista -> bud, marx  
    temp = normalized.replace(/(?:ista|istas)$/, '');
    if (temp.length >= 3) normalized = temp;
    
    // -ismo: feminismo, budismo -> femin, bud
    temp = normalized.replace(/(?:ismo|ismos)$/, '');
    if (temp.length >= 3) normalized = temp;
    
    // -al/-ais: temporal, relacional -> tempor, relacion
    temp = normalized.replace(/(?:al|ais)$/, '');
    if (temp.length >= 4) normalized = temp;
    
    // -ia: filosofia -> filosof
    temp = normalized.replace(/(?:ia|ias)$/, '');
    if (temp.length >= 4) normalized = temp;
    
    // Plural simples: -s, -es (por último)
    temp = normalized.replace(/(?:es|s)$/, '');
    if (temp.length >= 3) normalized = temp;
    
    return normalized;
}

// Verificar se um conceito existe no rizoma
function isConceptMapped(conceito: string): boolean {
    const normalized = normalizeString(conceito);
    return conceptsRizoma.some(c => 
        normalizeString(c.id) === normalized || 
        normalizeString(c.name) === normalized
    );
}

// Obter conceitos não mapeados
function getUnmappedConcepts(): string[] {
    // Usar Map para consolidar variações do mesmo conceito
    const conceitosMap = new Map<string, string>();
    
    referencias.forEach(r => {
        if (r.conceitos) {
            r.conceitos.forEach(c => {
                const normalized = normalizeString(c);
                // Manter a primeira ocorrência (geralmente melhor formatada)
                if (!conceitosMap.has(normalized)) {
                    conceitosMap.set(normalized, c);
                }
            });
        }
    });
    
    // Filtrar apenas os não mapeados
    const unmapped: string[] = [];
    conceitosMap.forEach((original, normalized) => {
        if (!isConceptMapped(original)) {
            unmapped.push(original);
        }
    });
    
    return unmapped.sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// Atualizar estatísticas de mapeamento
function updateMappingStats(): void {
    // Usar Map para contar conceitos únicos (normalizados)
    const conceitosMap = new Map<string, string>();
    referencias.forEach(r => {
        if (r.conceitos) {
            r.conceitos.forEach(c => {
                const normalized = normalizeString(c);
                if (!conceitosMap.has(normalized)) {
                    conceitosMap.set(normalized, c);
                }
            });
        }
    });
    
    const totalConceitos = conceitosMap.size;
    const unmapped = getUnmappedConcepts();
    const mappedCount = totalConceitos - unmapped.length;
    const mappingPercentage = totalConceitos > 0 ? Math.round((mappedCount / totalConceitos) * 100) : 0;
    
    const mappedStat = document.getElementById('mapped-concepts');
    const unmappedStat = document.getElementById('unmapped-concepts');
    const mappingPercent = document.getElementById('mapping-percentage');
    
    if (mappedStat) mappedStat.textContent = mappedCount.toString();
    if (unmappedStat) unmappedStat.textContent = unmapped.length.toString();
    if (mappingPercent) mappingPercent.textContent = `${mappingPercentage}%`;
}

// Renderizar conceitos não mapeados
function renderUnmappedConcepts(): void {
    const container = document.getElementById('unmapped-list');
    if (!container) return;
    
    const unmapped = getUnmappedConcepts();
    
    if (unmapped.length === 0) {
        container.innerHTML = '<p class="all-mapped-message">Todos os conceitos estão mapeados no rizoma! 🎉</p>';
        return;
    }
    
    container.innerHTML = '';
    
    unmapped.forEach(conceito => {
        const item = document.createElement('div');
        item.className = 'unmapped-item';
        
        const conceitoSpan = document.createElement('span');
        conceitoSpan.className = 'unmapped-conceito';
        conceitoSpan.textContent = conceito;
        
        // Contar em quantas referências aparece
        const count = referencias.filter(r => r.conceitos?.includes(conceito)).length;
        const countSpan = document.createElement('span');
        countSpan.className = 'unmapped-count';
        countSpan.textContent = `(${count} ref${count > 1 ? 's' : ''})`;
        
        item.appendChild(conceitoSpan);
        item.appendChild(countSpan);
        container.appendChild(item);
    });
}

// Renderizar botões de filtro
function renderFilterButtons(): void {
    const categorias = Array.from(new Set(referencias.map(r => r.categoria))).sort();
    const select = document.getElementById('category-select') as HTMLSelectElement;
    if (!select) return;
    
    // Contar referências por categoria
    const counts: Record<string, number> = {};
    referencias.forEach(r => {
        counts[r.categoria] = (counts[r.categoria] || 0) + 1;
    });

    // Limpar opções existentes (mantendo apenas a primeira "Todas")
    select.innerHTML = `<option value="">Todas as Categorias (${referencias.length})</option>`;

    // Adicionar opções de categoria
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `${capitalize(cat)} (${counts[cat]})`;
        select.appendChild(option);
    });
    
    // Event listener para mudança
    select.onchange = () => {
        const value = select.value;
        setFilter(value || 'todos');
    };
    
    // Atualizar contadores de períodos
    updatePeriodCounts();
}

// Atualizar contadores de referências por período
function updatePeriodCounts(): void {
    const periods = [
        { min: -600, max: 2030, selector: 0 },   // Todos
        { min: -600, max: 400, selector: 1 },    // Era Axial
        { min: 400, max: 1400, selector: 2 },    // Medieval
        { min: 1600, max: 1800, selector: 3 },   // Modernos
        { min: 1780, max: 1900, selector: 4 },   // Idealismo
        { min: 1900, max: 1950, selector: 5 },   // Fenomenologia
        { min: 1950, max: 1990, selector: 6 },   // Pós-Guerra
        { min: 1990, max: 2010, selector: 7 },   // Virada Relacional
        { min: 2010, max: 2030, selector: 8 }    // Antropoceno
    ];

    const buttons = document.querySelectorAll('.period-preset-btn');
    
    periods.forEach(({ min, max, selector }) => {
        const count = referencias.filter(r => {
            const year = extractYear(r.ano);
            return year >= min && year <= max;
        }).length;
        
        const btn = buttons[selector];
        if (btn) {
            // Encontrar ou criar span de contagem
            let countSpan = btn.querySelector('.count') as HTMLElement;
            if (!countSpan) {
                countSpan = document.createElement('span');
                countSpan.className = 'count';
                btn.appendChild(countSpan);
            }
            countSpan.textContent = `(${count})`;
        }
    });
}

// Definir filtro
function setFilter(filter: string): void {
    currentFilter = filter;
    
    // Atualizar select
    const select = document.getElementById('category-select') as HTMLSelectElement;
    if (select) {
        select.value = filter === 'todos' ? '' : filter;
    }

    renderReferencias();
}

// Renderizar referências
function renderReferencias(): void {
    const container = document.getElementById('referencias-grid');
    const noResults = document.getElementById('no-results');
    if (!container || !noResults) return;
    
    container.innerHTML = '';

    let filtered = referencias;

    // Aplicar filtro de categoria
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(r => r.categoria === currentFilter);
    }

    // Aplicar filtro de período
    filtered = filtered.filter(r => {
        const year = extractYear(r.ano);
        return year >= yearMin && year <= yearMax;
    });

    // Aplicar busca
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(r => {
            return r.autor.toLowerCase().includes(term) ||
                   r.titulo.toLowerCase().includes(term) ||
                   r.relevancia.toLowerCase().includes(term) ||
                   (r.conceitos && r.conceitos.some(c => c.toLowerCase().includes(term)));
        });
    }

    // Ordenar por: 1) ano (mais recente), 2) número de conceitos (mais conceitos), 3) nome do autor
    filtered.sort((a, b) => {
        // Primeiro critério: ano (decrescente)
        const yearA = extractYear(a.ano);
        const yearB = extractYear(b.ano);
        if (yearA !== yearB) {
            return yearB - yearA;
        }
        
        // Segundo critério: número de conceitos (decrescente)
        const conceitosA = (a.conceitos || []).length;
        const conceitosB = (b.conceitos || []).length;
        if (conceitosA !== conceitosB) {
            return conceitosB - conceitosA;
        }
        
        // Terceiro critério: nome do autor (alfabética)
        return a.autor.localeCompare(b.autor, 'pt-BR');
    });

    // Atualizar contador
    const filteredCount = document.getElementById('filtered-count');
    if (filteredCount) filteredCount.textContent = filtered.length.toString();

    // Mostrar/ocultar mensagem de "sem resultados"
    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }

    // Renderizar cards
    filtered.forEach((ref, index) => {
        const card = createReferenciaCard(ref, index);
        container.appendChild(card);
    });
}

// Criar card de referência
function createReferenciaCard(ref: Referencia, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'referencia-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const header = document.createElement('div');
    header.className = 'referencia-header';

    const autor = document.createElement('div');
    autor.className = 'referencia-autor';
    autor.textContent = ref.autor;

    const ano = document.createElement('div');
    ano.className = 'referencia-ano';
    ano.textContent = ref.ano.toString();

    header.appendChild(autor);
    header.appendChild(ano);

    const titulo = document.createElement('div');
    titulo.className = 'referencia-titulo';
    titulo.textContent = ref.titulo;

    const editora = document.createElement('div');
    editora.className = 'referencia-editora';
    editora.textContent = ref.editora || ref.publicacao || '';

    const relevancia = document.createElement('div');
    relevancia.className = 'referencia-relevancia';
    relevancia.textContent = ref.relevancia;

    const tags = document.createElement('div');
    tags.className = 'referencia-tags';

    // Tag de categoria
    const catTag = document.createElement('span');
    catTag.className = 'tag categoria';
    catTag.textContent = capitalize(ref.categoria);
    tags.appendChild(catTag);

    // Tags de conceitos
    if (ref.conceitos) {
        ref.conceitos.forEach(conceito => {
            const tag = document.createElement('span');
            const isMapped = isConceptMapped(conceito);
            tag.className = isMapped ? 'tag conceito-mapped' : 'tag conceito-unmapped';
            tag.textContent = conceito;
            
            // Se mapeado, adicionar link para o rizoma
            if (isMapped) {
                tag.style.cursor = 'pointer';
                tag.title = 'Clique para ver no rizoma';
                tag.onclick = (e) => {
                    e.stopPropagation();
                    navigateToRizoma(conceito);
                };
            } else {
                tag.title = 'Conceito não mapeado no rizoma';
            }
            
            tags.appendChild(tag);
        });
    }

    card.appendChild(header);
    card.appendChild(titulo);
    if (editora.textContent) {
        card.appendChild(editora);
    }
    card.appendChild(relevancia);
    card.appendChild(tags);

    return card;
}

// Capitalizar texto
function capitalize(text: string): string {
    return text.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Navegar para o rizoma com conceito selecionado
function navigateToRizoma(conceito: string): void {
    // Normalizar o conceito para encontrar no rizoma
    const normalized = conceito.toLowerCase().trim();
    const concept = conceptsRizoma.find(c => 
        c.id.toLowerCase() === normalized || 
        c.name.toLowerCase() === normalized
    );
    
    if (concept) {
        // Redirecionar para riz∅ma.html com o conceito no hash
        window.location.href = `riz∅ma.html#${encodeURIComponent(concept.id)}`;
    }
}

// Controle do menu hamburguer
function setupNavigation(): void {
    const navToggle = document.getElementById('nav-toggle');
    const navIndex = document.getElementById('nav-index');

    if (navToggle && navIndex) {
        navToggle.addEventListener('click', () => {
            const isOpen = navIndex.classList.contains('visible');
            
            if (isOpen) {
                navIndex.classList.remove('visible');
                navToggle.setAttribute('aria-expanded', 'false');
                navIndex.setAttribute('aria-hidden', 'true');
            } else {
                navIndex.classList.add('visible');
                navToggle.setAttribute('aria-expanded', 'true');
                navIndex.setAttribute('aria-hidden', 'false');
            }
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!navIndex.contains(e.target as Node) && !navToggle.contains(e.target as Node)) {
                navIndex.classList.remove('visible');
                navToggle.setAttribute('aria-expanded', 'false');
                navIndex.setAttribute('aria-hidden', 'true');
            }
        });
    }
}

// Controle de toggle das métricas no mobile
function setupMetricsToggle(): void {
    const metricsHeader = document.querySelector('.crio-metrics-header');
    const metricsSection = document.querySelector('.crio-metrics');

    if (metricsHeader && metricsSection) {
        metricsHeader.addEventListener('click', () => {
            // Só funciona em mobile (verificado pelo CSS que esconde o cursor pointer em desktop)
            if (window.innerWidth <= 768) {
                const isCollapsed = metricsSection.classList.contains('collapsed');
                
                if (isCollapsed) {
                    metricsSection.classList.remove('collapsed');
                } else {
                    metricsSection.classList.add('collapsed');
                }
            }
        });
    }
}

// Search input
function setupSearch(): void {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = (e.target as HTMLInputElement).value;
            renderReferencias();
        });
    }
}

// Inicializar tudo quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupMetricsToggle();
    setupSearch();
    loadReferencias();
});
