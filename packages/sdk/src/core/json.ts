/**
 * JSON-serializable value types used across protocol and domain models.
 * Avoids `any` while remaining transport-safe.
 */

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };
