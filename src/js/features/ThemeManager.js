// Theme management
export class ThemeManager {
  constructor(terminal) {
    this.terminal = terminal;
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

  loadTheme() {
    return localStorage.getItem("terminal-theme") || "dark";
  }

  saveTheme(theme) {
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch {}
  }
}