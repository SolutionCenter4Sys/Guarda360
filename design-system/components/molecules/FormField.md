# FormField — Molecule

**Nível:** Molecule  
**Composição:** Label (Atom) + Input (Atom) + HelperText + ErrorText  
**Status:** 🔲 Componente React pendente (usar padrão manual por enquanto)

---

## Estrutura

```
FormField
├── Label          ← atom: text-label uppercase
├── Input          ← atom: input-field (radius 20px)
├── HelperText     ← atom: text-caption (opcional)
└── ErrorText      ← atom: text-caption + color-error + role=alert (condicional)
```

## Implementação Manual (até componentizar)

```tsx
/* FormField completo */
<div className="flex flex-col gap-1.5">
  {/* Label */}
  <label htmlFor="field-id" className="text-label">
    Nome do campo
    {required && (
      <>
        <span aria-hidden="true" style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
        <span className="sr-only">(obrigatório)</span>
      </>
    )}
  </label>

  {/* Input */}
  <input
    id="field-id"
    type="text"
    className={`input-field ${error ? 'input-error' : ''}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Placeholder complementar"
    aria-required={required}
    aria-invalid={!!error}
    aria-describedby={error ? 'field-id-error' : helperText ? 'field-id-hint' : undefined}
  />

  {/* Helper text (sem erro) */}
  {helperText && !error && (
    <p id="field-id-hint" className="text-caption">
      {helperText}
    </p>
  )}

  {/* Error text */}
  {error && (
    <p id="field-id-error" role="alert" className="text-caption" style={{ color: 'var(--color-error)' }}>
      {error}
    </p>
  )}
</div>
```

## Spec do Componente React (quando implementar)

```tsx
interface FormFieldProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label">
        {label}
        {required && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>
            <span className="sr-only">(obrigatório)</span>
          </>
        )}
      </label>
      <input
        id={id}
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : helperText ? `${id}-hint` : undefined
        }
      />
      {helperText && !error && (
        <p id={`${id}-hint`} className="text-caption">{helperText}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-caption" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
```

## Variações

### Select
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="role" className="text-label">Papel</label>
  <select id="role" className="input-field">
    <option value="">Selecionar...</option>
    <option value="GUARDIAN_1">Responsável 1</option>
    <option value="GUARDIAN_2">Responsável 2</option>
  </select>
</div>
```

### Textarea
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="notes" className="text-label">Observações</label>
  <textarea
    id="notes"
    className="input-field"
    rows={4}
    style={{ height: 'auto', resize: 'vertical' }}
  />
</div>
```

## Tokens
- Label: `--text-xs`, `--weight-medium`, `text-transform: uppercase`, `--tracking-wide`
- Input: `--radius-input` (20px), `--input-height` (40px)
- Error color: `--color-error` (`#DC2626`)
- Helper color: `--color-text-tertiary`

## Onde Criar
`frontend/src/components/ui/FormField.tsx`
