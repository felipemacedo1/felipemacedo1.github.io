class TerminalPortfolio {
  constructor() {
    this.output = document.getElementById("output");
    this.input = document.getElementById("commandInput");
    this.cursor = document.getElementById("cursor");
    this.commandHistory = this.loadHistory();
    this.historyIndex = -1;
    this.currentTheme = this.loadTheme();
    this.isTyping = false;
    this.typewriterSpeed = 50;
    this.suggestions = [];
    this.suggestionIndex = -1;

    this.commands = {
      help: this.showHelp.bind(this),
      clear: this.clearTerminal.bind(this),
      menu: this.showMenu.bind(this),
      about: this.showAbout.bind(this),
      sobre: this.showAbout.bind(this),
      1: this.showAbout.bind(this),
      projects: this.showProjects.bind(this),
      projetos: this.showProjects.bind(this),
      2: this.showProjects.bind(this),
      contact: this.showContact.bind(this),
      contato: this.showContact.bind(this),
      3: this.showContact.bind(this),
      whoami: this.whoami.bind(this),
      skills: this.showSkills.bind(this),
      experience: this.showExperience.bind(this),
      education: this.showEducation.bind(this),
      certifications: this.showCertifications.bind(this),
      resume: this.downloadResume.bind(this),
      status: this.showStatus.bind(this),
      date: this.showDate.bind(this),
      ls: this.listFiles.bind(this),
      "ls -la": this.listFilesDetailed.bind(this),
      pwd: this.showPath.bind(this),
      sudo: this.sudoResponse.bind(this),
      "theme dark": () => this.changeTheme("dark"),
      "theme light": () => this.changeTheme("light"),
      "theme matrix": () => this.changeTheme("matrix"),
      "theme hacker": () => this.changeTheme("hacker"),
      "theme retro": () => this.changeTheme("retro"),
      "theme contrast": () => this.changeTheme("contrast"),
      "h4x0r-mode": this.hackerMode.bind(this),
      matrix: this.matrixMode.bind(this),
      konami: this.konamiCode.bind(this),
      coffee: this.needCoffee.bind(this),
      tdah: this.needCoffee.bind(this),
      ascii: this.ascii.bind(this),
      growthfolio: this.growthfolio.bind(this),
      eastereggs: this.eastereggs.bind(this),
      exit: this.exitTerminal.bind(this),
      glitch: this.glitchEffect.bind(this),
      joke: this.showJoke.bind(this),
      quote: this.showQuote.bind(this),
      stats: this.showStats.bind(this),
      fullscreen: this.toggleFullscreen.bind(this),
      fs: this.toggleFullscreen.bind(this),
    };

    this.startTime = Date.now();
    this.version = "v1.0.0";
    this.init();
    this.fetchVersion();
  }

  init() {
    this.setupEventListeners();
    this.createClock();
    this.applyTheme();
    this.startInitialSequence();
  }

  applyTheme() {
    document.body.className = `theme-${this.currentTheme}`;
  }

  setupEventListeners() {
    this.input.addEventListener("keydown", (e) => {
      if (this.isTyping) return;

      switch (e.key) {
        case "Enter":
          if (this.suggestions.length > 0 && this.suggestionIndex >= 0) {
            e.preventDefault();
            this.selectSuggestion(this.suggestions[this.suggestionIndex]);
          } else {
            this.processCommand();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (this.suggestions.length > 0) {
            this.suggestionIndex =
              this.suggestionIndex <= 0
                ? this.suggestions.length - 1
                : this.suggestionIndex - 1;
            this.displaySuggestions();
          } else {
            this.navigateHistory("up");
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (this.suggestions.length > 0) {
            this.suggestionIndex =
              this.suggestionIndex >= this.suggestions.length - 1
                ? 0
                : this.suggestionIndex + 1;
            this.displaySuggestions();
          } else {
            this.navigateHistory("down");
          }
          break;
        case "Escape":
          this.hideSuggestions();
          break;
        case "Tab":
          e.preventDefault();
          this.autoComplete();
          break;
      }
    });

    this.input.addEventListener("input", () => {
      this.updateCursor();
      this.showSuggestions();
    });

    this.input.addEventListener("blur", () => {
      setTimeout(() => this.hideSuggestions(), 200);
    });

    document.addEventListener("click", () => {
      this.input.focus();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.clearTerminal();
      }

      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        this.addToOutput('<span class="error">^C</span>');
        this.input.value = "";
        this.updateCursor();
      }
    });

    // Mobile support
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
    this.input.disabled = true;
    await this.sleep(500);

    await this.typeCommand("menu");
    await this.executeCommandSilent("menu");

    this.input.disabled = false;
    this.input.focus();
  }

  async typeCommand(command) {
    this.isTyping = true;
    this.input.value = "";

    for (let i = 0; i < command.length; i++) {
      this.input.value += command[i];
      this.updateCursor();
      await this.sleep(this.typewriterSpeed + Math.random() * 50);
    }

    await this.sleep(500);
    this.isTyping = false;
  }

  processCommand() {
    const command = this.input.value.trim().toLowerCase();
    if (command === "") return;

    this.addToOutput(
      `<span class="prompt">felipe-macedo@portfolio:~$ </span><span class="command">${this.input.value}</span>`
    );

    if (command !== this.commandHistory[this.commandHistory.length - 1]) {
      this.commandHistory.push(command);
      this.saveHistory();
    }
    this.historyIndex = -1;

    this.executeCommand(command);
    this.input.value = "";
    this.updateCursor();
  }

  executeCommand(command) {
    // Rastrear comando no Google Analytics
    if (typeof trackCommand === "function") {
      trackCommand(command);
    }

    if (this.commands[command]) {
      this.commands[command]();
    } else {
      this.showInvalidCommandFeedback();
      this.addToOutput(
        `<span class="error">❌ bash: ${command}: comando não encontrado</span>`
      );
      this.addToOutput(
        `<span class="output-text">💡 Digite '<span class='success'>help</span>' para ver os comandos disponíveis.</span>`
      );
    }
    this.scrollToBottom();
  }

  async executeCommandSilent(command) {
    if (this.commands[command]) {
      this.commands[command]();
    }
    this.scrollToBottom();
  }

  showHelp() {
    const helpText = `
<span class="highlight">📚 Comandos disponíveis:</span>

<span class="success">help</span>           - Mostra esta ajuda
<span class="success">clear</span>          - Limpa a tela
<span class="success">menu</span>           - Menu principal
<span class="success">about</span> | <span class="success">1</span>     - Sobre mim
<span class="success">projects</span> | <span class="success">2</span>   - Meus projetos
<span class="success">contact</span> | <span class="success">3</span>    - Informações de contato

<span class="highlight">🔧 Comandos extras:</span>
<span class="success">whoami</span>         - Quem sou eu?
<span class="success">skills</span>         - Tecnologias e níveis
<span class="success">experience</span>     - Timeline profissional
<span class="success">education</span>      - Formação acadêmica
<span class="success">certifications</span> - Certificados e cursos
<span class="success">resume</span>         - Download do currículo
<span class="success">status</span>         - Disponibilidade atual
<span class="success">date</span>           - Data e hora atual
<span class="success">ls</span>             - Lista arquivos
<span class="success">pwd</span>            - Diretório atual
<span class="success">sudo</span>           - Tentar privilégios de admin
<span class="success">theme dark/light/matrix/hacker/retro/contrast</span> - Mudar tema
<span class="success">coffee</span> | <span class="success">tdah</span> - Diagnóstico TDAH/cafeína

<span class="highlight">🎮 Easter eggs:</span>
<span class="success">h4x0r-mode</span>     - Modo hacker
<span class="success">matrix</span>         - Entre na Matrix
<span class="success">konami</span>         - Código Konami
<span class="success">glitch</span>         - Efeito glitch
<span class="success">ascii</span>          - Logo ASCII
<span class="success">growthfolio</span>    - Organização no GitHub
<span class="success">eastereggs</span>     - Lista de ovos de páscoa

<span class="warning">💡 Dica:</span> Use ↑/↓ para navegar no histórico, Tab para autocompletar
<span class="warning">⌨️ Atalhos:</span> Ctrl+L para limpar, Ctrl+C para interromper
                `;
    this.addToOutput(helpText);
  }

  clearTerminal() {
    this.output.classList.add("fade-out");
    setTimeout(() => {
      this.output.innerHTML = "";
      this.output.classList.remove("fade-out");
    }, 300);
  }

  async fetchVersion() {
    try {
      const repo = "felipemacedo1/felipemacedo1.github.io";
      const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
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
<span class="warning">💡 Dica: Digite '<span class="success">help</span>' para ver todos os comandos disponíveis!</span>
                `;
    this.addToOutput(menuText);
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
    `;
    this.addToOutput(introText);
  }

  showAbout() {
    const aboutText = `
<span class="ascii-art align-center">
    ╔════════════════════════════════════╗
                 👨‍💻 SOBRE MIM            
    ╚════════════════════════════════════╝
</span>

<span class="highlight">🧑‍💻 Felipe Macedo</span>
<span class="output-text">Desenvolvedor Full Cycle | Foco em Back-end e Arquitetura</span>

<span class="success">🎓 Formação Acadêmica:</span>
• Cursando Bacharelado em Ciência da Computação (FMU - 2025 a 2029)
• Graduando também em Gestão da TI (Anhembi Morumbi - conclusão em 2024)
• Bootcamps e certificações: AWS re/Start, Full Stack Java, Blockchain com Solidity

<span class="success">💼 Experiência:</span>
• Analista de Sistemas na Sansuy S.A. (Java, JavaFX, Spring Boot)
• Ex-Backend Developer na Asapcard (Go, soluções financeiras)

<span class="success">🛠️ Tecnologias que domino:</span>
• Java (8+), Spring Boot, JPA/Hibernate, JavaFX
• Go (Gorilla Mux, GORM), APIs REST, mensageria com RabbitMQ
• PostgreSQL, Redis, Docker, GitHub Actions
• HTML, CSS, TypeScript, React (para UIs pontuais)

<span class="success">🚀 Destaques:</span>
• Sistemas escaláveis com foco em performance e manutenção
• Arquiteturas baseadas em microsserviços e eventos
• Autenticação OAuth2, JWT, WebSockets e CI/CD com GitHub Actions

<span class="warning">💡 Curiosidade:</span> Sou apaixonado por sistemas financeiros, criptografia, automação e terminal retrô. E sim, café move código ☕.
    `;
    this.addToOutput(aboutText);
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

<div class="project-item">
<span class="project-title">🤖 ChatBot Inteligente com IA</span>
<span class="project-description">
Assistente virtual avançado com processamento de linguagem natural.
• <strong>Backend:</strong> Python + FastAPI com arquitetura modular
• <strong>IA:</strong> OpenAI GPT-4 + Custom training com fine-tuning
• <strong>Integração:</strong> WhatsApp Business API, Telegram, Slack, Discord
• <strong>Deploy:</strong> Docker containers + Google Cloud Run
• <strong>Features:</strong> Multi-idioma, Context awareness, Analytics dashboard
</span>
<span class="project-link">🔗 github.com/felipemacedo/ai-chatbot</span>
</div>

<span class="success">📋 Características dos Projetos:</span>
<span class="output-text">✅ Documentação completa com Swagger/OpenAPI</span>
<span class="output-text">🧪 Testes automatizados (Unit, Integration, E2E)</span>
<span class="output-text">🔄 CI/CD pipelines com GitHub Actions</span>
<span class="output-text">📊 Monitoramento e logging estruturado</span>
<span class="output-text">🔒 Práticas de segurança (OWASP Top 10)</span>
                `;
    this.addToOutput(projectsText);
  }

  showContact() {
    const contactText = `
<span class="ascii-art align-center">
    ╔═══════════════════════════╗
         💬 VAMOS CONVERSAR?    
    ╚═══════════════════════════╝
</span>

<span class="highlight">📧 Contato Profissional:</span>
<div class="contact-item">
<span class="contact-label">📧 Email:</span> contato.dev.macedo@gmail.com
</div>
<div class="contact-item">
<span class="contact-label">💼 LinkedIn:</span> linkedin.com/in/felipemacedo1
</div>
<div class="contact-item">
<span class="contact-label">🐙 GitHub:</span> github.com/felipemacedo1
</div>
<div class="contact-item">
<span class="contact-label">🌐 Portfolio:</span> https://github.com/orgs/growthfolio/
</div>

<span class="contact-label">📱 WhatsApp:</span> +55 (11) 99753-4105
</div>

<span class="success">📲 Redes Sociais:</span>
<div class="contact-item">
<span class="contact-label">🐦 Twitter(X):</span> ainda não tenho
</div>
<div class="contact-item">
<span class="contact-label">📸 Instagram:</span> é, sou low profile...(ou 'no profile')
</div>

<span class="warning">💼 Status:</span> <span class="success">✅ Disponível para freelances</span>

<span class="output-text">
📍 <strong>Localização:</strong> Itapecerica da Serra - São Paulo, Brasil
⏰ <strong>Fuso horário:</strong> GMT-3 (Brasília)
🗣️ <strong>Idiomas:</strong> Português (nativo), Inglês (desenvolvendo)
</span>

<span class="highlight">🚀 Vamos construir algo incrível juntos!</span>
                `;
    this.addToOutput(contactText);
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
    this.addToOutput(`<span class="output-text">📅 ${dateStr}</span>`);
  }

  listFiles() {
    const files = `
<span class="output-text">📁 Arquivos no diretório atual:</span>
<span class="success">📄 about.txt</span>      <span class="success">📝 projects.md</span>     <span class="success">📋 contact.json</span>
<span class="success">📄 resume.pdf</span>     <span class="success">⚙️ skills.yml</span>      <span class="success">💻 portfolio.js</span>
                `;
    this.addToOutput(files);
  }

  listFilesDetailed() {
    const detailedFiles = `
<span class="output-text">total 42</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  1337 Jul 29 10:30 <span class="success">📄 about.txt</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  2048 Jul 29 10:31 <span class="success">📝 projects.md</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe   512 Jul 29 10:32 <span class="success">📋 contact.json</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe  4096 Jul 29 10:33 <span class="success">📄 resume.pdf</span>
<span class="success">-rw-r--r--</span> 1 felipe felipe   256 Jul 29 10:34 <span class="success">⚙️ skills.yml</span>
<span class="success">-rwxr-xr-x</span> 1 felipe felipe  8192 Jul 29 10:35 <span class="success">💻 portfolio.js</span>
                `;
    this.addToOutput(detailedFiles);
  }

  showPath() {
    this.addToOutput(
      '<span class="output-text">📁 /home/felipe/portfolio</span>'
    );
  }

  sudoResponse() {
    const responses = [
      "🚫 Você não tem permissão para sudo neste sistema, Felipe! 😅",
      "🔐 sudo: Sorry, try again. (Just kidding, this is a portfolio!)",
      "🛡️ Nice try! But this terminal is read-only for visitors 🔒",
      "❌ sudo: command not found (in portfolio mode) 😏",
      "🤖 sudo: access denied. This is a safe environment! 🔐",
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    this.addToOutput(`<span class="warning">${randomResponse}</span>`);
  }

  changeTheme(theme) {
    const themes = {
      dark: "🌑 Escuro",
      light: "☀️ Claro",
      matrix: "🔢 Matrix",
      hacker: "🔴 Hacker",
      retro: "🟠 Retrô",
      contrast: "⚫ Alto Contraste",
    };

    this.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    this.saveTheme(theme);
    this.addToOutput(
      `<span class="success">🎨 Tema alterado para: ${
        themes[theme] || theme
      }</span>`
    );

    // Add smooth transition effect
    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  }

  hackerMode() {
    const hackerText = `
<span style="color: #ff0000; text-shadow: 0 0 10px #ff0000;">
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █░░░░░░░░░░░ 🔴 H4X0R MODE 🔴 ░░░░░░░░░░░█
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

    [🚨 SYSTEM BREACH DETECTED]
    [💻 ACCESSING MAINFRAME...]
    [👨‍💻 USER: felipe-macedo DETECTED]
    [🔓 PRIVILEGE LEVEL: GOD MODE]
    [🔓 BYPASS FIREWALL: SUCCESS]
    [📡 DOWNLOADING THE INTERNET: 69%]
    [🛡️ UPLOADING VIRUS: COMPLETED]
    
    Just kidding! 😄 I'm just a frontend developer.
    The only thing I hack is CSS layouts! 🎨
    
    🏆 Achievement Unlocked: "Elite Hacker" (Not Really)
</span>
                `;
    this.addToOutput(hackerText);
  }

  matrixMode() {
    const matrixText = `
<span style="color: #00ff00; font-weight: bold; text-shadow: 0 0 10px #00ff00;">
    💊 Wake up, Neo... 💊
    
    🌌 The Matrix has you...
    🐰 Follow the white rabbit. 
    
    🚪 Knock, knock, Neo.
    
    ⎡⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡  01001000
    ⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡  01100101
    ⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢⎣⎡⎢  01101100
    
    🔴 "There is no spoon, only code!" 🥄
    🔵 "Welcome to the real world." 
</span>
                `;
    this.addToOutput(matrixText);
  }

  konamiCode() {
    const konamiText = `
<span style="color: #ffaa00; text-shadow: 0 0 5px #ffaa00;">
    🎮 ↑ ↑ ↓ ↓ ← → ← → B A START
    
    🏆 KONAMI CODE ACTIVATED! 🏆
    
    You've unlocked... absolutely nothing! 😄
    But hey, you know the classic cheat code!
    
    📈 +30 Nostalgia Points
    🎯 +10 Retro Gaming Cred
    🏅 +1 Developer Street Cred
    
    🎖️ Achievement Unlocked: "Old School Gamer"
    
    Fun fact: This code was created in 1986! 🕰️
</span>
                `;
    this.addToOutput(konamiText);
  }

  ascii() {
    const art = `
<span class="ascii-art align-center">
┌─────────────────────────────────────────────────────────────┐
│  ███████ ███████ ██      ██ ██████  ███████                 │
│  ██      ██      ██      ██ ██   ██ ██                      │
│  █████   █████   ██      ██ ██████  █████                   │
│  ██      ██      ██      ██ ██      ██                      │
│  ██      ███████ ███████ ██ ██      ███████                 │
│                                                             │
│  ███    ███  █████   ██████ ███████ ██████   ██████         │
│  ████  ████ ██   ██ ██      ██      ██   ██ ██    ██        │
│  ██ ████ ██ ███████ ██      █████   ██   ██ ██    ██        │
│  ██  ██  ██ ██   ██ ██      ██      ██   ██ ██    ██        │
│  ██      ██ ██   ██  ██████ ███████ ██████   ██████         │
└─────────────────────────────────────────────────────────────┘
</span>
<span class="output-text">💻 Desenvolvedor Full Cycle | ☕ Java • 🐹 Go • 🍃 Spring Boot</span>
<span class="success">📊 Commits: ████████████████████████████████████████ 2.5k+</span>
`;
    this.addToOutput(art);
  }
  // um menu com todos os ovos de pascoa disponíveis
  eastereggs() {
    const list = `
<span class="highlight">🎮 Easter Eggs Disponíveis:</span>

• <span class="success">h4x0r-mode</span> – Hackeia tudo (mentira)
• <span class="success">matrix</span> – Entra na Matrix
• <span class="success">konami</span> – Código lendário
• <span class="success">coffee</span> – Diagnóstico de cafeína
• <span class="success">glitch</span> – Tela bugada
• <span class="success">sudo</span> – Sem permissão! 😅
• <span class="success">ascii</span> – Logo ASCII
• <span class="success">growthfolio</span> – Minha organização no GitHub
• <span class="success">joke</span> – Piadas de programador
• <span class="success">quote</span> – Citações inspiradoras
• <span class="success">stats</span> – Estatísticas da sessão
`;
    this.addToOutput(list);
  }

  growthfolio() {
    const msg = `
<span class="highlight">📁 growthfolio</span> - Minha organização no GitHub

🚀 Aqui centralizo meus estudos, bibliotecas úteis e projetos abertos.
📦 Inclui microserviços em Go, integrações com GPT, Stripe, Redis, Bitcoin e muito mais.

🔗 Acesse: <a href="https://github.com/growthfolio" target="_blank">github.com/growthfolio</a>
`;
    this.addToOutput(msg);
  }

  // give me a focoused text with a funny TDAH diagnosis
  needCoffee() {
    const CoffeeText = `
<span class="warning">
    🧠 Sistema cognitivo em sobrecarga! [TDAH Detected] 🚨

    📍 Foco atual: 47 abas abertas, 3 terminais rodando, 1 ideia brilhante esquecida.
    ⏳ Tempo médio de atenção: <span class="highlight">12.3 segundos</span>

    🔄 Rotina:
    - Abrir VSCode ➜ abrir navegador ➜ esquecer o que ia fazer
    - Tentar resolver um bug e acabar limpando a mesa inteira
    - Anotar tudo no Notion... mas em qual página?

    📋 Diagnóstico:
    [TDAH.ACTIVE] [MULTITHREADING_MODE=chaotic] [TASKS=42]

    💡 Solução recomendada:
    > deep_breath();  
    > close_tabs_except("portfolio");
    > pomodoro.start();

    🧃 Combustível atual: venvanse, motivação variável e playlists LoFi
</span>
    `;
    this.addToOutput(CoffeeText);
  }

  exitTerminal() {
    const exitText = `
<span class="warning">
    🚪 Logout attempt detected...
    
    But wait! You can't leave yet! 😅
    
    💻 This is a web portfolio, not a real terminal!
    🌐 Just close the browser tab if you really want to "exit".
    
    🎯 Or better yet, stick around and explore more!
    🚀 Try some easter eggs: matrix, h4x0r-mode, konami
    
    📧 Don't forget to check out my contact info! 
</span>
                `;
    this.addToOutput(exitText);
  }

  showSkills() {
    const skillsText = `
<span class="ascii-art align-center">
    ╔═══════════════════════════╗
        🛠️ STACK TECNOLÓGICO    
    ╚═══════════════════════════╝
</span>

<span class="highlight">🚀 Backend & APIs:</span>
<span class="success">Java</span>           █████████░ <span class="warning">90%</span> - Spring Boot, JPA, Hibernate
<span class="success">Go</span>             ████████░░ <span class="warning">80%</span> - Gorilla Mux, GORM, APIs REST
<span class="success">Spring Boot</span>   █████████░ <span class="warning">90%</span> - Microserviços, Security

<span class="highlight">📊 Banco de Dados:</span>
<span class="success">PostgreSQL</span>    ████████░░ <span class="warning">80%</span> - Queries complexas, Índices
<span class="success">Redis</span>         ███████░░░ <span class="warning">70%</span> - Cache, Sessions
<span class="success">MongoDB</span>       ██████░░░░ <span class="warning">60%</span> - NoSQL, Agregations

<span class="highlight">🐳 DevOps & Cloud:</span>
<span class="success">Docker</span>        ████████░░ <span class="warning">80%</span> - Containers, Compose
<span class="success">AWS</span>           ██████░░░░ <span class="warning">60%</span> - EC2, RDS, S3
<span class="success">GitHub Actions</span> ███████░░░ <span class="warning">70%</span> - CI/CD, Workflows

<span class="highlight">🌐 Frontend:</span>
<span class="success">HTML/CSS</span>      ████████░░ <span class="warning">80%</span> - Responsivo, Flexbox
<span class="success">JavaScript</span>   ███████░░░ <span class="warning">70%</span> - ES6+, DOM, APIs
<span class="success">React</span>         ██████░░░░ <span class="warning">60%</span> - Hooks, Context

<span class="highlight">🔧 Ferramentas:</span>
<span class="success">Git</span>           █████████░ <span class="warning">90%</span> - Workflows, Branching
<span class="success">IntelliJ IDEA</span> █████████░ <span class="warning">90%</span> - Debugging, Refactoring
<span class="success">Postman</span>       ████████░░ <span class="warning">80%</span> - API Testing
    `;
    this.addToOutput(skillsText);
  }

  showExperience() {
    const experienceText = `
<span class="ascii-art align-center">
    ╔════════════════════════════════════╗
          💼 EXPERIÊNCIA PROFISSIONAL    
    ╚════════════════════════════════════╝
</span>

<div class="project-item">
<span class="project-title">🏢 Analista de Sistemas - Sansuy S.A.</span>
<span class="project-description">
<strong>Período:</strong> 2024 - Atual
<strong>Localização:</strong> São Paulo, SP

• Desenvolvimento de sistemas corporativos com Java e JavaFX
• Integração de APIs REST com Spring Boot
• Manutenção e otimização de sistemas legados
• Colaboração em equipe ágil com metodologias Scrum

<strong>Tecnologias:</strong> Java 8+, Spring Boot, JavaFX, PostgreSQL, Git
</span>
</div>

<div class="project-item">
<span class="project-title">🚀 Backend Developer - Asapcard</span>
<span class="project-description">
<strong>Período:</strong> 2023 - 2024
<strong>Localização:</strong> Remoto

• Desenvolvimento de soluções financeiras em Go
• Arquitetura de microserviços escaláveis
• Integração com APIs de pagamento e bancos
• Implementação de segurança e autenticação

<strong>Tecnologias:</strong> Go, Gorilla Mux, GORM, Redis, Docker, PostgreSQL
</span>
</div>

<div class="project-item">
<span class="project-title">🎓 Desenvolvedor Trainee - Generation Brasil</span>
<span class="project-description">
<strong>Período:</strong> 2023
<strong>Localização:</strong> São Paulo, SP

• Bootcamp intensivo Full Stack Java
• Desenvolvimento de projetos em equipe
• Metodologias ágeis e soft skills
• Projeto final: E-commerce com Spring Boot

<strong>Tecnologias:</strong> Java, Spring Boot, MySQL, HTML, CSS, JavaScript
</span>
</div>

<span class="success">📈 Evolução Profissional:</span>
<span class="output-text">2023: Início na programação → 2024: Desenvolvedor Full Stack → 2025: Especialização em Arquitetura</span>
    `;
    this.addToOutput(experienceText);
  }

  showEducation() {
    const educationText = `
<span class="ascii-art align-center">
    ╔════════════════════════════════════════╗
               🎓 FORMAÇÃO ACADÊMICA    
    ╚════════════════════════════════════════╝
</span>

<div class="project-item">
<span class="project-title">🏦 Bacharelado em Ciência da Computação</span>
<span class="project-description">
<strong>Instituição:</strong> FMU - Faculdades Metropolitanas Unidas
<strong>Período:</strong> 2025 - 2029 (Cursando)
<strong>Status:</strong> 1º Semestre

• Fundamentos de Programação e Algoritmos
• Estruturas de Dados e Complexidade
• Engenharia de Software e Arquitetura
• Banco de Dados e Sistemas Distribuídos
</span>
</div>

<div class="project-item">
<span class="project-title">📊 Gestão da Tecnologia da Informação</span>
<span class="project-description">
<strong>Instituição:</strong> Anhembi Morumbi
<strong>Período:</strong> 2022 - 2024 (Concluído)
<strong>Status:</strong> Graduado

• Gestão de Projetos de TI
• Governança e Segurança da Informação
• Análise de Sistemas e Processos
• Infraestrutura e Redes
</span>
</div>

<span class="success">🏆 Destaques Acadêmicos:</span>
<span class="output-text">• Média geral: 8.5/10</span>
<span class="output-text">• Projetos práticos com tecnologias atuais</span>
<span class="output-text">• Participação em grupos de estudo</span>
<span class="output-text">• Foco em desenvolvimento backend e arquitetura</span>
    `;
    this.addToOutput(educationText);
  }

  showCertifications() {
    const certificationsText = `
<span class="ascii-art align-center">
    ╔════════════════════════════════════════╗
            🏅 CERTIFICAÇÕES & CURSOS            
    ╚════════════════════════════════════════╝
</span>

<span class="highlight">☁️ Cloud & DevOps:</span>
<div class="contact-item">
<span class="contact-label">🏅 AWS re/Start</span> - Amazon Web Services (2023)
</div>
<div class="contact-item">
<span class="contact-label">🐳 Docker Fundamentals</span> - Docker Inc. (2023)
</div>

<span class="highlight">🚀 Desenvolvimento:</span>
<div class="contact-item">
<span class="contact-label">☕ Java Full Stack</span> - Generation Brasil (2023)
</div>
<div class="contact-item">
<span class="contact-label">🍃 Spring Boot Expert</span> - Udemy (2023)
</div>
<div class="contact-item">
<span class="contact-label">🐹 Go Programming</span> - Curso Online (2023)
</div>

<span class="highlight">🔗 Blockchain & Web3:</span>
<div class="contact-item">
<span class="contact-label">⚡ Solidity Developer</span> - Blockchain Academy (2023)
</div>
<div class="contact-item">
<span class="contact-label">🪙 Smart Contracts</span> - Ethereum Foundation (2023)
</div>

<span class="highlight">📊 Dados & Analytics:</span>
<div class="contact-item">
<span class="contact-label">📈 SQL Advanced</span> - PostgreSQL Certification (2023)
</div>
<div class="contact-item">
<span class="contact-label">🔄 Redis Certified</span> - Redis University (2024)
</div>

<span class="success">🎯 Próximas Certificações (2025):</span>
<span class="output-text">• AWS Solutions Architect Associate</span>
<span class="output-text">• Oracle Certified Professional Java SE</span>
<span class="output-text">• Kubernetes Administrator (CKA)</span>
    `;
    this.addToOutput(certificationsText);
  }

  downloadResume() {
    const resumeText = `
<span class="highlight">📄 Download do Currículo</span>

<span class="warning">🚧 Funcionalidade em desenvolvimento...</span>

<span class="output-text">Por enquanto, você pode:</span>

• <span class="success">LinkedIn:</span> linkedin.com/in/felipemacedo1
• <span class="success">GitHub:</span> github.com/felipemacedo1
• <span class="success">Email:</span> contato.dev.macedo@gmail.com

<span class="output-text">Ou use os comandos:</span>
<span class="success">about</span> - Informações completas
<span class="success">experience</span> - Histórico profissional
<span class="success">skills</span> - Tecnologias e níveis

<span class="highlight">🔄 Em breve: PDF para download!</span>
    `;
    this.addToOutput(resumeText);
  }

  showStatus() {
    const statusText = `
<span class="ascii-art">
    ╔════════════════════════════════════════╗
    ║              🟢 STATUS PROFISSIONAL              ║
    ╚════════════════════════════════════════╝
</span>

<span class="success">🟢 DISPONÍVEL PARA OPORTUNIDADES</span>

<span class="highlight">💼 Modalidades de Trabalho:</span>
• <span class="success">✅ Freelances</span> - Projetos de curto/médio prazo
• <span class="success">✅ Consultoria</span> - Arquitetura e otimização
• <span class="success">✅ Remoto</span> - Preferencialmente
• <span class="success">✅ Híbrido</span> - São Paulo/SP

<span class="highlight">🎯 Áreas de Interesse:</span>
• <span class="warning">Backend Development</span> (Java, Go, Spring Boot)
• <span class="warning">Arquitetura de Microserviços</span>
• <span class="warning">APIs REST & GraphQL</span>
• <span class="warning">Sistemas Financeiros</span>
• <span class="warning">DevOps & Cloud</span>

<span class="highlight">⏰ Disponibilidade:</span>
<span class="output-text">📅 <strong>Imediata</strong> para projetos freelance</span>
<span class="output-text">📅 <strong>30 dias</strong> para posições CLT</span>

<span class="highlight">📞 Entre em Contato:</span>
<span class="output-text">📧 contato.dev.macedo@gmail.com</span>
<span class="output-text">📱 +55 (11) 99753-4105</span>
<span class="output-text">👤 linkedin.com/in/felipemacedo1</span>

<span class="success">🚀 Vamos construir algo incrível juntos!</span>
    `;
    this.addToOutput(statusText);
  }

  showJoke() {
    const jokes = [
      "🤖 Por que os programadores preferem o modo escuro?\nPorque a luz atrai bugs!",
      "🐛 Como você chama um bug que não consegue ser corrigido?\nUm feature!",
      "💻 Por que os programadores odeiam a natureza?\nTem muitos bugs e a documentação é terrível!",
      "☕ Quantos programadores são necessários para trocar uma lâmpada?\nNenhum, isso é um problema de hardware!",
      '🔄 "Funciona na minha máquina" - Famosas últimas palavras',
      "📊 99 bugs no código, 99 bugs...\nTira um, corrige ao redor, 127 bugs no código!",
      "🔍 Por que os programadores Java usam óculos?\nPorque não conseguem C# (see sharp)!",
    ];

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    this.addToOutput(
      `<span class="highlight">🎭 Piada do Dia:</span>\n<span class="output-text">${randomJoke}</span>`
    );
  }

  showQuote() {
    const quotes = [
      '"O código é como humor. Quando você tem que explicá-lo, é ruim." - Cory House',
      '"Primeiro, resolva o problema. Depois, escreva o código." - John Johnson',
      '"A melhor maneira de prever o futuro é inventá-lo." - Alan Kay',
      '"Qualquer tolo pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem." - Martin Fowler',
      '"A programação não é sobre o que você sabe; é sobre o que você pode descobrir." - Chris Pine',
      '"Experiencia é o nome que damos aos nossos erros." - Oscar Wilde',
      '"O único jeito de aprender uma nova linguagem de programação é escrevendo programas nela." - Dennis Ritchie',
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    this.addToOutput(
      `<span class="highlight">💭 Citação Inspiradora:</span>\n<span class="output-text">${randomQuote}</span>`
    );
  }

  showStats() {
    const stats = {
      comandos: this.commandHistory.length,
      tema: this.currentTheme,
      sessao: Math.floor((Date.now() - this.startTime) / 1000),
      favorito: this.getMostUsedCommand(),
    };

    const statsText = `
<span class="ascii-art">
    ╔════════════════════════════════════════╗
    ║            📈 ESTATÍSTICAS DA SESSÃO            ║
    ╚════════════════════════════════════════╝
</span>

<span class="highlight">📊 Dados da Sessão:</span>
<span class="output-text">• <strong>Comandos executados:</strong> ${
      stats.comandos
    }</span>
<span class="output-text">• <strong>Tempo de sessão:</strong> ${
      stats.sessao
    }s</span>
<span class="output-text">• <strong>Tema atual:</strong> ${stats.tema}</span>
<span class="output-text">• <strong>Comando favorito:</strong> ${
      stats.favorito
    }</span>

<span class="highlight">🎯 Performance:</span>
<span class="output-text">• <strong>Comandos/minuto:</strong> ${(
      stats.comandos /
      (stats.sessao / 60)
    ).toFixed(1)}</span>
<span class="output-text">• <strong>Eficiência:</strong> ${
      stats.comandos > 10
        ? "Expert"
        : stats.comandos > 5
        ? "Intermediário"
        : "Iniciante"
    }</span>

<span class="success">🏆 Continue explorando para descobrir mais comandos!</span>
    `;
    this.addToOutput(statsText);
  }

  getMostUsedCommand() {
    if (this.commandHistory.length === 0) return "nenhum";

    const frequency = {};
    this.commandHistory.forEach((cmd) => {
      frequency[cmd] = (frequency[cmd] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b
    );
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          this.addToOutput(
            '<span class="success">🖥️ Modo tela cheia ativado! Pressione ESC para sair.</span>'
          );
        })
        .catch(() => {
          this.addToOutput(
            '<span class="error">❌ Erro ao ativar tela cheia. Navegador não suporta.</span>'
          );
        });
    } else {
      document.exitFullscreen().then(() => {
        this.addToOutput(
          '<span class="warning">📵 Modo tela cheia desativado.</span>'
        );
      });
    }
  }

  showInvalidCommandFeedback() {
    const terminal = document.querySelector(".terminal-container");
    terminal.style.animation = "shake 0.5s";
    setTimeout(() => {
      terminal.style.animation = "";
    }, 500);
  }

  glitchEffect() {
    const terminal = document.querySelector(".terminal-container");
    terminal.style.animation = "glitch 0.3s";
    setTimeout(() => {
      terminal.style.animation = "";
    }, 300);

    this.addToOutput(
      '<span class="error">👾 System glitch detected... Reality.exe has stopped working</span>'
    );
    this.addToOutput(
      '<span class="warning">🔧 Rebooting matrix... Please wait...</span>'
    );

    setTimeout(() => {
      this.addToOutput(
        '<span class="success">✅ System restored. Welcome back to the simulation!</span>'
      );
    }, 1000);
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem("terminal-history") || "[]");
    } catch {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(
        "terminal-history",
        JSON.stringify(this.commandHistory.slice(-50))
      );
    } catch {}
  }

  loadTheme() {
    return localStorage.getItem("terminal-theme") || "dark";
  }

  saveTheme(theme) {
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch {}
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
        this.input.value = "";
        this.updateCursor();
        return;
      }
    }

    this.input.value = this.commandHistory[this.historyIndex] || "";
    this.updateCursor();
  }

  showSuggestions() {
    const currentInput = this.input.value.toLowerCase();
    if (!currentInput || currentInput.length < 2) {
      this.hideSuggestions();
      return;
    }

    const availableCommands = Object.keys(this.commands);
    this.suggestions = availableCommands
      .filter((cmd) => cmd.includes(currentInput) && cmd !== currentInput)
      .sort((a, b) => {
        const aStarts = a.startsWith(currentInput);
        const bStarts = b.startsWith(currentInput);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length;
      })
      .slice(0, 4);

    if (this.suggestions.length > 0) {
      this.displaySuggestions();
    } else {
      this.hideSuggestions();
    }
  }

  displaySuggestions() {
    let suggestionBox = document.getElementById("suggestions");
    if (!suggestionBox) {
      suggestionBox = document.createElement("div");
      suggestionBox.id = "suggestions";
      suggestionBox.style.cssText = `
              position: absolute;
              background: rgba(0, 0, 0, 0.98);
              border: 1px solid #00ff00;
              border-radius: 6px;
              padding: 4px 0;
              bottom: 30px;
              left: 0;
              min-width: 180px;
              max-width: 300px;
              z-index: 1000;
              font-family: inherit;
              font-size: 11px;
              box-shadow: 0 -4px 12px rgba(0, 255, 0, 0.3);
              backdrop-filter: blur(8px);
            `;
      document.getElementById("inputLine").appendChild(suggestionBox);
    }

    const currentInput = this.input.value.toLowerCase();
    suggestionBox.innerHTML = this.suggestions
      .map((cmd, index) => {
        const highlighted = cmd.replace(
          new RegExp(`(${currentInput})`, "gi"),
          '<span style="background: rgba(0,255,255,0.3); color: #00ffff;">$1</span>'
        );
        return `<div style="padding: 6px 12px; color: ${
          index === this.suggestionIndex ? "#00ffff" : "#00ff00"
        }; cursor: pointer; border-radius: 3px; transition: all 0.15s; display: flex; align-items: center;" onmouseover="this.style.background='rgba(0,255,0,0.15)'; this.style.color='#00ffff'" onmouseout="this.style.background='transparent'; this.style.color='#00ff00'" onclick="terminal.selectSuggestion('${cmd}')"><span style="margin-right: 8px;">▶</span>${highlighted}</div>`;
      })
      .join("");
  }

  hideSuggestions() {
    const suggestionBox = document.getElementById("suggestions");
    if (suggestionBox) {
      suggestionBox.remove();
    }
    this.suggestions = [];
    this.suggestionIndex = -1;
  }

  selectSuggestion(cmd) {
    this.input.value = cmd;
    this.hideSuggestions();
    this.updateCursor();
    this.input.focus();
  }

  autoComplete() {
    const currentInput = this.input.value.toLowerCase();
    if (!currentInput) return;

    const availableCommands = Object.keys(this.commands);
    const matches = availableCommands.filter(
      (cmd) => cmd.startsWith(currentInput) && cmd !== currentInput
    );

    if (matches.length === 1) {
      this.input.value = matches[0];
      this.updateCursor();
      this.hideSuggestions();
    } else if (matches.length > 1) {
      this.addToOutput(
        `<span class="prompt">felipe-macedo@portfolio:~$ </span><span class="command">${currentInput}</span>`
      );
      this.addToOutput(
        `<span class="output-text">💡 Opções disponíveis: <span class="success">${matches.join(
          ", "
        )}</span></span>`
      );
      this.scrollToBottom();
    }
  }

  updateCursor() {
    const inputRect = this.input.getBoundingClientRect();
    const containerRect = this.input.parentElement.getBoundingClientRect();
    const textWidth = this.getTextWidth(this.input.value, this.input);

    this.cursor.style.left = `${
      textWidth + inputRect.left - containerRect.left
    }px`;
  }

  getTextWidth(text, element) {
    const canvas =
      this.getTextWidth.canvas ||
      (this.getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    const computedStyle = window.getComputedStyle(element);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    return context.measureText(text).width;
  }

  addToOutput(text) {
    const outputElement = document.createElement("div");
    outputElement.innerHTML = text;
    this.output.appendChild(outputElement);
  }

  scrollToBottom() {
    const terminal = document.getElementById("terminal");
    terminal.scrollTop = terminal.scrollHeight;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Mobile keyboard functions
function typeChar(char) {
  const input = document.getElementById("commandInput");
  input.value += char;
  input.focus();
}

function typeCommand(command) {
  const input = document.getElementById("commandInput");
  input.value = command;
  input.focus();

  // Trigger enter key
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
  });
  input.dispatchEvent(event);
}

// Initialize terminal when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.terminal = new TerminalPortfolio();
});

// Add loading screen
window.addEventListener("load", () => {
  const loadingScreen = document.createElement("div");
  loadingScreen.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: #00ff00;
                    font-family: 'Courier New', monospace;
                ">
                    <div style="text-align: center;">
                        <div class="loading"></div>
                        <p style="margin-top: 20px;">Inicializando terminal...</p>
                    </div>
                </div>
            `;

  document.body.appendChild(loadingScreen);

  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    loadingScreen.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      document.body.removeChild(loadingScreen);
    }, 500);
  }, 1500);
});
