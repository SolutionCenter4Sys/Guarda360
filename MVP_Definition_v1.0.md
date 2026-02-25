# MVP Definition — Guarda360°

**Versão**: 1.0  
**Data**: 2026-02-24  
**Status**: ✅ Aprovado (91% consenso Party Mode)

---

## 1. Visão do MVP

> "Um app que permite que dois responsáveis legais registrem, de forma imutável e com valor jurídico, toda a convivência, comunicação, movimentação financeira e incidentes relacionados ao filho — com exportação de relatórios prontos para uso em processos judiciais."

---

## 2. Proposta de Valor Central

| Pilar | Descrição |
|-------|-----------|
| **Registro Imutável** | Tudo o que acontece fica registrado com timestamp do servidor — nada pode ser apagado |
| **Validade Jurídica** | Hash SHA-256 em todos os registros — rastreabilidade e integridade garantidas |
| **Transparência Controlada** | Cada ator vê apenas o que deve ver — permissões granulares por módulo |
| **Exportação Judicial** | PDF profissional gerado em minutos, pronto para o juízo |

---

## 3. Escopo do MVP

### Incluído no MVP ✅

**EP-01 — Identidade & Acesso**
- [x] Cadastro de responsáveis (nome, CPF, email, senha)
- [x] Verificação de email
- [x] Cadastro e perfil dos filhos
- [x] Convite e aceite entre co-guardiões
- [x] Autenticação segura (JWT + refresh token)
- [x] Permissões básicas por perfil (Resp. 1 / Resp. 2 / Advogado)

**EP-02 — Guarda & Convivência**
- [x] Configuração do tipo de guarda
- [x] Calendário mensal de convivência
- [x] Check-in e check-out de visitas
- [x] Registro de cumprimento, atraso, falta e cancelamento
- [x] Notificações de visitas próximas (24h antes)

**EP-03 — Comunicação Monitorada**
- [x] Chat em tempo real (WebSocket)
- [x] Envio de áudio e arquivos
- [x] Mensagens com proibição de exclusão
- [x] Marcação de mensagem como juridicamente relevante
- [x] Exportação de chat em PDF

**EP-04 — Gestão Financeira**
- [x] Configuração e registro de pensão alimentícia
- [x] Upload de comprovante de pagamento
- [x] Despesas extraordinárias com aprovação/contestação
- [x] Relatório financeiro mensal
- [x] Alertas de vencimento de pensão

**EP-06 — Ocorrências & Incidentes**
- [x] Registro formal de ocorrências (tipo + gravidade + narrativa)
- [x] Upload de evidências
- [x] Hash de integridade por ocorrência

**EP-07 — Relatórios Jurídicos**
- [x] Linha do tempo unificada
- [x] Exportação PDF com todos os módulos
- [x] Hash SHA-256 do relatório

---

### Fora do MVP ❌

- EP-05 (Saúde & Escola) — movido para Fase 2
- F-03.07 (IA detecção linguagem ofensiva) — Fase 2
- F-07.11 (Modo Judicial Premium) — Fase 2
- F-07.10 (Assinaturas Digitais ICP-Brasil) — Fase 3
- Login Social (Google/Apple) — Fase 2
- Portal de Advogados — Fase 3

---

## 4. Critérios de Sucesso do MVP

| KPI | Meta |
|-----|------|
| Cadastro completo (responsável + filho + co-guardião) | < 5 minutos |
| Calendário carregado com eventos | < 2 segundos |
| Mensagem entregue no chat | < 2 segundos |
| Relatório PDF gerado | < 3 minutos |
| Hash de integridade presente | 100% dos registros |
| Uptime | > 99,5% |
| NPS (primeiros usuários) | > 50 |

---

## 5. Plataformas do MVP

| Plataforma | Stack | Prioridade |
|-----------|-------|-----------|
| Web (React) | React 18 + TypeScript + Vite | P0 — MVP |
| Backend API | Node.js + NestJS + TypeScript | P0 — MVP |
| Banco de Dados | PostgreSQL 16 | P0 — MVP |
| Cache/WebSocket | Redis 7 | P0 — MVP |
| File Storage | AWS S3 | P0 — MVP |
| Mobile (React Native) | React Native + Expo | Fase 2 |

---

## 6. Timeline do MVP

| Marco | Semana | Entregável |
|-------|--------|-----------|
| M1 | Sem. 1-2 | Banco de dados + autenticação + cadastro |
| M2 | Sem. 3-4 | Calendário de convivência |
| M3 | Sem. 5-7 | Chat monitorado (WebSocket) |
| M4 | Sem. 8-9 | Gestão financeira |
| M5 | Sem. 10 | Ocorrências & incidentes |
| M6 | Sem. 11-12 | Relatórios PDF + integração final |

**Duração total**: 12 semanas (3 meses)

---

## 7. Modelo de Monetização

| Plano | Preço | Features |
|-------|-------|---------|
| **Free** | R$ 0 | Cadastro + Calendário básico + Chat (30 dias histórico) |
| **Premium** | R$ 39,90/mês | Tudo do Free + Relatórios PDF + Ocorrências + Hash + 2 anos histórico |
| **Judicial** | R$ 89,90/mês | Tudo do Premium + Modo Judicial + Assinatura Digital + Advogado vinculado |

---

## 8. Aprovação

- [x] @the-empresario — Aprovado
- [x] @the-visionary — Aprovado
- [x] Stakeholder principal (Fabiano Piva / PAM Soluções) — **Aguardando confirmação**
