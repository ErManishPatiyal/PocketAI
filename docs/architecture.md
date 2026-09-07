# PocketAI Architecture (Phase 1)

## Product thesis

```text
Existing AI Backend → PocketAI → Mobile Experience
```

PocketAI is a **backend-agnostic React Native AI integration layer**, not an AI backend. Organizations keep their FastAPI, Node, Java, .NET, LangChain, Bedrock, or custom stacks and expose a normalized **PocketAI Protocol**.

## Layering / data flow

Protocol JSON is the language-independent contract. At runtime, a transport delivers those events into the future client runtime, which materializes domain models for the UI:

```text
Backend (any) / Mock Source
    ↓
Transport                    ← delivers PocketAI Protocol events
    ↓
PocketAI Protocol (JSON)     ← language-independent event stream
    ↓
Runtime / state (later)      ← consumes events, builds Conversation / Message
    ↓
Domain models                ← client-side aggregates (not the wire format)
    ↓
React Native UI (later)
```

Phase 1 implements **protocol + domain models + transport interfaces** only. There is no runtime/reducer, no SSE/WebSocket, no UI, and no AI providers.

## Workspace layout

```text
packages/sdk/          @pocketai/sdk (placeholder name) — no React/RN imports
example/               React Native CLI host stub
examples/protocol/     Realistic JSON event sequences
docs/                  Architecture + protocol contract
```

`@pocketai/sdk` is a **placeholder** until the final npm package structure is decided (for example `@pocketai/react-native`).

## Architectural decisions

### Protocol is language-independent

The contract is **JSON + [`docs/protocol.md`](protocol.md)**. TypeScript and Zod in the SDK are one implementation. Python, Java, and .NET backends can emit the same events without depending on this repository.

### SDK is React Native-safe but UI-independent

`packages/sdk` must not import React or React Native. A future RN integration package can depend on this core without coupling the protocol to UI.

### Event stream is primary

Backends emit events. Clients do not assume a complete `Message` payload. Domain models exist so a future runtime can materialize conversations from the stream.

### `requestId` correlates a request

Every event includes `requestId` so the full stream for one client request can be correlated.

### `thinking_*` is user-visible activity

These events carry `activityId`, `activityType`, and optional user-visible text. They must never represent private chain-of-thought.

### No provider coupling

There are no imports or types for OpenAI, Anthropic, Gemini, Bedrock, LangChain, LangGraph, LlamaIndex, or FastAPI.

### Architecture document note

No separate architectural Markdown document was present in the repository at Phase 1 start. This document and `protocol.md` capture the Phase 1 decisions from the product brief.

## What comes next

1. **Mock Transport / event simulation** — replay protocol JSON fixtures without a real backend
2. **Runtime / state** — reduce events into conversations and messages
3. **React Native UI** — consume domain models built by the runtime
4. **Real backends** — FastAPI, Node, and others emitting the same PocketAI Protocol (HTTP/SSE, WebSocket, etc.)
