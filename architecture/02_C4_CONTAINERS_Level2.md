# 02 — C4 Level 2: Diagrama de Containers — Guarda360°

**Versão**: 2.0 | **Agente**: @the-architect | **Data**: 2026-02-24  
**Alteração**: Backend .NET 8 + ASP.NET Core | Cloud Azure

---

## Diagrama de Containers (C4-L2)

```mermaid
C4Container
    title Guarda360° — Containers (.NET 8 + Azure)

    Person(resp1, "Responsável 1 / 2", "Acessa via Web App")
    Person(advogado, "Advogado / Mediador", "Acessa relatórios")

    Container_Boundary(web, "Frontend") {
        Container(spa, "React SPA", "React 18 + TypeScript + Vite", "Interface web responsiva — dashboard, calendário, chat, finanças, ocorrências, relatórios. Hospedado em Azure Static Web Apps")
    }

    Container_Boundary(api, "Backend") {
        Container(apiGateway, "ASP.NET Core API", ".NET 8 LTS + C# + EF Core 8", "API REST + SignalR Hub — orquestra todos os módulos de negócio. Clean Architecture + CQRS via MediatR. Hospedado em Azure App Service (Linux P1v3)")
        Container(pdfWorker, "PDF Worker Service", ".NET 8 Worker Service + QuestPDF", "Processa jobs de geração de PDF de forma assíncrona, consumindo Azure Service Bus. Hospedado em Azure Container Apps")
    }

    Container_Boundary(data, "Dados") {
        ContainerDb(postgres, "PostgreSQL 16", "Azure DB for PostgreSQL Flexible Server", "Dados de usuários, eventos, mensagens, finanças, ocorrências — tabelas INSERT-ONLY para dados jurídicos. Row Level Security ativo")
        ContainerDb(redis, "Azure Cache for Redis", "Redis 7 — Standard C1", "Cache de sessões JWT, backplane do SignalR (Azure SignalR Service), cache de queries frequentes")
    }

    Container_Boundary(messaging, "Mensageria") {
        Container(serviceBus, "Azure Service Bus", "Standard Tier — Queue pdf-jobs", "Fila de jobs para geração de PDFs — Dead Letter Queue, retentativas e rastreamento nativos")
        Container(signalR, "Azure SignalR Service", "Standard Tier — 1 Unit", "Backplane gerenciado para chat em tempo real — escala horizontal automática, até 1K conexões simultâneas")
    }

    Container_Boundary(storage, "Storage") {
        Container(blob, "Azure Blob Storage", "LRS — Containers privados", "Comprovantes, áudios, fotos, evidências e PDFs gerados. SAS tokens com expiração configurável")
    }

    System_Ext(azureEmail, "Azure Communication Services", "Email transacional")
    System_Ext(fcm, "Firebase FCM", "Push Notifications")

    Rel(resp1, spa, "Usa", "HTTPS")
    Rel(advogado, spa, "Consulta", "HTTPS")

    Rel(spa, apiGateway, "API calls + SignalR WebSocket", "HTTPS / WSS")
    Rel(apiGateway, postgres, "Lê/Escreve", "TCP / Entity Framework Core")
    Rel(apiGateway, redis, "Cache de sessões + queries", "TCP / StackExchange.Redis")
    Rel(apiGateway, signalR, "Hub de mensagens em tempo real", "Azure SignalR Service SDK")
    Rel(apiGateway, blob, "Upload/Download arquivos", "Azure Storage SDK + SAS tokens")
    Rel(apiGateway, azureEmail, "Envia emails", "Azure Communication Services SDK")
    Rel(apiGateway, fcm, "Envia push", "FCM REST API v1")
    Rel(apiGateway, serviceBus, "Enfileira job de PDF", "Azure.Messaging.ServiceBus SDK")
    Rel(pdfWorker, serviceBus, "Consome jobs de PDF", "Azure.Messaging.ServiceBus SDK")
    Rel(pdfWorker, postgres, "Lê dados para relatório", "TCP / EF Core (read-only)")
    Rel(pdfWorker, blob, "Salva PDF gerado", "Azure Storage SDK")
    Rel(pdfWorker, azureEmail, "Notifica por email", "Azure Communication Services SDK")
```

---

## Descrição dos Containers

### React SPA (Frontend)
- **Tecnologia**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **Responsabilidade**: Interface do usuário completa — todas as telas do MVP
- **Comunicação**: REST para dados + SignalR WebSocket para chat em tempo real
- **Hospedagem**: Azure Static Web Apps (CDN global integrado, deploy direto do GitHub Actions)

### ASP.NET Core API (Backend)
- **Tecnologia**: .NET 8 LTS + C# + Entity Framework Core 8 + MediatR (CQRS)
- **Responsabilidade**: Toda a lógica de negócio — autenticação, RBAC, calendário, chat, finanças, ocorrências, relatórios
- **Comunicação**: REST (HTTP) + SignalR WebSocket para chat
- **Hospedagem**: Azure App Service (Linux, P1v3) com slot de staging para blue-green deployment
- **Padrão**: Clean Architecture (Domain → Application → Infrastructure → API)

### PDF Worker Service
- **Tecnologia**: .NET 8 Worker Service + QuestPDF + Azure.Messaging.ServiceBus
- **Responsabilidade**: Processar jobs de geração de PDF assincronamente
- **Comunicação**: Consome fila Azure Service Bus → Consulta PostgreSQL → Gera PDF (QuestPDF) → Salva Blob Storage → Notifica por email
- **Hospedagem**: Azure Container Apps (serverless — paga apenas durante o processamento)

### Azure Database for PostgreSQL Flexible Server
- **Responsabilidade**: Persistência principal de todos os dados
- **Hospedagem**: Azure Database for PostgreSQL Flexible Server (B2ms — 2 vCores, 8 GB RAM)
- **Configuração especial**: INSERT-only triggers em tabelas jurídicas, Row Level Security ativo, PITR backup 35 dias

### Azure Cache for Redis (Standard C1)
- **Responsabilidade**: Cache de sessões JWT/refresh tokens, backplane do SignalR, cache de queries de relatório
- **Hospedagem**: Azure Cache for Redis (1 GB, Standard C1 — com réplica de failover)

### Azure Blob Storage
- **Responsabilidade**: Armazenamento de arquivos binários (comprovantes, áudios, fotos, evidências, PDFs)
- **Configuração**: Containers privados, SAS tokens com expiração configurável (presigned URLs), lifecycle rules para tier de acesso

### Azure Service Bus
- **Responsabilidade**: Fila de jobs para geração de PDFs — garante entrega exactly-once
- **Configuração**: Standard tier, Dead Letter Queue ativo, retentativas automáticas (5x), lock duration 5 min

### Azure SignalR Service
- **Responsabilidade**: Backplane gerenciado para WebSocket do chat — elimina necessidade de Redis Pub/Sub apenas para WebSocket
- **Configuração**: Standard tier, 1 unit (1.000 conexões simultâneas), modo serverless compatível
