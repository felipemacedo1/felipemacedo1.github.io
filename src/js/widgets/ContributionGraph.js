/**
 * ContributionGraph - Core contribution graph functionality
 * Handles data loading, rendering, and basic interactions
 */
class ContributionGraph {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      author: 'felipemacedo1',
      period: 'rolling',
      showLegend: true,
      showTooltip: true,
      ...options
    };
    this.data = null;
  }

  static async loadData(period, author) {
    try {
      const filename = period === 'rolling' 
        ? `activity-rolling-365d-${author}.json`
        : `activity-${period}-${author}.json`;
      
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
      
      return await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  static createYearButtons(currentYear, onYearSelect) {
    const container = document.getElementById('year-buttons');
    if (!container) return;

    container.innerHTML = '';
    
    // Rolling button (default)
    const rollingBtn = document.createElement('button');
    rollingBtn.className = 'btn active';
    rollingBtn.textContent = '📅 Últimos 365 dias';
    rollingBtn.dataset.year = 'rolling';
    rollingBtn.addEventListener('click', () => {
      document.querySelectorAll('#year-buttons .btn').forEach(b => b.classList.remove('active'));
      rollingBtn.classList.add('active');
      onYearSelect('rolling');
    });
    container.appendChild(rollingBtn);

    // Year buttons
    for (let year = currentYear; year >= 2022; year--) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = year.toString();
      btn.dataset.year = year.toString();
      btn.addEventListener('click', () => {
        document.querySelectorAll('#year-buttons .btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onYearSelect(year);
      });
      container.appendChild(btn);
    }
  }

  static async loadAndRender(period, author) {
    const data = await this.loadData(period, author);
    if (!data) {
      document.getElementById('info').textContent = 'Erro ao carregar dados';
      return;
    }

    this.renderGraph(data, period);
    this.updateInfo(data, period, author);
  }

  static renderGraph(data, period) {
    const container = document.getElementById('graph');
    if (!container) return;

    const dailyMetrics = data.daily_metrics || {};
    const dates = Object.keys(dailyMetrics).sort();
    
    if (dates.length === 0) {
      container.innerHTML = '<p>Nenhum dado disponível</p>';
      return;
    }

    // Calculate weeks needed
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    container.innerHTML = '';
    
    // Create weeks
    for (let week = 0; week < weeksNeeded; week++) {
      const weekDiv = document.createElement('div');
      weekDiv.className = 'week';
      
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);
        
        if (currentDate > endDate) break;
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const commits = dailyMetrics[dateStr] || 0;
        
        const cell = document.createElement('div');
        cell.className = `cell level-${this.getLevel(commits)}`;
        cell.title = `${dateStr}: ${commits} commits`;
        
        weekDiv.appendChild(cell);
      }
      
      container.appendChild(weekDiv);
    }
  }

  static getLevel(commits) {
    // Optimized level determination using array lookup
    const thresholds = [0, 2, 5, 10];
    for (let i = 0; i < thresholds.length; i++) {
      if (commits <= thresholds[i]) return i;
    }
    return 4;
  }

  static updateInfo(data, period, author) {
    const infoElement = document.getElementById('info');
    if (!infoElement) return;

    const dailyMetrics = data.daily_metrics || {};
    const totalCommits = Object.values(dailyMetrics).reduce((sum, count) => sum + count, 0);
    const activeDays = Object.values(dailyMetrics).filter(count => count > 0).length;
    
    const periodText = period === 'rolling' ? 'últimos 365 dias' : `ano ${period}`;
    infoElement.textContent = `${totalCommits} commits em ${activeDays} dias ativos (${periodText}) - ${author}`;
  }

  static generateASCII(dailyMetrics, period) {
    const dates = Object.keys(dailyMetrics).sort();
    if (dates.length === 0) return 'Nenhum dado disponível';

    const chars = [' ', '░', '▒', '▓', '█'];
    let ascii = `Contribution Graph - ${period === 'rolling' ? 'Últimos 365 dias' : period}\n\n`;
    
    // Optimized: combine data processing in single loop
    const weeks = [];
    let currentWeek = [];
    let totalCommits = 0;
    let activeDays = 0;
    
    dates.forEach(date => {
      const commits = dailyMetrics[date] || 0;
      totalCommits += commits;
      if (commits > 0) activeDays++;
      
      const level = this.getLevel(commits);
      currentWeek.push(chars[level]);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(' ');
      weeks.push(currentWeek);
    }

    // Render ASCII
    for (let day = 0; day < 7; day++) {
      for (let week = 0; week < weeks.length; week++) {
        ascii += weeks[week][day] || ' ';
      }
      ascii += '\n';
    }

    ascii += `\nLegenda: ${chars.join(' ')} (menos → mais)\n`;
    ascii += `Total: ${totalCommits} commits em ${activeDays} dias ativos`;
    
    return ascii;
  }
}

export default ContributionGraph;