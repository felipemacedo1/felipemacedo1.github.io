# 🚀 Plano de Migração - Content Service Centralizado

> **Objetivo**: Migrar Terminal Desktop e Mobile BIOS para consumir dados do `content.json` através de um Content Service único

---

## 📋 Visão Geral da Migração

### **Escopo Total**
- ✅ Arquivo `content.json` criado
- ⬜ Content Service implementado
- ⬜ 10 categorias migradas (meta, contact, education, experience, skills, certifications, projects, availability, commands, themes)
- ⬜ Dados hard-coded removidos
- ⬜ Testes de integração

### **Dependências Críticas**
1. **Content Service** deve existir antes de qualquer migração
2. **Testes unitários** do Content Service antes de migrar componentes
3. **Migração incremental** por categoria para evitar quebras

---

## 🏗️ FASE 1: Infraestrutura Base

### **1.1 Content Service Core**
⬜ **Criar** `src/js/services/ContentService.js`
- Carregar `content.json` via fetch
- Cache em memória após primeiro carregamento
- Tratamento de erros e fallbacks
- Métodos base: `load()`, `isLoaded()`, `getAll()`

⬜ **Implementar** métodos helpers por categoria:
```javascript
// Métodos obrigatórios
getMeta()
getContact() 
getEducation()
getExperience()
getSkills()
getCertifications()
getProjects()
getAvailability()
getCommands()     // source: desktop only
getThemes()       // source: desktop only
getAnalytics()
getTexts()
```

⬜ **Implementar** filtro por source:
```javascript
// Filtrar dados por plataforma
filterBySource(data, platform) // 'desktop' | 'mobile' | 'both'
```

⬜ **Criar** testes unitários para Content Service
- Teste de carregamento do JSON
- Teste de cada método helper
- Teste de filtros por source
- Teste de fallbacks em caso de erro

### **1.2 Integração Base**
⬜ **Adicionar** Content Service ao `main.js` (Desktop)
⬜ **Adicionar** Content Service ao `mobile-bios.js` (Mobile)
⬜ **Verificar** carregamento sem quebrar funcionalidades existentes

---

## 🎯 FASE 2: Migração por Categoria

### **2.1 META (Prioridade: ALTA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/data/content.js`:
- Substituir dados hard-coded de nome, título, localização
- Usar `ContentService.getMeta()`

⬜ **Migrar** `src/js/commands/BasicCommands.js`:
- Método `whoami()` usar `ContentService.getTexts().whoami`
- Método `showAbout()` usar `ContentService.getTexts().about`

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Header principal usar `ContentService.getMeta()`
- Subtitle usar `ContentService.getMeta().title`

#### Arquivos Afetados
- `src/js/data/content.js`
- `src/js/commands/BasicCommands.js`
- `src/js/mobile-bios.js`
- `index.html` (meta tags)
- `mobile.html` (meta tags)

### **2.2 CONTACT (Prioridade: ALTA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/data/content.js`:
- Seção `contact` usar `ContentService.getContact()`
- Filtrar WhatsApp apenas para desktop

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('contact')` usar `ContentService.getContact()`
- Excluir WhatsApp automaticamente (source: desktop)

#### Arquivos Afetados
- `src/js/data/content.js`
- `src/js/mobile-bios.js`

### **2.3 SKILLS (Prioridade: ALTA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/commands/AdditionalCommands.js`:
- Método `showSkills()` usar `ContentService.getSkills()`
- Renderizar barras de progresso com percentuais do JSON

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('skills')` usar `ContentService.getSkills()`
- Método `createSkillBadges()` usar dados do JSON
- Incluir percentuais (antes ausentes no mobile)

#### Arquivos Afetados
- `src/js/commands/AdditionalCommands.js`
- `src/js/mobile-bios.js`

### **2.4 EXPERIENCE (Prioridade: MÉDIA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/commands/AdditionalCommands.js`:
- Método `showExperience()` usar `ContentService.getExperience()`
- Renderizar timeline com dados estruturados

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('experience')` usar `ContentService.getExperience()`
- Usar mesma estrutura de dados do desktop

#### Arquivos Afetados
- `src/js/commands/AdditionalCommands.js`
- `src/js/mobile-bios.js`

### **2.5 EDUCATION (Prioridade: MÉDIA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/commands/AdditionalCommands.js`:
- Método `showEducation()` usar `ContentService.getEducation()`
- Separar educação formal de bootcamps

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('education')` usar `ContentService.getEducation()`
- Renderizar educação formal + bootcamps

#### Arquivos Afetados
- `src/js/commands/AdditionalCommands.js`
- `src/js/mobile-bios.js`

### **2.6 CERTIFICATIONS (Prioridade: MÉDIA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/commands/AdditionalCommands.js`:
- Método `showCertifications()` usar `ContentService.getCertifications()`
- Agrupar por categoria (cloud, blockchain, development, management)

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('certifications')` usar `ContentService.getCertifications()`
- Usar mesma categorização do desktop

#### Arquivos Afetados
- `src/js/commands/AdditionalCommands.js`
- `src/js/mobile-bios.js`

### **2.7 PROJECTS (Prioridade: MÉDIA)**

#### Desktop Terminal
⬜ **Migrar** comandos de projetos:
- Usar `ContentService.getProjects()`
- Filtrar projetos featured
- Incluir links do GitHub quando disponíveis

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('projects')` usar `ContentService.getProjects()`
- Método `createProjectCards()` usar dados estruturados
- Seção GitHub usar projetos featured

