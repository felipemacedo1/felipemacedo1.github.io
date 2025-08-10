/**
 * ContributionGridRenderer - Componente para renderizar o grid de contribuições
 * Extraído do EnhancedContributionGraph para ser reutilizável
 */
class ContributionGridRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'github',
      size: 'normal', // 'compact', 'normal', 'large'
      showTooltips: true,
      showLegend: true,
      ...options
    };
    this.currentTooltip = null;
  }

  render(dailyMetrics) {
    const html = this.renderGrid(dailyMetrics);
    
    this.container.innerHTML = `
      <div class="contribution-grid-container theme-${this.options.theme} size-${this.options.size}">
        ${html}
        ${this.options.showLegend ? this.renderLegend() : ''}
      </div>
    `;

    this.addStyles();
    
    if (this.options.showTooltips) {
      this.attachTooltips();
    }
  }

  renderGrid(dailyMetrics) {
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

  getLevel(commits) {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 5) return 2;
    if (commits <= 10) return 3;
    return 4;
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

  addStyles() {
    if (document.getElementById('contribution-grid-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'contribution-grid-styles';
    style.textContent = `
      .contribution-grid-container {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        padding: 12px;
        border-radius: 6px;
      }
      
      .theme-github {
        background: #0d1117;
        color: #e6edf3;
        border: 1px solid #30363d;
      }
      
      .theme-terminal {
        background: #000;
        color: #00ff00;
        border: 1px solid #00ff00;
      }
      
      .theme-bios {
        background: #1a1a1a;
        color: #03DAC6;
        border: 1px solid #03DAC6;
      }
      
      .contribution-grid {
        display: flex;
        gap: 3px;
        overflow-x: auto;
        margin-bottom: 12px;
        justify-content: center;
      }
      
      .week {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      
      /* Cell sizes based on container size */
      .size-compact .cell {
        width: 8px;
        height: 8px;
      }
      
      .size-normal .cell {
        width: 11px;
        height: 11px;
      }
      
      .size-large .cell {
        width: 14px;
        height: 14px;
      }
      
      .cell {
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .cell:hover {
        transform: scale(1.2);
        z-index: 10;
        position: relative;
      }
      
      /* GitHub theme colors */
      .theme-github .level-0 { background: #161b22; }
      .theme-github .level-1 { background: #0e4429; }
      .theme-github .level-2 { background: #006d32; }
      .theme-github .level-3 { background: #26a641; }
      .theme-github .level-4 { background: #39d353; }
      
      /* Terminal theme colors */
      .theme-terminal .level-0 { background: #001100; }
      .theme-terminal .level-1 { background: #003300; }
      .theme-terminal .level-2 { background: #005500; }
      .theme-terminal .level-3 { background: #007700; }
      .theme-terminal .level-4 { background: #00ff00; }
      
      /* BIOS theme colors */
      .theme-bios .level-0 { background: #0a1a1a; }
      .theme-bios .level-1 { background: #0d2d2a; }
      .theme-bios .level-2 { background: #1a4a44; }
      .theme-bios .level-3 { background: #26665e; }
      .theme-bios .level-4 { background: #03DAC6; }
      
      .legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 12px;
        opacity: 0.7;
      }
      
      .legend-cells {
        display: flex;
        gap: 2px;
      }
      
      .legend-cell {
        border-radius: 2px;
      }
      
      .size-compact .legend-cell {
        width: 8px;
        height: 8px;
      }
      
      .size-normal .legend-cell {
        width: 11px;
        height: 11px;
      }
      
      .size-large .legend-cell {
        width: 14px;
        height: 14px;
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
        .contribution-grid-container {
          padding: 8px;
        }
        
        .contribution-grid {
          gap: 2px;
        }
        
        .week {
          gap: 2px;
        }
        
        /* Force compact on mobile */
        .size-normal .cell,
        .size-large .cell {
          width: 8px;
          height: 8px;
        }
        
        .size-normal .legend-cell,
        .size-large .legend-cell {
          width: 8px;
          height: 8px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ContributionGridRenderer;
