import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Every endpoint answers with the same envelope so the client never has to
// guess where the payload or the error message lives.
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, message, details },
    { status }
  );
}

// Thrown by services when something goes wrong in a way we want to surface to
// the caller with a specific status code.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Wraps a route handler so services can just `throw` and we translate the
// error into the right HTTP status in one place.
export function handle(
  fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.message, err.status);
      }
      if (err instanceof ZodError) {
        const first = err.errors[0];
        return fail(first?.message ?? "Invalid request", 422, err.flatten());
      }
      console.error("Unhandled API error:", err);
      return fail("Something went wrong on our end.", 500);
    }
  };
}
