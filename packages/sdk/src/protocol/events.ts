import type { JsonObject } from '../core/json.js';
import type { ProtocolVersion } from './version.js';

/**
 * Wire `type` values use snake_case.
 * TypeScript types use PascalCase.
 * JSON field names use camelCase.
 */

export const POCKETAI_EVENT_TYPES = [
  'message_start',
  'thinking_start',
  'thinking_delta',
  'thinking_complete',
  'citation',
  'source',
  'tool_call_start',
  'tool_call_update',
  'tool_call_complete',
  'text_delta',
  'attachment_start',
  'attachment_progress',
  'attachment_complete',
  'message_complete',
  'error',
] as const;

export type PocketAIEventType = (typeof POCKETAI_EVENT_TYPES)[number];

/**
 * Common envelope. `messageId` is optional here; Zod schemas require it
 * on message-scoped events and leave it optional on `source` and `error`.
 */
export interface PocketAIEventBase {
  readonly type: PocketAIEventType;
  readonly eventId: string;
  readonly conversationId: string;
  readonly requestId: string;
  readonly timestamp: string;
  readonly protocolVersion: ProtocolVersion;
  readonly messageId?: string;
  readonly metadata?: JsonObject;
}

/** Events that belong to a specific assistant/user message turn. */
export type MessageScopedEventBase = PocketAIEventBase & {
  readonly messageId: string;
};

export interface MessageStartEvent extends MessageScopedEventBase {
  readonly type: 'message_start';
  readonly role?: 'assistant' | 'system';
}

/**
 * User-visible processing activity — NOT private chain-of-thought.
 */
export interface ThinkingStartEvent extends MessageScopedEventBase {
  readonly type: 'thinking_start';
  readonly activityId: string;
  readonly activityType: string;
  readonly text?: string;
}

export interface ThinkingDeltaEvent extends MessageScopedEventBase {
  readonly type: 'thinking_delta';
  readonly activityId: string;
  readonly activityType?: string;
  readonly text?: string;
}

export interface ThinkingCompleteEvent extends MessageScopedEventBase {
  readonly type: 'thinking_complete';
  readonly activityId: string;
  readonly activityType?: string;
  readonly text?: string;
}

/**
 * Citation references a Source via stable sourceId.
 * generated content → citation → sourceId → source
 */
export interface CitationEvent extends MessageScopedEventBase {
  readonly type: 'citation';
  readonly citationId: string;
  readonly sourceId: string;
  readonly startOffset?: number;
  readonly endOffset?: number;
  readonly marker?: string;
  readonly text?: string;
}

/**
 * Source is independently identifiable by sourceId.
 * messageId is optional (not required by the protocol).
 */
export interface SourceEvent extends PocketAIEventBase {
  readonly type: 'source';
  readonly sourceId: string;
  readonly title: string;
  readonly documentType?: string;
  readonly origin?: string;
  readonly url?: string;
  readonly excerpt?: string;
}

export interface ToolCallStartEvent extends MessageScopedEventBase {
  readonly type: 'tool_call_start';
  readonly toolCallId: string;
  readonly name: string;
  readonly label?: string;
}

export interface ToolCallUpdateEvent extends MessageScopedEventBase {
  readonly type: 'tool_call_update';
  readonly toolCallId: string;
  readonly name?: string;
  readonly label?: string;
  readonly status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  readonly progress?: number;
  readonly message?: string;
}

export interface ToolCallCompleteEvent extends MessageScopedEventBase {
  readonly type: 'tool_call_complete';
  readonly toolCallId: string;
  readonly name?: string;
  readonly label?: string;
  readonly status: 'completed' | 'failed' | 'cancelled';
  readonly message?: string;
  readonly result?: JsonObject;
}

export interface TextDeltaEvent extends MessageScopedEventBase {
  readonly type: 'text_delta';
  readonly delta: string;
}

/** Attachment lifecycle only — no upload/storage/parsing in Phase 1. */
export interface AttachmentStartEvent extends MessageScopedEventBase {
  readonly type: 'attachment_start';
  readonly attachmentId: string;
  readonly name: string;
  readonly mimeType?: string;
  readonly sizeBytes?: number;
}

export interface AttachmentProgressEvent extends MessageScopedEventBase {
  readonly type: 'attachment_progress';
  readonly attachmentId: string;
  readonly progress: number;
  readonly status?: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';
  readonly message?: string;
}

export interface AttachmentCompleteEvent extends MessageScopedEventBase {
  readonly type: 'attachment_complete';
  readonly attachmentId: string;
  readonly name?: string;
  readonly status: 'ready' | 'failed';
  readonly mimeType?: string;
  readonly sizeBytes?: number;
  readonly url?: string;
  readonly message?: string;
}

export interface MessageCompleteEvent extends MessageScopedEventBase {
  readonly type: 'message_complete';
  readonly finishReason?: 'stop' | 'length' | 'error' | 'cancelled' | 'other';
}

/**
 * Error may be conversation-scoped or message-scoped.
 * messageId is optional.
 */
export interface ErrorEvent extends PocketAIEventBase {
  readonly type: 'error';
  readonly code: string;
  readonly message: string;
  readonly retryable?: boolean;
  readonly details?: JsonObject;
}

export type PocketAIEvent =
  | MessageStartEvent
  | ThinkingStartEvent
  | ThinkingDeltaEvent
  | ThinkingCompleteEvent
  | CitationEvent
  | SourceEvent
  | ToolCallStartEvent
  | ToolCallUpdateEvent
  | ToolCallCompleteEvent
  | TextDeltaEvent
  | AttachmentStartEvent
  | AttachmentProgressEvent
  | AttachmentCompleteEvent
  | MessageCompleteEvent
  | ErrorEvent;
