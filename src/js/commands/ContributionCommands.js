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
    const controlsId = `contrib-controls-${Date.now()}`;
    const expandedId = `contrib-expanded-${Date.now()}`;
    
    const output = `
<div class="command-section contribution-terminal-section">
  <h3>📊 Contribution Graph</h3>
  <div class="contrib-terminal-controls">
    <div id="${controlsId}" class="terminal-period-selector"></div>
    <div class="terminal-actions">
      <button class="terminal-btn" onclick="this.closest('.contribution-terminal-section').querySelector('.contrib-expanded-view').classList.toggle('active')">
        📈 Expandir
      </button>
      <button class="terminal-btn" onclick="this.exportContributions('${widgetId}')">
        💾 Exportar
      </button>
    </div>
  </div>
  <div id="${widgetId}" class="contrib-compact-view"></div>
  <div id="${expandedId}" class="contrib-expanded-view">
    <div class="expanded-content"></div>
  </div>
  <style>
    .contribution-terminal-section {
      margin: 16px 0;
      border: 1px solid #00ff00;
      border-radius: 6px;
      padding: 16px;
      background: #001100;
    }
    .contrib-terminal-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .terminal-actions {
      display: flex;
      gap: 8px;
    }
    .terminal-btn {
      background: #00ff00;
      color: #000;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: monospace;
      transition: all 0.2s;
    }
    .terminal-btn:hover {
      background: #00cc00;
      transform: scale(1.05);
    }
    .contrib-expanded-view {
      display: none;
      margin-top: 16px;
      border-top: 1px solid #00ff00;
      padding-top: 16px;
    }
    .contrib-expanded-view.active {
      display: block;
    }
    .contrib-compact-view {
      min-height: 80px;
    }
  </style>
</div>`;

    this.terminal.addToOutput(output, 'system');

    // Add export function to window
    if (!window.exportContributions) {
      window.exportContributions = (widgetId) => {
        this.exportContributionData(widgetId);
      };
    }

    // Initialize compact widget
    setTimeout(async () => {
      try {
        const widgetContainer = document.getElementById(widgetId);
        const controlsContainer = document.getElementById(controlsId);
        const expandedContainer = document.querySelector(`#${expandedId} .expanded-content`);
        
        if (!widgetContainer) {
          console.error('Widget container not found:', widgetId);
          return;
        }
        
        // Create compact widget
        const widget = new UnifiedContributionWidget(widgetContainer, {
          ...options,
          size: 'compact',
          theme: 'terminal',
          mode: 'terminal',
          showStats: true,
          showControls: false,
          showTooltips: true
        });
        await widget.init();

        // Create period selector
        if (controlsContainer) {
          this.createTerminalPeriodSelector(controlsContainer, async (period) => {
            await widget.setPeriod(period);
            if (this.expandedWidget) {
              await this.expandedWidget.setPeriod(period);
            }
          });
        }

        // Store widgets for later use
        this.compactWidget = widget;
        this.expandedContainer = expandedContainer;

      } catch (error) {
        console.error('Error initializing contribution widget:', error.message);
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
      if (error.name === 'TypeError') {
        console.error('Network error loading contribution data:', error.message);
      } else if (error.message.includes('HTTP')) {
        console.error('HTTP error loading contribution data:', error.message);
      } else {
        console.error('Unexpected error loading contribution data:', error.message);
      }
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

      this.terminal.addToOutput(output, 'system');
      return true;
      
    } catch (error) {
      this.terminal.addToOutput(`<span class="error">Erro ao carregar estatísticas: ${error.message}</span>`, 'system');
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

  createTerminalPeriodSelector(container, onPeriodChange) {
    const currentYear = new Date().getFullYear();
    const periods = [
      { value: 'rolling', label: '365d' },
      { value: currentYear, label: currentYear.toString() },
      { value: currentYear - 1, label: (currentYear - 1).toString() },
      { value: currentYear - 2, label: (currentYear - 2).toString() }
    ];

    const html = `
      <div class="terminal-period-buttons">
        ${periods.map(period => `
          <button class="period-btn ${period.value === 'rolling' ? 'active' : ''}" 
                  data-period="${period.value}">
            ${period.label}
          </button>
        `).join('')}
      </div>
      <style>
        .terminal-period-buttons {
          display: flex;
          gap: 4px;
        }
        .period-btn {
          background: #001100;
          color: #00ff00;
          border: 1px solid #00ff00;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          font-family: monospace;
          transition: all 0.2s;
        }
        .period-btn:hover {
          background: #002200;
        }
        .period-btn.active {
          background: #00ff00;
          color: #000;
        }
      </style>
    `;

    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        container.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Call callback
        const period = btn.dataset.period === 'rolling' ? 'rolling' : parseInt(btn.dataset.period);
        onPeriodChange(period);
      });
    });
  }

  async expandedView() {
    if (!this.expandedContainer || !this.compactWidget) return;

    try {
      if (!this.expandedWidget) {
        const { default: ModularContributionWidget } = await import('../widgets/ModularContributionWidget.js');
        
        this.expandedWidget = new ModularContributionWidget(this.expandedContainer, {
          author: this.compactWidget.options.author,
          period: this.compactWidget.options.period,
          theme: 'terminal',
          size: 'large',
          showStats: true,
          showControls: false,
          showTooltips: true,
          showLegend: true
        });
        
        await this.expandedWidget.init();
      }
    } catch (error) {
      console.error('Error creating expanded view:', error);
    }
  }

  exportContributionData(widgetId) {
    try {
      const widget = this.compactWidget;
      if (!widget || !widget.modularWidget || !widget.modularWidget.data) {
        console.error('No data available for export');
        return;
      }

      const exportData = {
        author: widget.options.author,
        period: widget.options.period,
        exported_at: new Date().toISOString(),
        exported_from: 'terminal',
        daily_metrics: widget.modularWidget.data.daily_metrics
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contributions-terminal-${widget.options.author}-${widget.options.period}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Show success message in terminal
      this.terminal.addToOutput('✅ Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      this.terminal.addToOutput('❌ Erro ao exportar dados: ' + error.message, 'error');
    }
  }
}

export default ContributionCommands;