// Core Terminal functionality
export class Terminal {
  constructor() {
    this.output = document.getElementById("output");
    this.input = document.getElementById("commandInput");
    this.cursor = document.getElementById("cursor");
    this.isTyping = false;
    this.typewriterSpeed = 50;
  }

  addToOutput(text) {
    const outputElement = document.createElement("div");
    // Sanitize HTML to prevent XSS and code injection
    outputElement.textContent = text;
    this.output.appendChild(outputElement);
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