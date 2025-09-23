// Main Terminal Portfolio class
import { Terminal } from './core/Terminal.js';
import { CommandProcessor } from './core/CommandProcessor.js';
import { BasicCommands } from './commands/BasicCommands.js';
import { AdditionalCommands } from './commands/AdditionalCommands.js';
import { EnterpriseCommands } from './commands/EnterpriseCommands.js';
import { ThemeManager } from './features/ThemeManager.js';
import { AutoComplete } from './features/AutoComplete.js';
import { Onboarding } from './features/onboarding.js';
import { UXEnhancementSystem } from './features/UXEnhancementSystem.js';
import { Storage } from './utils/Storage.js';
import contentService from './services/ContentService.js';

export class TerminalPortfolio {
  constructor() {
    this.terminal = new Terminal();
    this.commandProcessor = new CommandProcessor(this.terminal);
    this.themeManager = new ThemeManager(this.terminal);
    this.autoComplete = new AutoComplete(this.terminal, this.commandProcessor);
    this.onboarding = new Onboarding(this.terminal);
    this.uxSystem = new UXEnhancementSystem(this.terminal);
    
    this.commandHistory = Storage.loadHistory();
    this.historyIndex = -1;
    this.startTime = Date.now();
    this.version = "v1.0.0";

    this.init();
  }

  init() {
    this.registerCommands();
    this.setupEventListeners();
    this.createClock();
    this.themeManager.applyTheme();
    this.startInitialSequence();
    this.fetchVersion();
    this.onboarding.init();
  }

  registerCommands() {
    const basicCommands = new BasicCommands(this.terminal);
    const additionalCommands = new AdditionalCommands(this.terminal);
    const enterpriseCommands = new EnterpriseCommands(this.terminal);
    
    this.commandProcessor.registerCommands({
      ...basicCommands.getCommands(),
      ...additionalCommands.getCommands(),
      ...enterpriseCommands.getCommands(),
      ...this.themeManager.getCommands(),
      menu: () => this.showMenu(),
      projects: () => this.showProjects(),
      projetos: () => this.showProjects(),
      2: () => this.showProjects()
    });
  }

