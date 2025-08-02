/**
 * ContributionWidget - Compact widget for terminal/BIOS integration
 * Supports multiple sizes and themes
 */
class ContributionWidget {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling',
      size: 'compact', // mini, compact, normal
      theme: 'github', // github, terminal, bios
      showStats: true,
      ...options
    };
    this.data = null;
  }

  async init() {
    await this.loadData();
    this.render();
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
    const dates = Object.keys(dailyMetrics).sort();
    
    if (dates.length === 0) {
      this.container.innerHTML = '<div class="error">Nenhum dado disponível</div>';
      return;
    }

    this.container.className = `contribution-widget ${this.options.theme} ${this.options.size}`;
    
    let html = '';
    
    if (this.options.showStats) {
      html += this.renderStats(dailyMetrics);
    }
    
    html += this.renderGraph(dailyMetrics, dates);
    
    this.container.innerHTML = html;
    this.addStyles();
  }

  renderStats(dailyMetrics) {
    const totalCommits = Object.values(dailyMetrics).reduce((sum, count) => sum + count, 0);
    const activeDays = Object.values(dailyMetrics).filter(count => count > 0).length;
    const streak = this.calculateStreak(dailyMetrics);
    
    return `
      <div class="widget-stats">
        <div class="stat">
          <span class="stat-value">${totalCommits}</span>
          <span class="stat-label">commits</span>
        </div>
        <div class="stat">
          <span class="stat-value">${activeDays}</span>
          <span class="stat-label">dias ativos</span>
        </div>
        <div class="stat">
          <span class="stat-value">${streak}</span>
          <span class="stat-label">sequência</span>
        </div>
      </div>
    `;
  }

  renderGraph(dailyMetrics, dates) {
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    let html = '<div class="widget-graph">';
    
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
        
        html += `<div class="cell level-${level}" title="${dateStr}: ${commits} commits"></div>`;
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  calculateStreak(dailyMetrics) {
    const dates = Object.keys(dailyMetrics).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
      if (dailyMetrics[date] > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  getLevel(commits) {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 5) return 2;
    if (commits <= 10) return 3;
    return 4;
  }

  addStyles() {
    if (document.getElementById('contribution-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'contribution-widget-styles';
    style.textContent = `
      .contribution-widget {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
      }
      
      .contribution-widget.github {
        background: #0d1117;
        border: 1px solid #30363d;
        color: #e6edf3;
      }
      
      .contribution-widget.terminal {
        background: #000;
        border: 1px solid #00ff00;
        color: #00ff00;
      }
      
      .contribution-widget.bios {
        background: #1a1a1a;
        border: 1px solid #03DAC6;
        color: #03DAC6;
      }
      
      .widget-stats {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;
        font-size: 12px;
      }
      
      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .stat-value {
        font-weight: bold;
        font-size: 14px;
      }
      
      .stat-label {
        opacity: 0.7;
        font-size: 10px;
      }
      
      .widget-graph {
        display: flex;
        gap: 2px;
        overflow-x: auto;
      }
      
      .widget-graph .week {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .widget-graph .cell {
        border-radius: 1px;
        cursor: pointer;
      }
      
      .contribution-widget.mini .cell {
        width: 6px;
        height: 6px;
      }
      
      .contribution-widget.compact .cell {
        width: 8px;
        height: 8px;
      }
      
      .contribution-widget.normal .cell {
        width: 11px;
        height: 11px;
      }
      
      .contribution-widget.github .level-0 { background: #161b22; }
      .contribution-widget.github .level-1 { background: #0e4429; }
      .contribution-widget.github .level-2 { background: #006d32; }
      .contribution-widget.github .level-3 { background: #26a641; }
      .contribution-widget.github .level-4 { background: #39d353; }
      
      .contribution-widget.terminal .level-0 { background: #001100; }
      .contribution-widget.terminal .level-1 { background: #003300; }
      .contribution-widget.terminal .level-2 { background: #005500; }
      .contribution-widget.terminal .level-3 { background: #007700; }
      .contribution-widget.terminal .level-4 { background: #00ff00; }
      
      .contribution-widget.bios .level-0 { background: #0a1a1a; }
      .contribution-widget.bios .level-1 { background: #0d2d2a; }
      .contribution-widget.bios .level-2 { background: #1a4a44; }
      .contribution-widget.bios .level-3 { background: #26665e; }
      .contribution-widget.bios .level-4 { background: #03DAC6; }
      
      .error {
        color: #f85149;
        font-size: 12px;
        text-align: center;
        padding: 8px;
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ContributionWidget;