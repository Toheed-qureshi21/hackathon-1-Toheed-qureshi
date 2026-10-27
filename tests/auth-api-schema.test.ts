import assert from "node:assert/strict";
import test from "node:test";
import { loginApiSchema, signupApiSchema } from "../schemas/authApiSchema.ts";

test("loginApiSchema rejects empty email", () => {
  const result = loginApiSchema.safeParse({
    email: "",
    password: "secret123",
  });
  assert.equal(result.success, false);
});

test("loginApiSchema accepts valid payload", () => {
  const result = loginApiSchema.safeParse({
    email: "user@example.com",
    password: "secret123",
    rememberMe: true,
  });
  assert.equal(result.success, true);
});

test("signupApiSchema rejects short password", () => {
  const result = signupApiSchema.safeParse({
    fullName: "Alex Traveler",
    email: "user@example.com",
    password: "short",
    acceptTerms: true,
  });
  assert.equal(result.success, false);
});

test("signupApiSchema rejects missing terms acceptance", () => {
  const result = signupApiSchema.safeParse({
    fullName: "Alex Traveler",
    email: "user@example.com",
    password: "secret123",
    acceptTerms: false,
  });
  assert.equal(result.success, false);
});
