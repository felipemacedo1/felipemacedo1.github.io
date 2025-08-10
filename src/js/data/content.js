// Static content data
export const CONTENT = {
  help: `
<span class="highlight">� Terminal Portfolio - Sistema de Ajuda</span>

<span class="success">🎯 Para iniciantes:</span>
<span class="info">help basic</span>      - Comandos essenciais (recomendado)
<span class="info">demo</span>            - Demonstração interativa das funcionalidades
<span class="info">start</span>           - Tour guiado para primeira visita

<span class="success">📂 Por categoria:</span>
<span class="info">help info</span>       - Informações pessoais (about, skills, experience...)
<span class="info">help github</span>     - Comandos relacionados ao GitHub
<span class="info">help fun</span>        - Easter eggs e comandos divertidos
<span class="info">help system</span>     - Comandos de sistema (ls, pwd, date...)
<span class="info">help themes</span>     - Sistema de temas disponíveis

<span class="success">🔧 Utilitários:</span>
<span class="info">popular</span>         - Comandos mais populares/úteis
<span class="info">random</span>          - Comando aleatório interessante
<span class="info">tips</span>            - Dicas avançadas de uso

<span class="success">📊 Sistema:</span>
<span class="info">help --all</span>      - Lista TODOS os comandos (completa)
<span class="info">history</span>         - Histórico de comandos da sessão
<span class="info">clear</span>           - Limpa a tela

<span class="warning">💡 Dica:</span> Use ↑/↓ para navegar no histórico, Tab para autocompletar
<span class="warning">⌨️ Atalhos:</span> Ctrl+L para limpar, Ctrl+C para interromper
<span class="success">🎊 Status:</span> ${typeof window !== 'undefined' && localStorage.getItem('commands-discovered') || 0} comandos descobertos!`,

  helpBasic: `
<span class="highlight">🎯 Comandos Essenciais - Comece Aqui!</span>

<span class="success">about</span> | <span class="success">1</span>       - 👨‍💻 Conheça quem eu sou
<span class="success">projects</span> | <span class="success">2</span>     - 🚀 Veja meus melhores projetos  
<span class="success">contact</span> | <span class="success">3</span>      - 📧 Como me encontrar
<span class="success">whoami</span>          - 💼 Resumo técnico profissional
<span class="success">contributions</span>   - 📊 Minha atividade no GitHub (IMPERDÍVEL!)
<span class="success">menu</span>            - 🎯 Menu principal navegável

<span class="highlight">🎨 Personalize sua experiência:</span>
<span class="success">theme matrix</span>    - 🕶️ Tema Matrix (favorito!)
<span class="success">theme hacker</span>    - 💀 Modo hacker
<span class="success">theme dark</span>      - 🌙 Tema escuro clássico

<span class="warning">✨ Próximo passo:</span> Digite <span class="success">demo</span> para ver funcionalidades incríveis!
<span class="info">💡 Ou explore com</span> <span class="success">popular</span> <span class="info">para comandos mais usados</span>`,

  helpInfo: `
<span class="highlight">👨‍� Comandos - Informações Pessoais</span>

<span class="success">about</span> | <span class="success">1</span>       - Apresentação completa  
<span class="success">whoami</span>          - Resumo técnico profissional
<span class="success">skills</span>          - Tecnologias com barras de progresso
<span class="success">experience</span>      - Timeline profissional detalhada
<span class="success">education</span>       - Formação acadêmica
<span class="success">certifications</span>  - Certificados e cursos
<span class="success">resume</span>          - Download do currículo (PDF)
<span class="success">status</span>          - Disponibilidade atual

<span class="warning">💡 Dica:</span> Comece com <span class="success">about</span> para uma visão geral!`,

  helpGithub: `
<span class="highlight">📊 Comandos - GitHub & Atividade</span>

<span class="success">contributions</span>   - 📈 Gráfico de contribuições GitHub interativo
<span class="success">growthfolio</span>     - 🌱 Sobre a organização GrowthFolio

<span class="warning">🚀 Destaque:</span> O comando <span class="success">contributions</span> mostra um gráfico interativo real da minha atividade no GitHub!`,

  helpFun: `
<span class="highlight">🎮 Easter Eggs & Comandos Divertidos</span>

<span class="success">coffee</span> | <span class="success">tdah</span>  - ☕ Diagnóstico TDAH/cafeína
<span class="success">h4x0r-mode</span>      - 💀 Ativar modo hacker
<span class="success">matrix</span>          - �️ Entrar na Matrix  
<span class="success">konami</span>          - 🎮 Código Konami clássico
<span class="success">glitch</span>          - ⚡ Efeito glitch visual
<span class="success">ascii</span>           - 🎨 Logo ASCII artístico
<span class="success">sudo</span>            - 🔐 Tentar acesso root (spoiler: não vai dar)
<span class="success">eastereggs</span>      - 🥚 Lista completa de easter eggs

<span class="warning">🎊 Dica secreta:</span> Há comandos ocultos não listados aqui... Continue explorando!`,

  helpSystem: `
<span class="highlight">🔧 Comandos do Sistema</span>

<span class="success">clear</span>           - 🧹 Limpa a tela
<span class="success">date</span>            - 📅 Data e hora atual
<span class="success">ls</span>              - 📁 Lista arquivos do "sistema"
<span class="success">ls -la</span>          - 📋 Lista detalhada de arquivos
<span class="success">pwd</span>             - 📍 Diretório atual
<span class="success">history</span>         - 📜 Histórico de comandos da sessão

<span class="warning">💡 Simulação:</span> Estes comandos simulam um ambiente Unix real!`,

  helpThemes: `
<span class="highlight">� Sistema de Temas</span>

<span class="success">theme dark</span>      - 🌙 Tema escuro (padrão)
<span class="success">theme light</span>     - ☀️ Tema claro
<span class="success">theme matrix</span>    - 🕶️ Tema Matrix verde
<span class="success">theme hacker</span>    - 💀 Tema hacker vermelho
<span class="success">theme retro</span>     - 📺 Tema retro laranja
<span class="success">theme contrast</span>  - ⚫ Alto contraste (acessibilidade)

<span class="warning">✨ Experimente:</span> <span class="success">theme matrix</span> para a experiência completa!
<span class="info">🔄 Troca instantânea:</span> As configurações são salvas automaticamente`,

  helpAll: `
<span class="highlight">📚 TODOS os Comandos - Lista Completa</span>

<span class="success">📋 Navegação Básica:</span>
help, clear, menu, about|1, projects|2, contact|3

<span class="success">💼 Informações Pessoais:</span>  
whoami, skills, experience, education, certifications, resume, status

<span class="success">📊 GitHub Activity:</span>
contributions, growthfolio

<span class="success">🔧 Sistema:</span>
date, ls, ls -la, pwd, history, sudo

<span class="success">🎨 Temas:</span>
theme dark/light/matrix/hacker/retro/contrast

<span class="success">🎮 Easter Eggs:</span>
coffee|tdah, h4x0r-mode, matrix, konami, glitch, ascii, eastereggs

<span class="success">🚀 Descoberta:</span>
demo, start, popular, random, tips

<span class="warning">⚠️ Lista extensa:</span> Use <span class="success">help basic</span> para comandos essenciais!
<span class="warning">💡 Dica:</span> Use ↑/↓ para histórico, Tab para autocompletar`,

  about: `
<span class="ascii-art align-center">
    ╔════════════════════════════════════╗
                 👨‍💻 SOBRE MIM            
    ╚════════════════════════════════════╝
</span>

<span class="highlight">🧑‍💻 Felipe Macedo</span>
<span class="output-text">Desenvolvedor Full Cycle | Foco em Back-end e Arquitetura</span>

<span class="success">🎓 Formação Acadêmica:</span>
• Cursando Bacharelado em Ciência da Computação (FMU - 2025 a 2029)
• Concluído Gestão da TI (Anhembi Morumbi - Agosto 2022 – Dezembro 2024)
• Bootcamps: AWS re/Start (2025), Full Stack Java (Generation Brasil)
• Certificações: Azure AZ-900, Blockchain com Solidity

<span class="success">💼 Experiência Profissional:</span>
• Analista de Sistemas - Sansuy S.A. (Java, JavaFX, Spring Boot)
• Backend Developer - Asapcard (Go, microserviços financeiros)
• Trainee Developer - Generation Brasil (Bootcamp Full Stack)

<span class="success">🛠️ Tecnologias que domino:</span>
• Java (8+), Spring Boot, Spring Security, JPA/Hibernate, JavaFX
• Go (Gorilla Mux, GORM), APIs REST, microserviços
• PostgreSQL, SQL Server, MongoDB, Redis, Docker, GitHub Actions
• HTML, CSS, TypeScript, React (para UIs completas)

<span class="success">🚀 Destaques:</span>
• Sistemas escaláveis com foco em performance e manutenção
• Arquiteturas baseadas em microsserviços e eventos
• Autenticação OAuth2, JWT, WebSockets e CI/CD com GitHub Actions

<span class="warning">💡 Curiosidade:</span> Sou apaixonado por sistemas financeiros, criptografia, automação e terminal retrô. E sim, café move código ☕.`,

  contact: `
<span class="ascii-art align-center">
    ╔═══════════════════════════════════════╗
            💬 CONECTE-SE COMIGO            
    ╚═══════════════════════════════════════╝
</span>

<span class="highlight">🚀 Canais Principais:</span>

<div class="contact-item">
<span class="contact-label">📧 Email:</span> <a href="mailto:contato.dev.macedo@gmail.com" class="project-link">contato.dev.macedo@gmail.com</a>
<span class="output-text">   └─ Resposta em até 24h • Projetos e oportunidades</span>
</div>

<div class="contact-item">
<span class="contact-label">💼 LinkedIn:</span> <a href="https://linkedin.com/in/felipemacedo1" target="_blank" rel="noopener noreferrer" class="project-link">linkedin.com/in/felipemacedo1</a>
<span class="output-text">   └─ Networking profissional • Atualizações de carreira</span>
</div>

<div class="contact-item">
<span class="contact-label">🐙 GitHub:</span> <a href="https://github.com/felipemacedo1" target="_blank" rel="noopener noreferrer" class="project-link">github.com/felipemacedo1</a>
<span class="output-text">   └─ Código aberto • Contribuições • Projetos pessoais</span>
</div>

<div class="contact-item">
<span class="contact-label">📱 WhatsApp:</span> <a href="https://wa.me/5511997534105" target="_blank" rel="noopener noreferrer" class="project-link">+55 (11) 99753-4105</a>
<span class="output-text">   └─ Contato direto • Projetos • Consultoria</span>
</div>

<span class="highlight">🏢 Organizações:</span>

<div class="contact-item">
<span class="contact-label">🌐 Growthfolio:</span> <a href="https://github.com/orgs/growthfolio" target="_blank" rel="noopener noreferrer" class="project-link">github.com/orgs/growthfolio</a>
<span class="output-text">   └─ Projetos open source • Bibliotecas • Microserviços</span>
</div>

<span class="highlight">💼 Disponibilidade:</span>

<div class="project-item">
<span class="success">� DISPONIBILIDADE LIMITADA:</span>
<span class="output-text">• Indisponível trabalho/estudo durante a semana</span>
<span class="output-text">• Freelances apenas finais de semana</span>
<span class="output-text">• Contribuições open source</span>
<span class="output-text">• Networking e mentoria técnica</span>
</div>

<span class="highlight">📍 Informações Gerais:</span>

<span class="output-text">🌎 <strong>Localização:</strong> Itapecerica da Serra - São Paulo, Brasil</span>
<span class="output-text">⏰ <strong>Fuso horário:</strong> GMT-3 (Brasília) • Finais de semana disponível</span>
<span class="output-text">🗣️ <strong>Idiomas:</strong> Português (nativo) • Inglês (intermediário)</span>
<span class="output-text">🎓 <strong>Status:</strong> Estudante de Ciência da Computação</span>

<span class="ascii-art align-center">
    ╔═══════════════════════════════════════╗
    ║  🚀 Vamos construir algo incrível!    ║
    ╚═══════════════════════════════════════╝
</span>`
};

