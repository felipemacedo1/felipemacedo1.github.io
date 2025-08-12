/**
 * 🏢 ENTERPRISE TERMINAL PORTFOLIO - MAIN ENTRY POINT
 * Production-ready architecture with enterprise security, performance, and UX
 * 
 * Features:
 * - CSP with cryptographic nonces
 * - Rate limiting with sliding window + token bucket
 * - Core Web Vitals monitoring
 * - WCAG 2.1 AAA accessibility
 * - Service worker with intelligent caching
 * - Gesture recognition system
 * - Advanced theme management
 * - Modular architecture with dependency injection
 */

// Enterprise Core Imports
import { CSPManager } from './security/CSPManager.js';
import { RateLimiter } from './core/RateLimiter.js';
import { PerformanceMonitor } from './core/PerformanceMonitor.js';
import { ResourcePreloader } from './core/ResourcePreloader.js';
import { StateManager } from './core/StateManager.js';
import { EventStore } from './core/EventStore.js';
import { ModuleFederation } from './core/ModuleFederation.js';

// Advanced UX Features
import { AccessibilityEngine } from './a11y/AccessibilityEngine.js';
import { ThemeProvider } from './theming/ThemeProvider.js';
import { GestureRecognizer } from './features/GestureRecognizer.js';
import { UXEnhancementSystem } from './features/UXEnhancementSystem.js';

// Core Terminal System
import { TerminalPortfolio } from './TerminalPortfolio.js';
import { Analytics } from './features/analytics.js';

// Utility Imports
import { DeviceDetector } from './utils/DeviceDetector.js';

/**
 * Enterprise Application State
 */
class EnterpriseApp {
  constructor() {
    this.initialized = false;
    this.modules = new Map();
    this.performance = {
      startTime: performance.now(),
      loadTime: null,
      criticalPathComplete: false
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🏢 Starting Enterprise Terminal Portfolio...');
      
      // Phase 1: Critical Security & Performance Foundation
      await this.initializeCriticalPath();
      
      // Phase 2: Core Application Systems
      await this.initializeCoreModules();
      
      // Phase 3: Advanced UX Features
      await this.initializeAdvancedFeatures();
      
      // Phase 4: Service Worker & PWA Features
      await this.initializeServiceWorker();
      
      // Phase 5: Analytics & Monitoring
      await this.initializeAnalytics();
      
      // Phase 6: Start Application
      await this.startApplication();
      
      this.initialized = true;
      this.performance.loadTime = performance.now() - this.performance.startTime;
      
      console.log(`✅ Enterprise Terminal loaded in ${this.performance.loadTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('❌ Enterprise initialization failed:', error);
      await this.initializeFallbackMode();
    }
  }

  async initializeCriticalPath() {
    // 1. Security Layer - CRITICAL
    window.cspManager = new CSPManager();
    this.modules.set('security', window.cspManager);
    
    // Update CSP nonce in HTML
    this.updateCSPNonce(window.cspManager.getNonce());
    
    // 2. Rate Limiting - CRITICAL
    window.rateLimiter = new RateLimiter();
    this.modules.set('rateLimiter', window.rateLimiter);
    
    // 3. Performance Monitoring - CRITICAL
    window.performanceMonitor = new PerformanceMonitor();
    this.modules.set('performance', window.performanceMonitor);
    
    // 4. Resource Preloading - HIGH PRIORITY
    window.resourcePreloader = new ResourcePreloader();
    this.modules.set('preloader', window.resourcePreloader);
    
    this.performance.criticalPathComplete = true;
    console.log('✅ Critical security & performance foundation initialized');
  }

  async initializeCoreModules() {
    // State Management
    window.stateManager = new StateManager({
      app: {
        version: '2.0.0-enterprise',
        environment: 'production',
        features: {
          security: true,
          performance: true,
          accessibility: true,
          gestures: true
        }
      },
      user: {
        preferences: {},
        progress: {},
        analytics: {}
      }
    });
    this.modules.set('state', window.stateManager);
    
    // Event Store
    window.eventStore = new EventStore();
    this.modules.set('events', window.eventStore);
    
    // Module Federation
    window.moduleFederation = new ModuleFederation();
    this.modules.set('federation', window.moduleFederation);
    
    console.log('✅ Core modules initialized');
  }

  async initializeAdvancedFeatures() {
    // Accessibility Engine
    window.accessibilityEngine = new AccessibilityEngine();
    this.modules.set('a11y', window.accessibilityEngine);
    
    // Theme Provider
    window.themeProvider = new ThemeProvider();
    this.modules.set('theme', window.themeProvider);
    
    // Gesture Recognition
    window.gestureRecognizer = new GestureRecognizer(document.body, {
      swipeThreshold: 50,
      tapTimeout: 300,
      longPressTimeout: 500
    });
    this.modules.set('gestures', window.gestureRecognizer);
    
    // UX Enhancement System
    window.uxSystem = new UXEnhancementSystem();
    this.modules.set('ux', window.uxSystem);
    
    console.log('✅ Advanced UX features initialized');
  }

  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyServiceWorkerUpdate();
            }
          });
        });
        
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    }
  }

  async initializeAnalytics() {
    window.analytics = new Analytics();
    this.modules.set('analytics', window.analytics);
    
    // Track enterprise initialization
    window.analytics.trackEvent('enterprise_init', {
      loadTime: this.performance.loadTime,
      modules: Array.from(this.modules.keys()),
      userAgent: navigator.userAgent
    });
    
    console.log('✅ Analytics system initialized');
  }

  async startApplication() {
    // Check for mobile redirect
    if (this.shouldRedirectToMobile()) {
      this.initiateRedirect();
      return;
    }
    
    // Initialize main terminal
    window.terminal = new TerminalPortfolio();
    this.modules.set('terminal', window.terminal);
    
    // Setup global functions for mobile keyboard
    window.typeChar = this.typeChar.bind(this);
    window.typeCommand = this.typeCommand.bind(this);
    
    // Remove loading screen
    this.removeLoadingScreen();
    
    // Setup enterprise event listeners
    this.setupEnterpriseEventListeners();
    
    console.log('✅ Application started successfully');
  }

  async initializeFallbackMode() {
    console.warn('⚠️ Initializing fallback mode...');
    
    // Basic terminal without enterprise features
    try {
      const { TerminalPortfolio } = await import('./TerminalPortfolio.js');
      window.terminal = new TerminalPortfolio();
      
      // Basic mobile functions
      window.typeChar = this.typeChar.bind(this);
      window.typeCommand = this.typeCommand.bind(this);
      
      this.removeLoadingScreen();
      console.log('✅ Fallback mode active');
      
    } catch (error) {
      console.error('❌ Fallback mode failed:', error);
      this.showErrorScreen();
    }
  }

  shouldRedirectToMobile() {
    try {
      return DeviceDetector.shouldRedirectToMobile();
    } catch (error) {
      // Fallback mobile detection
      return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
             window.innerWidth < 768;
    }
  }

  initiateRedirect() {
    const loadingScreen = document.getElementById('enterprise-loading');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div>📱 Detectado dispositivo móvel</div>
        <div style="margin-top: 20px;">Redirecionando para versão móvel...</div>
      `;
    }
    
    setTimeout(() => {
      window.location.href = './mobile.html';
    }, 1000);
  }

  updateCSPNonce(nonce) {
    // Update placeholder nonces in the document
    const scripts = document.querySelectorAll('script[nonce="PLACEHOLDER_NONCE"]');
    scripts.forEach(script => {
      script.setAttribute('nonce', nonce);
    });
    
    // Update CSP meta tag
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      cspMeta.content = cspMeta.content.replace('PLACEHOLDER_NONCE', nonce);
    }
  }

