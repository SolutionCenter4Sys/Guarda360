# 01 — C4 Level 1: Diagrama de Contexto — Guarda360°

**Versão**: 2.0 | **Agente**: @the-architect | **Data**: 2026-02-24  
**Alteração**: Backend .NET 8 | Cloud Azure

---

## Diagrama de Contexto (C4-L1)

```mermaid
C4Context
    title Sistema Guarda360° — Visão de Contexto

    Person(resp1, "Responsável 1", "Pai ou mãe com guarda — acessa calendário, chat, finanças e relatórios")
    Person(resp2, "Responsável 2", "Co-guardião — acessa os mesmos módulos com permissões configuráveis")
    Person(advogado, "Advogado de Família", "Acesso read-only a relatórios e ocorrências do cliente")
    Person(mediador, "Psicólogo / Mediador", "Acesso controlado a chat e ocorrências")
    Person(admin, "Administrador do Sistema", "Suporte técnico — sem acesso a dados sensíveis")

    System(guarda360, "Guarda360°", "Plataforma de gestão de guarda compartilhada com valor jurídico — ASP.NET Core 8 + React 18 hospedado no Azure")

    System_Ext(azureEmail, "Azure Communication Services", "Envio de emails transacionais e notificações (verificação, relatórios, alertas)")
    System_Ext(azureBlob, "Azure Blob Storage", "Armazenamento de mídias, comprovantes, evidências e PDFs gerados")
    System_Ext(fcm, "Firebase FCM", "Notificações push (web e mobile futuro)")
    System_Ext(questpdf, "QuestPDF Worker Service", "Geração de relatórios em PDF (.NET Worker consumindo Azure Service Bus)")

    Rel(resp1, guarda360, "Usa", "HTTPS / WSS (SignalR)")
    Rel(resp2, guarda360, "Usa", "HTTPS / WSS (SignalR)")
    Rel(advogado, guarda360, "Consulta relatórios", "HTTPS")
    Rel(mediador, guarda360, "Acessa ocorrências autorizadas", "HTTPS")
    Rel(admin, guarda360, "Administra plataforma", "HTTPS")

    Rel(guarda360, azureEmail, "Envia emails", "Azure Communication Services SDK")
    Rel(guarda360, azureBlob, "Armazena/recupera arquivos", "Azure Storage SDK / SAS tokens")
    Rel(guarda360, fcm, "Envia notificações push", "FCM REST API v1")
    Rel(guarda360, questpdf, "Solicita geração de PDF", "Azure Service Bus (fila gerenciada)")
```

---

## Descrição dos Atores

| Ator | Tipo | Interação Principal |
|------|------|---------------------|
| Responsável 1 | Usuário Primário | Todas as funcionalidades do app |
| Responsável 2 | Usuário Primário | Todas as funcionalidades (mesmas permissões configuráveis) |
| Advogado de Família | Usuário Secundário | Consulta relatórios e ocorrências de clientes |
| Psicólogo/Mediador | Usuário Secundário | Acesso read-only controlado |
| Administrador | Usuário Interno | Gestão da plataforma (sem dados pessoais) |

## Sistemas Externos

| Sistema | Tipo | Propósito |
|---------|------|-----------|
| Azure Communication Services (Email) | Azure PaaS | Email transacional — verificação de conta, notificações, entrega de relatórios |
| Azure Blob Storage | Azure PaaS | Fotos, comprovantes, áudios, PDFs gerados — SAS tokens para acesso seguro |
| Firebase FCM | SaaS Google | Push notifications para web e mobile (futuro) |
| QuestPDF Worker Service | Internal Worker .NET | Renderização de relatórios legais em PDF com hash SHA-256 |
