/**
 * @pocketai/sdk — public API (placeholder package name)
 *
 * Protocol + domain models + transport interfaces.
 * Does not import React or React Native.
 */

// Core / domain
export type {
  AIError,
  Attachment,
  AttachmentStatus,
  Citation,
  Conversation,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  Message,
  MessageActivity,
  MessageRole,
  MessageStatus,
  Source,
  ToolCall,
  ToolCallStatus,
} from './core/index.js';
export { ProtocolError } from './core/index.js';

// Protocol
export type {
  AttachmentCompleteEvent,
  AttachmentProgressEvent,
  AttachmentStartEvent,
  CitationEvent,
  ErrorEvent,
  MessageCompleteEvent,
  MessageScopedEventBase,
  MessageStartEvent,
  ParseFailure,
  ParseSuccess,
  PocketAIEvent,
  PocketAIEventBase,
  PocketAIEventType,
  ProtocolVersion,
  SafeParseResult,
  SourceEvent,
  TextDeltaEvent,
  ThinkingCompleteEvent,
  ThinkingDeltaEvent,
  ThinkingStartEvent,
  ToolCallCompleteEvent,
  ToolCallStartEvent,
  ToolCallUpdateEvent,
} from './protocol/index.js';
export {
  POCKETAI_EVENT_TYPES,
  PROTOCOL_VERSION,
  parsePocketAIEvent,
  parsePocketAIEventJson,
  pocketAIEventSchema,
  safeParsePocketAIEvent,
  serializePocketAIEvent,
} from './protocol/index.js';

// Transport
export type {
  ClientOutboundRequest,
  PocketAITransport,
  Unsubscribe,
} from './transport/index.js';
