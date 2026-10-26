"use client";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { FormField, formFieldDescribedBy } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import {
  fieldErrorsFromZod,
  loginSchema,
  type LoginFormValues,
} from "@/schemas/authSchema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function LoginForm() {
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formMessageVariant, setFormMessageVariant] = useState<"error" | "info">(
    "error",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const values: LoginFormValues = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe,
    };

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setFormMessageVariant("info");
    setFormMessage(
      "Sign-in is not connected yet. Your entries passed validation — authentication will be enabled in a later phase.",
    );
  }

  function handleUnavailableAction(message: string) {
    setFieldErrors({});
    setFormMessageVariant("info");
    setFormMessage(message);
  }

  return (
    <>
      <Pill>REWARDS, REIMAGINED</Pill>
      <h1 className="mt-5 font-heading text-[38px] tracking-tight text-foreground">
        Welcome back
      </h1>
      <p className="text-muted-foreground">
        Your next great redemption starts here.
      </p>

      {formMessage ? (
        <FormMessage variant={formMessageVariant} className="mt-4">
          {formMessage}
        </FormMessage>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-2">
        <FormField
          id="login-email"
          label="Email address"
          error={fieldErrors.email}
        >
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            hasError={Boolean(fieldErrors.email)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.email,
              "login-email",
            )}
          />
        </FormField>

        <FormField
          id="login-password"
          label="Password"
          error={fieldErrors.password}
        >
          <PasswordInput
            id="login-password"
            name="password"
            placeholder="Enter password"
            autoComplete="current-password"
            hasError={Boolean(fieldErrors.password)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.password,
              "login-password",
            )}
          />
        </FormField>

        <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
          <label
            htmlFor="remember-me"
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              className="size-4 shrink-0 rounded border-border accent-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            Remember me
          </label>
          <button
            type="button"
            className="shrink-0 text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
            onClick={() =>
              handleUnavailableAction(
                "Password recovery is not connected yet. It will be available when authentication is enabled.",
              )
            }
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className="mt-5"
          isLoading={isLoading}
        >
          Sign in →
        </Button>
      </form>

      <DividerWithText>or continue with</DividerWithText>

      <Button
        type="button"
        fullWidth
        disabled={isLoading}
        className="gap-3"
        onClick={() =>
          handleUnavailableAction(
            "Google sign-in is not connected yet. It will be available when authentication is enabled.",
          )
        }
      >
        <Image
          src="/icons/google-g.svg"
          alt=""
          width={18}
          height={18}
          aria-hidden
        />
        Continue with Google
      </Button>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Social sign-in is not available in this preview.
      </p>

      <p className="mt-[22px] text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
