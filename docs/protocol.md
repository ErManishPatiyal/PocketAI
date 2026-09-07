# PocketAI Protocol (v1)

This document is the **language-independent interoperability contract** for PocketAI.

Any backend (FastAPI, Node.js, Java/.NET, Go, etc.) can implement PocketAI by emitting JSON that conforms to this specification. Implementations do **not** need TypeScript or the `@pocketai/sdk` package.

The TypeScript types and Zod schemas in `@pocketai/sdk` are **one implementation** of this contract for the React Native / TypeScript ecosystem. They are not the contract itself.

## Why the protocol exists

PocketAI connects existing AI backends to mobile experiences without coupling the app to a specific LLM, agent framework, or server stack.

```text
Backend (any)
    → PocketAI JSON events
    → PocketAI runtime / state (later)
    → Domain models
    → React Native UI (later)
```

The **event stream** is the primary integration contract. Backends do not send a complete `Message` object; clients construct domain models from events.

## Conventions

| Concern | Rule |
|---|---|
| Event `type` values | `snake_case` (`message_start`, `text_delta`, …) |
| JSON field names | `camelCase` (`eventId`, `requestId`, `messageId`, …) |
| Timestamps | ISO-8601 UTC strings |
| Protocol version | `"v1"` in `protocolVersion` on every event |
| Metadata | Optional `metadata` object for capability-agnostic extras only |

Framework-specific concepts (LangGraph nodes, provider IDs, etc.) must not appear as first-class fields. If needed, place them in `metadata`.

## Common envelope

Every event includes:

```json
{
  "type": "text_delta",
  "eventId": "evt_002",
  "conversationId": "conv_123",
  "requestId": "req_456",
  "timestamp": "2026-09-10T00:00:00.050Z",
  "protocolVersion": "v1",
  "messageId": "msg_789",
  "metadata": {}
}
```

| Field | Required | Description |
|---|---|---|
| `type` | yes | Event kind |
| `eventId` | yes | Unique id for this event |
| `conversationId` | yes | Conversation this stream belongs to |
| `requestId` | yes | Correlates all events for a single client request |
| `timestamp` | yes | Event time (ISO-8601 UTC) |
| `protocolVersion` | yes | Must be `"v1"` |
| `messageId` | conditional | See below |
| `metadata` | no | Opaque JSON object |

### `messageId` rules

`messageId` is **optional** on the base envelope.

It is **required** for events that belong to a message turn:

- `message_start`
- `thinking_start`, `thinking_delta`, `thinking_complete`
- `citation`
- `text_delta`
- `tool_call_start`, `tool_call_update`, `tool_call_complete`
- `attachment_start`, `attachment_progress`, `attachment_complete`
- `message_complete`

It is **not** automatically required for:

- `source` — identified by `sourceId`; may be referenced later by a citation
- `error` — may be conversation-scoped or message-scoped

## Event catalog

### `message_start`

Begins an assistant (or system) message turn.

| Field | Required | Notes |
|---|---|---|
| `messageId` | yes | |
| `role` | no | `"assistant"` or `"system"` |

### `thinking_*` (user-visible activity)

`thinking_start`, `thinking_delta`, and `thinking_complete` represent **user-visible processing/activity**, not private chain-of-thought or hidden model reasoning.

Examples of appropriate activity:

- Understanding the request
- Searching knowledge
- Retrieving information
- Calling a tool
- Processing a document
- Preparing a response

| Field | Required | Notes |
|---|---|---|
| `messageId` | yes | |
| `activityId` | yes | Stable id for this activity |
| `activityType` | start: yes; delta/complete: optional | e.g. `searching_knowledge` |
| `text` | no | User-visible status text |

Backends decide what is safe to expose.

### `citation` and `source`

These are separate concepts:

```text
generated content
      → citation
      → sourceId
      → source
```

**`citation`** (requires `messageId`):

| Field | Required |
|---|---|
| `citationId` | yes |
| `sourceId` | yes |
| `startOffset`, `endOffset`, `marker`, `text` | no |

**`source`** (`messageId` optional):

| Field | Required |
|---|---|
| `sourceId` | yes |
| `title` | yes |
| `documentType`, `origin`, `url`, `excerpt` | no |

Do not design these around a specific RAG or vector database.

### `tool_call_*`

Capability-oriented tool activity (`toolCallId`, `name`, optional `label`, `status`, `progress`, `message`, `result`).

### `text_delta`

Incremental generated content (`delta` string). Requires `messageId`.

### `attachment_*`

Lifecycle/progress only (`attachment_start`, `attachment_progress`, `attachment_complete`).

Phase 1 does **not** define file upload, transfer, storage, multipart handling, parsing, or OCR. Those remain out of scope.

### `message_complete`

Ends the message turn. Does **not** carry a full `Message` object. Optional `finishReason`: `stop` | `length` | `error` | `cancelled` | `other`.

### `error`

| Field | Required |
|---|---|
| `code` | yes |
| `message` | yes |
| `retryable`, `details`, `messageId` | no |

## Versioning

- Current version: **`v1`**
- No negotiation or migration in Phase 1
- Clients should reject events with an unsupported `protocolVersion`

## Example sequences

See [`examples/protocol/`](../examples/protocol/):

- `simple-response.json`
- `rag-response.json`
- `agent-response.json`
- `error.json`

All events in a sequence share the same `requestId`.
