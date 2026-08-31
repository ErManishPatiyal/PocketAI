import type { JsonObject } from '../core/json.js';
import type { PocketAIEvent } from '../protocol/events.js';

/**
 * Transport abstraction only — no SSE/WebSocket implementations in Phase 1.
 * Protocol types must not import this module.
 */

export type Unsubscribe = () => void;

/**
 * Minimal client → backend requests. Concrete transports map these later.
 */
export type ClientOutboundRequest =
  | {
      readonly type: 'send_message';
      readonly conversationId: string;
      readonly requestId: string;
      readonly messageId: string;
      readonly content: string;
      readonly metadata?: JsonObject;
    }
  | {
      readonly type: 'cancel';
      readonly conversationId: string;
      readonly requestId: string;
      readonly metadata?: JsonObject;
    };

export interface PocketAITransport {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(request: ClientOutboundRequest): Promise<void>;
  subscribe(listener: (event: PocketAIEvent) => void): Unsubscribe;
}