  setupEventListeners() {
    this.terminal.input.addEventListener("keydown", async (e) => {
      if (this.terminal.isTyping) return;

      switch (e.key) {
        case "Enter":
          // Apenas usar sugestão se explicitamente navegada pelo usuário (índice > 0)
          if (this.autoComplete.suggestions.length > 0 && this.autoComplete.suggestionIndex > 0) {
            e.preventDefault();
            this.autoComplete.selectSuggestion(this.autoComplete.suggestions[this.autoComplete.suggestionIndex]);
          } else {
            // Esconder sugestões e processar comando normalmente
            this.autoComplete.hideSuggestions();
            await this.processCommand();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!this.autoComplete.navigateSuggestions("up")) {
            this.navigateHistory("up");
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!this.autoComplete.navigateSuggestions("down")) {
            this.navigateHistory("down");
          }
          break;
        case "Escape":
          this.autoComplete.hideSuggestions();
          break;
        case "Tab":
          e.preventDefault();
          this.autoComplete.autoComplete(this.terminal.input.value);
          break;
      }
    });

    this.terminal.input.addEventListener("input", () => {
      this.terminal.updateCursor();
      this.autoComplete.showSuggestions(this.terminal.input.value);
    });

    this.terminal.input.addEventListener("focus", () => {
      this.terminal.updateCursor();
    });

    this.terminal.input.addEventListener("blur", () => {
      setTimeout(() => this.autoComplete.hideSuggestions(), 200);
    });

    document.addEventListener("click", () => {
      this.terminal.input.focus();
    });

    this.setupKeyboardShortcuts();
    this.setupMobileSupport();
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.terminal.clearTerminal();
      }

      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        this.terminal.addToOutput('<span class="error">^C</span>');
        this.terminal.input.value = "";
        this.terminal.updateCursor();
      }
    });
  }

  setupMobileSupport() {
    if (window.innerWidth <= 768) {
      document.getElementById("mobileKeyboard").style.display = "block";
    }
  }

  createClock() {
    const clock = document.getElementById("terminal-clock");
    if (!clock) return;
    
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      clock.textContent = `🕒 ${time}`;
    };
    updateClock();
    // Optimize: update every 5 seconds instead of every second
    setInterval(updateClock, 5000);
  }

  async startInitialSequence() {
    this.terminal.input.disabled = true;
    await this.terminal.sleep(500);

    // Sempre começar com help (sem digitar, apenas executar)
    await this.commandProcessor.executeCommandSilent("help");

    this.terminal.input.disabled = false;
    this.terminal.input.focus();
    
    // Garantir que o cursor está na posição correta após a inicialização
    this.terminal.updateCursor();
  }

  async processCommand() {
    const command = this.terminal.input.value.trim();
    const commandLower = command.toLowerCase();
    if (commandLower === "") return;

    // Track command in history
    if (command !== this.commandHistory[this.commandHistory.length - 1]) {
      this.commandHistory.push(command);
      Storage.saveHistory(this.commandHistory);
    }
    this.historyIndex = -1;

    // Extract main command for tracking (remove args)
    const mainCommand = commandLower.split(' ')[0];

    // Track command for analytics and enhanced UX
    if (window.analytics) window.analytics.trackCommand(mainCommand);
    if (this.onboarding) this.onboarding.trackCommand(mainCommand);
    if (this.uxSystem) this.uxSystem.trackCommandDiscovery(mainCommand);

    await this.commandProcessor.processCommand(command);
    
    // Enhanced UX feedback
    if (this.uxSystem) {
      this.uxSystem.enhanceCommandFeedback(mainCommand, true);
    }

    this.terminal.input.value = "";
    this.terminal.updateCursor();
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === "up") {
      if (this.historyIndex === -1) {
        this.historyIndex = this.commandHistory.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else if (direction === "down") {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        this.terminal.input.value = "";
        this.terminal.updateCursor();
        return;
      }
    }

    this.terminal.input.value = this.commandHistory[this.historyIndex] || "";
    this.terminal.updateCursor();
  }

  async fetchVersion() {
    try {
      // Check rate limiting before making API call
      if (window.rateLimiter && !window.rateLimiter.isAllowed('github-api').allowed) {
        this.version = "v1.0.1";
        return;
      }

      const meta = await contentService.getMeta('desktop');
      const githubUsername = meta.github ? meta.github.split('/').pop() : 'user';
      const repo = `${githubUsername}/${githubUsername}.github.io`;
      const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

      const response = await fetch(apiUrl, {
        headers: { 
          Accept: "application/vnd.github.v3+json",
          'User-Agent': 'Terminal-Portfolio/1.0'
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.version = data.tag_name || "v1.0.1";
      } else {
        this.version = "v1.0.1";
      }
    } catch {
      this.version = "v1.0.1";
    }
  }

  showMenu() {
    const menuText = `
<span class="ascii-art align-center">
╔══════════════════════════════════════════════════╗
           🚀 PORTFOLIO TERMINAL ${this.version}            
                     Felipe Macedo                     
╚══════════════════════════════════════════════════╝
</span>

<span class="highlight">📋 Selecione uma opção:</span>

<span class="menu-option">1 - 👨‍💻 Sobre Mim</span>       <span class="output-text">Experiência e tecnologias</span>
<span class="menu-option">2 - 🚀 Projetos</span>        <span class="output-text">Meus trabalhos recentes</span>
<span class="menu-option">3 - 📧 Contato</span>         <span class="output-text">Como me encontrar</span>

<span class="output-text">Digite o número da opção ou o comando correspondente.</span>
<span class="warning">💡 Dica: Digite '<span class="success">help</span>' para ver todos os comandos disponíveis!</span>`;
    this.terminal.addToOutput(menuText, 'system');
  }

  async showProjects() {
    // Use ContentService for projects data
    const projects = await contentService.getProjects('desktop');
    const featuredProjects = await contentService.getFeaturedProjects('desktop');
    const projectsText = this.formatProjectsText(projects, featuredProjects);
    this.terminal.addToOutput(projectsText, 'system');
  }

  formatProjectsText(projects, featuredProjects) {
    if (!projects || projects.length === 0) {
      return '<span class="error">No projects data available</span>';
    }

    let projectsText = `
<span class="ascii-art align-center">
    ╔═══════════════════════════════╗
             🚀 MEUS PROJETOS       
    ╚═══════════════════════════════╝
</span>

`;

    // Show featured projects first
    if (featuredProjects && featuredProjects.length > 0) {
      featuredProjects.forEach(project => {
        projectsText += this.formatProjectItem(project);
      });
    } else {
      // Show first 4 projects if no featured projects
      projects.slice(0, 4).forEach(project => {
        projectsText += this.formatProjectItem(project);
      });
    }

    projectsText += `
<span class="success">📋 Características dos Projetos:</span>
<span class="output-text">✅ Código open source disponível no GitHub</span>
<span class="output-text">🧪 Foco em boas práticas e clean code</span>
<span class="output-text">🔄 Projetos em desenvolvimento ativo</span>
<span class="output-text">📊 Demonstração de diferentes tecnologias</span>
<span class="output-text">🔒 Aplicação de padrões de segurança</span>`;

    return projectsText;
  }

  formatProjectItem(project) {
    const techStack = project.technologies ? project.technologies.join(', ') : 'N/A';
    
    return `
<div class="project-item">
<span class="project-title">${project.icon || '🚀'} ${project.name}</span>
<span class="project-description">
${project.description}
• <strong>Tech Stack:</strong> ${techStack}
${project.features ? project.features.map(feature => `• <strong>${feature.category}:</strong> ${feature.description}`).join('\n') : ''}
</span>
${project.github ? `<span class="project-link">🔗 <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">${project.github.replace('https://', '')}</a></span>` : ''}
${project.demo ? `<span class="project-link">🌐 <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link">${project.demo.replace('https://', '')}</a></span>` : ''}
</div>

`;
  }

  // Expose methods for global access
  selectSuggestion(cmd) {
    this.autoComplete.selectSuggestion(cmd);
  }
}