import { SignupForm } from "@/components/auth/SignupForm";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import { AuthIllustration } from "@/components/marketing/AuthIllustration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your RedeemTrip account and travel smarter.",
};

export default function SignupPage() {
  return (
    <AuthPageLayout form={<SignupForm />} visual={<AuthIllustration />} />
  );
}
