#!/bin/bash

# Script para commitar todas as alterações usando conventional commits
# Agrupa por tipo de implementação, excluindo diretório docs

echo "🚀 Iniciando processo de commit das alterações..."

# Configurar Git para usar a branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Branch atual: $CURRENT_BRANCH"

# Adicionar todos os arquivos exceto docs/
git add . --ignore-errors

# Remove docs/ do staging se estiver lá
git reset docs/ 2>/dev/null || true

echo "📦 Arquivos preparados para commit (excluindo docs/)"

# Commit 1: Refatoração da estrutura de arquivos
echo "🔧 Commit 1: Refatoração da estrutura de arquivos"
git commit -m "refactor: reorganize project structure to src/ directory

- Move all JavaScript files to src/js/ with better organization
- Move all CSS files to src/css/ with modular structure
- Consolidate mobile BIOS interface in src/js/mobile-bios.js
- Improve file organization for better maintainability
- Remove legacy files and consolidate duplicates

BREAKING CHANGE: File paths changed from root to src/ structure"

# Commit 2: Implementação do sistema de widgets de contribuição
echo "🎨 Commit 2: Implementação do sistema de widgets"
git commit -m "feat: implement unified contribution widget system

- Add UnifiedContributionWidget.js for mobile-optimized contribution graphs
- Implement ContributionWidget.js with multiple size/theme support
- Add EnhancedContributionGraph.js with full-featured analytics
- Create ContributionGraph.js as base functionality
- Support for mobile, terminal, and BIOS themes
- Add horizontal scrolling monthly cards for better mobile UX

Features:
- Real-time GitHub analytics integration
- Multiple themes (GitHub, Terminal, BIOS)
- Responsive design with mobile-first approach
- Tooltip system for enhanced user interaction"

# Commit 3: Melhorias na interface mobile BIOS
echo "📱 Commit 3: Melhorias na interface mobile"
git commit -m "feat: enhance mobile BIOS interface with comprehensive menus

- Implement Experience menu with professional timeline
- Add Certifications menu with categorized qualifications
- Enhance Status dashboard with dynamic GitHub API integration
- Add real-time version fetching from GitHub releases
- Improve timestamp formatting with full year display
- Add loading states and error handling for API calls

Features:
- Dynamic version from GitHub releases API
- Enhanced timestamp format (YYYY-MM-DD HH:MM)
- Professional Experience and Certifications display
- Real-time system status monitoring
- Improved error handling and fallback mechanisms"

# Commit 4: Implementação de features avançadas
echo "⚡ Commit 4: Features avançadas"
git commit -m "feat: implement advanced terminal and mobile features

- Add AutoComplete.js with intelligent command suggestions
- Implement ThemeManager.js with multiple theme support
- Add DeviceDetector.js for automatic mobile/desktop detection
- Create Storage.js utilities for persistent data management
- Enhance main.js with loading screens and device redirection

Features:
- Smart autocomplete with relevance scoring
- Multiple theme variations (dark, light, matrix, hacker, retro)
- Automatic device detection and redirection
- Persistent storage for user preferences
- Enhanced loading experience"

# Commit 5: Atualizações nos arquivos HTML principais
echo "📄 Commit 5: Atualizações HTML"
git commit -m "fix: update HTML files with new src/ structure paths

- Update index.html to reference src/ directory structure
- Update mobile.html with new JavaScript module paths
- Fix contribution-graph.html references
- Ensure all script tags point to correct src/ locations
- Maintain backward compatibility where possible"

echo "✅ Todos os commits realizados com sucesso!"

# Push para o repositório
echo "🚀 Enviando alterações para o repositório..."
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Push realizado com sucesso!"
    
    # Atualizar CHANGELOG para próxima versão
    echo "📝 Atualizando CHANGELOG para próxima versão..."
    
    # Obter a versão atual do CHANGELOG
    CURRENT_VERSION=$(grep -o "## \[.*\]" CHANGELOG.md | head -1 | sed 's/## \[\(.*\)\]/\1/' 2>/dev/null || echo "1.0.0")
    echo "Versão atual: $CURRENT_VERSION"
    
    # Incrementar versão (assumindo formato MAJOR.MINOR.PATCH)
    IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
    MAJOR=${VERSION_PARTS[0]:-1}
    MINOR=${VERSION_PARTS[1]:-0}
    PATCH=${VERSION_PARTS[2]:-0}
    
    # Incrementar versão menor (minor)
    NEW_MINOR=$((MINOR + 1))
    NEW_VERSION="$MAJOR.$NEW_MINOR.0"
    
    echo "Nova versão: $NEW_VERSION"
    
    # Atualizar CHANGELOG
    NEW_CHANGELOG_ENTRY="## [$NEW_VERSION] - $(date +%Y-%m-%d)

### Added
- Unified contribution widget system with mobile optimization
- Enhanced mobile BIOS interface with comprehensive menus
- Real-time GitHub API integration for dynamic version display
- Advanced autocomplete system with intelligent suggestions
- Multiple theme support (GitHub, Terminal, BIOS, Dark)
- Professional Experience and Certifications display

### Changed
- Reorganized project structure to src/ directory
- Improved mobile UX with horizontal scrolling monthly cards
- Enhanced timestamp formatting with full year display
- Better error handling and fallback mechanisms

### Fixed
- Mobile responsiveness issues with contribution graphs
- File path references updated to new src/ structure
- Loading states and API timeout handling

### Technical
- Modular JavaScript architecture with ES6 imports
- CSS organization with component-based structure
- Dynamic GitHub releases API integration
- Responsive design improvements

"
    
    # Criar backup do CHANGELOG atual
    cp CHANGELOG.md CHANGELOG.md.backup
    
    # Inserir nova entrada no topo do CHANGELOG (após o cabeçalho)
    {
        head -n 3 CHANGELOG.md
        echo ""
        echo "$NEW_CHANGELOG_ENTRY"
        tail -n +4 CHANGELOG.md
    } > CHANGELOG.md.tmp && mv CHANGELOG.md.tmp CHANGELOG.md
    
    echo "✅ CHANGELOG atualizado para versão $NEW_VERSION"
    
    # Commit da atualização do CHANGELOG
    git add CHANGELOG.md
    git commit -m "docs: update CHANGELOG for version $NEW_VERSION

- Add comprehensive changelog for latest release
- Document new features, changes, and improvements
- Include technical details and breaking changes"
    
    # Push da atualização do CHANGELOG
    git push origin $CURRENT_BRANCH
    
    echo "✅ CHANGELOG commitado e enviado!"
    echo ""
    echo "🎉 Processo completo!"
    echo "📋 Resumo:"
    echo "   • Refatoração da estrutura: ✅"
    echo "   • Sistema de widgets: ✅"  
    echo "   • Interface mobile melhorada: ✅"
    echo "   • Features avançadas: ✅"
    echo "   • Atualizações HTML: ✅"
    echo "   • CHANGELOG v$NEW_VERSION: ✅"
    echo ""
    echo "🔗 Versão: $NEW_VERSION"
    echo "📅 Data: $(date +%Y-%m-%d)"
    
else
    echo "❌ Erro no push. Verifique a conexão e tente novamente."
    exit 1
fi
