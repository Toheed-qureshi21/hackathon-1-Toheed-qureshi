"use client";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { FormField, formFieldDescribedBy } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import {
  fieldErrorsFromZod,
  signupSchema,
  type SignupFormValues,
} from "@/schemas/authSchema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formMessageVariant, setFormMessageVariant] = useState<"error" | "info">(
    "error",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const values: SignupFormValues = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      acceptTerms,
    };

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setFormMessageVariant("info");
    setFormMessage(
      "Account creation is not connected yet. Your entries passed validation — registration will be enabled in a later phase.",
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
        Start traveling smarter
      </h1>
      <p className="text-muted-foreground">
        Create your account and make every point count.
      </p>

      {formMessage ? (
        <FormMessage variant={formMessageVariant} className="mt-4">
          {formMessage}
        </FormMessage>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-2">
        <FormField
          id="signup-full-name"
          label="Full name"
          error={fieldErrors.fullName}
        >
          <Input
            id="signup-full-name"
            name="fullName"
            placeholder="Your name"
            autoComplete="name"
            hasError={Boolean(fieldErrors.fullName)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.fullName,
              "signup-full-name",
            )}
          />
        </FormField>

        <FormField
          id="signup-email"
          label="Email address"
          error={fieldErrors.email}
        >
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            hasError={Boolean(fieldErrors.email)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.email,
              "signup-email",
            )}
          />
        </FormField>

        <FormField
          id="signup-password"
          label="Password"
          error={fieldErrors.password}
        >
          <PasswordInput
            id="signup-password"
            name="password"
            placeholder="Enter password"
            autoComplete="new-password"
            hasError={Boolean(fieldErrors.password)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.password,
              "signup-password",
            )}
          />
        </FormField>

        <FormField
          id="signup-confirm-password"
          label="Confirm password"
          error={fieldErrors.confirmPassword}
        >
          <PasswordInput
            id="signup-confirm-password"
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            hasError={Boolean(fieldErrors.confirmPassword)}
            disabled={isLoading}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.confirmPassword,
              "signup-confirm-password",
            )}
          />
        </FormField>

        <Checkbox
          id="accept-terms"
          name="acceptTerms"
          label={
            <>
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </>
          }
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          disabled={isLoading}
          error={fieldErrors.acceptTerms}
          className="py-2"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className="mt-5"
          isLoading={isLoading}
        >
          Create account →
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
            "Google sign-up is not connected yet. It will be available when authentication is enabled.",
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
