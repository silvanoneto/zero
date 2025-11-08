// Edge wrap: atravessar topo/rodapé com contador de 1.5s e overlay desfocado
(function () {
    'use strict';

    // CONFIGURÁVEIS
    const DURATION = 1500; // ms
    // Thresholds aumentados para reduzir disparos acidentais — ajustáveis aqui
    let THRESHOLD_WHEEL = 60; // deltaY threshold to consider an overscroll intent
    let THRESHOLD_TOUCH = 80; // touch move threshold in px

    // localStorage keys
    const STORAGE_KEY_ENABLED = 'edgeWrapEnabled';
    const STORAGE_KEY_WHEEL = 'edgeWrapThresholdWheel';
    const STORAGE_KEY_TOUCH = 'edgeWrapThresholdTouch';

    let locked = false; // evita triggers simultâneos
    let overlay = null;
    let rafId = null;
    let endTime = null;
    let jumping = false;
    let motionContainer = null; // elemento que receberá o transform durante o overlay

    // Estado inicial a partir do localStorage
    function isEnabled() {
        const v = localStorage.getItem(STORAGE_KEY_ENABLED);
        return v === null ? true : v === 'true';
    }

    function loadThresholds() {
        const w = parseInt(localStorage.getItem(STORAGE_KEY_WHEEL), 10);
        const t = parseInt(localStorage.getItem(STORAGE_KEY_TOUCH), 10);
        if (!Number.isNaN(w)) THRESHOLD_WHEEL = w;
        if (!Number.isNaN(t)) THRESHOLD_TOUCH = t;
    }

    loadThresholds();

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'edge-wrap-overlay';
        overlay.innerHTML = `
            <div class="edge-wrap-inner" role="dialog" aria-live="polite">
                <svg class="edge-wrap-svg" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                    <circle class="edge-wrap-track" cx="32" cy="32" r="24" fill="none" stroke-width="6"></circle>
                    <circle class="edge-wrap-progress" cx="32" cy="32" r="24" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8"></circle>
                </svg>
                <div class="edge-wrap-hint">Atravessando...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', cancel);
    }

    function showOverlay() {
        if (!overlay) createOverlay();
        overlay.classList.add('visible');
    }

    function hideOverlay() {
        if (!overlay) return;
        overlay.classList.remove('visible');
        // reset any motion applied to the container
        resetMotion();
    }

    function resetMotion() {
        try {
            if (!motionContainer) return;
            // Prevent animating the return to original position: disable transition, reset transform, then restore
            // This ensures the container does not visibly move back after the overlay hides.
            const prevTransition = motionContainer.style.transition;
            motionContainer.style.transition = 'none';
            // Force style flush
            // eslint-disable-next-line no-unused-expressions
            motionContainer.offsetHeight;
            motionContainer.style.transform = '';
            // allow one frame for the change to apply, then remove the 'none' transition so future transitions behave normally
            requestAnimationFrame(() => {
                try {
                    motionContainer.style.transition = prevTransition || '';
                    motionContainer.style.willChange = '';
                    motionContainer = null;
                } catch (e) { /* ignore */ }
            });
        } catch (e) { /* ignore */ }
    }

    function cancel() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        endTime = null;
        hideOverlay();
        locked = false;
    }

    function startCountdown(target) {
        if (!isEnabled()) return;
        if (locked) return;
        locked = true;

        if (!overlay) createOverlay();
        const hint = overlay.querySelector('.edge-wrap-hint');
        hint.textContent = target === 'to-top' ? 'Indo para o topo...' : 'Indo para o final...';
        showOverlay();

        const progressEl = overlay.querySelector('.edge-wrap-progress');
        const radius = 24;
        const circumference = 2 * Math.PI * radius; // ~150.8
        progressEl.style.strokeDasharray = `${circumference}`;
        progressEl.style.strokeDashoffset = `${circumference}`;

        const start = performance.now();
        endTime = start + DURATION;

        // NOTE: previously we applied a visual translate during the countdown.
        // Per request, do not show intermediate movement — the page will jump directly when the countdown ends.

        // animação com requestAnimationFrame para barra circular
        function frame(now) {
            if (!endTime) return;
            const remaining = Math.max(0, endTime - now);
            const progress = 1 - (remaining / DURATION);
            const offset = Math.round((1 - progress) * circumference);
            progressEl.style.strokeDashoffset = `${offset}`;

            if (remaining <= 0) {
                // executar salto suave
                rafId = null;
                endTime = null;
                jumping = true;
                // Jump directly to the destination without smooth animation
                if (target === 'to-top') {
                    window.scrollTo(0, 0);
                } else {
                    window.scrollTo(0, document.body.scrollHeight);
                }
                // esconder overlay logo após iniciar o scroll suave
                setTimeout(() => {
                    hideOverlay();
                    // aguardar pequena janela para não reagir ao próprio scroll
                    setTimeout(() => { locked = false; jumping = false; }, 400);
                }, 120);
                return;
            }
            rafId = requestAnimationFrame(frame);
        }

        rafId = requestAnimationFrame(frame);
    }

    // UI toggle (criado dinamicamente) para ativar/desativar o comportamento
    function createToggleUI() {
        const btn = document.createElement('button');
        btn.id = 'edge-wrap-toggle';
        btn.setAttribute('aria-pressed', isEnabled() ? 'true' : 'false');
        btn.title = 'Ativar/Desativar atravessar topo/rodapé';
        btn.className = 'edge-wrap-toggle';
        btn.innerHTML = isEnabled() ? '↕︎ Atravessar: ON' : '↕︎ Atravessar: OFF';
        btn.addEventListener('click', function (e) {
            const newVal = !(isEnabled());
            localStorage.setItem(STORAGE_KEY_ENABLED, newVal ? 'true' : 'false');
            btn.setAttribute('aria-pressed', newVal ? 'true' : 'false');
            btn.innerHTML = newVal ? '↕︎ Atravessar: ON' : '↕︎ Atravessar: OFF';
        });
        document.body.appendChild(btn);
    }

    // Cria UI e overlay quando DOM pronto
    document.addEventListener('DOMContentLoaded', function () {
        try {
            createToggleUI();
        } catch (e) { /* ignore */ }
    });

    // Detecta wheel overscroll (desktop)
    window.addEventListener('wheel', function (e) {
        try {
            if (!isEnabled()) return;
            if (locked || jumping) return;
            const deltaY = e.deltaY;
            const atTop = window.scrollY <= 0;
            const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 1;

            // scroll up at top -> go to bottom
            if (atTop && deltaY < -THRESHOLD_WHEEL) {
                // prevent default to avoid bounce
                e.preventDefault();
                startCountdown('to-bottom');
                return;
            }

            // scroll down at bottom -> go to top
            if (atBottom && deltaY > THRESHOLD_WHEEL) {
                e.preventDefault();
                startCountdown('to-top');
                return;
            }
        } catch (err) {
            console.error('edge-wrap wheel handler error', err);
        }
    }, { passive: false });

    // Touch support (mobile): detect pull beyond edges
    let touchStartY = null;
    window.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (!isEnabled()) return;
        if (locked || jumping || touchStartY === null) return;
        const y = e.touches[0].clientY;
        const dy = touchStartY - y; // positive when moving up
        const atTop = window.scrollY <= 0;
        const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 1;

        // user pulls down (dy < 0) at top -> to bottom
        if (atTop && dy < -THRESHOLD_TOUCH) {
            startCountdown('to-bottom');
            touchStartY = null;
            return;
        }

        // user pushes up (dy > 0) at bottom -> to top
        if (atBottom && dy > THRESHOLD_TOUCH) {
            startCountdown('to-top');
            touchStartY = null;
            return;
        }
    }, { passive: true });

})();
