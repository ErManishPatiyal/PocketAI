import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  parsePocketAIEvent,
  parsePocketAIEventJson,
  safeParsePocketAIEvent,
  serializePocketAIEvent,
  PROTOCOL_VERSION,
  type PocketAIEvent,
} from '../../src/index.js';

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../examples/protocol',
);

function loadFixture(name: string): unknown[] {
  const raw = readFileSync(join(fixturesDir, name), 'utf8');
  return JSON.parse(raw) as unknown[];
}

function baseEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    eventId: 'evt_test',
    conversationId: 'conv_test',
    requestId: 'req_test',
    timestamp: '2026-09-10T00:00:00.000Z',
    protocolVersion: PROTOCOL_VERSION,
    ...overrides,
  };
}

describe('protocol events', () => {
  it('narrows discriminated unions by type', () => {
    const event = parsePocketAIEvent({
      type: 'text_delta',
      ...baseEnvelope({ messageId: 'msg_1' }),
      delta: 'hi',
    });

    if (event.type === 'text_delta') {
      expect(event.delta).toBe('hi');
      expect(event.messageId).toBe('msg_1');
    } else {
      expect.fail('expected text_delta');
    }
  });

  it('round-trips each event type through JSON', () => {
    const events: PocketAIEvent[] = [
      {
        type: 'message_start',
        ...baseEnvelope({ messageId: 'msg_1' }),
        role: 'assistant',
      } as PocketAIEvent,
      {
        type: 'thinking_start',
        ...baseEnvelope({ messageId: 'msg_1' }),
        activityId: 'act_1',
        activityType: 'preparing_response',
        text: 'Preparing response',
      } as PocketAIEvent,
      {
        type: 'thinking_delta',
        ...baseEnvelope({ messageId: 'msg_1' }),
        activityId: 'act_1',
        text: 'Still working',
      } as PocketAIEvent,
      {
        type: 'thinking_complete',
        ...baseEnvelope({ messageId: 'msg_1' }),
        activityId: 'act_1',
      } as PocketAIEvent,
      {
        type: 'citation',
        ...baseEnvelope({ messageId: 'msg_1' }),
        citationId: 'cit_1',
        sourceId: 'src_1',
        marker: '[1]',
      } as PocketAIEvent,
      {
        type: 'source',
        ...baseEnvelope(),
        sourceId: 'src_1',
        title: 'Doc',
      } as PocketAIEvent,
      {
        type: 'tool_call_start',
        ...baseEnvelope({ messageId: 'msg_1' }),
        toolCallId: 'tool_1',
        name: 'search',
      } as PocketAIEvent,
      {
        type: 'tool_call_update',
        ...baseEnvelope({ messageId: 'msg_1' }),
        toolCallId: 'tool_1',
        status: 'running',
        progress: 0.25,
      } as PocketAIEvent,
      {
        type: 'tool_call_complete',
        ...baseEnvelope({ messageId: 'msg_1' }),
        toolCallId: 'tool_1',
        status: 'completed',
      } as PocketAIEvent,
      {
        type: 'text_delta',
        ...baseEnvelope({ messageId: 'msg_1' }),
        delta: 'Hello',
      } as PocketAIEvent,
      {
        type: 'attachment_start',
        ...baseEnvelope({ messageId: 'msg_1' }),
        attachmentId: 'att_1',
        name: 'a.pdf',
      } as PocketAIEvent,
      {
        type: 'attachment_progress',
        ...baseEnvelope({ messageId: 'msg_1' }),
        attachmentId: 'att_1',
        progress: 0.5,
        status: 'processing',
      } as PocketAIEvent,
      {
        type: 'attachment_complete',
        ...baseEnvelope({ messageId: 'msg_1' }),
        attachmentId: 'att_1',
        status: 'ready',
      } as PocketAIEvent,
      {
        type: 'message_complete',
        ...baseEnvelope({ messageId: 'msg_1' }),
        finishReason: 'stop',
      } as PocketAIEvent,
      {
        type: 'error',
        ...baseEnvelope(),
        code: 'FAILED',
        message: 'Something went wrong',
      } as PocketAIEvent,
    ];

    for (const event of events) {
      const json = serializePocketAIEvent(event);
      const parsed = parsePocketAIEventJson(json);
      expect(parsed.type).toBe(event.type);
    }
  });

  it('requires messageId on message-scoped events', () => {
    const result = safeParsePocketAIEvent({
      type: 'text_delta',
      ...baseEnvelope(),
      delta: 'x',
    });
    expect(result.success).toBe(false);
  });

  it('allows source without messageId', () => {
    const event = parsePocketAIEvent({
      type: 'source',
      ...baseEnvelope(),
      sourceId: 'src_1',
      title: 'Handbook',
    });
    expect(event.type).toBe('source');
    if (event.type === 'source') {
      expect(event.messageId).toBeUndefined();
      expect(event.sourceId).toBe('src_1');
    }
  });

  it('allows error without messageId', () => {
    const event = parsePocketAIEvent({
      type: 'error',
      ...baseEnvelope(),
      code: 'RATE_LIMIT',
      message: 'Too many requests',
      retryable: true,
    });
    expect(event.type).toBe('error');
    if (event.type === 'error') {
      expect(event.messageId).toBeUndefined();
    }
  });

  it('rejects missing requestId', () => {
    const result = safeParsePocketAIEvent({
      type: 'message_start',
      eventId: 'evt_1',
      conversationId: 'conv_1',
      messageId: 'msg_1',
      timestamp: '2026-09-10T00:00:00.000Z',
      protocolVersion: PROTOCOL_VERSION,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown event types', () => {
    const result = safeParsePocketAIEvent({
      type: 'langgraph_node',
      ...baseEnvelope({ messageId: 'msg_1' }),
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown protocol versions', () => {
    const result = safeParsePocketAIEvent({
      type: 'message_start',
      ...baseEnvelope({ messageId: 'msg_1', protocolVersion: 'v2' }),
    });
    expect(result.success).toBe(false);
  });

  it('parses fixture sequences with shared requestId', () => {
    const fixtures = [
      'simple-response.json',
      'rag-response.json',
      'agent-response.json',
      'error.json',
    ] as const;

    for (const name of fixtures) {
      const events = loadFixture(name);
      expect(events.length).toBeGreaterThan(0);
      const parsed = events.map((e) => parsePocketAIEvent(e));
      const requestIds = new Set(parsed.map((e) => e.requestId));
      expect(requestIds.size).toBe(1);
    }
  });

  it('links citation sourceId to a source in the RAG fixture', () => {
    const events = loadFixture('rag-response.json').map((e) => parsePocketAIEvent(e));
    const source = events.find((e) => e.type === 'source');
    const citation = events.find((e) => e.type === 'citation');
    expect(source?.type).toBe('source');
    expect(citation?.type).toBe('citation');
    if (source?.type === 'source' && citation?.type === 'citation') {
      expect(citation.sourceId).toBe(source.sourceId);
      expect(source.messageId).toBeUndefined();
      expect(citation.messageId).toBeTruthy();
    }
  });

  it('treats thinking events as user-visible activity fields', () => {
    const event = parsePocketAIEvent({
      type: 'thinking_start',
      ...baseEnvelope({ messageId: 'msg_1' }),
      activityId: 'act_1',
      activityType: 'searching_knowledge',
      text: 'Searching knowledge',
    });
    if (event.type === 'thinking_start') {
      expect(event.activityId).toBe('act_1');
      expect(event.activityType).toBe('searching_knowledge');
      expect(event.text).toBe('Searching knowledge');
    } else {
      expect.fail('expected thinking_start');
    }
  });

  it('throws ProtocolError from parsePocketAIEvent on malformed input', () => {
    expect(() => parsePocketAIEvent({ type: 'nope' })).toThrowError(/Invalid PocketAI event/);
  });
});
