import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

// Serves the raw OpenAPI document. Swagger UI (at /api-docs) fetches this.
export function GET() {
  return NextResponse.json(openApiSpec);
}
