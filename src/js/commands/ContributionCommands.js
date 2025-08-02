/**
 * ContributionCommands - Terminal commands for contribution graph integration
 */
import UnifiedContributionWidget from '../widgets/UnifiedContributionWidget.js';

class ContributionCommands {
  constructor(terminal) {
    this.terminal = terminal;
  }

  async showContributions(args = []) {
    const options = this.parseArgs(args);
    const widgetId = `contrib-widget-${Date.now()}`;
    
    const output = `
<div class="command-section">
  <h3>📊 Contribution Graph</h3>
  <div id="${widgetId}"></div>
  <div class="command-links">
    <a href="examples/pages/contribution-graph.html" target="_blank">📈 Ver gráfico completo</a>
    <a href="examples/pages/contribution-enhanced.html" target="_blank">✨ Versão avançada</a>
  </div>
</div>`;

    this.terminal.addToOutput(output);

    // Initialize widget
    setTimeout(() => {
      const widgetContainer = document.getElementById(widgetId);
      if (widgetContainer) {
        const widget = new UnifiedContributionWidget(widgetContainer, {
          ...options,
          size: 'compact',
          theme: 'terminal',
          mode: 'terminal'
        });
        widget.init();
      }
    }, 100);

    return true;
  }

  async loadData(period, author) {
    try {
      const filename = period === 'rolling' 
        ? `activity-rolling-365d-${author}.json`
        : `activity-${period}-${author}.json`;
      
      // Try different base paths depending on context
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
      
      return await response.json();
    } catch (error) {
      console.error('Error loading contribution data:', error);
      return null;
    }
  }

  async showStats(args = []) {
    const options = this.parseArgs(args);
    
    try {
      const filename = options.period === 'rolling' 
        ? `activity-rolling-365d-${options.author}.json`
        : `activity-${options.period}-${options.author}.json`;
      
      const response = await fetch(`analytics/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const dailyMetrics = data.daily_metrics || {};
      const dates = Object.keys(dailyMetrics).sort();
      
      // Calculate streaks
      const streaks = this.calculateStreaks(dailyMetrics);
      
      // Find best day
      const bestDay = dates.reduce((best, date) => {
        const commits = dailyMetrics[date];
        return commits > best.commits ? { date, commits } : best;
      }, { date: '', commits: 0 });
      
      const totalCommits = Object.values(dailyMetrics).reduce((sum, count) => sum + count, 0);
      const activeDays = Object.values(dailyMetrics).filter(count => count > 0).length;
      
      const output = `
<div class="command-section">
  <h3>📊 Estatísticas Detalhadas</h3>
  <div class="stats-detailed">
    <div class="stat-row">
      <span class="stat-icon">🔥</span>
      <span class="stat-label">Sequência atual:</span>
      <span class="stat-value">${streaks.current} dias</span>
    </div>
    <div class="stat-row">
      <span class="stat-icon">🏆</span>
      <span class="stat-label">Maior sequência:</span>
      <span class="stat-value">${streaks.longest} dias</span>
    </div>
    <div class="stat-row">
      <span class="stat-icon">⭐</span>
      <span class="stat-label">Melhor dia:</span>
      <span class="stat-value">${bestDay.commits} commits (${new Date(bestDay.date).toLocaleDateString('pt-BR')})</span>
    </div>
    <div class="stat-row">
      <span class="stat-icon">📈</span>
      <span class="stat-label">Taxa de atividade:</span>
      <span class="stat-value">${Math.round((activeDays / dates.length) * 100)}%</span>
    </div>
  </div>
  <p class="command-tip">💡 Use <code>contributions --enhanced</code> para análise completa</p>
</div>`;

      this.terminal.addOutput(output);
      return true;
      
    } catch (error) {
      this.terminal.addOutput(`<span class="error">Erro ao carregar estatísticas: ${error.message}</span>`);
      return false;
    }
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

  parseArgs(args) {
    const options = {
      author: 'felipemacedo1',
      period: 'rolling'
    };

    args.forEach(arg => {
      if (arg.startsWith('--author=')) {
        options.author = arg.split('=')[1];
      } else if (arg.startsWith('--period=') || arg.startsWith('--year=')) {
        const value = arg.split('=')[1];
        options.period = value === 'rolling' ? 'rolling' : parseInt(value);
      } else if (arg === '--enhanced') {
        options.enhanced = true;
      }
    });

    return options;
  }
}

export default ContributionCommands;