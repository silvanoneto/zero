/**
 * CRIO - Interactive Ontology Reader
 * 
 * This module manages the entire CRIO interactive reading experience.
 * It handles markdown loading with intelligent caching, theme switching,
 * navigation with scroll spy, progress tracking, particle animations,
 * audio synchronization, and accessibility features.
 * 
 * Architecture:
 * - Theme Management: Dark/light mode with localStorage persistence
 * - Markdown System: Fetch, cache, render with version control
 * - Navigation: Dynamic TOC generation with active section tracking
 * - Progress: Visual indicators (bar, markers, reading time estimation)
 * - Particles: GPU-accelerated floating animations
 * - Audio: Scroll-synchronized playback with volume/rate control
 * - Accessibility: WCAG AA compliant with full keyboard navigation
 * - Performance: Throttled scroll handlers, lazy loading, GPU acceleration
 */

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Restore saved theme preference from localStorage
 * Called on page load to maintain user's theme choice across sessions
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('crio-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

/**
 * Toggle between light and dark themes
 * Updates both the visual theme and saves preference to localStorage
 */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    
    // Save theme preference for future sessions
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('crio-theme', isLight ? 'light' : 'dark');
}

// ============================================================================
// MARKDOWN LOADING AND RENDERING
// ============================================================================

/**
 * Device and environment detection
 */
const DEVICE_INFO = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hasReducedData: window.matchMedia('(prefers-reduced-data: reduce)').matches,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
};

/**
 * Cache configuration for markdown content
 * Implements versioning to invalidate stale cache when content updates
 */
const CACHE_CONFIG = {
    KEY: 'crio-markdown-cache',              // localStorage key for cached content
    VERSION_KEY: 'crio-cache-version',       // localStorage key for cache version
    TIMESTAMP_KEY: 'crio-cache-timestamp',   // localStorage key for cache timestamp
    VERSION: '1.0.0',                        // Increment this when CRIOS.md is updated
    MAX_AGE: 7 * 24 * 60 * 60 * 1000        // 7 days in milliseconds
};

/**
 * Configure marked.js options for better rendering
 * Sets up GitHub Flavored Markdown with header IDs for navigation
 */
function configureMarkdown() {
    marked.setOptions({
        breaks: true,       // Convert line breaks to <br>
        gfm: true,          // Enable GitHub Flavored Markdown
        headerIds: true,    // Generate IDs for headings (needed for navigation)
        mangle: false       // Don't mangle email addresses
    });
}

/**
 * Check if cached content is valid
 * Validates based on version match and age (not older than MAX_AGE)
 * 
 * @returns {boolean} True if cache is valid and can be used
 */
function isCacheValid() {
    try {
        const cachedVersion = localStorage.getItem(CACHE_CONFIG.VERSION_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_CONFIG.TIMESTAMP_KEY);
        const cachedContent = localStorage.getItem(CACHE_CONFIG.KEY);
        
        if (!cachedVersion || !cachedTimestamp || !cachedContent) {
            return false;
        }
        
        // Check version match
        if (cachedVersion !== CACHE_CONFIG.VERSION) {
            console.log('Cache version mismatch. Clearing cache.');
            clearMarkdownCache();
            return false;
        }
        
        // Check age
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age > CACHE_CONFIG.MAX_AGE) {
            console.log('Cache expired. Clearing cache.');
            clearMarkdownCache();
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Error checking cache validity:', e);
        return false;
    }
}

/**
 * Save markdown content to cache
 * Stores content, version, and timestamp in localStorage for fast future loads
 * Handles QuotaExceededError by clearing old cache and retrying
 * 
 * @param {string} markdown - The markdown content to cache
 */
function cacheMarkdownContent(markdown) {
    try {
        localStorage.setItem(CACHE_CONFIG.KEY, markdown);
        localStorage.setItem(CACHE_CONFIG.VERSION_KEY, CACHE_CONFIG.VERSION);
        localStorage.setItem(CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString());
        console.log('Markdown content cached successfully.');
    } catch (e) {
        console.error('Error caching markdown:', e);
        // If localStorage is full, clear old cache and try again
        if (e.name === 'QuotaExceededError') {
            clearMarkdownCache();
            try {
                localStorage.setItem(CACHE_CONFIG.KEY, markdown);
                localStorage.setItem(CACHE_CONFIG.VERSION_KEY, CACHE_CONFIG.VERSION);
                localStorage.setItem(CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString());
            } catch (e2) {
                console.error('Failed to cache after clearing:', e2);
            }
        }
    }
}

/**
 * Clear markdown cache from localStorage
 * Removes all cache-related keys
 */
function clearMarkdownCache() {
    localStorage.removeItem(CACHE_CONFIG.KEY);
    localStorage.removeItem(CACHE_CONFIG.VERSION_KEY);
    localStorage.removeItem(CACHE_CONFIG.TIMESTAMP_KEY);
    console.log('Markdown cache cleared.');
}

/**
 * Render markdown content and build navigation (performance optimized)
 * 
 * Uses requestAnimationFrame to defer heavy DOM operations:
 * 1. First frame: Parse markdown and inject HTML
 * 2. Second frame: Build navigation and restore scroll position
 * 
 * This prevents blocking the main thread and provides smoother UX
 * 
 * @param {string} markdown - The markdown content to render
 */
async function renderMarkdownContent(markdown) {
    const content = document.getElementById('content');
    
    // Load concepts if not loaded yet
    if (rizomaConceptKeywords.length === 0) {
        await loadRizomaConcepts();
    }
    
    // Defer rendering to allow browser to paint loading state
    requestAnimationFrame(() => {
        content.classList.remove('loading');
        content.innerHTML = marked.parse(markdown);
        content.setAttribute('aria-busy', 'false');
        
        // Defer heavy operations to next frame
        requestAnimationFrame(() => {
            buildNavigation();
            linkRizomaConceptsInContent();
            restoreScrollPosition();
        });
    });
}

// ============================================================================
// RIZOMA CONCEPT LINKING
// ============================================================================

// Conceitos carregados do JSON
let rizomaConceptKeywords = [];

/**
 * Load concepts from JSON file
 */
async function loadRizomaConcepts() {
    try {
        const response = await fetch('concepts.json');
        const concepts = await response.json();
        
        // Build keyword search list from concepts
        rizomaConceptKeywords = concepts.map(concept => ({
            text: concept.name.toLowerCase(),
            id: concept.id,
            name: concept.name,
            desc: concept.description.split('.')[0], // Primeira frase da descrição
            layer: concept.layer,
            color: concept.color
        }));
        
        // Add common variations and keywords
        const variations = [];
        concepts.forEach(concept => {
            // Add variations based on concept names
            if (concept.name.includes('(')) {
                const mainName = concept.name.split('(')[0].trim().toLowerCase();
                if (mainName !== concept.name.toLowerCase()) {
                    variations.push({
                        text: mainName,
                        id: concept.id,
                        name: concept.name,
                        desc: concept.description.split('.')[0],
                        layer: concept.layer,
                        color: concept.color
                    });
                }
            }
        });
        
        rizomaConceptKeywords = [...rizomaConceptKeywords, ...variations];
        
        // Sort by length (longer first to avoid partial matches)
        rizomaConceptKeywords.sort((a, b) => b.text.length - a.text.length);
        
        console.log(`${rizomaConceptKeywords.length} concept keywords loaded for linking`);
    } catch (error) {
        console.error('Error loading concepts for linking:', error);
    }
}

/**
 * Link rizoma concepts automatically in the content
 * Marks keywords from rizoma and makes them interactive
 */
