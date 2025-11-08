/**
 * 📍 POSITION INDICATOR: Visualização de Posição no Livro
 * 
 * Mostra onde o usuário está na jornada:
 * - Badge flutuante com capítulo atual
 * - Sincronização com scroll
 * - Indicador na Möbius
 */

class PositionIndicator {
    constructor() {
        this.currentChapter = null;
        this.chapters = [];
        this.indicator = null;
        this.progressBar = null;

        this.init();
    }

    init() {
        // Mapear todos os capítulos
        this.mapChapters();

        // Criar indicador flutuante
        this.createIndicator();

        // Configurar scroll listener
        this.setupScrollListener();

        // Atualizar posição inicial
        this.updatePosition();

        console.log('📍 Position Indicator inicializado com', this.chapters.length, 'capítulos');
    }

    mapChapters() {
        // Capturar todos os capítulos do DOM
        const chapterElements = document.querySelectorAll('section.chapter[id^="cap-"]');

        chapterElements.forEach((el, index) => {
            const id = el.id;
            const title = el.querySelector('h1')?.textContent || id;
            const rect = el.getBoundingClientRect();
            const offsetTop = el.offsetTop;

            this.chapters.push({
                id,
                title,
                element: el,
                offsetTop,
                index
            });
        });

        // Ordenar por posição no documento
        this.chapters.sort((a, b) => a.offsetTop - b.offsetTop);
    }

    createIndicator() {
        // Indicador flutuante
        this.indicator = document.createElement('div');
        this.indicator.id = 'position-indicator';
        this.indicator.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            /* Translucent/backdrop style to match other floating UI like #back-to-top */
            background: linear-gradient(90deg, rgba(37, 99, 235, 0.16), rgba(16, 185, 129, 0.16));
            -webkit-backdrop-filter: blur(6px) saturate(180%);
            backdrop-filter: blur(6px) saturate(180%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(37, 99, 235, 0.12);
            z-index: 1002;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: all 0.3s ease;
            cursor: pointer;
            max-width: 300px;
            display: none;
        `;

        this.indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="font-size: 1.5rem;">📍</div>
                <div>
                    <div id="current-chapter-name" style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.25rem;">
                        Carregando...
                    </div>
                    <div id="reading-progress-text" style="font-size: 0.75rem; opacity: 0.7;">
                        0% do livro
                    </div>
                </div>
            </div>
        `;

        // Hover effect
        this.indicator.addEventListener('mouseenter', () => {
            this.indicator.style.transform = 'translateY(-5px) scale(1.05)';
            this.indicator.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.4)';
        });

        this.indicator.addEventListener('mouseleave', () => {
            this.indicator.style.transform = 'translateY(0) scale(1)';
            this.indicator.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
        });

        // Click: scroll to top do capítulo atual
        this.indicator.addEventListener('click', () => {
            if (this.currentChapter && this.currentChapter.element) {
                this.currentChapter.element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        document.body.appendChild(this.indicator);
    }

    setupScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updatePosition();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updatePosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));

        // Encontrar capítulo atual
        let currentChap = null;

        for (let i = this.chapters.length - 1; i >= 0; i--) {
            const chapter = this.chapters[i];
            if (scrollTop >= chapter.offsetTop - 100) { // -100px de margem
                currentChap = chapter;
                break;
            }
        }

        // Atualizar UI se mudou
        if (currentChap && currentChap !== this.currentChapter) {
            this.currentChapter = currentChap;
            this.updateIndicatorContent(scrollPercent);
        } else if (currentChap) {
            // Apenas atualizar progresso
            this.updateProgressText(scrollPercent);
        }

        // Mostrar/esconder indicador baseado no scroll
        if (scrollTop > 300) {
            this.indicator.style.display = 'block';
        } else {
            this.indicator.style.display = 'none';
        }

        // Atualizar destaque na Möbius (se disponível)
        this.highlightInMobius(currentChap);
    }

    updateIndicatorContent(scrollPercent) {
        const nameEl = document.getElementById('current-chapter-name');
        const progressEl = document.getElementById('reading-progress-text');

        if (nameEl && this.currentChapter) {
            // Extrair número do capítulo
            const match = this.currentChapter.id.match(/cap-(\d+)/);
            const capNum = match ? match[1] : '?';

            nameEl.textContent = `Cap ${capNum}`;

            // Adicionar emoji baseado na camada
            const capNumber = parseInt(capNum);
            let emoji = '📖';
            if (capNumber <= 10) {
                emoji = '🔴'; // Passado
            } else if (capNumber <= 21) {
                emoji = '🟢'; // Presente
            } else {
                emoji = '🔵'; // Futuro
            }

            nameEl.textContent = `${emoji} ${nameEl.textContent}`;
        }

        this.updateProgressText(scrollPercent);
    }

    updateProgressText(scrollPercent) {
        const progressEl = document.getElementById('reading-progress-text');
        if (progressEl) {
            progressEl.textContent = `${Math.round(scrollPercent)}% do livro`;
        }
    }

    highlightInMobius(chapter) {
        // Se IndexMobius disponível, atualizar destaque
        if (window.indexMobius && chapter) {
            // Guardar referência do capítulo atual para o Möbius usar
            window.indexMobius.currentChapterId = chapter.id;
        }
    }

    // Método público para pular para capítulo específico
    goToChapter(chapterId) {
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (chapter && chapter.element) {
            chapter.element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Highlight animation
            chapter.element.style.transition = 'all 0.3s ease';
            chapter.element.style.transform = 'scale(1.01)';
            setTimeout(() => {
                chapter.element.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

// Inicializar quando DOM estiver pronto
let positionIndicator = null;

function initPositionIndicator() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            positionIndicator = new PositionIndicator();
            window.positionIndicator = positionIndicator;
        });
    } else {
        positionIndicator = new PositionIndicator();
        window.positionIndicator = positionIndicator;
    }
}

initPositionIndicator();

console.log('📍 Módulo Position Indicator carregado');
