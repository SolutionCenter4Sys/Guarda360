# EP-05 — Saúde & Desenvolvimento Escolar

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Centralizar todas as informações de saúde e educação dos filhos em um único lugar acessível por ambos os responsáveis: agenda médica, carteira de vacinação, atestados, boletins escolares e comunicados da escola. Garante que ambos os pais estejam informados igualmente sobre o desenvolvimento da criança.

---

## 2. Problema que Resolve

Em famílias separadas, frequentemente um dos pais não tem acesso às informações de saúde e escola do filho, gerando assimetria de informação, conflitos e até alienação parental velada. O Guarda360° garante acesso igual para ambos os responsáveis.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor ao filho** | Continuidade de cuidados — nenhum responsável fica "sem saber" |
| **Prevenção de conflitos** | Elimina "você nunca me contou sobre a consulta" |
| **Valor jurídico** | Histórico médico e escolar pode ser usado em processos de guarda |
| **Diferencial** | Integração com agenda médica e comunicados da escola |

---

## 4. ROI Estimado

- **Impacto**: **Médio**
- **Justificativa**: Funcionalidade de alto valor percebido, mas não urgente para o MVP inicial
- **Retenção**: Alta — pais acessam frequentemente para vacinas, consultas e boletins
- **Upsell**: Histórico médico completo como feature Premium

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-05.01 | Agenda médica compartilhada | Alta |
| F-05.02 | Carteira de vacinação digital | Alta |
| F-05.03 | Upload e gestão de atestados médicos | Alta |
| F-05.04 | Upload de boletins escolares | Alta |
| F-05.05 | Registro de comunicados da escola | Média |
| F-05.06 | Notificações de consultas agendadas | Média |
| F-05.07 | Histórico médico unificado por filho | Alta |
| F-05.08 | Contatos de emergência (médico, escola) | Média |

---

## 6. Critérios de Sucesso

- [ ] Ambos os responsáveis recebem notificação ao adicionar consulta/boletim
- [ ] Histórico médico completo acessível por ambos os pais
- [ ] Upload de documentos em < 10 segundos
- [ ] Vacinas com alertas de próxima dose

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Um responsável bloquear acesso do outro a info de saúde | Alto | Regra: ambos os responsáveis sempre veem — override judicial |
| Volume de documentos médicos | Médio | S3 + compressão de PDFs/imagens |
| Privacidade de dados de saúde | Alto | Criptografia + LGPD + acesso por consentimento |

---

## 8. Dependências

- EP-01: Identidade & Acesso (perfis dos filhos)
- Serviço de armazenamento S3
- Serviço de notificações
