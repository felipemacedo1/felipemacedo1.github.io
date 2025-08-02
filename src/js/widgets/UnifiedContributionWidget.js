/**
 * UnifiedContributionWidget - Consolidated contribution graph widget
 * Combines functionality from ContributionWidget, ContributionGraph, and EnhancedContributionGraph
 * Supports multiple themes, sizes, and integration modes (terminal, mobile, standalone)
 */

class UnifiedContributionWidget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling', // rolling, 2024, 2023, etc.
      size: 'compact', // mini, compact, normal, full
      theme: 'github', // github, terminal, bios, dark
      mode: 'widget', // widget, terminal, mobile, standalone
      showStats: true,
      showTooltips: true,
      showMonthly: false,
      enableInteraction: true,
      ...options
    };
    
    this.data = null;
    this.currentTooltip = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      await this.loadData();
      this.render();
      if (this.options.enableInteraction) {
        this.attachEventListeners();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('UnifiedContributionWidget init error:', error);
      this.renderError('Erro ao inicializar widget');
    }
  }

  async loadData() {
    try {
      const filename = this.options.period === 'rolling' 
        ? `activity-rolling-365d-${this.options.author}.json`
        : `activity-${this.options.period}-${this.options.author}.json`;
      
      // Try different base paths depending on where the widget is loaded from
      const basePaths = ['analytics/', '../../analytics/', '../analytics/'];
      let response;
      let lastError;
      
      for (const basePath of basePaths) {
        try {
          response = await fetch(`${basePath}${filename}`);
          if (response.ok) break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error(`HTTP ${response?.status || 'Network Error'}`);
      }
      
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading contribution data:', error);
      this.data = null;
      throw error;
    }
  }

  render() {
    if (!this.data) {
      this.renderError('Dados não disponíveis');
      return;
    }

    const { size, theme, mode, showStats } = this.options;
    
    this.container.innerHTML = `
      <div class="unified-contribution-widget" 
           data-size="${size}" 
           data-theme="${theme}" 
           data-mode="${mode}">
        ${showStats ? this.renderStats() : ''}
        ${this.renderGraph()}
      </div>
    `;

    this.injectStyles();
    
    // Auto-scroll to the most recent month
    setTimeout(() => {
      const monthlyGrid = this.container?.querySelector('.monthly-grid');
      if (monthlyGrid) {
        monthlyGrid.scrollLeft = monthlyGrid.scrollWidth;
      }
    }, 100);
  }

  renderStats() {
    const stats = this.calculateStats();
    const { mode, size } = this.options;
    
    if (size === 'mini') {
      return `
        <div class="widget-stats mini">
          <span class="stat-item">
            <strong>${stats.totalContributions}</strong> contributions
          </span>
        </div>
      `;
    }

    return `
      <div class="widget-stats ${size}">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">${stats.totalContributions}</span>
            <span class="stat-label">contributions</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${stats.currentStreak}</span>
            <span class="stat-label">current streak</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${stats.longestStreak}</span>
            <span class="stat-label">longest streak</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${stats.activeDays}</span>
            <span class="stat-label">active days</span>
          </div>
        </div>
      </div>
    `;
  }

  renderGraph() {
    const dailyMetrics = this.data.daily_metrics || {};
    const dates = Object.keys(dailyMetrics).sort();
    
    if (dates.length === 0) {
      return '<div class="error">Nenhum dado disponível</div>';
    }

    // For mobile-friendly display, use monthly cards instead of complex grid
    const monthlyData = this.calculateMonthlyData(dailyMetrics);
    
    return `
      <div class="widget-graph">
        <div class="monthly-grid">
          ${monthlyData.map(month => this.renderMonthCard(month)).join('')}
        </div>
      </div>
    `;
  }

  calculateMonthlyData(dailyMetrics) {
    const monthlyCommits = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    Object.entries(dailyMetrics).forEach(([date, commits]) => {
      const [year, month] = date.split('-');
      const key = `${year}-${month}`;
      monthlyCommits[key] = (monthlyCommits[key] || 0) + commits;
    });

    const maxCommits = Math.max(...Object.values(monthlyCommits));
    
    return Object.entries(monthlyCommits)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort chronologically (crescente)
      .slice(-12) // Show last 12 months for better horizontal scroll
      .map(([key, commits]) => {
        const [year, month] = key.split('-');
        return {
          name: `${monthNames[parseInt(month) - 1]} ${year}`,
          commits,
          percentage: maxCommits > 0 ? (commits / maxCommits) * 100 : 0,
          level: this.getMonthLevel(commits, maxCommits)
        };
      });
  }

  getMonthLevel(commits, maxCommits) {
    if (commits === 0) return 0;
    const ratio = commits / maxCommits;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  renderMonthCard(month) {
    const { showTooltips } = this.options;
    const tooltipAttr = showTooltips ? `data-tooltip="${month.commits} commits em ${month.name}"` : '';
    
    return `
      <div class="month-card" data-level="${month.level}" ${tooltipAttr}>
        <div class="month-name">${month.name}</div>
        <div class="month-commits">${month.commits}</div>
        <div class="month-label">commits</div>
        <div class="month-bar">
          <div class="month-fill" style="width: ${month.percentage}%"></div>
        </div>
      </div>
    `;
  }

  renderWeek(week) {
    return `
      <div class="graph-week">
        ${week.map(day => this.renderDay(day)).join('')}
      </div>
    `;
  }

  renderDay(day) {
    const { showTooltips } = this.options;
    const level = this.getContributionLevel(day.contributions);
    const tooltipAttr = showTooltips ? `data-tooltip="${day.contributions} contributions on ${day.date}"` : '';
    
    return `
      <div class="graph-cell" 
           data-level="${level}" 
           data-date="${day.date}"
           data-contributions="${day.contributions}"
           ${tooltipAttr}>
      </div>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="unified-contribution-widget error-state">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">${message}</span>
        </div>
      </div>
    `;
  }

  groupByWeeks(dates, dailyMetrics) {
    const weeks = [];
    let currentWeek = [];
    
    // Find start date (align to Sunday)
    const startDate = new Date(dates[0]);
    const dayOfWeek = startDate.getDay();
    
    // Add empty cells for days before the first date
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', contributions: 0, isEmpty: true });
    }

    dates.forEach(date => {
      currentWeek.push({
        date,
        contributions: dailyMetrics[date] || 0,
        isEmpty: false
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add empty cells for the last incomplete week
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ date: '', contributions: 0, isEmpty: true });
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  getContributionLevel(contributions) {
    if (contributions === 0) return 0;
    if (contributions <= 3) return 1;
    if (contributions <= 6) return 2;
    if (contributions <= 12) return 3;
    return 4;
  }

  calculateStats() {
    const dailyMetrics = this.data.daily_metrics || {};
    const dates = Object.keys(dailyMetrics).sort();
    
    let totalContributions = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    dates.forEach((date, index) => {
      const contributions = dailyMetrics[date] || 0;
      totalContributions += contributions;
      
      if (contributions > 0) {
        activeDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Update current streak (only if it's recent)
        const isToday = index === dates.length - 1;
        const isYesterday = index === dates.length - 2;
        if (isToday || isYesterday) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    return {
      totalContributions,
      activeDays,
      currentStreak,
      longestStreak
    };
  }

  attachEventListeners() {
    if (!this.options.showTooltips) return;

    this.container.addEventListener('mouseenter', (e) => {
      if (e.target.closest('.month-card') && e.target.closest('.month-card').dataset.tooltip) {
        this.showTooltip(e.target.closest('.month-card'), e.target.closest('.month-card').dataset.tooltip);
      }
    }, true);

    this.container.addEventListener('mouseleave', (e) => {
      if (e.target.closest('.month-card')) {
        this.hideTooltip();
      }
    }, true);
  }

  showTooltip(element, text) {
    this.hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'contribution-tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  injectStyles() {
    if (document.getElementById('unified-contribution-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'unified-contribution-widget-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  getStyles() {
    return `
      /* Base styles */
      .unified-contribution-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace;
        color: #e6edf3;
        background: #0d1117;
        border-radius: 8px;
        padding: 8px;
        border: 1px solid #30363d;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        box-sizing: border-box;
      }

      /* Theme variations */
      .unified-contribution-widget[data-theme="terminal"] {
        background: transparent;
        border: 1px solid #00ff00;
        color: #00ff00;
      }

      .unified-contribution-widget[data-theme="bios"] {
        background: #000;
        border: 1px solid #00ff41;
        color: #00ff41;
        font-family: "Courier New", monospace;
      }

      .unified-contribution-widget[data-theme="dark"] {
        background: #1a1a1a;
        border: 1px solid #333;
        color: #f0f0f0;
      }

      /* Stats section */
      .widget-stats {
        margin-bottom: 12px;
        text-align: center;
      }

      .widget-stats.mini {
        font-size: 11px;
        margin-bottom: 8px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
        font-size: 12px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-number {
        font-weight: bold;
        font-size: 14px;
      }

      .stat-label {
        opacity: 0.7;
        font-size: 10px;
      }

      /* Graph section */
      .widget-graph {
        width: 100%;
        padding: 0 4px;
      }

      /* Monthly grid layout with horizontal scroll */
      .monthly-grid {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 8px;
        width: 100%;
        min-height: 120px;
        scroll-behavior: smooth;
      }

      /* Custom scrollbar for monthly grid */
      .monthly-grid::-webkit-scrollbar {
        height: 6px;
      }

      .monthly-grid::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      .monthly-grid::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .monthly-grid::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      .month-card {
        background: #21262d;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 10px;
        text-align: center;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        min-width: 90px;
        flex-shrink: 0;
        cursor: pointer;
      }

      .month-card:hover {
        transform: translateY(-2px);
        border-color: #58a6ff;
        box-shadow: 0 4px 12px rgba(88, 166, 255, 0.15);
      }

      .month-name {
        font-size: 10px;
        opacity: 0.7;
        margin-bottom: 4px;
        font-weight: 500;
        white-space: nowrap;
      }

      .month-commits {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 2px;
        color: #e6edf3;
      }

      .month-label {
        font-size: 8px;
        opacity: 0.6;
        margin-bottom: 6px;
        white-space: nowrap;
      }

      .month-bar {
        height: 3px;
        background: #30363d;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }

      .month-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 2px;
      }

      /* Level-based colors for month cards */
      .month-card[data-level="0"] .month-fill { background: #161b22; }
      .month-card[data-level="1"] .month-fill { background: #0e4429; }
      .month-card[data-level="2"] .month-fill { background: #006d32; }
      .month-card[data-level="3"] .month-fill { background: #26a641; }
      .month-card[data-level="4"] .month-fill { background: #39d353; }

      /* Theme variations for month cards */
      .unified-contribution-widget[data-theme="terminal"] .month-card {
        background: #001100;
        border-color: #00ff00;
      }

      .unified-contribution-widget[data-theme="terminal"] .month-card:hover {
        border-color: #00ff00;
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
      }

      .unified-contribution-widget[data-theme="terminal"] .month-fill {
        background: #00ff00 !important;
      }

      .unified-contribution-widget[data-theme="bios"] .month-card {
        background: #0a1a1a;
        border-color: #03DAC6;
      }

      .unified-contribution-widget[data-theme="bios"] .month-card:hover {
        border-color: #03DAC6;
        box-shadow: 0 0 8px rgba(3, 218, 198, 0.3);
      }

      .unified-contribution-widget[data-theme="bios"] .month-fill {
        background: #03DAC6 !important;
      }

      /* Responsive design */
      @media (max-width: 480px) {
        .monthly-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        
        .month-card {
          padding: 8px;
        }
        
        .month-commits {
          font-size: 16px;
        }
      }

      /* Tooltip for month cards */
      .contribution-tooltip {
        position: absolute;
        background: #161b22;
        color: #f0f6fc;
        padding: 6px 8px;
        border-radius: 4px;
        font-size: 11px;
        border: 1px solid #30363d;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
      }

      .unified-contribution-widget[data-theme="terminal"] .contribution-tooltip {
        background: #000;
        color: #00ff00;
        border-color: #00ff00;
      }

      .unified-contribution-widget[data-theme="bios"] .contribution-tooltip {
        background: #000;
        color: #00ff41;
        border-color: #00ff41;
        font-family: "Courier New", monospace;
      }

      /* Error state */
      .unified-contribution-widget.error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: #2a1f1f;
        border-color: #ff6b6b;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ff8e8e;
        font-size: 12px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .unified-contribution-widget {
          padding: 8px;
        }
        
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        
        .graph-container {
          gap: 1px;
        }
        
        .graph-cell {
          width: 8px;
          height: 8px;
        }
      }
    `;
  }

  // Public API methods
  async refresh() {
    await this.loadData();
    this.render();
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }

  destroy() {
    this.hideTooltip();
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isInitialized = false;
  }
}

// Export for module usage
export { UnifiedContributionWidget };
export default UnifiedContributionWidget;

// Also make available globally for legacy usage
if (typeof window !== 'undefined') {
  window.UnifiedContributionWidget = UnifiedContributionWidget;
}
