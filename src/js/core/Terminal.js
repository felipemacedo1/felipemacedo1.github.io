// Core Terminal functionality
export class Terminal {
  constructor() {
    this.output = document.getElementById("output");
    this.input = document.getElementById("commandInput");
    this.cursor = document.getElementById("cursor");
    this.isTyping = false;
    this.typewriterSpeed = 50;
    
    // Inicializar cursor na posição correta
    this.updateCursor();
  }

  addToOutput(text, type = 'normal') {
    const outputElement = document.createElement("div");
    
    if (type === 'system' || type === 'achievement') {
      outputElement.innerHTML = text; // Allow HTML for system messages
    } else {
      outputElement.textContent = text; // Sanitize user content
    }
    
    if (type === 'achievement') {
      outputElement.classList.add('achievement-output');
    }
    
    this.output.appendChild(outputElement);
    this.scrollToBottom();
  }

  clearTerminal() {
    this.output.classList.add("fade-out");
    setTimeout(() => {
      this.output.innerHTML = "";
      this.output.classList.remove("fade-out");
    }, 300);
  }

  scrollToBottom() {
    const terminal = document.getElementById("terminal");
    terminal.scrollTop = terminal.scrollHeight;
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

  updateCursor() {
    if (!this.input || !this.cursor) return;
    
    const inputRect = this.input.getBoundingClientRect();
    const containerRect = this.input.parentElement.getBoundingClientRect();
    const textWidth = this.getTextWidth(this.input.value || '', this.input);

    // Calcular posição do cursor após o texto (ou no início se vazio)
    const leftPosition = textWidth + inputRect.left - containerRect.left;
    this.cursor.style.left = `${leftPosition}px`;
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

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  showInvalidCommandFeedback() {
    const terminal = document.querySelector(".terminal-container");
    terminal.style.animation = "shake 0.5s";
    setTimeout(() => {
      terminal.style.animation = "";
    }, 500);
  }
}