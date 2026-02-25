# Sidebar — Organism

**Nível:** Organism  
**Arquivo:** `frontend/src/components/layout/Sidebar.tsx`  
**Contexto:** Navegação principal — parte do AppLayout

---

## Estrutura

```
Sidebar
├── LogoSection
│   ├── ShieldIcon (ícone de marca)
│   ├── BrandName ("Guarda360°")
│   └── BrandSubtitle ("Guarda Compartilhada")
│
├── Navigation (role="navigation")
│   ├── SectionLabel ("Menu")
│   └── NavItems[] (NavLink)
│       ├── Icon (aria-hidden)
│       ├── Label
│       └── BadgeCount (notificações)
│
└── UserSection
    ├── UserCard (avatar + nome + role)
    └── LogoutButton
```

## Tokens de Layout

```css
--sidebar-width:  240px  /* largura fixa */
--header-height:   64px  /* altura do logo */
```

## Itens de Navegação

| Rota          | Ícone          | Badge |
|---------------|----------------|-------|
| /dashboard    | LayoutDashboard| —     |
| /children     | Users          | —     |
| /calendar     | Calendar       | —     |
| /chat         | MessageSquare  | 3     |
| /financial    | DollarSign     | —     |
| /incidents    | AlertTriangle  | 2     |
| /reports      | FileText       | —     |

## Classes CSS

```css
/* Item ativo */
.nav-item-active {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-muted);  /* rgba(29,78,216,0.08) */
}

/* Item inativo */
.nav-item {
  /* ... mesmo padding/radius */
  color: var(--color-text-secondary);
}
.nav-item:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}
```

## Avatar de Guardião

O avatar do usuário usa a cor do guardião:

```tsx
/* Guardian A → azul, Guardian B → rosa */
<div style={{
  background: user?.role === 'GUARDIAN_1'
    ? 'var(--color-guardian-a)'
    : 'var(--color-guardian-b)',
  borderRadius: 'var(--radius-full)',
  width: 'var(--avatar-md)',    /* 36px */
  height: 'var(--avatar-md)',
}} aria-hidden="true">
  {user?.fullName?.charAt(0)}
</div>
```

## Acessibilidade

- ✅ `role="navigation"` com `aria-label="Navegação principal"`
- ✅ NavLink com `aria-label` incluindo count de badge: `"Chat, 3 notificações"`
- ✅ Badge de notificação com `aria-label` semântico
- ✅ Botão de fechar sidebar (mobile) com `aria-label="Fechar menu de navegação"`
- ✅ Botão de logout com `aria-label="Sair da conta"`
- ✅ Logo com `aria-hidden="true"` no Shield icon

## Comportamento Responsivo

```
Mobile  (< lg): Sidebar como drawer overlay — botão de fechar visível
Desktop (≥ lg): Sidebar fixo lateral — botão de fechar oculto
```

```tsx
/* AppLayout gerencia a visibilidade */
<aside className={`
  fixed lg:relative
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  transition-transform duration-normal
`}>
  <Sidebar onClose={() => setIsSidebarOpen(false)} />
</aside>
```
