// Additional commands for the terminal - Refactored to use ContentService
import contentService from '../services/ContentService.js';

export class AdditionalCommands {
  constructor(terminal) {
    this.terminal = terminal;
  }

  getCommands() {
    return {
      skills: () => this.showSkills(),
      experience: () => this.showExperience(),
      education: () => this.showEducation(),
      certifications: () => this.showCertifications(),
      projects: () => this.showProjects(),
      resume: () => this.downloadResume(),
      status: () => this.showStatus(),
      sudo: () => this.sudoCommand(),
      coffee: () => this.coffeeCommand(),
      tdah: () => this.coffeeCommand(),
      'h4x0r-mode': () => this.hackerMode(),
      matrix: () => this.matrixMode(),
      konami: () => this.konamiCode(),
      glitch: () => this.glitchEffect(),
      ascii: () => this.showAsciiLogo(),
      growthfolio: () => this.showGrowthfolio(),
      eastereggs: () => this.showEasterEggs()
    };
  }

  async showSkills() {
    // Use ContentService for skills data
    const skills = await contentService.getSkills('desktop');
    const skillsText = this.formatSkillsText(skills);
    this.terminal.addToOutput(skillsText, 'system');
  }

  formatSkillsText(skills) {
    const formatSkillBar = (skillList, title, icon) => {
      if (!skillList || skillList.length === 0) return '';
      
      let section = `<span class="highlight">${icon} ${title}:</span>\n<div class="skill-bar">\n`;
      
      skillList.forEach(skill => {
        const progressBars = '█'.repeat(Math.floor(skill.level / 10)) + '░'.repeat(10 - Math.floor(skill.level / 10));
        const levelText = this.getLevelText(skill.level);
        section += `<span class="skill-label">${skill.name}</span>         <span class="skill-progress">${progressBars}</span> <span class="skill-level">${levelText} (${skill.level}%)</span>\n`;
      });
      
      section += '</div>\n\n';
      return section;
    };

    return `
<span class="ascii-art align-center">
    ╔════════════════════════════════════╗
           🛠️ SKILLS & TECNOLOGIAS         
    ╚════════════════════════════════════╝
</span>

${formatSkillBar(skills.backend, 'Backend Development', '💻')}
${formatSkillBar(skills.frontend, 'Frontend & Web', '🌐')}
${formatSkillBar(skills.devops, 'DevOps & Cloud', '🚀')}
<span class="warning">🎯 Foco atual:</span> Arquitetura de microserviços e performance optimization`;
  }

  getLevelText(level) {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';
    if (level >= 70) return 'Intermediate';
    return 'Basic';
  }

  async showExperience() {
    // Use ContentService for experience data
    const experience = await contentService.getExperience('desktop');
    const experienceText = this.formatExperienceText(experience);
    this.terminal.addToOutput(experienceText, 'system');
  }

