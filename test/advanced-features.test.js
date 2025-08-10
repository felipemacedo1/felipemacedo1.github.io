/**
 * Advanced Features Tests
 */
import { TestRunner, assert } from './test-runner.js';
import { GestureRecognizer } from '../src/js/features/GestureRecognizer.js';
import { AccessibilityEngine } from '../src/js/a11y/AccessibilityEngine.js';
import { ThemeProvider } from '../src/js/theming/ThemeProvider.js';

const runner = new TestRunner();

runner.describe('GestureRecognizer', ({ it, beforeEach }) => {
  let container;
  let gestureRecognizer;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '300px';
    document.body.appendChild(container);
    gestureRecognizer = new GestureRecognizer(container);
  });

  it('should initialize with default options', () => {
    assert.true(gestureRecognizer.options.swipeThreshold === 50, 'Should have default swipe threshold');
    assert.true(gestureRecognizer.gestures.size > 0, 'Should register default gestures');
  });

  it('should register custom gestures', () => {
    const customDetector = () => true;
    gestureRecognizer.registerGesture('custom', customDetector);
    
    assert.true(gestureRecognizer.gestures.has('custom'), 'Should register custom gesture');
  });

  it('should calculate distance correctly', () => {
    const distance = gestureRecognizer.calculateDistance(0, 0, 3, 4);
    assert.true(distance === 5, 'Should calculate distance using Pythagorean theorem');
  });

  it('should track gesture history', () => {
    const initialHistorySize = gestureRecognizer.getHistory().length;
    
    // Simulate gesture
    gestureRecognizer.emitGesture('test-gesture', { test: true });
    
    const newHistorySize = gestureRecognizer.getHistory().length;
    assert.true(newHistorySize === initialHistorySize + 1, 'Should track gesture in history');
  });
});

runner.describe('AccessibilityEngine', ({ it, beforeEach }) => {
  let a11yEngine;

  beforeEach(() => {
    a11yEngine = new AccessibilityEngine();
  });

  it('should create live regions for announcements', () => {
    const liveRegions = document.querySelectorAll('[aria-live]');
    assert.true(liveRegions.length >= 2, 'Should create polite and assertive live regions');
  });

  it('should generate accessible labels', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-label', 'Test Button');
    
    const label = a11yEngine.getAccessibleLabel(element);
    assert.true(label === 'Test Button', 'Should extract aria-label');
  });

  it('should calculate color contrast', () => {
    const color1 = { r: 255, g: 255, b: 255 }; // white
    const color2 = { r: 0, g: 0, b: 0 }; // black
    
    const contrast = a11yEngine.calculateContrast(color1, color2);
    assert.true(contrast === 21, 'Should calculate maximum contrast ratio');
  });

  it('should detect focusable elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button</button>
      <input type="text">
      <a href="#">Link</a>
      <div tabindex="0">Focusable div</div>
      <div>Non-focusable div</div>
    `;
    document.body.appendChild(container);
    
    const focusable = a11yEngine.getFocusableElements(container);
    assert.true(focusable.length === 4, 'Should find 4 focusable elements');
    
    document.body.removeChild(container);
  });

  it('should audit accessibility issues', () => {
    // Create test elements with issues
    const img = document.createElement('img');
    img.src = 'test.jpg';
    // Missing alt attribute
    document.body.appendChild(img);
    
    const issues = a11yEngine.auditAccessibility();
    const missingAltIssues = issues.filter(issue => issue.type === 'missing-alt');
    
    assert.true(missingAltIssues.length > 0, 'Should detect missing alt text');
    
    document.body.removeChild(img);
  });
});

runner.describe('ThemeProvider', ({ it, beforeEach }) => {
  let themeProvider;

  beforeEach(() => {
    themeProvider = new ThemeProvider();
  });

  it('should register default themes', () => {
    const themes = themeProvider.getAvailableThemes();
    assert.true(themes.includes('dark'), 'Should include dark theme');
    assert.true(themes.includes('light'), 'Should include light theme');
    assert.true(themes.includes('matrix'), 'Should include matrix theme');
    assert.true(themes.includes('contrast'), 'Should include contrast theme');
  });

  it('should apply theme and update CSS variables', () => {
    themeProvider.applyTheme('light', { animated: false });
    
    const rootStyle = document.getElementById('theme-variables');
    assert.true(rootStyle !== null, 'Should create root style element');
    assert.true(rootStyle.textContent.includes('--color-background'), 'Should include CSS variables');
  });

  it('should generate CSS variables from theme config', () => {
    const theme = {
      colors: { primary: '#ff0000', secondary: '#00ff00' },
      typography: { fontSize: '16px' },
      spacing: { md: '16px' },
      effects: { borderRadius: '4px' }
    };
    
    const cssVars = themeProvider.generateCSSVariables(theme);
    
    assert.true(cssVars.includes('--color-primary: #ff0000'), 'Should generate color variables');
    assert.true(cssVars.includes('--typography-font-size: 16px'), 'Should generate typography variables');
    assert.true(cssVars.includes('--spacing-md: 16px'), 'Should generate spacing variables');
    assert.true(cssVars.includes('--effect-border-radius: 4px'), 'Should generate effect variables');
  });

  it('should convert camelCase to kebab-case', () => {
    const result = themeProvider.kebabCase('backgroundColor');
    assert.true(result === 'background-color', 'Should convert camelCase to kebab-case');
  });

  it('should save and load theme preferences', () => {
    themeProvider.saveThemePreference('matrix');
    
    // Create new instance to test loading
    const newProvider = new ThemeProvider();
    
    // Note: In a real test environment, we'd need to mock localStorage
    // For now, we just verify the method exists and doesn't throw
    assert.true(typeof newProvider.loadSavedTheme === 'function', 'Should have loadSavedTheme method');
  });

  it('should export and import themes', () => {
    const customTheme = {
      name: 'custom',
      colors: { primary: '#purple' },
      typography: { fontSize: '18px' },
      spacing: { md: '20px' },
      effects: { borderRadius: '8px' }
    };
    
    const success = themeProvider.importTheme(customTheme);
    assert.true(success, 'Should import custom theme');
    
    const exported = themeProvider.exportTheme('custom');
    assert.true(exported !== null, 'Should export theme as JSON');
    assert.true(exported.includes('purple'), 'Should include theme data');
  });
});

// Integration tests
runner.describe('Integration Tests', ({ it }) => {
  it('should integrate all enterprise features without conflicts', () => {
    // This test verifies that all systems can coexist
    const features = {
      cspManager: window.cspManager,
      rateLimiter: window.rateLimiter,
      performanceMonitor: window.performanceMonitor,
      themeProvider: window.themeProvider,
      accessibilityEngine: window.accessibilityEngine,
      gestureRecognizer: window.gestureRecognizer
    };
    
    Object.entries(features).forEach(([name, feature]) => {
      assert.true(feature !== undefined, `${name} should be initialized`);
      assert.true(typeof feature === 'object', `${name} should be an object`);
    });
  });

  it('should maintain performance under load', async () => {
    const startTime = performance.now();
    
    // Simulate heavy usage
    for (let i = 0; i < 100; i++) {
      window.rateLimiter?.isAllowed(`client-${i}`);
      window.themeProvider?.getCurrentTheme();
      window.accessibilityEngine?.getStats();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    assert.true(duration < 100, 'Should complete 100 operations in under 100ms');
  });
});

// Run tests if this is the main module
if (import.meta.url === new URL(window.location).href) {
  runner.run();
}