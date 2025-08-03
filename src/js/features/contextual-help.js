// Contextual Help System for Terminal Portfolio
export class ContextualHelp {
  constructor() {
    this.helpTips = new Map();
    this.userProgress = this.loadProgress();
    this.init();
  }

  init() {
    this.setupHelpTips();
    this.showWelcomeGuide();
  }

  setupHelpTips() {
    this.helpTips.set('first-visit', {
      trigger: 'onLoad',
      message: '💡 Digite "help" para ver todos os comandos disponíveis',
      duration: 5000
    });

    this.helpTips.set('command-discovery', {
      trigger: 'afterCommand',
      message: '🎯 Experimente "projects" para ver meu portfólio',
      condition: (cmd) => cmd === 'about'
    });
  }

  showTooltip(message, duration = 3000) {
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        ${message}
        <button class="tooltip-close">×</button>
      </div>
    `;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      tooltip.remove();
    }, duration);
  }

  trackProgress(command) {
    if (!this.userProgress.discoveredCommands.includes(command)) {
      this.userProgress.discoveredCommands.push(command);
      this.saveProgress();
      this.checkAchievements();
    }
  }

  checkAchievements() {
    const discovered = this.userProgress.discoveredCommands.length;
    
    if (discovered === 5) {
      this.showTooltip('🏆 Explorer! Você descobriu 5 comandos!');
    } else if (discovered === 10) {
      this.showTooltip('🎖️ Expert! 10 comandos descobertos!');
    }
  }

  loadProgress() {
    return JSON.parse(localStorage.getItem('terminal-progress') || '{"discoveredCommands": []}');
  }

  saveProgress() {
    localStorage.setItem('terminal-progress', JSON.stringify(this.userProgress));
  }
}