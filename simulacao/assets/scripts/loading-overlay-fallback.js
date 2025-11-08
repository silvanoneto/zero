/*
 * loading-overlay-fallback.js
 *
 * Exposes a global helper `applyLoadingOverlayBase64Fallback(options)` that
 * fetches a companion `.b64.txt` file and applies it as a data URL to the
 * loading overlay images. This allows applying the fallback on-demand from
 * the console or other code without embedding the base64 string in the main
 * overlay script.
 *
 * Usage:
 *   // default behaviour (looks for .loading-overlay and the default b64 file)
 *   window.applyLoadingOverlayBase64Fallback().catch(console.error);
 *
 *   // custom:
 *   window.applyLoadingOverlayBase64Fallback({
 *     overlaySelector: '.loading-overlay',
 *     b64Path: '/assets/images/01_capa_revolucao_cibernetica.png.b64.txt'
 *   });
 */

(function (window, document) {
    'use strict';

    async function fetchB64(txtPath) {
        const resp = await fetch(txtPath, { cache: 'no-store' });
        if (!resp.ok) throw new Error('Failed to fetch base64 fallback: ' + resp.status);
        const text = await resp.text();
        return text.replace(/\s+/g, '');
    }

    async function applyFallback(options = {}) {
        const selector = options.overlaySelector || '.loading-overlay';
        const b64Path = options.b64Path || '/assets/images/01_capa_revolucao_cibernetica.png.b64.txt';

        const overlay = document.querySelector(selector);
        if (!overlay) throw new Error('Overlay not found: ' + selector);

        const imgs = overlay.querySelectorAll('.loading-cover, .loading-backdrop');
        if (!imgs || imgs.length === 0) throw new Error('No overlay images found to replace');

        const b64 = await fetchB64(b64Path);
        const dataUrl = 'data:image/png;base64,' + b64;

        imgs.forEach(img => {
            try {
                img.src = dataUrl;
            } catch (e) {
                console.warn('Failed to set data URL on img', e);
            }
        });

        return true;
    }

    // Expose helper globally
    window.applyLoadingOverlayBase64Fallback = applyFallback;

    // CommonJS export for tests or Node usage (if any)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { applyLoadingOverlayBase64Fallback: applyFallback };
    }

})(window, document);
