// Basic terminal commands - Refactored to use ContentService
import contentService from '../services/ContentService.js';
import ContributionCommands from './ContributionCommands.js';
import { DiscoveryCommands } from './DiscoveryCommands.js';

export class BasicCommands {
  static NEW_USER_THRESHOLD = 3;
  static CONTEXTUAL_SUGGESTION_THRESHOLD = 5;
  static CONTEXTUAL_SUGGESTION_DELAY = 1000;
  
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
      contact: () => this.showContact(),
      contato: () => this.showContact(),
      3: () => this.showContact(),
      
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

  async showEnhancedHelp() {
    // Track help usage and show appropriate version
    this.discoveryCommands.markAsDiscovered('help');
    
    // Check if user is new (less than threshold commands discovered)
    const discovered = this.discoveryCommands.commandsDiscovered.length;
    
    if (discovered < BasicCommands.NEW_USER_THRESHOLD) {
      // Show basic help for new users
      const helpBasicText = await contentService.getText('helpBasic', 'desktop');
      this.terminal.addToOutput(helpBasicText, 'system');
      this.terminal.addToOutput(`
<span class="info">🎯 Primeira vez aqui?</span> Digite <span class="cmd">start</span> para um tour guiado!
<span class="warning">📚 Help completo:</span> <span class="cmd">help --all</span> para ver TODOS os comandos`, 'system');
    } else {
      // Show full help for experienced users
      const helpText = await contentService.getText('help', 'desktop');
      this.terminal.addToOutput(helpText, 'system');
    }
  }

  async showAbout() {
    this.discoveryCommands.markAsDiscovered('about');
    // Use ContentService for about text
    const aboutText = await contentService.getText('about', 'desktop');
    this.terminal.addToOutput(aboutText, 'system');
    
    // Contextual suggestion for first-time users
    setTimeout(() => {
      const discovered = this.discoveryCommands.commandsDiscovered.length;
      if (discovered < BasicCommands.CONTEXTUAL_SUGGESTION_THRESHOLD) {
        this.terminal.addToOutput(`
<span class="success">👍 Ótimo começo!</span> Agora experimente:
<span class="info">💻 <span class="cmd">whoami</span> - Resumo técnico</span>
<span class="info">📊 <span class="cmd">contributions</span> - Atividade GitHub</span>
<span class="info">🎨 <span class="cmd">theme matrix</span> - Mudar visual</span>`, 'system');
      }
    }, BasicCommands.CONTEXTUAL_SUGGESTION_DELAY);
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

  async whoami() {
    // Use ContentService for whoami text
    const whoamiText = await contentService.getText('whoami', 'desktop');
    this.terminal.addToOutput(whoamiText, 'system');
  }

  async showContact() {
    // Use ContentService for contact data (desktop version with WhatsApp)
    const contact = await contentService.getContact('desktop');
    const contactText = this.formatContactText(contact);
    this.terminal.addToOutput(contactText, 'system');
  }

  formatContactText(contact) {
    return `
<span class="ascii-art align-center">
    ╔═══════════════════════════════════════╗
            💬 CONECTE-SE COMIGO            
    ╚═══════════════════════════════════════╝
</span>

<span class="highlight">🚀 Canais Principais:</span>

<div class="contact-item">
<span class="contact-label">📧 Email:</span> <a href="mailto:${contact.email}" class="project-link">${contact.email}</a>
<span class="output-text">   └─ Resposta em até 24h • Projetos e oportunidades</span>
</div>

<div class="contact-item">
<span class="contact-label">💼 LinkedIn:</span> <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="project-link">${contact.linkedin}</a>
<span class="output-text">   └─ Networking profissional • Atualizações de carreira</span>
</div>

<div class="contact-item">
<span class="contact-label">🐙 GitHub:</span> <a href="${contact.github}" target="_blank" rel="noopener noreferrer" class="project-link">${contact.github}</a>
<span class="output-text">   └─ Código aberto • Contribuições • Projetos pessoais</span>
</div>

${contact.whatsapp ? `<div class="contact-item">
<span class="contact-label">📱 WhatsApp:</span> <a href="${contact.whatsapp.link}" target="_blank" rel="noopener noreferrer" class="project-link">${contact.whatsapp.number}</a>
<span class="output-text">   └─ Contato direto • Projetos • Consultoria</span>
</div>

` : ''}<span class="highlight">🏢 Organizações:</span>

<div class="contact-item">
<span class="contact-label">🌐 Growthfolio:</span> <a href="${contact.organization}" target="_blank" rel="noopener noreferrer" class="project-link">${contact.organization}</a>
<span class="output-text">   └─ Projetos open source • Bibliotecas • Microserviços</span>
</div>

<span class="ascii-art align-center">
    ╔═══════════════════════════════════════╗
    ║  🚀 Vamos construir algo incrível!    ║
    ╚═══════════════════════════════════════╝
</span>`;
  }

}