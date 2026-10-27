"use client";

import { AuthIconInput } from "@/components/auth/AuthIconInput";
import { ConfirmPasswordMatchIndicator } from "@/components/auth/ConfirmPasswordMatchIndicator";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { FormField, formFieldDescribedBy } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { Pill } from "@/components/ui/Pill";
import {
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
  authHeadingClassName,
} from "@/lib/authFieldStyles";
import { postAuthJson } from "@/lib/auth/client-api";
import {
  fieldErrorsFromZod,
  signupSchema,
  type SignupFormValues,
} from "@/schemas/authSchema";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formMessageVariant, setFormMessageVariant] = useState<"error" | "info">(
    "error",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    try {
      const { data } = await postAuthJson("/api/auth/signup", {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        acceptTerms: parsed.data.acceptTerms,
      });

      if (!data.ok) {
        setFormMessageVariant("error");
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setFormMessage(data.error);
        return;
      }

      if (data.status === "verification_pending") {
        setFormMessageVariant("info");
        setFormMessage(
          data.message ??
            "Check your email to confirm your account before signing in.",
        );
        return;
      }

      if (data.redirectTo) {
        router.push(data.redirectTo);
        router.refresh();
        return;
      }

      router.push("/planner");
      router.refresh();
    } catch {
      setFormMessageVariant("error");
      setFormMessage("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleUnavailableAction(message: string) {
    setFieldErrors({});
    setFormMessageVariant("info");
    setFormMessage(message);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Pill>REWARDS, REIMAGINED</Pill>
      </div>
      <h1 className={authHeadingClassName}>Start traveling smarter</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your account and make every point count.
      </p>

      {formMessage ? (
        <FormMessage variant={formMessageVariant} className="mt-4">
          {formMessage}
        </FormMessage>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <FormField
          id="signup-full-name"
          label="Full name"
          error={fieldErrors.fullName}
          auth
        >
          <AuthIconInput
            id="signup-full-name"
            name="fullName"
            iconSrc="/icons/users.svg"
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
          auth
        >
          <AuthIconInput
            id="signup-email"
            name="email"
            type="email"
            iconSrc="/icons/message-circle.svg"
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
          auth
        >
          <PasswordInput
            id="signup-password"
            name="password"
            placeholder="Enter password"
            autoComplete="new-password"
            hasError={Boolean(fieldErrors.password)}
            disabled={isLoading}
            auth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={formFieldDescribedBy(
              fieldErrors.password,
              "signup-password",
            )}
          />
          <PasswordStrengthIndicator password={password} />
        </FormField>

        <FormField
          id="signup-confirm-password"
          label="Confirm password"
          error={fieldErrors.confirmPassword}
          auth
        >
          <>
            <PasswordInput
              id="signup-confirm-password"
              name="confirmPassword"
              placeholder="Confirm password"
              autoComplete="new-password"
              hasError={Boolean(fieldErrors.confirmPassword)}
              disabled={isLoading}
              auth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-describedby={formFieldDescribedBy(
                fieldErrors.confirmPassword,
                "signup-confirm-password",
              )}
            />
            <ConfirmPasswordMatchIndicator
              password={password}
              confirmPassword={confirmPassword}
            />
          </>
        </FormField>

        <Checkbox
          id="accept-terms"
          name="acceptTerms"
          label={
            <>
              I agree to the{" "}
              <Link href="#" className="text-ai-blue hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-ai-blue hover:underline">
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
          className={`mt-5 ${authPrimaryButtonClassName}`}
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
        className={`gap-3 ${authSecondaryButtonClassName}`}
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
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
