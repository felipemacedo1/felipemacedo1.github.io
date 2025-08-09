/**
 * ModularContributionWidget - Componente modular para gráficos de contribuição
 * Substitui o EnhancedContributionGraph usando componentes menores e reutilizáveis
 */
import ContributionStatsCard from './components/ContributionStatsCard.js';
import ContributionGridRenderer from './components/ContributionGridRenderer.js';
import ContributionControls from './components/ContributionControls.js';

class ModularContributionWidget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling',
      theme: 'github',
      size: 'normal', // 'compact', 'normal', 'large'
      showStats: true,
      showControls: true,
      showTooltips: true,
      showLegend: true,
      ...options
    };
    this.data = null;
    
    // Initialize components
    this.statsCard = null;
    this.gridRenderer = null;
    this.controls = null;
  }

  async init() {
    await this.loadData();
    this.render();
    this.attachEventListeners();
  }

  async loadData() {
    try {
      const filename = this.options.period === 'rolling' 
        ? `activity-rolling-365d-${this.options.author}.json`
        : `activity-${this.options.period}-${this.options.author}.json`;
      
      // Try different base paths
      const basePaths = ['analytics/', '../../analytics/', '../analytics/', '/analytics/'];
      let response;
      
      for (const basePath of basePaths) {
        try {
          response = await fetch(`${basePath}${filename}`);
          if (response.ok) break;
        } catch (error) {
          continue;
        }
      }
      
      if (!response || !response.ok) throw new Error(`HTTP ${response?.status}`);
      
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading contribution data:', error);
      this.data = null;
    }
  }

  render() {
    if (!this.data) {
      this.container.innerHTML = '<div class="error">Erro ao carregar dados de contribuições</div>';
      return;
    }

    const dailyMetrics = this.data.daily_metrics || {};
    
    // Create containers for each component
    this.container.innerHTML = `
      <div class="modular-contribution-widget theme-${this.options.theme}">
        ${this.options.showControls ? '<div id="controls-container"></div>' : ''}
        ${this.options.showStats ? '<div id="stats-container"></div>' : ''}
        <div id="grid-container"></div>
      </div>
    `;

    // Initialize and render components
    if (this.options.showControls) {
      const controlsContainer = this.container.querySelector('#controls-container');
      this.controls = new ContributionControls(controlsContainer, {
        theme: this.options.theme,
        period: this.options.period,
        author: this.options.author,
        compact: this.options.size === 'compact',
        showThemeSelector: true,
        showExport: true,
        showPeriodSelector: true
      });
      this.controls.render();
    }

    if (this.options.showStats) {
      const statsContainer = this.container.querySelector('#stats-container');
      this.statsCard = new ContributionStatsCard(statsContainer, {
        theme: this.options.theme,
        compact: this.options.size === 'compact',
        showTrend: true
      });
      this.statsCard.render(dailyMetrics);
    }

    const gridContainer = this.container.querySelector('#grid-container');
    this.gridRenderer = new ContributionGridRenderer(gridContainer, {
      theme: this.options.theme,
      size: this.options.size,
      showTooltips: this.options.showTooltips,
      showLegend: this.options.showLegend
    });
    this.gridRenderer.render(dailyMetrics);

    this.addStyles();
  }

  attachEventListeners() {
    if (this.controls) {
      // Handle period changes
      this.controls.on('onPeriodChange', async (period) => {
        this.options.period = period;
        await this.loadData();
        this.updateComponents();
      });

      // Handle theme changes
      this.controls.on('onThemeChange', (theme) => {
        this.options.theme = theme;
        this.updateTheme();
      });

      // Handle export
      this.controls.on('onExport', () => {
        this.exportData();
      });
    }
  }

  async updateComponents() {
    if (!this.data) return;

    const dailyMetrics = this.data.daily_metrics || {};
    
    if (this.statsCard) {
      this.statsCard.render(dailyMetrics);
    }
    
    if (this.gridRenderer) {
      this.gridRenderer.render(dailyMetrics);
    }
  }

  updateTheme() {
    // Update main container theme
    const widget = this.container.querySelector('.modular-contribution-widget');
    if (widget) {
      widget.className = `modular-contribution-widget theme-${this.options.theme}`;
    }

    // Update component themes
    if (this.statsCard) {
      this.statsCard.options.theme = this.options.theme;
    }
    
    if (this.gridRenderer) {
      this.gridRenderer.options.theme = this.options.theme;
    }

    // Re-render components with new theme
    this.updateComponents();
  }

  exportData() {
    if (!this.data) return;
    
    const exportData = {
      author: this.options.author,
      period: this.options.period,
      exported_at: new Date().toISOString(),
      daily_metrics: this.data.daily_metrics
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contribution-data-${this.options.author}-${this.options.period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Public methods for external control
  async setPeriod(period) {
    this.options.period = period;
    if (this.controls) {
      this.controls.setActivePeriod(period);
    }
    await this.loadData();
    this.updateComponents();
  }

  setTheme(theme) {
    this.options.theme = theme;
    this.updateTheme();
  }

  setSize(size) {
    this.options.size = size;
    if (this.gridRenderer) {
      this.gridRenderer.options.size = size;
    }
    if (this.statsCard) {
      this.statsCard.options.compact = size === 'compact';
    }
    if (this.controls) {
      this.controls.options.compact = size === 'compact';
    }
    this.updateComponents();
  }

  addStyles() {
    if (document.getElementById('modular-contribution-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modular-contribution-widget-styles';
    style.textContent = `
      .modular-contribution-widget {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        max-width: 100%;
        margin: 0 auto;
        padding: 12px;
        border-radius: 8px;
      }
      
      .theme-github {
        background: #0d1117;
        color: #e6edf3;
      }
      
      .theme-terminal {
        background: #000;
        color: #00ff00;
        border: 1px solid #00ff00;
      }
      
      .theme-bios {
        background: #1a1a1a;
        color: #03DAC6;
        border: 1px solid #03DAC6;
      }
      
      .error {
        color: #f85149;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        background: rgba(248, 81, 73, 0.1);
        border: 1px solid rgba(248, 81, 73, 0.3);
        border-radius: 6px;
      }
      
      @media (max-width: 768px) {
        .modular-contribution-widget {
          padding: 8px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ModularContributionWidget;
