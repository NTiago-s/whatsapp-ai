import {
  logEvolutionWebhookError,
  logEvolutionWebhookEvent,
} from "@/lib/evolution/log-event";
import { isJsonValue } from "@/lib/evolution/types";

const INVALID_JSON_RESPONSE = {
  received: false,
  error: "Invalid JSON body",
} as const;

const RECEIVED_RESPONSE = { received: true } as const;

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    logEvolutionWebhookError("Invalid JSON body", error);

    return Response.json(INVALID_JSON_RESPONSE, { status: 400 });
  }

  if (!isJsonValue(payload)) {
    logEvolutionWebhookError("Unsupported JSON value");

    return Response.json(INVALID_JSON_RESPONSE, { status: 400 });
  }

  logEvolutionWebhookEvent(payload);

  return Response.json(RECEIVED_RESPONSE, { status: 200 });
}
