// One error format for the whole API: { error: { code, message } }
import { ZodError } from "zod";

/** Throw this inside a route to return a clean error response. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export function errorResponse(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

/** Turns any thrown error into a JSON response. Use it in every route's catch. */
export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.status, err.code, err.message);
  }
  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return errorResponse(400, "VALIDATION_ERROR", message);
  }
  // Log only the message (never the whole error object, to avoid leaking details).
  console.error("Unexpected API error:", err instanceof Error ? err.message : "unknown");
  return errorResponse(500, "INTERNAL_ERROR", "Something went wrong");
}

/** Reads the JSON body and validates it with a Zod schema. */
export async function parseBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }
  return schema.parse(json);
}
