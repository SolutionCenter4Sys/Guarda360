# EP-03 — Comunicação Monitorada

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Canal de comunicação interno e seguro entre os responsáveis legais, com características que garantem validade jurídica: mensagens não podem ser excluídas, todo conteúdo é timestampado e exportável, e um sistema de IA pode detectar linguagem ofensiva ou alienação parental.

---

## 2. Problema que Resolve

Pais em litígio frequentemente usam WhatsApp para comunicação, onde mensagens podem ser editadas, apagadas ou tiradas de contexto. O Guarda360° cria um canal com validade jurídica onde nada pode ser alterado retroativamente.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor jurídico** | Chat exportável como prova em processos judiciais |
| **Proteção** | Detecção automática de alienação parental e linguagem abusiva |
| **Praticidade** | Único canal oficial — elimina confusão entre WhatsApp, SMS, email |
| **Diferencial** | Mensagens marcadas como "juridicamente relevantes" |

---

## 4. ROI Estimado

- **Impacto**: **Alto**
- **Justificativa**: Diferencial competitivo forte — nenhum app similar oferece chat com validade jurídica integrada
- **Monetização**: Detecção de IA e modo judicial são features Premium
- **Retenção**: Pais usam diariamente para coordenação

---

## 5. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-03.01 | Chat interno entre responsáveis | Alta |
| F-03.02 | Envio de áudios e anexos (fotos, docs) | Alta |
| F-03.03 | Proibição de exclusão de mensagens | Alta |
| F-03.04 | Timestamp imutável em cada mensagem | Alta |
| F-03.05 | Marcação de mensagens juridicamente relevantes | Alta |
| F-03.06 | Exportação do chat selecionado (PDF) | Alta |
| F-03.07 | Detecção de linguagem ofensiva por IA | Média |
| F-03.08 | Notificação de mensagem não respondida | Média |
| F-03.09 | Chat com terceiros autorizados (modo leitura para profissionais) | Baixa |

---

## 6. Critérios de Sucesso

- [ ] Nenhuma mensagem pode ser excluída por nenhum usuário
- [ ] Exportação PDF disponível em < 30 segundos
- [ ] IA detecta > 90% das palavras ofensivas (recall)
- [ ] Hash de integridade gerado para cada conversa exportada

---

## 7. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Falso positivo na detecção de IA | Médio | Alerta apenas — não bloqueia mensagem |
| Volume de armazenamento de mídia | Médio | S3 + compressão + limites por plano |
| Privacidade do chat vs acesso de profissionais | Alto | Permissão explícita do responsável |

---

## 8. Dependências

- EP-01: Identidade & Acesso
- Serviço de armazenamento S3
- Serviço de IA/NLP (opcional)
- Criptografia ponta a ponta
