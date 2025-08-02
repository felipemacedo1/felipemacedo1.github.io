/**
 * EnhancedContributionGraph - Full-featured contribution graph
 * Includes stats, tooltips, themes, streaks, and export functionality
 */
class EnhancedContributionGraph {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling',
      theme: 'github',
      showStats: true,
      showTooltips: true,
      showMonthly: true,
      ...options
    };
    this.data = null;
    this.currentTooltip = null;
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
      const basePaths = ['analytics/', '../../analytics/', '../analytics/'];
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
      this.container.innerHTML = '<div class="error">Erro ao carregar dados</div>';
      return;
    }

    const dailyMetrics = this.data.daily_metrics || {};
    
    this.container.innerHTML = `
      <div class="enhanced-contribution-graph ${this.options.theme}">
        ${this.options.showStats ? this.renderStatsCards(dailyMetrics) : ''}
        <div class="graph-controls">
          <div class="theme-selector">
            <label>Tema:</label>
            <select id="theme-select">
              <option value="github">GitHub</option>
              <option value="terminal">Terminal</option>
              <option value="bios">BIOS</option>
            </select>
          </div>
          <button id="export-btn" class="btn">📥 Exportar</button>
        </div>
        <div class="graph-container">
          ${this.renderGraph(dailyMetrics)}
        </div>
        ${this.options.showMonthly ? this.renderMonthlyBreakdown(dailyMetrics) : ''}
      </div>
    `;

    this.addStyles();
    this.updateTheme();
  }

  renderStatsCards(dailyMetrics) {
    const stats = this.calculateStats(dailyMetrics);
    
    return `
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalCommits}</div>
            <div class="stat-label">Total de commits</div>
            <div class="stat-trend ${stats.commitsTrend >= 0 ? 'positive' : 'negative'}">
              ${stats.commitsTrend >= 0 ? '↗' : '↘'} ${Math.abs(stats.commitsTrend)}%
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">Sequência atual</div>
            <div class="stat-detail">Máx: ${stats.longestStreak} dias</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">${stats.activeDays}</div>
            <div class="stat-label">Dias ativos</div>
            <div class="stat-detail">${stats.activePercentage}% do período</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">${stats.avgCommitsPerDay}</div>
            <div class="stat-label">Média diária</div>
            <div class="stat-detail">Melhor: ${stats.bestDay.commits} commits</div>
          </div>
        </div>
      </div>
    `;
  }

  renderGraph(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort();
    if (dates.length === 0) return '<div class="error">Nenhum dado disponível</div>';

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    let html = '<div class="contribution-grid">';
    
    for (let week = 0; week < weeksNeeded; week++) {
      html += '<div class="week">';
      
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);
        
        if (currentDate > endDate) break;
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const commits = dailyMetrics[dateStr] || 0;
        const level = this.getLevel(commits);
        
        html += `<div class="cell level-${level}" 
                      data-date="${dateStr}" 
                      data-commits="${commits}"
                      data-level="${level}"></div>`;
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    html += this.renderLegend();
    
    return html;
  }

  renderLegend() {
    return `
      <div class="legend">
        <span class="legend-label">Menos</span>
        <div class="legend-cells">
          <div class="legend-cell level-0"></div>
          <div class="legend-cell level-1"></div>
          <div class="legend-cell level-2"></div>
          <div class="legend-cell level-3"></div>
          <div class="legend-cell level-4"></div>
        </div>
        <span class="legend-label">Mais</span>
      </div>
    `;
  }

  renderMonthlyBreakdown(dailyMetrics) {
    const monthlyData = this.calculateMonthlyData(dailyMetrics);
    
    let html = '<div class="monthly-breakdown"><h3>Breakdown Mensal</h3><div class="monthly-grid">';
    
    monthlyData.forEach(month => {
      html += `
        <div class="month-card">
          <div class="month-name">${month.name}</div>
          <div class="month-commits">${month.commits} commits</div>
          <div class="month-bar">
            <div class="month-fill" style="width: ${month.percentage}%"></div>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
    return html;
  }

  calculateStats(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort();
    const commits = Object.values(dailyMetrics);
    const totalCommits = commits.reduce((sum, count) => sum + count, 0);
    const activeDays = commits.filter(count => count > 0).length;
    const totalDays = dates.length;
    
    // Calculate streaks
    const streaks = this.calculateStreaks(dailyMetrics);
    
    // Find best day
    const bestDay = dates.reduce((best, date) => {
      const commits = dailyMetrics[date];
      return commits > best.commits ? { date, commits } : best;
    }, { date: '', commits: 0 });
    
    return {
      totalCommits,
      activeDays,
      activePercentage: Math.round((activeDays / totalDays) * 100),
      avgCommitsPerDay: (totalCommits / totalDays).toFixed(1),
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      bestDay,
      commitsTrend: this.calculateTrend(dailyMetrics)
    };
  }

  calculateStreaks(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak (from most recent date backwards)
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dailyMetrics[dates[i]] > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    dates.forEach(date => {
      if (dailyMetrics[date] > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    return { current: currentStreak, longest: longestStreak };
  }

  calculateTrend(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort();
    const midPoint = Math.floor(dates.length / 2);
    
    const firstHalf = dates.slice(0, midPoint);
    const secondHalf = dates.slice(midPoint);
    
    const firstHalfCommits = firstHalf.reduce((sum, date) => sum + (dailyMetrics[date] || 0), 0);
    const secondHalfCommits = secondHalf.reduce((sum, date) => sum + (dailyMetrics[date] || 0), 0);
    
    if (firstHalfCommits === 0) return 0;
    return Math.round(((secondHalfCommits - firstHalfCommits) / firstHalfCommits) * 100);
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
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, commits]) => {
        const [year, month] = key.split('-');
        return {
          name: `${monthNames[parseInt(month) - 1]} ${year}`,
          commits,
          percentage: maxCommits > 0 ? (commits / maxCommits) * 100 : 0
        };
      });
  }

  getLevel(commits) {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 5) return 2;
    if (commits <= 10) return 3;
    return 4;
  }

  attachEventListeners() {
    // Theme selector
    const themeSelect = this.container.querySelector('#theme-select');
    if (themeSelect) {
      themeSelect.value = this.options.theme;
      themeSelect.addEventListener('change', (e) => {
        this.options.theme = e.target.value;
        this.updateTheme();
      });
    }

    // Export button
    const exportBtn = this.container.querySelector('#export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    // Tooltips
    if (this.options.showTooltips) {
      this.attachTooltips();
    }
  }

  attachTooltips() {
    const cells = this.container.querySelectorAll('.cell');
    
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => this.showTooltip(e));
      cell.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  showTooltip(event) {
    const cell = event.target;
    const date = cell.dataset.date;
    const commits = parseInt(cell.dataset.commits);
    const level = parseInt(cell.dataset.level);
    
    this.hideTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'contribution-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-date">${new Date(date).toLocaleDateString('pt-BR')}</div>
      <div class="tooltip-commits">${commits} commits</div>
      <div class="tooltip-level">Nível ${level}/4</div>
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = cell.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    
    this.currentTooltip = tooltip;
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  updateTheme() {
    const graph = this.container.querySelector('.enhanced-contribution-graph');
    if (graph) {
      graph.className = `enhanced-contribution-graph ${this.options.theme}`;
    } else {
      // Warn if updateTheme is called before render
      console.warn('updateTheme: .enhanced-contribution-graph element not found. Make sure to call updateTheme after render().');
    }
  }

  exportData() {
    if (!this.data) return;
    
    const exportData = {
      author: this.options.author,
      period: this.options.period,
      exported_at: new Date().toISOString(),
      stats: this.calculateStats(this.data.daily_metrics),
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

  addStyles() {
    if (document.getElementById('enhanced-contribution-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhanced-contribution-styles';
    style.textContent = `
      .enhanced-contribution-graph {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
      }
      
      .enhanced-contribution-graph.github {
        background: #0d1117;
        color: #e6edf3;
      }
      
      .enhanced-contribution-graph.terminal {
        background: #000;
        color: #00ff00;
        border: 1px solid #00ff00;
      }
      
      .enhanced-contribution-graph.bios {
        background: #1a1a1a;
        color: #03DAC6;
        border: 1px solid #03DAC6;
      }
      
      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .stat-card {
        padding: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.2s;
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
      }
      
      .enhanced-contribution-graph.github .stat-card {
        background: #21262d;
        border: 1px solid #30363d;
      }
      
      .enhanced-contribution-graph.terminal .stat-card {
        background: #001100;
        border: 1px solid #00ff00;
      }
      
      .enhanced-contribution-graph.bios .stat-card {
        background: #0a1a1a;
        border: 1px solid #03DAC6;
      }
      
      .stat-icon {
        font-size: 24px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 12px;
        opacity: 0.7;
        margin: 4px 0;
      }
      
      .stat-trend {
        font-size: 11px;
        font-weight: 500;
      }
      
      .stat-trend.positive { color: #26a641; }
      .stat-trend.negative { color: #f85149; }
      
      .stat-detail {
        font-size: 11px;
        opacity: 0.6;
      }
      
      .graph-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .theme-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      
      .theme-selector select {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .enhanced-contribution-graph.github .theme-selector select {
        background: #21262d;
        border: 1px solid #30363d;
        color: #e6edf3;
      }
      
      .enhanced-contribution-graph.terminal .theme-selector select {
        background: #000;
        border: 1px solid #00ff00;
        color: #00ff00;
      }
      
      .enhanced-contribution-graph.bios .theme-selector select {
        background: #1a1a1a;
        border: 1px solid #03DAC6;
        color: #03DAC6;
      }
      
      .btn {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .enhanced-contribution-graph.github .btn {
        background: #238636;
        color: white;
      }
      
      .enhanced-contribution-graph.github .btn:hover {
        background: #2ea043;
      }
      
      .enhanced-contribution-graph.terminal .btn {
        background: #00ff00;
        color: #000;
      }
      
      .enhanced-contribution-graph.terminal .btn:hover {
        background: #00cc00;
      }
      
      .enhanced-contribution-graph.bios .btn {
        background: #03DAC6;
        color: #000;
      }
      
      .enhanced-contribution-graph.bios .btn:hover {
        background: #00b8a3;
      }
      
      .graph-container {
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 24px;
      }
      
      .enhanced-contribution-graph.github .graph-container {
        background: #0d1117;
        border: 1px solid #30363d;
      }
      
      .enhanced-contribution-graph.terminal .graph-container {
        background: #000;
        border: 1px solid #00ff00;
      }
      
      .enhanced-contribution-graph.bios .graph-container {
        background: #1a1a1a;
        border: 1px solid #03DAC6;
      }
      
      .contribution-grid {
        display: flex;
        gap: 3px;
        overflow-x: auto;
        margin-bottom: 12px;
      }
      
      .week {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      
      .cell {
        width: 11px;
        height: 11px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .cell:hover {
        transform: scale(1.2);
        z-index: 10;
        position: relative;
      }
      
      .enhanced-contribution-graph.github .level-0 { background: #161b22; }
      .enhanced-contribution-graph.github .level-1 { background: #0e4429; }
      .enhanced-contribution-graph.github .level-2 { background: #006d32; }
      .enhanced-contribution-graph.github .level-3 { background: #26a641; }
      .enhanced-contribution-graph.github .level-4 { background: #39d353; }
      
      .enhanced-contribution-graph.terminal .level-0 { background: #001100; }
      .enhanced-contribution-graph.terminal .level-1 { background: #003300; }
      .enhanced-contribution-graph.terminal .level-2 { background: #005500; }
      .enhanced-contribution-graph.terminal .level-3 { background: #007700; }
      .enhanced-contribution-graph.terminal .level-4 { background: #00ff00; }
      
      .enhanced-contribution-graph.bios .level-0 { background: #0a1a1a; }
      .enhanced-contribution-graph.bios .level-1 { background: #0d2d2a; }
      .enhanced-contribution-graph.bios .level-2 { background: #1a4a44; }
      .enhanced-contribution-graph.bios .level-3 { background: #26665e; }
      .enhanced-contribution-graph.bios .level-4 { background: #03DAC6; }
      
      .legend {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        opacity: 0.7;
      }
      
      .legend-cells {
        display: flex;
        gap: 2px;
      }
      
      .legend-cell {
        width: 11px;
        height: 11px;
        border-radius: 2px;
      }
      
      .monthly-breakdown {
        margin-top: 24px;
      }
      
      .monthly-breakdown h3 {
        margin-bottom: 16px;
        font-size: 18px;
      }
      
      .monthly-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }
      
      .month-card {
        padding: 12px;
        border-radius: 6px;
        text-align: center;
      }
      
      .enhanced-contribution-graph.github .month-card {
        background: #21262d;
        border: 1px solid #30363d;
      }
      
      .enhanced-contribution-graph.terminal .month-card {
        background: #001100;
        border: 1px solid #00ff00;
      }
      
      .enhanced-contribution-graph.bios .month-card {
        background: #0a1a1a;
        border: 1px solid #03DAC6;
      }
      
      .month-name {
        font-size: 12px;
        opacity: 0.7;
        margin-bottom: 4px;
      }
      
      .month-commits {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .month-bar {
        height: 4px;
        border-radius: 2px;
        overflow: hidden;
      }
      
      .enhanced-contribution-graph.github .month-bar {
        background: #30363d;
      }
      
      .enhanced-contribution-graph.terminal .month-bar {
        background: #003300;
      }
      
      .enhanced-contribution-graph.bios .month-bar {
        background: #0d2d2a;
      }
      
      .month-fill {
        height: 100%;
        transition: width 0.3s;
      }
      
      .enhanced-contribution-graph.github .month-fill {
        background: #26a641;
      }
      
      .enhanced-contribution-graph.terminal .month-fill {
        background: #00ff00;
      }
      
      .enhanced-contribution-graph.bios .month-fill {
        background: #03DAC6;
      }
      
      .contribution-tooltip {
        position: absolute;
        z-index: 1000;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        transform: translateX(-50%);
        background: #1c2128;
        border: 1px solid #30363d;
        color: #e6edf3;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .tooltip-date {
        font-weight: bold;
        margin-bottom: 2px;
      }
      
      .tooltip-commits {
        color: #26a641;
      }
      
      .tooltip-level {
        font-size: 11px;
        opacity: 0.7;
      }
      
      .error {
        color: #f85149;
        text-align: center;
        padding: 20px;
        font-size: 14px;
      }
      
      @media (max-width: 768px) {
        .enhanced-contribution-graph {
          padding: 12px;
        }
        
        .stats-cards {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .stat-card {
          padding: 12px;
        }
        
        .stat-value {
          font-size: 20px;
        }
        
        .graph-controls {
          flex-direction: column;
          align-items: stretch;
        }
        
        .monthly-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default EnhancedContributionGraph;