  formatExperienceText(experience) {
    if (!experience || experience.length === 0) {
      return '<span class="error">No experience data available</span>';
    }

    let experienceText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
           💼 EXPERIÊNCIA PROFISSIONAL        
    ╚══════════════════════════════════════╝
</span>

`;

    experience.forEach(exp => {
      experienceText += `<div class="timeline-item">
<span class="timeline-date">${exp.period}</span>
<span class="timeline-title">${exp.icon} ${exp.title} - ${exp.company}</span>
<span class="timeline-description">
${exp.description.map(desc => `• ${desc}`).join('\n')}
</span>
</div>

`;
    });

    experienceText += `<span class="success">📈 Crescimento contínuo:</span> 3+ anos de experiência hands-on em desenvolvimento`;
    return experienceText;
  }

  async showEducation() {
    // Use ContentService for education data
    const education = await contentService.getEducation('desktop');
    const educationText = this.formatEducationText(education);
    this.terminal.addToOutput(educationText, 'system');
  }

  formatEducationText(education) {
    if (!education) {
      return '<span class="error">No education data available</span>';
    }

    let educationText = `
<span class="ascii-art align-center">
    ╔═══════════════════════════════════════╗
            🎓 FORMAÇÃO ACADÊMICA             
    ╚═══════════════════════════════════════╝
</span>

`;

    // Format formal education
    if (education.formal && education.formal.length > 0) {
      education.formal.forEach(edu => {
        educationText += `<div class="education-item">
<span class="education-degree">${edu.icon} ${edu.degree}</span>
<span class="education-institution">${edu.institution}</span>
<span class="education-period">${edu.period} (${edu.status})</span>
<span class="education-description">
${edu.description}
</span>
</div>

`;
      });
    }

    // Format bootcamps
    if (education.bootcamps && education.bootcamps.length > 0) {
      educationText += `<span class="highlight">🚀 Bootcamps & Cursos Intensivos:</span>

`;
      
      education.bootcamps.forEach(bootcamp => {
        educationText += `<div class="bootcamp-item">
<span class="bootcamp-name">${bootcamp.icon} ${bootcamp.name}</span>
<span class="bootcamp-period">${bootcamp.period}</span>
<span class="bootcamp-description">${bootcamp.description}</span>
</div>

`;
      });
    }

    educationText += `<span class="success">🏆 Status:</span> Sempre estudando - aprendizado contínuo é essencial!`;
    return educationText;
  }

  async showCertifications() {
    // Use ContentService for certifications data
    const certifications = await contentService.getCertifications('desktop');
    const certificationsText = this.formatCertificationsText(certifications);
    this.terminal.addToOutput(certificationsText, 'system');
  }

  formatCertificationsText(certifications) {
    if (!certifications) {
      return '<span class="error">No certifications data available</span>';
    }

    let certificationsText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
         🏆 CERTIFICAÇÕES & QUALIFICAÇÕES     
    ╚══════════════════════════════════════╝
</span>

`;

    // Format each category
    Object.entries(certifications).forEach(([categoryKey, category]) => {
      if (categoryKey === 'inProgress') return; // Handle separately
      
      if (category.items && category.items.length > 0) {
        certificationsText += `<span class="highlight">${category.icon} ${category.title}:</span>

`;
        
        category.items.forEach(cert => {
          certificationsText += `<div class="cert-item">
<span class="cert-badge">${cert.icon}</span> <span class="cert-name">${cert.name}</span>
<span class="cert-issuer">${cert.issuer}</span> | <span class="cert-date">${cert.date}</span>
<span class="cert-description">${cert.description}</span>
</div>

`;
        });
      }
    });

    // Add in progress section
    if (certifications.inProgress && certifications.inProgress.length > 0) {
      certificationsText += `<span class="warning">📚 Em progresso:</span>
`;
      certifications.inProgress.forEach(cert => {
        certificationsText += `• ${cert}
`;
      });
      certificationsText += `
`;
    }

    certificationsText += `<span class="success">🎯 Meta:</span> Certificações são ferramentas, experiência prática é o que conta!`;
    return certificationsText;
  }

  async showProjects() {
    // Use ContentService for projects data
    const projects = await contentService.getProjects('desktop');
    const featuredProjects = await contentService.getFeaturedProjects('desktop');
    const projectsText = this.formatProjectsText(projects, featuredProjects);
    this.terminal.addToOutput(projectsText, 'system');
  }

