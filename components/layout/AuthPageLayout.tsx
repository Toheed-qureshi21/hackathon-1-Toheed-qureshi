import { AuthFormPanel } from "@/components/layout/AuthFormPanel";
import { Container } from "@/components/layout/Container";
import type { ReactNode } from "react";

type AuthPageLayoutProps = {
  form: ReactNode;
  visual: ReactNode;
};

export function AuthPageLayout({ form, visual }: AuthPageLayoutProps) {
  return (
    <main className="py-8 md:py-10">
      <Container className="max-w-7xl">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          <section className="lg:col-span-5 xl:col-span-5">
            <AuthFormPanel>{form}</AuthFormPanel>
          </section>
          <aside className="lg:col-span-7 xl:col-span-7">{visual}</aside>
        </div>
      </Container>
    </main>
  );
}
