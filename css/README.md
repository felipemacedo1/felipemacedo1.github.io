# 🎨 Estrutura CSS - Terminal Portfolio

## 📁 Organização dos Arquivos

```
css/
├── main.css          # Arquivo principal (importa todos os módulos)
├── variables.css     # Variáveis CSS (cores, fontes, espaçamentos)
├── base.css          # Reset CSS e estilos base
├── animations.css    # Animações e keyframes
├── terminal.css      # Estilos do componente terminal
├── components.css    # Componentes reutilizáveis
├── themes.css        # Todos os temas (dark, light, matrix, etc.)
├── mobile.css        # Responsividade e mobile
└── README.md         # Esta documentação
```

## 🛠️ Como Usar

1. **Arquivo Principal**: Importe apenas `main.css` no HTML
2. **Variáveis**: Modifique `variables.css` para personalizar cores/espaçamentos
3. **Novos Temas**: Adicione em `themes.css` seguindo o padrão existente
4. **Componentes**: Adicione novos componentes em `components.css`

## ✨ Benefícios da Nova Estrutura

- **Modular**: Cada arquivo tem responsabilidade específica
- **Manutenível**: Fácil localizar e modificar estilos
- **Reutilizável**: Variáveis CSS centralizadas
- **Escalável**: Fácil adicionar novos temas/componentes
- **Organizado**: Separação clara de responsabilidades

## 🎯 Boas Práticas Implementadas

- ✅ Variáveis CSS para valores reutilizáveis
- ✅ Nomenclatura consistente (BEM-like)
- ✅ Separação por responsabilidade
- ✅ Mobile-first approach
- ✅ Animações otimizadas
- ✅ Comentários descritivos
- ✅ Ordem de importação lógica