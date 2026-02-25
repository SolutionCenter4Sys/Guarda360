# Checklist de Implementação — Guarda360° DS

Use este checklist ao desenvolver novas features ou revisar PRs.

---

## Para Desenvolvedores Frontend

### Setup Inicial
- [ ] Importar `@/index.css` na raiz da aplicação (`main.tsx`)
- [ ] Confirmar que `tailwind.config.js` está configurado com tokens do DS
- [ ] Confirmar que fontes `Inter` e `JetBrains Mono` estão carregadas (Google Fonts)

### Ao Criar Componentes

**Estrutura de arquivo:**
- [ ] Componente em `PascalCase.tsx`
- [ ] Props com interface TypeScript (sem `any`, sem `as`)
- [ ] Exportação nomeada (não default export para componentes)

**Styling:**
- [ ] Usar tokens CSS (`var(--color-*)`) em vez de valores hardcoded
- [ ] Usar classes Tailwind do DS (`bg-surface`, `border-border`, `rounded-lg`)
- [ ] Usar classes de componente do DS (`.btn-primary`, `.card`, `.badge`)
- [ ] Para novos padrões: adicionar token/classe ao DS antes de criar ad-hoc

**Acessibilidade:**
- [ ] Elementos interativos com `aria-label` ou texto visível
- [ ] Ícones decorativos com `aria-hidden="true"`
- [ ] Inputs com `<label htmlFor>` associado
- [ ] Erros com `role="alert"` ou `aria-describedby`
- [ ] Foco visível preservado (não remover outline)
- [ ] Touch target mínimo 44px (`min-height: var(--touch-md)`)

**Responsividade:**
- [ ] Mobile-first (sm: → md: → lg:)
- [ ] Textos não truncam valores importantes (reduzir fonte em vez de truncar)
- [ ] Grids adaptam: 1 col → 2 col → 3/4 col

### Ao Usar Botões

```tsx
/* ✅ Botão primário */
<button className="btn-primary flex items-center gap-2">
  <Save size={16} aria-hidden="true" />
  Salvar
</button>

/* ✅ Botão com loading */
<button className="btn-primary" disabled={isLoading}>
  {isLoading && <span className="animate-spin mr-2">⟳</span>}
  {isLoading ? 'Salvando...' : 'Salvar'}
</button>
```

**Radius:** Pill (9999px) — não alterar.  
**Altura mínima:** 44px — não reduzir.

### Ao Usar Inputs

```tsx
/* ✅ Input com label */
<div className="flex flex-col gap-1">
  <label htmlFor="phone" className="text-label">Telefone</label>
  <input
    id="phone"
    type="tel"
    className="input-field"
    placeholder="(11) 99999-9999"
  />
</div>

/* ✅ Input com erro */
<input className="input-field input-error" aria-describedby="phone-error" />
<p id="phone-error" role="alert" className="text-caption text-error">
  Telefone inválido
</p>
```

**Radius:** 20px (`--radius-input`) — não alterar.  
**Placeholder:** Complementar, nunca substituir label.

### Ao Usar Cards

```tsx
/* ✅ Card informativo */
<Card className="p-5">
  <SectionHeader title="Visitas do Mês" />
</Card>

/* ✅ Card interativo */
<Card hover onClick={() => navigate(`/visits/${id}`)}>
  <div className="p-5">...</div>
</Card>

/* ✅ Card de KPI */
<KpiCard
  title="Visitas Confirmadas"
  value="42"
  color="green"
  icon={<CheckCircle size={24} />}
/>
```

### Ao Usar Badges

```tsx
import { StatusBadge, SeverityBadge, HashBadge } from '@/components/ui/Badge'

/* ✅ Status de visita */
<StatusBadge status="CONFIRMADO" />

/* ✅ Severity de ocorrência */
<SeverityBadge severity="CRITICAL" />

/* ✅ Hash de documento */
<HashBadge hash={document.sha256} />

/* ✅ Badge inline com classe */
<span className="badge badge-pendente">Aguardando</span>
```

---

## Para Designers (Handoff)

- [ ] Usar paleta de cores do DS (não criar cores custom sem aprovar no DS)
- [ ] Seguir escala tipográfica (não criar tamanhos intermediários)
- [ ] Seguir grid 8pt (4px, 8px, 12px, 16px, 24px, 32px...)
- [ ] Documentar variações de componentes e estados (hover, focus, disabled, error)
- [ ] Especificar qual token de cor usar para cada elemento
- [ ] Verificar contraste de novas combinações (mínimo 4.5:1)
- [ ] Especificar comportamento responsivo (mobile → tablet → desktop)
- [ ] Identificar componentes DS a usar (Button, Card, Badge, Input...)
- [ ] Se componente novo: documentar variantes e estados para inclusão no DS

---

## Tokens de Referência Rápida

### Cores Essenciais
```
--color-primary          #1D4ED8  (azul institucional)
--color-bg               #F8FAFC  (fundo)
--color-surface          #FFFFFF  (cards)
--color-surface-alt      #F1F5F9  (fundo alternativo)
--color-border           #E2E8F0  (bordas)
--color-text-primary     #0F172A  (texto principal)
--color-text-secondary   #374151  (texto secundário)
--color-text-tertiary    #64748B  (texto auxiliar)
```

### Radius
```
--radius-pill    9999px  ← botões (Foursys padrão)
--radius-input   1.25rem (20px) ← inputs, selects
--radius-lg      0.75rem (12px) ← cards, modais
--radius-md      0.5rem  (8px)  ← elementos internos
--radius-sm      0.25rem (4px)  ← badges menores
```

### Sombras
```
--shadow-card        card padrão (elevação leve)
--shadow-soft        Foursys soft shadow
--shadow-hover       hover com toque de primary
--shadow-soft-hover  Foursys hover shadow
--shadow-focus       ring de foco (acessibilidade)
```

### Espaçamento
```
--space-1  4px    --space-6  24px
--space-2  8px    --space-8  32px
--space-3  12px   --space-10 40px
--space-4  16px   --space-12 48px
--space-5  20px   --space-16 64px
```
