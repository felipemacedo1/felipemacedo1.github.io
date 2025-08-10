/**
 * ContributionControls - Componente para controles de período, tema e exportação
 * Extraído do EnhancedContributionGraph para ser reutilizável
 */
class ContributionControls {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'github',
      period: 'rolling',
      author: 'felipemacedo1',
      showThemeSelector: true,
      showExport: true,
      showPeriodSelector: true,
      compact: false,
      ...options
    };
    this.callbacks = {};
  }

  render() {
    const controlsClass = this.options.compact ? 'controls-compact' : 'controls-full';
    
    this.container.innerHTML = `
      <div class="contribution-controls ${controlsClass} theme-${this.options.theme}">
        ${this.options.showPeriodSelector ? this.renderPeriodSelector() : ''}
        <div class="controls-right">
          ${this.options.showThemeSelector ? this.renderThemeSelector() : ''}
          ${this.options.showExport ? this.renderExportButton() : ''}
        </div>
      </div>
    `;

    this.addStyles();
    this.attachEventListeners();
  }

  renderPeriodSelector() {
    const currentYear = new Date().getFullYear();
    const periods = [
      { value: 'rolling', label: this.options.compact ? '365d' : '📅 Últimos 365 dias' },
      { value: currentYear, label: currentYear.toString() },
      { value: currentYear - 1, label: (currentYear - 1).toString() },
      { value: currentYear - 2, label: (currentYear - 2).toString() },
      { value: currentYear - 3, label: (currentYear - 3).toString() }
    ];

    return `
      <div class="period-selector">
        ${this.options.compact ? '' : '<label>Período:</label>'}
        <div class="period-buttons">
          ${periods.map(period => `
            <button class="period-btn ${period.value === this.options.period ? 'active' : ''}" 
                    data-period="${period.value}">
              ${period.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderThemeSelector() {
    const themes = [
      { value: 'github', label: 'GitHub' },
      { value: 'terminal', label: 'Terminal' },
      { value: 'bios', label: 'BIOS' }
    ];

    if (this.options.compact) {
      return `
        <select class="theme-select" id="theme-select">
          ${themes.map(theme => `
            <option value="${theme.value}" ${theme.value === this.options.theme ? 'selected' : ''}>
              ${theme.label}
            </option>
          `).join('')}
        </select>
      `;
    }

    return `
      <div class="theme-selector">
        <label>Tema:</label>
        <select id="theme-select">
          ${themes.map(theme => `
            <option value="${theme.value}" ${theme.value === this.options.theme ? 'selected' : ''}>
              ${theme.label}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }

  renderExportButton() {
    return `
      <button id="export-btn" class="btn export-btn">
        ${this.options.compact ? '📥' : '📥 Exportar'}
      </button>
    `;
  }

  attachEventListeners() {
    // Period buttons
    const periodBtns = this.container.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update options and trigger callback
        this.options.period = btn.dataset.period;
        if (this.callbacks.onPeriodChange) {
          this.callbacks.onPeriodChange(this.options.period);
        }
      });
    });

    // Theme selector
    const themeSelect = this.container.querySelector('#theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.options.theme = e.target.value;
        this.updateTheme();
        if (this.callbacks.onThemeChange) {
          this.callbacks.onThemeChange(this.options.theme);
        }
      });
    }

    // Export button
    const exportBtn = this.container.querySelector('#export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        // Authorization check before export
        if (this.isAuthorizedToExport()) {
          if (this.callbacks.onExport) {
            this.callbacks.onExport();
          }
        } else {
          console.warn('Export not authorized for current user');
        }
      });
    }
  }

  updateTheme() {
    const controls = this.container.querySelector('.contribution-controls');
    if (controls) {
      controls.className = controls.className.replace(/theme-\w+/, `theme-${this.options.theme}`);
    }
  }

  // Authorization check for export functionality
  isAuthorizedToExport() {
    // Only allow export for the configured author
    return this.options.author === 'felipemacedo1';
  }

  // Method to set callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  // Method to update active period programmatically
  setActivePeriod(period) {
    this.options.period = period;
    const periodBtns = this.container.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.period === period);
    });
  }

  addStyles() {
    if (document.getElementById('contribution-controls-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'contribution-controls-styles';
    style.textContent = `
      .contribution-controls {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
        margin-bottom: 16px;
      }
      
      .controls-full {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .controls-compact {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .controls-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      
      .period-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .period-selector label {
        font-size: 14px;
        font-weight: 500;
        opacity: 0.8;
      }
      
      .period-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      
      .period-btn {
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      /* GitHub theme */
      .theme-github .period-btn {
        background: #21262d;
        color: #e6edf3;
        border: 1px solid #30363d;
      }
      
      .theme-github .period-btn:hover {
        background: #30363d;
      }
      
      .theme-github .period-btn.active {
        background: #238636;
        border-color: #238636;
        color: white;
      }
      
      /* Terminal theme */
      .theme-terminal .period-btn {
        background: #000;
        color: #00ff00;
        border: 1px solid #00ff00;
      }
      
      .theme-terminal .period-btn:hover {
        background: #001100;
      }
      
      .theme-terminal .period-btn.active {
        background: #00ff00;
        color: #000;
      }
      
      /* BIOS theme */
      .theme-bios .period-btn {
        background: #1a1a1a;
        color: #03DAC6;
        border: 1px solid #03DAC6;
      }
      
      .theme-bios .period-btn:hover {
        background: #0a1a1a;
      }
      
      .theme-bios .period-btn.active {
        background: #03DAC6;
        color: #000;
      }
      
      .theme-selector {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .theme-selector label {
        font-size: 14px;
        font-weight: 500;
        opacity: 0.8;
      }
      
      .theme-select,
      .theme-selector select {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .theme-github .theme-select,
      .theme-github .theme-selector select {
        background: #21262d;
        border: 1px solid #30363d;
        color: #e6edf3;
      }
      
      .theme-terminal .theme-select,
      .theme-terminal .theme-selector select {
        background: #000;
        border: 1px solid #00ff00;
        color: #00ff00;
      }
      
      .theme-bios .theme-select,
      .theme-bios .theme-selector select {
        background: #1a1a1a;
        border: 1px solid #03DAC6;
        color: #03DAC6;
      }
      
      .btn {
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .theme-github .btn {
        background: #238636;
        color: white;
      }
      
      .theme-github .btn:hover {
        background: #2ea043;
      }
      
      .theme-terminal .btn {
        background: #00ff00;
        color: #000;
      }
      
      .theme-terminal .btn:hover {
        background: #00cc00;
      }
      
      .theme-bios .btn {
        background: #03DAC6;
        color: #000;
      }
      
      .theme-bios .btn:hover {
        background: #00b8a3;
      }
      
      @media (max-width: 768px) {
        .controls-full {
          flex-direction: column;
          align-items: stretch;
        }
        
        .controls-right {
          justify-content: space-between;
        }
        
        .period-buttons {
          justify-content: center;
        }
        
        .period-btn {
          padding: 8px 10px;
          font-size: 11px;
        }
        
        .btn {
          padding: 8px 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ContributionControls;
