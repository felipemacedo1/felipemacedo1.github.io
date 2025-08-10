// Theme management
export class ThemeManager {
  constructor(terminal) {
    this.terminal = terminal;
    this._sessionTheme = null;
    this.currentTheme = this.loadTheme();
  }

  getCommands() {
    return {
      "theme dark": () => this.changeTheme("dark"),
      "theme light": () => this.changeTheme("light"),
      "theme matrix": () => this.changeTheme("matrix"),
      "theme hacker": () => this.changeTheme("hacker"),
      "theme retro": () => this.changeTheme("retro"),
      "theme contrast": () => this.changeTheme("contrast")
    };
  }

  changeTheme(theme) {
    const themes = {
      dark: "🌑 Escuro",
      light: "☀️ Claro",
      matrix: "🔢 Matrix",
      hacker: "🔴 Hacker",
      retro: "🟠 Retrô",
      contrast: "⚫ Alto Contraste",
    };

    this.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    this.saveTheme(theme);
    this.terminal.addToOutput(
      `<span class="success">🎨 Tema alterado para: ${
        themes[theme] || theme
      }</span>`, 'system'
    );

    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  }

  applyTheme() {
    document.body.className = `theme-${this.currentTheme}`;
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
}