# EP-01 — Identidade & Acesso

**Versão**: 1.0  
**Agente**: @the-visionary  
**Data**: 2026-02-24  
**Status**: Aprovado

---

## 1. Descrição do Épico

Gerenciar a identidade de todos os atores do sistema Guarda360°: responsáveis legais, filhos, terceiros autorizados e profissionais (advogados, psicólogos, mediadores). Garantir autenticação segura, permissões granulares por perfil e rastreabilidade de acessos com valor jurídico.

---

## 2. Problema que Resolve

Processos de guarda envolvem múltiplos atores com diferentes níveis de acesso à informação. Sem controle centralizado de identidade e permissões, dados sensíveis da criança podem ser mal utilizados, e a rastreabilidade de responsabilidades torna-se impossível em processos judiciais.

---

## 3. Valor de Negócio

| Dimensão | Descrição |
|----------|-----------|
| **Valor ao usuário** | Pais têm controle total sobre quem vê informações dos filhos |
| **Compliance** | Conformidade com LGPD — dado sensível de menor de idade |
| **Diferencial** | Permissões granulares por módulo (ex: advogado vê chat, não vê saúde) |
| **Segurança jurídica** | Logs de acesso imutáveis com valor probatório |

---

## 4. ROI Estimado

- **Impacto**: **Alto**
- **Justificativa**: Épico fundacional — sem ele nenhuma outra funcionalidade pode operar com segurança
- **Redução de Risco**: 95% (mitiga LGPD, fraude, acesso indevido)
- **Retorno**: Base para monetização via planos (Free → Premium → Judicial)

---

## 5. Atores / Perfis

| Perfil | Papel |
|--------|-------|
| **Responsável 1** | Guardião principal — acesso completo ao filho |
| **Responsável 2** | Co-guardião — acesso compartilhado configurável |
| **Terceiro Autorizado** | Avó, babá — acesso limitado a módulos específicos |
| **Advogado** | Acesso read-only a módulos jurídicos |
| **Psicólogo / Mediador** | Acesso read-only a comunicação e ocorrências |
| **Admin** | Suporte técnico — sem acesso a dados sensíveis |

---

## 6. Features Iniciais

| # | Feature | Prioridade |
|---|---------|-----------|
| F-01.01 | Cadastro de responsáveis com verificação de identidade | Alta |
| F-01.02 | Cadastro e perfil dos filhos | Alta |
| F-01.03 | Convite e aceite entre responsáveis | Alta |
| F-01.04 | Cadastro de terceiros autorizados | Média |
| F-01.05 | Permissões granulares por perfil e módulo | Alta |
| F-01.06 | Autenticação (email/senha + 2FA) | Alta |
| F-01.07 | Recuperação de conta e auditoria de acessos | Média |
| F-01.08 | Integração com advogados/profissionais | Baixa |

---

## 7. Critérios de Sucesso

- [ ] Responsável consegue cadastrar filho e convidar co-guardião em < 5 minutos
- [ ] Permissões refletem exatamente o que foi configurado (0 vazamentos)
- [ ] Log de acesso está disponível e imutável
- [ ] Conformidade LGPD verificada por jurídico

---

## 8. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Verificação de identidade falsa | Alto | CPF + validação facial opcional |
| Conflito de acesso entre pais | Alto | Regras de permissão mediadas pela Vara |
| Vazamento de dados do menor | Crítico | Criptografia + RBAC rigoroso |

---

## 9. Dependências

- Infraestrutura de autenticação (JWT + OAuth2)
- Banco de dados de usuários (PostgreSQL)
- Serviço de email (notificações e convites)
