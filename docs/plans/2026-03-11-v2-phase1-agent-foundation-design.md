# GiftStash V2 Phase 1 — Agent Foundation + Personas

**Date:** 2026-03-11
**Status:** Approved

---

## Overview

Phase 1 replaces the monolithic 451-line SMS endpoint with a hierarchical agent system. The core SMS capture flow stays identical from the user's perspective — what changes is the internal architecture to support multi-turn conversations, persona-driven responses, and extensibility for Phases 2-4.

## File Structure

```
src/lib/agents/
├── types.ts                    # Intent, AgentResponse, ConversationContext, Action
├── base-agent.ts               # Abstract BaseAgent class
├── orchestrator.ts             # GiftStashOrchestrator (intent routing + persona detection)
├── capture-agent.ts            # CaptureAgent (parse + store gifts)
├── personas.ts                 # Dash/Scout detection logic + prompt templates
└── conversation-manager.ts     # Supabase-backed conversation context

src/lib/
├── claude.ts                   # callClaude() gateway (retry, metrics, cost tracking)
└── (existing files untouched)

src/app/api/sms/receive/
└── route.ts                    # Slimmed to ~80 lines: validate → orchestrator → TwiML
```

## Type System

```typescript
type IntentType = 'capture' | 'lookup' | 'suggest' | 'budget'
                | 'occasion' | 'inventory' | 'enrich' | 'status';

interface Intent {
  type: IntentType;
  confidence: number;
  source: 'keyword' | 'ai';
}

interface AgentResponse {
  reply: string;
  actions: Action[];
  persona: 'dash' | 'scout';
  followUp?: IntentType;
  confidence: number;
  agentPath: string[];
}

interface Action {
  type: 'create_gift' | 'update_gift' | 'match_recipient' | 'log_conversation';
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
}

interface ConversationContext {
  userId: string;
  conversationId: string;
  history: ConversationMessage[];
  recipient?: Recipient;
  persona: 'dash' | 'scout';
  images?: { url: string; base64: string }[];
  metadata: Record<string, unknown>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

## callClaude() Gateway

Centralized AI gateway replacing all scattered `anthropic.messages.create()` calls.

```typescript
export async function callClaude(
  prompt: string,
  options: {
    model?: 'sonnet' | 'haiku';
    maxTokens?: number;
    system?: string;
    temperature?: number;
    caller?: string;
    images?: { base64: string; mediaType: string }[];
  } = {}
): Promise<string>
```

Features:
- Retry with exponential backoff (429/500/502/503/529) — 1s → 2s → 4s, max 3 attempts
- Token/latency/cost metrics buffered and flushed async to `giftstash_ai_calls` table
- Vision support for SMS image capture
- Model defaults: Haiku for routing/classification, Sonnet for vision + generation
- All calls tagged with `caller` for per-agent analytics

Cost model: Sonnet $3/MT input $15/MT output, Haiku $0.25/MT input $1.25/MT output.

## Orchestrator

```typescript
export class GiftStashOrchestrator {
  async handleSMS(
    message: string,
    images: { url: string; base64: string }[],
    user: { id: string; phone: string }
  ): Promise<AgentResponse>
}
```

Flow inside `handleSMS`:
1. Load conversation context via `ConversationManager.getOrCreate(userId, phone)`
2. Detect persona via `detectPersona(message, context)`
3. Classify intent — keyword fast-path, Haiku fallback, respect `followUp` from prior turn
4. Route to first agent where `canHandle(intent, context)` is true. Fallback: CaptureAgent
5. Execute agent, get `AgentResponse`
6. Persist conversation (fire-and-forget): user message + reply + intent + persona
7. Return `AgentResponse` to SMS route for TwiML wrapping

### Intent Keyword Patterns (fast path)

```
capture:   /would love|great for|gift idea|picked up|get her|get him|buy/i
lookup:    /what do i have|saved for|show me|list/i
suggest:   /help me find|suggest|recommend|ideas for/i
budget:    /how much|spent|budget|spending/i
occasion:  /when is|birthday|anniversary|coming up/i
inventory: /on hand|in stock|stash|closet|party gifts/i
enrich:    /find links|where to buy|price check/i
status:    /mark as|purchased|bought|given|wrapped/i
```

No match → Haiku classification. Still ambiguous → defaults to `capture`.

## Persona Detection

```typescript
export function detectPersona(
  message: string,
  context: ConversationContext
): 'dash' | 'scout'
```

Priority (first match wins):
1. Explicit override — message starts with `dash` or `scout`
2. Conversation continuity — keep persona if conversation < 30 min old
3. Urgency signals → Dash: `quick`, `fast`, `tonight`, `tomorrow`, `last minute`, `asap`, < 10 words
4. Thoughtfulness signals → Scout: `help me think`, `something special`, `meaningful`, > 30 words
5. Recipient relationship → Scout for spouse/parent/child/sibling; Dash for coworker/boss/acquaintance
6. Default → Dash

Persona prompt fragments injected into agent system prompts:
- **Dash:** Direct, 1 SMS segment target, max 1 follow-up question
- **Scout:** Warm, curious, asks about the person, explains why a gift fits

## CaptureAgent

Replaces the inline SMS parsing logic. Key improvement: receives conversation history (last 3-5 messages) so follow-ups like "actually make that two" or "for Mom not Dad" work.

```typescript
export class CaptureAgent extends BaseAgent {
  name = 'CaptureAgent';

