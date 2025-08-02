# 📋 Changelog - Terminal Portfolio

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-08-01

### 🔧 Fixed
- **Mobile Navigation**: Corrigido problema do botão "Back" que não fechava os detail cards na interface BIOS mobile
- **State Management**: Implementado rastreamento adequado do estado `isDetailViewOpen` para melhor controle de navegação
- **Animation Flow**: Corrigida animação `slide-out` para fechamento suave dos detail views

### 📚 Documentation
- **README.md**: Atualizado para versão 2.1.0 com documentação completa dos 25+ comandos
- **Feature Coverage**: Documentação detalhada do sistema dual (desktop/mobile)
- **Architecture**: Especificações técnicas aprimoradas da arquitetura modular

### 🏗️ Implementation
- **hideDetailView()**: Novo método dedicado para fechamento correto dos detail views
- **Event Handling**: Melhorado sistema de navegação entre views no mobile
- **Code Quality**: Refatoração para maior clareza e manutenibilidade

## [2.0.0] - 2025-07-31

### 🚀 Major Features
- **Dual Platform Architecture**: Sistema completo desktop + mobile com detecção automática
- **Terminal Desktop Interface**: 25+ comandos interativos funcionais
- **Mobile BIOS Interface**: Interface Android Material Design completa
- **Smart Device Detection**: Redirecionamento automático baseado no dispositivo

### 🖥️ Desktop (Terminal)
- **Command System**: 25+ comandos implementados (help, about, projects, skills, etc.)
- **Theme System**: 6 temas completos (dark, light, matrix, hacker, retro, contrast)
- **Easter Eggs**: 8 easter eggs funcionais (coffee, h4x0r-mode, matrix, etc.)
- **Auto-complete**: Sistema inteligente de sugestões com Tab
- **Command History**: Navegação com setas ↑↓
- **Keyboard Shortcuts**: Ctrl+L (clear), Ctrl+C (cancel)

### 📱 Mobile (BIOS)
- **Boot Sequence**: Animação de inicialização simulando BIOS Android
- **Material Design**: Cores teal (#03DAC6) e purple (#BB86FC)
- **Touch Navigation**: Interface otimizada para toque
- **Status Bar**: Exibe hora atual e nível de bateria
- **Detail Views**: Visualização detalhada de cada seção
- **Grid Navigation**: Menu organizado em categorias

### 🔄 Smart System
- **Device Detection**: Análise automática de User Agent, touch e screen size
- **Automatic Redirect**: Mobile → BIOS, Desktop → Terminal
- **Cross Navigation**: Botões para alternar entre versões
- **URL Override**: `?desktop=true` força versão desktop no mobile

### 🏗️ Architecture
- **ES6 Modules**: Arquitetura modular com imports/exports nativos
- **Command Pattern**: Sistema de comandos registrados dinamicamente
- **Single Responsibility**: Classes focadas e bem definidas
- **Zero Dependencies**: Funciona sem bibliotecas externas

### 📚 Documentation
- **README.md**: Documentação completa principal
- **MOBILE-README.md**: Guia específico da versão mobile
- **JS Documentation**: READMEs modulares para cada seção
- **Test Interface**: Arquivo de teste de comandos

### 🎨 Styling
- **CSS Modular**: Arquitetura CSS organizada em módulos
- **Custom Properties**: Variáveis CSS para temas
- **Responsive Design**: Adaptação fluida para diferentes telas
- **Animations**: Transições suaves e efeitos visuais

## [1.0.0] - 2025-07-01

### 🎯 Initial Release
- **Basic Terminal**: Interface terminal simples
- **Core Commands**: Comandos básicos implementados
- **Single Platform**: Versão apenas desktop
- **Foundation**: Base sólida para expansão futura

---

## 📝 Legendas

- 🚀 **Major**: Grandes funcionalidades ou mudanças de arquitetura
- ✨ **Added**: Novas funcionalidades
- 🔧 **Fixed**: Correções de bugs
- 📚 **Documentation**: Melhorias na documentação
- 🏗️ **Implementation**: Detalhes técnicos de implementação
- 🎨 **Styling**: Mudanças visuais e de interface
- ⚡ **Performance**: Melhorias de performance
- 🔄 **Changed**: Mudanças em funcionalidades existentes

---

## 🔗 Links Úteis

- **Repository**: [https://github.com/felipemacedo1/felipemacedo1.github.io](https://github.com/felipemacedo1/felipemacedo1.github.io)
- **Live Demo**: [https://felipemacedo1.github.io/static-port/](https://felipemacedo1.github.io/static-port/)
- **Mobile Version**: [https://felipemacedo1.github.io/static-port/mobile.html](https://felipemacedo1.github.io/static-port/mobile.html)
- **Issues**: [https://github.com/felipemacedo1/felipemacedo1.github.io/issues](https://github.com/felipemacedo1/felipemacedo1.github.io/issues)
