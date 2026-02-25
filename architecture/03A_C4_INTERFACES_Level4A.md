# 03A — C4 Level 4A: Contratos de Interface (API) — Guarda360°

**Versão**: 2.0 | **Agente**: @the-architect | **Data**: 2026-02-24  
**Nota**: Contratos REST mantidos. Implementação migrada de NestJS/Node.js para **ASP.NET Core 8 / .NET 8**. WebSocket migrado de Socket.IO para **ASP.NET Core SignalR**.

---

## Contratos REST API — MVP

Base URL: `https://api.guarda360.com.br/v1`  
Autenticação: `Authorization: Bearer {JWT}`

---

### AUTH

```yaml
POST /auth/register
  Body: { fullName, cpf, email, password }
  Response 201: { userId, message: "Verifique seu email" }
  Response 400: { error: "CPF/email já cadastrado" }

POST /auth/verify-email
  Body: { token }
  Response 200: { accessToken, refreshToken }

POST /auth/login
  Body: { email, password }
  Response 200: { accessToken, refreshToken, user: { id, fullName, avatarUrl } }
  Response 401: { error: "Credenciais inválidas" }

POST /auth/refresh
  Body: { refreshToken }
  Response 200: { accessToken, refreshToken }

POST /auth/logout
  Response 204
```

---

### CHILDREN

```yaml
POST /children
  Body: { fullName, birthDate, schoolName }
  Response 201: { childId, ...childData }

GET /children
  Response 200: [{ id, fullName, birthDate, guardians: [{userId, role}] }]

POST /children/invite
  Body: { childId, email, role: "GUARDIAN_2" }
  Response 201: { inviteId, expiresAt }

POST /children/invite/accept
  Body: { token }
  Response 200: { child: {...}, message: "Vínculo criado" }
```

---

### CALENDAR

```yaml
GET /calendar/events?childId=&month=YYYY-MM
  Response 200: { events: [{ id, type, startAt, endAt, responsibleUserId, status }] }

POST /calendar/events
  Body: { childId, type, startAt, endAt, responsibleUserId, isRecurring, recurrenceRule }
  Response 201: { eventId, ...eventData }

PUT /calendar/events/:id
  Body: { startAt, endAt } (apenas eventos futuros)
  Response 200: { ...updatedEvent }
  Response 403: { error: "Eventos passados não podem ser editados" }

POST /attendance/checkin
  Body: { eventId }
  Response 201: { recordId, actualTime: "servidor UTC" }

POST /attendance/checkout
  Body: { eventId }
  Response 201: { recordId, actualTime }

POST /attendance/absence
  Body: { eventId, observation }
  Response 201: { recordId }

POST /attendance/cancellation
  Body: { eventId, reason }
  Response 201: { recordId }

GET /attendance/:eventId
  Response 200: [{ id, status, actualTime, observation, recordedBy }]
```

---

### CHAT (SignalR — ASP.NET Core)

```yaml
SignalR Hub: wss://api.guarda360.com.br/chatHub
  Auth: Bearer token no header da negociação de conexão
  Biblioteca cliente: @microsoft/signalr (npm)

Métodos do Hub (Cliente → Servidor via InvokeAsync):
  JoinRoom(childId: string)
  SendMessage(childId: string, type: "TEXT|AUDIO|FILE", content: string, attachmentUrl?: string)
  MarkRelevant(messageId: string)

Eventos do Hub (Servidor → Cliente via On):
  NewMessage: { id, senderId, type, content, attachmentUrl, isLegallyRelevant, offensiveDetected, createdAt }
  MessageDelivered: { messageId }
  MessageRead: { messageId }

REST (fallback + histórico):
GET /messages/:childId?cursor=&limit=50
  Response 200: { messages: [...], nextCursor }

POST /storage/upload/audio
  Body: multipart/form-data { file, childId }
  Response 201: { attachmentUrl, blobName }
```

---

### FINANCIAL

```yaml
POST /alimony/config
  Body: { childId, payerId, receiverId, valueType, amount, percentage, dueDay }
  Response 201: { configId }

GET /alimony/:childId
  Response 200: { config: {...}, payments: [{month, amount, status, receiptUrl}] }

POST /alimony/payment
  Body: { configId, amountPaid, paymentDate, referenceMonth }
  + FormData: { receipt (file) }
  Response 201: { paymentId, receiptUrl }

POST /expenses
  Body: { childId, category, amount, description, payer1Share, payer2Share }
  + FormData: { receipt (file) }
  Response 201: { expenseId, receiptUrl }

GET /expenses/:childId?status=&month=
  Response 200: [{ id, category, amount, status, createdBy, receiptUrl }]

POST /expenses/:id/approve
  Body: { payer1Share, payer2Share }
  Response 200: { status: "APPROVED" }

POST /expenses/:id/contest
  Body: { reason }
  Response 200: { status: "CONTESTED" }
```

---

### INCIDENTS

```yaml
POST /incidents
  Body: { childId, type, severity, narrative }
  Response 201: { incidentId, integrityHash, createdAt }

POST /incidents/:id/evidence
  Body: FormData { file }
  Response 201: { evidenceId, fileHash, fileUrl }

GET /incidents?childId=&severity=&type=
  Response 200: [{ id, type, severity, narrative, integrityHash, evidences: [...], createdAt }]
```

---

### REPORTS

```yaml
GET /timeline/:childId?from=&to=&types[]=
  Response 200: {
    events: [
      { type: "ATTENDANCE|MESSAGE|PAYMENT|INCIDENT", timestamp, summary, actor, metadata }
    ],
    nextCursor
  }

POST /reports/generate
  Body: { childId, periodFrom, periodTo, modules: ["CALENDAR","CHAT","FINANCIAL","INCIDENTS"] }
  Response 202: { reportId, status: "QUEUED" }

GET /reports/:id/status
  Response 200: { status: "QUEUED|PROCESSING|DONE|ERROR", pdfUrl, pdfHash }

GET /reports/:childId/history
  Response 200: [{ id, requestedAt, status, pdfHash, periodFrom, periodTo }]
```
