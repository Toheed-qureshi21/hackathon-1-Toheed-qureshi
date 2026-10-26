import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import { AuthIllustration } from "@/components/marketing/AuthIllustration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to RedeemTrip and optimize your travel rewards.",
};

export default function LoginPage() {
  return (
    <AuthPageLayout form={<LoginForm />} visual={<AuthIllustration />} />
  );
}
