// Simple Analytics System
export class Analytics {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('analytics') || '{"commands": {}, "sessions": 0}');
    this.sessionStart = Date.now();
    this.data.sessions++;
    this.save();
  }

  trackCommand(cmd) {
    this.data.commands[cmd] = (this.data.commands[cmd] || 0) + 1;
    this.save();
    
    // Track in Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'command_used', {
        command_name: cmd,
        session_count: this.data.sessions
      });
    }
  }

  getPopularCommands() {
    return Object.entries(this.data.commands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  save() {
    localStorage.setItem('analytics', JSON.stringify(this.data));
  }

  getStats() {
    return {
      totalCommands: Object.values(this.data.commands).reduce((a, b) => a + b, 0),
      uniqueCommands: Object.keys(this.data.commands).length,
      sessions: this.data.sessions,
      popular: this.getPopularCommands()
    };
  }
}