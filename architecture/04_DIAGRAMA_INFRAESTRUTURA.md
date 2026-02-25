# 04 — Diagrama de Infraestrutura — Guarda360°

**Versão**: 2.0 | **Agente**: @the-architect | **Data**: 2026-02-24  
**Alteração**: AWS → Microsoft Azure | Backend .NET 8

---

## Infraestrutura Azure — MVP

```mermaid
graph TB
    subgraph "Usuários"
        U1[Responsável 1 - Browser]
        U2[Responsável 2 - Browser]
        U3[Advogado - Browser]
    end

    subgraph "Azure - Brazil South (São Paulo)"
        AFD[Azure Front Door Standard\nCDN Global + WAF Policy OWASP 3.2\nWebSocket pass-through para SignalR]

        subgraph "Static Hosting"
            SWA[Azure Static Web Apps\nReact SPA - CDN global\nDeploy automático GitHub Actions]
        end

        subgraph "Azure Blob Storage - Containers"
            BLOB_MEDIA[guarda360-media\nMídias, comprovantes, evidências\nSAS tokens com expiração]
            BLOB_PDF[guarda360-reports\nPDFs gerados com hash SHA-256\nLifecycle: tier frio após 90 dias]
        end

        subgraph "Compute"
            APP_SVC[Azure App Service P1v3\nASP.NET Core 8 API - Linux\n2 instâncias Auto-scale\nSlot staging para blue-green]
            CONTAINER_APP[Azure Container Apps\n.NET 8 Worker Service\nQuestPDF - Geração de PDFs\nServerless - paga por execução]
        end

        subgraph "Mensageria e Real-time"
            SIGNALR_SVC[Azure SignalR Service\nStandard - 1 Unit\n1.000 conexões simultâneas\nChat em tempo real]
            SVC_BUS[Azure Service Bus\nStandard - Queue pdf-jobs\nDLQ + retentativas automáticas\nLock duration: 5 min]
        end

        subgraph "Dados"
            POSTGRES[Azure DB for PostgreSQL\nFlexible Server B2ms\n2 vCores - 8 GB RAM\nPITR backup 35 dias]
            REDIS[Azure Cache for Redis\nStandard C1 - 1 GB\nBackplane SignalR + cache sessões]
        end

        subgraph "Segurança"
            KEYVAULT[Azure Key Vault\nStandard - segredos e certificados\nConnection strings, JWT secret\n2FA TOTP seeds]
            MANAGED_ID[Managed Identity\nApp Service → Key Vault\nSem credenciais em código]
        end

        subgraph "Observabilidade"
            APP_INSIGHTS[Application Insights\nAPM - traces distribuídos\nDependency tracking\nCustom metrics]
            LOG_ANALYTICS[Log Analytics Workspace\nLogs centralizados\nKQL queries\nAlertas e Dashboards]
        end
    end

    subgraph "Externos"
        ACS[Azure Communication Services\nEmail transacional\nnoreply@guarda360.com.br]
        FCM[Firebase FCM\nPush notifications]
        GH[GitHub Actions\nCI/CD - OIDC Azure login\nSem credenciais armazenadas]
    end

    U1 & U2 & U3 --> AFD
    AFD --> SWA
    AFD --> APP_SVC
    APP_SVC --> POSTGRES
    APP_SVC --> REDIS
    APP_SVC --> BLOB_MEDIA
    APP_SVC --> SIGNALR_SVC
    APP_SVC --> SVC_BUS
    APP_SVC --> ACS
    APP_SVC --> FCM
    SVC_BUS --> CONTAINER_APP
    CONTAINER_APP --> POSTGRES
    CONTAINER_APP --> BLOB_PDF
    CONTAINER_APP --> ACS
    APP_SVC --> APP_INSIGHTS
    CONTAINER_APP --> APP_INSIGHTS
    APP_INSIGHTS --> LOG_ANALYTICS
    KEYVAULT --> APP_SVC
    KEYVAULT --> CONTAINER_APP
    MANAGED_ID --> KEYVAULT
    GH --> SWA
    GH --> APP_SVC
```

---

## Configuração de Rede (Virtual Network + Private Endpoints)

| Componente | Inbound | Outbound | Acesso |
|-----------|---------|---------|--------|
| Azure Front Door | 0.0.0.0/0 :443 | App Service :443, Static Web Apps | Público |
| App Service | Front Door :443 | PostgreSQL, Redis, Blob, SignalR, Service Bus | VNet Integration |
| Container Apps | Service Bus (pull) | PostgreSQL, Blob, ACS | VNet Integration |
| PostgreSQL Flexible Server | App Service + Container Apps | — | Private Endpoint |
| Azure Cache for Redis | App Service | — | Private Endpoint |
| Azure Blob Storage | App Service + Container Apps | — | Private Endpoint |
| Azure Service Bus | App Service (send) + Container Apps (receive) | — | Private Endpoint |
| Azure SignalR Service | App Service + Clients via Front Door | — | Gerenciado |

---

## CI/CD Pipeline (GitHub Actions + Azure OIDC)

```yaml
Trigger: push to main branch

Jobs:
  1. test:
     - dotnet test (unit + integration)
     - npm test (frontend)

  2. build-frontend:
     - npm run build
     - Deploy: Azure Static Web Apps Action (OIDC)

  3. build-backend:
     - dotnet publish -c Release
     - docker build -t guarda360-api .
     - docker push ACR (guarda360.azurecr.io)
     - az webapp deploy (swap staging → production)

  4. build-worker:
     - dotnet publish -c Release
     - docker build -t guarda360-worker .
     - docker push ACR
     - az containerapp update --image guarda360-worker:sha-{commit}

  5. migrate:
     - dotnet ef database update (via Azure CLI task)
     - Executado no slot staging antes do swap
```

---

## Configuração do Azure Key Vault (segredos gerenciados)

| Segredo | Descrição |
|---------|-----------|
| `ConnectionStrings--DefaultConnection` | PostgreSQL connection string |
| `ConnectionStrings--Redis` | Azure Cache for Redis connection string |
| `AzureSignalR--ConnectionString` | Azure SignalR Service connection string |
| `AzureServiceBus--ConnectionString` | Azure Service Bus connection string |
| `AzureStorage--ConnectionString` | Azure Blob Storage connection string |
| `AzureCommunicationServices--ConnectionString` | ACS Email connection string |
| `JwtSettings--Secret` | Chave HMAC-SHA256 para assinar tokens JWT (256 bits) |
| `Firebase--ServiceAccountJson` | JSON de credenciais do Firebase Admin SDK |

> Todos acessados via **Managed Identity** (App Service → Key Vault) — zero credenciais em variáveis de ambiente ou código.
