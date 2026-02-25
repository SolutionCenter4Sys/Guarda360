# 00 — Decisões Tecnológicas — Guarda360°

**Versão**: 2.0  
**Data**: 2026-02-24  
**Agente**: @the-architect  
**Status**: ✅ Stack atualizada — Backend .NET 8 + Cloud Azure

---

## 1. Stack Selecionada

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Frontend Web** | React + TypeScript | 18.x | Ecossistema maduro, grande pool de devs, SSR futuro com Next.js |
| **Build Tool** | Vite | 5.x | Bundling rápido, HMR instantâneo |
| **Estado** | Zustand + React Query | latest | Simples para estado global + cache de server state |
| **UI Library** | shadcn/ui + Tailwind CSS | latest | Customizável, sem overhead, Radix UI acessível |
| **Roteamento** | React Router v6 | 6.x | Padrão do ecossistema React |
| **Backend** | ASP.NET Core | .NET 8 LTS | Ecosistema Microsoft maduro, performance superior, C# fortemente tipado, excelente para domínios jurídicos/financeiros |
| **Arquitetura Backend** | Clean Architecture + CQRS | — | Separação clara de camadas, testabilidade, adequado para regras de negócio complexas |
| **ORM** | Entity Framework Core | 8.x | Migrations declarativas, LINQ type-safe, suporte completo ao PostgreSQL |
| **Banco de Dados** | PostgreSQL | 16.x | ACID, row-level security, JSON nativo |
| **Cache + Mensageria** | Azure Cache for Redis | 7.x | Sessões, WebSocket Pub/Sub, backplane para SignalR |
| **WebSocket (Real-time)** | ASP.NET Core SignalR + Azure SignalR Service | — | Nativo no .NET, escala horizontal com Azure SignalR Service |
| **Fila de Mensagens** | Azure Service Bus | — | Substituí BullMQ — fila gerenciada, confiável, DLQ nativo |
| **Autenticação** | ASP.NET Core Identity + JWT Bearer | — | Padrão Microsoft, refresh token rotation, 2FA TOTP integrado |
| **Validação** | FluentValidation + Data Annotations | — | Expressivo, testável, integrado ao pipeline do ASP.NET Core |
| **File Storage** | Azure Blob Storage | — | Integrado ao ecossistema Azure, SAS tokens para presigned URLs |
| **Email** | Azure Communication Services (Email) | — | Serviço gerenciado Azure, alta entregabilidade, rastreamento |
| **Notificações Push** | Firebase FCM | — | Gratuito, multiplataforma (web + mobile futuro) |
| **Geração de PDF** | QuestPDF + .NET Worker Service | — | Biblioteca .NET nativa, sem dependência de Chrome headless |
| **Cloud** | Microsoft Azure | — | Alinhado com stack .NET/Microsoft, SLA enterprise, LGPD compliance |
| **Container** | Docker + docker-compose | — | Desenvolvimento local e CI/CD |
| **Registry de Imagens** | Azure Container Registry (ACR) | — | Integrado ao Azure App Service e Container Apps |
| **Hosting Backend** | Azure App Service (Linux) | — | PaaS gerenciado, auto-scaling, slots de staging |
| **Hosting Worker** | Azure Container Apps | — | Serverless containers para o PDF Worker |
| **CI/CD** | GitHub Actions | — | Integrado ao GitHub, deploy direto para Azure via OIDC |
| **Monitoramento** | Azure Monitor + Application Insights | — | APM completo, traces distribuídos, alertas integrados |
| **Segurança de Segredos** | Azure Key Vault | — | Certificados, connection strings e JWT secrets centralizados |

---

## 2. ADRs — Architecture Decision Records

### ADR-001: PostgreSQL como Banco Principal
- **Decisão**: Azure Database for PostgreSQL — Flexible Server 16
- **Contexto**: Necessidade de registros imutáveis (append-only) com auditoria completa
- **Motivação**: Row Level Security nativo, triggers para audit log, suporte a UUID, JSONB para dados flexíveis. Flexible Server permite manutenção sem downtime e backup point-in-time de 35 dias
- **Alternativas Rejeitadas**: Azure SQL (licença, menos maduro em RLS), Cosmos DB (sem ACID completo)

### ADR-002: SignalR + Azure SignalR Service
- **Decisão**: ASP.NET Core SignalR com Azure SignalR Service como backplane
- **Contexto**: Chat em tempo real entre 2 responsáveis
- **Motivação**: SignalR é nativo no .NET, o Azure SignalR Service elimina a necessidade de Redis Pub/Sub apenas para WebSocket — serviço gerenciado com escala horizontal automática
- **Alternativas Rejeitadas**: Socket.IO (não nativo em .NET), SSE (unidirecional), long-polling (latência alta)

### ADR-003: Imutabilidade via INSERT-Only
- **Decisão**: Tabelas de mensagens, registros de convivência e ocorrências são INSERT-only
- **Contexto**: Valor jurídico depende de imutabilidade comprovável
- **Motivação**: Trigger de banco bloqueia UPDATE/DELETE nessas tabelas. Audit log adicional no nível de aplicação via Interceptors do EF Core
- **Implementação**: `CREATE RULE no_update_messages AS ON UPDATE TO messages DO INSTEAD NOTHING;`

### ADR-004: Hash SHA-256 para Integridade
- **Decisão**: Gerar hash SHA-256 de cada ocorrência e do PDF final
- **Contexto**: Relatórios precisam de integridade verificável para uso judicial
- **Motivação**: Hash simples, verificável por qualquer ferramenta, sem dependência de CA. `System.Security.Cryptography.SHA256` nativo no .NET
- **Implementação**: Hash do conjunto (timestamp + dados + arquivos anexos) gerado no backend antes de persistir

