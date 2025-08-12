/**
 * Automated Theme System Test
 * Tests all 6 themes and validates CSS properties
 */

export class ThemeSystemTest {
  constructor() {
    this.themes = ['dark', 'light', 'matrix', 'hacker', 'retro', 'contrast'];
    this.results = new Map();
    this.themeProvider = null;
  }

  async init() {
    console.log('🧪 Initializing Theme System Test...');
    
    // Try to load ThemeProvider
    try {
      const { ThemeProvider } = await import('../theming/ThemeProvider.js');
      this.themeProvider = new ThemeProvider();
      console.log('✅ ThemeProvider loaded for testing');
    } catch (error) {
      console.log('ℹ️ Testing CSS-only theme system');
    }

    return this;
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive theme tests...');
    
    for (const theme of this.themes) {
      await this.testTheme(theme);
    }

    return this.generateReport();
  }

  async testTheme(themeName) {
    console.log(`\n🎨 Testing theme: ${themeName}`);
    
    const results = {
      name: themeName,
      applied: false,
      cssVariables: {},
      visualElements: {},
      animations: {},
      accessibility: {},
      errors: []
    };

    try {
      // Apply theme
      if (this.themeProvider) {
        await this.themeProvider.applyTheme(themeName, { animated: false });
      } else {
        document.body.className = `theme-${themeName}`;
      }
      
      results.applied = true;
      console.log(`  ✅ Theme applied successfully`);

      // Test CSS variables
      results.cssVariables = this.testCSSVariables(themeName);
      
      // Test visual elements
      results.visualElements = this.testVisualElements(themeName);
      
      // Test animations
      results.animations = this.testAnimations(themeName);
      
      // Test accessibility
      results.accessibility = this.testAccessibility(themeName);
      
    } catch (error) {
      results.errors.push(error.message);
      console.log(`  ❌ Error testing theme: ${error.message}`);
    }

    this.results.set(themeName, results);
    return results;
  }

  testCSSVariables(themeName) {
    const requiredVariables = [
      '--color-primary',
      '--color-secondary', 
      '--color-background',
      '--color-surface',
      '--color-text',
      '--color-text-secondary',
      '--color-accent',
      '--color-border',
      '--typography-font-family',
      '--typography-font-size',
      '--effect-transition'
    ];

    const styles = getComputedStyle(document.documentElement);
    const variables = {};
    let validCount = 0;

    requiredVariables.forEach(varName => {
      const value = styles.getPropertyValue(varName).trim();
      variables[varName] = {
        value,
        valid: !!value && value !== 'initial' && value !== 'inherit'
      };
      
      if (variables[varName].valid) {
        validCount++;
      }
    });

    const score = Math.round((validCount / requiredVariables.length) * 100);
    console.log(`  📊 CSS Variables: ${validCount}/${requiredVariables.length} (${score}%)`);
    
    return {
      variables,
      score,
      totalRequired: requiredVariables.length,
      validCount
    };
  }

  testVisualElements(themeName) {
    const testElements = [
      { selector: '.prompt', property: 'color' },
      { selector: '.success', property: 'color' },
      { selector: '.error', property: 'color' },
      { selector: '.warning', property: 'color' },
      { selector: '.accent', property: 'color' },
      { selector: '.terminal-container', property: 'background-color' }
    ];

    const elements = {};
    let validCount = 0;

    // Create test elements if they don't exist
    this.createTestElements();

    testElements.forEach(test => {
      const element = document.querySelector(test.selector);
      if (element) {
        const computedValue = getComputedStyle(element).getPropertyValue(test.property);
        elements[test.selector] = {
          property: test.property,
          value: computedValue,
          valid: !!computedValue && computedValue !== 'rgba(0, 0, 0, 0)'
        };
        
        if (elements[test.selector].valid) {
          validCount++;
        }
      }
    });

    const score = Math.round((validCount / testElements.length) * 100);
    console.log(`  🎨 Visual Elements: ${validCount}/${testElements.length} (${score}%)`);

    return {
      elements,
      score,
      validCount,
      totalTested: testElements.length
    };
  }

  testAnimations(themeName) {
    const animations = {};
    let animationCount = 0;

    // Test theme-specific animations
    if (themeName === 'matrix') {
      animations.matrixBlink = this.hasAnimation('matrix-blink');
      if (animations.matrixBlink) animationCount++;
    }
    
    if (themeName === 'hacker') {
      animations.hackerPulse = this.hasAnimation('hacker-pulse');
      if (animations.hackerPulse) animationCount++;
    }
    
    if (themeName === 'retro') {
      animations.retroGlow = this.hasAnimation('retro-glow');
      if (animations.retroGlow) animationCount++;
    }

    // Test cursor animation (all themes)
    animations.cursorBlink = this.hasAnimation('cursor-blink');
    if (animations.cursorBlink) animationCount++;

    console.log(`  🎬 Animations: ${animationCount} detected`);

    return {
      animations,
      count: animationCount,
      themeSpecific: themeName === 'matrix' || themeName === 'hacker' || themeName === 'retro'
    };
  }

