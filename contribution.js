/**
 * Contribution Graph - Modular Core Logic
 * Designed for reuse in terminal/CLI versions
 */

const ContributionGraph = {
  
  // Core utility functions (reusable for CLI)
  formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  alignToSunday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    d.setDate(d.getDate() - dow);
    return d;
  },

  alignToSaturday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    const offset = (6 - dow + 7) % 7;
    d.setDate(d.getDate() + offset);
    return d;
  },

  intensityLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  },

  // Parse JSON data (handles both formats)
  parseActivityData(jsonData) {
    if (!jsonData) return { daily_metrics: {}, metadata: {} };
    
    // Handle new format with metadata
    if (jsonData.daily_metrics) {
      return {
        daily_metrics: jsonData.daily_metrics,
        metadata: jsonData.metadata || {}
      };
    }
    
    // Handle legacy format
    if (jsonData.counts) {
      return {
        daily_metrics: jsonData.counts,
        metadata: {}
      };
    }
    
    return { daily_metrics: {}, metadata: {} };
  },

  // Build weekly grid from daily counts (core algorithm)
  buildGridFromCounts(dailyMetrics, yearOrPeriod) {
    let startDate, endDate;
    
    // Handle rolling 365 days
    if (yearOrPeriod === 'rolling' || typeof yearOrPeriod === 'object') {
      const dates = Object.keys(dailyMetrics).sort();
      if (dates.length > 0) {
        startDate = new Date(dates[0]);
        endDate = new Date(dates[dates.length - 1]);
      } else {
        // Fallback to current year if no data
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
      }
    } else {
      // Handle specific year
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
  },

  // Calculate statistics
  calculateStats(dailyMetrics) {
    const counts = Object.values(dailyMetrics);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const days = counts.filter(count => count > 0).length;
    const max = Math.max(...counts, 0);
    const avg = days > 0 ? (total / days).toFixed(1) : 0;
    
    return { total, days, max, avg };
  },

  // Data loading
  async loadData(year, author) {
    // Try rolling 365 days first (default)
    if (year === 'rolling' || year === new Date().getFullYear()) {
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
    
    // Fallback to yearly data
    const url = `analytics/activity-${year}-${author}.json`;
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
  },

  // ASCII generation for terminal use
  generateASCII(dailyMetrics, yearOrPeriod) {
    const symbols = ['·', '▢', '▣', '▦', '■'];
    const grid = this.buildGridFromCounts(dailyMetrics, yearOrPeriod);
    const stats = this.calculateStats(dailyMetrics);
    
    const periodText = yearOrPeriod === 'rolling' ? 'Últimos 365 dias' : `Ano ${yearOrPeriod}`;
    let ascii = `Contribution Graph - ${periodText}\n`;
    ascii += `Total: ${stats.total} commits in ${stats.days} days\n`;
    ascii += `Max: ${stats.max} commits/day | Avg: ${stats.avg} commits/active day\n\n`;
    
    // Month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 0; day < 7; day++) {
      let line = dayLabels[day] + ' ';
      grid.forEach(week => {
        const cell = week[day];
        line += symbols[cell.level];
      });
      ascii += line + '\n';
    }
    
    ascii += '\nLegend: · (0) ▢ (1-2) ▣ (3-5) ▦ (6-9) ■ (10+)\n';
    return ascii;
  },

  // UI-specific functions
  createYearButtons(currentYear, onSelect) {
    const container = document.getElementById('year-buttons');
    container.innerHTML = '';
    
    // Add rolling 365 days button first
    const rollingBtn = document.createElement('button');
    rollingBtn.className = 'btn active';
    rollingBtn.textContent = '365d';
    rollingBtn.dataset.year = 'rolling';
    rollingBtn.title = 'Últimos 365 dias';
    rollingBtn.addEventListener('click', () => {
      container.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      rollingBtn.classList.add('active');
      onSelect('rolling');
    });
    container.appendChild(rollingBtn);
    
    // Add yearly buttons
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = year;
      btn.dataset.year = year;
      
      btn.addEventListener('click', () => {
        container.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onSelect(year);
      });
      
      container.appendChild(btn);
    }
  },

  renderGraph(grid, stats, metadata, yearOrPeriod, author) {
    const container = document.getElementById('graph');
    container.innerHTML = '';
    
    // Update info
    const infoEl = document.getElementById('info');
    const periodText = yearOrPeriod === 'rolling' ? 'Últimos 365 dias' : yearOrPeriod;
    let infoText = `${author} • ${periodText} • ${stats.total} contributions`;
    
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
    const gridEl = document.createElement('div');
    gridEl.className = 'grid';
    
    grid.forEach(week => {
      const weekEl = document.createElement('div');
      weekEl.className = 'week';
      
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = `cell level-${day.level}`;
        cell.title = `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`;
        weekEl.appendChild(cell);
      });
      
      gridEl.appendChild(weekEl);
    });
    
    container.appendChild(gridEl);
  },

  async loadAndRender(yearOrPeriod, author) {
    const infoEl = document.getElementById('info');
    const periodText = yearOrPeriod === 'rolling' ? 'últimos 365 dias' : yearOrPeriod;
    infoEl.textContent = `Carregando ${periodText} para ${author}...`;
    
    const data = await this.loadData(yearOrPeriod, author);
    
    if (!data) {
      const fileName = yearOrPeriod === 'rolling' ? 
        `activity-rolling-365d-${author}.json` : 
        `activity-${yearOrPeriod}-${author}.json`;
      infoEl.textContent = `❌ Arquivo não encontrado: analytics/${fileName}`;
      document.getElementById('graph').innerHTML = '<p style="text-align:center;color:#7d8590;padding:40px;">Dados não disponíveis</p>';
      return;
    }
    
    const { daily_metrics, metadata } = data;
    const stats = this.calculateStats(daily_metrics);
    
    if (stats.total === 0) {
      infoEl.textContent = `${author} • ${periodText} • Nenhuma contribuição encontrada`;
      document.getElementById('graph').innerHTML = '<p style="text-align:center;color:#7d8590;padding:40px;">Nenhuma atividade no período</p>';
      return;
    }
    
    const grid = this.buildGridFromCounts(daily_metrics, yearOrPeriod);
    this.renderGraph(grid, stats, metadata, yearOrPeriod, author);
  }
};

// Export for potential Node.js/CLI use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContributionGraph;
}