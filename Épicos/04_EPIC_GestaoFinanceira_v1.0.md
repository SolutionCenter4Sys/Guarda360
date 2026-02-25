# EP-04 — Gestão Financeira (Despesas & Pensão)

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Gerenciar toda a dimensão financeira da guarda: pensão alimentícia (valor fixo ou percentual, datas de vencimento, registro de pagamentos) e despesas extraordinárias (saúde, escola, lazer) com fluxo de aprovação/contestação e relatórios para uso judicial.

---

## 2. Problema que Resolve

Conflitos financeiros são a principal fonte de litígios em processos de guarda. Sem registro formal de pagamentos e despesas, é impossível provar inadimplência ou pagamento em juízo. O Guarda360° cria um registro financeiro completo com comprovantes digitais.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor jurídico** | Prova de pagamento ou inadimplência de pensão |
| **Transparência** | Ambos os pais veem todas as despesas com comprovantes |
| **Automação** | Alertas de vencimento e cálculo automático de percentual |
| **Diferencial** | Fluxo de aprovação/contestação de despesas extraordinárias |

---

## 4. ROI Estimado

- **Impacto**: **Alto**
- **Justificativa**: Segunda causa de conflito mais comum em guarda — alta demanda do mercado
- **Monetização**: Relatórios financeiros em PDF como feature Premium
- **TAM**: Todo processo de pensão alimentícia no Brasil (milhões de processos ativos)

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-04.01 | Configuração de pensão alimentícia (valor/percentual/datas) | Alta |
| F-04.02 | Registro de pagamento de pensão | Alta |
| F-04.03 | Upload de comprovante de pagamento | Alta |
| F-04.04 | Cadastro de despesa extraordinária | Alta |
| F-04.05 | Fluxo de aprovação/contestação de despesa | Alta |
| F-04.06 | Upload de nota fiscal / comprovante de despesa | Alta |
| F-04.07 | Relatório mensal e anual financeiro | Alta |
| F-04.08 | Alertas de vencimento de pensão | Média |
| F-04.09 | Histórico de inadimplência | Alta |
| F-04.10 | Exportação PDF relatório financeiro | Alta |

---

## 6. Critérios de Sucesso

- [ ] Histórico financeiro de 24 meses disponível com comprovantes
- [ ] Relatório financeiro exportado em < 60 segundos
- [ ] Fluxo de aprovação/contestação completado em < 3 cliques
- [ ] Alertas chegam com 3 dias de antecedência

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Contestação de comprovante fraudulento | Alto | Hash do arquivo + metadados de upload |
| Cálculo de percentual sobre renda variável | Médio | Configuração manual com histórico de ajustes |
| Armazenamento de comprovantes (volume) | Médio | S3 + limites por plano |

---

## 8. Dependências

- EP-01: Identidade & Acesso
- Serviço de armazenamento S3 (comprovantes)
- EP-07: Relatórios Jurídicos (exportação)
