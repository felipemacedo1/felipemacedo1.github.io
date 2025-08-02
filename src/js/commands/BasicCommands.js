// Basic terminal commands
import { CONTENT } from '../data/content.js';
import ContributionCommands from './ContributionCommands.js';

export class BasicCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.contributionCommands = new ContributionCommands(terminal);
  }

  getCommands() {
    return {
      help: () => this.terminal.addToOutput(CONTENT.help),
      clear: () => this.terminal.clearTerminal(),
      about: () => this.terminal.addToOutput(CONTENT.about),
      sobre: () => this.terminal.addToOutput(CONTENT.about),
      1: () => this.terminal.addToOutput(CONTENT.about),
      contact: () => this.terminal.addToOutput(CONTENT.contact),
      contato: () => this.terminal.addToOutput(CONTENT.contact),
      3: () => this.terminal.addToOutput(CONTENT.contact),
      date: () => this.showDate(),
      pwd: () => this.showPath(),
      ls: () => this.listFiles(),
      "ls -la": () => this.listFilesDetailed(),
      whoami: () => this.whoami(),
      contributions: (args) => this.contributionCommands.showContributions(args),
      contrib: (args) => this.contributionCommands.showContributions(args),
      activity: (args) => this.contributionCommands.showActivity(args),
      stats: (args) => this.contributionCommands.showStats(args)
    };
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
    this.terminal.addToOutput(`<span class="output-text">📅 ${dateStr}</span>`);
  }

  showPath() {
    this.terminal.addToOutput(
      '<span class="output-text">📁 /home/felipe/portfolio</span>'
    );
  }

  listFiles() {
    const files = `
<span class="output-text">📁 Arquivos no diretório atual:</span>
<span class="success">📄 about.txt</span>      <span class="success">📝 projects.md</span>     <span class="success">📋 contact.json</span>
<span class="success">📄 resume.pdf</span>     <span class="success">⚙️ skills.yml</span>      <span class="success">💻 portfolio.js</span>`;
    this.terminal.addToOutput(files);
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
    this.terminal.addToOutput(detailedFiles);
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
    this.terminal.addToOutput(introText);
  }
}