import { ProtocolError } from '../core/errors.js';
import type { PocketAIEvent } from './events.js';
import { pocketAIEventSchema } from './schemas.js';

export type ParseSuccess = {
  readonly success: true;
  readonly data: PocketAIEvent;
};

export type ParseFailure = {
  readonly success: false;
  readonly error: ProtocolError;
};

export type SafeParseResult = ParseSuccess | ParseFailure;

/**
 * Validate unknown input as a PocketAI protocol event.
 * Throws ProtocolError on failure.
 */
export function parsePocketAIEvent(input: unknown): PocketAIEvent {
  const result = pocketAIEventSchema.safeParse(input);
  if (!result.success) {
    throw new ProtocolError('Invalid PocketAI event', {
      code: 'INVALID_EVENT',
      details: result.error.flatten(),
      cause: result.error,
    });
  }
  return result.data as PocketAIEvent;
}

/**
 * Non-throwing parse boundary for malformed backend payloads.
 */
export function safeParsePocketAIEvent(input: unknown): SafeParseResult {
  const result = pocketAIEventSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: new ProtocolError('Invalid PocketAI event', {
        code: 'INVALID_EVENT',
        details: result.error.flatten(),
        cause: result.error,
      }),
    };
  }
  return { success: true, data: result.data as PocketAIEvent };
}

/**
 * Serialize a validated event to a JSON string.
 * Callers should pass already-valid events (or parse first).
 */
export function serializePocketAIEvent(event: PocketAIEvent): string {
  // Re-validate to ensure we never emit invalid protocol JSON.
  const validated = parsePocketAIEvent(event);
  return JSON.stringify(validated);
}

/**
 * Parse a JSON string into a PocketAI event.
 */
export function parsePocketAIEventJson(json: string): PocketAIEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch (cause) {
    throw new ProtocolError('Event JSON is not valid JSON', {
      code: 'INVALID_JSON',
      cause,
    });
  }
  return parsePocketAIEvent(parsed);
}
