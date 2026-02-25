# Product Backlog & Parking Lot — Guarda360°

**Versão**: 1.0  
**Data**: 2026-02-24

---

## 1. Backlog Fase 2 (Pós-MVP)

| ID | Feature | WSJF | Épico | Esforço |
|----|---------|------|-------|---------|
| F-05.01 | Agenda médica compartilhada | 3.6 | EP-05 | 5 |
| F-05.02 | Carteira de vacinação digital | 7.0 | EP-05 | 3 |
| F-05.03 | Upload de atestados médicos | 5.0 | EP-05 | 3 |
| F-05.04 | Boletins escolares | 3.7 | EP-05 | 3 |
| F-05.05 | Comunicados da escola | 3.0 | EP-05 | 3 |
| F-02.07 | Solicitação de troca de dia | 3.6 | EP-02 | 5 |
| F-02.03 | Trocas automáticas quinzenais | 4.0 | EP-02 | 8 |
| F-02.10 | Exportação iCal | 2.5 | EP-02 | 3 |
| F-03.07 | Detecção linguagem ofensiva IA | 2.6 | EP-03 | 8 |
| F-03.09 | Chat com terceiros (read-only) | 2.0 | EP-03 | 5 |
| F-04.09 | Histórico de inadimplência | 4.0 | EP-04 | 3 |
| F-07.11 | Modo Judicial Premium | 3.3 | EP-07 | 8 |
| F-01.04 | Cadastro de terceiros autorizados | 3.5 | EP-01 | 5 |
| F-01.08 | Integração com advogados/profissionais | 3.0 | EP-01 | 8 |
| F-06.07 | Notificação para advogado (Alta/Crítica) | 4.5 | EP-06 | 3 |
| F-06.08 | Painel de análise de padrões | 2.5 | EP-06 | 8 |
| Login Social | Login com Google/Apple | 3.0 | EP-01 | 3 |
| Mobile | App React Native + Expo | 5.0 | Cross | 40 |

---

## 2. Backlog Fase 3 (Plataforma B2B)

| ID | Feature | Épico | Esforço |
|----|---------|-------|---------|
| F-07.10 | Assinaturas Digitais (ICP-Brasil) | EP-07 | 13 |
| Portal Adv. | Dashboard de múltiplos clientes | Novo | 21 |
| API Pública | API REST pública para escritórios | Novo | 13 |
| Analytics | Dashboard de padrões e relatórios | Novo | 13 |
| Integração Vara | Exportação no formato da Vara da Família | Novo | 21 |
| Multi-filho | Múltiplos filhos no mesmo calendário | EP-02 | 8 |

---

## 3. Parking Lot (Ideias Futuras — Sem Prazo)

| Ideia | Origem | Valor |
|-------|--------|-------|
| Geolocalização no check-in/check-out | @the-artista | Médio |
| Mediação digital com assistente de IA | @the-visionary | Alto |
| Integração direta com sistema do TJ | @the-empresario | Muito Alto |
| Widget para advogados no WhatsApp | @the-critico | Médio |
| Psicólogo com acesso controlado ao chat | @the-writer-back | Alto |
| Biometria para autenticação (facial) | @the-security-guardian | Médio |
| Modo co-parenting com mediador | @the-artista | Alto |
| Integração com plano de saúde | @the-data-master | Médio |
| Notificações por SMS (fallback) | @the-devops-master | Baixo |
| App para crianças mais velhas (> 12 anos) | @the-visionary | Alto |

---

## 4. Decisões de Descarte (e Justificativa)

| Feature | Decisão | Motivo |
|---------|---------|--------|
| Integração bancária PIX automático | Descartado — Fase 3+ | Regulatório complexo (BACEN), fora do escopo inicial |
| Videochamada nativa | Descartado — Fase 3+ | Alto custo de infra, concorre com WhatsApp Video |
| OCR de holerite para pensão % | Descartado — Fase 3 | Alta complexidade, baixa precisão aceitável no MVP |
| Verificação CPF na Receita Federal | Descartado — MVP | Custo de API, validação de formato suficiente para MVP |
