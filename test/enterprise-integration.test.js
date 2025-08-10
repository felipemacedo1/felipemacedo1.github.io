/**
 * Enterprise Integration Tests
 * Validates critical enterprise features are properly integrated
 */

class EnterpriseTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Running Enterprise Integration Tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.testFn();
        this.results.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ test: test.name, error });
        console.error(`❌ ${test.name}: ${error.message}`);
      }
    }

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total: ${this.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log('\n🔍 Failures:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error.message}`);
      });
    }
  }

  // Assertion helpers
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertExists(obj, message) {
    if (obj == null) {
      throw new Error(message || 'Object does not exist');
    }
  }

  assertInstanceOf(obj, constructor, message) {
    if (!(obj instanceof constructor)) {
      throw new Error(message || `Object is not instance of ${constructor.name}`);
    }
  }
}

// Test Suite
const testRunner = new EnterpriseTestRunner();

// Test 1: Security Layer
testRunner.addTest('CSP Manager Initialization', async () => {
  testRunner.assertExists(window.cspManager, 'CSPManager not initialized');
  testRunner.assert(
    typeof window.cspManager.getNonce === 'function',
    'CSPManager missing getNonce method'
  );
  testRunner.assert(
    window.cspManager.getNonce().length > 0,
    'CSP nonce not generated'
  );
});

// Test 2: Rate Limiter
testRunner.addTest('Rate Limiter Functionality', async () => {
  testRunner.assertExists(window.rateLimiter, 'RateLimiter not initialized');
  
  const result = window.rateLimiter.isAllowed('test-client');
  testRunner.assert(result.allowed, 'Rate limiter should allow initial request');
  testRunner.assert(typeof result.remaining === 'number', 'Rate limiter missing remaining count');
});

// Test 3: Performance Monitor
testRunner.addTest('Performance Monitor Active', async () => {
  testRunner.assertExists(window.performanceMonitor, 'PerformanceMonitor not initialized');
  
  // Test metric recording
  window.performanceMonitor.recordMetric('test-metric', 100, { test: true });
  
  const stats = window.performanceMonitor.getAllMetrics();
  testRunner.assert(
    Object.keys(stats).length > 0,
    'Performance monitor not recording metrics'
  );
});

// Test 4: Accessibility Engine
testRunner.addTest('Accessibility Engine Integration', async () => {
  testRunner.assertExists(window.accessibilityEngine, 'AccessibilityEngine not initialized');
  
  // Check if skip links are created
  const skipLinks = document.querySelector('.skip-links');
  testRunner.assertExists(skipLinks, 'Skip links not created');
  
  // Check ARIA attributes on terminal
  const terminal = document.getElementById('terminal');
  testRunner.assert(
    terminal?.getAttribute('role') === 'main',
    'Terminal missing proper ARIA role'
  );
});

// Test 5: Theme Provider
testRunner.addTest('Theme Provider System', async () => {
  testRunner.assertExists(window.themeProvider, 'ThemeProvider not initialized');
  
  const currentTheme = window.themeProvider.getCurrentTheme();
  testRunner.assert(currentTheme.name, 'No current theme set');
  
  const availableThemes = window.themeProvider.getAvailableThemes();
  testRunner.assert(availableThemes.length > 0, 'No themes available');
});

// Test 6: Gesture Recognition
testRunner.addTest('Gesture Recognition System', async () => {
  testRunner.assertExists(window.gestureRecognizer, 'GestureRecognizer not initialized');
  
  testRunner.assert(
    typeof window.gestureRecognizer.on === 'function',
    'Gesture recognizer missing event system'
  );
});

// Test 7: State Management
testRunner.addTest('State Manager Integration', async () => {
  testRunner.assertExists(window.stateManager, 'StateManager not initialized');
  
  const state = window.stateManager.getState();
  testRunner.assert(state.app, 'App state not initialized');
  testRunner.assertEqual(state.app.version, '2.0.0-enterprise', 'Wrong app version');
});

// Test 8: Event Store
testRunner.addTest('Event Store System', async () => {
  testRunner.assertExists(window.eventStore, 'EventStore not initialized');
  
  // Test event publishing
  await window.eventStore.publish('test-event', { message: 'test' });
  
  const events = window.eventStore.getMemoryEvents({ type: 'test-event' });
  testRunner.assert(events.length > 0, 'Event store not recording events');
});

// Test 9: Resource Preloader
testRunner.addTest('Resource Preloader Active', async () => {
  testRunner.assertExists(window.resourcePreloader, 'ResourcePreloader not initialized');
  
  const stats = window.resourcePreloader.getStats();
  testRunner.assertExists(stats, 'Resource preloader stats unavailable');
});

// Test 10: Analytics System
testRunner.addTest('Enhanced Analytics System', async () => {
  testRunner.assertExists(window.analytics, 'Analytics not initialized');
  
  // Test event tracking
  window.analytics.trackEvent('test-event', { test: true });
  
  const stats = window.analytics.getStats();
  testRunner.assert(stats.totalEvents >= 1, 'Analytics not tracking events');
});

// Test 11: Terminal Integration
testRunner.addTest('Terminal Enterprise Features', async () => {
  testRunner.assertExists(window.terminal, 'Terminal not initialized');
  
  // Check enterprise indicators
  const enterpriseStatus = document.getElementById('enterprise-status');
  testRunner.assertExists(enterpriseStatus, 'Enterprise status indicators missing');
  
  // Check security status
  const securityStatus = document.getElementById('security-status');
  testRunner.assertExists(securityStatus, 'Security status indicator missing');
});

// Test 12: Module Federation
testRunner.addTest('Module Federation System', async () => {
  testRunner.assertExists(window.moduleFederation, 'ModuleFederation not initialized');
  
  testRunner.assert(
    typeof window.moduleFederation.registerModule === 'function',
    'Module federation missing registration method'
  );
});

// Test 13: Enterprise App Status
testRunner.addTest('Enterprise App Integration', async () => {
  testRunner.assertExists(window.enterpriseApp, 'EnterpriseApp not exposed');
  
  const moduleStatus = window.enterpriseApp.getModuleStatus();
  testRunner.assert(
    Object.keys(moduleStatus).length > 0,
    'No enterprise modules loaded'
  );
  
  const performanceStats = window.enterpriseApp.getPerformanceStats();
  testRunner.assert(
    performanceStats.loadTime > 0,
    'Performance stats not recorded'
  );
});

// Test 14: Security Headers Validation
testRunner.addTest('Security Headers Present', async () => {
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  testRunner.assertExists(cspMeta, 'CSP meta tag missing');
  
  const xssProtection = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
  testRunner.assertExists(xssProtection, 'XSS protection header missing');
  
  const noSniff = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
  testRunner.assertExists(noSniff, 'X-Content-Type-Options header missing');
});

// Test 15: Performance Optimization
testRunner.addTest('Performance Optimizations Active', async () => {
  // Check if loading screen was properly removed
  const loadingScreen = document.getElementById('enterprise-loading');
  testRunner.assert(!loadingScreen, 'Loading screen should be removed');
  
  // Check for preload hints
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  testRunner.assert(preloadLinks.length > 0, 'No preload hints found');
  
  // Check for DNS prefetch
  const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
  testRunner.assert(dnsPrefetch.length > 0, 'No DNS prefetch hints found');
});

// Export for browser console use
window.runEnterpriseTests = () => testRunner.runTests();

// Auto-run tests if in test mode
if (window.location.search.includes('test=enterprise')) {
  // Wait for full initialization
  setTimeout(() => testRunner.runTests(), 3000);
}

export { testRunner, EnterpriseTestRunner };
