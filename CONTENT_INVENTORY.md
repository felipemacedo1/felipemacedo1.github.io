# 📊 Portfolio Content Data Inventory

> **Objetivo**: Mapeamento centralizado de todos os dados de conteúdo utilizados no sistema de portfólio (Terminal Desktop + Mobile BIOS)

---

## 🏗️ Estrutura Atual vs. Ideal

### ❌ **Situação Atual**
- Dados hard-coded espalhados em múltiplos arquivos
- Redundância entre versões desktop e mobile
- Atualizações requerem edição em vários locais
- Inconsistências entre plataformas

### ✅ **Situação Ideal (Pós-Centralização)**
- Arquivo único `content.json` como fonte da verdade
- Dados consumidos dinamicamente por ambas as versões
- Atualizações centralizadas e automáticas
- Consistência garantida entre plataformas

---

## 📋 Inventário de Dados por Categoria

### 1. **META & CONFIGURAÇÕES**

#### 1.1 Informações Básicas
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Nome Completo | "Felipe Macedo" | Desktop: `about`, `whoami`, `contact`<br>Mobile: Header, About section | ✅ Consistente |
| Título Profissional | "Desenvolvedor Full Cycle" / "Full Stack Developer" | Desktop: `about`, `whoami`<br>Mobile: Subtitle | ⚠️ Variações diferentes |
| Especialização | "Foco em Back-end e Arquitetura" | Desktop: `about`<br>Mobile: About section | ✅ Consistente |
| Localização | "São Paulo, Brasil" / "Brazil" | Desktop: `contact`, `status`<br>Mobile: Contact, Status | ⚠️ Formato inconsistente |
| Fuso Horário | "UTC-3 (BRT)" / "GMT-3 (Brasília)" | Desktop: `contact`, `status`<br>Mobile: Status | ⚠️ Formato inconsistente |
| Status Atual | "Empregado + Estudante" | Desktop: `status`<br>Mobile: Status | ✅ Consistente |

#### 1.2 Links e Contatos
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Email Principal | "contato.dev.macedo@gmail.com" | Desktop: `contact`<br>Mobile: Contact section | ✅ Consistente |
| LinkedIn | "linkedin.com/in/felipemacedo1" | Desktop: `contact`<br>Mobile: Contact, Quick Actions | ✅ Consistente |
| GitHub Principal | "github.com/felipemacedo1" | Desktop: `contact`, `github`<br>Mobile: Contact, GitHub section | ✅ Consistente |
| WhatsApp | "+55 (11) 99753-4105" | Desktop: `contact` | ❌ Ausente no mobile |
| Organização GitHub | "github.com/orgs/growthfolio" | Desktop: `growthfolio`, `contact`<br>Mobile: Quick Actions | ✅ Consistente |

### 2. **FORMAÇÃO ACADÊMICA**

#### 2.1 Educação Formal
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Graduação Atual | "Bacharelado em Ciência da Computação (FMU - 2025 a 2029)" | Desktop: `about`, `education`<br>Mobile: Education section | ✅ Consistente |
| Graduação Concluída | "Gestão da TI (Anhembi Morumbi - Agosto 2022 – Dezembro 2024)" | Desktop: `about`, `education`<br>Mobile: Education section | ✅ Consistente |

#### 2.2 Bootcamps e Cursos
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| AWS re/Start | "2025" | Desktop: `about`, `education`<br>Mobile: Education section | ✅ Consistente |
| Generation Brasil | "Full Stack Java (2023)" | Desktop: `about`, `education`, `experience`<br>Mobile: Education, Experience | ✅ Consistente |

### 3. **EXPERIÊNCIA PROFISSIONAL**

#### 3.1 Trabalhos Atuais/Recentes
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Emprego Atual | "Analista de Sistemas - Sansuy S.A. (Março 2025 - presente)" | Desktop: `about`, `experience`<br>Mobile: Experience section | ✅ Consistente |
| Descrição Sansuy | "Java, JavaFX, Spring Boot, SQL Server, SVN, ERP corporativo" | Desktop: `about`, `experience`<br>Mobile: Experience section | ✅ Consistente |
| Emprego Anterior | "Backend Developer - Asapcard (Fevereiro 2024 - Agosto 2024)" | Desktop: `about`, `experience`<br>Mobile: Experience section | ✅ Consistente |
| Descrição Asapcard | "Go, microserviços financeiros, APIs performance e segurança" | Desktop: `about`, `experience`<br>Mobile: Experience section | ✅ Consistente |

### 4. **HABILIDADES TÉCNICAS**

