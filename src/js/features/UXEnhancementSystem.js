// Enhanced UX System - Status Bar and Notifications
export class UXEnhancementSystem {
  constructor(terminal = null) {
    this.terminal = terminal;
    this.statusBar = null;
    this.commandsDiscovered = this.loadDiscoveredCommands();
    this.sessionCommands = [];
    this.totalCommands = 35; // Estimated total
    this.notifications = [];
    this.init();
  }

  init() {
    // Defer terminal-dependent initialization
    if (this.terminal) {
      this.createStatusBar();
    } else {
      // Wait for terminal to be available
      this.waitForTerminal();
    }
    
    this.loadUXStyles();
    this.updateProgress();
    
    // Show status bar after a delay
    setTimeout(() => {
      if (this.statusBar) {
        this.statusBar.classList.add('show');
      }
    }, 2000);
  }

  waitForTerminal() {
    // Poll for terminal availability
    const checkTerminal = () => {
      if (window.terminal) {
        this.terminal = window.terminal;
        this.createStatusBar();
      } else {
        setTimeout(checkTerminal, 100);
      }
    };
    checkTerminal();
  }

  loadUXStyles() {
    // Load UX enhancement styles if not already loaded
    if (!document.getElementById('ux-enhancements-css')) {
      const link = document.createElement('link');
      link.id = 'ux-enhancements-css';
      link.rel = 'stylesheet';
      link.href = 'src/css/ux-enhancements.css';
      document.head.appendChild(link);
    }
  }

  createStatusBar() {
    // Check if status bar already exists
    if (document.getElementById('terminalStatusBar')) return;

    this.statusBar = document.createElement('div');
    this.statusBar.id = 'terminalStatusBar';
    this.statusBar.className = 'terminal-status-bar';
    
    this.statusBar.innerHTML = `
      <div class="status-section">
        <div class="status-item">
          <span>📊</span>
          <span id="commandProgress">${this.commandsDiscovered.length}/${this.totalCommands}</span>
        </div>
        <div class="status-item">
          <div class="status-progress">
            <div class="status-progress-fill" id="progressFill"></div>
          </div>
        </div>
        <div class="status-item">
          <span id="statusLevel">Explorer</span>
        </div>
      </div>
      <div class="status-section">
        <div class="status-tip" id="statusTip">
          💡 Digite 'popular' para comandos úteis
        </div>
      </div>
    `;

    document.body.appendChild(this.statusBar);
    this.updateStatusBar();
  }

  updateStatusBar() {
    if (!this.statusBar) return;

    const discovered = this.commandsDiscovered.length;
    const progressPercent = Math.min((discovered / this.totalCommands) * 100, 100);
    
    // Update progress display
    const progressElement = document.getElementById('commandProgress');
    const progressFill = document.getElementById('progressFill');
    const statusLevel = document.getElementById('statusLevel');
    const statusTip = document.getElementById('statusTip');

    if (progressElement) progressElement.textContent = `${discovered}/${this.totalCommands}`;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    // Update level and tip based on progress
    const level = this.getProgressLevel(discovered);
    if (statusLevel) statusLevel.textContent = level.title;
    if (statusTip) statusTip.textContent = level.tip;
  }

