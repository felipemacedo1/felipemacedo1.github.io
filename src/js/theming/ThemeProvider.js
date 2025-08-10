/**
 * Enterprise Theme System (CSS-in-JS)
 * Runtime style injection with CSSStyleSheet API
 */
export class ThemeProvider {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'dark';
    this.styleSheets = new Map();
    this.transitions = new Map();
    this.customProperties = new Map();
    
    this.init();
  }

  init() {
    this.registerDefaultThemes();
    this.setupCSSVariables();
    this.loadSavedTheme();
  }

  registerDefaultThemes() {
    // Dark theme (default)
    this.registerTheme('dark', {
      colors: {
        primary: '#00ff00',
        secondary: '#00cc00',
        background: '#000000',
        surface: '#111111',
        text: '#ffffff',
        textSecondary: '#cccccc',
        accent: '#ff6b6b',
        warning: '#ffa500',
        error: '#ff4444',
        success: '#00ff00',
        border: '#333333'
      },
      typography: {
        fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        fontWeight: '400'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      effects: {
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 255, 0, 0.1)',
        transition: 'all 0.3s ease',
        blur: '4px'
      }
    });

    // Light theme
    this.registerTheme('light', {
      colors: {
        primary: '#007acc',
        secondary: '#0066aa',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#333333',
        textSecondary: '#666666',
        accent: '#e74c3c',
        warning: '#f39c12',
        error: '#e74c3c',
        success: '#27ae60',
        border: '#e1e8ed'
      },
      typography: {
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", monospace',
        fontSize: '14px',
        lineHeight: '1.6',
        fontWeight: '400'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      effects: {
        borderRadius: '6px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        blur: '4px'
      }
    });

    // Matrix theme
    this.registerTheme('matrix', {
      colors: {
        primary: '#00ff41',
        secondary: '#008f11',
        background: '#0d1117',
        surface: '#161b22',
        text: '#00ff41',
        textSecondary: '#7d8590',
        accent: '#ff6b6b',
        warning: '#ffa500',
        error: '#ff4444',
        success: '#00ff41',
        border: '#30363d'
      },
      typography: {
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        fontWeight: '400'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      effects: {
        borderRadius: '0px',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
        transition: 'all 0.2s ease',
        blur: '2px'
      }
    });

    // High contrast theme (accessibility)
    this.registerTheme('contrast', {
      colors: {
        primary: '#ffffff',
        secondary: '#ffff00',
        background: '#000000',
        surface: '#000000',
        text: '#ffffff',
        textSecondary: '#ffff00',
        accent: '#ff00ff',
        warning: '#ffff00',
        error: '#ff0000',
        success: '#00ff00',
        border: '#ffffff'
      },
      typography: {
        fontFamily: '"Arial", sans-serif',
        fontSize: '16px',
        lineHeight: '1.8',
        fontWeight: '700'
      },
      spacing: {
        xs: '6px',
        sm: '12px',
        md: '20px',
        lg: '28px',
        xl: '36px'
      },
      effects: {
        borderRadius: '0px',
        boxShadow: '0 0 0 2px #ffffff',
        transition: 'none',
        blur: '0px'
      }
    });
  }

  registerTheme(name, config) {
    this.themes.set(name, {
      name,
      ...config,
      timestamp: Date.now()
    });
  }

  setupCSSVariables() {
    // Create root style element for CSS custom properties
    this.rootStyle = document.createElement('style');
    this.rootStyle.id = 'theme-variables';
    document.head.appendChild(this.rootStyle);
  }

  async applyTheme(themeName, options = {}) {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;

    // Apply with transition if requested
    if (options.animated !== false) {
      await this.applyThemeWithTransition(theme, previousTheme);
    } else {
      this.applyThemeImmediate(theme);
    }

    // Save theme preference
    this.saveThemePreference(themeName);

    // Emit theme change event
    this.emitThemeChange(themeName, previousTheme);
  }

  applyThemeImmediate(theme) {
    // Generate CSS custom properties
    const cssVariables = this.generateCSSVariables(theme);
    
    // Update root style
    this.rootStyle.textContent = `:root { ${cssVariables} }`;

    // Apply theme-specific styles
    this.applyThemeStyles(theme);
  }

  async applyThemeWithTransition(theme, previousTheme) {
    // Create transition overlay
    const overlay = this.createTransitionOverlay();
    document.body.appendChild(overlay);

    // Fade out
    overlay.style.opacity = '1';
    await this.wait(150);

    // Apply theme
    this.applyThemeImmediate(theme);

    // Fade in
    overlay.style.opacity = '0';
    await this.wait(150);

    // Remove overlay
    document.body.removeChild(overlay);
  }

  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--color-background, #000);
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 9999;
      pointer-events: none;
    `;
    return overlay;
  }

  generateCSSVariables(theme) {
    const variables = [];

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables.push(`--color-${this.kebabCase(key)}: ${value}`);
    });

    // Typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      variables.push(`--typography-${this.kebabCase(key)}: ${value}`);
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables.push(`--spacing-${key}: ${value}`);
    });

    // Effects
    Object.entries(theme.effects).forEach(([key, value]) => {
      variables.push(`--effect-${this.kebabCase(key)}: ${value}`);
    });

    return variables.join(';\n  ') + ';';
  }

  applyThemeStyles(theme) {
    // Get or create theme stylesheet
    let styleSheet = this.styleSheets.get(theme.name);
    
    if (!styleSheet) {
      styleSheet = this.createStyleSheet(theme.name);
      this.styleSheets.set(theme.name, styleSheet);
    }

    // Clear existing rules
    while (styleSheet.cssRules.length > 0) {
      styleSheet.deleteRule(0);
    }

    // Add theme-specific rules
    this.addThemeRules(styleSheet, theme);
  }

  createStyleSheet(themeName) {
    const style = document.createElement('style');
    style.id = `theme-${themeName}`;
    document.head.appendChild(style);
    
    return style.sheet;
  }

  addThemeRules(styleSheet, theme) {
    // Terminal-specific styles
    const rules = [
      {
        selector: '.terminal-container',
        styles: {
          'background-color': 'var(--color-background)',
          'color': 'var(--color-text)',
          'font-family': 'var(--typography-font-family)',
          'font-size': 'var(--typography-font-size)',
          'line-height': 'var(--typography-line-height)',
          'border-radius': 'var(--effect-border-radius)',
          'box-shadow': 'var(--effect-box-shadow)',
          'transition': 'var(--effect-transition)'
        }
      },
      {
        selector: '.terminal-header',
        styles: {
          'background-color': 'var(--color-surface)',
          'border-bottom': '1px solid var(--color-border)'
        }
      },
      {
        selector: '.prompt',
        styles: {
          'color': 'var(--color-primary)'
        }
      },
      {
        selector: '.success',
        styles: {
          'color': 'var(--color-success)'
        }
      },
      {
        selector: '.error',
        styles: {
          'color': 'var(--color-error)'
        }
      },
      {
        selector: '.warning',
        styles: {
          'color': 'var(--color-warning)'
        }
      },
      {
        selector: '.highlight',
        styles: {
          'color': 'var(--color-accent)',
          'font-weight': 'bold'
        }
      }
    ];

    // Add theme-specific customizations
    if (theme.name === 'matrix') {
      rules.push({
        selector: '.cursor',
        styles: {
          'animation': 'matrix-blink 1s infinite',
          'text-shadow': '0 0 10px var(--color-primary)'
        }
      });
    }

    if (theme.name === 'contrast') {
      rules.push({
        selector: '*:focus',
        styles: {
          'outline': '3px solid var(--color-primary)',
          'outline-offset': '2px'
        }
      });
    }

    // Insert rules into stylesheet
    rules.forEach(rule => {
      const cssText = `${rule.selector} { ${this.stylesToCSS(rule.styles)} }`;
      try {
        styleSheet.insertRule(cssText, styleSheet.cssRules.length);
      } catch (error) {
        console.warn('Failed to insert CSS rule:', cssText, error);
      }
    });

    // Add keyframes if needed
    if (theme.name === 'matrix') {
      const keyframes = `
        @keyframes matrix-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `;
      try {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      } catch (error) {
        console.warn('Failed to insert keyframes:', error);
      }
    }
  }

  stylesToCSS(styles) {
    return Object.entries(styles)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }

  // Theme management
  getTheme(name) {
    return this.themes.get(name);
  }

  getCurrentTheme() {
    return this.getTheme(this.currentTheme);
  }

  getAvailableThemes() {
    return Array.from(this.themes.keys());
  }

  getThemePreview(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return null;

    return {
      name: theme.name,
      colors: theme.colors,
      preview: {
        background: theme.colors.background,
        text: theme.colors.text,
        primary: theme.colors.primary
      }
    };
  }

  // Custom properties
  setCustomProperty(name, value) {
    this.customProperties.set(name, value);
    document.documentElement.style.setProperty(`--custom-${name}`, value);
  }

  getCustomProperty(name) {
    return this.customProperties.get(name);
  }

  // Persistence
  saveThemePreference(themeName) {
    try {
      localStorage.setItem('terminal-theme', themeName);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  loadSavedTheme() {
    try {
      const saved = localStorage.getItem('terminal-theme');
      if (saved && this.themes.has(saved)) {
        this.applyTheme(saved, { animated: false });
      } else {
        this.applyTheme('dark', { animated: false });
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
      this.applyTheme('dark', { animated: false });
    }
  }

  // Utilities
  kebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  emitThemeChange(newTheme, previousTheme) {
    const event = new CustomEvent('theme-changed', {
      detail: {
        newTheme,
        previousTheme,
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
  }

  // Public API
  getStats() {
    return {
      currentTheme: this.currentTheme,
      availableThemes: this.themes.size,
      customProperties: this.customProperties.size,
      activeStyleSheets: this.styleSheets.size
    };
  }

  exportTheme(themeName) {
    const theme = this.themes.get(themeName);
    if (!theme) return null;

    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeData) {
    try {
      const theme = typeof themeData === 'string' ? JSON.parse(themeData) : themeData;
      this.registerTheme(theme.name, theme);
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  destroy() {
    // Remove all stylesheets
    this.styleSheets.forEach((sheet, name) => {
      const element = document.getElementById(`theme-${name}`);
      if (element) {
        element.remove();
      }
    });

    // Remove root style
    if (this.rootStyle) {
      this.rootStyle.remove();
    }

    // Clear maps
    this.themes.clear();
    this.styleSheets.clear();
    this.customProperties.clear();
  }
}