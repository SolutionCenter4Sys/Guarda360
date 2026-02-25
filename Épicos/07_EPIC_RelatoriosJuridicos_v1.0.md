# EP-07 — Relatórios & Exportação Jurídica

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Motor de geração de relatórios do Guarda360°. Consolida dados de todos os módulos (convivência, comunicação, financeiro, incidentes) em documentos PDF prontos para uso em processos judiciais, mediação e assistência social. Inclui linha do tempo unificada, assinaturas digitais e modo judicial com hash de integridade.

---

## 2. Problema que Resolve

Advogados de família gastam horas compilando prints de WhatsApp, recibos em papel e registros dispersos para montar dossiês em processos de guarda. O Guarda360° gera automaticamente relatórios prontos para o juízo, com integridade garantida por hash criptográfico.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor jurídico** | Relatório com hash = documento com integridade verificável |
| **Economia** | Reduz horas de trabalho do advogado em 80% |
| **Diferencial** | Linha do tempo unificada — visão completa da vida da criança |
| **Monetização** | Principal feature Premium — razão do upgrade de plano |

---

## 4. ROI Estimado

- **Impacto**: **Crítico**
- **Justificativa**: Principal razão de pagamento pelo produto — advogados pagam por isso
- **Revenue Impact**: Feature Premium com maior conversão esperada (40%+ upgrade)
- **Mercado**: Escritórios de advocacia de família como cliente B2B

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-07.01 | Relatório de histórico de convivência | Alta |
| F-07.02 | Relatório de conversas selecionadas do chat | Alta |
| F-07.03 | Relatório financeiro (pagamentos e inadimplência) | Alta |
| F-07.04 | Relatório de incidentes registrados | Alta |
| F-07.05 | Linha do tempo unificada (todos os eventos) | Alta |
| F-07.06 | Seleção de período para o relatório | Alta |
| F-07.07 | Seleção de módulos a incluir no relatório | Alta |
| F-07.08 | Exportação em PDF com capa e formatação profissional | Alta |
| F-07.09 | Geração de hash de integridade (SHA-256) | Alta |
| F-07.10 | Assinaturas digitais em acordos pontuais | Média |
| F-07.11 | Modo Judicial — dados congelados e não editáveis | Alta |
| F-07.12 | Auditoria completa (log de quem acessou/alterou o quê) | Média |

---

## 6. Critérios de Sucesso

- [ ] Relatório gerado em < 60 segundos para período de 12 meses
- [ ] Hash SHA-256 verificável externamente
- [ ] PDF com formatação profissional pronta para uso judicial
- [ ] Modo Judicial ativado congela 100% dos dados em < 5 segundos

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Relatório com dados incorretos/manipulados | Crítico | Hash + log imutável + modo judicial |
| Performance para relatórios de longo período | Médio | Geração assíncrona + notificação por email |
| Validade jurídica questionada | Alto | Parceria com cartório digital / ICP-Brasil |

---

## 8. Dependências

- EP-02: Guarda & Convivência (dados de convivência)
- EP-03: Comunicação Monitorada (histórico de chat)
- EP-04: Gestão Financeira (dados financeiros)
- EP-05: Saúde & Escola (dados médicos/escolares)
- EP-06: Ocorrências & Incidentes (registros de incidentes)
- Serviço de geração de PDF (ex: Puppeteer/WeasyPrint)
- Serviço de assinatura digital (ICP-Brasil ou similar)