  getProgressLevel(discovered) {
    if (discovered < 3) {
      return {
        title: '🌱 Novato',
        tip: `💡 Digite 'start' para tour guiado`
      };
    } else if (discovered < 8) {
      return {
        title: '🔍 Explorer',
        tip: `💡 Digite 'popular' para comandos úteis`
      };
    } else if (discovered < 15) {
      return {
        title: '⚡ Avançado',
        tip: `💡 Digite 'help fun' para easter eggs`
      };
    } else if (discovered < 25) {
      return {
        title: '🏆 Expert',
        tip: `💡 Digite 'random' para comandos ocultos`
      };
    } else {
      return {
        title: '💎 Master',
        tip: `🎉 Você dominou este terminal!`
      };
    }
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `command-notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  showAchievement(title, description) {
    const achievement = `
      <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 11px; opacity: 0.9;">${description}</div>
    `;
    this.showNotification(achievement, 'achievement', 4000);
  }

  trackCommandDiscovery(command) {
    // Track newly discovered commands
    if (!this.commandsDiscovered.includes(command)) {
      this.commandsDiscovered.push(command);
      this.saveDiscoveredCommands();
      this.updateStatusBar();
      
      // Show discovery notification
      this.showNotification(`✨ Comando descoberto: <strong>${command}</strong>`, 'success', 2000);
      
      // Check for achievements
      this.checkAchievements();
    }

    // Track session commands
    if (!this.sessionCommands.includes(command)) {
      this.sessionCommands.push(command);
    }
  }

  checkAchievements() {
    const count = this.commandsDiscovered.length;
    
    const achievements = [
      { count: 1, title: '🎉 Primeiro Passo!', desc: 'Executou seu primeiro comando' },
      { count: 3, title: '🔍 Explorer', desc: 'Descobriu 3 comandos diferentes' },
      { count: 5, title: '⚡ Investigador', desc: 'Descobriu 5 comandos diferentes' },
      { count: 10, title: '🏆 Expert', desc: 'Descobriu 10 comandos diferentes' },
      { count: 15, title: '🚀 Avançado', desc: 'Descobriu 15 comandos diferentes' },
      { count: 20, title: '💎 Master', desc: 'Descobriu 20 comandos diferentes' },
      { count: 25, title: '🏅 Terminal Ninja', desc: 'Descobriu 25+ comandos!' },
      { count: 30, title: '👑 Lenda', desc: 'Descobriu quase todos os comandos!' }
    ];

    const achievement = achievements.find(a => a.count === count);
    if (achievement) {
      setTimeout(() => {
        this.showAchievement(achievement.title, achievement.desc);
      }, 500);
    }
  }

  showContextualSuggestion(lastCommand) {
    // Show contextual suggestions based on last command
    const suggestions = {
      'about': '💡 Agora experimente <strong>contributions</strong> para ver minha atividade GitHub!',
      'help': '🎯 Comece com <strong>about</strong> para me conhecer melhor',
      'contributions': '🎨 Que tal mudar o visual? Digite <strong>theme matrix</strong>',
      'theme': '☕ Relaxe um pouco! Digite <strong>coffee</strong> para um easter egg',
      'coffee': '💻 Vamos ao que interessa! Digite <strong>projects</strong>',
      'projects': '📧 Gostou? Entre em contato! Digite <strong>contact</strong>',
      'clear': '🚀 Tela limpa! Que tal <strong>demo</strong> para ver funcionalidades?'
    };

    const suggestion = suggestions[lastCommand];
    if (suggestion && Math.random() < 0.7) { // 70% chance
      setTimeout(() => {
        this.showNotification(suggestion, 'info', 4000);
      }, 2000);
    }
  }

  showLoadingState(command, message = 'Executando comando...') {
    const loadingId = `loading-${Date.now()}`;
    const loadingHTML = `
      <div id="${loadingId}" class="loading-container">
        <div class="loading-spinner"></div>
        <span class="loading-text">${message}</span>
      </div>
    `;
    
    this.terminal.addToOutput(loadingHTML, 'system');
    
    // Return function to hide loading
    return () => {
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) {
        loadingElement.remove();
      }
    };
  }

  enhanceCommandFeedback(command, success = true) {
    if (success) {
      // Add sparkle effect to successful commands
      const outputElements = document.querySelectorAll('#output > div:last-child');
      if (outputElements.length > 0) {
        const lastOutput = outputElements[outputElements.length - 1];
        lastOutput.classList.add('command-discovered');
      }
    }
    
    // Track command and show suggestions
    this.trackCommandDiscovery(command);
    this.showContextualSuggestion(command);
  }

  updateProgress() {
    // Update the header progress indicator if it exists
    const headerProgress = document.querySelector('.terminal-progress-indicator');
    if (headerProgress) {
      const progressPercent = Math.min((this.commandsDiscovered.length / this.totalCommands) * 100, 100);
      headerProgress.style.width = `${progressPercent}%`;
    }
  }

  loadDiscoveredCommands() {
    return JSON.parse(localStorage.getItem('commands-discovered') || '[]');
  }

  saveDiscoveredCommands() {
    localStorage.setItem('commands-discovered', JSON.stringify(this.commandsDiscovered));
  }

  // Public methods for external use
  getProgress() {
    return {
      discovered: this.commandsDiscovered.length,
      total: this.totalCommands,
      percentage: Math.min((this.commandsDiscovered.length / this.totalCommands) * 100, 100),
      level: this.getProgressLevel(this.commandsDiscovered.length)
    };
  }

  hideStatusBar() {
    if (this.statusBar) {
      this.statusBar.classList.remove('show');
    }
  }

  showStatusBar() {
    if (this.statusBar) {
      this.statusBar.classList.add('show');
    }
  }
}
