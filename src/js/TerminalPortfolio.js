// Main Terminal Portfolio class
import { Terminal } from './core/Terminal.js';
import { CommandProcessor } from './core/CommandProcessor.js';
import { BasicCommands } from './commands/BasicCommands.js';
import { AdditionalCommands } from './commands/AdditionalCommands.js';
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
    const additionalCommands = new AdditionalCommands(this.terminal);
    
    this.commandProcessor.registerCommands({
      ...basicCommands.getCommands(),
      ...additionalCommands.getCommands(),
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
<span class="project-title">� Terminal Portfolio</span>
<span class="project-description">
Portfólio interativo dual com interface terminal para desktop e BIOS Android para mobile.
• <strong>Frontend:</strong> HTML5, CSS3, JavaScript ES6+ vanilla
• <strong>Features:</strong> 25+ comandos, 6 temas, auto-complete, detecção de dispositivo
• <strong>Mobile:</strong> Interface BIOS Android com Material Design
• <strong>Arquitetura:</strong> Modular, responsiva, zero dependências
</span>
<span class="project-link">🔗 <a href="https://felipemacedo1.github.io" target="_blank" class="project-link">felipemacedo1.github.io</a></span>
</div>

<div class="project-item">
<span class="project-title">⚡ PriceFeed API</span>
<span class="project-description">
API de monitoramento de preços de criptomoedas integrando CoinGecko e Binance.
• <strong>Backend:</strong> Go com PostgreSQL e Redis para cache
• <strong>Features:</strong> WebSocket real-time, alertas de preço, rate limiting
• <strong>Integração:</strong> CoinGecko API, Binance API
• <strong>Performance:</strong> Cache inteligente, baixa latência
</span>
<span class="project-link">🔗 <a href="https://github.com/felipemacedo1/go-pricefeed" target="_blank" class="project-link">github.com/felipemacedo1/go-pricefeed</a></span>
</div>

<div class="project-item">
<span class="project-title">🤖 GPT Service Go</span>
<span class="project-description">
Microserviço em Go integrando com OpenAI GPT para geração de respostas e automações.
• <strong>Backend:</strong> Go com Docker containerização
• <strong>Integração:</strong> OpenAI API, gestão de tokens
• <strong>Features:</strong> Rate limiting, error handling, logs estruturados
• <strong>Deploy:</strong> Docker ready, configurações via env
</span>
<span class="project-link">🔗 <a href="https://github.com/felipemacedo1/go-service-gpt" target="_blank" class="project-link">github.com/felipemacedo1/go-service-gpt</a></span>
</div>

<div class="project-item">
<span class="project-title">₿ Spring MCD Wallet</span>
<span class="project-description">
Wallet Bitcoin modular com SPV (Simple Payment Verification) construída em Java.
• <strong>Backend:</strong> Java com Spring Framework e bitcoinj
• <strong>Features:</strong> SPV client, gerenciamento de chaves, transações
• <strong>Segurança:</strong> Criptografia, backup de seeds, validação
• <strong>Arquitetura:</strong> Modular, extensível, testável
</span>
<span class="project-link">🔗 <a href="https://github.com/felipemacedo1/spring-mcd-wallet" target="_blank" class="project-link">github.com/felipemacedo1/spring-mcd-wallet</a></span>
</div>

<span class="highlight">🏢 Projetos Organizacionais (Growthfolio):</span>

<div class="project-item">
<span class="project-title">📝 Spring Blog Platform</span>
<span class="project-description">
Backend completo para plataforma de blog full-stack com Spring Boot.
</span>
<span class="project-link">🔗 <a href="https://github.com/growthfolio/spring-blog-platform" target="_blank" class="project-link">github.com/growthfolio/spring-blog-platform</a></span>
</div>

<div class="project-item">
<span class="project-title">⚛️ React Blog Platform</span>
<span class="project-description">
Frontend em React/TypeScript para blog, demonstrando integração com APIs REST.
</span>
<span class="project-link">🔗 <a href="https://github.com/growthfolio/react-blog-plataform" target="_blank" class="project-link">github.com/growthfolio/react-blog-plataform</a></span>
</div>

<div class="project-item">
<span class="project-title">🔄 AMQP Transactions Microservices</span>
<span class="project-description">
Pipeline de microserviços com RabbitMQ para processamento transacional.
</span>
<span class="project-link">🔗 <a href="https://github.com/growthfolio/amqp-transactions-ms" target="_blank" class="project-link">github.com/growthfolio/amqp-transactions-ms</a></span>
</div>

<span class="success">📋 Características dos Projetos:</span>
<span class="output-text">✅ Código open source disponível no GitHub</span>
<span class="output-text">🧪 Foco em boas práticas e clean code</span>
<span class="output-text">🔄 Projetos em desenvolvimento ativo</span>
<span class="output-text">📊 Demonstração de diferentes tecnologias</span>
<span class="output-text">🔒 Aplicação de padrões de segurança</span>`;
    this.terminal.addToOutput(projectsText);
  }

  // Expose methods for global access
  selectSuggestion(cmd) {
    this.autoComplete.selectSuggestion(cmd);
  }
}