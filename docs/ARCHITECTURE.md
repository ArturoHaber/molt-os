# Molt-OS — Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOLT-OS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Landing    │    │   Web App    │    │  Mobile App  │       │
│  │   (Next.js)  │    │   (Expo)     │    │   (Expo)     │       │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘       │
│                             │                    │               │
│                             └────────┬───────────┘               │
│                                      │                           │
│                                      ▼                           │
│                          ┌───────────────────┐                   │
│                          │    API Gateway    │                   │
│                          │   (Edge/Serverless)│                  │
│                          └─────────┬─────────┘                   │
│                                    │                             │
│         ┌──────────────────────────┼──────────────────────────┐  │
│         │                          │                          │  │
│         ▼                          ▼                          ▼  │
│  ┌─────────────┐          ┌─────────────┐          ┌──────────┐ │
│  │   Supabase  │          │   Stripe    │          │ Fly.io   │ │
│  │  (Auth/DB)  │          │  (Billing)  │          │(Containers)│ │
│  └─────────────┘          └─────────────┘          └────┬─────┘ │
│                                                         │       │
│                                                         ▼       │
│                                              ┌──────────────────┐│
│                                              │  User Bot Pool   ││
│                                              │ ┌──────┐┌──────┐ ││
│                                              │ │Bot 1 ││Bot 2 │ ││
│                                              │ └──────┘└──────┘ ││
│                                              │ ┌──────┐┌──────┐ ││
│                                              │ │Bot 3 ││Bot N │ ││
│                                              │ └──────┘└──────┘ ││
│                                              └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Landing Page (Next.js)
- **Purpose:** Marketing, SEO, waitlist capture
- **Stack:** Next.js 14, Tailwind CSS, Framer Motion
- **Hosting:** Vercel
- **Domain:** molt-os.com (TBD)

### 2. Web/Mobile App (Expo)
- **Purpose:** Main user interface for chatting with their bot
- **Stack:** Expo SDK 52+, React Native Web, expo-router
- **Features:**
  - Auth (Clerk or Supabase)
  - Real-time chat via WebSocket
  - Settings/profile management
  - Usage dashboard
  - The Brain View (visualizer)

### 3. API Gateway
- **Purpose:** Central API for auth, billing, provisioning
- **Options:**
  - Supabase Edge Functions
  - Vercel Serverless Functions
  - Dedicated Node.js server (Railway)
- **Endpoints:**
  - `POST /auth/*` — handled by Clerk/Supabase
  - `POST /billing/checkout` — create Stripe checkout
  - `POST /billing/webhook` — Stripe webhooks
  - `POST /provision` — spin up new bot
  - `GET /usage` — get user's token usage
  - `WS /chat` — proxy to user's bot gateway

### 4. Database (Supabase)
- **Tables:**
  ```sql
  users (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    created_at timestamp,
    stripe_customer_id text,
    subscription_status text
  )

  bots (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    fly_app_id text,
    gateway_token text,
    status text, -- 'provisioning', 'running', 'stopped'
    created_at timestamp
  )

  usage_logs (
    id uuid PRIMARY KEY,
    bot_id uuid REFERENCES bots(id),
    tokens_in int,
    tokens_out int,
    model text,
    timestamp timestamp
  )
  ```

### 5. Billing (Stripe)
- **Subscription:** $50/mo base fee
- **Metered Billing:** Token usage reported via Stripe Metering API
- **Pricing:** Cost × 1.2 markup
- **Webhooks:**
  - `checkout.session.completed` → trigger bot provisioning
  - `customer.subscription.deleted` → stop/delete bot
  - `invoice.payment_failed` → pause bot, notify user

### 6. Bot Provisioning (Fly.io)
- **Per-User Isolation:** Each user gets their own Fly Machine
- **Image:** `ghcr.io/moltbot/clawdbot:latest` (or custom)
- **Provisioning Flow:**
  1. User pays via Stripe
  2. Webhook triggers `provision` function
  3. Fly API creates new machine with env vars
  4. Store `fly_app_id` and `gateway_token` in DB
  5. User's app connects via WebSocket
- **Lifecycle:**
  - Auto-sleep after 15min inactivity (cost savings)
  - Wake on first request (< 2s cold start)

---

## Data Flow

### User Signs Up & Pays
```
User → Landing Page → "Get Started"
  → Stripe Checkout → Payment Success
  → Webhook → provision() function
  → Fly.io: Create Machine
  → DB: Store bot record
  → Email: "Your bot is ready!"
  → User opens App → Connects to their bot
```

### User Sends Message
```
User → App → WebSocket → API Gateway
  → Route to user's Fly Machine (bot)
  → Bot processes message
  → Bot streams response
  → Gateway relays to App
  → App displays message
```

### Usage Billing
```
Bot logs token usage → Gateway hook
  → API: POST /usage
  → DB: Insert usage_log
  → Stripe: Report metered usage
  → End of month: Stripe invoices user
```

---

## Security Considerations

- **Bot Isolation:** Each user's bot runs in separate container, no shared state
- **Token Security:** Gateway tokens are per-user, stored encrypted
- **API Keys:** Master AI provider keys stored in Fly secrets, never exposed to users
- **Auth:** JWT tokens via Clerk/Supabase, short expiry
- **Rate Limiting:** Per-user rate limits to prevent abuse

---

## Cost Estimates (Per User)

| Item | Monthly Cost |
|------|--------------|
| Fly Machine (shared-cpu-1x, 256MB) | ~$2-5 |
| Supabase (free tier) | $0 |
| Stripe fees (2.9% + 30¢) | ~$1.75 |
| AI tokens (passthrough) | Variable |
| **Platform overhead** | **~$5-7** |
| **User pays** | **$50 + usage** |
| **Gross margin** | **~$43-45/user** |

---

## Open Decisions

1. **Fly.io vs Railway vs Render** — Need to test cold start times
2. **Always-on vs Auto-sleep** — Tradeoff: cost vs latency
3. **Multi-tenant option** — Could run multiple users per large instance (cheaper but less isolated)
4. **Visualizer tech** — Canvas? React Flow? D3?

---

*Last updated: 2026-01-29*