  formatProjectsText(projects, featuredProjects) {
    if (!projects || projects.length === 0) {
      return '<span class="error">No projects data available</span>';
    }

    let projectsText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
           📁 PORTFÓLIO DE PROJETOS           
    ╚══════════════════════════════════════╝
</span>

`;

    // Show featured projects first
    if (featuredProjects && featuredProjects.length > 0) {
      projectsText += `<span class="highlight">🌟 Projetos em Destaque:</span>

`;
      
      featuredProjects.forEach(project => {
        projectsText += this.formatProjectItem(project, true);
      });
      
      projectsText += `
`;
    }

    // Show all projects by category
    const categories = {};
    projects.forEach(project => {
      if (!categories[project.category]) {
        categories[project.category] = [];
      }
      categories[project.category].push(project);
    });

    Object.entries(categories).forEach(([category, categoryProjects]) => {
      const categoryInfo = this.getCategoryInfo(category);
      projectsText += `<span class="highlight">${categoryInfo.icon} ${categoryInfo.title}:</span>

`;
      
      categoryProjects.forEach(project => {
        projectsText += this.formatProjectItem(project, false);
      });
      
      projectsText += `
`;
    });

    projectsText += `<span class="success">🚀 Todos os projetos:</span> Disponíveis no GitHub para exploração e contribuição!`;
    return projectsText;
  }

  formatProjectItem(project, isFeatured) {
    const statusColor = this.getStatusColor(project.status);
    const techStack = project.technologies ? project.technologies.join(', ') : 'N/A';
    
    return `<div class="project-item">
<span class="project-title">${project.icon} ${project.name}</span>
<span class="project-tech">${techStack}</span>
<span class="project-description">${project.description}</span>
<span class="project-status" style="color: ${statusColor};">Status: ${project.status}</span>
${project.github ? `<a href="${project.github}" target="_blank" class="project-link">🔗 Ver no GitHub</a>` : ''}
${project.demo ? `<a href="${project.demo}" target="_blank" class="project-link">🌐 Demo ao vivo</a>` : ''}
</div>

`;
  }

  getCategoryInfo(category) {
    const categoryMap = {
      'web': { icon: '🌐', title: 'Desenvolvimento Web' },
      'backend': { icon: '💻', title: 'Backend & APIs' },
      'mobile': { icon: '📱', title: 'Desenvolvimento Mobile' },
      'blockchain': { icon: '⛓️', title: 'Blockchain & Web3' },
      'tools': { icon: '🔧', title: 'Ferramentas & Utilitários' },
      'learning': { icon: '🎓', title: 'Projetos de Aprendizado' }
    };
    
    return categoryMap[category] || { icon: '📁', title: 'Outros Projetos' };
  }

  getStatusColor(status) {
    const statusColors = {
      'Live': '#4CAF50',
      'Active development': '#2196F3',
      'In progress': '#FF9800',
      'Completed': '#4CAF50',
      'Archived': '#757575',
      'Planning': '#9C27B0'
    };
    
    return statusColors[status] || '#FFC107';
  }

  downloadResume() {
    const resumeText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
             📄 DOWNLOAD CURRÍCULO           
    ╚══════════════════════════════════════╝
</span>

<span class="highlight">📥 Currículo disponível para download:</span>

<div class="download-item">
<span class="download-icon">📄</span> <span class="download-name">Currículo - Felipe Macedo.pdf</span>
<span class="download-description">Versão completa e atualizada (Janeiro 2025)</span>
<a href="mailto:contato.dev.macedo@gmail.com?subject=Solicitação de Currículo&body=Olá Felipe, gostaria de receber seu currículo atualizado." class="project-link">
📧 Solicitar por email
</a>
</div>

<div class="download-item">
<span class="download-icon">💼</span> <span class="download-name">LinkedIn Profile</span>
<span class="download-description">Perfil profissional completo e atualizado</span>
<a href="https://linkedin.com/in/felipemacedo1" target="_blank" class="project-link">
🔗 Acessar LinkedIn
</a>
</div>

<span class="highlight">📋 Inclui:</span>
<span class="output-text">• Experiência profissional detalhada</span>
<span class="output-text">• Projetos e tecnologias utilizadas</span>
<span class="output-text">• Formação acadêmica e certificações</span>
<span class="output-text">• Informações de contato atualizadas</span>

<span class="warning">💡 Dica:</span> Para recrutadores e oportunidades profissionais, prefiro contato via LinkedIn.`;
    this.terminal.addToOutput(resumeText, 'system');
  }