function linkRizomaConceptsInContent() {
    if (rizomaConceptKeywords.length === 0) {
        console.warn('No concept keywords loaded yet');
        return;
    }
    
    const content = document.getElementById('content');
    if (!content) return;
    
    // Get all text nodes in the content
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip if parent is already a rizoma link or code/pre
                if (node.parentElement.classList.contains('rizoma-link') ||
                    node.parentElement.tagName === 'CODE' ||
                    node.parentElement.tagName === 'PRE' ||
                    node.parentElement.tagName === 'A') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    const textNodes = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
        textNodes.push(currentNode);
    }
    
    // Process each text node
    textNodes.forEach(node => {
        let text = node.textContent;
        let modified = false;
        const replacements = [];
        
        // Find all matches for each keyword (case insensitive)
        rizomaConceptKeywords.forEach(concept => {
            const regex = new RegExp(`\\b${concept.text}\\b`, 'gi');
            let match;
            
            while ((match = regex.exec(text)) !== null) {
                replacements.push({
                    index: match.index,
                    length: match[0].length,
                    original: match[0],
                    concept: concept
                });
            }
        });
        
        // Sort replacements by index (descending) to avoid offset issues
        replacements.sort((a, b) => b.index - a.index);
        
        // Apply replacements
        if (replacements.length > 0) {
            const parent = node.parentElement;
            const fragment = document.createDocumentFragment();
            let lastIndex = text.length;
            
            replacements.forEach(rep => {
                // Text after this replacement
                if (lastIndex > rep.index + rep.length) {
                    fragment.insertBefore(
                        document.createTextNode(text.substring(rep.index + rep.length, lastIndex)),
                        fragment.firstChild
                    );
                }
                
                // Create rizoma link
                const link = document.createElement('span');
                link.className = 'rizoma-link';
                link.textContent = rep.original;
                link.dataset.conceptId = rep.concept.id;
                link.dataset.conceptName = rep.concept.name;
                link.dataset.conceptDesc = rep.concept.desc;
                link.dataset.conceptLayer = rep.concept.layer;
                
                // Apply layer color (convert from 0xRRGGBB to #RRGGBB)
                if (rep.concept.color) {
                    const colorHex = rep.concept.color.toString().replace('0x', '#');
                    link.style.setProperty('--concept-color', colorHex);
                }
                
                link.setAttribute('role', 'button');
                link.setAttribute('tabindex', '0');
                link.setAttribute('aria-label', `Ver conceito: ${rep.concept.name}`);
                
                // Click to open rizoma
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = `rizoma.html#${rep.concept.id}`;
                });
                
                // Keyboard support
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        link.click();
                    }
                });
                
                fragment.insertBefore(link, fragment.firstChild);
                
                lastIndex = rep.index;
            });
            
            // Text before first replacement
            if (lastIndex > 0) {
                fragment.insertBefore(
                    document.createTextNode(text.substring(0, lastIndex)),
                    fragment.firstChild
                );
            }
            
            parent.replaceChild(fragment, node);
        }
    });
}

/**
 * Restore scroll position from localStorage with smooth animation
 */
function restoreScrollPosition() {
    const savedPosition = localStorage.getItem('crio-scroll-position');
    if (savedPosition && parseInt(savedPosition) > 100) { // Only restore if significantly scrolled
        const targetPosition = parseInt(savedPosition);
        
        // Show restoration indicator
        showScrollRestorationIndicator(targetPosition);
        
        // Wait for layout to stabilize
        requestAnimationFrame(() => {
            setTimeout(() => {
                // Use smooth scroll for better UX
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log(`Scroll restored to position: ${targetPosition}px`);
            }, 150);
        });
    }
}

/**
 * Show visual indicator that scroll position is being restored
 */
function showScrollRestorationIndicator(position) {
    const indicator = document.createElement('div');
    const percent = Math.round((position / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    
    indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.2rem;">↓</span>
            <span>Retornando à leitura (${percent}%)</span>
        </div>
    `;
    indicator.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: var(--void);
        color: var(--trace);
        padding: 0.75rem 1.25rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9998;
        font-size: 0.9rem;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid var(--trace);
        opacity: 0.95;
    `;
    
    document.body.appendChild(indicator);
    
    // Remove after scroll completes
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.3s ease-out';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 2500);
}

/**
 * Save scroll position with debouncing to reduce localStorage writes
 * 
 * Debouncing prevents excessive writes during scrolling by waiting
 * 250ms after the last scroll event before saving. This improves
 * performance and reduces localStorage wear.
 */
let scrollSaveTimeout;
function saveScrollPosition() {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(() => {
        const position = window.scrollY;
        try {
            localStorage.setItem('crio-scroll-position', position);
        } catch (e) {
            console.warn('Failed to save scroll position:', e);
        }
    }, 250); // Debounce by 250ms - balance between responsiveness and performance
}

/**
 * Load and render the CRIOS.md markdown file with intelligent caching
 * 
 * Cache-first strategy:
 * 1. Check if cache is valid (version match + not expired)
 * 2. If valid, use cache and update in background
 * 3. If invalid, fetch from network and cache result
 * 
 * This provides instant load for cached content while keeping it fresh
 */
function loadMarkdownContent() {
    const skeletonLoader = document.getElementById('skeleton-loader');
    const content = document.getElementById('content');
    
    // Try to load from cache first
    if (isCacheValid()) {
        const cachedContent = localStorage.getItem(CACHE_CONFIG.KEY);
        if (cachedContent) {
            console.log('Loading markdown from cache.');
            
            // Hide skeleton immediately for cached content
            hideSkeletonLoader(skeletonLoader, content);
            
            renderMarkdownContent(cachedContent);
            
            // Optional: fetch in background to update cache for next visit
            fetchAndUpdateCache();
            return;
        }
    }
    
    // Cache miss or invalid - fetch from network
    console.log('Loading markdown from network.');
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    fetch('CRIOS.md', { signal: controller.signal })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Arquivo não encontrado');
            return response.text();
        })
        .then(markdown => {
            // Cache the fresh content
            cacheMarkdownContent(markdown);
            
            // Hide skeleton and show content
            hideSkeletonLoader(skeletonLoader, content);
            
            // Render the content
            renderMarkdownContent(markdown);
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Erro ao carregar CRIOS.md:', error);
            
            // Hide skeleton on error
            if (skeletonLoader) {
                skeletonLoader.classList.add('hidden');
                setTimeout(() => skeletonLoader.remove(), 300);
            }
            if (content) {
                content.style.display = 'block';
            }
            
            handleMarkdownLoadError();
        });
}

/**
 * Hide skeleton loader with smooth transition
 */
function hideSkeletonLoader(skeletonLoader, content) {
    if (skeletonLoader) {
        skeletonLoader.classList.add('hidden');
        setTimeout(() => {
            skeletonLoader.remove();
        }, 300); // Match CSS transition duration
    }
    
    if (content) {
        content.style.display = 'block';
    }
}

/**
 * Fetch markdown in background to update cache (optional)
 */
function fetchAndUpdateCache() {
    fetch('CRIOS.md')
        .then(response => {
            if (!response.ok) return;
            return response.text();
        })
        .then(markdown => {
            if (markdown) {
                const cachedContent = localStorage.getItem(CACHE_CONFIG.KEY);
                // Only update cache if content has changed
                if (markdown !== cachedContent) {
                    console.log('Content changed. Updating cache.');
                    cacheMarkdownContent(markdown);
                }
            }
        })
        .catch(error => {
            // Silent fail - we already have cached content
            console.log('Background fetch failed (non-critical):', error);
        });
}

/**
 * Fallback error handler for markdown loading
 */
function handleMarkdownLoadError() {
    // Try XMLHttpRequest as fallback (works with file:// protocol)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'CRIOS.md', true);
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) { // 0 for file://
            try {
                const markdown = xhr.responseText;
                
                // Cache the content if successfully loaded
                cacheMarkdownContent(markdown);
                
                // Render the content
                renderMarkdownContent(markdown);
                
                console.log('Content loaded via XMLHttpRequest fallback.');
            } catch (e) {
                console.error('Error parsing markdown:', e);
                showDetailedErrorMessage('parse-error', e);
            }
        } else {
            showDetailedErrorMessage('http-error', xhr.status);
        }
    };
    
    xhr.onerror = function() {
        // Check if we have cached content as last resort
        const cachedContent = localStorage.getItem(CACHE_CONFIG.KEY);
        if (cachedContent) {
            console.log('Network failed. Loading from expired cache.');
            renderMarkdownContent(cachedContent);
            showCacheWarning();
        } else {
            showDetailedErrorMessage('network-error');
        }
    };
    
    xhr.send();
}

/**
 * Display cache warning banner
 */
