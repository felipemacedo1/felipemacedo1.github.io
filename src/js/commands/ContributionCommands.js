/**
 * ContributionCommands - Terminal commands for contribution graph integration
 * Refatorado para melhor UX e performance
 */
import UnifiedContributionWidget from '../widgets/UnifiedContributionWidget.js';

class ContributionCommands {
  constructor(terminal) {
    this.terminal = terminal;
    this.currentWidget = null;
    this.currentWidgetId = null;
    this.loadCSS();
  }

  loadCSS() {
    // Carregar CSS apenas uma vez
    if (!document.getElementById('terminal-contributions-css')) {
      const link = document.createElement('link');
      link.id = 'terminal-contributions-css';
      link.rel = 'stylesheet';
      link.href = 'src/css/terminal-contributions.css';
      document.head.appendChild(link);
    }
  }

  async showContributions(args = []) {
    try {
      const options = this.parseArgs(args);
      const widgetId = `contrib-terminal-${Date.now()}`;
      
      // Clear previous widget if exists
      this.cleanup();
      
      console.log('🚀 Starting terminal contribution command with options:', options);
      
      // Create interface with loading state
      const output = this.createContributionHTML(widgetId, options);
      this.terminal.addToOutput(output, 'system');
      
      // Initialize widget asynchronously but don't block terminal
      setTimeout(async () => {
        await this.initializeWidget(widgetId, options);
      }, 100);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error in showContributions:', error);
      this.terminal.addToOutput(`<span class="error">❌ Failed to initialize contribution command: ${error.message}</span>`, 'system');
      return false;
    }
  }

  createContributionHTML(widgetId, options) {
    return `
<div class="terminal-contribution-display">
  <div class="contrib-terminal-header">
    <span class="contrib-icon">📊</span>
    <div class="contrib-info">
      <div class="contrib-title">GitHub Contributions</div>
      <div class="contrib-subtitle">${options.author} • Last 365 days</div>
    </div>
    <div class="contrib-status">
      <span class="status-indicator loading">⟳</span>
      <span class="status-text">Loading...</span>
    </div>
  </div>
  <div id="${widgetId}" class="modular-contribution-widget theme-${options.theme || 'dark'}">
    <div class="contrib-loading-state">
      <div class="loading-animation">
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p>Fetching GitHub activity data...</p>
      </div>
    </div>
  </div>
</div>

<style>
.terminal-contribution-display {
  margin: 12px 0;
  border: 1px solid var(--terminal-border, #333);
  border-radius: 6px;
  background: var(--terminal-bg, #0a0e27);
  overflow: hidden;
}

.contrib-terminal-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0,255,0,0.1) 0%, rgba(0,200,0,0.05) 100%);
  border-bottom: 1px solid rgba(0,255,0,0.2);
}

.contrib-icon {
  font-size: 20px;
  margin-right: 12px;
}

.contrib-info {
  flex: 1;
}

.contrib-title {
  font-weight: 600;
  color: var(--terminal-success, #00ff00);
  font-size: 14px;
}

.contrib-subtitle {
  font-size: 12px;
  color: var(--terminal-muted, #888);
  margin-top: 2px;
}

.contrib-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  text-align: center;
  line-height: 12px;
}

.status-indicator.loading {
  animation: terminal-spin 1s linear infinite;
  color: var(--terminal-warning, #ffa500);
}

.status-indicator.success {
  color: var(--terminal-success, #00ff00);
}

.status-indicator.error {
  color: var(--terminal-error, #ff6b6b);
}

.contrib-loading-state {
  padding: 24px;
  text-align: center;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--terminal-success, #00ff00);
  animation: terminal-loading-dots 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

.loading-animation p {
  margin: 0;
  color: var(--terminal-muted, #888);
  font-size: 13px;
}

@keyframes terminal-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes terminal-loading-dots {
  0%, 80%, 100% { 
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}
</style>`;
  }

  async initializeWidget(widgetId, options) {
    try {
      const containerElement = document.getElementById(widgetId);
      if (!containerElement) {
        throw new Error('Widget container not found');
      }

      // Update status to loading
      this.updateContributionStatus('loading', 'Initializing widget...');

      console.log('🔧 Initializing terminal contribution widget with options:', options);

      const widget = new UnifiedContributionWidget(containerElement, options);
      
      // Update status during initialization
      this.updateContributionStatus('loading', 'Loading data...');
      
      // Initialize widget with better error handling
      await widget.init();
      
      this.currentWidget = widget;
      this.currentWidgetId = widgetId;
      
      // Update status to success
      this.updateContributionStatus('success', 'Ready');
      
      // Show success message in terminal
      setTimeout(() => {
        this.terminal.addToOutput('✅ GitHub contributions loaded successfully', 'success');
      }, 500);
      
      console.log('✅ Terminal contribution widget initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing contribution widget:', error);
      
      // Update status to error
      this.updateContributionStatus('error', 'Failed to load');
      
      const containerElement = document.getElementById(widgetId);
      if (containerElement) {
        containerElement.innerHTML = `
          <div class="contrib-error-state">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h4>Failed to load contributions</h4>
              <p>${error.message}</p>
              <button onclick="location.reload()" class="retry-button">
                🔄 Retry
              </button>
            </div>
          </div>
          
          <style>
          .contrib-error-state {
            display: flex;
            align-items: center;
            padding: 20px;
            gap: 12px;
            background: rgba(248, 81, 73, 0.1);
            border: 1px solid rgba(248, 81, 73, 0.3);
            border-radius: 6px;
            margin: 12px;
          }
          
          .error-icon {
            font-size: 24px;
            flex-shrink: 0;
          }
          
          .error-content h4 {
            margin: 0 0 4px 0;
            color: var(--terminal-error, #ff6b6b);
            font-size: 14px;
          }
          
          .error-content p {
            margin: 0 0 12px 0;
            color: var(--terminal-muted, #888);
            font-size: 12px;
          }
          
          .retry-button {
            background: var(--terminal-error, #ff6b6b);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          
          .retry-button:hover {
            opacity: 0.8;
          }
          </style>`;
      }
      
      // Show detailed error in terminal output
      this.terminal.addToOutput(`<span class="error">❌ Error loading contributions: ${error.message}</span>`, 'system');
    }
  }

  updateContributionStatus(status, message) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${status}`;
      if (status === 'success') {
        statusIndicator.textContent = '✓';
      } else if (status === 'error') {
        statusIndicator.textContent = '✗';
      } else {
        statusIndicator.textContent = '⟳';
      }
    }
    
    if (statusText) {
      statusText.textContent = message;
    }
  }

  parseArgs(args) {
    // Configure optimal terminal options
    const options = {
      author: 'felipemacedo1',
      period: 'rolling',  // always rolling (365 days)
      size: 'compact',    // compact size for terminal
      theme: 'terminal',  // terminal theme for terminal context
      mode: 'terminal',   // terminal mode
      showStats: true,    // show stats in terminal
      showControls: false, // no controls in terminal
      showTooltips: false, // no tooltips in terminal (problematic in terminal context)
      showLegend: true     // show legend
    };

    // Allow author change if specified
    args.forEach(arg => {
      if (arg.startsWith('--author=')) {
        options.author = arg.split('=')[1];
      }
    });

    return options;
  }

  cleanup() {
    if (this.currentWidget) {
      try {
        if (typeof this.currentWidget.destroy === 'function') {
          this.currentWidget.destroy();
        }
      } catch (error) {
        console.warn('Error cleaning up widget:', error);
      }
    }
    
    this.currentWidget = null;
    this.currentWidgetId = null;
  }
}

export default ContributionCommands;
