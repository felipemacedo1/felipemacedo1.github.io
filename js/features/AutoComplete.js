// Auto-complete functionality
export class AutoComplete {
  constructor(terminal, commandProcessor) {
    this.terminal = terminal;
    this.commandProcessor = commandProcessor;
    this.suggestions = [];
    this.suggestionIndex = -1;
  }

  showSuggestions(input) {
    const currentInput = input.toLowerCase();
    if (!currentInput || currentInput.length < 2) {
      this.hideSuggestions();
      return;
    }

    const availableCommands = this.commandProcessor.getAvailableCommands();
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
      this.displaySuggestions(currentInput);
    } else {
      this.hideSuggestions();
    }
  }

  displaySuggestions(currentInput) {
    let suggestionBox = document.getElementById("suggestions");
    if (!suggestionBox) {
      suggestionBox = document.createElement("div");
      suggestionBox.id = "suggestions";
      suggestionBox.className = "suggestion-box";
      document.getElementById("inputLine").appendChild(suggestionBox);
    }

    suggestionBox.innerHTML = this.suggestions
      .map((cmd, index) => {
        const highlighted = cmd.replace(
          new RegExp(`(${currentInput})`, "gi"),
          '<span class="suggestion-highlight">$1</span>'
        );
        return `<div class="suggestion-item ${
          index === this.suggestionIndex ? "active" : ""
        }" onclick="terminal.selectSuggestion('${cmd}')">
          <span class="suggestion-arrow">▶</span>${highlighted}
        </div>`;
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
    this.terminal.input.value = cmd;
    this.hideSuggestions();
    this.terminal.updateCursor();
    this.terminal.input.focus();
  }

  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return false;

    if (direction === "up") {
      this.suggestionIndex =
        this.suggestionIndex <= 0
          ? this.suggestions.length - 1
          : this.suggestionIndex - 1;
    } else {
      this.suggestionIndex =
        this.suggestionIndex >= this.suggestions.length - 1
          ? 0
          : this.suggestionIndex + 1;
    }

    this.displaySuggestions(this.terminal.input.value.toLowerCase());
    return true;
  }

  autoComplete(input) {
    const currentInput = input.toLowerCase();
    if (!currentInput) return false;

    const availableCommands = this.commandProcessor.getAvailableCommands();
    const matches = availableCommands.filter(
      (cmd) => cmd.startsWith(currentInput) && cmd !== currentInput
    );

    if (matches.length === 1) {
      this.terminal.input.value = matches[0];
      this.terminal.updateCursor();
      this.hideSuggestions();
      return true;
    } else if (matches.length > 1) {
      this.terminal.addToOutput(
        `<span class="prompt">felipe-macedo@portfolio:~$ </span><span class="command">${currentInput}</span>`
      );
      this.terminal.addToOutput(
        `<span class="output-text">💡 Opções disponíveis: <span class="success">${matches.join(
          ", "
        )}</span></span>`
      );
      this.terminal.scrollToBottom();
      return true;
    }

    return false;
  }
}