  removeLoadingScreen() {
    const loadingScreen = document.getElementById('enterprise-loading');
    if (loadingScreen) {
      // Animate progress to completion
      const progressFill = loadingScreen.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = '100%';
      }
      
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 500);
      }, 800);
    }
  }

  showErrorScreen() {
    document.body.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #000; color: #ff4444; display: flex; flex-direction: column;
        justify-content: center; align-items: center; font-family: monospace;
        text-align: center; padding: 20px; box-sizing: border-box;
      ">
        <h1>❌ Enterprise System Error</h1>
        <p>Unable to initialize terminal portfolio.</p>
        <p>Please refresh the page or contact support.</p>
        <button onclick="location.reload()" style="
          margin-top: 20px; padding: 10px 20px; background: #333;
          color: #fff; border: 1px solid #666; cursor: pointer;
          font-family: monospace;
        ">
          🔄 Reload Application
        </button>
      </div>
    `;
  }

  setupEnterpriseEventListeners() {
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      if (window.analytics) {
        window.analytics.trackEvent('error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno
        });
      }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      if (window.analytics) {
        window.analytics.trackEvent('promise_rejection', {
          reason: event.reason?.toString()
        });
      }
    });

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (window.performanceMonitor) {
              window.performanceMonitor.recordMetric(entry.name, entry.duration, {
                entryType: entry.entryType
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  // Mobile keyboard functions
  typeChar(char) {
    const input = document.getElementById("commandInput");
    if (input) {
      input.value += char;
      input.focus();
      
      // Update cursor position
      if (window.terminal?.updateCursor) {
        window.terminal.updateCursor();
      }
    }
  }

  typeCommand(command) {
    const input = document.getElementById("commandInput");
    if (input) {
      input.value = command;
      input.focus();

      // Simulate Enter key press
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        bubbles: true
      });
      input.dispatchEvent(event);
    }
  }

  notifyServiceWorkerUpdate() {
    if (window.terminal) {
      window.terminal.addToOutput(
        '<span class="info">🔄 Nova versão disponível. Recarregue a página para atualizar.</span>',
        'system'
      );
    }
  }

  // Public API
  getModuleStatus() {
    const status = {};
    for (const [name, module] of this.modules) {
      status[name] = {
        loaded: !!module,
        healthy: typeof module.getStats === 'function' ? true : 'unknown'
      };
    }
    return status;
  }

  getPerformanceStats() {
    return {
      loadTime: this.performance.loadTime,
      criticalPath: this.performance.criticalPathComplete,
      modules: this.modules.size,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : 'not available'
    };
  }
}

// Initialize Enterprise Application
const enterpriseApp = new EnterpriseApp();

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", async () => {
  await enterpriseApp.initialize();
});

// Expose for debugging and mobile functions
window.enterpriseApp = enterpriseApp;

// Export for module system
export default enterpriseApp;