function showCacheWarning() {
    const warning = document.createElement('div');
    warning.className = 'cache-warning';
    warning.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
            <strong>Modo Offline</strong>
            <p>Mostrando conteúdo em cache. Conecte-se à internet para ver atualizações.</p>
        </div>
        <button class="warning-close" onclick="this.parentElement.remove()">×</button>
    `;
    warning.style.cssText = `
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--void);
        color: var(--trace);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 90%;
        animation: slideDown 0.3s ease-out;
    `;
    document.body.appendChild(warning);
}

/**
 * Display detailed error message to user with helpful instructions
 */
function showDetailedErrorMessage(errorType, details = null) {
    const content = document.getElementById('content');
    content.classList.remove('loading');
    
    let errorContent = '';
    
    switch (errorType) {
        case 'network-error':
            errorContent = `
                <div class="error-container">
                    <div class="error-icon">∅</div>
                    <h2>Conteúdo não encontrado</h2>
                    <p class="error-description">
                        O arquivo <code>CRIOS.md</code> não pôde ser carregado. 
                        Este projeto precisa ser executado em um servidor web local.
                    </p>
                    
                    <div class="error-section">
                        <h3>Como resolver:</h3>
                        <div class="solution-options">
                            <div class="solution">
                                <strong>Opção 1 - Script helper:</strong>
                                <code>./servir.sh</code>
                            </div>
                            <div class="solution">
                                <strong>Opção 2 - Python (recomendado):</strong>
                                <code>python3 -m http.server 8000</code>
                            </div>
                            <div class="solution">
                                <strong>Opção 3 - Node.js:</strong>
                                <code>npx http-server -p 8000</code>
                            </div>
                        </div>
                        <p class="info-text">
                            Depois abra: <code>http://localhost:8000</code>
                        </p>
                    </div>
                    
                    <div class="error-section">
                        <h3>Por que isso é necessário?</h3>
                        <p class="info-text">
                            Navegadores bloqueiam o carregamento de arquivos locais via JavaScript 
                            por questões de segurança (política CORS). Um servidor web local 
                            resolve esse problema.
                        </p>
                    </div>
                    
                    <button onclick="location.reload()" class="retry-button">
                        Tentar novamente
                    </button>
                </div>
            `;
            break;
            
        case 'http-error':
            errorContent = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h2>Erro HTTP ${details}</h2>
                    <p class="error-description">
                        O servidor respondeu com erro ${details}.
                    </p>
                    
                    <div class="error-section">
                        <h3>Possíveis causas:</h3>
                        <ul class="error-list">
                            <li>O arquivo <code>CRIOS.md</code> não existe neste diretório</li>
                            <li>Problemas de permissão de leitura</li>
                            <li>Caminho incorreto do servidor</li>
                        </ul>
                    </div>
                    
                    <div class="error-section">
                        <h3>Verifique:</h3>
                        <p class="info-text">
                            1. O arquivo <code>CRIOS.md</code> está no mesmo diretório que <code>index.html</code><br>
                            2. O servidor está rodando no diretório correto<br>
                            3. Você tem permissões de leitura para o arquivo
                        </p>
                    </div>
                    
                    <button onclick="location.reload()" class="retry-button">
                        Tentar novamente
                    </button>
                </div>
            `;
            break;
            
        case 'parse-error':
            errorContent = `
                <div class="error-container">
                    <div class="error-icon">🔧</div>
                    <h2>Erro de processamento</h2>
                    <p class="error-description">
                        O conteúdo foi carregado mas houve um erro ao processar o markdown.
                    </p>
                    
                    <div class="error-section">
                        <h3>Detalhes técnicos:</h3>
                        <pre class="error-details">${details?.message || 'Erro desconhecido'}</pre>
                    </div>
                    
                    <div class="error-section">
                        <p class="info-text">
                            Isso pode indicar um problema com a biblioteca marked.js ou 
                            formatação inválida no arquivo CRIOS.md.
                        </p>
                    </div>
                    
                    <button onclick="location.reload()" class="retry-button">
                        Tentar novamente
                    </button>
                </div>
            `;
            break;
            
        case 'runtime-error':
        case 'init-error':
            const errorType = errorType === 'init-error' ? 'inicialização' : 'execução';
            errorContent = `
                <div class="error-container">
                    <div class="error-icon">⚡</div>
                    <h2>Erro de ${errorType}</h2>
                    <p class="error-description">
                        Ocorreu um erro inesperado durante a ${errorType} do CRIO.
                    </p>
                    
                    <div class="error-section">
                        <h3>Detalhes técnicos:</h3>
                        <pre class="error-details">${details?.message || details?.toString() || 'Erro desconhecido'}</pre>
                    </div>
                    
                    <div class="error-section">
                        <h3>O que fazer:</h3>
                        <ul class="error-list">
                            <li>Recarregue a página (F5 ou Ctrl+R)</li>
                            <li>Limpe o cache (Ctrl+Shift+C)</li>
                            <li>Verifique o console do navegador (F12) para mais detalhes</li>
                            <li>Tente em modo anônimo para descartar extensões do navegador</li>
                        </ul>
                    </div>
                    
                    <button onclick="location.reload()" class="retry-button">
                        Recarregar página
                    </button>
                </div>
            `;
            break;
            
        default:
            errorContent = `
                <div class="error-container">
                    <div class="error-icon">∅</div>
                    <h2>Erro desconhecido</h2>
                    <p class="error-description">
                        Ocorreu um erro inesperado ao carregar o conteúdo.
                    </p>
                    
                    <button onclick="location.reload()" class="retry-button">
                        Tentar novamente
                    </button>
                </div>
            `;
    }
    
    content.innerHTML = errorContent;
}

/**
 * Display error message to user (legacy - kept for compatibility)
 */
function showErrorMessage(message) {
    document.getElementById('content').innerHTML = 
        `<p style="color: var(--trace); text-align: center;">${message}</p>`;
}

// ============================================================================
// NAVIGATION SYSTEM
// ============================================================================

/**
 * Build navigation index and progress markers from headings
 */
function buildNavigation() {
    const content = document.getElementById('content');
    const navList = document.getElementById('nav-list');
    const progressMarkers = document.querySelector('.progress-markers');
    const headings = content.querySelectorAll('h2');
    
    headings.forEach((heading, index) => {
        const text = heading.textContent;
        const anchorId = generateAnchorId(text);
        
        // Add ID to heading
        heading.id = anchorId;
        
        // Create navigation link
        createNavigationLink(navList, anchorId, text);
        
        // Create progress marker
        createProgressMarker(progressMarkers, anchorId, text);
    });
    
    // Set up scroll spy with throttling for better performance
    let scrollSpyTimeout;
    const throttledScrollSpy = () => {
        if (!scrollSpyTimeout) {
            scrollSpyTimeout = setTimeout(() => {
                updateActiveNavLink();
                updateProgressIndicators();
                scrollSpyTimeout = null;
            }, 100); // Throttle to max 10 times per second
        }
    };
    
    window.addEventListener('scroll', throttledScrollSpy, { passive: true });
    updateActiveNavLink();
    updateProgressIndicators();
    
    // Initialize highlighted quotes system
    initializeHighlightedQuotes();
}

// ============================================================================
// HIGHLIGHTED QUOTES SYSTEM
// ============================================================================

/**
 * Initialize the highlighted quotes system
 * Enhances blockquotes with special styling and scroll animations
 */
function initializeHighlightedQuotes() {
    const content = document.getElementById('content');
    const blockquotes = content.querySelectorAll('blockquote');
    
    blockquotes.forEach((quote, index) => {
        // Add class for styling
        quote.classList.add('crio-quote');
        
        // Mark first quote in each section as "anchor"
        const previousHeading = findPreviousHeading(quote);
        if (previousHeading && isFirstQuoteAfterHeading(quote, previousHeading)) {
            quote.classList.add('anchor-quote');
        }
        
        // Add data attribute for animation
        quote.dataset.quoteIndex = index;
        
        // Wrap content in a container for animation
        const wrapper = document.createElement('div');
        wrapper.className = 'quote-content';
        wrapper.innerHTML = quote.innerHTML;
        quote.innerHTML = '';
        quote.appendChild(wrapper);
        
        // Add decorative element
        const decorator = document.createElement('div');
        decorator.className = 'quote-decorator';
        decorator.textContent = '∅';
        quote.insertBefore(decorator, quote.firstChild);
    });
    
    // Set up scroll observer for animations
    setupQuoteScrollObserver();
}

/**
 * Find the previous h2 heading before an element
 * 
 * Walks backwards through siblings to locate the nearest H2 heading.
 * Used to identify "anchor quotes" (first quote after each section heading)
 * 
 * @param {Element} element - The element to search from
 * @returns {Element|null} The previous H2 heading or null if none found
 */
function findPreviousHeading(element) {
    let current = element.previousElementSibling;
    while (current) {
        if (current.tagName === 'H2') {
            return current;
        }
        current = current.previousElementSibling;
    }
    return null;
}

/**
 * Check if quote is the first blockquote after a specific heading
 * 
 * Anchor quotes receive enhanced styling to visually connect them
 * to their section heading, improving content hierarchy
 * 
 * @param {Element} quote - The quote element to check
 * @param {Element} heading - The heading to check against
 * @returns {boolean} True if this is the first quote after the heading
 */
function isFirstQuoteAfterHeading(quote, heading) {
    let current = heading.nextElementSibling;
    while (current && current !== quote) {
        if (current.tagName === 'BLOCKQUOTE') {
            return false; // Found another quote first
        }
        current = current.nextElementSibling;
    }
    return current === quote;
}

/**
 * Setup Intersection Observer for quote scroll animations
 * 
 * Uses IntersectionObserver API to detect when quotes enter/exit viewport.
 * Provides smooth fade-in animations and emphasizes quotes in optimal
 * reading position (40-60% down the viewport).
 * 
 * Three states:
 * 1. quote-visible: Quote has entered viewport (fade in)
 * 2. quote-emphasized: Quote is in optimal reading position (highlight)
 * 3. Neither: Quote is off-screen (invisible/faded)
 * 
 * rootMargin of -20% creates an optimal viewing area centered vertically
 */
