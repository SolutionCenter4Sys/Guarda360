# Getting Started — Guarda360° Design System

## Pré-requisitos

O projeto utiliza **React 18 + TypeScript + Tailwind CSS + CSS Variables**. Não há package separado — o Design System vive dentro do próprio frontend.

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── index.css              ← Tokens CSS (fonte da verdade em runtime)
│   ├── components/
│   │   ├── ui/                ← Atoms e Molecules (componentes base)
│   │   │   ├── Badge.tsx
│   │   │   └── Card.tsx
│   │   └── layout/            ← Organisms de layout
│   │       ├── AppLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   └── pages/                 ← Templates e Pages
└── tailwind.config.js         ← Tokens Tailwind (integrados aos CSS vars)
```

## Como usar os tokens

### CSS Variables (CSS / inline styles)

```tsx
// ✅ CORRETO — usar tokens CSS
<div style={{ color: 'var(--color-primary)' }}>
  Texto primário
</div>

// ❌ ERRADO — valor hardcoded
<div style={{ color: '#1D4ED8' }}>
  Texto primário
</div>
```

### Classes Tailwind (utilitários)

```tsx
// ✅ CORRETO — classes do design system
<div className="bg-surface border border-border rounded-lg shadow-card p-5">
  Card padrão
</div>

// ✅ CORRETO — classes de componente (definidas em index.css @layer components)
<button className="btn-primary">Salvar</button>
<input className="input-field" />
<span className="badge badge-confirmado">Confirmado</span>
```

## Classes de Componente (pronto-para-uso)

### Botões

```tsx
<button className="btn-primary">Ação Principal</button>
<button className="btn-secondary">Ação Secundária</button>
<button className="btn-ghost">Ação Terciária</button>
<button className="btn-danger">Deletar</button>
<button className="btn-success">Confirmar</button>
```

**Nota Foursys:** Botões têm `border-radius: pill (9999px)` por padrão.

### Inputs

```tsx
<input className="input-field" placeholder="Digite..." />
<input className="input-field input-error" />  {/* estado de erro */}
```

**Nota Foursys:** Inputs têm `border-radius: 20px (--radius-input)` por padrão.

### Cards

```tsx
<div className="card p-5">Conteúdo</div>
<div className="card card-hover p-5">Card com hover</div>
<div className="metric-card">Card de KPI</div>
```

### Badges

```tsx
<span className="badge badge-confirmado">Confirmado</span>
<span className="badge badge-pendente">Pendente</span>
<span className="badge badge-cancelado">Cancelado</span>
<span className="badge badge-low">Baixa</span>
<span className="badge badge-medium">Média</span>
<span className="badge badge-high">Alta</span>
<span className="badge badge-critical">Crítica</span>
```

### Tipografia

```tsx
<h1 className="text-h1">Título principal</h1>
<h2 className="text-h2">Título de seção</h2>
<h3 className="text-h3">Subtítulo</h3>
<h4 className="text-h4">Label de card</h4>
<p className="text-body">Corpo de texto</p>
<p className="text-body-sm">Texto menor</p>
<span className="text-label">LABEL UPPERCASE</span>
<span className="text-caption">Texto auxiliar</span>
<span className="text-hero">48</span>
<code className="text-hash">sha256:a1b2c3d4</code>
```

### Navegação

```tsx
<a className="nav-item">Item inativo</a>
<a className="nav-item-active">Item ativo</a>
```

## Componentes React prontos

### Badge Components

```tsx
import { StatusBadge, SeverityBadge, HashBadge, PaymentBadge, GuardianBadge } from '@/components/ui/Badge'

<StatusBadge status="CONFIRMADO" />
<StatusBadge status="PENDENTE" />
<SeverityBadge severity="HIGH" />
<HashBadge hash="sha256:a1b2c3d4ef56..." />
<PaymentBadge status="PAGO" />
<GuardianBadge role="GUARDIAN_1" />
```

### Card Components

```tsx
import { Card, KpiCard, SectionHeader } from '@/components/ui/Card'

<Card hover>
  <div className="p-5">Conteúdo</div>
</Card>

<KpiCard
  title="Total de Visitas"
  value="127"
  subtitle="Este mês"
  color="blue"
  icon={<Calendar size={24} />}
/>

<SectionHeader
  title="Ocorrências Recentes"
  subtitle="Últimos 30 dias"
  action={<button className="btn-secondary">Ver todas</button>}
/>
```

## Regras de Ouro

1. **Nunca hardcode cores** — sempre `var(--color-*)` ou classes Tailwind
2. **Nunca criar variantes custom** de Button, Input, Card sem aprovação
3. **Nunca remover o foco visível** — `:focus-visible` com `--shadow-focus`
4. **Sempre aria-label** em botões icon-only e ícones decorativos
5. **Sempre labels nos inputs** — placeholder não substitui label
6. **Sempre min-height 44px** em elementos interativos (WCAG 2.5.5)
7. **Tokens primeiro** — se não existe token, propor adição ao DS antes de criar valor ad-hoc
