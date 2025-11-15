/**
 * LIVRO: Entre Igrejas e Casas de Charlatanismo
 * Carregador de conteúdo com renderização Markdown
 */

// Declaração global do marked.js
declare const marked: {
    parse(markdown: string): string;
};

// Estado global
const state = {
    currentTheme: 'dark',
    fontSize: 'medium',
    navOpen: false
};

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
    navIndex.classList.toggle('open', state.navOpen);
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

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
