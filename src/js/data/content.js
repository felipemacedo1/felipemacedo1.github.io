// Static content data
export const CONTENT = {
  help: `
<span class="highlight">📚 Comandos disponíveis:</span>

<span class="success">help</span>           - Mostra esta ajuda
<span class="success">clear</span>          - Limpa a tela
<span class="success">menu</span>           - Menu principal
<span class="success">about</span> | <span class="success">1</span>     - Sobre mim
<span class="success">projects</span> | <span class="success">2</span>   - Meus projetos
<span class="success">contact</span> | <span class="success">3</span>    - Informações de contato

<span class="highlight">🔧 Comandos extras:</span>
<span class="success">whoami</span>         - Quem sou eu?
<span class="success">skills</span>         - Tecnologias e níveis
<span class="success">experience</span>     - Timeline profissional
<span class="success">education</span>      - Formação acadêmica
<span class="success">certifications</span> - Certificados e cursos
<span class="success">resume</span>         - Download do currículo
<span class="success">status</span>         - Disponibilidade atual
<span class="success">date</span>           - Data e hora atual
<span class="success">ls</span>             - Lista arquivos
<span class="success">pwd</span>            - Diretório atual
<span class="success">sudo</span>           - Tentar privilégios de admin
<span class="success">theme dark/light/matrix/hacker/retro/contrast</span> - Mudar tema
<span class="success">coffee</span> | <span class="success">tdah</span> - Diagnóstico TDAH/cafeína

<span class="highlight">📊 GitHub Activity:</span>
<span class="success">contributions</span>  - Gráfico de contribuições GitHub
<span class="success">contrib</span>        - Alias para contributions
<span class="success">activity</span>       - Estatísticas de commits
<span class="success">stats</span>          - Estatísticas detalhadas

<span class="highlight">🎮 Easter eggs:</span>
<span class="success">h4x0r-mode</span>     - Modo hacker
<span class="success">matrix</span>         - Entre na Matrix
<span class="success">konami</span>         - Código Konami
<span class="success">glitch</span>         - Efeito glitch
<span class="success">ascii</span>          - Logo ASCII
<span class="success">growthfolio</span>    - Organização no GitHub
<span class="success">eastereggs</span>     - Lista de ovos de páscoa

<span class="warning">💡 Dica:</span> Use ↑/↓ para navegar no histórico, Tab para autocompletar
<span class="warning">⌨️ Atalhos:</span> Ctrl+L para limpar, Ctrl+C para interromper`,

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

