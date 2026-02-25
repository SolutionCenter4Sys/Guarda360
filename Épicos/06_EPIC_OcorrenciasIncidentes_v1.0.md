# EP-06 — Ocorrências & Incidentes

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Sistema de registro formal de fatos relevantes relacionados à guarda: alienação parental, descumprimentos, situações de risco, violência psicológica e qualquer incidente que possa ter relevância jurídica. Cada ocorrência é classificada por gravidade, com campo narrativo e anexos, gerando um registro imutável e exportável.

---

## 2. Problema que Resolve

Pais que sofrem alienação parental ou descumprimento de guarda frequentemente não documentam os incidentes de forma adequada, perdendo provas cruciais para processos judiciais. O Guarda360° cria um sistema formal de documentação com valor probatório.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor jurídico** | Registro formal com timestamp que substitui BO em casos menores |
| **Proteção** | Detecta padrões de alienação parental por frequência/gravidade |
| **Diferencial** | Classificação automática por gravidade + notificação para advogados |
| **Impacto social** | Protege crianças de situações de risco documentadas |

---

## 4. ROI Estimado

- **Impacto**: **Alto**
- **Justificativa**: Feature única no mercado — diretamente ligada ao diferencial jurídico do produto
- **Monetização**: Notificação automática para advogados e exportação judicial são Premium
- **Impacto Legal**: Pode ser peça central em processos de revisão de guarda

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-06.01 | Registro de ocorrência com campo narrativo | Alta |
| F-06.02 | Classificação por tipo (alienação, descumprimento, risco, outro) | Alta |
| F-06.03 | Classificação por gravidade (Baixa, Média, Alta, Crítica) | Alta |
| F-06.04 | Upload de evidências (fotos, áudios, documentos) | Alta |
| F-06.05 | Timestamp imutável de cada ocorrência | Alta |
| F-06.06 | Histórico de ocorrências por filho | Alta |
| F-06.07 | Notificação para advogado cadastrado (se ocorrência Alta/Crítica) | Média |
| F-06.08 | Painel de análise de padrões (frequência, tipo, período) | Baixa |
| F-06.09 | Exportação de ocorrências para relatório jurídico | Alta |

---

## 6. Critérios de Sucesso

- [ ] Registro de ocorrência em < 2 minutos (campo narrativo + foto + gravidade)
- [ ] Hash de integridade gerado automaticamente para cada ocorrência
- [ ] Exportação disponível em relatório jurídico (EP-07)
- [ ] Advogado notificado em < 5 minutos para ocorrências críticas

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Uso abusivo para registrar ocorrências falsas | Alto | Log imutável expõe o padrão de abuso |
| Privacidade — uma parte não vê registros da outra | Alto | Ocorrência registrada é privada até exportação judicial |
| Volume de evidências (fotos, áudios) | Médio | S3 + limites por plano |

---

## 8. Dependências

- EP-01: Identidade & Acesso
- EP-07: Relatórios Jurídicos (exportação)
- Serviço S3 (evidências)
- Serviço de notificações
