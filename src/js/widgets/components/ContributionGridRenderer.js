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
    const gridElement = this.renderGrid(dailyMetrics);
    
    const containerDiv = document.createElement('div');
    containerDiv.className = `contribution-grid-container theme-${this.options.theme} size-${this.options.size}`;
    
    if (typeof gridElement === 'string') {
      containerDiv.innerHTML = gridElement; // allow markup like legend/error
    } else {
      containerDiv.appendChild(gridElement);
    }
    
    if (this.options.showLegend) {
      containerDiv.insertAdjacentHTML('beforeend', this.createLegend());
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(containerDiv);
    
    // Styles are now provided by src/css/contribution-widgets.css
    
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

  createLegend() {
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
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'tooltip-date';
    dateDiv.textContent = new Date(date).toLocaleDateString('pt-BR');
    
    const commitsDiv = document.createElement('div');
    commitsDiv.className = 'tooltip-commits';
    commitsDiv.textContent = `${commits} commits`;
    
    const levelDiv = document.createElement('div');
    levelDiv.className = 'tooltip-level';
    levelDiv.textContent = `Nível ${level}/4`;
    
    tooltip.appendChild(dateDiv);
    tooltip.appendChild(commitsDiv);
    tooltip.appendChild(levelDiv);
    
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
}

export default ContributionGridRenderer;
