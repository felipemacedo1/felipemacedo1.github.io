/**
 * Contribution Widget - Compact version for terminal and BIOS integration
 * Lightweight module designed for embedding in other interfaces
 */

class ContributionWidget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      size: options.size || 'mini', // mini, compact, normal
      theme: options.theme || 'dark',
      showStats: options.showStats !== false,
      showLegend: options.showLegend !== false,
      period: options.period || 'rolling',
      author: options.author || 'felipemacedo1',
      ...options
    };
    
    this.data = null;
    this.init();
  }

  init() {
    this.createWidget();
    this.loadData();
  }

  createWidget() {
    const { size, showStats, showLegend } = this.options;
    
    this.container.innerHTML = `
      <div class="contribution-widget ${size}" data-theme="${this.options.theme}">
        ${showStats ? '<div class="widget-stats" id="widget-stats"></div>' : ''}
        <div class="widget-grid" id="widget-grid"></div>
        ${showLegend ? '<div class="widget-legend" id="widget-legend"></div>' : ''}
      </div>
    `;

    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('contribution-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'contribution-widget-styles';
    styles.textContent = `
      .contribution-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace;
        color: #e6edf3;
        background: #0d1117;
        border-radius: 8px;
        padding: 12px;
        border: 1px solid #30363d;
      }

      .contribution-widget[data-theme="terminal"] {
        background: transparent;
        border: 1px solid #00ff00;
        color: #00ff00;
      }

      .contribution-widget[data-theme="bios"] {
        background: #000;
        border: 1px solid #00ff41;
        color: #00ff41;
      }

      .widget-stats {
        font-size: 12px;
        margin-bottom: 8px;
        text-align: center;
        opacity: 0.8;
      }

      .widget-grid {
        display: flex;
        gap: 2px;
        justify-content: center;
        overflow-x: auto;
      }

      .widget-week {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .widget-cell {
        border-radius: 1px;
        cursor: pointer;
        transition: transform 0.1s ease;
      }

      .widget-cell:hover {
        transform: scale(1.2);
      }

      /* Size variants */
      .contribution-widget.mini .widget-cell {
        width: 4px;
        height: 4px;
      }

      .contribution-widget.compact .widget-cell {
        width: 6px;
        height: 6px;
      }

      .contribution-widget.normal .widget-cell {
        width: 8px;
        height: 8px;
      }

      /* Level colors */
      .widget-cell.level-0 { background: #161b22; }
      .widget-cell.level-1 { background: #0e4429; }
      .widget-cell.level-2 { background: #006d32; }
      .widget-cell.level-3 { background: #26a641; }
      .widget-cell.level-4 { background: #39d353; }

      /* Terminal theme */
      .contribution-widget[data-theme="terminal"] .widget-cell.level-0 { background: #001100; }
      .contribution-widget[data-theme="terminal"] .widget-cell.level-1 { background: #003300; }
      .contribution-widget[data-theme="terminal"] .widget-cell.level-2 { background: #005500; }
      .contribution-widget[data-theme="terminal"] .widget-cell.level-3 { background: #007700; }
      .contribution-widget[data-theme="terminal"] .widget-cell.level-4 { background: #00ff00; }

      /* BIOS theme */
      .contribution-widget[data-theme="bios"] .widget-cell.level-0 { background: #001a00; }
      .contribution-widget[data-theme="bios"] .widget-cell.level-1 { background: #003d00; }
      .contribution-widget[data-theme="bios"] .widget-cell.level-2 { background: #006600; }
      .contribution-widget[data-theme="bios"] .widget-cell.level-3 { background: #009900; }
      .contribution-widget[data-theme="bios"] .widget-cell.level-4 { background: #00ff41; }

      .widget-legend {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
        font-size: 10px;
        opacity: 0.6;
      }

      .legend-box {
        width: 8px;
        height: 8px;
        border-radius: 1px;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .contribution-widget.normal .widget-cell {
          width: 6px;
          height: 6px;
        }
        
        .contribution-widget.compact .widget-cell {
          width: 4px;
          height: 4px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // Core functions (reused from main class)
  formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  alignToSunday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    d.setDate(d.getDate() - dow);
    return d;
  }

  alignToSaturday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    const offset = (6 - dow + 7) % 7;
    d.setDate(d.getDate() + offset);
    return d;
  }

  intensityLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  buildGridFromCounts(dailyMetrics, yearOrPeriod) {
    let startDate, endDate;
    
    if (yearOrPeriod === 'rolling' || typeof yearOrPeriod === 'object') {
      const dates = Object.keys(dailyMetrics).sort();
      if (dates.length > 0) {
        startDate = new Date(dates[0]);
        endDate = new Date(dates[dates.length - 1]);
      } else {
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
      }
    } else {
      startDate = new Date(yearOrPeriod, 0, 1);
      endDate = new Date(yearOrPeriod, 11, 31);
    }
    
    const startSunday = this.alignToSunday(startDate);
    const endSaturday = this.alignToSaturday(endDate);
    
    const weeks = [];
    const cursor = new Date(startSunday);
    
    while (cursor <= endSaturday) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = this.formatISO(cursor);
        const count = dailyMetrics[key] || 0;
        week.push({
          date: key,
          count: count,
          level: this.intensityLevel(count)
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  }

  calculateStats(dailyMetrics) {
    const counts = Object.values(dailyMetrics);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const days = counts.filter(count => count > 0).length;
    const max = Math.max(...counts, 0);
    const avg = days > 0 ? (total / days).toFixed(1) : 0;
    
    return { total, days, max, avg };
  }

  async loadData() {
    const { period, author } = this.options;
    
    try {
      let url;
      if (period === 'rolling') {
        url = `analytics/activity-rolling-365d-${author}.json`;
      } else {
        url = `analytics/activity-${period}-${author}.json`;
      }
      
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const jsonData = await response.json();
      this.data = {
        daily_metrics: jsonData.daily_metrics || jsonData.counts || {},
        metadata: jsonData.metadata || {}
      };
      
      this.render();
    } catch (error) {
      console.warn('Failed to load contribution data:', error);
      this.renderError();
    }
  }

  render() {
    if (!this.data) return;
    
    const { daily_metrics } = this.data;
    const stats = this.calculateStats(daily_metrics);
    const grid = this.buildGridFromCounts(daily_metrics, this.options.period);
    
    this.renderStats(stats);
    this.renderGrid(grid);
    this.renderLegend();
  }

  renderStats(stats) {
    if (!this.options.showStats) return;
    
    const statsEl = this.container.querySelector('#widget-stats');
    if (statsEl) {
      statsEl.textContent = `${stats.total} commits • ${stats.days} dias ativos`;
    }
  }

  renderGrid(grid) {
    const gridEl = this.container.querySelector('#widget-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = '';
    
    // Limit weeks for mini size
    const maxWeeks = this.options.size === 'mini' ? 26 : grid.length;
    const displayGrid = grid.slice(-maxWeeks);
    
    displayGrid.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.className = 'widget-week';
      
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = `widget-cell level-${day.level}`;
        cell.title = `${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}`;
        weekEl.appendChild(cell);
      });
      
      gridEl.appendChild(weekEl);
    });
  }

  renderLegend() {
    if (!this.options.showLegend) return;
    
    const legendEl = this.container.querySelector('#widget-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <span>Menos</span>
        <div class="legend-box level-0"></div>
        <div class="legend-box level-1"></div>
        <div class="legend-box level-2"></div>
        <div class="legend-box level-3"></div>
        <div class="legend-box level-4"></div>
        <span>Mais</span>
      `;
    }
  }

  renderError() {
    this.container.innerHTML = `
      <div class="contribution-widget error">
        <div style="text-align: center; color: #f85149; font-size: 12px;">
          ❌ Dados não disponíveis
        </div>
      </div>
    `;
  }

  // Public API for external control
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.createWidget();
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  // Generate ASCII for terminal
  generateASCII() {
    if (!this.data) return 'Dados não disponíveis';
    
    const symbols = ['·', '▢', '▣', '▦', '■'];
    const grid = this.buildGridFromCounts(this.data.daily_metrics, this.options.period);
    const stats = this.calculateStats(this.data.daily_metrics);
    
    let ascii = `📊 Contribution Graph\n`;
    ascii += `${stats.total} commits • ${stats.days} dias ativos\n\n`;
    
    // Simplified grid for terminal
    const maxWeeks = 26; // Show last 6 months
    const displayGrid = grid.slice(-maxWeeks);
    
    for (let day = 0; day < 7; day++) {
      let line = '';
      displayGrid.forEach(week => {
        const cell = week[day];
        line += symbols[cell.level];
      });
      ascii += line + '\n';
    }
    
    ascii += `\n${symbols[0]}(0) ${symbols[1]}(1-2) ${symbols[2]}(3-5) ${symbols[3]}(6-9) ${symbols[4]}(10+)`;
    return ascii;
  }
}

// Factory function for easy integration
function createContributionWidget(container, options) {
  return new ContributionWidget(container, options);
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContributionWidget, createContributionWidget };
} else if (typeof window !== 'undefined') {
  window.ContributionWidget = ContributionWidget;
  window.createContributionWidget = createContributionWidget;
}