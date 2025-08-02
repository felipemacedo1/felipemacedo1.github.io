// Mobile BIOS Interface
import { DeviceDetector } from './utils/DeviceDetector.js';

class MobileBIOS {
  constructor() {
    this.currentView = 'boot';
    this.bootProgress = 0;
    this.isBooted = false;
    this.isDetailViewOpen = false;
    
    this.init();
  }

  init() {
    this.startBootSequence();
    this.setupEventListeners();
    this.updateClock();
    this.updateBattery();
    
    // Update clock every second
    setInterval(() => this.updateClock(), 1000);
    
    // Update battery every 30 seconds
    setInterval(() => this.updateBattery(), 30000);
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
    const bootScreen = document.getElementById('bootScreen');
    const biosInterface = document.getElementById('biosInterface');

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

    // Prevent scroll bounce on iOS
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.bios-menu') === null) {
        e.preventDefault();
      }
    }, { passive: false });
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
        // Redirect to desktop version with force parameter
        window.location.href = './index.html?desktop=true';
        break;
      case 'desktop-link':
        // Same as desktop nav
        window.location.href = './index.html?desktop=true';
        break;
    }
  }

  showDetailView(action) {
    const detailView = document.getElementById('detailView');
    const detailTitle = document.getElementById('detailTitle');
    const detailContent = document.getElementById('detailContent');

    detailTitle.textContent = this.getActionTitle(action);
    detailContent.innerHTML = this.getActionContent(action);

    detailView.style.display = 'flex';
    detailView.classList.add('slide-in');
    this.isDetailViewOpen = true;

    setTimeout(() => {
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

  getActionTitle(action) {
    const titles = {
      about: '👨‍💻 About Me',
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
    switch (action) {
      case 'about':
        return `
          <div style="font-family: 'Roboto', sans-serif; line-height: 1.6;">
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
          <div style="font-family: 'Roboto Mono', monospace;">
            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h4 style="color: #4CAF50; margin-bottom: 12px;">🟢 System Status: ONLINE</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>Uptime: ${this.getUptime()}</div>
                <div>Status: Active</div>
                <div>Location: Brazil</div>
                <div>Timezone: UTC-3</div>
                <div>Last Update: ${new Date().toLocaleDateString()}</div>
                <div>Version: 2025.1.0</div>
              </div>
            </div>
            
            <div style="background: #1E1E1E; padding: 16px; border-radius: 8px;">
              <h4 style="color: #2196F3; margin-bottom: 12px;">💻 Current Projects</h4>
              <ul style="font-size: 12px; margin-left: 16px;">
                <li>Portfolio Terminal Interface</li>
                <li>Microservices Architecture</li>
                <li>API Gateway Development</li>
                <li>Mobile BIOS Interface</li>
              </ul>
            </div>
          </div>
        `;

      case 'whoami':
        return `
          <div style="font-family: 'Roboto Mono', monospace; font-size: 14px;">
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
          <div style="font-family: 'Roboto', sans-serif;">
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
          <div style="font-family: 'Roboto', sans-serif;">
            <div style="margin-bottom: 16px; padding: 16px; background: #1E1E1E; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <h4 style="color: #4CAF50; margin-bottom: 8px;">🌟 Featured Projects</h4>
              <div style="font-size: 12px; color: #ccc;">
                Explore my latest work and contributions
              </div>
            </div>
            
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
            ])}
          </div>
        `;

      case 'contact':
        return `
          <div style="font-family: 'Roboto', sans-serif;">
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
          <div style="font-family: 'Roboto', sans-serif;">
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
    const start = Date.now();
    const uptime = Date.now() - start;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.mobileBIOS = new MobileBIOS();
});
