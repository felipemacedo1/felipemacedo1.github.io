// Enhanced Help and Discovery Commands
import { CONTENT } from '../data/content.js';

export class DiscoveryCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.commandsDiscovered = this.loadDiscoveredCommands();
    this.sessionHistory = [];
  }

  getCommands() {
    return {
      'help basic': () => this.terminal.addToOutput(CONTENT.helpBasic, 'system'),
      'help info': () => this.terminal.addToOutput(CONTENT.helpInfo, 'system'),
      'help github': () => this.terminal.addToOutput(CONTENT.helpGithub, 'system'),
      'help fun': () => this.terminal.addToOutput(CONTENT.helpFun, 'system'),
      'help system': () => this.terminal.addToOutput(CONTENT.helpSystem, 'system'),
      'help themes': () => this.terminal.addToOutput(CONTENT.helpThemes, 'system'),
      'help --all': () => this.terminal.addToOutput(CONTENT.helpAll, 'system'),
      demo: () => this.runDemo(),
      start: () => this.runGuidedTour(),
      showcase: () => this.runShowcase(),
      popular: () => this.showPopularCommands(),
      random: () => this.runRandomCommand(),
      tips: () => this.showAdvancedTips(),
      history: () => this.showSessionHistory()
    };
  }

  async runDemo() {
    const demoText = `
<span class="highlight">🚀 Demo Interativa - Terminal Portfolio</span>

<span class="success">🎬 Começando demonstração...</span>
<span class="output-text">Vou mostrar algumas funcionalidades incríveis em 30 segundos!</span>`;
    
    this.terminal.addToOutput(demoText, 'system');
    
    // Sequência demonstrativa
    const demoSequence = [
      { command: 'whoami', delay: 2000 },
      { command: 'theme matrix', delay: 3000 },
      { command: 'contributions', delay: 4000 },
      { command: 'coffee', delay: 3000 },
      { command: 'theme dark', delay: 2000 }
    ];

    for (const step of demoSequence) {
      await this.sleep(step.delay);
      await this.terminal.typeCommand(step.command);
      await this.sleep(500);
      // Execute command silently for demo
      const parts = step.command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      // Get command from terminal registry
      if (this.terminal.commandProcessor && this.terminal.commandProcessor.commands.has(cmd)) {
        const handler = this.terminal.commandProcessor.commands.get(cmd);
        try {
          await handler(args);
        } catch (error) {
          console.warn('Demo command failed:', error);
        }
      }
    }

    await this.sleep(1000);
    this.terminal.addToOutput(`
<span class="success">🎊 Demo concluída!</span>
<span class="warning">💡 Agora experimente por conta própria:</span>
<span class="info">• Digite <code>popular</code> para ver comandos mais usados</span>
<span class="info">• Digite <code>help fun</code> para easter eggs</span>
<span class="info">• Digite <code>random</code> para descobrir algo novo</span>`, 'system');
  }

  runGuidedTour() {
    const tourText = `
<span class="highlight">🎯 Tour Guiado - Primeira Visita</span>

<span class="success">👋 Bem-vindo ao meu Terminal Portfolio!</span>

<span class="warning">🎮 Como funciona:</span>
<span class="output-text">• Este é um terminal interativo real</span>
<span class="output-text">• Você digita comandos e eu respondo</span>
<span class="output-text">• Use Tab para autocompletar, ↑↓ para histórico</span>

<span class="success">🚀 Vamos começar! Experimente estes comandos na ordem:</span>

<span class="step">1️⃣ <span class="cmd">about</span> - Descubra quem eu sou</span>
<span class="step">2️⃣ <span class="cmd">contributions</span> - Veja minha atividade no GitHub</span>
<span class="step">3️⃣ <span class="cmd">theme matrix</span> - Mude o visual</span>
<span class="step">4️⃣ <span class="cmd">coffee</span> - Um easter egg divertido</span>
<span class="step">5️⃣ <span class="cmd">projects</span> - Veja meus trabalhos</span>

<span class="warning">💡 Dica:</span> Depois explore com <span class="cmd">popular</span> ou <span class="cmd">help fun</span>
<span class="info">🎊 Divirta-se explorando!</span>`;

    this.terminal.addToOutput(tourText, 'system');
    this.markAsDiscovered('start');
  }

  runShowcase() {
    const showcaseText = `
<span class="highlight">✨ Showcase - Melhores Funcionalidades</span>

<span class="success">🏆 Top 5 Recursos Imperdíveis:</span>

<span class="feature">1. 📊 <span class="cmd">contributions</span></span>
<span class="feature-desc">   Gráfico interativo real das minhas contribuições GitHub</span>

<span class="feature">2. 🎨 <span class="cmd">theme matrix</span></span>
<span class="feature-desc">   6 temas visuais diferentes (matrix é o favorito!)</span>

<span class="feature">3. 💻 <span class="cmd">whoami</span></span>  
<span class="feature-desc">   Resumo profissional técnico completo</span>

<span class="feature">4. 🎮 <span class="cmd">coffee</span> | <span class="cmd">h4x0r-mode</span> | <span class="cmd">matrix</span></span>
<span class="feature-desc">   Easter eggs divertidos e interativos</span>

<span class="feature">5. 🚀 <span class="cmd">skills</span></span>
<span class="feature-desc">   Barras de progresso animadas das minhas tecnologias</span>

<span class="warning">🎯 Diferencial:</span> Este não é um terminal fake - é funcional de verdade!
<span class="success">💡 Experimente:</span> <span class="cmd">random</span> para descobrir comandos ocultos`;

    this.terminal.addToOutput(showcaseText, 'system');
    this.markAsDiscovered('showcase');
  }

  showPopularCommands() {
    const popularText = `
<span class="highlight">⭐ Comandos Mais Populares & Úteis</span>

<span class="success">🥇 TOP 10 - Comece por aqui:</span>

<span class="popular-cmd">1. <span class="cmd">about</span></span> <span class="popular-desc">- Primeira impressão essencial</span>
<span class="popular-cmd">2. <span class="cmd">contributions</span></span> <span class="popular-desc">- Gráfico GitHub interativo ⭐</span>
<span class="popular-cmd">3. <span class="cmd">theme matrix</span></span> <span class="popular-desc">- Visual incrível</span>
<span class="popular-cmd">4. <span class="cmd">whoami</span></span> <span class="popular-desc">- Resumo técnico profissional</span>
<span class="popular-cmd">5. <span class="cmd">projects</span></span> <span class="popular-desc">- Portfólio de trabalhos</span>
<span class="popular-cmd">6. <span class="cmd">skills</span></span> <span class="popular-desc">- Tecnologias com barras animadas</span>
<span class="popular-cmd">7. <span class="cmd">coffee</span></span> <span class="popular-desc">- Easter egg mais querido ☕</span>
<span class="popular-cmd">8. <span class="cmd">contact</span></span> <span class="popular-desc">- Como me encontrar</span>
<span class="popular-cmd">9. <span class="cmd">h4x0r-mode</span></span> <span class="popular-desc">- Modo hacker divertido</span>
<span class="popular-cmd">10. <span class="cmd">clear</span></span> <span class="popular-desc">- Limpar e recomeçar</span>

<span class="warning">🚀 Próximo nível:</span> <span class="cmd">help fun</span> para easter eggs ocultos
<span class="info">💡 Descoberta:</span> ${this.commandsDiscovered.length} comandos descobertos até agora!`;

    this.terminal.addToOutput(popularText, 'system');
    this.markAsDiscovered('popular');
  }

  runRandomCommand() {
    const hiddenCommands = [
      'ascii', 'growthfolio', 'konami', 'glitch', 'sudo', 
      'experience', 'education', 'certifications', 'status',
      'date', 'ls', 'pwd', 'eastereggs'
    ];
    
    const randomCmd = hiddenCommands[Math.floor(Math.random() * hiddenCommands.length)];
    
    const randomText = `
<span class="highlight">🎲 Comando Aleatório Descoberto!</span>

<span class="success">🔍 Comando secreto revelado:</span> <span class="cmd">${randomCmd}</span>

<span class="output-text">Executando automaticamente...</span>`;
    
    this.terminal.addToOutput(randomText, 'system');
    
    // Execute the random command after a delay
    setTimeout(async () => {
      if (this.terminal.commandProcessor && this.terminal.commandProcessor.commands.has(randomCmd)) {
        const handler = this.terminal.commandProcessor.commands.get(randomCmd);
        try {
          await handler([]);
          this.markAsDiscovered(randomCmd);
          this.terminal.addToOutput(`
<span class="success">✨ Gostou? Digite <code>random</code> novamente para descobrir outro!</span>`, 'system');
        } catch (error) {
          console.warn('Random command failed:', error);
        }
      }
    }, 1000);
  }

  showAdvancedTips() {
    const tipsText = `
<span class="highlight">💡 Dicas Avançadas - Terminal Power User</span>

<span class="success">⚡ Produtividade:</span>
<span class="tip">• Use Tab para autocompletar (experimente: digite "con" + Tab)</span>
<span class="tip">• Setas ↑↓ navegam no histórico de comandos</span>
<span class="tip">• Ctrl+L = clear | Ctrl+C = cancelar operação</span>

<span class="success">🔍 Descoberta:</span>
<span class="tip">• <code>random</code> sempre revela comandos novos</span>
<span class="tip">• Muitos comandos têm aliases: <code>about</code> = <code>1</code></span>
<span class="tip">• Easter eggs reagem a contexto (experimente após outros comandos)</span>

<span class="success">🎨 Visual:</span>
<span class="tip">• Temas são salvos automaticamente</span>
<span class="tip">• <code>theme matrix</code> + <code>h4x0r-mode</code> = experiência completa</span>
<span class="tip">• Cada tema tem cursor e cores únicos</span>

<span class="success">🐣 Segredos:</span>
<span class="tip">• Há comandos não listados no help (continue explorando!)</span>
<span class="tip">• Alguns comandos mudam comportamento baseado no contexto</span>
<span class="tip">• O terminal "lembra" suas descobertas entre sessões</span>

<span class="warning">🏆 Meta:</span> Descubra todos os ${this.getTotalCommandsCount()} comandos disponíveis!
<span class="info">📊 Seu progresso:</span> ${this.commandsDiscovered.length} descobertos`;

    this.terminal.addToOutput(tipsText, 'system');
    this.markAsDiscovered('tips');
  }

  showSessionHistory() {
    const history = this.sessionHistory.slice(-10); // Last 10 commands
    
    const historyText = `
<span class="highlight">📜 Histórico da Sessão</span>

<span class="success">🕒 Últimos comandos executados:</span>
${history.length > 0 
  ? history.map((cmd, i) => `<span class="history-item">${i + 1}. <code>${cmd}</code></span>`).join('\n')
  : '<span class="output-text">Nenhum comando executado nesta sessão ainda.</span>'
}

<span class="info">💡 Use ↑↓ para navegar no histórico diretamente no terminal</span>
<span class="warning">📊 Total de comandos únicos descobertos:</span> ${this.commandsDiscovered.length}`;

    this.terminal.addToOutput(historyText, 'system');
  }

  // Utility methods
  markAsDiscovered(command) {
    if (!this.commandsDiscovered.includes(command)) {
      this.commandsDiscovered.push(command);
      this.saveDiscoveredCommands();
    }
    
    if (!this.sessionHistory.includes(command)) {
      this.sessionHistory.push(command);
    }
  }

  loadDiscoveredCommands() {
    return JSON.parse(localStorage.getItem('commands-discovered') || '[]');
  }

  saveDiscoveredCommands() {
    localStorage.setItem('commands-discovered', JSON.stringify(this.commandsDiscovered));
  }

  getTotalCommandsCount() {
    // Estimated total based on current implementation
    return 35;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
