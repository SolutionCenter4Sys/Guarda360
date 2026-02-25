# Badge — Atom

**Nível:** Atom  
**Foursys:** radius pill, uppercase, altura ~28-32px  
**Arquivo:** `frontend/src/components/ui/Badge.tsx`

---

## Tipos de Badge

### StatusBadge — Visitas de Convivência

| Status       | Classe CSS            | Cor       |
|--------------|-----------------------|-----------|
| CONFIRMADO   | `.badge-confirmado`   | Verde + dot animado |
| PENDENTE     | `.badge-pendente`     | Âmbar     |
| CANCELADO    | `.badge-cancelado`    | Vermelho  |
| FALTA        | `.badge-falta`        | Vermelho  |
| ATRASO       | `.badge-atraso`       | Âmbar     |

### SeverityBadge — Ocorrências

| Severity | Classe CSS        | Cor     |
|----------|-------------------|---------|
| LOW      | `.badge-low`      | Verde   |
| MEDIUM   | `.badge-medium`   | Âmbar   |
| HIGH     | `.badge-high`     | Vermelho|
| CRITICAL | `.badge-critical` | Violeta (Alienação Parental) |

### HashBadge — Integridade SHA-256

- Fonte: `--font-mono` (JetBrains Mono)
- Cor: sky (`--color-hash-valid`)
- Ring: `--shadow-hash`
- Exibe: primeiros 8 chars do hash

### PaymentBadge — Financeiro

| Status   | Cor    |
|----------|--------|
| PAGO     | Verde  |
| PENDENTE | Âmbar  |
| ATRASADO | Vermelho |
| PARCIAL  | Âmbar  |

### GuardianBadge — Identificação de Guardião

| Role      | Cor              |
|-----------|------------------|
| GUARDIAN_1| Azul guardian-a  |
| GUARDIAN_2| Rosa guardian-b  |
| SHARED    | Violeta shared   |

---

## Implementação (React)

```tsx
import { StatusBadge, SeverityBadge, HashBadge, PaymentBadge, GuardianBadge } from '@/components/ui/Badge'

/* Status de visita */
<StatusBadge status="CONFIRMADO" />
<StatusBadge status="PENDENTE" />
<StatusBadge status="CANCELADO" />

/* Severity de ocorrência */
<SeverityBadge severity="LOW" />
<SeverityBadge severity="CRITICAL" />

/* Hash de documento */
<HashBadge hash="sha256:a1b2c3d4ef5678901234abcd..." />
<HashBadge hash="sha256:..." invalid />   {/* hash inválido */}

/* Financeiro */
<PaymentBadge status="PAGO" />
<PaymentBadge status="ATRASADO" />

/* Guardião */
<GuardianBadge role="GUARDIAN_1" />
<GuardianBadge role="SHARED" />
```

## Badge Inline (CSS puro)

```tsx
/* Para badges simples sem componente */
<span className="badge badge-confirmado">Confirmado</span>
<span className="badge badge-pendente">Pendente</span>
<span className="badge badge-low">Baixa</span>
```

## Tokens

```css
/* Base */
--badge-radius:   var(--radius-pill)  /* 9999px */
--badge-font:     var(--text-xs)      /* 12px */
--badge-weight:   var(--weight-semibold)
--badge-tracking: var(--tracking-wide) /* 0.04em */

/* Hash específico */
--badge-hash-font:   var(--font-mono)
--badge-hash-shadow: var(--shadow-hash)
```

## CSS (index.css)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);    /* pill */
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  border: 1px solid transparent;
  white-space: nowrap;
}
```

## Acessibilidade

- ✅ Texto legível (não apenas cor — sempre acompanhado de label)
- ✅ Dot animado do CONFIRMADO tem `aria-hidden="true"`
- ✅ Status crítico (CRITICAL) usa violeta com contraste 7.4:1
- ✅ Não usar badge como único indicador de estado (complementar a texto/ícone)
- ✅ HashBadge tem `title` com hash completo e `aria-label`

## Não Fazer

```tsx
/* ❌ Badge sem texto (cor sozinha) */
<span className="badge badge-confirmado" />

/* ❌ Badge com radius não-pill */
<span className="badge badge-low rounded-md" />

/* ❌ Cor hardcoded */
<span style={{ background: '#16A34A', color: 'white' }}>Confirmado</span>
```
