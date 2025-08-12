// Theme management
export class ThemeManager {
  constructor(terminal) {
    this.terminal = terminal;
    this._sessionTheme = null;
    this.currentTheme = this.loadTheme();
    
    // Check if ThemeProvider is available (enterprise mode)
    this.themeProvider = window.themeProvider || null;
  }

  getCommands() {
    return {
      "theme dark": () => this.changeTheme("dark"),
      "theme light": () => this.changeTheme("light"),
      "theme matrix": () => this.changeTheme("matrix"),
      "theme hacker": () => this.changeTheme("hacker"),
      "theme retro": () => this.changeTheme("retro"),
      "theme contrast": () => this.changeTheme("contrast"),
      "themes": () => this.listThemes(),
      "theme preview": () => this.previewThemes(),
      "theme test": () => this.testAllThemes(),
      // Accepts arg: theme <name>
      "theme": (args = []) => {
        const name = (args[0] || '').toLowerCase();
        if (name) {
          return this.changeTheme(name);
        }
        return this.showCurrentTheme();
      }
    };
  }

  async changeTheme(theme) {
    const themes = {
      dark: "🌑 Escuro",
      light: "☀️ Claro",
      matrix: "🔢 Matrix",
      hacker: "🔴 Hacker",
      retro: "🟠 Retrô",
      contrast: "⚫ Alto Contraste",
    };

    try {
      this.currentTheme = theme;

      // Always update body class so themes.css rules apply
      this.updateBodyThemeClass(theme);
      
      // Use ThemeProvider to set CSS variables and runtime styles
      if (this.themeProvider) {
        await this.themeProvider.applyTheme(theme, { animated: true });
      } else {
        // Fallback to CSS classes (standard mode)
        const body = document.body;
        // Remove any existing theme- classes
        body.classList.forEach(c => { if (c.startsWith('theme-')) body.classList.remove(c); });
        body.classList.add(`theme-${theme}`);
        this.addTransitionEffect();
      }
      
      this.saveTheme(theme);
      
      this.terminal.addToOutput(
        `<span class="success">🎨 Tema alterado para: ${
          themes[theme] || theme
        }</span>`, 'system'
      );
      
      // Analytics tracking if available
      if (window.analytics) {
        window.analytics.trackEvent('theme_changed', { 
          theme, 
          provider: this.themeProvider ? 'enterprise' : 'standard' 
        });
      }
      
    } catch (error) {
      console.error('Failed to change theme:', error);
      this.terminal.addToOutput(
        `<span class="error">❌ Erro ao alterar tema: ${error.message}</span>`, 'system'
      );
    }
  }

