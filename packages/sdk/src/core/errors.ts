export class ProtocolError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, options?: { code?: string; details?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'ProtocolError';
    this.code = options?.code ?? 'PROTOCOL_ERROR';
    this.details = options?.details;
    if (options?.cause !== undefined) {
      // Attach cause without relying on ES2022 ErrorOptions typing.
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}
