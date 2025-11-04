/**
 * 🌀 Loading Overlay Manager
 * Sistema de carregamento com capa e fundo desfocado
 * Revolução Cibernética - Capítulo Zero
 */

class LoadingOverlay {
    constructor(options = {}) {
        this.options = Object.assign({
            // sensible default (relative) - will be resolved below so it works
            // with file://, base href and subpaths
            coverImage: options.coverImage || 'assets/images/01_capa_revolucao_cibernetica.png',
            title: options.title || 'A Revolução Cibernética',
            subtitle: options.subtitle || 'Inicializando sistema...',
            minDisplayTime: options.minDisplayTime || 1000 // Mínimo 1s
        }, options || {});

        this.startTime = Date.now();
        this.loadedResources = 0;
        this.totalResources = 0;
        this.isReady = false;
        this.overlay = null;
        this.progressBar = null;
        this.statusText = null;

        this.init();
    }

    async applyBase64Fallback(imgElement) {
        if (!imgElement) return;
        if (imgElement._fallbackApplied) return;
        imgElement._fallbackApplied = true;

        // Path to the .b64.txt file we exported
        const fallbackTxt = this.resolveAssetPath('assets/images/01_capa_revolucao_cibernetica.png.b64.txt');

        try {
            const resp = await fetch(fallbackTxt, { cache: 'no-store' });
            if (!resp.ok) throw new Error('Failed to fetch base64 fallback: ' + resp.status);
            const b64 = await resp.text();

            // sanity check: if the file contains newlines, remove them
            const clean = b64.replace(/\s+/g, '');
            imgElement.src = 'data:image/png;base64,' + clean;
            console.log('✅ Applied base64 fallback for loading overlay image');
        } catch (err) {
            console.error('Error applying base64 fallback:', err);
            throw err;
        }
    }

    init() {
        // Resolve asset paths so the cover loads regardless of base href or
        // whether the page is opened via file:// or served from a subpath.
        this.options.coverImage = this.resolveAssetPath(this.options.coverImage);

        this.createOverlay();
        this.countResources();
        this.trackProgress();
        console.log('🌀 Loading Overlay inicializado');
    }

    /** Resolve a (possibly relative) asset path to an absolute URL based on
     * the location of this script. This makes paths work when the page is
     * opened via file://, served from a subpath, or when a <base> tag exists.
     *
     * Rules:
     * - If path is absolute (starts with /) or is an absolute URL, return as-is.
     * - Otherwise, compute the directory of the loading-overlay.js script and
     *   resolve the relative path against it.
     */
    resolveAssetPath(path) {
        if (!path) return path;

        // already absolute URL or protocol-relative
        if (/^(?:https?:)?\/\//i.test(path) || path.startsWith('/')) {
            return path;
        }

        // Try to locate the script that loaded this file
        let scriptSrc = '';
        if (document.currentScript && document.currentScript.src) {
            scriptSrc = document.currentScript.src;
        } else {
            // Fallback: find the script by filename
            const scriptEl = Array.from(document.scripts).find(s => s.src && s.src.includes('loading-overlay.js'));
            scriptSrc = scriptEl ? scriptEl.src : '';
        }

        if (!scriptSrc) {
            // as a last resort, return the provided path (may still work)
            return path;
        }

        // Directory of the script (remove filename)
        const scriptDir = scriptSrc.replace(/\/[^\/]*$/, '');

        // If the script is inside /assets/scripts, go up to repo root
        // e.g. file:///.../assets/scripts -> file:///.../
        const base = scriptDir.replace(/\/assets\/scripts\/?$/i, '');

        // Normalize and join
        const normalized = path.replace(/^\.\/?/, '');
        // Ensure no double slashes
        return (base + '/' + normalized).replace(/([^:]\/)\/+/g, '$1');
    }