function setupQuoteScrollObserver() {
    const options = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.5, 1]
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class when quote enters viewport
                entry.target.classList.add('quote-visible');
                
                // Add emphasis when fully in view
                if (entry.intersectionRatio > 0.5) {
                    entry.target.classList.add('quote-emphasized');
                }
            } else {
                // Remove emphasis when out of optimal view
                entry.target.classList.remove('quote-emphasized');
            }
        });
    }, options);
    
    // Observe all quotes
    const quotes = document.querySelectorAll('.crio-quote');
    quotes.forEach(quote => observer.observe(quote));
}

// ============================================================================
// 3. NAVIGATION SYSTEM
// ============================================================================

/**
 * Generate anchor ID from heading text
 * 
 * Maps Portuguese heading text to clean, predictable anchor IDs.
 * Uses pattern matching for the 7 CRIO sections plus intro.
 * Falls back to slug generation for any unexpected headings.
 * 
 * @param {string} text - The heading text to convert
 * @returns {string} Clean anchor ID (e.g., 'intro', 'crio-1', 'crio-2')
 */
function generateAnchorId(text) {
    if (text.includes('O QUE SÃO CRIOS')) {
        return 'intro';
    } else if (text.includes('PRIMEIRO CRIO') || text.includes('O Vazio Que Povoa')) {
        return 'crio-1';
    } else if (text.includes('SEGUNDO CRIO') || text.includes('Multiplicidade Sem Fusão')) {
        return 'crio-2';
    } else if (text.includes('TERCEIRO CRIO') || text.includes('Recursão Sem Fundamento')) {
        return 'crio-3';
    } else if (text.includes('QUARTO CRIO') || text.includes('Agência Distribuída')) {
        return 'crio-4';
    } else if (text.includes('QUINTO CRIO') || text.includes('Tempo Entrelaçado')) {
        return 'crio-5';
    } else if (text.includes('SEXTO CRIO') || text.includes('Limites Como Possibilidades')) {
        return 'crio-6';
    } else if (text.includes('SÉTIMO CRIO') || text.includes('Ontologia Relacional Universal')) {
        return 'crio-7';
    } else if (text.includes('OITAVO CRIO') || text.includes('O Sujeito Político Relacional')) {
        return 'crio-8';
    } else {
        // For other headings, create a slug
        return text.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

/**
 * Create navigation link element with smooth scroll and accessibility
 * 
 * Builds a fully accessible navigation link with:
 * - Smooth scroll behavior
 * - ARIA labels for screen readers
 * - Focus management (sets tabindex -1 temporarily for keyboard nav)
 * - Auto-close navigation on mobile (≤768px)
 * - Active state tracking via updateActiveNavLink()
 * 
 * @param {HTMLElement} navList - The <ul> element to append the link to
 * @param {string} anchorId - The target section ID
 * @param {string} text - The link text to display
 */
function createNavigationLink(navList, anchorId, text) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${anchorId}`;
    a.textContent = text;
    a.dataset.target = anchorId;
    
    // Add ARIA label for better screen reader support
    a.setAttribute('aria-label', `Navegar para seção: ${text}`);
    
    // Add special class for intro
    if (anchorId === 'intro') {
        a.classList.add('intro-link');
    }
    
    // Smooth scroll on click
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(anchorId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Set focus to the heading for screen readers
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.addEventListener('blur', () => {
                target.removeAttribute('tabindex');
            }, { once: true });
            
            // Close nav on mobile
            if (window.innerWidth <= 768) {
                const navIndex = document.getElementById('nav-index');
                const navToggle = document.getElementById('nav-toggle');
                navIndex.classList.remove('visible');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
            
            // Update active state
            updateActiveNavLink();
        }
    });
    
    li.appendChild(a);
    navList.appendChild(li);
}

/**
 * Create progress marker element
 */
function createProgressMarker(progressMarkers, anchorId, text) {
    const marker = document.createElement('div');
    marker.className = 'progress-marker';
    marker.dataset.target = anchorId;
    marker.setAttribute('role', 'button');
    marker.setAttribute('aria-label', `Ir para ${text}`);
    marker.setAttribute('tabindex', '0');
    
    const label = document.createElement('div');
    label.className = 'progress-marker-label';
    label.textContent = text.length > 30 ? text.substring(0, 27) + '...' : text;
    marker.appendChild(label);
    
    marker.addEventListener('click', () => {
        const target = document.getElementById(anchorId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    marker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            marker.click();
        }
    });
    
    progressMarkers.appendChild(marker);
}

/**
 * Update active navigation link based on scroll position (scroll spy)
 * 
 * Throttled function called during scroll to highlight the current section.
 * Uses a threshold of 150px from top to account for fixed header and
 * provide a comfortable reading zone before section change.
 * 
 * Searches backwards through headings for optimal performance
 * (most common case is scrolling down, current section is near end)
 */
function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-index a');
    const headings = Array.from(document.querySelectorAll('h2[id]'));
    
    let currentId = null;
    
    // Find the current section based on scroll position
    for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        
        if (rect.top <= 150) { // Account for some offset
            currentId = heading.id;
            break;
        }
    }
    
    // Update active class
    navLinks.forEach(link => {
        if (link.dataset.target === currentId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize navigation toggle functionality
 * 
 * Handles mobile navigation panel toggle with:
 * - Click to show/hide navigation panel
 * - ARIA expanded state for accessibility
 * - Click-outside-to-close behavior
 * - ESC key to close
 * 
 * Mobile navigation is hidden by default on screens ≤768px
 */
function initializeNavigationToggle() {
    const navToggle = document.getElementById('nav-toggle');
    const navIndex = document.getElementById('nav-index');
    
    navToggle.addEventListener('click', () => {
        const isVisible = navIndex.classList.toggle('visible');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isVisible);
    });
    
    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!navIndex.contains(e.target) && !navToggle.contains(e.target)) {
            navIndex.classList.remove('visible');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Keyboard navigation
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navIndex.classList.remove('visible');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================================================
// 4. PROGRESS INDICATORS
// ============================================================================

/**
 * Update all progress indicators based on scroll position
 * 
 * Orchestrates updates to three progress systems:
 * 1. Progress bar (top of screen, 0-100% fill)
 * 2. Reading info (percentage complete + estimated time remaining)
 * 3. Progress markers (side navigation dots)
 * 
 * Called on scroll (throttled to 100ms)
 */
function updateProgressIndicators() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(Math.max((scrollTop / docHeight) * 100, 0), 100);
    
    updateProgressBar(scrollPercent);
    updateReadingInfo(scrollPercent);
    updateProgressMarkers();
}

/**
 * Update progress bar width and ARIA attributes
 * 
 * @param {number} scrollPercent - Scroll percentage (0-100)
 */
function updateProgressBar(scrollPercent) {
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const progressBar = document.querySelector('.progress-bar');
    if (progressBarFill) {
        progressBarFill.style.width = scrollPercent + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }
}

/**
 * Update reading progress percentage
 * 
 * Calculates:
 * - Scroll percentage (rounded to nearest integer)
 * - Auto-hides info panel after 2 seconds of no scrolling
 * 
 * @param {number} scrollPercent - Scroll percentage (0-100)
 */
function updateReadingInfo(scrollPercent) {
    // Update percentage
    const readingProgress = document.getElementById('reading-progress');
    if (readingProgress) {
        readingProgress.textContent = Math.round(scrollPercent) + '%';
    }
    
    // Show reading info briefly on scroll
    const readingInfo = document.querySelector('.reading-info');
    if (readingInfo) {
        readingInfo.classList.add('visible');
        clearTimeout(window.readingInfoTimeout);
        window.readingInfoTimeout = setTimeout(() => {
            readingInfo.classList.remove('visible');
        }, 2000);
    }
}

/**
 * Update progress markers state based on reading position
 * 
 * Three marker states:
 * - active: Current section being read (highlighted)
 * - completed: Previous sections (dimmed)
 * - upcoming: Future sections (default appearance)
 * 
 * Uses same 150px threshold as scroll spy for consistency
 */
function updateProgressMarkers() {
    const markers = document.querySelectorAll('.progress-marker');
    const headings = Array.from(document.querySelectorAll('h2[id]'));
    
    let currentIndex = -1;
    for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
            currentIndex = i;
            break;
        }
    }
    
    markers.forEach((marker, index) => {
        if (index === currentIndex) {
            marker.classList.add('active');
            marker.classList.remove('completed');
        } else if (index < currentIndex) {
            marker.classList.add('completed');
            marker.classList.remove('active');
        } else {
            marker.classList.remove('active', 'completed');
        }
    });
}

// ============================================================================
// 5. PARTICLE SYSTEM
// ============================================================================

/**
 * Create floating particles with random movement and tremor
 * 
 * Performance optimizations:
 * - Uses DocumentFragment for batch DOM insertion (single reflow)
 * - CSS custom properties for animation values (GPU-accelerated)
 * - Random animation delays to create organic feel
 * - Particles use will-change and translateZ for GPU rendering
 * 
 * Particles create ambient visual interest without distracting from content.
 * Tremor effect adds subtle "breathing" motion to maintain dynamism.
 * 
 * @param {number} count - Number of particles to create (default: 50)
 */
function createParticles(count) {
    const body = document.body;
    const fragment = document.createDocumentFragment(); // Use fragment for batch DOM insertion
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle floating';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        
        // Custom CSS variables for random movement
        const tx1 = (Math.random() - 0.5) * 200;
        const ty1 = (Math.random() - 0.5) * 200;
        const tx2 = (Math.random() - 0.5) * 200;
        const ty2 = (Math.random() - 0.5) * 200;
        const tx3 = (Math.random() - 0.5) * 200;
        const ty3 = (Math.random() - 0.5) * 200;
        
        particle.style.setProperty('--tx1', tx1 + 'px');
        particle.style.setProperty('--ty1', ty1 + 'px');
        particle.style.setProperty('--tx2', tx2 + 'px');
        particle.style.setProperty('--ty2', ty2 + 'px');
        particle.style.setProperty('--tx3', tx3 + 'px');
        particle.style.setProperty('--ty3', ty3 + 'px');
        
        // Variables for random tremor (shake)
        for (let j = 1; j <= 9; j++) {
            const shakeX = (Math.random() - 0.5) * 3;
            const shakeY = (Math.random() - 0.5) * 3;
            particle.style.setProperty(`--shake-x${j}`, shakeX + 'px');
            particle.style.setProperty(`--shake-y${j}`, shakeY + 'px');
        }
        
        // Random duration and delay
        const floatDuration = (15 + Math.random() * 10) + 's';
        const tremorDuration = (0.08 + Math.random() * 0.12) + 's';
        const animationDelay = Math.random() * 20 + 's';
        
        particle.style.setProperty('--float-duration', floatDuration);
        particle.style.setProperty('--tremor-duration', tremorDuration);
        particle.style.animationDelay = `${animationDelay}, ${Math.random() * 0.1}s`;
        
        // Enable GPU acceleration
        particle.style.willChange = 'transform, opacity';
        
        fragment.appendChild(particle);
    }
    
    body.appendChild(fragment); // Single DOM insertion for better performance
}

/**
 * Optimize particle visibility based on viewport position
 * 
 * Performance optimization that hides particles far outside viewport
 * to reduce GPU rendering load. Particles are hidden if more than
 * 50% above viewport or 150% below viewport.
 * 
 * Called during scroll (throttled to 200ms).
 * 
 * visibility: hidden (not display: none) preserves layout while
 * stopping rendering, preventing reflow when particles reappear.
 */
function optimizeParticles() {
    const particles = document.querySelectorAll('.particle');
    const viewportHeight = window.innerHeight;
    
    particles.forEach(particle => {
        const rect = particle.getBoundingClientRect();
        const isInViewport = rect.top < viewportHeight * 1.5 && rect.bottom > -viewportHeight * 0.5;
        
        if (isInViewport) {
            particle.style.visibility = 'visible';
        } else {
            particle.style.visibility = 'hidden'; // Hide off-screen particles
        }
    });
}

// ============================================================================
// 6. AUDIO MANAGEMENT
// ============================================================================

/**
 * Initialize and manage background audio system with scroll synchronization
 * 
 * Complex audio system that responds to user interaction:
 * 
 * SCROLL SYNCHRONIZATION:
 * - Volume: 0% → 100% as user scrolls (0 at top, full at bottom)
 * - Playback rate: 0.05x → 0.75x (desktop) or 0.5x (mobile)
 * - Text tremor intensity: 0 → 1 (visual feedback for audio)
 * - Particle chaos: 1x → 5x (particles intensify with scroll)
 * - Particle glow: 1x → 12x (increases visual drama)
 * - Particle speed: 1x → 5x (faster movement near end)
 * 
 * AUDIO CONTROLS:
 * - Play button: Optional user-initiated audio playback
 * - Mute button: Appears after audio starts, 99s mute duration
 * - Click counter system (10 clicks = countdown, 21 clicks = dissolve/reload)
 * - Particle stabilization during mute (removes chaos/tremor)
 * - Graceful fallback if audio file missing (shows error state)
 * 
 * MOBILE OPTIMIZATION:
 * - Slower playback rate (0.5x vs 0.75x) to reduce battery drain
 * - User agent detection for device-specific tuning
 */
function initializeAudioSystem() {
    const audio = document.getElementById('bg-audio');
    const playBtn = document.getElementById('play-btn');
    const muteBtn = document.getElementById('mute-btn');
    const muteLabel = document.getElementById('mute-label');
    const audioStatus = document.getElementById('audio-status');
    const audioUI = document.querySelector('.audio-ui');

    let muteTimer = null;
    let muteRemaining = 0;
    let clickCounter = 0;
    let isPlaying = false;

    // Use DEVICE_INFO for better mobile detection and adjust playback accordingly
    const baseRate = DEVICE_INFO.isMobile ? 0.5 : 0.75;
    audio.playbackRate = 0.05; // Start very slow
    audio.volume = 0; // Start at 0%
    
    // iOS-specific audio handling
    if (DEVICE_INFO.isIOS) {
        // iOS requires user interaction before playing audio
        // Set up one-time unlock handler
        const unlockAudio = () => {
            audio.load();
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('click', unlockAudio, { once: true });
    }
    
    /**
     * Update volume and playback rate based on scroll position
     */
    function updateVolumeByScroll() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1); // 0 to 1
        
        // Volume from 0% to 100%
        audio.volume = scrollPercent;
        
        // Playback rate increases from ~0.05 to baseRate (0.5 mobile or 0.75 desktop)
        audio.playbackRate = 0.05 + (scrollPercent * (baseRate - 0.05));
        
        // Update text tremor intensity (0 to 1)
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.style.setProperty('--tremor-intensity', scrollPercent);
        }
        
        // Update particle chaos intensity (1 to 5x)
        const chaosIntensity = 1 + (scrollPercent * 4);
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.setProperty('--chaos-intensity', chaosIntensity);
        });
        
        // Update particle glow intensity (1 to 12x)
        const glowIntensity = 1 + (scrollPercent * 11);
        particles.forEach(particle => {
            particle.style.setProperty('--glow-intensity', glowIntensity);
        });
        
        // Update particle movement speed (1 to 5x faster)
        const speedMultiplier = 1 + (scrollPercent * 4);
        particles.forEach(particle => {
            particle.style.setProperty('--speed-multiplier', speedMultiplier);
        });
    }

    /**
     * Show audio UI with play/mute buttons
     */
    function showUI() {
        audioUI.style.opacity = '1';
    }

    /**
     * Hide audio status message
     */
    function hideStatus() {
        if (audioStatus) {
            audioStatus.style.display = 'none';
        }
    }

    /**
     * Update audio status message
     */
    function updateStatus(message) {
        if (audioStatus) {
            audioStatus.textContent = message;
            audioStatus.style.display = 'block';
        }
    }

    /**
     * Try to play audio (handles autoplay restrictions and missing files)
     */
    function tryPlay() {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(() => {
                isPlaying = true;
                updateVolumeByScroll();
                playBtn.textContent = '⏸';
                playBtn.classList.add('playing');
                playBtn.setAttribute('aria-label', 'Pausar áudio');
                playBtn.setAttribute('title', 'Pausar áudio CRIO');
                hideStatus();
            }).catch((error) => {
                console.warn('Autoplay blocked or audio error:', error);
                updateStatus('Clique ▶ para iniciar');
            });
        }
    }

    /**
     * Pause audio playback
     */
    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        playBtn.textContent = '▶';
        playBtn.classList.remove('playing');
        playBtn.setAttribute('aria-label', 'Reproduzir áudio');
        playBtn.setAttribute('title', 'Iniciar áudio CRIO');
        hideStatus();
    }

    /**
     * Mute audio for specified seconds and stabilize particles
     */
    function holdMute(seconds) {
        if (muteTimer) return;
        audio.muted = true;
        muteRemaining = seconds;
        
        // Stabilize particles
        const particles = document.querySelectorAll('.particle.floating');
        particles.forEach(particle => {
            particle.classList.add('stabilized');
        });
        
        // Keep button visible, just update the label text
        muteLabel.style.display = 'block';
        muteLabel.classList.add('blink');
        updateMuteLabel();

        muteTimer = setInterval(() => {
            muteRemaining--;
            updateMuteLabel();
            if (muteRemaining <= 0) {
                clearInterval(muteTimer);
                muteTimer = null;
                audio.muted = false;
                muteLabel.style.display = 'none';
                muteLabel.classList.remove('blink');
                
                // Reactivate particle movement
                particles.forEach(particle => {
                    particle.classList.remove('stabilized');
                });
            }
        }, 1000);
    }

    /**
     * Update mute label animation
     */
    function updateMuteLabel() {
        const progress = muteRemaining / 99;
        if (progress > 0.666) {
            muteLabel.textContent = '∅';
        } else if (progress > 0.333) {
            muteLabel.textContent = '·';
        } else {
            muteLabel.textContent = '∅';
        }
    }

    /**
     * Dissolve and reload page with void symbol animation
     */
    function dissolveAndReload() {
        const main = document.querySelector('main');
        const audioUI = document.querySelector('.audio-ui');
        const voidSymbol = document.querySelector('.void-symbol');
        
        // Fade out main content
        main.style.transition = 'opacity 6s ease-out';
        main.style.opacity = '0';
        
        // Fade out audio UI
        if (audioUI) {
            audioUI.style.transition = 'opacity 6s ease-out';
            audioUI.style.opacity = '0';
        }
        
        // Activate void symbol
        if (voidSymbol) {
            voidSymbol.classList.add('active');
            
            // After 3 seconds, start zoom
            setTimeout(() => {
                voidSymbol.classList.add('zoom');
                document.body.classList.add('symbol-takeover');
            }, 3000);
        }
        
        // Remove all particles after fade
        setTimeout(() => {
            const particles = document.querySelectorAll('.particle');
            particles.forEach(particle => {
                particle.style.transition = 'opacity 6s ease-out';
                particle.style.opacity = '0';
            });
        }, 3000);
        
        // After complete animation (15s zoom + 5s hold = 20s total), reload
        setTimeout(() => {
            window.location.reload();
        }, 20000);
    }

    /**
     * Create ripple effect at click position
     */
    function createRippleEffect(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }

    /**
     * Show click counter feedback
     */
    function showClickCounter(remaining) {
        const clickCounterEl = document.getElementById('click-counter');
        clickCounterEl.textContent = remaining > 0 ? remaining : '∅';
        clickCounterEl.classList.add('visible');
        
        setTimeout(() => {
            clickCounterEl.classList.remove('visible');
        }, 800);
    }

    // Play button click handler
    playBtn.addEventListener('click', () => {
        if (!isPlaying) {
            tryPlay();
        } else {
            pauseAudio();
        }
    });

    // Keyboard support for play button
    playBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            playBtn.click();
        }
    });

    // Mute button click handler (also toggles theme)
    muteBtn.addEventListener('click', (e) => {
        clickCounter++;
        
        createRippleEffect(e);
        
        // Show click counter after 10 clicks
        if (clickCounter >= 10) {
            const remaining = 21 - clickCounter;
            showClickCounter(remaining);
        }
        
        // Trigger dissolve at 21 clicks
        if (clickCounter === 21) { 
            dissolveAndReload(); 
            return; 
        }
        
        toggleTheme();
        holdMute(99);
        
        // Update aria-pressed state
        muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    });

    // Keyboard support for mute button
    muteBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            muteBtn.click();
        }
    });

    // Handle audio errors (graceful fallback for missing CRIO.mp3)
    audio.addEventListener('error', (e) => {
        console.warn('Audio error:', e);
        playBtn.style.display = 'none';
        muteBtn.style.display = 'none';
        updateStatus('Áudio indisponível');
        audioStatus.style.opacity = '0.5';
    });

    audio.addEventListener('play', () => {
        showUI();
        isPlaying = true;
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
    });

    // Handle audio ending (fade to void)
    audio.addEventListener('ended', () => {
        const main = document.querySelector('main');
        const audioUI = document.querySelector('.audio-ui');
        const voidSymbol = document.querySelector('.void-symbol');
        
        main.style.transition = 'opacity 6s ease-out';
        main.style.opacity = '0';
        
        if (audioUI) {
            audioUI.style.transition = 'opacity 6s ease-out';
            audioUI.style.opacity = '0';
        }
        
        // Activate void symbol
        if (voidSymbol) {
            voidSymbol.classList.add('active');
            
            // After 3 seconds, start zoom
            setTimeout(() => {
                voidSymbol.classList.add('zoom');
                document.body.classList.add('symbol-takeover');
            }, 3000);
        }
        
        // Remove all particles after fade
        setTimeout(() => {
            const particles = document.querySelectorAll('.particle');
            particles.forEach(particle => {
                particle.style.transition = 'opacity 6s ease-out';
                particle.style.opacity = '0';
            });
        }, 3000);
        
        // After complete zoom, return to beginning
        setTimeout(() => {
            document.body.style.transition = 'opacity 3s ease-out';
            document.body.style.opacity = '0';
            
            setTimeout(() => {
                window.scrollTo(0, 0);
                localStorage.removeItem('crio-scroll-position');
                window.location.reload();
            }, 3000);
        }, 15000);
    });

    // Manual scroll controls audio position and volume
    let lastScrollY = window.scrollY;
    let hasScrolled = false;
    
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = window.scrollY / scrollHeight;
        
        // Update volume based on scroll (only if playing)
        if (isPlaying) {
            updateVolumeByScroll();
        }
        
        // Save scroll position (debounced)
        saveScrollPosition();
        
        // Scroll controls audio time (only if playing)
        if (isPlaying && audio.duration) {
            const newTime = scrollPercent * audio.duration;
            audio.currentTime = newTime;
        }
        
        lastScrollY = window.scrollY;
    }, { passive: true });
}

// ============================================================================
// 7. ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Initialize comprehensive accessibility features
 * 
 * Sets up four key accessibility systems:
 * 1. ARIA attributes - Updates loading states dynamically
 * 2. Keyboard navigation - Makes progress markers keyboard-accessible
 * 3. Skip navigation - Allows screen reader users to jump to content
 * 4. Page announcements - Notifies screen readers when content loads
 * 
 * Called during initialization to ensure accessibility from page load
 */
function initializeAccessibility() {
    // Update ARIA attributes dynamically
    updateAriaAttributes();
    
    // Add keyboard navigation for progress markers
    makeProgressMarkersAccessible();
    
    // Add skip navigation functionality
    addSkipNavigation();
    
    // Announce page load to screen readers
    announcePageLoad();
}

/**
 * Update ARIA attributes based on content loading state
 * 
 * Uses MutationObserver to detect when markdown content finishes
 * rendering, then removes aria-busy="true" to signal completion
 * to screen readers.
 * 
 * Observer disconnects after first completion to prevent memory leak
 */
function updateAriaAttributes() {
    const content = document.getElementById('content');
    if (content) {
        // Remove loading state once content is loaded
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !content.classList.contains('loading')) {
                    content.setAttribute('aria-busy', 'false');
                    observer.disconnect();
                }
            });
        });
        observer.observe(content, { childList: true, subtree: true });
    }
}

/**
 * Make progress markers keyboard accessible with Enter/Space support
 * 
 * Dynamically adds keyboard navigation to progress markers after
 * they're created (2s delay to wait for navigation system).
 * 
 * Adds:
 * - tabindex="0" for keyboard focus
 * - ARIA labels describing destination
 * - Enter/Space key handlers to trigger navigation
 * 
 * Ensures all navigation is accessible without a mouse
 */
function makeProgressMarkersAccessible() {
    // Wait for markers to be created
    setTimeout(() => {
        const markers = document.querySelectorAll('.progress-marker');
        markers.forEach((marker, index) => {
            // Make markers focusable
            marker.setAttribute('tabindex', '0');
            
            // Add ARIA label
            const label = marker.querySelector('.progress-marker-label');
            if (label) {
                marker.setAttribute('aria-label', `Navegar para ${label.textContent.trim()}`);
            }
            
            // Add keyboard support (Enter/Space to activate)
            marker.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    marker.click();
                }
            });
        });
    }, 2000); // Wait for navigation to build
}

/**
 * Add skip navigation functionality for screen readers
 * 
 * Implements "skip to content" link (first focusable element on page)
 * to allow screen reader users to bypass navigation and jump directly
 * to main content.
 * 
 * Sets temporary tabindex="-1" on content to enable programmatic focus,
 * then removes it after blur to maintain natural tab order
 */
function addSkipNavigation() {
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const content = document.getElementById('content');
            if (content) {
                content.setAttribute('tabindex', '-1');
                content.focus();
                // Remove tabindex after focus
                content.addEventListener('blur', () => {
                    content.removeAttribute('tabindex');
                }, { once: true });
            }
        });
    }
}

/**
 * Announce page load completion to screen readers
 * 
 * Creates a temporary ARIA live region after content loads (2.5s delay)
 * to notify screen reader users that:
 * - Content has loaded successfully
 * - How to navigate (Tab key)
 * - How to toggle theme (T key)
 * 
 * Uses role="status" and aria-live="polite" for non-intrusive announcement.
 * Announcement is removed after 3s to prevent cluttering the DOM.
 */
function announcePageLoad() {
    setTimeout(() => {
        const content = document.getElementById('content');
        if (content && !content.classList.contains('loading')) {
            // Create a live region announcement
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = 'CRIO carregado com sucesso. Use Tab para navegar ou pressione T para alternar tema.';
            document.body.appendChild(announcement);
            
            // Remove after announcement
            setTimeout(() => {
                announcement.remove();
            }, 3000);
        }
    }, 2500);
}

// ============================================================================
// 8. KEYBOARD SHORTCUTS AND SYSTEM HEALTH
// ============================================================================

/**
 * Check system health and log comprehensive diagnostics
 * 
 * Validates five critical systems:
 * 1. marked.js availability (markdown rendering)
 * 2. localStorage support (caching)
 * 3. Cache validity (version checking)
 * 4. Service Worker support (future PWA capability)
 * 5. Network status (online/offline)
 * 
 * Logs warnings for any issues to help with debugging.
 * Called during initialization to catch setup problems early.
 * 
 * @returns {Object} Health status object with boolean flags
 */
function checkSystemHealth() {
    const health = {
        marked: typeof marked !== 'undefined',
        localStorage: checkLocalStorageAvailable(),
        cacheValid: isCacheValid(),
        serviceWorker: 'serviceWorker' in navigator,
        online: navigator.onLine
    };
    
    console.log('CRIO System Health:', health);
    
    // Warn about potential issues
    if (!health.marked) {
        console.error('⚠️ marked.js not loaded - markdown rendering will fail');
    }
    if (!health.localStorage) {
        console.warn('⚠️ localStorage not available - caching disabled');
    }
    if (!health.online) {
        console.warn('⚠️ Browser is offline - will try to use cache');
    }
    
    return health;
}

/**
 * Check if localStorage is available and working
 * 
 * Tests localStorage with a write-read-delete cycle to verify
 * it's not just present but actually functional.
 * 
 * Can fail in:
 * - Private browsing modes (some browsers)
 * - Storage quota exceeded
 * - Browser security settings
 * 
 * @returns {boolean} True if localStorage is available and working
 */
function checkLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage not available:', e);
        return false;
    }
}

/**
 * Initialize keyboard shortcuts for power users
 * 
 * Provides keyboard-driven cache management and theme control:
 * - Ctrl/Cmd + Shift + C: Clear cache and reload page
 * - T: Toggle between light/dark theme
 * 
 * Shows visual confirmation messages for user feedback.
 * Shortcuts work globally unless user is typing in an input field.
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+C or Cmd+Shift+C to clear cache
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            clearMarkdownCache();
            
            // Show confirmation message
            const message = document.createElement('div');
            message.textContent = 'Cache limpo! Recarregando...';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--void);
                color: var(--trace);
                padding: 1.5rem 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-size: 1.2rem;
                animation: fadeIn 0.3s ease-out;
            `;
            document.body.appendChild(message);
            
            // Reload after brief delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    });
}

// ============================================================================
// 9. ERROR HANDLING AND INITIALIZATION
// ============================================================================

/**
 * Global error handler for uncaught errors
 * 
 * Catches JavaScript runtime errors and displays user-friendly
 * error messages if content is still loading.
 * 
 * Only shows error UI during initial load to avoid disrupting
 * user experience after content has successfully rendered.
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    // Only show error UI if content is still loading
    const content = document.getElementById('content');
    if (content && content.classList.contains('loading')) {
        content.classList.remove('loading');
        showDetailedErrorMessage('runtime-error', event.error);
    }
});

/**
 * Global handler for unhandled promise rejections
 * 
 * Catches async errors that weren't caught with .catch() or try/catch.
 * Logs to console for debugging but doesn't disrupt user experience.
 * 
 * Common causes: failed fetch requests, rejected async operations
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Initialize all systems when DOM is ready
 * 
 * Main initialization orchestrator that sets up CRIO in the correct order:
 * 
 * INITIALIZATION ORDER (critical for dependencies):
 * 1. System health check (validates environment)
 * 2. Theme initialization (prevents flash of wrong theme)
 * 3. Markdown configuration (sets up marked.js options)
 * 4. Content loading (fetches and renders CRIOS.md)
 * 5. Navigation setup (after content exists)
 * 6. Keyboard shortcuts (global event handlers)
 * 7. Accessibility features (ARIA updates, announcements)
 * 8. Particle system (visual enhancements)
 * 9. Scroll handlers (throttled for performance)
 * 10. Audio system (last, user interaction dependent)
 * 
 * Uses try/catch to prevent initialization failures from breaking page.
 * All initialization errors are logged but don't stop execution.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check system health first
        const health = checkSystemHealth();
        
        // Initialize theme first
        initializeTheme();
        
        // Only proceed if marked.js is loaded
        if (!health.marked) {
            console.error('Cannot initialize: marked.js not loaded');
            return;
        }
        
        // Configure and load markdown
        configureMarkdown();
        loadMarkdownContent();
        
        // Initialize navigation toggle
        initializeNavigationToggle();
        
        // Initialize keyboard shortcuts
        initializeKeyboardShortcuts();
        
        // Initialize accessibility features
        initializeAccessibility();
        
        // Create particles (reduce count on mobile for performance)
        const particleCount = DEVICE_INFO.isMobile || DEVICE_INFO.hasReducedMotion ? 5 : 10;
        createParticles(particleCount);
        
        // Optimize particles on scroll (throttled)
        let particleOptimizationTimeout;
        window.addEventListener('scroll', () => {
            if (!particleOptimizationTimeout) {
                particleOptimizationTimeout = setTimeout(() => {
                    optimizeParticles();
                    particleOptimizationTimeout = null;
                }, 200); // Throttle to every 200ms
            }
        }, { passive: true });
        
        // Initial optimization
        optimizeParticles();
        
        // Initialize audio system
        initializeAudioSystem();
        
        // Log device info to console for debugging (helpful for mobile testing)
        console.log('CRIO Device Info:', {
            isMobile: DEVICE_INFO.isMobile,
            isIOS: DEVICE_INFO.isIOS,
            isAndroid: DEVICE_INFO.isAndroid,
            isTouchDevice: DEVICE_INFO.isTouchDevice,
            screenSize: `${DEVICE_INFO.screenWidth}x${DEVICE_INFO.screenHeight}`,
            orientation: DEVICE_INFO.isLandscape ? 'landscape' : 'portrait',
            pixelRatio: DEVICE_INFO.pixelRatio,
            isStandalone: DEVICE_INFO.isStandalone,
            reducedMotion: DEVICE_INFO.hasReducedMotion,
            reducedData: DEVICE_INFO.hasReducedData,
            particleCount: DEVICE_INFO.isMobile || DEVICE_INFO.hasReducedMotion ? 5 : 10
        });
        
        // Log cache info to console for debugging
        console.log('CRIO Cache Info:', {
            version: CACHE_CONFIG.VERSION,
            isCached: isCacheValid(),
            cacheAge: localStorage.getItem(CACHE_CONFIG.TIMESTAMP_KEY) 
                ? `${Math.round((Date.now() - parseInt(localStorage.getItem(CACHE_CONFIG.TIMESTAMP_KEY))) / 1000 / 60)} minutes`
                : 'N/A',
            shortcut: 'Press Ctrl+Shift+C (or Cmd+Shift+C) to clear cache'
        });
        
        console.log('✓ CRIO initialized successfully');
        
        // Initialize privacy-first analytics
        initializeAnalytics();
        
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        const content = document.getElementById('content');
        if (content) {
            content.classList.remove('loading');
            showDetailedErrorMessage('init-error', error);
        }
    }
});

// ========================================
// Section 14: Privacy-First Analytics
// ========================================
// Local analytics system that respects user privacy:
// - No external trackers or third-party services
// - All data stored locally in localStorage
// - Easy opt-out mechanism
// - Aggregated anonymous metrics only
// - Helps understand usage patterns for improvements

const ANALYTICS_CONFIG = {
    ENABLED_KEY: 'crio_analytics_enabled',
    SESSION_KEY: 'crio_session_data',
    AGGREGATE_KEY: 'crio_aggregate_data',
    // Don't track if user has opted out or DNT is enabled
    isEnabled: () => {
        // Check Do Not Track
        if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
            return false;
        }
        // Check user preference (default: true for privacy-friendly local analytics)
        const preference = localStorage.getItem(ANALYTICS_CONFIG.ENABLED_KEY);
        return preference === null || preference === 'true';
    }
};

/**
 * Initialize privacy-first analytics system
 * Tracks local metrics without sending data to external services
 */
function initializeAnalytics() {
    if (!ANALYTICS_CONFIG.isEnabled()) {
        console.log('Analytics disabled (DNT or user preference)');
        return;
    }
    
    // Initialize session data
    const sessionData = {
        startTime: Date.now(),
        pageLoads: 1,
        sections: {},
        interactions: {
            clicks: 0,
            scrollDepth: 0,
            audioPlayed: false,
            navigationUsed: false
        },
        device: {
            isMobile: DEVICE_INFO.isMobile,
            screenWidth: DEVICE_INFO.screenWidth,
            orientation: DEVICE_INFO.isLandscape ? 'landscape' : 'portrait'
        }
    };
    
    // Track section views (which sections were read)
    const trackSectionView = (sectionId) => {
        if (!ANALYTICS_CONFIG.isEnabled()) return;
        
        const data = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.SESSION_KEY) || '{}');
        if (!data.sections) data.sections = {};
        
        if (!data.sections[sectionId]) {
            data.sections[sectionId] = {
                firstView: Date.now(),
                viewCount: 0,
                timeSpent: 0
            };
        }
        
        data.sections[sectionId].viewCount++;
        data.sections[sectionId].lastView = Date.now();
        
        localStorage.setItem(ANALYTICS_CONFIG.SESSION_KEY, JSON.stringify(data));
    };
    
    // Track scroll depth (how far user scrolled)
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
        if (!ANALYTICS_CONFIG.isEnabled()) return;
        
        const scrolled = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = Math.round((scrolled + windowHeight) / documentHeight * 100);
        
        if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;
            
            const data = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.SESSION_KEY) || '{}');
            if (!data.interactions) data.interactions = {};
            data.interactions.scrollDepth = maxScrollDepth;
            localStorage.setItem(ANALYTICS_CONFIG.SESSION_KEY, JSON.stringify(data));
        }
    };
    
    // Track interactions
    const trackInteraction = (type) => {
        if (!ANALYTICS_CONFIG.isEnabled()) return;
        
        const data = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.SESSION_KEY) || '{}');
        if (!data.interactions) data.interactions = {};
        
        switch(type) {
            case 'click':
                data.interactions.clicks = (data.interactions.clicks || 0) + 1;
                break;
            case 'audio':
                data.interactions.audioPlayed = true;
                break;
            case 'navigation':
                data.interactions.navigationUsed = true;
                break;
        }
        
        localStorage.setItem(ANALYTICS_CONFIG.SESSION_KEY, JSON.stringify(data));
    };
    
    // Aggregate data on session end
    const aggregateSessionData = () => {
        if (!ANALYTICS_CONFIG.isEnabled()) return;
        
        const sessionData = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.SESSION_KEY) || '{}');
        if (!sessionData.startTime) return;
        
        const sessionDuration = Date.now() - sessionData.startTime;
        
        // Get aggregate data
        const aggregate = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.AGGREGATE_KEY) || JSON.stringify({
            totalSessions: 0,
            totalTime: 0,
            avgScrollDepth: 0,
            sectionsViewed: {},
            deviceTypes: { mobile: 0, desktop: 0 },
            interactions: { totalClicks: 0, audioPlays: 0, navigationUses: 0 }
        }));
        
        // Update aggregates
        aggregate.totalSessions++;
        aggregate.totalTime += sessionDuration;
        
        // Update scroll depth average
        if (sessionData.interactions?.scrollDepth) {
            aggregate.avgScrollDepth = Math.round(
                ((aggregate.avgScrollDepth * (aggregate.totalSessions - 1)) + sessionData.interactions.scrollDepth) 
                / aggregate.totalSessions
            );
        }
        
        // Update section views
        if (sessionData.sections) {
            Object.keys(sessionData.sections).forEach(sectionId => {
                if (!aggregate.sectionsViewed[sectionId]) {
                    aggregate.sectionsViewed[sectionId] = 0;
                }
                aggregate.sectionsViewed[sectionId]++;
            });
        }
        
        // Update device types
        if (sessionData.device?.isMobile) {
            aggregate.deviceTypes.mobile++;
        } else {
            aggregate.deviceTypes.desktop++;
        }
        
        // Update interactions
        if (sessionData.interactions) {
            aggregate.interactions.totalClicks += sessionData.interactions.clicks || 0;
            if (sessionData.interactions.audioPlayed) aggregate.interactions.audioPlays++;
            if (sessionData.interactions.navigationUsed) aggregate.interactions.navigationUses++;
        }
        
        // Save aggregate data
        localStorage.setItem(ANALYTICS_CONFIG.AGGREGATE_KEY, JSON.stringify(aggregate));
        
        // Clear session data
        localStorage.removeItem(ANALYTICS_CONFIG.SESSION_KEY);
    };
    
    // Initialize session
    localStorage.setItem(ANALYTICS_CONFIG.SESSION_KEY, JSON.stringify(sessionData));
    
    // Set up event listeners
    window.addEventListener('scroll', () => {
        trackScrollDepth();
    }, { passive: true });
    
    document.addEventListener('click', () => {
        trackInteraction('click');
    }, { passive: true });
    
    // Track audio plays
    const playButton = document.getElementById('play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            trackInteraction('audio');
        });
    }
    
    // Track navigation usage
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            trackInteraction('navigation');
        });
    }
    
    // Track section views via Intersection Observer
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const sectionId = entry.target.id || entry.target.querySelector('h1, h2')?.textContent || 'unknown';
                trackSectionView(sectionId);
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all main sections
    setTimeout(() => {
        const sections = document.querySelectorAll('h1, h2');
        sections.forEach(section => {
            sectionObserver.observe(section.parentElement || section);
        });
    }, 1000);
    
    // Aggregate data on page unload
    window.addEventListener('beforeunload', () => {
        aggregateSessionData();
    });
    
    // Aggregate data on visibility change (when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            aggregateSessionData();
        }
    });
    
    console.log('✓ Privacy-first analytics initialized (local only, no external tracking)');
    console.log('  To view analytics: localStorage.getItem("crio_aggregate_data")');
    console.log('  To disable: localStorage.setItem("crio_analytics_enabled", "false")');
}

