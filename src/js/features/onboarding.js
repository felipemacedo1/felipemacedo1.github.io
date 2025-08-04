// Minimal Onboarding System
export class Onboarding {
  constructor(terminal) {
    this.terminal = terminal;
    this.isFirstVisit = !localStorage.getItem('visited');
    this.progress = JSON.parse(localStorage.getItem('progress') || '{"commands": [], "level": 0}');
  }

  init() {
    if (this.isFirstVisit) {
      setTimeout(() => this.showWelcome(), 1000);
      localStorage.setItem('visited', 'true');
    }
  }

  showWelcome() {
    this.terminal.addOutput(`
<div class="welcome-guide">
  <div class="guide-header">🎯 Bem-vindo ao Terminal Portfolio!</div>
  <div class="guide-steps">
    <div class="step">1. Digite <span class="cmd">help</span> para ver comandos</div>
    <div class="step">2. Experimente <span class="cmd">about</span> para me conhecer</div>
    <div class="step">3. Use <span class="cmd">projects</span> para ver meu trabalho</div>
  </div>
  <div class="guide-tip">💡 Use ↑↓ para navegar no histórico</div>
</div>`, 'system');
  }

  trackCommand(cmd) {
    if (!this.progress.commands.includes(cmd)) {
      this.progress.commands.push(cmd);
      this.checkProgress();
      this.saveProgress();
    }
  }

  checkProgress() {
    const count = this.progress.commands.length;
    if (count === 3) this.showAchievement('🏆 Explorer', 'Descobriu 3 comandos!');
    if (count === 7) this.showAchievement('🎖️ Expert', 'Descobriu 7 comandos!');
  }

  showAchievement(title, desc) {
    this.terminal.addOutput(`
<div class="achievement">
  <div class="achievement-title">${title}</div>
  <div class="achievement-desc">${desc}</div>
</div>`, 'achievement');
  }

  saveProgress() {
    localStorage.setItem('progress', JSON.stringify(this.progress));
  }
}