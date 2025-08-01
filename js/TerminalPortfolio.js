// Main Terminal Portfolio class
import { Terminal } from './core/Terminal.js';
import { CommandProcessor } from './core/CommandProcessor.js';
import { BasicCommands } from './commands/BasicCommands.js';
import { ThemeManager } from './features/ThemeManager.js';
import { AutoComplete } from './features/AutoComplete.js';
import { Storage } from './utils/Storage.js';

export class TerminalPortfolio {
  constructor() {
    this.terminal = new Terminal();
    this.commandProcessor = new CommandProcessor(this.terminal);
    this.themeManager = new ThemeManager(this.terminal);
    this.autoComplete = new AutoComplete(this.terminal, this.commandProcessor);
    
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
  }

  registerCommands() {
    const basicCommands = new BasicCommands(this.terminal);
    
    this.commandProcessor.registerCommands({
      ...basicCommands.getCommands(),
      ...this.themeManager.getCommands(),
      menu: () => this.showMenu(),
      projects: () => this.showProjects(),
      projetos: () => this.showProjects(),
      2: () => this.showProjects()
    });
  }

  setupEventListeners() {
    this.terminal.input.addEventListener("keydown", (e) => {
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
            this.processCommand();
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
    setInterval(updateClock, 1000);
  }

  async startInitialSequence() {
    this.terminal.input.disabled = true;
    await this.terminal.sleep(500);

    await this.terminal.typeCommand("menu");
    await this.commandProcessor.executeCommandSilent("menu");

    this.terminal.input.disabled = false;
    this.terminal.input.focus();
  }

  processCommand() {
    const command = this.terminal.input.value.trim().toLowerCase();
    if (command === "") return;

    if (command !== this.commandHistory[this.commandHistory.length - 1]) {
      this.commandHistory.push(command);
      Storage.saveHistory(this.commandHistory);
    }
    this.historyIndex = -1;

    this.commandProcessor.processCommand(this.terminal.input.value);
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
      const repo = "felipemacedo1/felipemacedo1.github.io";
      const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

      const response = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
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
    this.terminal.addToOutput(menuText);
  }

  showProjects() {
    const projectsText = `
<span class="ascii-art align-center">
    ╔═══════════════════════════════╗
             🚀 MEUS PROJETOS       
    ╚═══════════════════════════════╝
</span>

<div class="project-item">
<span class="project-title">🛒 Sistema de E-commerce Escalável</span>
<span class="project-description">
Plataforma completa de e-commerce construída com arquitetura de microserviços.
• <strong>Backend:</strong> Java Spring Boot + Go para processamento de pagamentos
• <strong>Frontend:</strong> React.js com TypeScript e Material-UI
• <strong>Infraestrutura:</strong> Kubernetes + AWS EKS
• <strong>Performance:</strong> 10k+ transações simultâneas com latência < 100ms
• <strong>Features:</strong> Cache Redis, Circuit Breaker, Rate Limiting
</span>
<span class="project-link">🔗 github.com/felipemacedo/ecommerce-platform</span>
</div>

<div class="project-item">
<span class="project-title">⚡ API Gateway de Alta Performance</span>
<span class="project-description">
Gateway desenvolvido em Go para gerenciamento centralizado de APIs corporativas.
• <strong>Rate Limiting:</strong> Algoritmo Token Bucket inteligente
• <strong>Resilience:</strong> Circuit breaker pattern com fallbacks
• <strong>Monitoring:</strong> Métricas em tempo real com Prometheus + Grafana
• <strong>Performance:</strong> Latência média < 5ms, 50k RPS
• <strong>Security:</strong> JWT validation, OAuth2, API Key management
</span>
<span class="project-link">🔗 github.com/felipemacedo/go-api-gateway</span>
</div>

<span class="success">📋 Características dos Projetos:</span>
<span class="output-text">✅ Documentação completa com Swagger/OpenAPI</span>
<span class="output-text">🧪 Testes automatizados (Unit, Integration, E2E)</span>
<span class="output-text">🔄 CI/CD pipelines com GitHub Actions</span>
<span class="output-text">📊 Monitoramento e logging estruturado</span>
<span class="output-text">🔒 Práticas de segurança (OWASP Top 10)</span>`;
    this.terminal.addToOutput(projectsText);
  }

  // Expose methods for global access
  selectSuggestion(cmd) {
    this.autoComplete.selectSuggestion(cmd);
  }
}