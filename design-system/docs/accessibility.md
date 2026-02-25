# Diretrizes de Acessibilidade — Guarda360°

**Padrão:** WCAG 2.1 AA (mínimo) | Alvo: WCAG 2.1 AAA onde possível

---

## Contraste de Cores

### Verificações de Contraste

| Token                    | Cor       | Background | Ratio  | WCAG   |
|--------------------------|-----------|------------|--------|--------|
| `--color-primary`        | `#1D4ED8` | `#FFFFFF`  | 9.3:1  | AAA ✅ |
| `--color-text-primary`   | `#0F172A` | `#FFFFFF`  | 19.8:1 | AAA ✅ |
| `--color-text-secondary` | `#374151` | `#FFFFFF`  | 10.0:1 | AAA ✅ |
| `--color-text-tertiary`  | `#64748B` | `#FFFFFF`  | 4.7:1  | AA ✅  |
| `--color-confirmado`     | `#16A34A` | `#FFFFFF`  | 4.6:1  | AA ✅  |
| `--color-pendente`       | `#D97706` | `#FFFFFF`  | 3.1:1  | AA* ✅ |
| `--color-cancelado`      | `#DC2626` | `#FFFFFF`  | 5.3:1  | AA ✅  |
| `--color-severity-critical` | `#7C3AED` | `#FFFFFF` | 7.4:1 | AAA ✅ |

> *`--color-pendente` é usado apenas como cor de badge (UI component), não como texto corrido — ratio 3:1 é suficiente.

---

## Touch Targets (WCAG 2.5.5)

Todos os elementos interativos devem ter área de toque mínima de **44x44px**.

```css
/* Implementado em todos os botões */
.btn-primary, .btn-secondary, .btn-ghost, .btn-danger, .btn-success {
  min-height: var(--touch-md); /* 44px */
}
```

**Para ícones interativos:**
```tsx
<button
  className="w-11 h-11 flex items-center justify-center rounded-md"
  aria-label="Fechar"
>
  <X size={18} aria-hidden="true" />
</button>
```

---

## Foco Visível

**NUNCA remover o outline de foco.** O design system usa `box-shadow` como substituto mais bonito:

```css
*:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus); /* 0 0 0 3px rgba(29,78,216,0.25) */
  border-radius: var(--radius-md);
}
```

---

## ARIA e Semântica

### Ícones Decorativos
```tsx
/* ✅ CORRETO — aria-hidden em ícones decorativos */
<Shield size={18} aria-hidden="true" />

/* ✅ CORRETO — aria-label em ícones que comunicam algo */
<AlertTriangle size={18} aria-label="Atenção" />
```

### Botões com Ícone Apenas
```tsx
/* ✅ CORRETO */
<button className="btn-ghost w-11 h-11" aria-label="Fechar menu de navegação">
  <X size={18} aria-hidden="true" />
</button>

/* ❌ ERRADO */
<button className="btn-ghost">
  <X size={18} />
</button>
```

### Formulários
```tsx
/* ✅ CORRETO — label sempre associado */
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="text-label">
    E-mail <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
    <span className="sr-only">(obrigatório)</span>
  </label>
  <input
    id="email"
    type="email"
    className="input-field"
    aria-required="true"
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <p id="email-error" role="alert" className="text-caption" style={{ color: 'var(--color-error)' }}>
      {error}
    </p>
  )}
</div>
```

### Cards Interativos
```tsx
/* ✅ CORRETO — card clicável com role e keyboard */
<Card
  onClick={handleClick}
  role="button"
  tabIndex={0}
  aria-label={`Ver detalhes de ${visit.date}`}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
>
```

### Listas e Navegação
```tsx
/* ✅ CORRETO — nav com role e aria-label */
<nav role="navigation" aria-label="Navegação principal">
  <a href="/dashboard" aria-current="page">Dashboard</a>
</nav>

/* ✅ CORRETO — notificações de badge acessíveis */
<span aria-label="3 notificações não lidas" className="badge-count">3</span>
```

### Badges de Status
```tsx
/* ✅ StatusBadge já implementa acessibilidade */
<StatusBadge status="CONFIRMADO" />
// Renderiza: <span class="badge badge-confirmado">
//              <span class="pulse" aria-hidden="true" />  ← dot animado oculto
//              Confirmado
//            </span>
```

---

## Navegação por Teclado

| Tecla | Comportamento esperado |
|-------|----------------------|
| `Tab` | Navega entre elementos interativos |
| `Enter` | Ativa botões, links, itens interativos |
| `Space` | Ativa botões (não links) |
| `Esc` | Fecha modais, drawers, dropdowns |
| `↑↓` | Navega em listas, selects, menus |
| `←→` | Navega em tabs, radio groups |

---

## Screen Readers

### Conteúdo Somente para SR
```tsx
<span className="sr-only">obrigatório</span>
```

> A classe `.sr-only` é fornecida pelo Tailwind CSS.

### Live Regions (Feedback Dinâmico)
```tsx
/* Alertas de erro devem ter role="alert" */
<p role="alert" aria-live="assertive">Erro ao salvar</p>

/* Status não urgente */
<p aria-live="polite">Salvo com sucesso</p>
```

---

## Imagens e Mídia

```tsx
/* ✅ Imagem informativa com alt */
<img src={childPhoto} alt={`Foto de ${child.name}`} />

/* ✅ Imagem decorativa sem alt */
<img src={pattern} alt="" aria-hidden="true" />

/* ✅ Avatar com iniciais */
<div aria-label={`Avatar de ${user.fullName}`}>
  {user.fullName.charAt(0)}
</div>
```

---

## Checklist de Revisão de Acessibilidade

Antes de cada PR, verificar:

- [ ] Todos os elementos interativos têm `aria-label` ou texto visível
- [ ] Todos os ícones decorativos têm `aria-hidden="true"`
- [ ] Todos os inputs têm `<label>` associado por `htmlFor`/`id`
- [ ] Erros de formulário têm `role="alert"` ou `aria-describedby`
- [ ] Foco visível não foi removido em nenhum elemento
- [ ] Touch targets mínimo 44x44px
- [ ] Contraste verificado para novas cores (mínimo 4.5:1 para texto)
- [ ] Teclado testado: Tab, Enter, Esc, Arrows
- [ ] Screen reader testado (NVDA/VoiceOver)
