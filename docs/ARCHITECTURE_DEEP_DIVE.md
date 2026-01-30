# Molt-OS Architecture Deep Dive

**Purpose:** Comprehensive technical documentation for developers building or extending Molt-OS.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Data Flow](#data-flow)
3. [Component Deep Dives](#component-deep-dives)
4. [Security Architecture](#security-architecture)
5. [Scaling Strategy](#scaling-strategy)
6. [Deployment Guide](#deployment-guide)

---

## System Overview

### The Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Web App    │  │  Mobile App  │  │       Landing Page       │  │
│  │   (Expo)     │  │   (iOS/Android)│  │      (Next.js)          │  │
│  │   React Web  │  │   React Native │  │      Static Site        │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬──────────────┘  │
│         │                 │                      │                  │
│         └─────────────────┼──────────────────────┘                  │
│                           │                                         │
│                           ▼                                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     API Gateway                               │   │
│  │              (Next.js API Routes / Vercel)                   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│   │
│  │  │  /auth  │ │/billing │ │  /bots  │ │/skills  │ │/proxy   ││   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     WebSocket Router                          │   │
│  │              (Routes chat to correct bot)                    │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Supabase    │  │   Stripe     │  │      Fly.io Machines     │  │
│  │  Postgres    │  │  Billing     │  │      Bot Containers      │  │
│  │  Realtime    │  │  Webhooks    │  │      Isolated Runtime    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Registration & Onboarding

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Signup  │────▶│  Stripe  │────▶│ Provision│
│          │     │  (Clerk) │     │ Checkout │     │  Bot     │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                                                        ▼
                                               ┌────────────────┐
                                               │ Fly.io Machine │
                                               │   Created      │
                                               └───────┬────────┘
                                                       │
                                                       ▼
                                               ┌────────────────┐
                                               │  User gets     │
                                               │  Gateway URL   │
                                               │  + Token       │
                                               └────────────────┘
```

**Detailed Steps:**

1. **Signup (Clerk)**
   - User enters email
   - Magic link sent
   - User clicks, authenticated
   - Clerk webhook creates user in Supabase

2. **Onboarding**
   - User selects vertical (Executive/Developer/etc)
   - User enters bot name
   - Frontend stores preferences

3. **Payment (Stripe)**
   - Checkout session created
   - User enters card
   - `checkout.session.completed` webhook fires

4. **Provisioning (Fly.io)**
   - Webhook triggers provisioner
   - Fly API creates Machine
   - Docker image: `ghcr.io/clawdbot/clawdbot:latest`
   - Environment variables injected:
     ```
     CLAWDBOT_CONFIG=<json config>
     MOLT_USER_ID=<uuid>
     MOLT_GATEWAY_TOKEN=<token>
     PROXY_URL=https://proxy.molt-os.com/v1
     ```
   - Health check waits for `/status` 200
   - Bot record created in Supabase

5. **User Notification**
   - Email: "Your bot is ready!"
   - SMS (optional): Gateway URL
   - In-app notification

---

### 2. Chat Message Flow

```
┌────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐
│  User  │───▶│ Web App │───▶│  API GW  │───▶│  Bot GW  │───▶│  AI    │
│        │    │         │    │          │    │          │    │ Model  │
└────────┘    └─────────┘    └──────────┘    └──────────┘    └───┬────┘
     ▲                                                           │
     │                                                           │
     │    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
     └───│ WebSocket│◀───│  Stream  │◀───│ Response │◀─────────┘
          │   Frame  │    │   Chunk  │    │  Token   │
          └──────────┘    └──────────┘    └──────────┘
```

**Detailed Steps:**

1. **User Sends Message**
   ```javascript
   // Web App
   websocket.send(JSON.stringify({
     type: 'chat',
     message: 'Check my calendar',
     session_id: 'abc123'
   }));
   ```

2. **API Gateway Routes**
   - Looks up user's bot from JWT
   - Gets gateway URL + token
   - Opens WebSocket to bot

3. **Bot Gateway Receives**
   - Authenticates token
   - Loads session history
   - Calls AI model

4. **AI Processing**
   ```
   System Prompt (10K tokens)
   + Conversation History (20K tokens)
   + User Message (50 tokens)
   ─────────────────────────────
   Total: ~30K tokens sent to API
   ```

5. **Tool Execution (if needed)**
   ```
   AI: "I'll check your calendar"
        ↓
   Tool Call: calendar.list()
        ↓
   Result: "3 meetings today"
        ↓
   AI: "You have 3 meetings..."
   ```

6. **Streaming Response**
   ```javascript
   // Chunks sent as SSE
   data: {"content": "You", "done": false}
   data: {"content": " have", "done": false}
   data: {"content": " 3 meetings", "done": false}
   data: {"content": ".", "done": true}
   ```

7. **Display in Web App**
   - Chunks appended to message
   - Typing indicator shown
   - Final message stored

---

### 3. Usage Tracking & Billing

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Bot    │────▶│  Proxy   │────▶│  Usage   │────▶│  Stripe  │
│  Request │     │  Service │     │  Logger  │     │  Meter   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐
                │  Supabase│
                │  usage_logs
                └──────────┘
```

**Detailed Steps:**

1. **Proxy Intercepts Request**
   ```javascript
   // Proxy adds API key, logs usage
   const response = await fetch('https://api.venice.ai/v1/chat', {
     headers: { 'Authorization': `Bearer ${MASTER_KEY}` },
     body: userRequest
   });
   ```

2. **Extract Usage**
   ```javascript
   const usage = {
     user_id: 'user-123',
     bot_id: 'bot-456',
     model: 'claude-opus-45',
     tokens_in: response.usage.prompt_tokens,
     tokens_out: response.usage.completion_tokens,
     cost: calculateCost(model, tokens_in, tokens_out)
   };
   ```

3. **Log to Supabase**
   ```sql
   INSERT INTO usage_logs (...)
   ```

4. **Report to Stripe**
   ```javascript
   // Hourly batch job
   stripe.billing.meterEvents.create({
     event_name: 'ai_tokens',
     payload: { value: totalTokens, user_id: 'user-123' }
   });
   ```

5. **Monthly Invoice**
   - Stripe aggregates metered usage
   - Adds $50 base fee
   - Charges card on file

---

## Component Deep Dives

### 1. The Provisioner

**Purpose:** Automagically spin up a Clawdbot instance for each user.

**Technology:** Pulumi + Fly.io Machines API

**Architecture:**
```typescript
// infrastructure/provisioner.ts
class BotProvisioner {
  async provision(userId: string, config: UserConfig): Promise<Bot> {
    // 1. Generate secrets
    const gatewayToken = crypto.randomBytes(32).toString('hex');
    
    // 2. Build Clawdbot config
    const clawdbotConfig = {
      agents: {
        defaults: {
          model: {
            primary: config.model,
            fallbacks: FALLBACK_MODELS
          },
          workspace: `/data/${userId}`,
        }
      },
      models: {
        providers: {
          venice: { baseUrl: PROXY_URL }
        }
      }
    };
    
    // 3. Create Fly Machine
    const machine = await fly.machines.create({
      app: 'molt-os-bots',
      name: `bot-${userId.slice(0, 8)}`,
      config: {
        image: 'ghcr.io/clawdbot/clawdbot:latest',
        env: {
          CLAWDBOT_CONFIG: JSON.stringify(clawdbotConfig),
          MOLT_USER_ID: userId,
          MOLT_GATEWAY_TOKEN: gatewayToken,
        },
        services: [{
          ports: [{ port: 443, handlers: ['tls', 'http'] }],
          internal_port: 18789,
        }],
        mounts: [{
          volume: await this.getVolume(userId),
          path: '/data'
        }],
        auto_destroy: false,
        restart: { policy: 'always' },
        guest: {
          cpu_kind: 'shared',
          cpus: 1,
          memory_mb: 512
        }
      }
    });
    
    // 4. Wait for healthy
    await this.waitForHealth(machine.id);
    
    // 5. Store in DB
    return await db.bots.create({
      user_id: userId,
      fly_machine_id: machine.id,
      gateway_url: `https://bot-${userId.slice(0, 8)}.fly.dev`,
      gateway_token: encrypt(gatewayToken),
      status: 'running'
    });
  }
}
```

**Cost per bot:**
- Fly Machine (shared-cpu-1x, 512MB): ~$2-3/month
- Volume (10GB): ~$0.50/month
- **Total:** ~$3-4/month per bot

---

### 2. The Ghost Key Proxy

**Purpose:** Hide API keys from users while enabling access to all models.

**Architecture:**
```
┌─────────┐     ┌──────────┐     ┌─────────────┐
│  User   │────▶│  Proxy   │────▶│  Venice     │
│  Bot    │     │  (Fly)   │     │  (Claude)   │
└─────────┘     └────┬─────┘     └─────────────┘
                     │
                     ▼
              ┌──────────┐
              │  Master  │
              │   Keys   │
              └──────────┘
```

**Implementation:**
```typescript
// services/proxy/index.ts
app.post('/v1/chat/completions', async (req, res) => {
  // 1. Authenticate user
  const token = req.headers.authorization?.split(' ')[1];
  const user = await validateToken(token);
  
  // 2. Route to correct provider
  const provider = detectProvider(req.body.model);
  const apiKey = getMasterKey(provider);
  
  // 3. Forward request
  const response = await fetch(getProviderUrl(provider), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  
  // 4. Log usage
  const usage = await parseUsage(response);
  await logUsage(user.id, usage);
  
  // 5. Stream response back
  response.body.pipe(res);
});
```

**Security:**
- Master keys stored in Fly Secrets (encrypted at rest)
- User tokens are JWTs with short expiry
- Rate limiting per user
- Anomaly detection (unusual token usage)

---

### 3. The Brain Visualizer

**Purpose:** Show users what their AI is doing in real-time.

**Data Model:**
```typescript
interface BrainEvent {
  id: string;
  session_id: string;
  timestamp: number;
  type: 'user_message' | 'thinking' | 'tool_call' | 'tool_result' | 'assistant_message' | 'memory_access';
  
  // Type-specific data
  content?: string;           // for messages
  tool?: string;              // for tool_call
  args?: Record<string, any>; // for tool_call
  result?: any;               // for tool_result
  memory_file?: string;       // for memory_access
  duration_ms?: number;       // execution time
}
```

**WebSocket Stream:**
```javascript
// From bot to web app
{
  "type": "brain_event",
  "event": {
    "id": "evt-123",
    "type": "tool_call",
    "tool": "calendar.list",
    "args": { "date": "2026-01-30" },
    "timestamp": 1706572800000
  }
}
```

**UI Implementation (React Flow):**
```tsx
// components/BrainGraph.tsx
function BrainGraph({ events }: { events: BrainEvent[] }) {
  const nodes = useMemo(() => {
    return events.map((evt, i) => ({
      id: evt.id,
      position: { x: 100, y: i * 100 },
      data: { label: renderEvent(evt) },
      type: evt.type
    }));
  }, [events]);
  
  const edges = useMemo(() => {
    return events.slice(1).map((evt, i) => ({
      id: `e-${i}`,
      source: events[i].id,
      target: evt.id
    }));
  }, [events]);
  
  return (
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

---

## Security Architecture

### Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| User steals API keys | High | Critical | Keys only in proxy, never in bot |
| Bot escapes container | Low | High | Read-only rootfs, no privileges |
| Session hijacking | Medium | High | Short JWT expiry, secure cookies |
| DDoS on gateway | Medium | Medium | Rate limiting, CDN, auto-scaling |
| Data breach | Low | Critical | Encryption at rest, audit logs |

### Key Security Measures

1. **Isolation**
   - Each bot in separate Fly Machine
   - No shared filesystem
   - Network policies restrict egress

2. **Encryption**
   - All data in transit (TLS 1.3)
   - Database encrypted at rest
   - Secrets in Fly Secrets (encrypted)

3. **Authentication**
   - Clerk for user auth (OAuth, magic links)
   - JWT tokens for API access
   - Gateway tokens for bot access

4. **Audit Logging**
   - All API calls logged
   - Admin actions logged
   - 90-day retention

---

## Scaling Strategy

### Phase 1: 0-100 Users
- Single Fly app, multiple machines
- Supabase free tier
- Stripe standard
- **Cost:** ~$100/month

### Phase 2: 100-1,000 Users
- Fly Machines with auto-scaling
- Supabase Pro ($25/month)
- Stripe + usage-based alerting
- CDN for static assets (CloudFlare)
- **Cost:** ~$500/month

### Phase 3: 1,000-10,000 Users
- Multi-region Fly deployment
- Dedicated Supabase instance
- Redis for caching
- Load balancers
- **Cost:** ~$2,000/month

### Phase 4: 10,000+ Users
- Kubernetes (EKS/GKE)
- Read replicas for database
- Event streaming (Kafka)
- Microservices architecture
- **Cost:** ~$10,000/month

---

## Deployment Guide

### Prerequisites
- Node.js 20+
- Fly.io CLI
- Supabase CLI
- Stripe account

### Local Development
```bash
# 1. Clone repo
git clone https://github.com/ArturoHaber/molt-os.git
cd molt-os

# 2. Install dependencies
cd packages/app && npm install
cd ../landing && npm install

# 3. Environment variables
cp .env.example .env.local
# Edit with your values

# 4. Run web app
cd packages/app
npm run web

# 5. Run landing page (separate terminal)
cd packages/landing
npm run dev
```

### Production Deployment

**Landing Page (Vercel):**
```bash
cd packages/landing
vercel --prod
```

**API Gateway (Vercel):**
```bash
cd packages/api
vercel --prod
```

**Web App (Static Export):**
```bash
cd packages/app
npm run export
# Upload dist/ to S3/CloudFlare Pages
```

**Infrastructure (Fly.io):**
```bash
cd infrastructure/pulumi
pulumi up
```

---

## Appendix: API Reference

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "token": "jwt-token-here",
  "user": { ... }
}
```

### Create Bot
```http
POST /api/bots
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Assistant",
  "vertical": "developer"
}

Response: 201 Created
{
  "id": "bot-123",
  "gateway_url": "https://bot-123.fly.dev",
  "status": "provisioning"
}
```

### WebSocket Chat
```javascript
const ws = new WebSocket('wss://api.molt-os.com/ws/chat?bot=bot-123');

ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello!'
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle streaming response
};
```

---

*Last updated: January 30, 2026*
*Maintainers: R2, Clawd 🦞*
