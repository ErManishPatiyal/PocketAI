import { z } from 'zod';
import { PROTOCOL_VERSION } from './version.js';

/**
 * Zod schemas implement the PocketAI JSON Protocol for TypeScript.
 * The language-independent contract lives in docs/protocol.md + examples.
 */

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonValueSchema: z.ZodType = z.lazy(() =>
  z.union([jsonPrimitiveSchema, z.array(jsonValueSchema), z.record(jsonValueSchema)]),
);

export const jsonObjectSchema = z.record(jsonValueSchema);

const nonEmptyString = z.string().min(1);

const envelopeBase = {
  eventId: nonEmptyString,
  conversationId: nonEmptyString,
  requestId: nonEmptyString,
  timestamp: nonEmptyString,
  protocolVersion: z.literal(PROTOCOL_VERSION),
  metadata: jsonObjectSchema.optional(),
};

const withRequiredMessageId = {
  ...envelopeBase,
  messageId: nonEmptyString,
};

const withOptionalMessageId = {
  ...envelopeBase,
  messageId: nonEmptyString.optional(),
};

export const messageStartEventSchema = z
  .object({
    type: z.literal('message_start'),
    ...withRequiredMessageId,
    role: z.enum(['assistant', 'system']).optional(),
  })
  .strict();

export const thinkingStartEventSchema = z
  .object({
    type: z.literal('thinking_start'),
    ...withRequiredMessageId,
    activityId: nonEmptyString,
    activityType: nonEmptyString,
    text: z.string().optional(),
  })
  .strict();

export const thinkingDeltaEventSchema = z
  .object({
    type: z.literal('thinking_delta'),
    ...withRequiredMessageId,
    activityId: nonEmptyString,
    activityType: nonEmptyString.optional(),
    text: z.string().optional(),
  })
  .strict();

export const thinkingCompleteEventSchema = z
  .object({
    type: z.literal('thinking_complete'),
    ...withRequiredMessageId,
    activityId: nonEmptyString,
    activityType: nonEmptyString.optional(),
    text: z.string().optional(),
  })
  .strict();

export const citationEventSchema = z
  .object({
    type: z.literal('citation'),
    ...withRequiredMessageId,
    citationId: nonEmptyString,
    sourceId: nonEmptyString,
    startOffset: z.number().int().nonnegative().optional(),
    endOffset: z.number().int().nonnegative().optional(),
    marker: z.string().optional(),
    text: z.string().optional(),
  })
  .strict();

/** sourceId identifies the source; messageId is optional. */
export const sourceEventSchema = z
  .object({
    type: z.literal('source'),
    ...withOptionalMessageId,
    sourceId: nonEmptyString,
    title: nonEmptyString,
    documentType: z.string().optional(),
    origin: z.string().optional(),
    url: z.string().optional(),
    excerpt: z.string().optional(),
  })
  .strict();

export const toolCallStartEventSchema = z
  .object({
    type: z.literal('tool_call_start'),
    ...withRequiredMessageId,
    toolCallId: nonEmptyString,
    name: nonEmptyString,
    label: z.string().optional(),
  })
  .strict();

export const toolCallUpdateEventSchema = z
  .object({
    type: z.literal('tool_call_update'),
    ...withRequiredMessageId,
    toolCallId: nonEmptyString,
    name: z.string().optional(),
    label: z.string().optional(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
    progress: z.number().min(0).max(1).optional(),
    message: z.string().optional(),
  })
  .strict();

export const toolCallCompleteEventSchema = z
  .object({
    type: z.literal('tool_call_complete'),
    ...withRequiredMessageId,
    toolCallId: nonEmptyString,
    name: z.string().optional(),
    label: z.string().optional(),
    status: z.enum(['completed', 'failed', 'cancelled']),
    message: z.string().optional(),
    result: jsonObjectSchema.optional(),
  })
  .strict();

export const textDeltaEventSchema = z
  .object({
    type: z.literal('text_delta'),
    ...withRequiredMessageId,
    delta: z.string(),
  })
  .strict();

export const attachmentStartEventSchema = z
  .object({
    type: z.literal('attachment_start'),
    ...withRequiredMessageId,
    attachmentId: nonEmptyString,
    name: nonEmptyString,
    mimeType: z.string().optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
  })
  .strict();

export const attachmentProgressEventSchema = z
  .object({
    type: z.literal('attachment_progress'),
    ...withRequiredMessageId,
    attachmentId: nonEmptyString,
    progress: z.number().min(0).max(1),
    status: z.enum(['pending', 'uploading', 'processing', 'ready', 'failed']).optional(),
    message: z.string().optional(),
  })
  .strict();

export const attachmentCompleteEventSchema = z
  .object({
    type: z.literal('attachment_complete'),
    ...withRequiredMessageId,
    attachmentId: nonEmptyString,
    name: z.string().optional(),
    status: z.enum(['ready', 'failed']),
    mimeType: z.string().optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
    url: z.string().optional(),
    message: z.string().optional(),
  })
  .strict();

export const messageCompleteEventSchema = z
  .object({
    type: z.literal('message_complete'),
    ...withRequiredMessageId,
    finishReason: z.enum(['stop', 'length', 'error', 'cancelled', 'other']).optional(),
  })
  .strict();

/** messageId is optional for error events. */
export const errorEventSchema = z
  .object({
    type: z.literal('error'),
    ...withOptionalMessageId,
    code: nonEmptyString,
    message: nonEmptyString,
    retryable: z.boolean().optional(),
    details: jsonObjectSchema.optional(),
  })
  .strict();

export const pocketAIEventSchema = z.discriminatedUnion('type', [
  messageStartEventSchema,
  thinkingStartEventSchema,
  thinkingDeltaEventSchema,
  thinkingCompleteEventSchema,
  citationEventSchema,
  sourceEventSchema,
  toolCallStartEventSchema,
  toolCallUpdateEventSchema,
  toolCallCompleteEventSchema,
  textDeltaEventSchema,
  attachmentStartEventSchema,
  attachmentProgressEventSchema,
  attachmentCompleteEventSchema,
  messageCompleteEventSchema,
  errorEventSchema,
]);