  showStatus() {
    const now = new Date();
    const statusText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
           📊 STATUS & DISPONIBILIDADE        
    ╚══════════════════════════════════════╝
</span>

<span class="highlight">🟢 STATUS ATUAL: ATIVO</span>

<div class="status-grid">
<span class="status-label">📅 Data:</span> <span class="status-value">${now.toLocaleDateString('pt-BR')}</span>
<span class="status-label">⏰ Hora:</span> <span class="status-value">${now.toLocaleTimeString('pt-BR')}</span>
<span class="status-label">📍 Local:</span> <span class="status-value">São Paulo, Brasil (UTC-3)</span>
<span class="status-label">💼 Situação:</span> <span class="status-value">Empregado + Estudante</span>
</div>

<span class="highlight">🚀 Disponibilidade para projetos:</span>

<div class="availability-item">
<span class="availability-icon">�</span> <span class="availability-text">Indisponível para trabalho/estudo durante a semana</span>
</div>

<div class="availability-item">
<span class="availability-icon">🟢</span> <span class="availability-text">Freelances apenas finais de semana</span>
</div>

<div class="availability-item">
<span class="availability-icon">🟢</span> <span class="availability-text">Contribuições open source</span>
</div>

<div class="availability-item">
<span class="availability-icon">�</span> <span class="availability-text">Networking e mentoria técnica</span>
</div>

<span class="highlight">⏰ Horário de trabalho freelance:</span>
<span class="output-text">🌅 Segunda a Sexta: 18h - 22h</span>
<span class="output-text">🌄 Fins de semana: 9h - 17h (projetos especiais)</span>

<span class="success">💬 Entre em contato:</span> Sempre aberto para conversar sobre oportunidades interessantes!`;
    this.terminal.addToOutput(statusText, 'system');
  }

  sudoCommand() {
    const sudoText = `
<span class="error">sudo: felipemacedo1 is not in the sudoers file. This incident will be reported.</span>

<span class="warning">🚨 Acesso negado!</span>

<span class="output-text">Desculpe, mas você não tem privilégios de administrador neste sistema.</span>
<span class="output-text">Este portfólio é somente leitura para visitantes. 😄</span>

<span class="highlight">💡 Mas você pode:</span>
<span class="success">• Explorar todos os comandos disponíveis com 'help'</span>
<span class="success">• Ver meus projetos com 'projects'</span>
<span class="success">• Entrar em contato comigo com 'contact'</span>

<span class="ascii-art">
    ╔══════════════════════════════════════╗
    ║  🔐 Acesso root negado... por ora 😉  ║
    ╚══════════════════════════════════════╝
</span>`;
    this.terminal.addToOutput(sudoText, 'system');
  }

  coffeeCommand() {
    const coffeeText = `
<span class="ascii-art align-center">
         ☕
       (   )
      (  (  )
       ) _) )
      ( (( (
       \\_)_/
    ╔══════════╗
    ║   CAFÉ   ║
    ╚══════════╝
</span>

<span class="highlight">☕ Diagnóstico TDAH/Cafeína Realizado:</span>

<div class="diagnosis-item">
<span class="diagnosis-label">📊 Nível de cafeína no sangue:</span> <span class="success">OTIMIZADO ✅</span>
</div>

<div class="diagnosis-item">
<span class="diagnosis-label">🧠 Estado mental:</span> <span class="success">FOCO MÁXIMO 🎯</span>
</div>

<div class="diagnosis-item">
<span class="diagnosis-label">💻 Produtividade:</span> <span class="success">MODO DESENVOLVEDOR ATIVADO 🚀</span>
</div>

<div class="diagnosis-item">
<span class="diagnosis-label">⚡ Energia:</span> <span class="success">CÓDIGO FLOWING 💫</span>
</div>

<span class="warning">⚠️ ATENÇÃO:</span> 
<span class="output-text">Desenvolvedor operando com cafeína otimizada detectado!</span>
<span class="output-text">Bugs podem ser corrigidos em velocidade supersônica ⚡</span>
<span class="output-text">Commits podem aumentar drasticamente 📈</span>

<span class="highlight">☕ Estatísticas pessoais:</span>
<span class="output-text">• Xícaras por dia: 4-6 ☕☕☕☕☕☕</span>
<span class="output-text">• Melhor horário para código: Após o 2º café da manhã</span>
<span class="output-text">• Tipo preferido: Espresso forte ☕💪</span>

<span class="success">💡 Fun fact:</span> Este terminal foi desenvolvido após várias xícaras de café! ☕✨`;
    this.terminal.addToOutput(coffeeText, 'system');
  }

  hackerMode() {
    // Apply hacker theme temporarily
    document.body.classList.add('hacker-mode');
    
    const hackerText = `
<span class="error">🔴 HACKER MODE ACTIVATED 🔴</span>

<span class="ascii-art">
    ██╗  ██╗██╗  ██╗██╗  ██╗ ██████╗ ██████╗ 
    ██║  ██║██║  ██║██║  ██║██╔═══██╗██╔══██╗
    ███████║███████║███████║██║   ██║██████╔╝
    ██╔══██║╚════██║╚════██║██║   ██║██╔══██╗
    ██║  ██║     ██║     ██║╚██████╔╝██║  ██║
    ╚═╝  ╚═╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝
</span>

<span class="error">SYSTEM BREACH DETECTED...</span>
<span class="error">ACCESSING MAINFRAME...</span>
<span class="error">BYPASSING SECURITY PROTOCOLS...</span>
<span class="success">ACCESS GRANTED ✅</span>

<span class="highlight">🎯 OPERAÇÃO: PORTFOLIO INFILTRATION</span>

<div class="hacker-info">
<span class="error">TARGET:</span> <span class="output-text">Felipe Macedo's Portfolio</span>
<span class="error">STATUS:</span> <span class="success">COMPROMISED</span>
<span class="error">ENCRYPTION:</span> <span class="warning">BYPASSED</span>
<span class="error">FIREWALL:</span> <span class="success">DISABLED</span>
</div>

<span class="warning">💀 CLASSIFIED DATA EXTRACTED:</span>
<span class="output-text">• Coffee consumption: CRITICAL LEVELS ☕</span>
<span class="output-text">• Code quality: SURPRISINGLY GOOD 💯</span>
<span class="output-text">• Bug rate: ACCEPTABLE FOR HUMAN 🐛</span>
<span class="output-text">• Commit frequency: SUSPICIOUS HIGH 📈</span>

<span class="error">WARNING: This is just for fun! 😄</span>
<span class="output-text">Digite 'theme dark' para voltar ao normal.</span>`;

    this.terminal.addToOutput(hackerText, 'system');

    // Remove hacker mode after 10 seconds
    setTimeout(() => {
      document.body.classList.remove('hacker-mode');
    }, 10000);
  }

  matrixMode() {
    const matrixText = `
<span class="success">ENTERING THE MATRIX...</span>

<span class="ascii-art matrix-effect">
    █▄░█ █▀▀ █▀█
    █░▀█ █▄▄ █▄█
    
    ░█▀▄▀█ █▀█ █▀█ █▀█ █░█ █▀▀ █░█ █▀
    █░▀░█ █▄█ █▀▄ █▀▀ █▀█ ██▄ █▄█ ▄█
</span>

<span class="success">Wake up, Neo...</span>
<span class="output-text">The Matrix has you...</span>
<span class="success">Follow the white rabbit. 🐰</span>

<span class="highlight">🔴 Red pill or blue pill?</span>

<span class="error">REALITY CHECK:</span>
<span class="output-text">• You are in a portfolio terminal</span>
<span class="output-text">• This is not a simulation (or is it? 🤔)</span>
<span class="output-text">• Felipe exists in the real world</span>
<span class="output-text">• But his code lives in the digital realm</span>

<span class="success">🕶️ Welcome to Felipe's Matrix</span>
<span class="output-text">Where Java and Go flow like digital rain...</span>
<span class="output-text">And bugs are just glitches in the system...</span>

<span class="warning">🚨 AGENT DETECTED:</span>
<span class="error">Mr. Anderson... I mean, visitor...</span>
<span class="output-text">You've been exploring too long.</span>
<span class="output-text">Type 'exit' if you can... 😈</span>`;

    this.terminal.addToOutput(matrixText, 'system');
  }

  konamiCode() {
    const konamiText = `
<span class="success">🎮 KONAMI CODE ACTIVATED! 🎮</span>

<span class="ascii-art">
    ↑ ↑ ↓ ↓ ← → ← → B A
</span>

<span class="highlight">🏆 ACHIEVEMENT UNLOCKED!</span>
<span class="success">Secret Developer Mode Discovered</span>

<span class="warning">🎁 BONUS FEATURES ACTIVATED:</span>
<span class="output-text">• Infinite lives in debugging sessions</span>
<span class="output-text">• 30 extra hours added to your day</span>
<span class="output-text">• Coffee mug auto-refill enabled ☕∞</span>
<span class="output-text">• Bug immunity for next 24 hours</span>
<span class="output-text">• Instant Stack Overflow answers</span>

<span class="highlight">🕹️ RETRO GAMING STATS:</span>
<span class="output-text">Favorite games: Contra, Metal Slug, Street Fighter</span>
<span class="output-text">Programming like gaming: Practice makes perfect!</span>

<span class="success">🎊 Parabéns! Você encontrou o easter egg clássico!</span>`;

    this.terminal.addToOutput(konamiText, 'system');
  }

  glitchEffect() {
    // Apply glitch effect to terminal
    const terminal = document.querySelector('.terminal-container');
    terminal.classList.add('glitch-effect');

    const glitchText = `
<span class="error">G͎̺͎̻̯͎L͎̺͎̻̯͎I͎̺͎̻̯͎T͎̺͎̻̯͎C͎̺͎̻̯͎H͎̺͎̻̯͎ DETECTED</span>

<span class="ascii-art glitch">
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █░█▀█░█▀▄░█▀▄░█▀█░█▀▄░░░█▀▀░█▀▀░█▀▀░█
    █░█▄▄░█▄▀░█▄▀░█▄█░█▄▀░░░█▄▄░█▄▄░█▄▄░█
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
</span>

<span class="error">SYSTEM ANOMALY DETECTED...</span>
<span class="warning">REALITY.EXE HAS STOPPED WORKING</span>
<span class="error">M̷a̴t̸r̶i̷x̴ ̵o̸v̶e̷r̷l̸o̴a̶d̷.̴.̵.̸</span>

<span class="success">ERROR: SUCCESS</span>
<span class="output-text">• Glitch art: Acidental mas interessante</span>
<span class="output-text">• Debug hell: Onde desenvolvedores nascem</span>
<span class="output-text">• Stack overflow: Not the website</span>

<span class="error">W̴A̸R̵N̸I̴N̷G̵:̴ ̷R̶e̸a̵l̶i̷t̴y̸ ̶m̵a̷y̸ ̴b̶e̷ ̵b̸u̶g̴g̷e̶d̵</span>

<span class="highlight">🔧 HOTFIX APPLIED:</span>
<span class="output-text">Glitch transformed into feature ✨</span>`;

    this.terminal.addToOutput(glitchText, 'system');

    // Remove glitch effect after 5 seconds
    setTimeout(() => {
      terminal.classList.remove('glitch-effect');
    }, 5000);
  }

  showAsciiLogo() {
    const asciiText = `
<span class="ascii-art align-center">
    ███████╗███████╗██╗     ██╗██████╗ ███████╗
    ██╔════╝██╔════╝██║     ██║██╔══██╗██╔════╝
    █████╗  █████╗  ██║     ██║██████╔╝█████╗  
    ██╔══╝  ██╔══╝  ██║     ██║██╔═══╝ ██╔══╝  
    ██║     ███████╗███████╗██║██║     ███████╗
    ╚═╝     ╚══════╝╚══════╝╚═╝╚═╝     ╚══════╝
                                               
    ███╗   ███╗ █████╗  ██████╗███████╗██████╗  ██████╗ 
    ████╗ ████║██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗
    ██╔████╔██║███████║██║     █████╗  ██║  ██║██║   ██║
    ██║╚██╔╝██║██╔══██║██║     ██╔══╝  ██║  ██║██║   ██║
    ██║ ╚═╝ ██║██║  ██║╚██████╗███████╗██████╔╝╚██████╔╝
    ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═════╝  ╚═════╝ 
</span>

<span class="highlight">💻 DEVELOPER & SYSTEM ARCHITECT</span>

<span class="ascii-art align-center">
    ╔══════════════════════════════════════════════════════╗
    ║  "Code is poetry written in logic" - Felipe Macedo  ║
    ╚══════════════════════════════════════════════════════╝
</span>

<span class="success">🎨 ASCII Art Stats:</span>
<span class="output-text">• Fonte: Generated with love and terminal skills</span>
<span class="output-text">• Estilo: Classic monospace terminal</span>
<span class="output-text">• Inspiração: Retro computing vibes</span>
<span class="output-text">• Feito com: Muito café e dedicação ☕</span>`;

    this.terminal.addToOutput(asciiText, 'system');
  }

  showGrowthfolio() {
    const growthfolioText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
           🌱 GROWTHFOLIO ORGANIZATION      
    ╚══════════════════════════════════════╝
</span>

<span class="highlight">🚀 Sobre a Growthfolio:</span>

<span class="output-text">
A Growthfolio é uma organização no GitHub dedicada ao desenvolvimento 
de projetos open source, bibliotecas reutilizáveis e microserviços 
que ajudam desenvolvedores a crescer em suas carreiras.
</span>

<span class="highlight">📦 Projetos Principais:</span>

<div class="project-item">
<span class="project-title">🛠️ Developer Tools Collection</span>
<span class="project-description">
Conjunto de ferramentas e utilitários para desenvolvedores
• CLI tools para automação de tarefas
• Templates de projeto para diferentes stacks
• Scripts de configuração de ambiente de desenvolvimento
</span>
</div>

<div class="project-item">
<span class="project-title">📚 Learning Resources</span>
<span class="project-description">
Recursos educacionais e materiais de estudo
• Guias de boas práticas em diferentes linguagens
• Exercícios práticos e desafios de código
• Documentação e tutoriais detalhados
</span>
</div>

<div class="project-item">
<span class="project-title">🔧 Microservices Ecosystem</span>
<span class="project-description">
Conjunto de microserviços reutilizáveis
• APIs template para diferentes necessidades
• Serviços de autenticação e autorização
• Monitoramento e logging padronizados
</span>
</div>

<span class="highlight">🌐 Links:</span>
<span class="project-link">🔗 github.com/orgs/growthfolio</span>
<span class="output-text">🤝 Contribuições e colaborações são bem-vindas!</span>

<span class="success">🎯 Missão:</span>
<span class="output-text">Democratizar o acesso a ferramentas de qualidade e acelerar</span>
<span class="output-text">o crescimento profissional de desenvolvedores em todo o mundo.</span>`;

    this.terminal.addToOutput(growthfolioText, 'system');
  }

  showEasterEggs() {
    const easterEggsText = `
<span class="ascii-art align-center">
    ╔══════════════════════════════════════╗
           🥚 EASTER EGGS ENCONTRADOS       
    ╚══════════════════════════════════════╝
</span>

<span class="highlight">🎮 Lista de Easter Eggs Disponíveis:</span>

<div class="easter-egg-item">
<span class="egg-icon">🎮</span> <span class="egg-name">konami</span>
<span class="egg-description">Código Konami clássico dos videogames</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">🔴</span> <span class="egg-name">h4x0r-mode</span>
<span class="egg-description">Ativa o modo hacker (temporário)</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">💊</span> <span class="egg-name">matrix</span>
<span class="egg-description">Entre na Matrix... ou saia dela</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">⚡</span> <span class="egg-name">glitch</span>
<span class="egg-description">Efeito glitch no terminal</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">☕</span> <span class="egg-name">coffee</span> ou <span class="egg-name">tdah</span>
<span class="egg-description">Diagnóstico de cafeína do desenvolvedor</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">🎨</span> <span class="egg-name">ascii</span>
<span class="egg-description">Logo ASCII personalizado</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">🔐</span> <span class="egg-name">sudo</span>
<span class="egg-description">Tente obter privilégios de admin (spoiler: não vai rolar)</span>
</div>

<div class="easter-egg-item">
<span class="egg-icon">🌱</span> <span class="egg-name">growthfolio</span>
<span class="egg-description">Informações sobre a organização no GitHub</span>
</div>

<span class="highlight">🎨 Temas Especiais:</span>
<span class="output-text">• theme matrix - Visual inspirado no filme Matrix</span>
<span class="output-text">• theme hacker - Cores estilo terminal hacker</span>
<span class="output-text">• theme retro - Nostalgia dos anos 80</span>

<span class="success">🏆 Parabéns!</span>
<span class="output-text">Você é um verdadeiro explorador! Continue descobrindo os segredos deste terminal.</span>

<span class="warning">💡 Dica secreta:</span>
<span class="output-text">Há alguns comandos escondidos que não estão na lista do 'help'...</span>
<span class="output-text">Continue explorando! 🕵️‍♂️</span>`;

    this.terminal.addToOutput(easterEggsText, 'system');
  }
}