    createOverlay() {
        // Criar estrutura HTML
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <!-- Backdrop desfocado -->
                <img src="${this.options.coverImage}" 
                     class="loading-backdrop" 
                     alt="" 
                     aria-hidden="true">
                
                <!-- Imagem principal -->
                <img src="${this.options.coverImage}" 
                     class="loading-cover" 
                     alt="Capa: ${this.options.title}">
                
                <!-- Título -->
                <h1 class="loading-title">${this.options.title}</h1>
                
                <!-- Subtítulo -->
                <p class="loading-subtitle">${this.options.subtitle}</p>
                
                <!-- Barra de progresso -->
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
                
                <!-- Status -->
                <p class="loading-status">Carregando recursos...</p>
            </div>
        `;

        // Inserir no início do documentElement (html) to avoid stacking-context
        // issues caused by transformed/fixed parents. Also force a very large
        // z-index and fixed full-viewport sizing inline so the overlay stays
        // above all other UI.
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100vw';
        this.overlay.style.height = '100vh';
        // Use a very large z-index to outrank other elements (32-bit max safe)
        this.overlay.style.zIndex = String(2147483647);

        // Append to the document root to minimize stacking-context interference
        const root = document.documentElement || document.body;
        root.insertBefore(this.overlay, root.firstChild);

        // Referenciar elementos
        this.progressBar = this.overlay.querySelector('.loading-progress-bar');
        this.statusText = this.overlay.querySelector('.loading-status');

        // Attach error handlers to swap to an embedded/base64 fallback if the
        // resolved image fails to load. We fetch a companion .b64.txt file
        // generated from the edited cover image and set a data URL.
        const coverImg = this.overlay.querySelector('.loading-cover');
        const backdropImg = this.overlay.querySelector('.loading-backdrop');

        [coverImg, backdropImg].forEach(img => {
            if (!img) return;
            img.addEventListener('error', () => {
                console.warn('⚠️ Cover image failed to load, attempting base64 fallback');
                this.applyBase64Fallback(img).catch(err => {
                    console.error('❌ Fallback load failed', err);
                });
            });
        });
    }

    countResources() {
        // Contar scripts
        const scripts = document.querySelectorAll('script[src]');
        this.totalResources += scripts.length;

        // Contar stylesheets
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        this.totalResources += styles.length;

        // Contar imagens no HTML
        const images = document.querySelectorAll('img[src]');
        this.totalResources += images.length;

        console.log(`📦 Total de recursos para carregar: ${this.totalResources}`);
    }

    trackProgress() {
        // Listener para scripts
        document.querySelectorAll('script[src]').forEach(script => {
            script.addEventListener('load', () => this.onResourceLoaded('script', script.src));
            script.addEventListener('error', () => this.onResourceError('script', script.src));
        });

        // Listener para stylesheets
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            link.addEventListener('load', () => this.onResourceLoaded('stylesheet', link.href));
            link.addEventListener('error', () => this.onResourceError('stylesheet', link.href));
        });

        // Listener para imagens
        document.querySelectorAll('img[src]').forEach(img => {
            if (img.complete) {
                this.onResourceLoaded('image', img.src);
            } else {
                img.addEventListener('load', () => this.onResourceLoaded('image', img.src));
                img.addEventListener('error', () => this.onResourceError('image', img.src));
            }
        });

        // Fallback: remover após window.onload
        window.addEventListener('load', () => {
            setTimeout(() => this.complete(), 300);
        });

        // Fallback de segurança: remover após 10 segundos
        setTimeout(() => {
            if (!this.isReady) {
                console.warn('⚠️ Loading timeout - forçando remoção do overlay');
                this.complete();
            }
        }, 10000);
    }

    onResourceLoaded(type, src) {
        this.loadedResources++;
        const progress = (this.loadedResources / this.totalResources) * 100;
        this.updateProgress(progress);

        const fileName = src.split('/').pop();
        this.updateStatus(`Carregado: ${fileName.substring(0, 30)}...`);

        console.log(`✅ ${type} carregado: ${fileName}`);

        // Se todos recursos carregados
        if (this.loadedResources >= this.totalResources) {
            this.complete();
        }
    }

    onResourceError(type, src) {
        this.loadedResources++;
        const fileName = src.split('/').pop();
        console.warn(`⚠️ Erro ao carregar ${type}: ${fileName}`);

        // Continuar mesmo com erros
        if (this.loadedResources >= this.totalResources) {
            this.complete();
        }
    }

    updateProgress(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = Math.min(percentage, 100) + '%';
        }
    }

    updateStatus(message) {
        if (this.statusText) {
            this.statusText.textContent = message;
        }
    }

    complete() {
        if (this.isReady) return;
        this.isReady = true;

        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.options.minDisplayTime - elapsedTime);

        // Garantir tempo mínimo de exibição
        setTimeout(() => {
            this.updateProgress(100);
            this.updateStatus('Sistema pronto! ✨');

            // Remover overlay com fade
            setTimeout(() => {
                this.hide();
            }, 400);
        }, remainingTime);
    }

    hide() {
        if (!this.overlay) return;

        // Fade out
        this.overlay.classList.add('hidden');

        // Remover do DOM após animação
        setTimeout(() => {
            this.overlay.classList.add('removed');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                console.log('🌀 Loading overlay removido');
            }, 100);
        }, 800);

        // Dispatch evento customizado
        window.dispatchEvent(new CustomEvent('loadingComplete', {
            detail: {
                duration: Date.now() - this.startTime,
                resources: this.totalResources
            }
        }));
    }

    // Método público para forçar remoção
    forceRemove() {
        console.log('🌀 Forçando remoção do loading overlay');
        this.isReady = true;
        this.hide();
    }
}

// Inicializar automaticamente quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.loadingOverlay = new LoadingOverlay({
            coverImage: '/assets/images/01_capa_revolucao_cibernetica.png',
            title: 'A Revolução Cibernética',
            subtitle: 'Marxismo, Cibernética e Sistemas',
            minDisplayTime: 1200
        });
    });
} else {
    // DOM já carregado
    window.loadingOverlay = new LoadingOverlay({
        coverImage: '/assets/images/01_capa_revolucao_cibernetica.png',
        title: 'A Revolução Cibernética',
        subtitle: 'Marxismo, Cibernética e Sistemas',
        minDisplayTime: 1200
    });
}

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingOverlay;
}
