/**
 * ContributionStatsCard - Componente para exibir estatísticas de contribuições
 * Extraído do EnhancedContributionGraph para ser reutilizável
 */
class ContributionStatsCard {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'github',
      showTrend: true,
      compact: false,
      ...options
    };
  }

  render(dailyMetrics) {
    const stats = this.calculateStats(dailyMetrics);
    
    const cardClass = this.options.compact ? 'stats-card-compact' : 'stats-card-full';
    
    this.container.innerHTML = `
      <div class="contribution-stats ${cardClass} theme-${this.options.theme}">
        ${this.renderStatsCards(stats)}
      </div>
    `;

    this.addStyles();
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
      commitsTrend: this.options.showTrend ? this.calculateTrend(dailyMetrics) : 0
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

  renderStatsCards(stats) {
    if (this.options.compact) {
      return `
        <div class="stats-grid-compact">
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">${stats.totalCommits}</span>
            <span class="stat-label">commits</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">${stats.currentStreak}</span>
            <span class="stat-label">dias</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📅</span>
            <span class="stat-value">${stats.activeDays}</span>
            <span class="stat-label">ativos</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-grid-full">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalCommits}</div>
            <div class="stat-label">Total de commits</div>
            ${this.options.showTrend ? `<div class="stat-trend ${stats.commitsTrend >= 0 ? 'positive' : 'negative'}">
              ${stats.commitsTrend >= 0 ? '↗' : '↘'} ${Math.abs(stats.commitsTrend)}%
            </div>` : ''}
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

  addStyles() {
    if (document.getElementById('contribution-stats-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'contribution-stats-styles';
    style.textContent = `
      .contribution-stats {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        margin-bottom: 16px;
      }
      
      /* Compact Stats */
      .stats-grid-compact {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
      }
      
      .theme-github .stat-item {
        background: #21262d;
        color: #e6edf3;
      }
      
      .theme-terminal .stat-item {
        background: #001100;
        color: #00ff00;
        border: 1px solid #00ff00;
      }
      
      .theme-bios .stat-item {
        background: #0a1a1a;
        color: #03DAC6;
        border: 1px solid #03DAC6;
      }
      
      .stat-icon {
        font-size: 14px;
      }
      
      .stat-value {
        font-weight: bold;
        font-size: 14px;
      }
      
      .stat-label {
        opacity: 0.7;
        font-size: 10px;
      }
      
      /* Full Stats */
      .stats-grid-full {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
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
      
      .theme-github .stat-card {
        background: #21262d;
        border: 1px solid #30363d;
        color: #e6edf3;
      }
      
      .theme-terminal .stat-card {
        background: #001100;
        border: 1px solid #00ff00;
        color: #00ff00;
      }
      
      .theme-bios .stat-card {
        background: #0a1a1a;
        border: 1px solid #03DAC6;
        color: #03DAC6;
      }
      
      .stat-content {
        flex: 1;
      }
      
      .stat-card .stat-icon {
        font-size: 24px;
      }
      
      .stat-card .stat-value {
        font-size: 24px;
        font-weight: bold;
        line-height: 1;
      }
      
      .stat-card .stat-label {
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
      
      @media (max-width: 768px) {
        .stats-grid-full {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .stat-card {
          padding: 12px;
        }
        
        .stat-card .stat-value {
          font-size: 20px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ContributionStatsCard;
