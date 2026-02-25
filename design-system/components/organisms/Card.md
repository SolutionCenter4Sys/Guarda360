# Card — Organism

**Nível:** Organism  
**Arquivo:** `frontend/src/components/ui/Card.tsx`  
**Foursys:** radius LG (12px), sombra soft, fundo surface elevada

---

## Componentes Disponíveis

| Componente    | Uso                                    |
|---------------|----------------------------------------|
| `Card`        | Card base genérico                     |
| `KpiCard`     | Card de KPI/métrica com número hero    |
| `SectionHeader`| Cabeçalho de seção com título e ação  |

---

## Card Base

```tsx
import { Card } from '@/components/ui/Card'

/* Card simples */
<Card className="p-5">
  <p>Conteúdo</p>
</Card>

/* Card com hover */
<Card hover className="p-5">
  <p>Com efeito de hover</p>
</Card>

/* Card clicável */
<Card
  onClick={() => navigate(`/visits/${id}`)}
  className="p-5"
>
  <p>Card interativo</p>
</Card>
```

## KpiCard (MetricCard)

```tsx
import { KpiCard } from '@/components/ui/Card'
import { Calendar, AlertTriangle, DollarSign, Users } from 'lucide-react'

<KpiCard
  title="Visitas Confirmadas"
  value="42"
  subtitle="Este mês"
  trend={{ direction: 'up', label: '+8% vs mês anterior' }}
  icon={<Calendar size={24} />}
  color="green"
  large  /* usa font-hero (48px extrabold) */
/>

/* Cores disponíveis: blue | green | amber | red | purple */
<KpiCard title="Ocorrências" value="3" color="red" icon={<AlertTriangle size={24} />} />
<KpiCard title="Pensão" value="R$ 2.400" color="amber" icon={<DollarSign size={24} />} />
```

## SectionHeader

```tsx
import { SectionHeader } from '@/components/ui/Card'

<SectionHeader
  title="Próximas Visitas"
  subtitle="Calendário de convivência"
  action={
    <button className="btn-secondary flex items-center gap-1.5">
      <Plus size={14} aria-hidden="true" />
      Nova visita
    </button>
  }
/>
```

## Padrão de Composição

```tsx
/* Card completo com seções */
<Card className="p-5 space-y-4">
  <SectionHeader
    title="Visitas do Mês"
    action={<button className="btn-ghost">Ver todas</button>}
  />
  
  <div className="space-y-2">
    {visits.map(visit => (
      <div
        key={visit.id}
        className="card card-hover p-3 flex items-center gap-3"
      >
        <StatusBadge status={visit.status} />
        <span className="text-body-sm">{format(visit.date, 'dd/MM')}</span>
        <GuardianBadge role={visit.guardianRole} />
      </div>
    ))}
  </div>
</Card>
```

## Card de Ocorrência (com severity border)

```tsx
<Card className={`p-4 card-severity-${severity.toLowerCase()}`}>
  <div className="flex items-start gap-3">
    <SeverityBadge severity={severity} />
    <div>
      <p className="text-body font-medium">{incident.title}</p>
      <p className="text-caption">{incident.description}</p>
    </div>
  </div>
</Card>

/* Classes de severity border (DS spec — border-left: 4px) */
/* .card-severity-low | .card-severity-medium | .card-severity-high | .card-severity-critical */
```

## Tokens

```css
--card-bg:           var(--color-surface)     /* #FFFFFF */
--card-border:       var(--color-border)       /* #E2E8F0 */
--card-radius:       var(--radius-lg)          /* 12px */
--card-shadow:       var(--shadow-soft)        /* Foursys: 0 10px 25px... */
--card-shadow-hover: var(--shadow-soft-hover)  /* Foursys hover */
--card-padding:      var(--space-5)            /* 20px */
```

## CSS (index.css)

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);        /* Foursys soft */
}

.card-hover {
  transition: box-shadow var(--dur-normal) var(--ease),
              transform var(--dur-normal) var(--ease);
}
.card-hover:hover {
  box-shadow: var(--shadow-soft-hover);  /* Foursys hover */
  transform: translateY(-1px);
}
```

## Acessibilidade

- ✅ Card clicável tem `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space)
- ✅ Card clicável tem `aria-label` descritivo
- ✅ KpiCard: números grandes têm contexto (título + subtítulo)
- ✅ Trend (▲/▼) não é o único indicador — sempre acompanha texto
