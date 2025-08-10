// Basic terminal commands
import { CONTENT } from '../data/content.js';
import ContributionCommands from './ContributionCommands.js';
import { DiscoveryCommands } from './DiscoveryCommands.js';

export class BasicCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.contributionCommands = new ContributionCommands(terminal);
    this.discoveryCommands = new DiscoveryCommands(terminal);
  }

  getCommands() {
    return {
      // Enhanced help system
      help: () => this.showEnhancedHelp(),
      ...this.discoveryCommands.getCommands(),
      
      // Core commands
      clear: () => this.terminal.clearTerminal(),
      about: () => this.showAbout(),
      sobre: () => this.showAbout(),
      1: () => this.showAbout(),
      contact: () => this.terminal.addToOutput(CONTENT.contact, 'system'),
      contato: () => this.terminal.addToOutput(CONTENT.contact, 'system'),
      3: () => this.terminal.addToOutput(CONTENT.contact, 'system'),
      
      // System commands
      date: () => this.showDate(),
      pwd: () => this.showPath(),
      ls: () => this.listFiles(),
      "ls -la": () => this.listFilesDetailed(),
      whoami: () => this.whoami(),
      
      // Contribution commands
      contributions: (args) => this.contributionCommands.showContributions(args)
    };
  }

  showEnhancedHelp() {
    // Track help usage and show appropriate version
    this.discoveryCommands.markAsDiscovered('help');
    
    // Check if user is new (less than 3 commands discovered)
    const discovered = this.discoveryCommands.commandsDiscovered.length;
    
    if (discovered < 3) {
      // Show basic help for new users
      this.terminal.addToOutput(CONTENT.helpBasic, 'system');
      this.terminal.addToOutput(`
<span class="info">🎯 Primeira vez aqui?</span> Digite <span class="cmd">start</span> para um tour guiado!
<span class="warning">📚 Help completo:</span> <span class="cmd">help --all</span> para ver TODOS os comandos`, 'system');
    } else {
      // Show full help for experienced users
      this.terminal.addToOutput(CONTENT.help, 'system');
    }
  }

  showAbout() {
    this.discoveryCommands.markAsDiscovered('about');
    this.terminal.addToOutput(CONTENT.about, 'system');
    
    // Contextual suggestion for first-time users
    setTimeout(() => {
      const discovered = this.discoveryCommands.commandsDiscovered.length;
      if (discovered < 5) {
        this.terminal.addToOutput(`
<span class="success">👍 Ótimo começo!</span> Agora experimente:
<span class="info">💻 <span class="cmd">whoami</span> - Resumo técnico</span>
<span class="info">📊 <span class="cmd">contributions</span> - Atividade GitHub</span>
<span class="info">🎨 <span class="cmd">theme matrix</span> - Mudar visual</span>`, 'system');
      }
    }, 1000);
  }

  showDate() {
    const now = new Date();
    const dateStr = now.toLocaleString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    this.terminal.addToOutput(`<span class="output-text">📅 ${dateStr}</span>`, 'system');
  }

  showPath() {
    this.terminal.addToOutput(
      '<span class="output-text">📁 /home/felipe/portfolio</span>', 'system'
    );
  }

  listFiles() {
    const files = `
<span class="output-text">📁 Arquivos no diretório atual:</span>
<span class="success">📄 about.txt</span>      <span class="success">📝 projects.md</span>     <span class="success">📋 contact.json</span>
<span class="success">📄 resume.pdf</span>     <span class="success">⚙️ skills.yml</span>      <span class="success">💻 portfolio.js</span>`;
    this.terminal.addToOutput(files, 'system');
  }

  listFilesDetailed() {
    const detailedFiles = `
<span class="output-text">total 42</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  1337 Jul 29 10:30 <span class="success">📄 about.txt</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  2048 Jul 29 10:31 <span class="success">📝 projects.md</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe   512 Jul 29 10:32 <span class="success">📋 contact.json</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  4096 Jul 29 10:33 <span class="success">📄 resume.pdf</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe   256 Jul 29 10:34 <span class="success">⚙️ skills.yml</span>
<span class="success">-rwxr-xr-x</span> 1 felipe felipe  8192 Jul 29 10:35 <span class="success">💻 portfolio.js</span>`;
    this.terminal.addToOutput(detailedFiles, 'system');
  }

  whoami() {
    const introText = `
<span class="highlight">👋 Felipe Macedo</span> - Desenvolvedor Full Cycle

🎓 Formação:
• Gestão da TI (Anhembi Morumbi)
• Cursando Ciência da Computação (FMU)
• Alumni Generation Brasil

💼 Experiência com Java, Go, Spring Boot e arquitetura de APIs  
⚙️ Foco em soluções escaláveis, microserviços e automação backend

<span class="success">📊 Status:</span> Em constante evolução — aprendendo, construindo e compartilhando!
<span class="warning">💬 Stack preferido:</span> Go pra performance. Java pra manter vivo.

<span class="info">💡 Dica:</span> Digite <code>contributions</code> para ver minha atividade no GitHub`;
    this.terminal.addToOutput(introText, 'system');
  }

}