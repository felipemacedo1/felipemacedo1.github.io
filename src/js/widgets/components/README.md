# Contribution Widget Components

Este diretório contém os componentes modulares para renderização de gráficos de contribuições no projeto.

## Migração de Componentes

Os arquivos `contribution-graph.html` e `contribution-enhanced.html` eram arquivos de exemplo que foram removidos e suas funcionalidades foram componentizadas em módulos menores e reutilizáveis.

## Novos Componentes

### 1. **ContributionStatsCard.js**
Componente responsável por renderizar estatísticas de contribuições.

**Funcionalidades:**
- Exibe estatísticas como total de commits, sequências, dias ativos
- Suporte a modo compacto e completo
- Cálculo automático de tendências
- Múltiplos temas (GitHub, Terminal, BIOS)

**Uso:**
```javascript
import ContributionStatsCard from './components/ContributionStatsCard.js';

const statsCard = new ContributionStatsCard(container, {
  theme: 'github',
  compact: false,
  showTrend: true
});

statsCard.render(dailyMetrics);
```

### 2. **ContributionGridRenderer.js**
Componente responsável por renderizar o grid visual das contribuições.

**Funcionalidades:**
- Renderização do grid de contribuições diárias
- Tooltips interativos
- Diferentes tamanhos (compact, normal, large)
- Legenda configurável
- Múltiplos temas

**Uso:**
```javascript
import ContributionGridRenderer from './components/ContributionGridRenderer.js';

const gridRenderer = new ContributionGridRenderer(container, {
  theme: 'github',
  size: 'normal',
  showTooltips: true,
  showLegend: true
});

gridRenderer.render(dailyMetrics);
```

### 3. **ContributionControls.js**
Componente responsável pelos controles de período, tema e exportação.

**Funcionalidades:**
- Seletor de período (365 dias, anos específicos)
- Seletor de tema
- Botão de exportação de dados
- Modo compacto para interfaces menores
- Callbacks configuráveis

**Uso:**
```javascript
import ContributionControls from './components/ContributionControls.js';

const controls = new ContributionControls(container, {
  theme: 'github',
  period: 'rolling',
  compact: false
});

controls.render();

// Configurar callbacks
controls.on('onPeriodChange', (period) => {
  console.log('Período alterado:', period);
});

controls.on('onThemeChange', (theme) => {
  console.log('Tema alterado:', theme);
});
```

### 4. **ModularContributionWidget.js**
Widget unificado que combina todos os componentes modulares.

**Funcionalidades:**
- Combina estatísticas, grid e controles
- Carregamento automático de dados
- API completa para controle externo
- Suporte a múltiplos tamanhos e temas

**Uso:**
```javascript
import ModularContributionWidget from './ModularContributionWidget.js';

const widget = new ModularContributionWidget(container, {
  author: 'felipemacedo1',
  period: 'rolling',
  theme: 'github',
  size: 'normal',
  showStats: true,
  showControls: true,
  showTooltips: true,
  showLegend: true
});

await widget.init();

// Controle programático
await widget.setPeriod('2024');
widget.setTheme('terminal');
widget.setSize('compact');
```

## Compatibilidade

### UnifiedContributionWidget.js
O `UnifiedContributionWidget.js` foi atualizado para usar internamente o `ModularContributionWidget.js`, mantendo compatibilidade com o código existente.

### Arquivos Descontinuados

- **EnhancedContributionGraph.js**: Marcado como deprecated, será removido em versão futura
- **examples/pages/contribution-graph.html**: Removido
- **examples/pages/contribution-enhanced.html**: Removido

## Vantagens da Nova Arquitetura

1. **Modularidade**: Componentes podem ser reutilizados independentemente
2. **Manutenibilidade**: Código mais organizado e fácil de manter
3. **Flexibilidade**: Possível combinar componentes de diferentes maneiras
4. **Testabilidade**: Componentes menores são mais fáceis de testar
5. **Performance**: Apenas os componentes necessários são carregados

## Temas Suportados

- **github**: Tema padrão do GitHub (escuro)
- **terminal**: Tema estilo terminal (verde sobre preto)
- **bios**: Tema estilo BIOS (cyan sobre preto)

## Tamanhos Suportados

- **compact**: Tamanho compacto para espaços reduzidos
- **normal**: Tamanho padrão
- **large**: Tamanho expandido com mais detalhes

## Migração para Desenvolvedores

Se você estava usando diretamente o `EnhancedContributionGraph`, migre para:

```javascript
// Antes
import EnhancedContributionGraph from './EnhancedContributionGraph.js';
const graph = new EnhancedContributionGraph(container, options);

// Depois  
import ModularContributionWidget from './ModularContributionWidget.js';
const widget = new ModularContributionWidget(container, options);
```

Se você estava referenciando os arquivos HTML de exemplo, use os componentes internamente no projeto ao invés de abrir em nova aba.
