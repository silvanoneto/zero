/**
 * Polyfills for Helia in Node.js environment
 * These are required for Helia to work properly in Node.js
 */

import crypto from 'crypto';
import EventTargetPolyfillModule from 'event-target-polyfill';
const EventTargetPolyfill = EventTargetPolyfillModule.EventTarget || EventTargetPolyfillModule;

// Polyfill global crypto (for browser APIs used by Helia)
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto.webcrypto || crypto;
}

// Polyfill Promise.withResolvers (Node.js < 22)
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Polyfill CustomEvent if not available
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.detail = options.detail;
    }
  };
}

// Polyfill EventTarget if not available
if (typeof globalThis.EventTarget === 'undefined') {
  globalThis.EventTarget = EventTargetPolyfill;
}

// Ensure global Event is available
if (typeof globalThis.Event === 'undefined') {
  globalThis.Event = class Event {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = options.bubbles || false;
      this.cancelable = options.cancelable || false;
      this.composed = options.composed || false;
      this.defaultPrevented = false;
      this.timeStamp = Date.now();
    }

    preventDefault() {
      if (this.cancelable) {
        this.defaultPrevented = true;
      }
    }

    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

console.log('[Polyfills] crypto, CustomEvent, EventTarget, Event, and Promise.withResolvers polyfills loaded');
