// Enhanced Onboarding System
export class Onboarding {
  constructor(terminal) {
    this.terminal = terminal;
    this.isFirstVisit = !localStorage.getItem('visited');
    this.isFirstSession = !localStorage.getItem('session-count');
    this.progress = JSON.parse(localStorage.getItem('progress') || '{"commands": [], "level": 0}');
    this.sessionCount = parseInt(localStorage.getItem('session-count') || '0') + 1;
    
    // Update session count
    localStorage.setItem('session-count', this.sessionCount.toString());
  }

  init() {
    // O sistema agora sempre começa com 'help' automaticamente
    // Não executamos mais sequências automáticas para não interferir
    if (this.isFirstVisit) {
      // Apenas marcar como visitado, sem sequência automática
      localStorage.setItem('visited', 'true');
      setTimeout(() => this.showWelcomeNote(), 2000);
    } else if (this.sessionCount <= 3) {
      // Saudação discreta para usuários retornando
      setTimeout(() => this.showReturningUser(), 1500);
    } else {
      // Usuários experientes - apenas saudação mínima
      setTimeout(() => this.showMinimalGreeting(), 1000);
    }
  }

  showWelcomeNote() {
    this.terminal.addToOutput(`
<span class="success">👋 Primeira visita detectada!</span>
<span class="info">💡 Este é um terminal interativo onde você pode explorar meu perfil profissional.</span>
<span class="highlight">🎯 Comece digitando comandos como:</span> <code>about</code>, <code>contributions</code>, ou <code>demo</code>`, 'system');
  }

  async showWelcomeSequence() {
    // Step 1: Welcome message
    this.terminal.addToOutput(`
<span class="highlight">🎉 Bem-vindo ao Terminal Portfolio!</span>

<span class="success">👋 Primeira visita detectada!</span>
<span class="output-text">Este é um terminal interativo real onde você pode explorar meu perfil profissional.</span>`, 'system');

    await this.sleep(2000);

    // Step 2: Show terminal blinking
    this.terminal.addToOutput(`
<span class="info">💡 Veja o cursor piscando? Você pode digitar comandos reais aqui!</span>`, 'system');

    await this.sleep(2000);

    // Step 3: Auto-demonstration
    this.terminal.addToOutput(`
<span class="success">🚀 Deixe-me mostrar como funciona...</span>`, 'system');

    await this.sleep(1500);

    // Auto-type and execute first command
    await this.terminal.typeCommand('help basic');
    await this.sleep(500);
    
    // Simulate command execution
    if (this.terminal.commandProcessor && this.terminal.commandProcessor.commands.has('help')) {
      try {
        const helpHandler = this.terminal.commandProcessor.commands.get('help');
        await helpHandler([]);
      } catch (error) {
        console.warn('Auto-help command failed:', error);
      }
    }

    await this.sleep(2000);

    // Step 4: Encourage interaction
    this.terminal.addToOutput(`
<div class="welcome-guide">
  <div class="guide-header">🎯 Agora é sua vez! Experimente:</div>
  <div class="guide-steps">
    <div class="step">1. Digite <span class="cmd">about</span> para me conhecer</div>
    <div class="step">2. Digite <span class="cmd">contributions</span> para ver minha atividade GitHub</div>
    <div class="step">3. Digite <span class="cmd">theme matrix</span> para mudar o visual</div>
    <div class="step">4. Digite <span class="cmd">demo</span> para uma demonstração completa</div>
  </div>
  <div class="guide-tip">💡 Use Tab para autocompletar, ↑↓ para histórico</div>
  <div class="guide-tip">🆘 Digite <span class="cmd">start</span> se precisar de ajuda</div>
</div>`, 'system');
  }

  showReturningUser() {
    const commandsDiscovered = JSON.parse(localStorage.getItem('commands-discovered') || '[]').length;
    
    this.terminal.addToOutput(`
<span class="success">👋 Bem-vindo de volta!</span> (Visita #${this.sessionCount})

<span class="info">📊 Progresso:</span> ${commandsDiscovered} comandos descobertos
${commandsDiscovered < 5 
  ? `<span class="warning">💡 Ainda há muito para explorar! Digite <span class="cmd">popular</span> para ver comandos úteis</span>`
  : commandsDiscovered < 15 
    ? `<span class="success">🚀 Bom progresso! Experimente <span class="cmd">help fun</span> para easter eggs</span>`
    : `<span class="highlight">🏆 Explorer avançado! Digite <span class="cmd">random</span> para descobrir comandos ocultos</span>`
}

<span class="info">🎯 Dica rápida:</span> <span class="cmd">help</span> agora mostra comandos baseados no seu nível!`, 'system');
  }

  showMinimalGreeting() {
    const commandsDiscovered = JSON.parse(localStorage.getItem('commands-discovered') || '[]').length;
    
    if (Math.random() < 0.3) { // 30% chance for experienced users
      const tips = [
        `💡 Você sabia? Digite <span class="cmd">random</span> para descobrir comandos ocultos`,
        `🎨 Experimente <span class="cmd">theme ${['matrix', 'hacker', 'retro'][Math.floor(Math.random() * 3)]}</span> para uma mudança`,
        `📊 Seu progresso: ${commandsDiscovered} comandos descobertos`,
        `🚀 Digite <span class="cmd">showcase</span> para relembrar as melhores funcionalidades`,
        `🎮 Que tal um easter egg? Digite <span class="cmd">coffee</span> para relaxar`
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      this.terminal.addToOutput(`<span class="info">${randomTip}</span>`, 'system');
    }
  }

  trackCommand(cmd) {
    if (!this.progress.commands.includes(cmd)) {
      this.progress.commands.push(cmd);
      this.checkProgress();
      this.saveProgress();
      
      // Also update the new tracking system
      const discovered = JSON.parse(localStorage.getItem('commands-discovered') || '[]');
      if (!discovered.includes(cmd)) {
        discovered.push(cmd);
        localStorage.setItem('commands-discovered', JSON.stringify(discovered));
      }
    }
  }

  checkProgress() {
    const count = this.progress.commands.length;
    
    if (count === 1) {
      this.showAchievement('🎉 Primeiro Comando!', 'Parabéns! Você executou seu primeiro comando.');
    } else if (count === 3) {
      this.showAchievement('🏆 Explorer', 'Descobriu 3 comandos! Continue explorando.');
    } else if (count === 7) {
      this.showAchievement('🎖️ Expert', 'Descobriu 7 comandos! Você está pegando o jeito.');
    } else if (count === 15) {
      this.showAchievement('🚀 Master', 'Descobriu 15 comandos! Impressionante exploração.');
    } else if (count === 25) {
      this.showAchievement('💎 Terminal Ninja', 'Descobriu 25+ comandos! Você dominou este terminal.');
    }
  }

  showAchievement(title, desc) {
    this.terminal.addToOutput(`
<div class="achievement">
  <div class="achievement-title">${title}</div>
  <div class="achievement-desc">${desc}</div>
</div>`, 'achievement');
  }

  saveProgress() {
    localStorage.setItem('progress', JSON.stringify(this.progress));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}