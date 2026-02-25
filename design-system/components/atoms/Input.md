# Input — Atom

**Nível:** Atom  
**Foursys:** radius LG = 20px (`--radius-input`)  
**WCAG:** label obrigatório, foco visível

---

## Variantes

| Classe CSS               | Uso                         |
|--------------------------|-----------------------------|
| `.input-field`           | Input padrão                |
| `.input-field input-error`| Input com estado de erro   |
| `.input-field` + `readOnly` | Campo somente leitura   |

## Tipos Suportados

```
text, email, password, tel, number, date, time, search, url
```

## Tokens Utilizados

```css
--input-bg:           var(--color-surface)      /* #FFFFFF */
--input-border:       var(--color-border)        /* #E2E8F0 */
--input-border-focus: var(--color-border-focus)  /* #1D4ED8 */
--input-radius:       var(--radius-input)        /* 20px — Foursys LG */
--input-height:       40px
--input-padding:      0 var(--space-3)           /* 0 12px */
```

## Implementação Básica

```tsx
/* ✅ Sempre com label */
<div className="flex flex-col gap-1.5">
  <label htmlFor="name" className="text-label">
    Nome completo
  </label>
  <input
    id="name"
    type="text"
    className="input-field"
    placeholder="Ex: Maria Silva"
  />
</div>
```

## Com Validação

```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="email" className="text-label">
    E-mail
    <span aria-hidden="true" style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
    <span className="sr-only">(obrigatório)</span>
  </label>
  <input
    id="email"
    type="email"
    className={`input-field ${error ? 'input-error' : ''}`}
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : 'email-hint'}
  />
  {!error && (
    <p id="email-hint" className="text-caption">
      Use o e-mail cadastrado no sistema
    </p>
  )}
  {error && (
    <p id="email-error" role="alert" className="text-caption" style={{ color: 'var(--color-error)' }}>
      {error}
    </p>
  )}
</div>
```

## Read-Only (Campo Imutável)

```tsx
/* Para hashes SHA-256 e campos protegidos */
<div className="immutable-field">
  <Lock size={12} aria-hidden="true" />
  <code className="text-hash">{document.sha256}</code>
</div>
```

## CSS (index.css @layer components)

```css
.input-field {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);      /* 20px — Foursys LG */
  transition: border-color var(--dur-fast) var(--ease),
              box-shadow var(--dur-fast) var(--ease);
}

.input-field::placeholder { color: var(--color-text-disabled); }

.input-field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--shadow-focus);
}

.input-error {
  border-color: var(--g-red-600);
  box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
}
```

## Acessibilidade

- ✅ `<label htmlFor>` associado ao input por `id`
- ✅ `aria-required="true"` em campos obrigatórios
- ✅ `aria-invalid="true"` em campos com erro
- ✅ `aria-describedby` apontando para mensagem de erro/hint
- ✅ `role="alert"` na mensagem de erro
- ✅ Placeholder complementar — nunca substitui label
- ✅ Foco visível via `--shadow-focus`
- ✅ Contraste de placeholder verificado (3.1:1 mínimo)

## Não Fazer

```tsx
/* ❌ Sem label */
<input className="input-field" placeholder="E-mail" />

/* ❌ Placeholder como label */
<input className="input-field" placeholder="Seu e-mail aqui" />

/* ❌ Radius padrão Tailwind sobrescrevendo DS */
<input className="input-field rounded-md" />

/* ❌ Valor hardcoded */
<input style={{ borderRadius: '4px' }} />
```
