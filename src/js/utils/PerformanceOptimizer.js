// Performance Optimization Utilities
export class PerformanceOptimizer {
  constructor() {
    this.elementCache = new Map();
    this.eventListeners = new WeakMap();
    this.animationFrames = new Set();
    this.intersectionObserver = null;
    this.resizeObserver = null;
  }

  // Cache DOM elements to avoid repeated queries
  cacheElement(selector, context = document) {
    const key = `${selector}:${context === document ? 'document' : 'context'}`;
    if (!this.elementCache.has(key)) {
      const element = context.querySelector(selector);
      if (element) {
        this.elementCache.set(key, element);
      }
    }
    return this.elementCache.get(key) || null;
  }

  // Efficient event listener management
  addEventListenerWithCleanup(element, event, handler, options = {}) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    
    const elementListeners = this.eventListeners.get(element);
    const key = `${event}:${handler.name || 'anonymous'}`;
    
    // Remove existing listener if present
    if (elementListeners.has(key)) {
      const oldHandler = elementListeners.get(key);
      element.removeEventListener(event, oldHandler, options);
    }
    
    element.addEventListener(event, handler, options);
    elementListeners.set(key, handler);
  }

  // Throttled scroll handler
  createThrottledScrollHandler(callback, delay = 16) {
    let lastCall = 0;
    let timeoutId = null;
    
    return (event) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(event);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          callback(event);
        }, delay - (now - lastCall));
      }
    };
  }

  // Debounced resize handler
  createDebouncedResizeHandler(callback, delay = 250) {
    let timeoutId = null;
    
    return (event) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(event), delay);
    };
  }

  // Intersection Observer for scroll detection
  setupIntersectionObserver(callback, options = {}) {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    this.intersectionObserver = new IntersectionObserver(callback, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '0px',
      ...options
    });
    
    return this.intersectionObserver;
  }

  // Optimized animation frame management
  requestAnimationFrame(callback) {
    const id = requestAnimationFrame((timestamp) => {
      this.animationFrames.delete(id);
      callback(timestamp);
    });
    
    this.animationFrames.add(id);
    return id;
  }

  cancelAnimationFrame(id) {
    if (this.animationFrames.has(id)) {
      cancelAnimationFrame(id);
      this.animationFrames.delete(id);
    }
  }

  // Memory-efficient DOM updates
  batchDOMUpdates(updates) {
    return new Promise((resolve) => {
      this.requestAnimationFrame(() => {
        updates.forEach(update => {
          if (typeof update === 'function') {
            update();
          }
        });
        resolve();
      });
    });
  }

  // Cleanup all resources
  cleanup() {
    // Cancel all pending animation frames
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
    this.animationFrames.clear();
    
    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Clear caches
    this.elementCache.clear();
  }

  // Performance monitoring
  measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`Performance: ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}