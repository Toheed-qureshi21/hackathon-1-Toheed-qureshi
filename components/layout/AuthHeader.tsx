import { Logo } from "@/components/branding/Logo";
import { Container } from "@/components/layout/Container";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="border-b border-topbar-border">
      <Container className="flex h-[76px] items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Back to home
        </Link>
      </Container>
    </header>
  );
}
