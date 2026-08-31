import type { JsonObject } from './json.js';

/**
 * Domain models are client-side aggregates. They are NOT the wire contract.
 * A future runtime will construct/update these from PocketAI events.
 */

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'failed';

export type ToolCallStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AttachmentStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed';

/**
 * User-visible processing activity derived from thinking_* events.
 * Never represents private chain-of-thought or hidden model reasoning.
 */
export interface MessageActivity {
  readonly activityId: string;
  readonly activityType: string;
  readonly text?: string;
  readonly status: 'active' | 'complete';
}

export interface Citation {
  readonly id: string;
  /** Stable reference to a Source. */
  readonly sourceId: string;
  readonly startOffset?: number;
  readonly endOffset?: number;
  readonly marker?: string;
  readonly text?: string;
  readonly metadata?: JsonObject;
}

export interface Source {
  readonly id: string;
  readonly title: string;
  readonly documentType?: string;
  readonly origin?: string;
  readonly url?: string;
  readonly excerpt?: string;
  readonly metadata?: JsonObject;
}

export interface ToolCall {
  readonly id: string;
  readonly name: string;
  readonly label?: string;
  readonly status: ToolCallStatus;
  readonly progress?: number;
  readonly message?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly result?: JsonObject;
  readonly metadata?: JsonObject;
}

/**
 * Attachment lifecycle state only. Upload/storage/parsing are out of scope.
 */
export interface Attachment {
  readonly id: string;
  readonly name: string;
  readonly status: AttachmentStatus;
  readonly mimeType?: string;
  readonly sizeBytes?: number;
  readonly progress?: number;
  readonly url?: string;
  readonly metadata?: JsonObject;
}

export interface AIError {
  readonly code: string;
  readonly message: string;
  readonly retryable?: boolean;
  readonly details?: JsonObject;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly role: MessageRole;
  readonly status: MessageStatus;
  readonly content: string;
  /** User-visible activity snapshots, not model reasoning. */
  readonly activities?: readonly MessageActivity[];
  readonly citations?: readonly Citation[];
  readonly sources?: readonly Source[];
  readonly toolCalls?: readonly ToolCall[];
  readonly attachments?: readonly Attachment[];
  readonly error?: AIError;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: JsonObject;
}

export interface Conversation {
  readonly id: string;
  readonly title?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: JsonObject;
}
