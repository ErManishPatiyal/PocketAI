# PocketAI Protocol examples (v1)

Realistic JSON event sequences for backends and clients.

These files are the shared fixtures for the language-independent protocol.
They do not depend on TypeScript.

| File | Sequence |
|---|---|
| `simple-response.json` | `message_start` → `text_delta` ×2 → `message_complete` |
| `rag-response.json` | thinking activity + `source` + `citation` + text |
| `agent-response.json` | thinking + `tool_call_*` + text |
| `error.json` | `message_start` → `error` |

Every event in a file shares the same `requestId`.
