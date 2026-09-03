import { describe, expect, it } from 'vitest';
import type {
  Attachment,
  Citation,
  Conversation,
  AIError,
  Message,
  Source,
  ToolCall,
} from '../../src/core/models.js';

describe('domain models', () => {
  it('supports a valid conversation', () => {
    const conversation: Conversation = {
      id: 'conv_1',
      title: 'Leave policy',
      createdAt: '2026-09-10T00:00:00.000Z',
      updatedAt: '2026-09-10T00:00:00.000Z',
    };
    expect(conversation.id).toBe('conv_1');
  });

  it('supports citations referencing a sourceId', () => {
    const citation: Citation = {
      id: 'cit_1',
      sourceId: 'src_1',
      marker: '[1]',
      text: '20 days',
    };
    expect(citation.sourceId).toBe('src_1');
  });

  it('supports sources independently of messages', () => {
    const source: Source = {
      id: 'src_1',
      title: 'Policy Handbook',
      documentType: 'pdf',
      origin: 'knowledge_base',
      excerpt: 'Employees may take up to 20 days...',
    };
    expect(source.title).toBe('Policy Handbook');
  });

  it('supports tool calls with status and result', () => {
    const toolCall: ToolCall = {
      id: 'tool_1',
      name: 'lookup_calendar',
      label: 'Checking calendar',
      status: 'completed',
      result: { availableSlots: 3 },
    };
    expect(toolCall.status).toBe('completed');
  });

  it('supports attachment lifecycle fields without implying upload implementation', () => {
    const attachment: Attachment = {
      id: 'att_1',
      name: 'report.pdf',
      status: 'processing',
      mimeType: 'application/pdf',
      progress: 0.4,
    };
    expect(attachment.status).toBe('processing');
  });

  it('supports AIError shapes', () => {
    const error: AIError = {
      code: 'UPSTREAM_TIMEOUT',
      message: 'Timed out',
      retryable: true,
      details: { timeoutMs: 30000 },
    };
    expect(error.retryable).toBe(true);
  });

  it('supports a streaming assistant message aggregate', () => {
    const message: Message = {
      id: 'msg_1',
      conversationId: 'conv_1',
      role: 'assistant',
      status: 'streaming',
      content: 'Hello',
      activities: [
        {
          activityId: 'act_1',
          activityType: 'searching_knowledge',
          text: 'Searching knowledge',
          status: 'complete',
        },
      ],
      citations: [{ id: 'cit_1', sourceId: 'src_1', marker: '[1]' }],
      sources: [{ id: 'src_1', title: 'Doc' }],
      toolCalls: [{ id: 'tool_1', name: 'search', status: 'completed' }],
      attachments: [{ id: 'att_1', name: 'a.pdf', status: 'ready' }],
      createdAt: '2026-09-10T00:00:00.000Z',
      updatedAt: '2026-09-10T00:00:01.000Z',
    };
    expect(message.status).toBe('streaming');
    expect(message.activities?.[0]?.activityType).toBe('searching_knowledge');
  });

  it('supports a failed message with error', () => {
    const message: Message = {
      id: 'msg_2',
      conversationId: 'conv_1',
      role: 'assistant',
      status: 'failed',
      content: '',
      error: { code: 'FAILED', message: 'Generation failed' },
      createdAt: '2026-09-10T00:00:00.000Z',
      updatedAt: '2026-09-10T00:00:01.000Z',
    };
    expect(message.status).toBe('failed');
    expect(message.error?.code).toBe('FAILED');
  });
});
