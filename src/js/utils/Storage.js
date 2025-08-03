// Local storage utilities
export class Storage {
  static loadHistory() {
    try {
      return JSON.parse(localStorage.getItem("terminal-history") || "[]");
    } catch (error) {
      console.warn('Failed to load terminal history:', error.message);
      return [];
    }
  }

  static saveHistory(history) {
    try {
      localStorage.setItem(
        "terminal-history",
        JSON.stringify(history.slice(-50))
      );
    } catch (error) {
      console.warn('Failed to save terminal history:', error.message);
    }
  }

  static loadTheme() {
    try {
      return localStorage.getItem("terminal-theme") || "dark";
    } catch (error) {
      console.warn('Failed to load theme:', error.message);
      return "dark";
    }
  }

  static saveTheme(theme) {
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch (error) {
      console.warn('Failed to save theme:', error.message);
    }
  }
}