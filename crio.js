/**
 * CRIO - Interactive Ontology Reader
 * JavaScript module for managing interactions, animations, and content loading
 */

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Restore saved theme preference from localStorage
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('crio-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    
    // Save theme preference
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('crio-theme', isLight ? 'light' : 'dark');
}

// ============================================================================
// MARKDOWN LOADING AND RENDERING
// ============================================================================

/**
 * Configure marked.js options for better rendering
 */
function configureMarkdown() {
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });
}

/**
 * Load and render the CRIOS.md markdown file
 */
function loadMarkdownContent() {
    fetch('CRIOS.md')
        .then(response => {
            if (!response.ok) throw new Error('Arquivo não encontrado');
            return response.text();
        })
        .then(markdown => {
            const content = document.getElementById('content');
            content.innerHTML = marked.parse(markdown);
            content.classList.remove('loading');
            
            // Build navigation after content loads
            buildNavigation();
            
            // Restore saved scroll position
            const savedPosition = localStorage.getItem('crio-scroll-position');
            if (savedPosition) {
                setTimeout(() => {
                    window.scrollTo(0, parseInt(savedPosition));
                }, 100);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar CRIOS.md:', error);
            handleMarkdownLoadError();
        });
}

/**
 * Fallback error handler for markdown loading
 */
function handleMarkdownLoadError() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'CRIOS.md', true);
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) { // 0 for file://
            const content = document.getElementById('content');
            content.innerHTML = marked.parse(xhr.responseText);
            content.classList.remove('loading');
            buildNavigation();
        } else {
            showErrorMessage('Erro ao carregar CRIOS.md. Abra este arquivo em um servidor web local.');
        }
    };
    xhr.onerror = function() {
        showErrorMessage('Para visualizar o conteúdo completo, abra em um servidor web local:<br><code>python3 -m http.server 8000</code>');
    };
    xhr.send();
}

/**
 * Display error message to user
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
    
    // Set up scroll spy
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    window.addEventListener('scroll', updateProgressIndicators, { passive: true });
    updateActiveNavLink();
    updateProgressIndicators();
}

/**
 * Generate anchor ID from heading text
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
    } else {
        // For other headings, create a slug
        return text.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

/**
 * Create navigation link element
 */
function createNavigationLink(navList, anchorId, text) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${anchorId}`;
    a.textContent = text;
    a.dataset.target = anchorId;
    
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
 * Update active navigation link based on scroll position
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
// PROGRESS INDICATORS
// ============================================================================

/**
 * Update all progress indicators based on scroll position
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
 * Update progress bar width
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
 * Update reading progress and time estimate
 */
function updateReadingInfo(scrollPercent) {
    // Update percentage
    const readingProgress = document.getElementById('reading-progress');
    if (readingProgress) {
        readingProgress.textContent = Math.round(scrollPercent) + '%';
    }
    
    // Calculate reading time
    const content = document.getElementById('content');
    if (content) {
        const totalWords = content.textContent.split(/\s+/).length;
        const wordsPerMinute = 250;
        const totalMinutes = Math.ceil(totalWords / wordsPerMinute);
        const remainingMinutes = Math.ceil(totalMinutes * (1 - scrollPercent / 100));
        
        const readingTime = document.getElementById('reading-time');
        if (readingTime) {
            if (remainingMinutes === 0) {
                readingTime.textContent = 'leitura concluída';
            } else if (remainingMinutes === 1) {
                readingTime.textContent = '~1 min restante';
            } else {
                readingTime.textContent = `~${remainingMinutes} min restantes`;
            }
        }
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
 * Update progress markers state
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
// PARTICLE SYSTEM
// ============================================================================

/**
 * Create floating particles with random movement and tremor
 */
function createParticles(count) {
    const body = document.body;
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
        
        body.appendChild(particle);
    }
}

// ============================================================================
// AUDIO MANAGEMENT
// ============================================================================

/**
 * Initialize and manage background audio system
 */
function initializeAudioSystem() {
    const audio = document.getElementById('bg-audio');
    const muteBtn = document.getElementById('mute-btn');
    const muteLabel = document.getElementById('mute-label');
    const audioUI = document.querySelector('.audio-ui');

    let muteTimer = null;
    let muteRemaining = 0;
    let clickCounter = 0;

    // Detect mobile and adjust base playback rate
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseRate = isMobile ? 0.5 : 0.75;
    audio.playbackRate = 0.05; // Start very slow
    audio.volume = 0; // Start at 0%
    
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
     * Show audio UI
     */
    function showUI() {
        audioUI.style.display = 'flex';
    }

    /**
     * Try to play audio (handles autoplay restrictions)
     */
    function tryPlay() {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
            p.then(() => {
                updateVolumeByScroll();
                showUI();
            }).catch(() => {
                // Autoplay blocked
            });
        }
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
        
        muteBtn.style.display = 'none';
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
                muteBtn.style.display = 'block';
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
     * Dissolve and reload page
     */
    function dissolveAndReload() {
        document.body.style.transition = 'opacity 3s ease-out';
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.reload();
            document.body.style.opacity = '1';
        }, 3000);
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
    });

    // Keyboard support for mute button
    muteBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            muteBtn.click();
        }
    });

    // Handle audio errors
    audio.addEventListener('error', () => {
        audioUI.style.display = 'flex';
        muteLabel.textContent = 'sem áudio';
        muteLabel.style.display = 'block';
        muteBtn.style.display = 'none';
    });

    audio.addEventListener('play', showUI);

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
        
        // Update volume based on scroll
        updateVolumeByScroll();
        
        // Save scroll position
        localStorage.setItem('crio-scroll-position', window.scrollY);
        
        // If user scrolls and audio hasn't started, start it
        if (!hasScrolled && Math.abs(window.scrollY - lastScrollY) > 10) {
            hasScrolled = true;
            if (audio.paused) {
                tryPlay();
            }
        }
        
        // Scroll controls audio time
        if (audio.duration) {
            const newTime = scrollPercent * audio.duration;
            audio.currentTime = newTime;
        }
        
        lastScrollY = window.scrollY;
    }, { passive: true });

    // Auto-play after 99 seconds from page load
    setTimeout(() => {
        tryPlay();
    }, 99000);

    // If user interacts anywhere, attempt to play once
    function onFirstInteraction() {
        if (audio.paused) {
            tryPlay();
        }
    }

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all systems when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme first
    initializeTheme();
    
    // Configure and load markdown
    configureMarkdown();
    loadMarkdownContent();
    
    // Initialize navigation toggle
    initializeNavigationToggle();
    
    // Create particles
    createParticles(10);
    
    // Initialize audio system
    initializeAudioSystem();
});