  canHandle(intent: Intent): boolean {
    return intent.type === 'capture';
  }

  async execute(message: string, context: ConversationContext): Promise<AgentResponse> {
    // 1. Claude extraction: gift_name, recipient_names[], price, category, notes
    //    Haiku for text, Sonnet if images present
    // 2. Fuzzy-match recipients (reuse existing recipient-matcher.ts)
    // 3. Create gift via gifts.service.ts
    // 4. Link recipients via gift_recipients junction
    // 5. Return confirmation shaped by persona
  }
}
```

## Conversation Manager

```typescript
export class ConversationManager {
  static async getOrCreate(userId: string, phone: string): Promise<ConversationContext>
  static async appendMessage(convId: string, role: 'user' | 'assistant', content: string): void
  static async updateState(convId: string, updates: { lastIntent?, lastPersona?, followUp? }): void
}
```

Messages stored as JSONB array on the conversation row. One query for full context. Conversations auto-expire after 30 min of inactivity (`getOrCreate` starts fresh).

## Database Migrations

### giftstash_ai_calls
```sql
CREATE TABLE giftstash_ai_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  caller text NOT NULL,
  input_tokens int,
  output_tokens int,
  latency_ms int,
  estimated_cost_usd numeric(10,6),
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);
```

### giftstash_conversations
```sql
CREATE TABLE giftstash_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone text NOT NULL,
  persona text,
  last_intent text,
  follow_up text,
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## What Stays Untouched

- All existing API routes (recommendations, chat, extract-product, etc.) — migrated in later phases
- Chrome extension — works as-is, later phases update to route through orchestrator
- Services layer (gifts.service.ts, recipients.service.ts) — used by CaptureAgent directly
- Profile Hub sync — unchanged
- SmartTagPicker — unchanged
- All existing database tables — no schema changes to existing tables

## Phase 1 Deliverables

1. `src/lib/claude.ts` — callClaude() gateway
2. `src/lib/agents/types.ts` — type system
3. `src/lib/agents/base-agent.ts` — abstract base class
4. `src/lib/agents/personas.ts` — Dash/Scout detection + prompts
5. `src/lib/agents/conversation-manager.ts` — Supabase context
6. `src/lib/agents/capture-agent.ts` — gift parsing agent
7. `src/lib/agents/orchestrator.ts` — intent routing + full flow
8. `src/app/api/sms/receive/route.ts` — slimmed SMS endpoint
9. `docs/migrations/001-agent-foundation.sql` — new tables