/**
 * View analytics data (for developer/owner use)
 * Call this in console: viewAnalytics()
 */
window.viewAnalytics = function() {
    const aggregate = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.AGGREGATE_KEY) || '{}');
    
    if (!aggregate.totalSessions) {
        console.log('No analytics data yet');
        return;
    }
    
    const avgSessionTime = Math.round(aggregate.totalTime / aggregate.totalSessions / 1000 / 60);
    
    console.log('=== CRIO Analytics (Local) ===');
    console.log(`Total Sessions: ${aggregate.totalSessions}`);
    console.log(`Avg Session Time: ${avgSessionTime} minutes`);
    console.log(`Avg Scroll Depth: ${aggregate.avgScrollDepth}%`);
    console.log(`\nDevice Types:`);
    console.log(`  Mobile: ${aggregate.deviceTypes.mobile} (${Math.round(aggregate.deviceTypes.mobile/aggregate.totalSessions*100)}%)`);
    console.log(`  Desktop: ${aggregate.deviceTypes.desktop} (${Math.round(aggregate.deviceTypes.desktop/aggregate.totalSessions*100)}%)`);
    console.log(`\nInteractions:`);
    console.log(`  Total Clicks: ${aggregate.interactions.totalClicks}`);
    console.log(`  Audio Plays: ${aggregate.interactions.audioPlays}`);
    console.log(`  Navigation Uses: ${aggregate.interactions.navigationUses}`);
    console.log(`\nTop Sections Viewed:`);
    const sortedSections = Object.entries(aggregate.sectionsViewed)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    sortedSections.forEach(([section, count]) => {
        console.log(`  ${section}: ${count} views`);
    });
    console.log('\nRaw data:', aggregate);
    
    return aggregate;
};

/**
 * Clear analytics data
 * Call this in console: clearAnalytics()
 */
window.clearAnalytics = function() {
    localStorage.removeItem(ANALYTICS_CONFIG.SESSION_KEY);
    localStorage.removeItem(ANALYTICS_CONFIG.AGGREGATE_KEY);
    console.log('✓ Analytics data cleared');
};

/**
 * Disable analytics
 * Call this in console: disableAnalytics()
 */
window.disableAnalytics = function() {
    localStorage.setItem(ANALYTICS_CONFIG.ENABLED_KEY, 'false');
    console.log('✓ Analytics disabled');
};

/**
 * Enable analytics
 * Call this in console: enableAnalytics()
 */
window.enableAnalytics = function() {
    localStorage.setItem(ANALYTICS_CONFIG.ENABLED_KEY, 'true');
    console.log('✓ Analytics enabled');
};
