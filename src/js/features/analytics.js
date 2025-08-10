// Simple Analytics System
export class Analytics {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('analytics') || '{"commands": {}, "events": {}, "sessions": 0}');
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

  trackEvent(eventName, eventData = {}) {
    // Initialize event type if not exists
    if (!this.data.events[eventName]) {
      this.data.events[eventName] = [];
    }
    
    // Add event with timestamp
    this.data.events[eventName].push({
      timestamp: Date.now(),
      data: eventData,
      session: this.data.sessions
    });
    
    // Limit event history to prevent storage bloat
    if (this.data.events[eventName].length > 100) {
      this.data.events[eventName] = this.data.events[eventName].slice(-50);
    }
    
    this.save();
    
    // Track in Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...eventData,
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
    try {
      localStorage.setItem('analytics', JSON.stringify(this.data));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  getStats() {
    return {
      totalCommands: Object.values(this.data.commands).reduce((a, b) => a + b, 0),
      uniqueCommands: Object.keys(this.data.commands).length,
      totalEvents: Object.values(this.data.events).flat().length,
      eventTypes: Object.keys(this.data.events).length,
      sessions: this.data.sessions,
      popular: this.getPopularCommands()
    };
  }

  getEventHistory(eventName) {
    return this.data.events[eventName] || [];
  }

  clearData() {
    this.data = { commands: {}, events: {}, sessions: 1 };
    this.save();
  }
}