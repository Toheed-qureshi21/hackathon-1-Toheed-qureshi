import { fieldErrorsFromZod } from "@/schemas/authSchema";
import type { z } from "zod";
import { NextResponse } from "next/server";

export function jsonValidationError(error: z.ZodError) {
  return NextResponse.json(
    {
      ok: false as const,
      error: "Validation failed",
      fieldErrors: fieldErrorsFromZod(error),
    },
    { status: 400 },
  );
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false as const, error: message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json({ ok: true as const, ...body }, { status });
}
