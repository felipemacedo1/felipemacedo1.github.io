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

  processCommand(input) {
    const command = input.trim().toLowerCase();
    if (command === "") return;

    this.terminal.addToOutput(
      `<span class="prompt">felipe-macedo@portfolio:~$ </span><span class="command">${input}</span>`, 'system'
    );

    this.executeCommand(command);
    this.terminal.scrollToBottom();
  }

  executeCommand(command) {
    if (typeof trackCommand === "function") {
      trackCommand(command);
    }

    if (this.commands.has(command)) {
      this.commands.get(command)();
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

  async executeCommandSilent(command) {
    if (this.commands.has(command)) {
      this.commands.get(command)();
    }
    this.terminal.scrollToBottom();
  }

  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
}