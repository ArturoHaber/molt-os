# Molt-OS — Technical Specification

## Document Purpose
This is the **single source of truth** for technical decisions. Read this before writing code.

---

## Table of Contents
1. [Stack Overview](#stack-overview)
2. [System Architecture](#system-architecture)
3. [The Ghost Key System](#the-ghost-key-system)
4. [User Provisioning Flow](#user-provisioning-flow)
5. [Infrastructure as Code](#infrastructure-as-code)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [The Config UI](#the-config-ui)
9. [The Brain Visualizer](#the-brain-visualizer)
10. [Security Model](#security-model)
11. [Development Phases](#development-phases)

---

## Stack Overview

| Layer | Technology | Why |
|-------|------------|-----|
| **Landing** | Next.js 14 + Tailwind | SEO, fast, easy Vercel deploy |
| **Web/Mobile App** | Expo SDK 52 (React Native Web) | Single codebase web+mobile |
| **Auth** | Clerk | Better DX than Supabase Auth, magic links, OAuth |
| **Database** | Supabase (Postgres) | Familiar, fast iteration, good free tier |
| **Realtime** | Supabase Realtime + WebSocket | Chat streaming, status updates |
| **Payments** | Stripe (Subscriptions + Metered Billing) | Industry standard |
| **Bot Runtime** | Dockerized Clawdbot | Isolated per user |
| **Container Hosting** | Fly.io Machines API | Fast cold starts, pay-per-use, good API |
| **IaC** | Pulumi (TypeScript) | Type-safe, same language as app |
| **Secrets** | Fly.io Secrets + Supabase Vault | Never exposed to users |
| **CDN/Edge** | Vercel Edge + Fly.io edge | Low latency globally |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOLT-OS PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   FRONTEND                           BACKEND                                 │
│   ────────                           ───────                                 │
│   ┌──────────────┐                   ┌──────────────────────────────────┐   │
│   │  Landing     │                   │         API Layer                │   │
│   │  (Next.js)   │                   │   (Next.js API Routes/Vercel)   │   │
│   │  Vercel      │                   │                                  │   │
│   └──────────────┘                   │  ┌────────┐ ┌────────┐ ┌──────┐ │   │
│                                      │  │ /auth  │ │/billing│ │/bots │ │   │
│   ┌──────────────┐                   │  └────────┘ └────────┘ └──────┘ │   │
│   │  Web App     │◄──────────────────┤                                  │   │
│   │  (Expo Web)  │                   └──────────────┬───────────────────┘   │
│   │  Vercel      │                                  │                       │
│   └──────────────┘                                  │                       │
│                                                     ▼                       │
│   ┌──────────────┐                   ┌──────────────────────────────────┐   │
│   │  Mobile App  │                   │        DATA LAYER                │   │
│   │  (Expo)      │                   │                                  │   │
│   │  App Stores  │                   │  ┌──────────┐    ┌────────────┐ │   │
│   └──────────────┘                   │  │ Supabase │    │   Stripe   │ │   │
│                                      │  │ Postgres │    │  Billing   │ │   │
│                                      │  │ Realtime │    │  Metering  │ │   │
│                                      │  └──────────┘    └────────────┘ │   │
│                                      └──────────────┬───────────────────┘   │
│                                                     │                       │
│                                                     ▼                       │
│                                      ┌──────────────────────────────────┐   │
│                                      │      BOT INFRASTRUCTURE          │   │
│                                      │         (Fly.io)                 │   │
│                                      │                                  │   │
│                                      │  ┌────────┐ ┌────────┐ ┌──────┐ │   │
│                                      │  │ Bot #1 │ │ Bot #2 │ │ ...  │ │   │
│                                      │  │ User A │ │ User B │ │      │ │   │
│                                      │  └────────┘ └────────┘ └──────┘ │   │
│                                      │                                  │   │
│                                      │  Each bot = isolated Clawdbot   │   │
│                                      │  container with user's config   │   │
│                                      └──────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Ghost Key System

**Problem:** Users shouldn't need to get API keys from OpenAI, Anthropic, Venice, etc.

**Solution:** Molt-OS holds "master" API keys and proxies all AI requests.

### How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│  User's Bot │────▶│  Molt-OS    │────▶│  AI Provider│
│   (Chat)    │     │  (Fly.io)   │     │  Proxy      │     │  (Venice)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Log Usage   │     │ Report to   │
                    │ to Supabase │     │   Stripe    │
                    └─────────────┘     └─────────────┘
```

### Implementation

1. **Master Keys Storage:** Fly.io secrets (never in code/DB)
   ```bash
   fly secrets set VENICE_API_KEY=xxx OPENAI_API_KEY=xxx --app molt-os-proxy
   ```

2. **Proxy Service:** Lightweight container that:
   - Receives requests from user bots
   - Adds master API key
   - Forwards to AI provider
   - Logs token usage with `user_id`
   - Returns response

3. **Bot Configuration:** Each user's Clawdbot config points to our proxy:
   ```json
   {
     "models": {
       "providers": {
         "venice": {
           "baseUrl": "https://proxy.molt-os.com/v1"
         }
       }
     }
   }
   ```

4. **Usage Metering:**
   - Proxy extracts `usage.prompt_tokens` and `usage.completion_tokens`
   - Writes to `usage_logs` table with user_id
   - Cron job aggregates and reports to Stripe Metering API

### Cost Calculation

```
User Monthly Bill = $50 (base) + (tokens_used × cost_per_token × 1.2)
```

The 20% markup covers:
- Infrastructure costs
- Support overhead
- Margin

---

## User Provisioning Flow

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING FLOW                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. SIGNUP                                                                │
│     User → Landing Page → "Get Started" → Clerk Auth                     │
│                                              │                            │
│                                              ▼                            │
│  2. PROFILE CREATION                                                      │
│     Clerk webhook → Create user in Supabase                              │
│                              │                                            │
│                              ▼                                            │
│  3. ONBOARDING WIZARD                                                     │
│     User selects:                                                         │
│     • Vertical (Executive/Developer/Researcher/Creator)                  │
│     • Name for their AI                                                   │
│     • Timezone                                                            │
│                              │                                            │
│                              ▼                                            │
│  4. PAYMENT                                                               │
│     Stripe Checkout → $50/mo subscription                                │
│                              │                                            │
│     ┌────────────────────────┴─────────────────────────┐                 │
│     │           Stripe Webhook: payment_success         │                 │
│     └────────────────────────┬─────────────────────────┘                 │
│                              │                                            │
│                              ▼                                            │
│  5. BOT PROVISIONING (async, ~30 seconds)                                │
│     Provisioner service:                                                  │
│     a. Generate unique gateway_token                                      │
│     b. Create Fly Machine with env vars                                   │
│     c. Wait for health check                                              │
│     d. Update DB: bot.status = 'running'                                 │
│     e. Send "Your AI is ready!" email                                    │
│                              │                                            │
│                              ▼                                            │
│  6. READY                                                                 │
│     User opens app → WebSocket connects → Chat begins                    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Provisioner Logic (Pseudocode)

```typescript
async function provisionBot(userId: string, config: OnboardingConfig) {
  // 1. Generate secrets
  const gatewayToken = crypto.randomBytes(24).toString('hex');
  const botId = `molt-${userId.slice(0, 8)}`;
  
  // 2. Build Clawdbot config from user preferences
  const clawdbotConfig = buildConfig({
    vertical: config.vertical,
    timezone: config.timezone,
    botName: config.botName,
    gatewayToken,
    proxyUrl: 'https://proxy.molt-os.com/v1',
  });
  
  // 3. Create Fly Machine
  const machine = await fly.machines.create({
    app: 'molt-os-bots',
    name: botId,
    config: {
      image: 'ghcr.io/moltbot/clawdbot:latest',
      env: {
        CLAWDBOT_CONFIG: JSON.stringify(clawdbotConfig),
        MOLT_USER_ID: userId,
        MOLT_GATEWAY_TOKEN: gatewayToken,
      },
      services: [{
        ports: [{ port: 443, handlers: ['tls', 'http'] }],
        internal_port: 18789,
      }],
      auto_destroy: false,
      restart: { policy: 'always' },
    },
  });
  
  // 4. Wait for healthy
  await waitForHealthy(machine.id);
  
  // 5. Store in DB
  await supabase.from('bots').insert({
    id: botId,
    user_id: userId,
    fly_machine_id: machine.id,
    gateway_token: gatewayToken, // encrypted at rest
    gateway_url: `https://${botId}.fly.dev`,
    status: 'running',
    config: clawdbotConfig,
  });
  
  // 6. Notify user
  await sendEmail(userId, 'your-bot-is-ready');
}
```

---

## Infrastructure as Code

### Directory Structure

```
infrastructure/
├── pulumi/
│   ├── Pulumi.yaml
│   ├── Pulumi.prod.yaml
│   ├── Pulumi.dev.yaml
│   ├── index.ts              # Main entry
│   ├── fly.ts                # Fly.io resources
│   ├── supabase.ts           # DB migrations
│   └── stripe.ts             # Stripe products/prices
└── docker/
    ├── Dockerfile.proxy      # AI proxy service
    └── Dockerfile.bot        # (optional custom bot image)
```

### Pulumi Stack (index.ts)

```typescript
import * as pulumi from '@pulumi/pulumi';
import * as fly from '@pulumi/fly';

// Fly.io App for the proxy
const proxyApp = new fly.App('molt-os-proxy', {
  name: 'molt-os-proxy',
  org: 'personal',
});

// Fly.io App for user bots (machines created dynamically)
const botsApp = new fly.App('molt-os-bots', {
  name: 'molt-os-bots',
  org: 'personal',
});

// Secrets for proxy
const proxySecrets = new fly.Secret('proxy-secrets', {
  app: proxyApp.name,
  secrets: {
    VENICE_API_KEY: pulumi.secret(process.env.VENICE_API_KEY!),
    OPENAI_API_KEY: pulumi.secret(process.env.OPENAI_API_KEY!),
    ANTHROPIC_API_KEY: pulumi.secret(process.env.ANTHROPIC_API_KEY!),
    SUPABASE_SERVICE_KEY: pulumi.secret(process.env.SUPABASE_SERVICE_KEY!),
  },
});

export const proxyUrl = pulumi.interpolate`https://${proxyApp.name}.fly.dev`;
export const botsAppName = botsApp.name;
```

---

## Database Schema

### Tables

```sql
-- Users (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe info
CREATE TABLE billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'past_due', 'canceled'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bots
CREATE TABLE bots (
  id TEXT PRIMARY KEY, -- 'molt-abc123'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fly_machine_id TEXT,
  gateway_url TEXT,
  gateway_token TEXT, -- encrypted
  status TEXT DEFAULT 'provisioning', -- 'provisioning', 'running', 'stopped', 'error'
  vertical TEXT, -- 'executive', 'developer', 'researcher', 'creator'
  config JSONB, -- full Clawdbot config
  bot_name TEXT DEFAULT 'Assistant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage logs (for billing)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  bot_id TEXT REFERENCES bots(id),
  model TEXT NOT NULL,
  tokens_in INTEGER NOT NULL,
  tokens_out INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6), -- calculated cost
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated usage (for Stripe reporting)
CREATE TABLE usage_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_tokens INTEGER NOT NULL,
  total_cost_usd DECIMAL(10, 2),
  reported_to_stripe BOOLEAN DEFAULT FALSE,
  stripe_usage_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills installed per bot
CREATE TABLE bot_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id TEXT REFERENCES bots(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL, -- from ClawdHub
  skill_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB, -- skill-specific config
  installed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_logs_user_timestamp ON usage_logs(user_id, timestamp);
CREATE INDEX idx_bots_user ON bots(user_id);
CREATE INDEX idx_billing_user ON billing(user_id);
```

---

## API Design

### Endpoints

```
Auth (handled by Clerk)
──────────────────────
POST   /api/auth/webhook          # Clerk webhook (user created/updated)

Billing
──────────────────────
POST   /api/billing/checkout      # Create Stripe checkout session
POST   /api/billing/webhook       # Stripe webhooks
GET    /api/billing/portal        # Stripe customer portal URL
GET    /api/billing/usage         # Current period usage

Bots
──────────────────────
GET    /api/bots                  # List user's bots
GET    /api/bots/:id              # Get bot details
POST   /api/bots/:id/config       # Update bot config (from UI)
POST   /api/bots/:id/restart      # Restart bot
DELETE /api/bots/:id              # Delete bot

Skills
──────────────────────
GET    /api/skills                # List available skills
GET    /api/bots/:id/skills       # List installed skills
POST   /api/bots/:id/skills       # Install skill
DELETE /api/bots/:id/skills/:sid  # Uninstall skill

Chat (WebSocket)
──────────────────────
WS     /api/chat/:botId           # Proxy to user's bot gateway
```

---

## The Config UI

**Goal:** Users configure their bot visually. No JSON. No terminal.

### Config Sections

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️  Settings                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PROFILE                                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Bot Name: [  My Assistant  ]                           │ │
│  │ Personality: [Dropdown: Friendly / Professional / ...]│ │
│  │ Timezone: [Dropdown: America/Los_Angeles]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  MODELS                                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Default Model: [Dropdown: GPT-5 / Claude Opus / ...]   │ │
│  │ Fallback Model: [Dropdown]                             │ │
│  │ 💡 "We handle the API keys. Just pick your model."     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  SKILLS                                   [Browse Store →]  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✅ Gmail Integration              [Configure] [Remove] │ │
│  │ ✅ Google Calendar                [Configure] [Remove] │ │
│  │ ⬜ GitHub (not installed)                   [Install]  │ │
│  │ ⬜ Notion (not installed)                   [Install]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  NOTIFICATIONS                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑️ Email notifications for important updates           │ │
│  │ ☑️ Daily summary at [ 9:00 AM ]                        │ │
│  │ ⬜ Push notifications (requires mobile app)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                                      [ Save Changes ]        │
└─────────────────────────────────────────────────────────────┘
```

### Config → Clawdbot Translation

When user clicks "Save Changes":

```typescript
async function saveConfig(botId: string, uiConfig: UIConfig) {
  // 1. Translate UI config to Clawdbot format
  const clawdbotConfig = {
    agents: {
      defaults: {
        model: {
          primary: `venice/${uiConfig.defaultModel}`,
          fallbacks: [uiConfig.fallbackModel].filter(Boolean),
        },
      },
    },
    // ... other mappings
  };
  
  // 2. Update DB
  await supabase
    .from('bots')
    .update({ config: clawdbotConfig })
    .eq('id', botId);
  
  // 3. Push to running bot (hot reload)
  await fetch(`${bot.gateway_url}/api/config`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${bot.gateway_token}` },
    body: JSON.stringify(clawdbotConfig),
  });
}
```

---

## The Brain Visualizer

### Tech Choice: React Flow

**Why React Flow:**
- Built for node-based UIs
- Good performance with many nodes
- Supports custom node types
- Well-documented, active community

### Data Flow

```
Bot Gateway → WebSocket → Molt-OS App → React Flow
     │
     └── Events:
         • { type: 'thinking', content: '...' }
         • { type: 'tool_call', tool: 'web_search', args: {...} }
         • { type: 'tool_result', tool: 'web_search', result: {...} }
         • { type: 'memory_access', action: 'read', file: 'MEMORY.md' }
         • { type: 'message', role: 'assistant', content: '...' }
```

### Node Types

```typescript
type BrainNode =
  | { type: 'user_message'; content: string }
  | { type: 'thinking'; content: string }
  | { type: 'tool_call'; tool: string; args: object }
  | { type: 'tool_result'; tool: string; result: object; success: boolean }
  | { type: 'assistant_message'; content: string };
```

### Visual Design

```
   ┌─────────────┐
   │ 💬 User     │
   │ "Check my   │
   │  calendar"  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 🧠 Thinking │
   │ "I'll check │
   │  Google..." │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 🔧 Tool     │─────────┐
   │ calendar    │         │
   │ .list()     │         │
   └──────┬──────┘         │
          │                │
          ▼                ▼
   ┌─────────────┐   ┌─────────────┐
   │ ✅ Result   │   │ 📄 Memory   │
   │ 3 events    │   │ Read prefs  │
   │ today       │   │             │
   └──────┬──────┘   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │ 🤖 Response │
   │ "You have   │
   │  3 meetings │
   │  today..."  │
   └─────────────┘
```

---

## Security Model

### Principles

1. **Isolation:** Each user's bot runs in its own container. No shared state.
2. **Zero Trust:** User bots never have direct access to master API keys.
3. **Encryption:** Gateway tokens encrypted at rest in Supabase.
4. **Least Privilege:** Bots only access what skills explicitly allow.

### Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| User tries to steal API keys | Keys only in proxy, never sent to user bots |
| Malicious bot code | Docker isolation, no root, read-only filesystem |
| Token abuse | Per-user rate limits, anomaly detection |
| Data exfiltration | Network policies, no outbound except allowed domains |
| Session hijacking | Short-lived JWTs, secure cookies, Clerk handles auth |

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [x] Landing page
- [ ] Supabase project + schema
- [ ] Clerk integration
- [ ] Basic Expo app with auth

### Phase 2: Core App (Week 3-4)
- [ ] Chat UI
- [ ] WebSocket connection to test bot
- [ ] Settings page (profile, preferences)
- [ ] Config UI (model selection, no skills yet)

### Phase 3: Billing (Week 5)
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Usage tracking
- [ ] Metered billing

### Phase 4: Provisioning (Week 6-7)
- [ ] Fly.io Machines API integration
- [ ] Provisioner service
- [ ] Bot health monitoring
- [ ] Auto-restart on failure

### Phase 5: Skills & Polish (Week 8+)
- [ ] Skills store UI
- [ ] Brain visualizer (basic)
- [ ] Mobile builds
- [ ] Public beta

---

## File Structure (Final)

```
molt-os/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL-SPEC.md      # ← This file
│   └── MILESTONES.md
├── packages/
│   ├── landing/               # Next.js marketing site
│   │   ├── src/app/
│   │   └── ...
│   ├── app/                   # Expo web+mobile app
│   │   ├── app/               # expo-router pages
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── clerk.ts
│   │   │   └── api.ts
│   │   └── ...
│   ├── api/                   # API routes (or in app/)
│   │   ├── billing/
│   │   ├── bots/
│   │   └── ...
│   └── shared/                # Shared types, utils
│       ├── types.ts
│       └── constants.ts
├── infrastructure/
│   ├── pulumi/
│   │   ├── index.ts
│   │   └── ...
│   └── docker/
│       └── Dockerfile.proxy
└── services/
    └── proxy/                 # AI proxy service
        ├── index.ts
        └── Dockerfile
```

---

## Next Steps

1. **Set up Supabase project** — Create tables, enable RLS
2. **Set up Clerk** — Create app, get keys
3. **Scaffold Expo app** — With expo-router, basic auth
4. **Build chat UI** — Connect to your existing Clawdbot as test

Ready to code?

---

*Last updated: 2026-01-30 | R2 + Clawd 🦞*