  updateBodyThemeClass(theme) {
    const body = document.body;
    if (!body) return;

    // Remove any existing theme-* classes
    body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) body.classList.remove(cls);
    });
    
    // Add the new theme class
    body.classList.add(`theme-${theme}`);
  }

  addTransitionEffect() {
    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  }

  listThemes() {
    const themes = [
      "🌑 <span class='success'>dark</span> - Tema escuro padrão",
      "☀️ <span class='success'>light</span> - Tema claro",  
      "🔢 <span class='success'>matrix</span> - Estilo Matrix verde",
      "🔴 <span class='success'>hacker</span> - Terminal hacker vermelho",
      "🟠 <span class='success'>retro</span> - Terminal retrô âmbar",
      "⚫ <span class='success'>contrast</span> - Alto contraste (acessibilidade)"
    ];

    this.terminal.addToOutput(
      '<span class="highlight">🎨 Temas Disponíveis:</span>', 'system'
    );
    
    themes.forEach(theme => {
      this.terminal.addToOutput(`  ${theme}`, 'system');
    });
    
    this.terminal.addToOutput(
      `<span class="secondary">Use: theme [nome] para alterar</span>`, 'system'
    );
    this.terminal.addToOutput(
      `<span class="secondary">Tema atual: <span class="success">${this.currentTheme}</span></span>`, 'system'
    );
  }

  showCurrentTheme() {
    const themes = {
      dark: "🌑 Escuro",
      light: "☀️ Claro",
      matrix: "🔢 Matrix",
      hacker: "🔴 Hacker", 
      retro: "🟠 Retrô",
      contrast: "⚫ Alto Contraste",
    };

    this.terminal.addToOutput(
      `<span class="highlight">🎨 Tema atual: ${themes[this.currentTheme] || this.currentTheme}</span>`, 'system'
    );
    
    if (this.themeProvider) {
      const stats = this.themeProvider.getStats();
      this.terminal.addToOutput(
        `<span class="secondary">Modo: Enterprise (${stats.availableThemes} temas)</span>`, 'system'
      );
    } else {
      this.terminal.addToOutput(
        `<span class="secondary">Modo: Standard (CSS)</span>`, 'system'
      );
    }
  }

  applyTheme() {
    // Ensure initial class is applied for CSS selectors
    this.updateBodyThemeClass(this.currentTheme);

    if (this.themeProvider) {
      // ThemeProvider handles CSS variables and injected rules
      this.themeProvider.applyTheme(this.currentTheme, { animated: false });
    } else {
      // Fallback already applied via class
      this.addTransitionEffect();
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error.message);
      // Fallback: store in memory for session
      this._sessionTheme = theme;
    }
  }

  loadTheme() {
    try {
      return localStorage.getItem("terminal-theme") || this._sessionTheme || "dark";
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error.message);
      return this._sessionTheme || "dark";
    }
  }

  previewThemes() {
    if (!this.themeProvider) {
      this.terminal.addToOutput(
        `<span class="warning">⚠️ Preview de temas requer o ThemeProvider (modo enterprise)</span>`, 'system'
      );
      return this.listThemes();
    }

    this.terminal.addToOutput(
      '<span class="highlight">🎨 Preview dos Temas:</span>', 'system'
    );

    const themes = ['dark', 'light', 'matrix', 'hacker', 'retro', 'contrast'];
    
    themes.forEach(themeName => {
      const preview = this.themeProvider.getThemePreview(themeName);
      if (preview) {
        const colorSample = `
          <div style="
            display: inline-block; 
            background: ${preview.preview.background}; 
            color: ${preview.preview.text}; 
            border: 1px solid ${preview.preview.primary};
            padding: 4px 8px; 
            margin: 2px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
          ">
            ${preview.name}: ${preview.preview.text} on ${preview.preview.background}
          </div>
        `;
        this.terminal.addToOutput(`  ${colorSample}`, 'system');
      }
    });

    this.terminal.addToOutput(
      `<span class="secondary">Use: theme [nome] para aplicar</span>`, 'system'
    );
  }

  async testAllThemes() {
    if (!this.themeProvider) {
      this.terminal.addToOutput(
        `<span class="warning">⚠️ Teste automático requer o ThemeProvider (modo enterprise)</span>`, 'system'
      );
      return;
    }

    this.terminal.addToOutput(
      '<span class="highlight">🧪 Testando todos os temas (3s cada)...</span>', 'system'
    );

    const originalTheme = this.currentTheme;
    const themes = ['dark', 'light', 'matrix', 'hacker', 'retro', 'contrast'];
    
    for (const theme of themes) {
      this.terminal.addToOutput(
        `<span class="success">Testando tema: ${theme}</span>`, 'system'
      );
      
      try {
        await this.themeProvider.applyTheme(theme, { animated: true });
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        this.terminal.addToOutput(
          `<span class="error">❌ Erro no tema ${theme}: ${error.message}</span>`, 'system'
        );
      }
    }

    // Restore original theme
    this.terminal.addToOutput(
      `<span class="success">✅ Teste completo! Restaurando tema original: ${originalTheme}</span>`, 'system'
    );
    
    await this.themeProvider.applyTheme(originalTheme, { animated: true });
    this.currentTheme = originalTheme;
  }
}