#### Arquivos Afetados
- `src/js/commands/BasicCommands.js` (comando projects)
- `src/js/mobile-bios.js`

### **2.8 AVAILABILITY (Prioridade: BAIXA)**

#### Desktop Terminal
⬜ **Migrar** `src/js/commands/AdditionalCommands.js`:
- Método `showStatus()` usar `ContentService.getAvailability()`
- Incluir horários e limitações

#### Mobile BIOS
⬜ **Migrar** `src/js/mobile-bios.js`:
- Método `getActionContent('status')` usar `ContentService.getAvailability()`
- Sincronizar dados de disponibilidade

#### Arquivos Afetados
- `src/js/commands/AdditionalCommands.js`
- `src/js/mobile-bios.js`

### **2.9 COMMANDS (Prioridade: BAIXA - Desktop Only)**

#### Desktop Terminal
⬜ **Migrar** sistema de help:
- `src/js/data/content.js` usar `ContentService.getCommands()`
- Gerar help dinamicamente baseado no JSON
- Manter aliases e descrições

⬜ **Migrar** `src/js/commands/BasicCommands.js`:
- Métodos de help usar dados do JSON
- Validação de comandos baseada no JSON

#### Arquivos Afetados
- `src/js/data/content.js`
- `src/js/commands/BasicCommands.js`

### **2.10 THEMES (Prioridade: BAIXA - Desktop Only)**

#### Desktop Terminal
⬜ **Migrar** `src/js/features/ThemeManager.js`:
- Lista de temas usar `ContentService.getThemes()`
- Descrições e configurações do JSON

#### Arquivos Afetados
- `src/js/features/ThemeManager.js`
- Sistema de help para temas

---

## 🧪 FASE 3: Testes e Validação

### **3.1 Testes de Integração**
⬜ **Testar** cada categoria migrada:
- Desktop: todos os comandos funcionando
- Mobile: todas as seções carregando
- Dados consistentes entre plataformas

⬜ **Testar** cenários de erro:
- content.json não encontrado
- JSON malformado
- Fallbacks funcionando

### **3.2 Testes de Performance**
⬜ **Verificar** tempo de carregamento:
- Cache do Content Service funcionando
- Sem múltiplas requisições ao JSON
- Carregamento assíncrono não bloqueante

### **3.3 Testes de Consistência**
⬜ **Validar** dados entre plataformas:
- Mesmos textos em desktop e mobile
- Skills com percentuais em ambos
- Contatos consistentes (exceto WhatsApp)

---

## 🧹 FASE 4: Limpeza e Otimização

### **4.1 Remoção de Código Legacy**
⬜ **Remover** dados hard-coded:
- `src/js/data/content.js` - manter apenas estrutura
- Textos duplicados em comandos
- Dados espalhados em mobile-bios.js

⬜ **Limpar** imports desnecessários:
- Remover imports de dados antigos
- Consolidar imports do Content Service

### **4.2 Documentação**
⬜ **Atualizar** README.md:
- Documentar Content Service
- Explicar estrutura do content.json
- Guia para adicionar novos dados

⬜ **Criar** JSDoc:
- Documentar métodos do Content Service
- Exemplos de uso
- Tipos de retorno

---

## 📊 Resumo de Arquivos Impactados

### **Novos Arquivos**
- ✅ `content.json`
- ⬜ `src/js/services/ContentService.js`
- ⬜ `src/js/services/ContentService.test.js`

### **Desktop - Arquivos Modificados**
- ⬜ `src/js/main.js` (integração)
- ⬜ `src/js/data/content.js` (migração)
- ⬜ `src/js/commands/BasicCommands.js` (about, whoami, projects)
- ⬜ `src/js/commands/AdditionalCommands.js` (skills, experience, education, certifications, status)
- ⬜ `src/js/features/ThemeManager.js` (temas)
- ⬜ `index.html` (meta tags)

### **Mobile - Arquivos Modificados**
- ⬜ `src/js/mobile-bios.js` (todas as seções)
- ⬜ `mobile.html` (meta tags)

### **Total de Arquivos**: 11 arquivos modificados + 2 novos

---

## ⚡ Ordem de Execução Recomendada

1. **🏗️ FASE 1** - Content Service (obrigatório primeiro)
2. **🎯 Meta + Contact** (dados críticos)
3. **🎯 Skills** (maior impacto visual)
4. **🎯 Experience + Education** (conteúdo principal)
5. **🎯 Certifications + Projects** (portfólio)
6. **🎯 Availability** (informações secundárias)
7. **🎯 Commands + Themes** (funcionalidades específicas)
8. **🧪 FASE 3** - Testes completos
9. **🧹 FASE 4** - Limpeza final

---

## 🎯 Critérios de Sucesso

- ✅ Zero dados hard-coded restantes
- ✅ Consistência 100% entre desktop e mobile
- ✅ Performance mantida ou melhorada
- ✅ Facilidade para adicionar novos dados
- ✅ Testes passando em todas as categorias
- ✅ Documentação atualizada

**Estimativa Total**: ~15-20 horas de desenvolvimento incremental