### ADR-005: Geração Assíncrona de PDFs com QuestPDF
- **Decisão**: QuestPDF em .NET Worker Service consumindo Azure Service Bus
- **Contexto**: Geração de PDF de 12 meses pode levar 30-120 segundos
- **Motivação**: QuestPDF é biblioteca .NET open-source (licença community gratuita até 1M de operações/ano) sem dependência de browser headless. Azure Service Bus provê Dead Letter Queue, retentativas e rastreamento nativos
- **Alternativas Rejeitadas**: Puppeteer/PuppeteerSharp (dependência de Chrome, mais pesado), iTextSharp (licença comercial cara)

### ADR-006: Azure App Service para o Backend
- **Decisão**: Azure App Service (Linux, P1v3) com deployment slots
- **Contexto**: Hospedagem do ASP.NET Core API
- **Motivação**: PaaS gerenciado elimina overhead de gestão de SO/VMs. Slots de staging permitem blue-green deployment sem downtime. Auto-scaling baseado em métricas
- **Alternativas Rejeitadas**: Azure Container Apps (maior complexidade), Azure Functions (cold start problemático para WebSocket)

### ADR-007: Azure Front Door como CDN + WAF
- **Decisão**: Azure Front Door Standard como ponto de entrada global
- **Contexto**: CDN para SPA estático + WAF para proteção da API
- **Motivação**: Solução unificada — CDN + WAF + Load Balancer gerenciados. Suporte nativo a WebSocket (SignalR) pelo Front Door
- **Alternativas Rejeitadas**: Azure CDN separado + Application Gateway (maior custo e complexidade)

---

## 3. Variáveis de Stack

```
{STACK_FRONTEND}  = React 18 + TypeScript + Vite
{STACK_BACKEND}   = ASP.NET Core 8 + .NET 8 LTS + C#
{STACK_DATABASE}  = PostgreSQL 16 (Azure Flexible Server) + Entity Framework Core 8
{STACK_REALTIME}  = ASP.NET Core SignalR + Azure SignalR Service
{STACK_QUEUE}     = Azure Service Bus (Standard tier)
{DEV_FRONTEND}    = @dev-reactjs-esp
{DEV_BACKEND}     = @dev-dotnet-esp
```

---

## 4. Mapeamento AWS → Azure

| Serviço AWS (anterior) | Serviço Azure (atual) | Observação |
|------------------------|----------------------|------------|
| EC2 t3.medium × 2 | Azure App Service P1v3 | PaaS gerenciado |
| RDS PostgreSQL | Azure DB for PostgreSQL Flexible Server | Compatível, backup 35 dias |
| ElastiCache Redis | Azure Cache for Redis (C1 Standard) | Backplane SignalR + cache |
| AWS S3 | Azure Blob Storage | SAS tokens = presigned URLs |
| AWS SES | Azure Communication Services (Email) | SMTP + API REST |
| CloudFront CDN | Azure Front Door Standard | CDN + WAF unificado |
| AWS WAF | Azure Front Door WAF Policy | OWASP 3.2 ruleset |
| CloudWatch | Azure Monitor + Application Insights | Logs + APM + traces |
| Secrets Manager | Azure Key Vault | Segredos, certs, connection strings |
| ACM Certificate | App Service Managed Certificate | TLS automático |
| ECR | Azure Container Registry (ACR) | Docker image registry |

---

## 5. Requisitos Não-Funcionais

| Requisito | Meta | Monitoramento |
|-----------|------|--------------|
| Disponibilidade | 99.9% uptime (SLA App Service P1v3) | Azure Monitor + Alertas |
| Latência API | p95 < 500ms | Application Insights |
| Latência WebSocket (SignalR) | < 100ms | Azure SignalR Service metrics |
| Tempo de geração PDF | < 180 segundos (p95) | Service Bus + App Insights |
| Armazenamento Blob | Ilimitado (pago por uso) | Azure Cost Management |
| Backup DB | Diário + PITR 35 dias (Azure Flexible Server) | Azure Monitor |
| Recuperação (RTO) | < 4 horas | Runbook documentado |
| Dados imutáveis | 100% das tabelas críticas | Trigger + EF Core Interceptors |

---

## 6. Estimativa de Custos Azure (MVP com ~500 usuários)

| Serviço | Plano | Custo Estimado/mês |
|---------|-------|-------------------|
| Azure App Service (P1v3) × 2 slots | Linux, East US | ~USD 74 |
| Azure DB for PostgreSQL Flexible Server (B2ms) | 2 vCores, 8 GB | ~USD 65 |
| Azure Cache for Redis (C1 Standard) | 1 GB | ~USD 55 |
| Azure Blob Storage (50 GB + transferência) | LRS | ~USD 4 |
| Azure Communication Services (Email) | 10.000 emails | ~USD 1 |
| Azure SignalR Service (Free tier → Standard 1 unit) | 1K conexões | ~USD 49 |
| Azure Service Bus (Standard) | 1M operações | ~USD 10 |
| Azure Front Door Standard | tráfego MVP | ~USD 35 |
| Azure Monitor + Application Insights | básico | ~USD 10 |
| Azure Key Vault (Standard) | segredos | ~USD 5 |
| **Total estimado** | | **~USD 308/mês** |

> **Nota**: O custo Azure é ~2× o custo AWS equivalente no MVP, mas inclui serviços gerenciados de maior nível (SignalR Service, Service Bus, Front Door WAF) que eliminariam custos operacionais adicionais em AWS (Redis cluster para WebSocket, SQS + configuração WAF separada).
