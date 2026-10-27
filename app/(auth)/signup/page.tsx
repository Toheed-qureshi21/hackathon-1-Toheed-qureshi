import { SignupForm } from "@/components/auth/SignupForm";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import { SignupIllustration } from "@/components/marketing/SignupIllustration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your RedeemTrip account and travel smarter.",
};

export default function SignupPage() {
  return (
    <AuthPageLayout form={<SignupForm />} visual={<SignupIllustration />} />
  );
}
