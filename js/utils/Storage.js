// Local storage utilities
export class Storage {
  static loadHistory() {
    try {
      return JSON.parse(localStorage.getItem("terminal-history") || "[]");
    } catch {
      return [];
    }
  }

  static saveHistory(history) {
    try {
      localStorage.setItem(
        "terminal-history",
        JSON.stringify(history.slice(-50))
      );
    } catch {}
  }

  static loadTheme() {
    return localStorage.getItem("terminal-theme") || "dark";
  }

  static saveTheme(theme) {
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch {}
  }
}