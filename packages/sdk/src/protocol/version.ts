/**
 * PocketAI protocol version.
 * Unknown versions fail closed at parse until a future compatibility policy exists.
 * There is no version negotiation in Phase 1.
 */
export const PROTOCOL_VERSION = 'v1' as const;

export type ProtocolVersion = typeof PROTOCOL_VERSION;
