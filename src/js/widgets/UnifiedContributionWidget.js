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
      console.log('🔧 Initializing UnifiedContributionWidget with options:', this.options);
      
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
      console.log('✅ UnifiedContributionWidget initialized successfully');
      
    } catch (error) {
      console.error('❌ UnifiedContributionWidget init error:', error);
      this.renderError(`Erro ao inicializar widget: ${error.message}`);
      throw error; // Re-throw so parent can handle
    }
  }

  renderError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'unified-widget-error';
    
    const errorIcon = document.createElement('span');
    errorIcon.className = 'error-icon';
    errorIcon.textContent = '⚠️';
    
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    
    errorDiv.appendChild(errorIcon);
    errorDiv.appendChild(errorMessage);
    errorDiv.appendChild(style);
    
    this.container.innerHTML = '';
    this.container.appendChild(errorDiv);
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
