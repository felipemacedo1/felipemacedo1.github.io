// Command processing and execution
export class CommandProcessor {
  constructor(terminal) {
    this.terminal = terminal;
    this.commands = new Map();
  }

  registerCommand(name, handler) {
    this.commands.set(name, handler);
  }

  registerCommands(commandMap) {
    Object.entries(commandMap).forEach(([name, handler]) => {
      this.registerCommand(name, handler);
    });
  }

  async processCommand(input) {
    const trimmedInput = input.trim();
    if (trimmedInput === "") return;

    this.terminal.addToOutput(
      `<span class="prompt">felipe-macedo@portfolio:~$ </span><span class="command">${this.sanitizeInput(input)}</span>`, 'system'
    );

    await this.executeCommand(trimmedInput);
    this.terminal.scrollToBottom();
  }

  async executeCommand(input) {
    // Parse command and arguments
    const parts = input.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (typeof trackCommand === "function") {
      trackCommand(command);
    }

    if (this.commands.has(command)) {
      const handler = this.commands.get(command);
      try {
        // Support both sync and async command handlers
        const result = handler(args);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error(`Error executing command '${this.sanitizeLogInput(command)}':`, error);
        this.terminal.addToOutput(
          `<span class="error">❌ Erro ao executar comando: ${error.message}</span>`, 'system'
        );
      }
    } else {
      this.terminal.showInvalidCommandFeedback();
      this.terminal.addToOutput(
        `<span class="error">❌ bash: ${command}: comando não encontrado</span>`, 'system'
      );
      this.terminal.addToOutput(
        `<span class="output-text">💡 Digite '<span class='success'>help</span>' para ver os comandos disponíveis.</span>`, 'system'
      );
    }
  }

  async executeCommandSilent(input) {
    // Parse command and arguments for silent execution too
    const parts = input.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands.has(command)) {
      try {
        const handler = this.commands.get(command);
        const result = handler(args);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error(`Error executing silent command '${this.sanitizeLogInput(command)}':`, error);
      }
    }
    this.terminal.scrollToBottom();
  }

  sanitizeInput(input) {
    // Basic XSS prevention for display
    if (typeof input !== 'string') return String(input);
    return input.replace(/[<>"'&]/g, function(match) {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
  }

  sanitizeLogInput(input) {
    // Prevent log injection by removing control characters and newlines
    if (typeof input !== 'string') return String(input);
    return input.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '');
  }

  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
}