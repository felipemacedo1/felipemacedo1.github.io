/**
 * Enhanced Contribution Graph
 * Modular design for integration with terminal and mobile BIOS
 */

class EnhancedContributionGraph {
  constructor(options = {}) {
    this.options = {
      compact: options.compact || false,
      theme: options.theme || 'github',
      size: options.size || 'normal',
      ...options
    };
    
    this.currentPeriod = 'rolling';
    this.currentAuthor = 'felipemacedo1';
    this.currentData = null;
    this.currentGrid = null;
    this.tooltip = null;
    
    this.init();
  }

  init() {
    this.setupTooltip();
    this.setupEventListeners();
    this.createPeriodButtons();
    this.loadInitialData();
    
    if (this.options.compact) {
      document.getElementById('container').classList.add('compact-mode');
    }
  }

  // Core utility functions (reusable for CLI/terminal)
  formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  }

  getRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
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

  // Data processing
  parseActivityData(jsonData) {
    if (!jsonData) return { daily_metrics: {}, metadata: {} };
    
    if (jsonData.daily_metrics) {
      return {
        daily_metrics: jsonData.daily_metrics,
        metadata: jsonData.metadata || {}
      };
    }
    
    if (jsonData.counts) {
      return {
        daily_metrics: jsonData.counts,
        metadata: {}
      };
    }
    
    return { daily_metrics: {}, metadata: {} };
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
    const today = this.formatISO(new Date());
    
    while (cursor <= endSaturday) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = this.formatISO(cursor);
        const count = dailyMetrics[key] || 0;
        const isToday = key === today;
        const isWeekend = cursor.getDay() === 0 || cursor.getDay() === 6;
        
        week.push({
          date: key,
          count: count,
          level: this.intensityLevel(count),
          isToday,
          isWeekend
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

  calculateStreaks(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = this.formatISO(new Date());
    let checkingCurrent = true;
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      const count = dailyMetrics[date];
      
      if (count > 0) {
        tempStreak++;
        if (checkingCurrent) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (checkingCurrent && date <= today) {
          checkingCurrent = false;
        }
        tempStreak = 0;
      }
    }
    
    return { current: currentStreak, longest: longestStreak };
  }

  calculateMonthlyBreakdown(dailyMetrics) {
    const months = Array(12).fill(0);
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    Object.entries(dailyMetrics).forEach(([date, count]) => {
      const month = new Date(date).getMonth();
      months[month] += count;
    });
    
    const maxMonth = Math.max(...months);
    
    return months.map((count, index) => ({
      name: monthNames[index],
      count,
      percentage: maxMonth > 0 ? (count / maxMonth) * 100 : 0
    }));
  }

  // Data loading
  async loadData(yearOrPeriod, author) {
    if (yearOrPeriod === 'rolling' || yearOrPeriod === new Date().getFullYear()) {
      const rollingUrl = `analytics/activity-rolling-365d-${author}.json`;
      try {
        const response = await fetch(rollingUrl, { cache: 'no-store' });
        if (response.ok) {
          const jsonData = await response.json();
          return this.parseActivityData(jsonData);
        }
      } catch (error) {
        console.warn(`Rolling data not available: ${error.message}`);
      }
    }
    
    const url = `analytics/activity-${yearOrPeriod}-${author}.json`;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const jsonData = await response.json();
      return this.parseActivityData(jsonData);
    } catch (error) {
      console.warn(`Failed to load ${url}:`, error.message);
      return null;
    }
  }

  // UI Setup
  setupTooltip() {
    this.tooltip = document.getElementById('tooltip');
  }

  setupEventListeners() {
    // Period buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-period]')) {
        this.handlePeriodChange(e.target.dataset.period);
      }
      
      if (e.target.matches('[data-size]')) {
        this.handleSizeChange(e.target.dataset.size);
      }
    });

    // Refresh button
    document.getElementById('refresh').addEventListener('click', () => {
      this.loadAndRender(this.currentPeriod, this.currentAuthor);
    });

    // Theme selector
    document.getElementById('theme-selector').addEventListener('change', (e) => {
      this.changeTheme(e.target.value);
    });

    // ASCII toggle
    document.getElementById('toggle-ascii').addEventListener('click', () => {
      this.toggleASCII();
    });

    // Export buttons
    document.getElementById('export-png').addEventListener('click', () => {
      this.exportAsPNG();
    });

    document.getElementById('export-svg').addEventListener('click', () => {
      this.exportAsSVG();
    });

    document.getElementById('share-link').addEventListener('click', () => {
      this.shareLink();
    });

    // Author input
    document.getElementById('author').addEventListener('change', (e) => {
      this.currentAuthor = e.target.value.trim() || 'felipemacedo1';
    });

    // Mouse events for tooltip
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches('.cell')) {
        this.showTooltip(e.target, e);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.matches('.cell')) {
        this.hideTooltip();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (e.target.matches('.cell')) {
        this.updateTooltipPosition(e);
      }
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      if (e.target.matches('.cell')) {
        this.showTooltip(e.target, e.touches[0]);
      }
    });

    document.addEventListener('touchend', (e) => {
      if (e.target.matches('.cell')) {
        setTimeout(() => this.hideTooltip(), 2000);
      }
    });
  }

  createPeriodButtons() {
    const container = document.getElementById('period-buttons');
    const currentYear = new Date().getFullYear();
    
    // Rolling button
    const rollingBtn = this.createButton('365d', 'rolling', true);
    rollingBtn.classList.add('period-365d');
    rollingBtn.title = 'Últimos 365 dias';
    container.appendChild(rollingBtn);
    
    // Year buttons
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const btn = this.createButton(year.toString(), year.toString(), false);
      container.appendChild(btn);
    }
  }

  createButton(text, value, active = false) {
    const btn = document.createElement('button');
    btn.className = `btn ${active ? 'active' : ''}`;
    btn.textContent = text;
    btn.dataset.period = value;
    return btn;
  }

  // Event handlers
  handlePeriodChange(period) {
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    this.currentPeriod = period === 'rolling' ? 'rolling' : parseInt(period);
    this.loadAndRender(this.currentPeriod, this.currentAuthor);
  }

  handleSizeChange(size) {
    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-size="${size}"]`).classList.add('active');
    
    const grid = document.getElementById('graph');
    grid.className = `grid ${size}`;
  }

  changeTheme(theme) {
    document.body.className = theme !== 'github' ? `theme-${theme}` : '';
  }

  // Tooltip
  showTooltip(cell, event) {
    const data = JSON.parse(cell.dataset.info || '{}');
    const tooltip = this.tooltip;
    
    const streakInfo = this.getStreakInfo(data.date);
    
    tooltip.innerHTML = `
      <div class="tooltip-date">${this.formatDate(data.date)}</div>
      <div class="tooltip-commits">${data.count} commit${data.count !== 1 ? 's' : ''}</div>
      <div class="tooltip-day">${this.getDayOfWeek(data.date)} • ${this.getRelativeTime(data.date)}</div>
      ${streakInfo ? `<div class="tooltip-day">${streakInfo}</div>` : ''}
    `;
    
    this.updateTooltipPosition(event);
    tooltip.classList.add('show');
  }

  hideTooltip() {
    this.tooltip.classList.remove('show');
  }

  updateTooltipPosition(event) {
    const tooltip = this.tooltip;
    const x = event.clientX || event.pageX;
    const y = event.clientY || event.pageY;
    
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;
  }

  getStreakInfo(date) {
    if (!this.currentData) return '';
    
    const streaks = this.calculateStreaks(this.currentData.daily_metrics);
    const dateObj = new Date(date);
    const today = new Date();
    
    if (dateObj.toDateString() === today.toDateString() && streaks.current > 1) {
      return `🔥 Streak atual: ${streaks.current} dias`;
    }
    
    return '';
  }

  // Rendering
  async loadAndRender(yearOrPeriod, author) {
    this.showLoading();
    
    const data = await this.loadData(yearOrPeriod, author);
    
    if (!data) {
      this.showError(yearOrPeriod, author);
      return;
    }
    
    this.currentData = data;
    const { daily_metrics, metadata } = data;
    const stats = this.calculateStats(daily_metrics);
    
    if (stats.total === 0) {
      this.showEmptyState(yearOrPeriod, author);
      return;
    }
    
    const grid = this.buildGridFromCounts(daily_metrics, yearOrPeriod);
    this.currentGrid = grid;
    
    this.renderStats(stats, metadata);
    this.renderStreaks(daily_metrics);
    this.renderGraph(grid, yearOrPeriod, author, metadata);
    this.renderMonthlyBreakdown(daily_metrics);
    
    this.hideLoading();
  }

  showLoading() {
    const elements = ['stats-cards', 'streak-section', 'graph', 'month-bars'];
    elements.forEach(id => {
      const el = document.getElementById(id);
      el.innerHTML = '<div class="loading skeleton">Carregando...</div>';
    });
  }

  hideLoading() {
    // Loading is hidden when content is rendered
  }

  showError(yearOrPeriod, author) {
    const periodText = yearOrPeriod === 'rolling' ? 'últimos 365 dias' : yearOrPeriod;
    document.getElementById('graph-info').textContent = 
      `❌ Dados não encontrados para ${author} - ${periodText}`;
  }

  showEmptyState(yearOrPeriod, author) {
    const periodText = yearOrPeriod === 'rolling' ? 'últimos 365 dias' : yearOrPeriod;
    document.getElementById('graph-info').textContent = 
      `📭 Nenhuma atividade encontrada para ${author} - ${periodText}`;
  }

  renderStats(stats, metadata) {
    const container = document.getElementById('stats-cards');
    
    // Calculate trends (mock data for now)
    const trends = {
      total: '+12%',
      days: '+5%',
      max: '+8%',
      avg: '+3%'
    };
    
    container.innerHTML = `
      <div class="stat-card">
        <span class="stat-number">${stats.total}</span>
        <span class="stat-label">Total de commits</span>
        <span class="stat-trend trend-up">${trends.total}</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${stats.days}</span>
        <span class="stat-label">Dias ativos</span>
        <span class="stat-trend trend-up">${trends.days}</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${stats.max}</span>
        <span class="stat-label">Máximo/dia</span>
        <span class="stat-trend trend-up">${trends.max}</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${stats.avg}</span>
        <span class="stat-label">Média/dia ativo</span>
        <span class="stat-trend trend-up">${trends.avg}</span>
      </div>
    `;
  }

  renderStreaks(dailyMetrics) {
    const streaks = this.calculateStreaks(dailyMetrics);
    const container = document.getElementById('streak-section');
    
    container.innerHTML = `
      <div class="streak-card">
        <div class="streak-icon">🔥</div>
        <span class="streak-number">${streaks.current}</span>
        <span class="streak-label">Streak atual</span>
      </div>
      <div class="streak-card">
        <div class="streak-icon">⭐</div>
        <span class="streak-number">${streaks.longest}</span>
        <span class="streak-label">Maior streak</span>
      </div>
      <div class="streak-card">
        <div class="streak-icon">📅</div>
        <span class="streak-number">${Object.keys(dailyMetrics).length}</span>
        <span class="streak-label">Dias no período</span>
      </div>
      <div class="streak-card">
        <div class="streak-icon">💪</div>
        <span class="streak-number">${Math.round((Object.values(dailyMetrics).filter(c => c > 0).length / Object.keys(dailyMetrics).length) * 100)}%</span>
        <span class="streak-label">Taxa de atividade</span>
      </div>
    `;
  }

  renderGraph(grid, yearOrPeriod, author, metadata) {
    const container = document.getElementById('graph');
    const infoEl = document.getElementById('graph-info');
    
    // Update info
    const periodText = yearOrPeriod === 'rolling' ? 'Últimos 365 dias' : `Ano ${yearOrPeriod}`;
    let infoText = `${author} • ${periodText}`;
    
    if (metadata.generated_at) {
      const lastUpdate = new Date(metadata.generated_at).toLocaleDateString('pt-BR');
      infoText += ` • Atualizado em ${lastUpdate}`;
    }
    
    if (metadata.date_range) {
      const startDate = new Date(metadata.date_range.start).toLocaleDateString('pt-BR');
      const endDate = new Date(metadata.date_range.end).toLocaleDateString('pt-BR');
      infoText += ` • ${startDate} - ${endDate}`;
    }
    
    infoEl.textContent = infoText;
    
    // Create grid
    container.innerHTML = '';
    container.className = `grid ${this.options.size}`;
    
    grid.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.className = 'week';
      
      week.forEach(day => {
        const cell = document.createElement('div');
        let cellClass = `cell level-${day.level}`;
        
        if (day.isToday) cellClass += ' today';
        if (day.isWeekend) cellClass += ' weekend';
        
        cell.className = cellClass;
        cell.dataset.info = JSON.stringify(day);
        
        weekEl.appendChild(cell);
      });
      
      container.appendChild(weekEl);
    });
  }

  renderMonthlyBreakdown(dailyMetrics) {
    const monthlyData = this.calculateMonthlyBreakdown(dailyMetrics);
    const container = document.getElementById('month-bars');
    
    container.innerHTML = '';
    
    monthlyData.forEach(month => {
      const bar = document.createElement('div');
      bar.className = 'month-bar';
      bar.style.height = `${Math.max(month.percentage, 4)}%`;
      bar.innerHTML = `
        <div class="month-label">${month.name}</div>
        <div class="month-value">${month.count}</div>
      `;
      container.appendChild(bar);
    });
  }

  // Export functions
  async exportAsPNG() {
    // Implementation would use html2canvas or similar
    alert('Exportação PNG será implementada');
  }

  async exportAsSVG() {
    // Implementation would generate SVG
    alert('Exportação SVG será implementada');
  }

  shareLink() {
    const url = new URL(window.location);
    url.searchParams.set('year', this.currentPeriod);
    url.searchParams.set('author', this.currentAuthor);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert('Link copiado para a área de transferência!');
    });
  }

  toggleASCII() {
    const output = document.getElementById('ascii-output');
    const isVisible = output.style.display !== 'none';
    
    if (isVisible) {
      output.style.display = 'none';
    } else {
      if (this.currentData) {
        const ascii = this.generateASCII(this.currentData.daily_metrics, this.currentPeriod);
        output.textContent = ascii;
        output.style.display = 'block';
      }
    }
  }

  generateASCII(dailyMetrics, yearOrPeriod) {
    const symbols = ['·', '▢', '▣', '▦', '■'];
    const grid = this.buildGridFromCounts(dailyMetrics, yearOrPeriod);
    const stats = this.calculateStats(dailyMetrics);
    
    const periodText = yearOrPeriod === 'rolling' ? 'Últimos 365 dias' : `Ano ${yearOrPeriod}`;
    let ascii = `Contribution Graph - ${periodText}\n`;
    ascii += `Total: ${stats.total} commits em ${stats.days} dias\n`;
    ascii += `Máximo: ${stats.max} commits/dia | Média: ${stats.avg} commits/dia ativo\n\n`;
    
    // Month labels
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    let monthLine = '    ';
    let currentMonth = -1;
    
    grid.forEach((week, weekIndex) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      if (month !== currentMonth && weekIndex % 4 === 0) {
        monthLine += months[month].padEnd(4);
        currentMonth = month;
      } else {
        monthLine += '    ';
      }
    });
    ascii += monthLine + '\n';
    
    // Day labels and grid
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let day = 0; day < 7; day++) {
      let line = dayLabels[day] + ' ';
      grid.forEach(week => {
        const cell = week[day];
        line += symbols[cell.level];
      });
      ascii += line + '\n';
    }
    
    ascii += `\nLegenda: ${symbols[0]} (0) ${symbols[1]} (1-2) ${symbols[2]} (3-5) ${symbols[3]} (6-9) ${symbols[4]} (10+)\n`;
    return ascii;
  }

  loadInitialData() {
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlYear = urlParams.get('year');
    const urlAuthor = urlParams.get('author');

    this.currentAuthor = urlAuthor || 'felipemacedo1';
    this.currentPeriod = urlYear || 'rolling';

    document.getElementById('author').value = this.currentAuthor;

    // Set active button
    if (urlYear && urlYear !== 'rolling') {
      const yearBtn = document.querySelector(`[data-period="${urlYear}"]`);
      if (yearBtn) {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        yearBtn.classList.add('active');
      }
    }

    this.loadAndRender(this.currentPeriod, this.currentAuthor);
  }

  // API for terminal/BIOS integration
  getCompactHTML() {
    return `
      <div class="contribution-compact">
        <div class="stats-mini" id="stats-mini"></div>
        <div class="grid-mini" id="grid-mini"></div>
      </div>
    `;
  }

  renderCompact(container, data) {
    const { daily_metrics } = data;
    const stats = this.calculateStats(daily_metrics);
    const grid = this.buildGridFromCounts(daily_metrics, 'rolling');
    
    // Render mini stats
    const statsEl = container.querySelector('#stats-mini');
    statsEl.innerHTML = `${stats.total} commits • ${stats.days} dias ativos`;
    
    // Render mini grid
    const gridEl = container.querySelector('#grid-mini');
    gridEl.innerHTML = '';
    
    grid.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.style.display = 'flex';
      weekEl.style.flexDirection = 'column';
      weekEl.style.gap = '1px';
      
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.style.width = '6px';
        cell.style.height = '6px';
        cell.style.borderRadius = '1px';
        cell.style.background = this.getLevelColor(day.level);
        weekEl.appendChild(cell);
      });
      
      gridEl.appendChild(weekEl);
    });
  }

  getLevelColor(level) {
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    return colors[level] || colors[0];
  }
}

// Export for potential Node.js/CLI use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedContributionGraph;
}