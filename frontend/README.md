# Guarda360° — Frontend MVP

> Plataforma de gestão de guarda compartilhada com valor jurídico.

## 🚀 Como rodar

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:3000**

## 🔐 Login (Demo)

Use qualquer e-mail e senha para entrar. Os dados são todos mock.

**Credenciais pré-preenchidas:**
- E-mail: `maria.silva@email.com`
- Senha: `Senha@123`

---

## 📱 Módulos implementados (Step 6 — MVP)

| Módulo | Rota | Descrição |
|--------|------|-----------|
| **Login** | `/login` | Autenticação com JWT mock |
| **Cadastro** | `/register` | Registro + verificação e-mail |
| **Dashboard** | `/dashboard` | KPIs, próximas visitas, resumo |
| **Filhos** | `/children` | Cadastro e co-guardião invite |
| **Calendário** | `/calendar` | Calendário de convivência (Guardian A/B) |
| **Chat** | `/chat` | Comunicação monitorada imutável |
| **Financeiro** | `/financial` | Pensão + despesas extraordinárias |
| **Ocorrências** | `/incidents` | Registro de incidentes com hash |
| **Relatórios** | `/reports` | PDF jurídico + Timeline unificada |

---

## 🎨 Stack

- **React 18** + TypeScript (strict)
- **Vite 6** (dev server + build)
- **Tailwind CSS 3** (design tokens Guarda360°)
- **React Router DOM 6** (client-side routing)
- **date-fns 3** (formatação de datas)
- **lucide-react** (ícones)
- **clsx** (class merging)

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── layout/         # AppLayout, Sidebar, TopBar
│   └── ui/             # Badge, Card, KpiCard
├── context/            # AuthContext
├── mocks/              # Mock data (todos módulos)
├── pages/              # Páginas do MVP
└── types/              # TypeScript interfaces
```

## 📋 Design System

Baseado no Design System Guarda360° v1.0:
- **Primary**: `#1D4ED8` (Azul Institucional — WCAG AAA)
- **Guardian A**: `#2563EB` (Responsável 1 — azul)
- **Guardian B**: `#DB2777` (Responsável 2 — magenta)
- **Font**: Inter + JetBrains Mono (hashes)
- **Theme**: Light-first

---

## 📂 Workflow (Step 6 — Wireframe/Frontend MVP)

Conforme `Workflow-12-Steps-Produto-v1.0.md`:
- ✅ Todas as telas do MVP implementadas
- ✅ Design System aplicado consistentemente
- ✅ Navegação funcional
- ✅ Mocks de API configurados
- ✅ Frontend roda localmente sem erros

**Próximo step**: Step 7 — Teste de Usabilidade (`@the-critico`)
