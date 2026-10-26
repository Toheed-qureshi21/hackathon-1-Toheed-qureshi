import { Container } from "@/components/layout/Container";
import type { ReactNode } from "react";

type AuthPageLayoutProps = {
  form: ReactNode;
  visual: ReactNode;
};

export function AuthPageLayout({ form, visual }: AuthPageLayoutProps) {
  return (
    <main>
      <Container className="grid min-h-[calc(100vh-77px)] grid-cols-1 items-center gap-10 py-14 max-[800px]:py-10 md:grid-cols-2 md:gap-[7%]">
        <section className="mx-auto w-full max-w-[450px]">{form}</section>
        <aside className="min-h-[360px] md:min-h-[540px]">{visual}</aside>
      </Container>
    </main>
  );
}