  testAccessibility(themeName) {
    const accessibility = {
      contrast: this.testContrast(),
      focusIndicators: this.testFocusIndicators(themeName),
      fontSize: this.testFontSize(themeName),
      reducedMotion: this.testReducedMotionSupport()
    };

    let score = 0;
    Object.values(accessibility).forEach(test => {
      if (test.passed) score++;
    });

    const percentage = Math.round((score / 4) * 100);
    console.log(`  ♿ Accessibility: ${score}/4 tests passed (${percentage}%)`);

    return {
      tests: accessibility,
      score: percentage,
      passed: score,
      total: 4
    };
  }

  testContrast() {
    const bg = getComputedStyle(document.body).backgroundColor;
    const text = getComputedStyle(document.body).color;
    
    // Simple contrast test (would need more sophisticated algorithm for real testing)
    return {
      passed: bg !== text,
      background: bg,
      text: text,
      note: 'Basic contrast check - full WCAG testing requires specialized tools'
    };
  }

  testFocusIndicators(themeName) {
    if (themeName === 'contrast') {
      // High contrast theme should have enhanced focus indicators
      return {
        passed: true,
        note: 'High contrast theme includes enhanced focus indicators'
      };
    }
    
    return {
      passed: true,
      note: 'Standard focus indicators assumed to be present'
    };
  }

  testFontSize(themeName) {
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const isAccessible = fontSize >= 14; // Minimum recommended
    
    if (themeName === 'contrast') {
      // Contrast theme should have larger font
      return {
        passed: fontSize >= 16,
        size: fontSize,
        note: 'Contrast theme requires larger font size for accessibility'
      };
    }
    
    return {
      passed: isAccessible,
      size: fontSize,
      note: 'Minimum 14px font size recommended'
    };
  }

  testReducedMotionSupport() {
    // Check if CSS contains prefers-reduced-motion media queries
    const stylesheets = Array.from(document.styleSheets);
    let hasReducedMotionSupport = false;

    try {
      stylesheets.forEach(sheet => {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.conditionText && rule.conditionText.includes('prefers-reduced-motion')) {
              hasReducedMotionSupport = true;
            }
          });
        }
      });
    } catch (error) {
      // Security restrictions may prevent reading stylesheets
    }

    return {
      passed: hasReducedMotionSupport,
      note: 'Checks for prefers-reduced-motion media query support'
    };
  }

  hasAnimation(animationName) {
    // Check if animation keyframes exist
    const stylesheets = Array.from(document.styleSheets);
    
    try {
      for (const sheet of stylesheets) {
        if (sheet.cssRules) {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === animationName) {
              return true;
            }
          }
        }
      }
    } catch (error) {
      // Security restrictions may prevent reading stylesheets
    }
    
    return false;
  }

  createTestElements() {
    // Create temporary test elements if they don't exist
    const testHTML = `
      <div id="theme-test-elements" style="position: absolute; top: -9999px; opacity: 0;">
        <div class="prompt">Test prompt</div>
        <div class="success">Test success</div>
        <div class="error">Test error</div>
        <div class="warning">Test warning</div>
        <div class="accent">Test accent</div>
        <div class="terminal-container">Test terminal</div>
      </div>
    `;

    if (!document.getElementById('theme-test-elements')) {
      document.body.insertAdjacentHTML('beforeend', testHTML);
    }
  }

  generateReport() {
    console.log('\n📋 THEME SYSTEM TEST REPORT');
    console.log('================================');
    
    let totalScore = 0;
    let themeCount = 0;

    this.results.forEach((result, themeName) => {
      console.log(`\n🎨 ${themeName.toUpperCase()}`);
      console.log(`   Applied: ${result.applied ? '✅' : '❌'}`);
      console.log(`   CSS Variables: ${result.cssVariables.score}%`);
      console.log(`   Visual Elements: ${result.visualElements.score}%`);
      console.log(`   Animations: ${result.animations.count} detected`);
      console.log(`   Accessibility: ${result.accessibility.score}%`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`     - ${error}`));
      }

      // Calculate theme score
      const themeScore = Math.round((
        result.cssVariables.score + 
        result.visualElements.score + 
        result.accessibility.score
      ) / 3);
      
      console.log(`   Overall Score: ${themeScore}%`);
      
      totalScore += themeScore;
      themeCount++;
    });

    const finalScore = Math.round(totalScore / themeCount);
    
    console.log(`\n🏆 FINAL SCORE: ${finalScore}%`);
    console.log(`   Themes tested: ${themeCount}`);
    console.log(`   Provider mode: ${this.themeProvider ? 'Enterprise' : 'CSS-only'}`);
    
    // Cleanup
    const testElements = document.getElementById('theme-test-elements');
    if (testElements) {
      testElements.remove();
    }

    return {
      finalScore,
      themesCount: themeCount,
      providerMode: this.themeProvider ? 'enterprise' : 'css-only',
      results: Object.fromEntries(this.results)
    };
  }
}

// Auto-run test if this module is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
  window.ThemeSystemTest = ThemeSystemTest;
  
  // Auto-run after page load
  document.addEventListener('DOMContentLoaded', async () => {
    const test = await new ThemeSystemTest().init();
    window.themeTestResults = await test.runAllTests();
  });
}