#### 4.1 Backend Technologies
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Java | "Expert (90%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| Go | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| Spring Boot | "Expert (85%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| PostgreSQL | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| SQL Server | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| MongoDB | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| Redis | "Intermediate (75%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |

#### 4.2 Frontend & Web
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| JavaScript | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges, Language stats | ⚠️ Percentual só no desktop |
| HTML/CSS | "Expert (85%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| React | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| TypeScript | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |

#### 4.3 DevOps & Cloud
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Docker | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| AWS | "Intermediate (70%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| GitHub Actions | "Advanced (80%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |
| Linux | "Expert (85%)" | Desktop: `skills`<br>Mobile: Skills badges | ⚠️ Percentual só no desktop |

### 5. **CERTIFICAÇÕES**

#### 5.1 Cloud & Infrastructure
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Azure AZ-900 | "Microsoft, 2023" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |
| AWS re/Start Graduate | "Amazon Web Services, 2025" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |

#### 5.2 Blockchain & Web3
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Blockchain e Solidity | "DIO, 2024" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |

#### 5.3 Desenvolvimento
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Java Full Stack Developer | "Generation Brasil, 2023" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |
| Desenvolvedor Web Full Stack Junior | "Generation Brasil, 2024" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |
| Introdução à Programação - Front-End | "Proz + Meta + AWS, 2023" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |

#### 5.4 Gerenciamento
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Fundamentos do Gerenciamento de Projetos | "Google, 2024" | Desktop: `certifications`<br>Mobile: Certifications section | ✅ Consistente |

### 6. **PROJETOS**

#### 6.1 Projetos Principais
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Terminal Portfolio | "JavaScript, CSS3, HTML5 - Interactive terminal-style portfolio website" | Desktop: `projects`<br>Mobile: Projects section, GitHub repos | ✅ Consistente |
| PriceFeed API | "Go, PostgreSQL, Redis - Cryptocurrency price monitoring API" | Desktop: `projects`<br>Mobile: Projects section | ✅ Consistente |
| GPT Service Go | "Go, OpenAI API, Docker - Microservice integrating with OpenAI GPT" | Desktop: `projects`<br>Mobile: Projects section | ✅ Consistente |
| Spring MCD Wallet | "Java, Spring Framework, bitcoinj - Modular Bitcoin wallet with SPV" | Desktop: `projects`<br>Mobile: Projects section, GitHub repos | ✅ Consistente |

### 7. **DISPONIBILIDADE & STATUS**

#### 7.1 Disponibilidade Atual
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Status Geral | "DISPONIBILIDADE LIMITADA" | Desktop: `contact`, `status`<br>Mobile: Status section | ✅ Consistente |
| Trabalho Semana | "Indisponível trabalho/estudo durante a semana" | Desktop: `contact`, `status`<br>Mobile: Status section | ✅ Consistente |
| Freelances | "Freelances apenas finais de semana" | Desktop: `contact`, `status`<br>Mobile: Status section | ✅ Consistente |
| Horário Freelance | "Segunda a Sexta: 18h - 22h, Fins de semana: 9h - 17h" | Desktop: `status`<br>Mobile: Status section | ✅ Consistente |

### 8. **COMANDOS E INTERFACE**

#### 8.1 Comandos do Terminal
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Comandos Básicos | "help, clear, about, projects, contact, whoami, etc." | Desktop: Sistema de comandos | ❌ Não aplicável ao mobile |
| Aliases | "1 → about, 2 → projects, 3 → contact" | Desktop: Sistema de comandos | ❌ Não aplicável ao mobile |
| Easter Eggs | "coffee, matrix, konami, glitch, ascii, etc." | Desktop: Sistema de comandos | ❌ Não aplicável ao mobile |

#### 8.2 Temas
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Temas Disponíveis | "dark, light, matrix, hacker, retro, contrast" | Desktop: Sistema de temas | ❌ Mobile usa tema fixo |

### 9. **TEXTOS DE AJUDA E INSTRUÇÕES**

#### 9.1 Sistema de Help
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Help Principal | Texto extenso com categorias e comandos | Desktop: `help` command | ❌ Não aplicável ao mobile |
| Help Básico | Comandos essenciais para iniciantes | Desktop: `help basic` | ❌ Não aplicável ao mobile |
| Help por Categoria | info, github, fun, system, themes | Desktop: `help [categoria]` | ❌ Não aplicável ao mobile |

### 10. **DADOS DINÂMICOS E ESTATÍSTICAS**

#### 10.1 GitHub Analytics
| **Dado** | **Valor Atual** | **Local de Uso** | **Observações** |
|----------|-----------------|------------------|-----------------|
| Contribuições | Dados dos arquivos analytics/*.json | Desktop: `contributions`<br>Mobile: GitHub section | ✅ Fonte compartilhada |
| Repositórios | "32 repositories" | Desktop: GitHub stats<br>Mobile: GitHub stats | ✅ Consistente |
| Linguagens | "JavaScript 42.3%, Go 28.7%, Java 18.2%" | Desktop: GitHub stats<br>Mobile: Language stats | ✅ Consistente |

---

## 🔍 Análise de Redundâncias e Inconsistências

### ❌ **Problemas Identificados**

1. **Inconsistências de Formato**:
   - Localização: "São Paulo, Brasil" vs "Brazil"
   - Fuso horário: "UTC-3 (BRT)" vs "GMT-3 (Brasília)"
   - Título profissional: variações entre seções

2. **Dados Ausentes no Mobile**:
   - WhatsApp não aparece na versão mobile
   - Percentuais de skills ausentes no mobile
   - Sistema de comandos e easter eggs exclusivos do desktop

3. **Redundância de Código**:
   - Textos de about/whoami repetidos em múltiplos arquivos
   - Listas de skills duplicadas entre desktop e mobile
   - Informações de contato espalhadas

4. **Manutenção Complexa**:
   - Atualizar um projeto requer edição em 4+ locais
   - Adicionar certificação requer edição em múltiplos arquivos
   - Risco de inconsistências ao atualizar

### ✅ **Pontos Positivos**

1. **Dados Bem Estruturados**:
   - Experiência profissional bem organizada
   - Certificações categorizadas adequadamente
   - Projetos com descrições consistentes

2. **Fonte Única para Analytics**:
   - Arquivos JSON centralizados para dados do GitHub
   - Ambas as versões consomem a mesma fonte

---

## 🎯 Recomendações para Centralização

### 1. **Estrutura do content.json Proposto**

```json
{
  "meta": {
    "name": "Felipe Macedo",
    "title": "Desenvolvedor Full Cycle",
    "specialization": "Foco em Back-end e Arquitetura",
    "location": {
      "city": "São Paulo",
      "country": "Brasil",
      "timezone": "UTC-3",
      "timezoneLabel": "Brasília"
    },
    "status": "Empregado + Estudante"
  },
  "contact": {
    "email": "contato.dev.macedo@gmail.com",
    "linkedin": "linkedin.com/in/felipemacedo1",
    "github": "github.com/felipemacedo1",
    "whatsapp": "+55 (11) 99753-4105",
    "organization": "github.com/orgs/growthfolio"
  },
  "education": [...],
  "experience": [...],
  "skills": [...],
  "certifications": [...],
  "projects": [...],
  "availability": {...}
}
```

### 2. **Prioridades de Migração**

1. **Alta Prioridade** (dados críticos e inconsistentes):
   - Informações pessoais e contato
   - Skills com percentuais
   - Textos de apresentação (about/whoami)

2. **Média Prioridade** (dados estáveis mas duplicados):
   - Experiência profissional
   - Certificações
   - Projetos

3. **Baixa Prioridade** (dados específicos de plataforma):
   - Comandos do terminal
   - Temas
   - Easter eggs

### 3. **Benefícios da Centralização**

- ✅ **Consistência garantida** entre desktop e mobile
- ✅ **Manutenção simplificada** - uma única fonte da verdade
- ✅ **Facilidade de atualização** - editar apenas um arquivo
- ✅ **Redução de bugs** - elimina inconsistências
- ✅ **Escalabilidade** - fácil adicionar novas plataformas
- ✅ **Versionamento** - controle de mudanças centralizado

---

## 📊 Resumo Executivo

| **Categoria** | **Total de Dados** | **Consistentes** | **Inconsistentes** | **Ausentes Mobile** |
|---------------|-------------------|------------------|-------------------|-------------------|
| Meta & Config | 6 | 3 | 3 | 0 |
| Contatos | 5 | 4 | 0 | 1 |
| Educação | 4 | 4 | 0 | 0 |
| Experiência | 4 | 4 | 0 | 0 |
| Skills Backend | 7 | 0 | 7 | 0 |
| Skills Frontend | 4 | 0 | 4 | 0 |
| Skills DevOps | 4 | 0 | 4 | 0 |
| Certificações | 8 | 8 | 0 | 0 |
| Projetos | 4 | 4 | 0 | 0 |
| Disponibilidade | 4 | 4 | 0 | 0 |
| **TOTAL** | **50** | **31 (62%)** | **18 (36%)** | **1 (2%)** |

**Conclusão**: 38% dos dados apresentam algum tipo de problema (inconsistência ou ausência), justificando plenamente a necessidade de centralização.