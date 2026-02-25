# Guarda360° Design System v1.0

Sistema de design institucional do **Guarda360°** — plataforma de gestão de guarda compartilhada.  
Baseado na metodologia **Foursys Design Toolkit** com identidade visual adaptada ao domínio jurídico-familiar.

---

## Estrutura da Pasta

```
design-system/
├── tokens/                  # Design Tokens (JSON + CSS Variables)
│   ├── colors.json          # Paleta de cores (global → alias → component)
│   ├── typography.json      # Tipografia (escala + hierarquia semântica)
│   ├── spacing.json         # Espaçamento 8pt grid + radius + shadows
│   ├── shadows.json         # Elevação e sombras
│   └── design-tokens.css    # CSS Variables master (referência canônica)
│
├── components/              # Documentação de componentes (Atomic Design)
│   ├── atoms/               # Elementos básicos indivisíveis
│   │   ├── Button.md
│   │   ├── Input.md
│   │   ├── Badge.md
│   │   └── Avatar.md
│   ├── molecules/           # Composições simples de atoms
│   │   └── FormField.md
│   └── organisms/           # Componentes complexos
│       ├── Card.md
│       └── Sidebar.md
│
├── docs/                    # Guias e princípios
│   ├── getting-started.md   # Como usar o Design System
│   ├── principles.md        # Princípios de design e brand
│   ├── accessibility.md     # Diretrizes WCAG 2.1 AA
│   └── implementation-checklist.md
│
└── showcase/
    └── index.html           # Visualização interativa dos tokens
```

---

## Tech Stack Frontend

| Ferramenta        | Versão   | Papel                              |
|-------------------|----------|------------------------------------|
| React             | 18.3.1   | Framework UI                       |
| TypeScript        | 5.7.2    | Tipagem estática                   |
| Vite              | 6.0.7    | Build tool                         |
| Tailwind CSS      | 3.4.17   | Utility classes + tokens           |
| CSS Variables     | —        | Design tokens canônicos            |
| Lucide React      | 0.469    | Biblioteca de ícones               |
| Inter (Google)    | —        | Fonte primária                     |
| JetBrains Mono    | —        | Fonte monospace (hashes, timestamps)|

---

## Princípios Foursys

1. **Tokens > valores hardcoded** — usar sempre variáveis CSS/Tailwind
2. **Pill para botões** — `border-radius: 9999px` (Foursys padrão)
3. **LG para inputs/cards** — radius 20px para campos de formulário
4. **3 níveis de token** — Global → Alias → Component
5. **8pt Grid** — espaçamentos em múltiplos de 4px
6. **Acessibilidade first** — WCAG 2.1 AA mínimo (contraste 4.5:1)
7. **Inter** — fonte primária em todos os produtos Foursys

---

## Identidade Guarda360°

### Cores Principais

| Token                  | Valor     | Uso                              |
|------------------------|-----------|----------------------------------|
| `--color-primary`      | `#1D4ED8` | Azul institucional (WCAG AAA 9.3:1) |
| `--color-primary-hover`| `#2563EB` | Hover de elementos primários     |
| `--color-bg`           | `#F8FAFC` | Fundo da aplicação               |
| `--color-surface`      | `#FFFFFF` | Superfície de cards e modais     |
| `--color-text-primary` | `#0F172A` | Texto principal                  |

### Cores de Domínio (Guarda Compartilhada)

| Token                    | Valor     | Significado                     |
|--------------------------|-----------|---------------------------------|
| `--color-guardian-a`     | `#2563EB` | Responsável 1 (azul)            |
| `--color-guardian-b`     | `#DB2777` | Responsável 2 (rosa)            |
| `--color-guardian-shared`| `#7C3AED` | Dias compartilhados (violeta)   |
| `--color-confirmado`     | `#16A34A` | Visita confirmada               |
| `--color-pendente`       | `#D97706` | Visita pendente                 |
| `--color-cancelado`      | `#DC2626` | Visita cancelada / falta        |
| `--color-severity-critical`| `#7C3AED`| Alienação parental (crítico)   |

---

## Referências

- [Foursys Design Toolkit](../../Simulacao%20BMAD/Design%20System%20Foursys/design-toolkit-17-12.md)
- [Agente Designer System](../../Solution%20Center%20Un2%20-%20Agents%20AI%20-%20Agents%20AI/Agents%20UpStream/the-designer-system.md)
- [Agente Dev ReactJS](../../Solution%20Center%20Un2%20-%20Agents%20AI%20-%20Agents%20AI/Agents%20DownStream/dev-reactjs-esp.md)
- [Atomic Design (Brad Frost)](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
