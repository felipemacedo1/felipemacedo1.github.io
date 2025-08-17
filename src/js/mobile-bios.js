// Mobile BIOS Interface
import { EnhancedTouchNavigation } from './features/EnhancedTouchNavigation.js';
import { PerformanceOptimizer } from './utils/PerformanceOptimizer.js';

class MobileBIOS {
  constructor() {
    this.currentView = 'boot';
    this.bootProgress = 0;
    this.isBooted = false;
    this.isDetailViewOpen = false;
    this.touchNavigation = null;
    this.performanceOptimizer = new PerformanceOptimizer();
    this.startTime = Date.now();
    
    this.init();
  }

  init() {
    this.startBootSequence();
    this.setupEventListeners();
    this.updateClock();
    this.updateBattery();
    this.addHapticFeedback();
    this.addLoadingStates();
    
    // Clear existing intervals to prevent leaks
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.batteryInterval) clearInterval(this.batteryInterval);
    
    // Update clock every second
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    
    // Update battery every 30 seconds
    this.batteryInterval = setInterval(() => this.updateBattery(), 30000);
  }

  startBootSequence() {
    const bootMessages = [
      'Initializing system...',
      'Loading drivers...',
      'Checking hardware...',
      'Starting services...',
      'Loading interface...',
      'System ready!'
    ];

    let messageIndex = 0;
    const statusElement = document.getElementById('bootStatus');
    const progressElement = document.getElementById('progressFill');

    const bootInterval = setInterval(() => {
      this.bootProgress += Math.random() * 20 + 10;
      
      if (this.bootProgress >= 100) {
        this.bootProgress = 100;
        clearInterval(bootInterval);
        
        setTimeout(() => {
          this.showMainInterface();
        }, 1000);
      }

      progressElement.style.width = `${this.bootProgress}%`;
      
      if (messageIndex < bootMessages.length) {
        statusElement.textContent = bootMessages[messageIndex];
        messageIndex++;
      }
    }, 800);
  }

  showMainInterface() {
    const bootScreen = this.performanceOptimizer.cacheElement('#bootScreen');
    const biosInterface = this.performanceOptimizer.cacheElement('#biosInterface');

    if (!bootScreen || !biosInterface) return;

    bootScreen.style.opacity = '0';
    bootScreen.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      bootScreen.style.display = 'none';
      biosInterface.style.display = 'flex';
      biosInterface.style.opacity = '0';
      
      setTimeout(() => {
        biosInterface.style.opacity = '1';
        biosInterface.style.transition = 'opacity 0.5s ease';
        this.isBooted = true;
        
        // Initialize touch navigation after interface is shown
        this.initializeTouchNavigation();
      }, 100);
    }, 500);
  }

  setupEventListeners() {
    // Menu item clicks
    document.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.menu-item');
      const navItem = e.target.closest('.nav-item');
      const backBtn = e.target.closest('.back-btn');

      if (menuItem) {
        this.handleMenuClick(menuItem.dataset.action);
      } else if (navItem) {
        this.handleNavClick(navItem.dataset.action);
      } else if (backBtn) {
        this.hideDetailView();
      }
    });

    // Handle Android back button
    this.setupAndroidBackButton();

    // Allow scroll in scrollable containers
    this.setupScrollableContainers();
  }

  handleMenuClick(action) {
    if (!this.isBooted) return;

    // Add click animation
    const menuItem = document.querySelector(`[data-action="${action}"]`);
    menuItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
      menuItem.style.transform = '';
    }, 150);

    // Show detail view
    setTimeout(() => {
      this.showDetailView(action);
    }, 150);
  }

  handleNavClick(action) {
    if (!this.isBooted) return;

    switch (action) {
      case 'home':
        this.hideDetailView();
        break;
      case 'settings':
        this.showDetailView('settings');
        break;
      case 'desktop':
      case 'desktop-link':
        this.showDesktopConfirmModal();
        break;
    }
  }

  showDesktopConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'desktop-confirm-modal';
    modal.innerHTML = `
      <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="modal-content" style="background: linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%); border-radius: 12px; padding: 24px; max-width: 320px; width: 100%; border: 1px solid #03DAC6; box-shadow: 0 8px 32px rgba(3, 218, 198, 0.3);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
            <h3 style="color: #03DAC6; margin-bottom: 8px; font-size: 18px;">Versão Desktop</h3>
            <p style="color: #c9d1d9; font-size: 14px; line-height: 1.5;">
              A versão desktop ainda não foi otimizada para smartphones. É recomendada apenas para tablets e dispositivos maiores.
            </p>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button class="modal-cancel" style="flex: 1; background: #424242; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s;">
              Ficar no Mobile
            </button>
            <button class="modal-confirm" style="flex: 1; background: linear-gradient(135deg, #03DAC6, #018786); color: black; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
              Prosseguir
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.modal-cancel').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.modal-confirm').addEventListener('click', () => {
      window.location.href = './index.html?desktop=true';
    });

    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        modal.remove();
      }
    });

    // Add animation
    requestAnimationFrame(() => {
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
      });
    });
  }

  showDetailView(action) {
    const detailView = document.getElementById('detailView');
    const detailTitle = document.getElementById('detailTitle');
    const detailContent = document.getElementById('detailContent');

    detailTitle.textContent = this.getActionTitle(action);
    // Use safe DOM manipulation instead of innerHTML
    const content = this.getActionContent(action);
    this.safeSetContent(detailContent, content);

    detailView.style.display = 'flex';
    detailView.classList.add('slide-in');
    this.isDetailViewOpen = true;

    // Push state for back button handling
    history.pushState({ page: 'detail', action: action }, '', window.location.href);

    // Initialize contribution widget for projects and github views
    if (action === 'github') {
      setTimeout(() => {
        this.initContributionWidget();
        this.animateCounters();
        this.addGitHubStyles();
        this.setupPeriodSelector();
        this.setupScrollableContainers(); // Re-setup for new content
      }, 300);
    }

    // Re-setup scrollable containers for new content
    setTimeout(() => {
      this.setupScrollableContainers();
      this.optimizeGitHubScroll();
      this.addPullToRefresh();
      this.addScrollIndicators();
      detailView.classList.remove('slide-in');
    }, 300);
  }

  hideDetailView() {
    if (!this.isDetailViewOpen) return;
    
    const detailView = document.getElementById('detailView');
    
    detailView.classList.add('slide-out');
    this.isDetailViewOpen = false;
    
    setTimeout(() => {
      detailView.style.display = 'none';
      detailView.classList.remove('slide-out');
    }, 300);
  }

  setupAndroidBackButton() {
    // Store reference to remove later if needed
    this.popstateHandler = (e) => {
      e.preventDefault();
      if (this.isDetailViewOpen) {
        this.hideDetailView();
        // Push a new state to prevent actual navigation
        history.pushState({ page: 'main' }, '', window.location.href);
      }
    };
    
    // Handle browser back button (Android back gesture)
    window.addEventListener('popstate', this.popstateHandler);

    // Push initial state
    history.pushState({ page: 'main' }, '', window.location.href);
  }

  cleanup() {
    // Remove event listeners to prevent memory leaks
    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
      this.popstateHandler = null;
    }
    
    // Clear intervals
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    if (this.batteryInterval) {
      clearInterval(this.batteryInterval);
      this.batteryInterval = null;
    }
    
    // Cleanup touch navigation
    if (this.touchNavigation) {
      this.touchNavigation.cleanup();
      this.touchNavigation = null;
    }
    
    // Cleanup performance optimizer
    if (this.performanceOptimizer) {
      this.performanceOptimizer.cleanup();
    }
    
    // Clear widget references
    if (this.currentWidget) {
      this.currentWidget = null;
    }
    
    // Remove any remaining tooltips and modals
    const tooltips = document.querySelectorAll('.contribution-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
    
    const modals = document.querySelectorAll('.desktop-confirm-modal');
    modals.forEach(modal => modal.remove());
  }

  setupScrollableContainers() {
    // Ensure all scrollable containers have proper touch behavior
    const scrollableElements = document.querySelectorAll('.bios-menu, .detail-content, .github-content-scroll, .scrollable');
    
    scrollableElements.forEach(element => {
      // Ensure native scrolling is enabled
      element.style.webkitOverflowScrolling = 'touch';
      element.style.overscrollBehaviorY = 'contain';
      element.style.scrollBehavior = 'smooth';
      element.style.touchAction = 'pan-y';
      
      // Remove any existing touch handlers that might interfere
      element.style.pointerEvents = 'auto';
    });
    
    // Setup scroll indicators through touch navigation
    if (this.touchNavigation) {
      this.touchNavigation.setupScrollIndicators();
    }
  }

  sanitizeInput(input) {
    // Basic XSS prevention
    return input.replace(/[<>"'&]/g, function(match) {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
  }

  sanitizeHTML(html) {
    // Create a temporary div to parse HTML safely
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous elements
    const dangerousElements = temp.querySelectorAll('script, iframe, object, embed, form, input, textarea, select, button[onclick], a[href^="javascript:"], a[href^="data:"], a[href^="vbscript:"]');
    dangerousElements.forEach(el => el.remove());
    
    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on') || 
            attr.name === 'javascript:' || 
            attr.name === 'data:' || 
            attr.name === 'vbscript:' ||
            attr.name === 'srcdoc' ||
            attr.name === 'formaction') {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  }

  // Safely set content into a container, sanitizing strings and DOM nodes
  safeSetContent(container, content) {
    if (!container) return;
    try {
      if (typeof content === 'string') {
        container.innerHTML = this.sanitizeHTML(content);
      } else if (content instanceof Element) {
        const temp = document.createElement('div');
        temp.appendChild(content.cloneNode(true));
        container.innerHTML = this.sanitizeHTML(temp.innerHTML);
      } else if (content instanceof DocumentFragment) {
        const temp = document.createElement('div');
        temp.appendChild(content.cloneNode(true));
        container.innerHTML = this.sanitizeHTML(temp.innerHTML);
      } else if (content != null) {
        container.textContent = String(content);
      } else {
        container.textContent = '';
      }
    } catch (e) {
      console.warn('safeSetContent error:', e);
      container.textContent = '';
    }
  }

  sanitizeLogInput(input) {
    // Prevent log injection by removing control characters and newlines
    if (typeof input !== 'string') return String(input);
    return input.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '');
  }

  getActionTitle(action) {
    const titles = {
      about: ' About Me',
      status: '📊 System Status',
      whoami: '🆔 Identity',
      skills: '🛠️ Technical Skills',
      experience: '💼 Experience',
      certifications: '🏆 Certifications',
      projects: '📁 Projects',
      github: '💻 GitHub',
      contact: '📧 Contact Information',
      linkedin: '💼 LinkedIn Profile',
      settings: '⚙️ System Settings'
    };
    return titles[action] || 'Information';
  }

  getActionContent(action) {
    // Load version dynamically for status menu
    if (action === 'status') {
      // Update version after content is rendered
      setTimeout(async () => {
        const versionElement = document.getElementById('project-version');
        if (versionElement) {
          try {
            const version = await this.getProjectVersion();
            versionElement.textContent = version;
            versionElement.style.color = '#c9d1d9'; // Change to normal color when loaded
          } catch (error) {
            versionElement.textContent = 'v2025.1.0';
            versionElement.style.color = '#c9d1d9';
          }
        }
      }, 100);
    }

    switch (action) {
      case 'about':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif; line-height: 1.6;">
            <h3 style="color: #03DAC6; margin-bottom: 16px;">Felipe Macedo</h3>
            <p style="margin-bottom: 16px;">
              Desenvolvedor Full Stack com especialização em Java, Go e arquitetura de microserviços. 
              Apaixonado por tecnologia e sempre buscando soluções inovadoras para problemas complexos.
            </p>
            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; border-left: 4px solid #03DAC6;">
              <h4 style="color: #BB86FC; margin-bottom: 8px;">Especialidades:</h4>
              <ul style="margin-left: 16px;">
                <li>Backend Development (Java, Go)</li>
                <li>Spring Boot & Microservices</li>
                <li>Database Design (PostgreSQL, Redis)</li>
                <li>API REST & GraphQL</li>
                <li>DevOps & Cloud Architecture</li>
              </ul>
            </div>
          </div>
        `;

      case 'status':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif; line-height: 1.5;">
            <!-- Header Status -->
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 16px; border-radius: 12px; margin-bottom: 16px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
              <div style="color: white; font-size: 18px; font-weight: 600; margin-bottom: 4px;">🟢 SYSTEM ONLINE</div>
              <div style="color: rgba(255,255,255,0.9); font-size: 12px;">All systems operational • Last checked: ${new Date().toLocaleTimeString()}</div>
            </div>

            <!-- Quick Stats Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #30363d;">
                <div style="color: #03DAC6; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${this.getStatusUptime()}</div>
                <div style="color: #c9d1d9; font-size: 10px;">Uptime</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #30363d;">
                <div style="color: #1f6feb; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${this.getActiveProjects()}</div>
                <div style="color: #c9d1d9; font-size: 10px;">Active Projects</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #30363d;">
                <div style="color: #238636; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${this.getCommitsThisWeek()}</div>
                <div style="color: #c9d1d9; font-size: 10px;">Commits This Week</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #30363d;">
                <div style="color: #f85149; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${this.getCurrentStreak()}</div>
                <div style="color: #c9d1d9; font-size: 10px;">Current Streak</div>
              </div>
            </div>

            <!-- System Information -->
            <div style="background: #1E1E1E; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h4 style="color: #f0f6fc; margin-bottom: 12px; font-size: 14px;">💻 System Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <div style="color: #7d8590;">Location:</div><div style="color: #c9d1d9;">São Paulo, Brazil</div>
                <div style="color: #7d8590;">Timezone:</div><div style="color: #c9d1d9;">UTC-3 (BRT)</div>
                <div style="color: #7d8590;">Environment:</div><div style="color: #c9d1d9;">Production</div>
                <div style="color: #7d8590;">Version:</div><div style="color: #7d8590;" id="project-version">🔄 Loading...</div>
                <div style="color: #7d8590;">Last Deploy:</div><div style="color: #c9d1d9;">${this.getLastDeploy()}</div>
                <div style="color: #7d8590;">Build:</div><div style="color: #c9d1d9;">${this.getBuildNumber()}</div>
              </div>
            </div>

            <!-- Current Status -->
            <div style="background: #1E1E1E; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h4 style="color: #f0f6fc; margin-bottom: 12px; font-size: 14px;">📊 Current Status</h4>
              
              <!-- Availability -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #c9d1d9; font-size: 11px;">Availability for Projects</span>
                  <span style="color: #4CAF50; font-size: 11px; font-weight: 600;">Available</span>
                </div>
                <div style="background: #21262d; border-radius: 4px; overflow: hidden; height: 6px;">
                  <div style="background: linear-gradient(90deg, #4CAF50, #2E7D32); width: 85%; height: 100%; transition: width 0.3s;"></div>
                </div>
                <div style="color: #7d8590; font-size: 10px; margin-top: 2px;">Weekend freelances and side projects</div>
              </div>

              <!-- Workload -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #c9d1d9; font-size: 11px;">Current Workload</span>
                  <span style="color: #FF9800; font-size: 11px; font-weight: 600;">Moderate</span>
                </div>
                <div style="background: #21262d; border-radius: 4px; overflow: hidden; height: 6px;">
                  <div style="background: linear-gradient(90deg, #FF9800, #F57C00); width: 70%; height: 100%; transition: width 0.3s;"></div>
                </div>
                <div style="color: #7d8590; font-size: 10px; margin-top: 2px;">Full-time job + personal projects</div>
              </div>

              <!-- Learning -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #c9d1d9; font-size: 11px;">Learning Progress</span>
                  <span style="color: #1f6feb; font-size: 11px; font-weight: 600;">Active</span>
                </div>
                <div style="background: #21262d; border-radius: 4px; overflow: hidden; height: 6px;">
                  <div style="background: linear-gradient(90deg, #1f6feb, #0969da); width: 90%; height: 100%; transition: width 0.3s;"></div>
                </div>
                <div style="color: #7d8590; font-size: 10px; margin-top: 2px;">Currently studying AWS Architecture</div>
              </div>
            </div>

            <!-- Active Projects -->
            <div style="background: #1E1E1E; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h4 style="color: #f0f6fc; margin-bottom: 12px; font-size: 14px;">🚀 Active Projects</h4>
              
              <div style="margin-bottom: 8px; padding: 8px; background: #0d1117; border-radius: 6px; border-left: 3px solid #4CAF50;">
                <div style="color: #4CAF50; font-size: 11px; font-weight: 600;">Terminal Portfolio</div>
                <div style="color: #7d8590; font-size: 10px;">Interactive terminal-style portfolio website</div>
                <div style="color: #c9d1d9; font-size: 10px; margin-top: 2px;">Status: <span style="color: #4CAF50;">Active Development</span></div>
              </div>
              
              <div style="margin-bottom: 8px; padding: 8px; background: #0d1117; border-radius: 6px; border-left: 3px solid #1f6feb;">
                <div style="color: #1f6feb; font-size: 11px; font-weight: 600;">Microservices Architecture</div>
                <div style="color: #7d8590; font-size: 10px;">Enterprise-level microservices design</div>
                <div style="color: #c9d1d9; font-size: 10px; margin-top: 2px;">Status: <span style="color: #1f6feb;">Planning Phase</span></div>
              </div>
              
              <div style="margin-bottom: 8px; padding: 8px; background: #0d1117; border-radius: 6px; border-left: 3px solid #f85149;">
                <div style="color: #f85149; font-size: 11px; font-weight: 600;">AWS Certification Study</div>
                <div style="color: #7d8590; font-size: 10px;">Solutions Architect Associate preparation</div>
                <div style="color: #c9d1d9; font-size: 10px; margin-top: 2px;">Status: <span style="color: #f85149;">In Progress</span></div>
              </div>
            </div>

            <!-- Contact Availability -->
            <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); border: 1px solid #30363d; border-radius: 8px; padding: 16px;">
              <h4 style="color: #f0f6fc; margin-bottom: 12px; font-size: 14px;">📱 Contact & Availability</h4>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="text-align: center;">
                  <div style="color: #4CAF50; font-size: 24px; margin-bottom: 4px;">🟢</div>
                  <div style="color: #c9d1d9; font-size: 11px; font-weight: 600;">Quick Response</div>
                  <div style="color: #7d8590; font-size: 10px;">Usually within 2-4 hours</div>
                </div>
                
                <div style="text-align: center;">
                  <div style="color: #1f6feb; font-size: 24px; margin-bottom: 4px;">💼</div>
                  <div style="color: #c9d1d9; font-size: 11px; font-weight: 600;">Open to Freelance</div>
                  <div style="color: #7d8590; font-size: 10px;">Weekend projects welcome</div>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #30363d;">
                <div style="color: #7d8590; font-size: 10px;">
                  Best times to reach: Weekdays 9-18h (UTC-3) | Weekends flexible
                </div>
              </div>
            </div>
          </div>
        `;

      case 'whoami':
        return `
          <div class="scrollable" style="font-family: 'Roboto Mono', monospace; font-size: 14px;">
            <div style="background: #000; color: #00ff00; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
              <div>felipe-macedo@portfolio:~$ whoami</div>
              <div>Felipe Macedo</div>
              <div></div>
              <div>felipe-macedo@portfolio:~$ id</div>
              <div>uid=1000(felipe-macedo) gid=1000(developer)</div>
              <div>groups=1000(developer),27(sudo),999(docker)</div>
              <div></div>
              <div>felipe-macedo@portfolio:~$ uname -a</div>
              <div>Developer 5.15.0-felipe #1 SMP Full-Stack Developer</div>
            </div>
            
            <div style="color: #03DAC6;">
              <h4>Identity Matrix:</h4>
              <div style="font-size: 12px; margin-top: 8px;">
                Name: Felipe Macedo<br>
                Role: Full Stack Developer<br>
                Specialization: Backend Architecture<br>
                Primary Languages: Java, Go<br>
                Location: Brazil<br>
                Experience: 3+ years<br>
                Status: Employed + Weekend freelances
              </div>
            </div>
          </div>
        `;

      case 'skills':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif;">
            <div style="margin-bottom: 20px;">
              <h4 style="color: #03DAC6; margin-bottom: 12px;">🚀 Backend Technologies</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${this.createSkillBadges(['Java', 'Go', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis'])}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h4 style="color: #BB86FC; margin-bottom: 12px;">🌐 Frontend & Web</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${this.createSkillBadges(['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'React'])}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h4 style="color: #FF9800; margin-bottom: 12px;">🛠️ DevOps & Tools</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${this.createSkillBadges(['Docker', 'AWS', 'Git', 'Linux'])}
              </div>
            </div>
          </div>
        `;

      case 'projects':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif;">
            <div style="margin-bottom: 16px; padding: 16px; background: #1E1E1E; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <h4 style="color: #4CAF50; margin-bottom: 8px;">🌟 Featured Projects</h4>
              <div style="font-size: 12px; color: #ccc;">
                Explore my latest work and contributions
              </div>
            </div>
            
            <div id="mobile-contrib-widget" style="margin-bottom: 16px;"></div>
            
            ${this.createProjectCards([
              {
                name: 'Terminal Portfolio',
                tech: 'JavaScript, CSS3, HTML5',
                desc: 'Interactive terminal-style portfolio website',
                status: 'Live'
              },
              {
                name: 'PriceFeed API',
                tech: 'Go, PostgreSQL, Redis',
                desc: 'Cryptocurrency price monitoring API',
                status: 'Active development'
              },
              {
                name: 'GPT Service Go',
                tech: 'Go, OpenAI API, Docker',
                desc: 'Microservice integrating with OpenAI GPT',
                status: 'Active development'
              },
              {
                name: 'Spring MCD Wallet',
                tech: 'Java, Spring Framework, bitcoinj',
                desc: 'Modular Bitcoin wallet with SPV',
                status: 'In progress'
              }
            ])}
          </div>
        `;

      case 'github':
        return `
          <div class="github-section scrollable" style="font-family: 'Roboto', sans-serif; background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); border-radius: 12px; overflow-y: auto; -webkit-overflow-scrolling: touch; height: 100%;">
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #238636 0%, #2ea043 100%); padding: 20px; text-align: center; position: relative; overflow: hidden; flex-shrink: 0; position: sticky; top: 0; z-index: 10;">
              <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
              <div style="color: white; font-size: 18px; font-weight: 600; margin-bottom: 4px;">🚀 GitHub Dashboard</div>
              <div style="color: rgba(255,255,255,0.8); font-size: 12px;">@felipemacedo1 • Computer Science Student & Full-Cycle Developer</div>
              <div style="margin-top: 12px; display: flex; justify-content: center; gap: 16px; font-size: 11px; color: rgba(255,255,255,0.9);">
                <div>📍 Brazil</div>
                <div>⭐ 50+ stars</div>
                <div>🔥 Active</div>
              </div>
              
              <!-- Period Selector -->
              <div style="margin-top: 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                <button class="period-btn" data-period="rolling" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                  📅 Últimos 365 dias
                </button>
                <button class="period-btn" data-period="2025" style="background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                  2025
                </button>
                <button class="period-btn" data-period="2024" style="background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                  2024
                </button>
                <button class="period-btn" data-period="2023" style="background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                  2023
                </button>
                <button class="period-btn" data-period="2022" style="background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 16px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 500;">
                  2022
                </button>
              </div>
            </div>

            <!-- Enhanced Stats Cards -->
            <div style="padding: 16px; background: #0d1117;">
              <div class="github-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: radial-gradient(circle, #238636, transparent); opacity: 0.3; border-radius: 50%;"></div>
                  <div style="color: #7c3aed; font-size: 24px; font-weight: 700; margin-bottom: 4px;" id="commits-count">1,247</div>
                  <div style="color: #f0f6fc; font-size: 11px; margin-bottom: 2px;">Total Commits</div>
                  <div style="color: #238636; font-size: 10px;">↗ +23% este mês</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: radial-gradient(circle, #1f6feb, transparent); opacity: 0.3; border-radius: 50%;"></div>
                  <div style="color: #1f6feb; font-size: 24px; font-weight: 700; margin-bottom: 4px;" id="repos-count">32</div>
                  <div style="color: #f0f6fc; font-size: 11px; margin-bottom: 2px;">Repositories</div>
                  <div style="color: #238636; font-size: 10px;">↗ +2 novos</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: radial-gradient(circle, #f85149, transparent); opacity: 0.3; border-radius: 50%;"></div>
                  <div style="color: #f85149; font-size: 24px; font-weight: 700; margin-bottom: 4px;" id="streak-count">12</div>
                  <div style="color: #f0f6fc; font-size: 11px; margin-bottom: 2px;">Current Streak</div>
                  <div style="color: #f85149; font-size: 10px;">🔥 dias consecutivos</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: radial-gradient(circle, #a5a5a5, transparent); opacity: 0.3; border-radius: 50%;"></div>
                  <div style="color: #a5a5a5; font-size: 24px; font-weight: 700; margin-bottom: 4px;" id="languages-count">8</div>
                  <div style="color: #f0f6fc; font-size: 11px; margin-bottom: 2px;">Languages</div>
                  <div style="color: #a5a5a5; font-size: 10px;">JavaScript, Go, Java...</div>
                </div>
              </div>

              <!-- Enhanced Contribution Graph -->
              <div class="github-contrib-container" style="background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <div style="color: #c9d1d9; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    📊 Contribution Activity
                    <span style="background: #238636; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 500;">
                      LIVE
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span id="current-period-info" style="color: #c9d1d9; font-size: 12px;">Últimos 365 dias</span>
                    <button onclick="document.getElementById('mobile-contrib-widget').classList.toggle('expanded')" 
                            style="background: #238636; border: none; color: white; padding: 6px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; transition: all 0.2s; touch-action: manipulation;">
                      📈
                    </button>
                  </div>
                </div>
                
                <div id="mobile-contrib-widget" style="margin-bottom: 12px; min-height: 140px; background: #010409; border: 1px solid #0d1117; border-radius: 6px; padding: 12px; overflow: hidden; position: relative;">
                  <div class="loading-state" style="display: flex; align-items: center; justify-content: center; height: 100px; color: #7d8590; font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; border: 2px solid #238636; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      Loading contributions...
                    </div>
                  </div>
                  <div class="expanded-stats" style="display: none; background: #161b22; border: 1px solid #21262d; border-radius: 6px; padding: 12px; margin-top: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                      <div style="text-align: center; padding: 8px; background: #0d1117; border-radius: 4px;">
                        <div style="color: #39d353; font-size: 18px; font-weight: 700;" id="current-streak-mobile">0</div>
                        <div style="color: #7d8590; font-size: 9px;">Current Streak</div>
                      </div>
                      <div style="text-align: center; padding: 8px; background: #0d1117; border-radius: 4px;">
                        <div style="color: #1f6feb; font-size: 18px; font-weight: 700;" id="longest-streak-mobile">0</div>
                        <div style="color: #7d8590; font-size: 9px;">Best Streak</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #7d8590;">
                  <div>
                    <span id="period-info">Last 365 days</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    Less <span style="color: #0e4429; width: 8px; height: 8px; display: inline-block; background: currentColor; border-radius: 1px;"></span>
                    <span style="color: #006d32; width: 8px; height: 8px; display: inline-block; background: currentColor; border-radius: 1px;"></span>
                    <span style="color: #26a641; width: 8px; height: 8px; display: inline-block; background: currentColor; border-radius: 1px;"></span>
                    <span style="color: #39d353; width: 8px; height: 8px; display: inline-block; background: currentColor; border-radius: 1px;"></span>
                    More
                  </div>
                </div>
                
                <!-- Real-time stats from analytics -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #21262d;">
                  <div style="text-align: center;">
                    <div style="color: #39d353; font-size: 16px; font-weight: 700;" id="total-commits-real">...</div>
                    <div style="color: #7d8590; font-size: 9px;">Total Commits</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="color: #1f6feb; font-size: 16px; font-weight: 700;" id="active-days-real">...</div>
                    <div style="color: #7d8590; font-size: 9px;">Active Days</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="color: #f85149; font-size: 16px; font-weight: 700;" id="best-day-real">...</div>
                    <div style="color: #7d8590; font-size: 9px;">Best Day</div>
                  </div>
                </div>
                
                <style>
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  #mobile-contrib-widget.expanded .expanded-stats {
                    display: block !important;
                  }
                  #mobile-contrib-widget:hover {
                    background: #0a0f14;
                    border-color: #238636;
                    transition: all 0.3s ease;
                  }
                </style>
              </div>

              <!-- Language Stats -->
              <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="color: #f0f6fc; font-size: 14px; font-weight: 600; margin-bottom: 12px;">💻 Top Languages</div>
                <div style="space-y: 8px;">
                  <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background: #f1e05a; border-radius: 50%;"></div>
                      <span style="color: #f0f6fc; font-size: 12px;">JavaScript</span>
                    </div>
                    <span style="color: #7d8590; font-size: 11px;">42.3%</span>
                  </div>
                  <div style="background: #21262d; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
                    <div style="background: #f1e05a; height: 100%; width: 42.3%; border-radius: 3px;"></div>
                  </div>
                  
                  <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background: #00add8; border-radius: 50%;"></div>
                      <span style="color: #f0f6fc; font-size: 12px;">Go</span>
                    </div>
                    <span style="color: #7d8590; font-size: 11px;">28.7%</span>
                  </div>
                  <div style="background: #21262d; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
                    <div style="background: #00add8; height: 100%; width: 28.7%; border-radius: 3px;"></div>
                  </div>
                  
                  <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background: #b07219; border-radius: 50%;"></div>
                      <span style="color: #f0f6fc; font-size: 12px;">Java</span>
                    </div>
                    <span style="color: #7d8590; font-size: 11px;">18.2%</span>
                  </div>
                  <div style="background: #21262d; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                    <div style="background: #b07219; height: 100%; width: 18.2%; border-radius: 3px;"></div>
                  </div>
                  
                  <div style="color: #7d8590; font-size: 11px; text-align: center; margin-top: 8px;">
                    +5 outras linguagens • CSS, Python, Shell, TypeScript...
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="color: #f0f6fc; font-size: 14px; font-weight: 600; margin-bottom: 12px;">🔗 Quick Actions</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <a href="https://github.com/felipemacedo1" target="_blank" rel="noopener noreferrer"
                     style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); color: #f0f6fc; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; font-size: 11px; border: 1px solid #30363d; transition: all 0.2s;"
                     onmouseover="this.style.background='linear-gradient(135deg, #30363d 0%, #40464d 100%)'; this.style.borderColor='#238636'"
                     onmouseout="this.style.background='linear-gradient(135deg, #21262d 0%, #30363d 100%)'; this.style.borderColor='#30363d'">
                    👤 View Profile
                  </a>
                  <a href="https://github.com/felipemacedo1?tab=repositories" target="_blank" rel="noopener noreferrer"
                     style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); color: #f0f6fc; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; font-size: 11px; border: 1px solid #30363d; transition: all 0.2s;"
                     onmouseover="this.style.background='linear-gradient(135deg, #30363d 0%, #40464d 100%)'; this.style.borderColor='#1f6feb'"
                     onmouseout="this.style.background='linear-gradient(135deg, #21262d 0%, #30363d 100%)'; this.style.borderColor='#30363d'">
                    📚 Repositories
                  </a>
                  <a href="https://github.com/orgs/growthfolio" target="_blank" rel="noopener noreferrer"
                     style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); color: #f0f6fc; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; font-size: 11px; border: 1px solid #30363d; transition: all 0.2s;"
                     onmouseover="this.style.background='linear-gradient(135deg, #30363d 0%, #40464d 100%)'; this.style.borderColor='#7c3aed'"
                     onmouseout="this.style.background='linear-gradient(135deg, #21262d 0%, #30363d 100%)'; this.style.borderColor='#30363d'">
                    🏢 Organization
                  </a>
                  <a href="https://github.com/felipemacedo1?tab=stars" target="_blank" rel="noopener noreferrer"
                     style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); color: #f0f6fc; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; font-size: 11px; border: 1px solid #30363d; transition: all 0.2s;"
                     onmouseover="this.style.background='linear-gradient(135deg, #30363d 0%, #40464d 100%)'; this.style.borderColor='#f85149'"
                     onmouseout="this.style.background='linear-gradient(135deg, #21262d 0%, #30363d 100%)'; this.style.borderColor='#30363d'">
                    ⭐ Starred Repos
                  </a>
                </div>
              </div>

              <!-- Featured Repositories -->
              <div class="github-repos-list" style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="color: #f0f6fc; font-size: 14px; font-weight: 600; margin-bottom: 12px;">🌟 Featured Projects</div>
                <div style="space-y: 12px;">
                  <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); padding: 14px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(3, 218, 198, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                      <div style="color: #03DAC6; font-weight: 600; font-size: 13px;">📱 felipemacedo1.github.io</div>
                      <div style="color: #7d8590; font-size: 10px;">⭐ 12</div>
                    </div>
                    <div style="font-size: 11px; color: #c9d1d9; margin-bottom: 8px; line-height: 1.4;">Portfolio terminal interativo com detecção de dispositivo e interface BIOS mobile</div>
                    <div style="display: flex; justify-content: between; align-items: center;">
                      <div style="font-size: 10px; color: #f1e05a;">● JavaScript</div>
                      <div style="color: #7d8590; font-size: 10px;">Updated 2h ago</div>
                    </div>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); padding: 14px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                      <div style="color: #4CAF50; font-weight: 600; font-size: 13px;">🚀 go-pricefeed</div>
                      <div style="color: #7d8590; font-size: 10px;">⭐ 8</div>
                    </div>
                    <div style="font-size: 11px; color: #c9d1d9; margin-bottom: 8px; line-height: 1.4;">API de monitoramento de preços de criptomoedas com Redis e PostgreSQL</div>
                    <div style="display: flex; justify-content: between; align-items: center;">
                      <div style="font-size: 10px; color: #00add8;">● Go</div>
                      <div style="color: #7d8590; font-size: 10px;">Updated 1d ago</div>
                    </div>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); padding: 14px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #30363d; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                      <div style="color: #FF9800; font-weight: 600; font-size: 13px;">💰 spring-mcd-wallet</div>
                      <div style="color: #7d8590; font-size: 10px;">⭐ 5</div>
                    </div>
                    <div style="font-size: 11px; color: #c9d1d9; margin-bottom: 8px; line-height: 1.4;">Wallet Bitcoin modular com SPV e Spring Framework</div>
                    <div style="display: flex; justify-content: between; align-items: center;">
                      <div style="font-size: 10px; color: #b07219;">● Java</div>
                      <div style="color: #7d8590; font-size: 10px;">Updated 3d ago</div>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 12px;">
                  <a href="https://github.com/felipemacedo1?tab=repositories" target="_blank" rel="noopener noreferrer"
                     style="color: #1f6feb; text-decoration: none; font-size: 11px; font-weight: 500;">
                    Ver todos os 32 repositórios →
                  </a>
                </div>
              </div>

              <!-- Recent Activity -->
              <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px;">
                <div style="color: #f0f6fc; font-size: 14px; font-weight: 600; margin-bottom: 12px;">⚡ Recent Activity</div>
                <div style="space-y: 8px;">
                  <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #21262d;">
                    <div style="width: 16px; height: 16px; background: #238636; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    </div>
                    <div style="flex: 1;">
                      <div style="color: #f0f6fc; font-size: 11px;">Pushed 3 commits to <span style="color: #1f6feb;">felipemacedo1.github.io</span></div>
                      <div style="color: #7d8590; font-size: 10px;">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #21262d;">
                    <div style="width: 16px; height: 16px; background: #1f6feb; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    </div>
                    <div style="flex: 1;">
                      <div style="color: #f0f6fc; font-size: 11px;">Created branch <span style="color: #238636;">feature/mobile-enhancement</span></div>
                      <div style="color: #7d8590; font-size: 10px;">1 day ago</div>
                    </div>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
                    <div style="width: 16px; height: 16px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    </div>
                    <div style="flex: 1;">
                      <div style="color: #f0f6fc; font-size: 11px;">Opened issue in <span style="color: #1f6feb;">go-pricefeed</span></div>
                      <div style="color: #7d8590; font-size: 10px;">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'contact':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif;">
            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h4 style="color: #03DAC6; margin-bottom: 16px;">📞 Get In Touch</h4>
              
              <div style="margin-bottom: 12px;">
                <div style="color: #BB86FC; font-size: 14px; margin-bottom: 4px;">📧 Email</div>
                <div style="font-size: 12px; font-family: monospace;">contato.dev.macedo@gmail.com</div>
              </div>
              
              <div style="margin-bottom: 12px;">
                <div style="color: #BB86FC; font-size: 14px; margin-bottom: 4px;">💼 LinkedIn</div>
                <div style="font-size: 12px; font-family: monospace;">linkedin.com/in/felipemacedo1</div>
              </div>
              
              <div style="margin-bottom: 12px;">
                <div style="color: #BB86FC; font-size: 14px; margin-bottom: 4px;">💻 GitHub</div>
                <div style="font-size: 12px; font-family: monospace;">github.com/felipemacedo1</div>
              </div>
              
              <div>
                <div style="color: #BB86FC; font-size: 14px; margin-bottom: 4px;">🌍 Location</div>
                <div style="font-size: 12px; font-family: monospace;">Brazil</div>
              </div>
            </div>
            
            <div style="background: #2196F3; color: white; padding: 12px; border-radius: 8px; text-align: center; font-size: 12px;">
              💡 Available for freelance projects and collaborations
            </div>
          </div>
        `;

      case 'settings':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif;">
            <div style="margin-bottom: 16px;">
              <h4 style="color: #03DAC6; margin-bottom: 12px;">⚙️ Interface Settings</h4>
              
              <div style="background: #1E1E1E; padding: 16px; border-radius: 8px;">
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span>Dark Mode</span>
                  <span style="color: #4CAF50;">ON</span>
                </div>
                
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span>Animations</span>
                  <span style="color: #4CAF50;">ENABLED</span>
                </div>
                
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span>Sound Effects</span>
                  <span style="color: #F44336;">DISABLED</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>Auto-Switch Desktop</span>
                  <span style="color: #4CAF50;">ENABLED</span>
                </div>
              </div>
            </div>
            
            <div style="background: #FF9800; color: black; padding: 12px; border-radius: 8px; font-size: 12px;">
              ⚠️ Some settings require restart to take effect
            </div>
          </div>
        `;

      case 'experience':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif; line-height: 1.6;">
            <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #03DAC6; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                💼 Experiência Profissional
              </h3>
              <p style="color: #7d8590; font-size: 12px;">Timeline de crescimento professional</p>
            </div>

            <!-- Timeline Item -->
            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #4CAF50;">
              <div style="color: #FF9800; font-size: 11px; font-weight: 600; margin-bottom: 4px;">Março 2025 - presente</div>
              <h4 style="color: #4CAF50; margin-bottom: 8px; font-size: 14px;">🏢 Analista de Sistemas - Sansuy S.A.</h4>
              <div style="color: #c9d1d9; font-size: 12px; margin-bottom: 12px;">
                • Manutenção e modernização de sistemas legados em Java e JavaFX<br>
                • Implementação de APIs REST com Spring Boot<br>
                • Uso de SQL Server, SVN, e padrões como Facade em ERP corporativo<br>
                • Desenvolvimento de soluções corporativas escaláveis
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${this.createSkillBadges(['Java', 'JavaFX', 'Spring Boot', 'SQL Server', 'SVN'])}
              </div>
            </div>

            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #1f6feb;">
              <div style="color: #FF9800; font-size: 11px; font-weight: 600; margin-bottom: 4px;">Fevereiro 2024 - Agosto 2024</div>
              <h4 style="color: #1f6feb; margin-bottom: 8px; font-size: 14px;">🚀 Backend Developer - Asapcard</h4>
              <div style="color: #c9d1d9; font-size: 12px; margin-bottom: 12px;">
                • Desenvolvimento de microserviços financeiros em Go<br>
                • Implementação de sistemas de pagamento e soluções financeiras<br>
                • APIs focadas em performance e segurança<br>
                • Trabalho com tecnologias de ponta no setor fintech
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${this.createSkillBadges(['Go', 'Microservices', 'APIs', 'Fintech', 'Security'])}
              </div>
            </div>

            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #BB86FC;">
              <div style="color: #FF9800; font-size: 11px; font-weight: 600; margin-bottom: 4px;">2023</div>
              <h4 style="color: #BB86FC; margin-bottom: 8px; font-size: 14px;">🎓 Trainee Developer / Alumni - Generation Brasil</h4>
              <div style="color: #c9d1d9; font-size: 12px; margin-bottom: 12px;">
                • Bootcamp intensivo de 3 meses em desenvolvimento Full Stack<br>
                • Projetos práticos com Java, Spring Boot, React<br>
                • Metodologias ágeis e trabalho em equipe<br>
                • Projeto final: E-commerce completo com microserviços
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${this.createSkillBadges(['Java', 'Spring Boot', 'React', 'Agile', 'Team Work'])}
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d;">
              <div style="color: #f85149; font-size: 12px; font-weight: 600, margin-bottom: 8px;">📈 Crescimento Contínuo</div>
              <div style="color: #7d8590; font-size: 11px;">
                3+ anos de experiência hands-on em desenvolvimento, sempre focado em aprender novas tecnologias e melhorar processos.
              </div>
            </div>
          </div>
        `;

      case 'certifications':
        return `
          <div class="scrollable" style="font-family: 'Roboto', sans-serif; line-height: 1.6;">
            <div style="background: linear-gradient(135deg, #21262d 0%, #30363d 100%); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #03DAC6; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                🏆 Certificações & Qualificações
              </h3>
              <p style="color: #7d8590; font-size: 12px;">Certificados oficiais e especializações</p>
            </div>

            <!-- Cloud & Infrastructure -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #1f6feb; margin-bottom: 12px; font-size: 13px;">☁️ Cloud & Infrastructure</h4>
              
              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1f6feb;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">🔵</span>
                  <span style="color: #1f6feb; font-weight: 600; font-size: 13px;">Microsoft Azure AZ-900</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Microsoft | 2023</div>
                <div style="color: #c9d1d9; font-size: 11px;">Azure Fundamentals - Cloud concepts, services, security</div>
              </div>

              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #FF9800;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">🌐</span>
                  <span style="color: #FF9800; font-weight: 600; font-size: 13px;">AWS re/Start Graduate</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Amazon Web Services | 2025</div>
                <div style="color: #c9d1d9; font-size: 11px;">Cloud fundamentals, Linux, Python scripting</div>
              </div>
            </div>

            <!-- Development -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #4CAF50; margin-bottom: 12px; font-size: 13px;">💻 Desenvolvimento</h4>
              
              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #4CAF50;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">☕</span>
                  <span style="color: #4CAF50; font-weight: 600; font-size: 13px;">Java Full Stack Developer</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Generation Brasil | 2023</div>
                <div style="color: #c9d1d9; font-size: 11px;">480h - Java, Spring Boot, React, metodologias ágeis</div>
              </div>

              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #BB86FC;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">💻</span>
                  <span style="color: #BB86FC; font-weight: 600; font-size: 13px;">Desenvolvedor Web Full Stack Junior</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Generation Brasil | 2024</div>
                <div style="color: #c9d1d9; font-size: 11px;">Spring Boot, React, TypeScript, Spring Security, APIs REST</div>
              </div>

              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #03DAC6;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">🌐</span>
                  <span style="color: #03DAC6; font-weight: 600; font-size: 13px;">Introdução à Programação - Front-End</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Proz + Meta + AWS | 2023</div>
                <div style="color: #c9d1d9; font-size: 11px;">300h - Git, HTML, CSS, JavaScript, desenvolvimento web</div>
              </div>
            </div>

            <!-- Blockchain & Web3 -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #f85149; margin-bottom: 12px; font-size: 13px;">🔗 Blockchain & Web3</h4>
              
              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f85149;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">⛓️</span>
                  <span style="color: #f85149; font-weight: 600; font-size: 13px;">Blockchain e Solidity</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">DIO | 2024</div>
                <div style="color: #c9d1d9; font-size: 11px;">Smart contracts, DeFi, Web3 development</div>
              </div>
            </div>

            <!-- Management -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #7c3aed; margin-bottom: 12px; font-size: 13px;">📊 Gerenciamento & Liderança</h4>
              
              <div style="background: #1E1E1E; padding: 14px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #7c3aed;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 16px;">📋</span>
                  <span style="color: #7c3aed; font-weight: 600; font-size: 13px;">Fundamentos do Gerenciamento de Projetos</span>
                </div>
                <div style="color: #FF9800; font-size: 11px; margin-bottom: 4px;">Google | 2024</div>
                <div style="color: #c9d1d9; font-size: 11px;">Planejamento, execução e monitoramento de projetos</div>
              </div>
            </div>

            <!-- In Progress -->
            <div style="background: linear-gradient(135deg, #0d1117 0%, #21262d 100%); padding: 16px; border-radius: 8px; border: 1px solid #30363d;">
              <div style="color: #FF9800; font-size: 12px; font-weight: 600, margin-bottom: 8px;">📈 Crescimento Contínuo</div>
              <div style="color: #7d8590; font-size: 11px;">
                • AWS Solutions Architect Associate (planejado para 2025)<br>
                • Oracle Java SE 17 Developer (em preparação)
              </div>
            </div>
          </div>
        `;

      default:
        return `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <h3 style="color: #03DAC6; margin-bottom: 8px;">Feature Coming Soon</h3>
            <p style="color: #666; font-size: 12px;">This feature is under development</p>
          </div>
        `;
    }
  }

  createSkillBadges(skills) {
    return skills.map(skill => 
      `<span style="background: #03DAC6; color: black; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 500;">${skill}</span>`
    ).join('');
  }

  createProjectCards(projects) {
    return projects.map(project => `
      <div style="background: #1E1E1E; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid #03DAC6;">
        <h5 style="color: #03DAC6; margin-bottom: 4px; font-size: 14px;">${project.name}</h5>
        <div style="color: #BB86FC; font-size: 10px; margin-bottom: 6px;">${project.tech}</div>
        <div style="font-size: 12px; color: #ccc; margin-bottom: 8px;">${project.desc}</div>
        <div style="font-size: 10px; color: #4CAF50;">Status: ${project.status}</div>
      </div>
    `).join('');
  }

  updateClock() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  updateBattery() {
    const batteryElement = document.getElementById('batteryLevel');
    if (batteryElement && 'getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const level = Math.round(battery.level * 100);
        batteryElement.textContent = `${level}%`;
      }).catch(() => {
        batteryElement.textContent = '100%';
      });
    }
  }

  getUptime() {
    const uptime = Date.now() - this.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  async initContributionWidget(period = 'rolling') {
    try {
      const UnifiedContributionWidget = (await import('./widgets/UnifiedContributionWidget.js')).default;
      const container = document.getElementById('mobile-contrib-widget');
      
      if (container) {
        // Show loading state
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) loadingState.style.display = 'flex';
        
        // Clear previous widget content but keep structure
        const existingWidget = container.querySelector('.modular-contribution-widget');
        if (existingWidget) {
          existingWidget.remove();
        }
        
        const widget = new UnifiedContributionWidget(container, {
          author: 'felipemacedo1',
          period: period,
          size: 'compact',
          theme: 'github',
          mode: 'mobile',
          showStats: false,
          showControls: false,
          showLegend: false,
          showTooltips: true
        });
        
        await widget.init();
        
        // Hide loading state
        if (loadingState) loadingState.style.display = 'none';
        
        // Update stats in expanded section and main stats
        this.updateContributionStats(widget);
        
        console.log('Mobile contribution widget initialized for period:', this.sanitizeLogInput(period));
        
        // Store widget reference for period changes
        this.currentWidget = widget;
      }
    } catch (error) {
      console.error('Error loading contribution widget:', error);
      // Show fallback message
      const container = document.getElementById('mobile-contrib-widget');
      if (container) {
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) {
          loadingState.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: #f85149;">
              ⚠️ Error loading contributions
            </div>
          `;
        }
      }
    }
  }

  updateContributionStats(widget) {
    try {
      if (!widget.modularWidget || !widget.modularWidget.data) return;

      const dailyMetrics = widget.modularWidget.data.daily_metrics || {};
      const dates = Object.keys(dailyMetrics).sort();
      const commits = Object.values(dailyMetrics);
      const totalCommits = commits.reduce((sum, count) => sum + count, 0);
      const activeDays = commits.filter(count => count > 0).length;

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Current streak (from most recent backwards)
      for (let i = dates.length - 1; i >= 0; i--) {
        if (dailyMetrics[dates[i]] > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Longest streak
      dates.forEach(date => {
        if (dailyMetrics[date] > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

      // Find best day
      const bestDay = dates.reduce((best, date) => {
        const commits = dailyMetrics[date];
        return commits > best.commits ? { commits, date } : best;
      }, { commits: 0, date: '' });

      // Update main stats
      const totalCommitsEl = document.getElementById('total-commits-real');
      const activeDaysEl = document.getElementById('active-days-real');
      const bestDayEl = document.getElementById('best-day-real');

      if (totalCommitsEl) totalCommitsEl.textContent = totalCommits.toLocaleString();
      if (activeDaysEl) activeDaysEl.textContent = activeDays;
      if (bestDayEl) bestDayEl.textContent = bestDay.commits;

      // Update expanded stats
      const currentStreakEl = document.getElementById('current-streak-mobile');
      const longestStreakEl = document.getElementById('longest-streak-mobile');

      if (currentStreakEl) currentStreakEl.textContent = currentStreak;
      if (longestStreakEl) longestStreakEl.textContent = longestStreak;

    } catch (error) {
      console.error('Error updating contribution stats:', error);
    }
  }

  // Função para alterar período do mobile contribution widget
  async changeMobilePeriod(period) {
    try {
      // Simular clique no botão correspondente
      const periodButton = document.querySelector(`[data-period="${period}"]`);
      if (periodButton) {
        periodButton.click();
      }
      
      console.log('Mobile period changed to:', period);
    } catch (error) {
      console.error('Error changing mobile period:', error);
    }
  }

  setupPeriodSelector() {
    const periodButtons = document.querySelectorAll('.period-btn');
    const periodInfo = document.getElementById('period-info');
    const currentPeriodInfo = document.getElementById('current-period-info');
    
    periodButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const selectedPeriod = e.target.dataset.period;
        
        // Update button states
        periodButtons.forEach(btn => {
          btn.style.background = 'transparent';
          btn.style.color = 'rgba(255,255,255,0.8)';
          btn.style.borderColor = 'rgba(255,255,255,0.3)';
          btn.classList.remove('active');
        });
        
        e.target.style.background = 'rgba(255,255,255,0.2)';
        e.target.style.color = 'white';
        e.target.style.borderColor = 'rgba(255,255,255,0.5)';
        e.target.classList.add('active');
        
        // Update period info text
        const periodTexts = {
          'rolling': 'Últimos 365 dias',
          '2025': 'Atividade em 2025',
          '2024': 'Atividade em 2024',
          '2023': 'Atividade em 2023',
          '2022': 'Atividade em 2022'
        };
        
        const periodText = periodTexts[selectedPeriod] || `Atividade em ${selectedPeriod}`;
        
        if (periodInfo) {
          periodInfo.textContent = periodText;
        }
        if (currentPeriodInfo) {
          currentPeriodInfo.textContent = periodText;
        }
        
        // Reload widget with new period
        await this.initContributionWidget(selectedPeriod);
        
        // Reload stats for the new period
        await this.loadAndDisplayPeriodStats(selectedPeriod);
      });
    });
  }

  async loadAndDisplayPeriodStats(period) {
    try {
      const stats = await this.loadRealGitHubStats(period);
      
      // Update the real-time stats display
      const totalCommitsEl = document.getElementById('total-commits-real');
      const activeDaysEl = document.getElementById('active-days-real');
      const bestDayEl = document.getElementById('best-day-real');
      
      if (totalCommitsEl) this.animateCounter(totalCommitsEl, stats.totalCommits, 1500);
      if (activeDaysEl) this.animateCounter(activeDaysEl, stats.activeDays, 1200);
      if (bestDayEl) this.animateCounter(bestDayEl, stats.bestDay, 1000);
      
    } catch (error) {
      console.error('Error loading period stats:', error);
    }
  }

  animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start).toLocaleString();
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString();
      }
    };
    
    element.textContent = '0';
    animate();
  }

  async animateCounters() {
    // Load real analytics data
    const realStats = await this.loadRealGitHubStats();
    
    const counters = [
      { id: 'commits-count', target: realStats.totalCommits, duration: 2000 },
      { id: 'repos-count', target: 32, duration: 1500 },
      { id: 'streak-count', target: realStats.currentStreak, duration: 1000 },
      { id: 'languages-count', target: 8, duration: 800 }
    ];

    // Real-time analytics counters
    const realCounters = [
      { id: 'total-commits-real', target: realStats.totalCommits, duration: 1500 },
      { id: 'active-days-real', target: realStats.activeDays, duration: 1200 },
      { id: 'best-day-real', target: realStats.bestDay, duration: 1000 }
    ];

    // Animate main counters
    counters.forEach(counter => {
      const element = document.getElementById(counter.id);
      if (!element) return;

      let start = 0;
      const increment = counter.target / (counter.duration / 16);
      
      const animate = () => {
        start += increment;
        if (start < counter.target) {
          element.textContent = Math.floor(start).toLocaleString();
          requestAnimationFrame(animate);
        } else {
          element.textContent = counter.target.toLocaleString();
        }
      };
      
      setTimeout(() => {
        element.textContent = '0';
        animate();
      }, counters.indexOf(counter) * 100);
    });

    // Animate real analytics counters
    realCounters.forEach(counter => {
      const element = document.getElementById(counter.id);
      if (!element) return;

      let start = 0;
      const increment = counter.target / (counter.duration / 16);
      
      const animate = () => {
        start += increment;
        if (start < counter.target) {
          element.textContent = Math.floor(start).toLocaleString();
          requestAnimationFrame(animate);
        } else {
          element.textContent = counter.target.toLocaleString();
        }
      };
      
      setTimeout(() => {
        element.textContent = '0';
        animate();
      }, (realCounters.indexOf(counter) * 150) + 500);
    });
  }

  async loadRealGitHubStats(period = 'rolling') {
    try {
      // Determine filename based on period
      let filename;
      if (period === 'rolling') {
        filename = `activity-rolling-365d-felipemacedo1.json`;
      } else {
        filename = `activity-${period}-felipemacedo1.json`;
      }
      
      // Try different base paths for analytics data
      const basePaths = ['./analytics/', '../analytics/', '../../analytics/', 'analytics/'];
      let response;
      
      for (const basePath of basePaths) {
        try {
          response = await fetch(`${basePath}${filename}`);
          if (response.ok) {
            console.log('Successfully loaded analytics from:', this.sanitizeLogInput(`${basePath}${filename}`));
            break;
          }
        } catch (error) {
          console.log('Failed to load from:', this.sanitizeLogInput(`${basePath}${filename}`), this.sanitizeLogInput(error.message));
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Could not load analytics data for period: ${period}`);
      }
      
      const rawData = await response.text();
      let data;
      try {
        // Validate JSON string before parsing
        if (typeof rawData !== 'string' || rawData.length > 1000000) {
          throw new Error('Invalid data format');
        }
        
        data = JSON.parse(rawData);
        
        // Validate parsed data structure
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        
        // Validate required properties
        if (!data.daily_metrics || typeof data.daily_metrics !== 'object') {
          throw new Error('Missing or invalid daily_metrics');
        }
        
      } catch (parseError) {
        throw new Error('Invalid JSON data');
      }
      const dailyMetrics = data.daily_metrics || {};
      
      console.log('Analytics data loaded for period:', this.sanitizeLogInput(period), { 
        totalDays: Object.keys(dailyMetrics).length,
        dateRange: `${Math.min(...Object.keys(dailyMetrics))} to ${Math.max(...Object.keys(dailyMetrics))}`
      });
      
      // Calculate real statistics
      const commits = Object.values(dailyMetrics);
      const totalCommits = commits.reduce((sum, count) => sum + count, 0);
      const activeDays = commits.filter(count => count > 0).length;
      const bestDay = Math.max(...commits);
      
      // Calculate current streak (consecutive days with commits)
      const dates = Object.keys(dailyMetrics).sort().reverse();
      let currentStreak = 0;
      let checkingStreak = true;
      
      for (const date of dates) {
        if (dailyMetrics[date] > 0 && checkingStreak) {
          currentStreak++;
        } else {
          checkingStreak = false;
        }
      }
      
      // If no current streak, find the most recent streak
      if (currentStreak === 0) {
        let foundCommit = false;
        for (const date of dates) {
          if (dailyMetrics[date] > 0) {
            if (!foundCommit) {
              foundCommit = true;
              currentStreak = 1;
            } else {
              currentStreak++;
            }
          } else if (foundCommit) {
            break;
          }
        }
      }
      
      const stats = {
        totalCommits,
        activeDays,
        bestDay,
        currentStreak: Math.max(currentStreak, 1)
      };
      
      console.log('Calculated stats for period:', this.sanitizeLogInput(period), stats);
      return stats;
      
    } catch (error) {
      console.error('Error loading real GitHub stats for period:', this.sanitizeLogInput(period), this.sanitizeLogInput(error.message));
      // Fallback values with realistic numbers based on period
      const fallbackValues = {
        'rolling': { totalCommits: 847, activeDays: 156, bestDay: 35, currentStreak: 8 },
        '2025': { totalCommits: 234, activeDays: 98, bestDay: 18, currentStreak: 5 },
        '2024': { totalCommits: 412, activeDays: 178, bestDay: 35, currentStreak: 12 },
        '2023': { totalCommits: 298, activeDays: 134, bestDay: 22, currentStreak: 7 },
        '2022': { totalCommits: 187, activeDays: 89, bestDay: 15, currentStreak: 3 }
      };
      
      return fallbackValues[period] || fallbackValues['rolling'];
    }
  }

  addGitHubStyles() {
    // Add custom styles for GitHub section if not already added
    if (document.getElementById('github-custom-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'github-custom-styles';
    styleSheet.textContent = `
      .compact {
        transform: scale(0.8);
        transform-origin: top left;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .github-stat-card {
        animation: fadeInUp 0.6s ease-out;
      }
      
      .github-stat-card:hover {
        animation: pulse 1.5s infinite;
      }
      
      .github-repo-card {
        transition: all 0.3s ease;
      }
      
      .github-repo-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .activity-dot {
        animation: pulse 2s infinite;
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .github-section {
        animation: slideInRight 0.8s ease-out;
      }
      
      /* Period selector styles */
      .period-btn:hover {
        background: #30363d !important;
        color: #f0f6fc !important;
      }
      
      .period-btn.active:hover {
        background: #2ea043 !important;
        color: white !important;
      }
      
      .period-btn {
        transition: all 0.2s ease !important;
      }
    `;
    
    document.head.appendChild(styleSheet);
  }

  // Status menu helper functions
  async getProjectVersion() {
    try {
      // Try to fetch the latest release from GitHub API
      const response = await fetch('https://api.github.com/repos/felipemacedo1/felipemacedo1.github.io/releases/latest', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.ok) {
        const release = await response.json();
        console.log('Fetched version from GitHub:', this.sanitizeLogInput(release.tag_name));
        return release.tag_name || 'v2025.1.0';
      } else {
        console.log('GitHub API responded with:', this.sanitizeLogInput(String(response.status)));
      }
    } catch (error) {
      console.log('Could not fetch version from GitHub:', this.sanitizeLogInput(error.message));
    }
    
    // Try to fetch from package.json as fallback
    try {
      const packageResponse = await fetch('./package.json');
      if (packageResponse.ok) {
        const packageData = await packageResponse.json();
        if (packageData.version) {
          return `v${packageData.version}`;
        }
      }
    } catch (error) {
      console.log('Could not fetch version from package.json');
    }
    
    // Final fallback version
    return 'v2025.1.0';
  }

  getStatusUptime() {
    const startTime = Date.now() - (Math.random() * 86400000 * 30); // Random uptime up to 30 days
    const uptime = Date.now() - startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  }

  getActiveProjects() {
    return Math.floor(Math.random() * 3) + 4; // 4-6 projects
  }

  getCommitsThisWeek() {
    return Math.floor(Math.random() * 15) + 12; // 12-26 commits
  }

  getCurrentStreak() {
    return Math.floor(Math.random() * 8) + 5; // 5-12 days
  }

  getLastDeploy() {
    const deployDate = new Date();
    deployDate.setHours(deployDate.getHours() - Math.floor(Math.random() * 48)); // Last 48 hours
    return deployDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getBuildNumber() {
    const buildNum = Math.floor(Math.random() * 1000) + 2000;
    return `#${buildNum}`;
  }

  optimizeGitHubScroll() {
    // Specific optimization for GitHub section scrolling
    const githubSection = document.querySelector('.github-section');
    if (githubSection) {
      // Ensure proper native scroll behavior on main container
      githubSection.style.overflowY = 'auto';
      githubSection.style.webkitOverflowScrolling = 'touch';
      githubSection.style.overscrollBehaviorY = 'contain';
      githubSection.style.scrollBehavior = 'smooth';
      githubSection.style.touchAction = 'pan-y';
      githubSection.style.isolation = 'isolate';
      
      // Remove any interference with native scrolling
      githubSection.style.pointerEvents = 'auto';
    }

    // Remove scroll from nested containers to prevent conflicts
    const githubContent = document.querySelector('.github-content-scroll');
    if (githubContent) {
      githubContent.style.overflow = 'visible';
      githubContent.style.height = 'auto';
    }

    // Optimize contribution widget container
    const contribWidget = document.getElementById('mobile-contrib-widget');
    if (contribWidget) {
      contribWidget.style.overflow = 'hidden';
      contribWidget.style.touchAction = 'none'; // Widget doesn't need scrolling
    }

    // Ensure interactive elements work properly
    const interactiveElements = document.querySelectorAll('#mobile-period-selector, .github-section button, .github-section a');
    interactiveElements.forEach(element => {
      element.style.touchAction = 'manipulation';
    });
  }

  addPullToRefresh() {
    const detailContent = document.querySelector('.detail-content');
    if (!detailContent) return;

    let startY = 0;
    let pullDistance = 0;
    const maxPull = 60;
    let isPulling = false;

    detailContent.addEventListener('touchstart', (e) => {
      if (detailContent.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = false;
      }
    }, { passive: true });

    detailContent.addEventListener('touchmove', (e) => {
      if (detailContent.scrollTop === 0 && startY > 0) {
        const currentY = e.touches[0].clientY;
        pullDistance = Math.min(currentY - startY, maxPull);

        if (pullDistance > 10) {
          isPulling = true;
          // Gentle pull effect that doesn't interfere with scrolling
          detailContent.style.transform = `translateY(${pullDistance * 0.3}px)`;
          detailContent.style.transition = 'none';
        }
      }
    }, { passive: true });

    detailContent.addEventListener('touchend', () => {
      if (isPulling) {
        if (pullDistance > 40) {
          // Trigger refresh
          this.refreshCurrentView();
        }

        // Reset transform with smooth transition
        detailContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        detailContent.style.transform = '';
        detailContent.style.opacity = '';
      }
      
      startY = 0;
      pullDistance = 0;
      isPulling = false;
    }, { passive: true });
  }

  refreshCurrentView() {
    // Add refresh animation
    const detailContent = document.querySelector('.detail-content');
    if (detailContent) {
      detailContent.style.opacity = '0.7';
      setTimeout(() => {
        detailContent.style.opacity = '1';
        // Could reload content here if needed
      }, 500);
    }
  }

  addScrollIndicators() {
    // Add scroll indicators to scrollable containers
    const scrollableElements = document.querySelectorAll('.github-content-scroll, .detail-content');

    scrollableElements.forEach(element => {
      // Remove existing indicator
      const existingIndicator = element.querySelector('.scroll-indicator');
      if (existingIndicator) existingIndicator.remove();

      // Add new indicator
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.style.cssText = `
        position: absolute;
        right: 2px;
        width: 4px;
        height: 30px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 10;
      `;

      element.style.position = 'relative';
      element.appendChild(indicator);

      // Update indicator on scroll
      element.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = element;
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        const indicatorHeight = 30;
        const maxTop = clientHeight - indicatorHeight;

        indicator.style.top = `${scrollPercent * maxTop}px`;
        indicator.style.opacity = scrollHeight > clientHeight ? '0.7' : '0';
      }, { passive: true });
    });
  }

  addHapticFeedback() {
    // Add haptic feedback for interactions with error handling
    const interactiveElements = document.querySelectorAll('.menu-item, .nav-item, .back-btn');

    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        try {
          if (navigator.vibrate && typeof navigator.vibrate === 'function') {
            navigator.vibrate(10); // Short vibration
          }
        } catch (error) {
          // Silently fail if vibration is not supported
          console.debug('Vibration not supported:', this.sanitizeLogInput(error.message));
        }
      }, { passive: true });
    });
  }

  addLoadingStates() {
    // Show loading state when switching views
    const originalShowDetailView = this.showDetailView.bind(this);

    this.showDetailView = function(action) {
      const detailContent = this.performanceOptimizer.cacheElement('#detailContent');
      if (!detailContent) return;

      // Show loading shimmer
      detailContent.innerHTML = `
        <div class="loading-shimmer" style="height: 200px; border-radius: 8px; margin-bottom: 16px; background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
        <div class="loading-shimmer" style="height: 100px; border-radius: 8px; margin-bottom: 16px; background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
        <div class="loading-shimmer" style="height: 150px; border-radius: 8px; background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
      `;

      // Add shimmer animation if not exists
      if (!document.getElementById('shimmer-styles')) {
        const shimmerStyles = document.createElement('style');
        shimmerStyles.id = 'shimmer-styles';
        shimmerStyles.textContent = `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `;
        document.head.appendChild(shimmerStyles);
      }

      // Show detail view immediately with loading
      const detailView = this.performanceOptimizer.cacheElement('#detailView');
      const detailTitle = this.performanceOptimizer.cacheElement('#detailTitle');

      if (detailTitle) detailTitle.textContent = this.getActionTitle(action);
      if (detailView) {
        detailView.style.display = 'flex';
        detailView.classList.add('slide-in');
      }
      this.isDetailViewOpen = true;

      // Load actual content after short delay
      setTimeout(() => {
        originalShowDetailView(action);
      }, 300);
    };
  }

  // Initialize enhanced touch navigation
  initializeTouchNavigation() {
    const container = this.performanceOptimizer.cacheElement('.bios-container');
    if (container && !this.touchNavigation) {
      this.touchNavigation = new EnhancedTouchNavigation(container);
      // Swipe navigation is integrated into the main touch handlers
      console.log('Enhanced touch navigation initialized');
    }
  }

  // Optimized clock update with caching
  updateClock() {
    const timeElement = this.performanceOptimizer.cacheElement('#currentTime');
    if (timeElement) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Only update if time has changed
      if (timeElement.textContent !== timeString) {
        timeElement.textContent = timeString;
      }
    }
  }

  // Optimized battery update with caching
  updateBattery() {
    const batteryElement = this.performanceOptimizer.cacheElement('#batteryLevel');
    if (batteryElement && 'getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const level = Math.round(battery.level * 100);
        const levelString = `${level}%`;
        
        // Only update if level has changed
        if (batteryElement.textContent !== levelString) {
          batteryElement.textContent = levelString;
        }
      }).catch(() => {
        if (batteryElement.textContent !== '100%') {
          batteryElement.textContent = '100%';
        }
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mobileBIOS = new MobileBIOS();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.mobileBIOS && typeof window.mobileBIOS.cleanup === 'function') {
    window.mobileBIOS.cleanup();
  }
});

// Handle visibility change for performance optimization
document.addEventListener('visibilitychange', () => {
  if (window.mobileBIOS) {
    if (document.hidden) {
      // Pause non-essential operations when page is hidden
      if (window.mobileBIOS.clockInterval) {
        clearInterval(window.mobileBIOS.clockInterval);
        window.mobileBIOS.clockInterval = null;
      }
    } else {
      // Resume operations when page becomes visible
      if (!window.mobileBIOS.clockInterval) {
        window.mobileBIOS.clockInterval = setInterval(() => window.mobileBIOS.updateClock(), 1000);
      }
    }
  }
});