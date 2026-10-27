import { Container } from "@/components/layout/Container";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="border-b border-topbar-border">
      <Container className="flex h-14 max-w-7xl items-center justify-between md:h-16">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Back to home
        </Link>
      </Container>
    </header>
  );
}
