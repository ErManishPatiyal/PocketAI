# PocketAI

**Backend-agnostic AI integration for React Native.**

PocketAI lets organizations that already have AI capabilities bring those capabilities into mobile apps without coupling the app to a specific backend, LLM provider, or agent framework.

```text
React Native App
  → PocketAI SDK
  → PocketAI Protocol (JSON)
  → Transport
  → Existing AI backend (FastAPI, Node, Java, .NET, LangGraph, Bedrock, custom, …)
```

PocketAI is an **integration layer**, not an AI backend.

## Core architecture

| Layer | Role |
|---|---|
| **Protocol** | Language-independent JSON event stream (`docs/protocol.md`) |
| **Domain models** | Client-side Conversation / Message aggregates (built later from events) |
| **Transport** | Interfaces only in Phase 1 (SSE/WebSocket later) |
| **React Native** | Host/demo app; UI arrives in a later phase |

The **event stream** is the primary backend contract. Multiple backends can emit the same events while the mobile app stays unchanged.

## Why the protocol exists

Without a normalized protocol, every mobile app re-implements provider-specific streaming formats. PocketAI defines one capability-oriented event model (`text_delta`, `citation`, `source`, `tool_call_*`, user-visible `thinking_*` activity, etc.) that any backend can produce.

TypeScript types and Zod schemas in `@pocketai/sdk` implement that contract for TypeScript clients. They are **not** the contract itself — see [`docs/protocol.md`](docs/protocol.md).

## Phase 1 scope

This repository currently includes:

- Monorepo with `@pocketai/sdk` (placeholder package name)
- Domain models (Conversation, Message, Citation, Source, ToolCall, Attachment, AIError)
- PocketAI Protocol **v1** + Zod validation / parse / serialize
- Transport **interfaces** only
- Protocol JSON examples
- Unit tests
- React Native CLI example stub (no chat UI)

**Not in Phase 1:** chat UI, Stitch designs, SSE/WebSocket, authentication, AI providers, FastAPI/Node demos, runtime/reducer, file upload pipelines.

## Project structure

```text
PocketAI/
├── packages/sdk/           # @pocketai/sdk — protocol + domain + transport types
├── example/                # React Native CLI host (stub)
├── examples/protocol/      # JSON event sequences
├── docs/
│   ├── architecture.md
│   └── protocol.md         # language-independent contract
├── package.json            # npm workspaces
└── README.md
```

## How the protocol works

1. Client sends a request (transport-specific; later phases).
2. Backend streams PocketAI events sharing one `requestId`.
3. Events such as `message_start` → `text_delta` → `message_complete` describe the turn.
4. Optional `thinking_*` events show **user-visible activity** (e.g. “Searching knowledge”), never private chain-of-thought.
5. Citations reference sources via `sourceId`.
6. A future runtime reduces events into domain models for UI.

Example fixtures: [`examples/protocol/`](examples/protocol/).

## Development

```bash
npm install
npm run build
npm test
npm run typecheck
```

### Using the SDK (placeholder name)

```ts
import {
  PROTOCOL_VERSION,
  parsePocketAIEvent,
  type PocketAIEvent,
  type Conversation,
  type Message,
} from '@pocketai/sdk';
```

## What comes next

1. Event → state runtime
2. HTTP/SSE and WebSocket transports
3. React Native UI
4. Demo backends emitting identical protocol events

See [`docs/architecture.md`](docs/architecture.md) for layering details.
