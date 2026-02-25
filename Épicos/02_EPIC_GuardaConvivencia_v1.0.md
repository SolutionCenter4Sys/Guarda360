# EP-02 — Guarda & Convivência

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Núcleo operacional do Guarda360°. Permite criar, gerenciar e registrar o calendário de convivência entre pais e filhos — incluindo visitas regulares, feriados, férias, datas especiais e trocas. Cada evento gera log imutável com data/hora e status de cumprimento, criando o histórico probatório de convivência.

---

## 2. Problema que Resolve

Pais separados frequentemente têm conflitos sobre descumprimento de horários, trocas de dias e férias. Sem registro formal, é impossível provar em juízo que acordos foram ou não cumpridos. O Guarda360° cria esse registro com valor jurídico automaticamente.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor ao usuário** | Elimina conflitos verbais — tudo registrado e datado |
| **Diferencial** | Calendário compartilhado com confirmação dupla e log imutável |
| **Valor jurídico** | Prova de cumprimento ou descumprimento de guarda |
| **Automatização** | Trocas quinzenais automáticas sem intervenção manual |

---

## 4. ROI Estimado

- **Impacto**: **Alto**
- **Justificativa**: Feature principal e razão de ser do produto — gera engajamento diário
- **Retenção**: Alta — pais checam calendário múltiplas vezes por semana
- **Monetização**: Feature avançada (trocas automáticas, modo judicial) em plano Premium

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-02.01 | Configuração do tipo de guarda (compartilhada/unilateral) | Alta |
| F-02.02 | Criação e edição do calendário de convivência | Alta |
| F-02.03 | Configuração de trocas automáticas (quinzenal, etc.) | Alta |
| F-02.04 | Gestão de feriados, férias e datas especiais | Alta |
| F-02.05 | Confirmação de visita (check-in / check-out) | Alta |
| F-02.06 | Registro de cumprimento, atraso, falta e cancelamento | Alta |
| F-02.07 | Solicitação de troca de dia (com aceite/rejeição) | Média |
| F-02.08 | Notificações de visitas próximas | Média |
| F-02.09 | Visualização de histórico de convivência | Alta |
| F-02.10 | Exportação do calendário (PDF / iCal) | Baixa |

---

## 6. Critérios de Sucesso

- [ ] Calendário reflete exatamente o acordo judicial ou extrajudicial
- [ ] Cada evento registra data/hora de forma imutável
- [ ] Histórico de 12 meses disponível em < 2 segundos
- [ ] Notificações chegam com 24h de antecedência

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Edição indevida de registros passados | Crítico | Logs imutáveis — sem edição retroativa |
| Conflito de fuso horário | Médio | Armazenar em UTC, exibir local |
| Complexidade de regras de guarda | Alto | Configuração flexível por tipo de guarda |

---

## 8. Dependências

- EP-01: Identidade & Acesso (perfis dos responsáveis)
- Serviço de notificações push
- Banco de dados com suporte a eventos temporais
