# Button — Atom

**Nível:** Atom  
**Foursys:** Pill radius (9999px) padrão  
**WCAG:** min-height 44px (2.5.5)

---

## Variantes

| Classe CSS      | Uso                                   |
|-----------------|---------------------------------------|
| `.btn-primary`  | Ação principal / CTA (salvar, confirmar) |
| `.btn-secondary`| Ação secundária (cancelar com destaque) |
| `.btn-ghost`    | Ação terciária / contextual           |
| `.btn-danger`   | Ações destrutivas (deletar, revogar)  |
| `.btn-success`  | Confirmações positivas (aprovar)      |

## Estados

| Estado     | Implementação |
|-----------|--------------|
| default   | Cor base     |
| hover     | Cor hover + sombra (primary blue tinge) |
| active    | Cor active + `scale(0.98)` |
| focus     | `--shadow-focus` ring azul |
| disabled  | `opacity: 0.4; cursor: not-allowed` |

## Tokens Utilizados

```css
--btn-radius:           var(--radius-pill)    /* 9999px — Foursys */
--btn-height:           var(--touch-md)       /* 44px — WCAG */
--btn-primary-bg:       var(--color-primary)
--btn-primary-bg-hover: var(--color-primary-hover)
--btn-primary-text:     var(--color-on-primary)
```

## Implementação

```tsx
/* Uso básico */
<button className="btn-primary">Salvar</button>

/* Com ícone */
<button className="btn-primary flex items-center gap-2">
  <Save size={16} aria-hidden="true" />
  Salvar
</button>

/* Botão desabilitado */
<button className="btn-primary" disabled>Salvando...</button>

/* Botão de perigo */
<button className="btn-danger flex items-center gap-2">
  <Trash size={16} aria-hidden="true" />
  Excluir
</button>
```

## CSS (index.css @layer components)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-md);           /* 44px WCAG 2.5.5 */
  padding: 0 var(--space-5);             /* 0 20px */
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-pill);     /* Foursys pill */
  border: none;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}

.btn-primary:hover   { background: var(--color-primary-hover); box-shadow: var(--shadow-hover); }
.btn-primary:active  { background: var(--color-primary-active); transform: scale(0.98); }
.btn-primary:focus-visible { box-shadow: var(--shadow-focus); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
```

## Props (quando componentizar)

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  'aria-label'?: string
}
```

## Acessibilidade

- ✅ Usar elemento `<button>` nativo (não `<div onClick>`)
- ✅ `type="button"` para evitar submit acidental em forms
- ✅ `aria-label` obrigatório em botões icon-only
- ✅ Foco visível via `--shadow-focus`
- ✅ `disabled` nativo (não apenas visual)
- ✅ `aria-busy="true"` durante loading

## Tamanhos

```css
/* SM — usar em contextos compactos */
.btn-sm { padding: 0 var(--space-3); font-size: var(--text-xs); min-height: 32px; }

/* MD — padrão (usa .btn-primary diretamente) */
/* padding: 0 var(--space-5); min-height: 44px */

/* LG — CTAs de destaque */
.btn-lg { padding: 0 var(--space-8); font-size: var(--text-base); min-height: 52px; }
```

## Não Fazer

```tsx
/* ❌ Div como botão */
<div onClick={handler} className="btn-primary">Salvar</div>

/* ❌ Cor hardcoded */
<button style={{ background: '#1D4ED8' }}>Salvar</button>

/* ❌ Remover foco */
<button style={{ outline: 'none' }}>Salvar</button>

/* ❌ Radius não-pill */
<button className="btn-primary rounded-md">Salvar</button>
```
