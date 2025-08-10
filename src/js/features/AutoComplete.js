// Auto-complete functionality
export class AutoComplete {
  constructor(terminal, commandProcessor) {
    this.terminal = terminal;
    this.commandProcessor = commandProcessor;
    this.suggestions = [];
    this.suggestionIndex = -1;
    this.debounceTimer = null;
    this.isVisible = false;
  }

  showSuggestions(input) {
    // Debounce para melhor performance
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this._processSuggestions(input);
    }, 150);
  }

  _processSuggestions(input) {
    const currentInput = input.toLowerCase().trim();
    
    // Mostrar sugestões a partir de 1 caractere
    if (!currentInput || currentInput.length < 1) {
      this.hideSuggestions();
      return;
    }

    const availableCommands = this.commandProcessor.getAvailableCommands();
    
    // Algoritmo de relevância melhorado
    this.suggestions = availableCommands
      .filter((cmd) => cmd !== currentInput)
      .map(cmd => ({
        command: cmd,
        score: this._calculateRelevanceScore(cmd, currentInput)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.command);

    if (this.suggestions.length > 0) {
      this.displaySuggestions(currentInput);
      this.isVisible = true;
    } else {
      this.hideSuggestions();
    }
  }

  _calculateRelevanceScore(command, input) {
    const cmd = command.toLowerCase();
    const inp = input.toLowerCase();
    
    // Comando exato = não mostrar
    if (cmd === inp) return 0;
    
    // Pontuação baseada em relevância
    let score = 0;
    
    // Começa com o input (maior relevância)
    if (cmd.startsWith(inp)) score += 100;
    
    // Contém o input
    else if (cmd.includes(inp)) score += 50;
    
    // Bonus para comandos mais curtos (mais específicos)
    score += Math.max(0, 20 - cmd.length);
    
    // Bonus para comandos populares
    const popularCommands = ['help', 'about', 'projects', 'contact', 'clear', 'menu', 'skills', 'whoami', 'status'];
    if (popularCommands.includes(cmd)) score += 10;
    
    return score;
  }

  displaySuggestions(currentInput) {
    let suggestionBox = document.getElementById("suggestions");
    if (!suggestionBox) {
      suggestionBox = document.createElement("div");
      suggestionBox.id = "suggestions";
      suggestionBox.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #00ff00;
        border-radius: 6px;
        padding: 4px 0;
        bottom: 100%;
        left: 0;
        margin-bottom: 5px;
        min-width: 200px;
        max-width: 350px;
        z-index: 999999 !important;
        max-height: 200px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        box-shadow: 0 -4px 12px rgba(0, 255, 0, 0.3);
        backdrop-filter: blur(8px);
        animation: slideUp 0.2s ease;
        overflow-y: auto;
      `;
      document.getElementById("inputLine").appendChild(suggestionBox);
    }

    suggestionBox.innerHTML = this.suggestions
      .map((cmd, index) => {
        const highlighted = this._highlightMatch(cmd, currentInput);
        const isActive = index === this.suggestionIndex;
        
        return `<div class="suggestion-item ${
          isActive ? "active" : ""
        }" 
        data-command="${cmd}"
        onmouseenter="this.classList.add('hover')"
        onmouseleave="this.classList.remove('hover')"
        onclick="window.terminal?.selectSuggestion?.('${cmd}') || window.mobileBIOS?.selectSuggestion?.('${cmd}')"
        style="
          padding: 8px 12px;
          color: ${isActive ? '#00ffff' : '#00ff00'};
          background: ${isActive ? 'rgba(0, 255, 0, 0.1)' : 'transparent'};
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          border-left: 3px solid ${isActive ? '#00ffff' : 'transparent'};
          white-space: nowrap;
        ">
          <span style="margin-right: 8px; opacity: 0.7; font-size: 10px;">▶</span>
          <span style="flex: 1;">${highlighted}</span>
          <span style="margin-left: 8px; font-size: 9px; opacity: 0.5;">↵</span>
        </div>`;
      })
      .join("");

    // Não auto-selecionar sugestões para evitar seleção acidental
  }

  _highlightMatch(command, input) {
    if (!input) return this._sanitizeHTML(command);
    
    const sanitizedCommand = this._sanitizeHTML(command);
    const sanitizedInput = this._sanitizeHTML(input);
    const regex = new RegExp(`(${this._escapeRegex(sanitizedInput)})`, 'gi');
    return sanitizedCommand.replace(regex, '<span style="background: rgba(0,255,255,0.3); color: #00ffff; font-weight: bold;">$1</span>');
  }

  _sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  hideSuggestions() {
    clearTimeout(this.debounceTimer);
    const suggestionBox = document.getElementById("suggestions");
    if (suggestionBox) {
      suggestionBox.style.animation = 'fadeOut 0.15s ease';
      setTimeout(() => suggestionBox.remove(), 150);
    }
    this.suggestions = [];
    this.suggestionIndex = -1;
    this.isVisible = false;
  }

  selectSuggestion(cmd) {
    this.terminal.input.value = cmd;
    this.hideSuggestions();
    this.terminal.updateCursor();
    this.terminal.input.focus();
    
    // Feedback visual
    this.terminal.input.style.background = 'rgba(0, 255, 0, 0.1)';
    setTimeout(() => {
      this.terminal.input.style.background = 'transparent';
    }, 200);
  }

  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return false;

    const prevIndex = this.suggestionIndex;
    
    if (direction === "up") {
      // Começar do final se nenhuma sugestão estiver selecionada
      this.suggestionIndex =
        this.suggestionIndex <= 0
          ? this.suggestions.length - 1
          : this.suggestionIndex - 1;
    } else {
      // Começar do início se nenhuma sugestão estiver selecionada
      this.suggestionIndex =
        this.suggestionIndex >= this.suggestions.length - 1
          ? 0
          : this.suggestionIndex + 1;
    }

    // Só re-renderizar se o índice mudou
    if (prevIndex !== this.suggestionIndex) {
      this.displaySuggestions(this.terminal.input.value.toLowerCase());
    }
    
    return true;
  }

  autoComplete(input) {
    const currentInput = input.toLowerCase().trim();
    if (!currentInput) return false;

    // Apenas usar sugestão se explicitamente navegada pelo usuário
    if (this.isVisible && this.suggestionIndex > 0 && this.suggestions[this.suggestionIndex]) {
      this.selectSuggestion(this.suggestions[this.suggestionIndex]);
      return true;
    }

    const availableCommands = this.commandProcessor.getAvailableCommands();
    const exactMatches = availableCommands.filter(
      (cmd) => cmd.startsWith(currentInput) && cmd !== currentInput
    );

    if (exactMatches.length === 1) {
      // Auto-completar único match
      this.terminal.input.value = exactMatches[0];
      this.terminal.updateCursor();
      this.hideSuggestions();
      return true;
    } else if (exactMatches.length > 1) {
      // Não imprimir nada, apenas mostrar sugestões
      this.showSuggestions(currentInput);
      return true;
    }

    return false;
  }

  showCommandPreview(command) {
    const descriptions = {
      help: 'Mostra todos os comandos disponíveis',
      about: 'Informações sobre Felipe Macedo',
      projects: 'Portfólio de projetos desenvolvidos',
      contact: 'Informações de contato profissional',
      clear: 'Limpa a tela do terminal',
      menu: 'Menu principal do portfolio',
      skills: 'Tecnologias e níveis de conhecimento',
      whoami: 'Apresentação rápida',
      contributions: 'Gráfico interativo de contribuições GitHub',
      demo: 'Demonstração das funcionalidades',
      start: 'Tour guiado para iniciantes'
    };
    
    return descriptions[command] || 'Comando disponível';
  }
}