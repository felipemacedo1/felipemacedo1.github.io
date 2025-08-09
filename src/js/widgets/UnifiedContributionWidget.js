/**
 * UnifiedContributionWidget - Consolidated contribution graph widget
 * Now uses modular components for better maintainability
 * Supports multiple themes, sizes, and integration modes (terminal, mobile, standalone)
 */
import ModularContributionWidget from './ModularContributionWidget.js';

class UnifiedContributionWidget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling', // rolling, 2024, 2023, etc.
      size: 'compact', // compact, normal, large
      theme: 'github', // github, terminal, bios
      mode: 'widget', // widget, terminal, mobile, standalone
      showStats: true,
      showTooltips: true,
      showControls: true,
      enableInteraction: true,
      ...options
    };
    
    this.modularWidget = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize the modular widget with our options
      this.modularWidget = new ModularContributionWidget(this.container, {
        author: this.options.author,
        period: this.options.period,
        theme: this.options.theme,
        size: this.options.size,
        showStats: this.options.showStats,
        showControls: this.options.showControls && this.options.mode !== 'terminal',
        showTooltips: this.options.showTooltips,
        showLegend: this.options.size !== 'compact'
      });
      
      await this.modularWidget.init();
      this.isInitialized = true;
    } catch (error) {
      console.error('UnifiedContributionWidget init error:', error);
      this.renderError('Erro ao inicializar widget de contribuições');
    }
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="unified-widget-error">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <style>
          .unified-widget-error {
            color: #f85149;
            text-align: center;
            padding: 20px;
            font-size: 14px;
            background: rgba(248, 81, 73, 0.1);
            border: 1px solid rgba(248, 81, 73, 0.3);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
        </style>
      </div>
    `;
  }

  // Public API methods for backward compatibility and external control
  async setPeriod(period) {
    if (this.modularWidget) {
      await this.modularWidget.setPeriod(period);
    }
    this.options.period = period;
  }

  setTheme(theme) {
    if (this.modularWidget) {
      this.modularWidget.setTheme(theme);
    }
    this.options.theme = theme;
  }

  setSize(size) {
    if (this.modularWidget) {
      this.modularWidget.setSize(size);
    }
    this.options.size = size;
  }

  async refresh() {
    if (this.modularWidget) {
      await this.modularWidget.loadData();
      this.modularWidget.updateComponents();
    }
  }

  // Legacy methods for backward compatibility
  async loadData() {
    if (this.modularWidget) {
      return await this.modularWidget.loadData();
    }
  }

  render() {
    if (this.modularWidget) {
      this.modularWidget.render();
    }
  }

  attachEventListeners() {
    if (this.modularWidget) {
      this.modularWidget.attachEventListeners();
    }
  }
}

// Export for module usage
export { UnifiedContributionWidget };
export default UnifiedContributionWidget;

// Also make available globally for legacy usage
if (typeof window !== 'undefined') {
  window.UnifiedContributionWidget = UnifiedContributionWidget;
}
