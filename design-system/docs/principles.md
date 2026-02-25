# Princípios do Design System — Guarda360°

## Fundamentos Foursys

O Guarda360° DS segue a **metodologia Foursys Design Toolkit**, adaptada para o domínio de guarda compartilhada.

### 1. Tokens > Valores Hardcoded

Todo valor de design (cor, espaçamento, tipografia, sombra, radius) deve ser um token.  
Tokens são definidos em 3 níveis:

```
Nível 1 — Global    : --g-blue-500: #1D4ED8
Nível 2 — Alias     : --color-primary: var(--g-blue-500)
Nível 3 — Component : --btn-primary-bg: var(--color-primary)
```

**Benefício:** Uma mudança em `--g-blue-500` propaga para todos os componentes.

### 2. Pill para Botões (Padrão Foursys)

```css
/* Foursys default */
.btn { border-radius: var(--radius-pill); /* 9999px */ }
```

Botões com cantos totalmente arredondados são o padrão do Foursys Design Toolkit.  
Use `--radius-md` (8px) apenas para elementos internos pequenos.

### 3. LG para Inputs e Cards (Foursys)

```css
/* Foursys: inputs com radius 20px */
.input-field { border-radius: var(--radius-input); /* 20px */ }

/* Cards com radius 12px */
.card { border-radius: var(--radius-lg); /* 12px */ }
```

### 4. Inter como Fonte Primária

A fonte **Inter** é o padrão de todos os produtos Foursys. Usar `--font-sans` sempre.  
Para hashes SHA-256 e timestamps: `--font-mono` (JetBrains Mono).

### 5. 8pt Grid

Todos os espaçamentos seguem o grid de 8 pontos: 4px, 8px, 12px, 16px, 24px, 32px...  
Usar tokens `--space-*` ou as classes Tailwind equivalentes.

---

## Atomic Design

Os componentes são organizados segundo a metodologia **Atomic Design (Brad Frost)**:

### Atoms (Átomos)
Elementos básicos indivisíveis. Não dependem de outros componentes.

| Componente | Arquivo | Status |
|-----------|---------|--------|
| Button    | `@layer components .btn-*` | ✅ |
| Input     | `@layer components .input-field` | ✅ |
| Badge     | `components/ui/Badge.tsx` | ✅ |
| Avatar    | (inline via CSS vars) | ✅ |
| Icon      | Lucide React | ✅ |
| Spinner   | `.animate-spin` | ✅ |

### Molecules (Moléculas)
Composições simples de atoms.

| Componente | Status |
|-----------|--------|
| FormField (Label + Input + Error) | 🔲 Pendente |
| SearchField (Input + Icon) | 🔲 Pendente |
| NavItem (Icon + Label + Badge) | ✅ `.nav-item` |
| Breadcrumb | 🔲 Pendente |

### Organisms (Organismos)
Componentes complexos com funcionalidade própria.

| Componente | Arquivo | Status |
|-----------|---------|--------|
| Sidebar   | `components/layout/Sidebar.tsx` | ✅ |
| TopBar    | `components/layout/TopBar.tsx` | ✅ |
| Card      | `components/ui/Card.tsx` | ✅ |
| KpiCard   | `components/ui/Card.tsx` | ✅ |
| DataTable | 🔲 Pendente |
| Modal     | 🔲 Pendente |

### Templates
Estruturas de página sem conteúdo real.

| Template | Arquivo | Status |
|---------|---------|--------|
| AppLayout | `components/layout/AppLayout.tsx` | ✅ |

---

## Identidade Visual do Domínio

O Guarda360° tem tokens específicos para o contexto de guarda compartilhada, que não existem no Foursys padrão:

### Cores de Guardiões
Cada responsável tem uma identidade de cor consistente em toda a aplicação.

```
Guardian A (Responsável 1): --color-guardian-a → #2563EB (azul)
Guardian B (Responsável 2): --color-guardian-b → #DB2777 (rosa)
Shared   (Compartilhado)  : --color-guardian-shared → #7C3AED (violeta)
```

### Status de Visita
```
CONFIRMADO : verde  (#16A34A) + dot animado
PENDENTE   : âmbar  (#D97706)
CANCELADO  : vermelho (#DC2626)
FALTA      : vermelho (#DC2626)
ATRASO     : âmbar  (#D97706)
```

### Severity de Ocorrências
```
LOW      : verde  (#16A34A)
MEDIUM   : âmbar  (#D97706)
HIGH     : vermelho (#DC2626)
CRITICAL : violeta (#7C3AED) — Alienação Parental (destaque especial)
```

### Integridade SHA-256
Documentos têm hash de integridade exibido com fonte mono e cor sky:
```
hash-valid  : sky (#0EA5E9) + ring shadow
hash-invalid: vermelho (#DC2626)
```

---

## Acessibilidade (WCAG 2.1 AA)

| Regra | Implementação |
|-------|--------------|
| Contraste mínimo 4.5:1 (texto) | Primary blue: 9.3:1 ✅ |
| Contraste mínimo 3:1 (UI) | Verificado em todos status ✅ |
| Touch target mínimo 44x44px | `--touch-md: 44px` em todos botões ✅ |
| Foco visível | `focus-visible: --shadow-focus` ✅ |
| Labels em inputs | Obrigatório por spec ✅ |
| ARIA em ícones | `aria-hidden` nos decorativos ✅ |
| Navegação por teclado | Enter/Space em elementos interativos ✅ |

---

## Decisões de Design

### Por que azul institucional e não preto (Foursys padrão)?
O Foursys Design Toolkit usa preto (`#000000`) como primary para produtos genéricos.  
O Guarda360° é uma plataforma sensível (família, jurídico) e o **azul institucional** transmite confiança, segurança e profissionalismo — valores essenciais para o público-alvo.

### Por que violeta para CRITICAL (Alienação Parental)?
Violeta (`#7C3AED`) cria distinção clara de CRITICAL sem usar vermelho (reservado para HIGH e errors). A alienação parental é um tema de alta gravidade legal que merece diferenciação visual própria.

### Por que JetBrains Mono para hashes?
Hashes SHA-256 precisam de fonte monospace para legibilidade e alinhamento dos caracteres. O JetBrains Mono é moderno e alinhado com o perfil técnico da plataforma.
