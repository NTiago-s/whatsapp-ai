import type { JsonObject, JsonValue } from "@/lib/evolution/types";

const LOG_PREFIX = "[evolution:webhook]";
const REDACTED_VALUE = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
  /^(?:api[-_]?key|authorization|password|secret|token)$/i;

function sanitizeJsonValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.entries(value).reduce<JsonObject>((sanitized, [key, item]) => {
    sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? REDACTED_VALUE
      : sanitizeJsonValue(item);

    return sanitized;
  }, {});
}

function getErrorDetails(error: unknown): Record<string, string> | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message,
  };
}

export function logEvolutionWebhookEvent(payload: JsonValue): void {
  console.info(`${LOG_PREFIX} Event received`, {
    receivedAt: new Date().toISOString(),
    payload: sanitizeJsonValue(payload),
  });
}

export function logEvolutionWebhookError(
  message: string,
  error?: unknown,
): void {
  console.error(`${LOG_PREFIX} ${message}`, {
    receivedAt: new Date().toISOString(),
    error: getErrorDetails(error),
  });
}
