# 05 — Diagrama de Fluxo de Dados — Guarda360°

**Versão**: 2.0 | **Agente**: @the-architect | **Data**: 2026-02-24  
**Alteração**: NestJS/Node.js → ASP.NET Core 8 / .NET 8 | AWS → Azure

---

## Fluxo 1: Envio de Mensagem no Chat (SignalR)

```mermaid
sequenceDiagram
    participant C1 as Responsável 1 (Browser)
    participant SIGNALR as ASP.NET Core SignalR Hub
    participant SIGNALR_SVC as Azure SignalR Service
    participant DB as PostgreSQL (EF Core)
    participant C2 as Responsável 2 (Browser)
    participant FCM as Firebase FCM

    C1->>SIGNALR: HubConnection.InvokeAsync("SendMessage", { childId, type, content })
    SIGNALR->>SIGNALR: Valida JWT Bearer + RBAC Policy
    SIGNALR->>DB: INSERT INTO messages (INSERT-ONLY via EF Core Interceptor)
    DB-->>SIGNALR: messageId + createdAt (servidor UTC — gerado no backend)
    SIGNALR->>SIGNALR_SVC: Clients.Group(childId).SendAsync("NewMessage", messageDto)
    SIGNALR_SVC-->>C1: ReceiveConfirmation("MessageDelivered", messageId)
    SIGNALR_SVC-->>C2: ReceiveMessage("NewMessage", { messageId, content, createdAt })
    Note over SIGNALR,FCM: Se C2 offline (não conectado ao SignalR)
    SIGNALR->>FCM: HttpClient.PostAsync(FCM v1 API, { userId: C2, body: "Nova mensagem" })
```

---

## Fluxo 2: Registro de Ocorrência com Hash SHA-256

```mermaid
sequenceDiagram
    participant C1 as Responsável 1
    participant API as ASP.NET Core API
    participant BLOB as Azure Blob Storage
    participant DB as PostgreSQL (EF Core)

    C1->>API: POST /incidents { childId, type, severity, narrative }
    API->>API: Valida JWT Bearer + RBAC Policy ("CanReportIncident")
    API->>API: hashInput = serverTimestamp + narrative + userId
    API->>API: partialHash = SHA256.HashData(Encoding.UTF8.GetBytes(hashInput))
    API->>DB: INSERT incidents (narrative + partialHash) via EF Core
    Note over API: Aguarda upload de evidências

    C1->>API: POST /incidents/:id/evidence (multipart/form-data: file)
    API->>BLOB: BlobClient.UploadAsync(stream) → retorna URL + MD5 hash do arquivo
    API->>DB: INSERT incident_evidences (blobUrl, fileHash, mimeType, sizeBytes)
    API->>API: finalHash = SHA256(narrative + concat(fileHashes) + serverTimestamp)
    API->>DB: UPDATE incidents SET integrity_hash = finalHash
    Note over DB: EF Core SaveChangesInterceptor bloqueia UPDATEs futuros nesta entidade
    API-->>C1: 201 { incidentId, integrityHash, createdAt }
```

---

## Fluxo 3: Geração de Relatório PDF Assíncrono (Azure Service Bus + QuestPDF)

```mermaid
sequenceDiagram
    participant C1 as Responsável
    participant API as ASP.NET Core API
    participant SVC_BUS as Azure Service Bus
    participant WORKER as .NET Worker Service (QuestPDF)
    participant DB as PostgreSQL (EF Core)
    participant BLOB as Azure Blob Storage
    participant ACS as Azure Communication Services

    C1->>API: POST /reports/generate { childId, periodFrom, periodTo, modules }
    API->>DB: INSERT reports { status: QUEUED } via EF Core
    API->>SVC_BUS: ServiceBusClient.SendMessageAsync({ reportId, childId, period, modules })
    API-->>C1: 202 Accepted { reportId, status: "QUEUED" }

    Note over WORKER: Worker processa mensagem da fila
    WORKER->>SVC_BUS: ServiceBusProcessor.ProcessMessageAsync()
    WORKER->>DB: UPDATE reports SET status = PROCESSING
    WORKER->>DB: SELECT * FROM [calendar_events, messages, expenses, incidents] WHERE childId AND period
    WORKER->>WORKER: Mapeia dados para modelos do QuestPDF
    WORKER->>WORKER: QuestPDF.Document.GeneratePdf() → MemoryStream
    WORKER->>WORKER: pdfHash = SHA256.HashData(pdfBuffer)
    WORKER->>BLOB: BlobClient.UploadAsync(pdfBuffer, container: "guarda360-reports")
    WORKER->>DB: UPDATE reports SET status=DONE, pdfUrl, pdfHash, completedAt
    WORKER->>ACS: EmailClient.SendAsync(to: user.Email, body: "Seu relatório está pronto", attachSasUrl)
    WORKER->>SVC_BUS: message.CompleteMessageAsync() [ack — remove da fila]

    Note over C1: Polling ou aguarda email
    C1->>API: GET /reports/:reportId/status
    API-->>C1: { status: "DONE", pdfSasUrl, pdfHash }
```

---

## Fluxo 4: Check-in de Visita

```mermaid
sequenceDiagram
    participant Resp as Responsável Ativo
    participant API as ASP.NET Core API
    participant DB as PostgreSQL (EF Core)
    participant FCM as Firebase FCM
    participant Outro as Outro Responsável

    Resp->>API: POST /attendance/checkin { eventId }
    API->>API: Valida JWT Bearer + verifica se é o responsável ativo do evento (RBAC Policy)
    API->>API: actualTime = DateTime.UtcNow (servidor — não confia no cliente)
    API->>DB: INSERT attendance_records { eventId, status: CHECKIN, actualTime } via EF Core
    Note over DB: EF Core SaveChangesInterceptor confirma INSERT-ONLY — rejeita Update/Delete
    DB-->>API: recordId
    API-->>Resp: 201 { recordId, actualTime }
    API->>FCM: HttpClient.PostAsync(FCM v1 API, { token: OutroDeviceToken, body: "Check-in registrado: [Filho] às [hora]" })
    FCM-->>Outro: Notificação push
```

---

## Fluxo 5: Autenticação com 2FA (TOTP)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant API as ASP.NET Core API
    participant Identity as ASP.NET Core Identity
    participant DB as PostgreSQL (EF Core)
    participant ACS as Azure Communication Services
    participant REDIS as Azure Cache for Redis

    User->>API: POST /auth/login { email, password }
    API->>Identity: UserManager.CheckPasswordAsync()
    Identity->>DB: SELECT users WHERE email = ?
    DB-->>Identity: user entity
    Identity-->>API: passwordValid = true

    alt 2FA habilitado
        API->>API: Gera challenge temporário (não retorna token ainda)
        API-->>User: 200 { requires2FA: true, challengeToken }
        User->>API: POST /auth/2fa/verify { challengeToken, totpCode }
        API->>Identity: TwoFactorTokenProvider.ValidateAsync(user, totpCode)
        Identity-->>API: valid = true
    end

    API->>API: Gera accessToken (JWT 15min) + refreshToken (JWT 7d)
    API->>REDIS: SET refresh_token:{userId} = refreshToken (TTL 7d)
    API-->>User: 200 { accessToken, refreshToken, user: { id, fullName, role } }
```
