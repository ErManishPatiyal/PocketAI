# PocketAI Example (React Native CLI)

Phase 1 host application. It imports `@pocketai/sdk` and displays `PROTOCOL_VERSION`.

There is **no chat UI** in this phase.

## Setup

From the repository root:

```bash
npm install
npm run build
```

Then:

```bash
cd example
npm start
# in another terminal:
npm run ios
# or
npm run android
```

Metro is configured to watch the monorepo and resolve `@pocketai/sdk` from `packages/sdk`.
