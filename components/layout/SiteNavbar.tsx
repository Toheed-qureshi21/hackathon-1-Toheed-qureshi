"use client";

import { Logo } from "@/components/branding/Logo";
import { Container } from "@/components/layout/Container";
import { useAuthSession } from "@/hooks/useAuthSession";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { postAuthJson } from "@/lib/auth/client-api";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

type SiteNavbarProps = {
  className?: string;
  containerClassName?: string;
  leftAddon?: ReactNode;
  showPreviewBadge?: boolean;
  /** When true, omit the site mobile menu (e.g. planner uses its own sidebar control). */
  hideMobileMenu?: boolean;
};

type NavLinkItem = { href: string; label: string };

function navLinkClassName(isActive: boolean) {
  return cn(
    "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
    isActive
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
  );
}

export function SiteNavbar({
  className,
  containerClassName,
  leftAddon,
  showPreviewBadge = false,
  hideMobileMenu = false,
}: SiteNavbarProps) {
  const { status } = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const { data } = await postAuthJson("/api/auth/logout", {});
      closeMobile();
      router.push(data.ok && data.redirectTo ? data.redirectTo : "/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }, [closeMobile, isSigningOut, router]);

  const isAuthenticated = status === "authenticated";
  const authReady = status !== "loading";

  const centerLinks: NavLinkItem[] = isAuthenticated
    ? [
        { href: "/", label: "Home" },
        { href: "/planner", label: "Planner" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Sign up" },
      ];

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobile();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/90 shadow-planner-topbar backdrop-blur-xl",
        className,
      )}
    >
      <Container
        className={cn(
          "flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8",
          containerClassName,
        )}
      >
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 justify-self-start">
            {leftAddon}
            <Logo className="shrink-0 text-lg sm:text-xl" />
          </div>

          <nav
            className="hidden justify-self-center md:flex md:items-center md:gap-1"
            aria-label="Primary"
          >
            {authReady
              ? centerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClassName(pathname === link.href)}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))
              : (
                <span className="px-3 py-2 text-sm text-muted-foreground" aria-hidden>
                  …
                </span>
              )}
          </nav>

          <div className="flex items-center justify-end gap-2 justify-self-end sm:gap-3">
            {showPreviewBadge ? (
              <span
                className="hidden rounded-planner-sm border border-border bg-surface-planner-elevated px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground sm:inline"
                title="Flight search and AI are not connected in this build"
              >
                Preview
              </span>
            ) : null}

            <div className="hidden items-center gap-2 md:flex">
              {!authReady ? (
                <span
                  className="h-10 w-24 animate-pulse rounded-button bg-secondary/50"
                  aria-label="Loading account"
                />
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/planner"
                    className="inline-flex h-10 items-center justify-center rounded-button border border-border bg-secondary px-[18px] text-sm font-semibold text-secondary-foreground transition-[filter,background-color] hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    Open planner
                  </Link>
                  <button
                    type="button"
                    disabled={isSigningOut}
                    onClick={() => void handleSignOut()}
                    className="inline-flex h-10 items-center justify-center rounded-button px-[18px] text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50"
                  >
                    {isSigningOut ? "Signing out…" : "Sign out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-button px-[18px] text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-button border border-primary bg-primary px-[18px] text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {hideMobileMenu && authReady && !isAuthenticated ? (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground md:hidden"
              >
                Sign in
              </Link>
            ) : null}

            {!hideMobileMenu ? (
              <button
                type="button"
                className="rounded-md border border-border bg-secondary p-2.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 md:hidden"
                aria-expanded={mobileOpen}
                aria-controls={menuId}
                onClick={() => setMobileOpen((open) => !open)}
              >
                <Image src="/icons/menu.svg" alt="" width={20} height={20} aria-hidden />
                <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              </button>
            ) : null}
          </div>
        </div>
      </Container>

      {!hideMobileMenu && mobileOpen ? (
        <div
          id={menuId}
          className="border-t border-border bg-background md:hidden"
        >
          <Container className="max-w-7xl px-4 py-3 sm:px-6">
            <nav className="flex flex-col gap-1" aria-label="Primary mobile">
              {authReady
                ? centerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={navLinkClassName(pathname === link.href)}
                      onClick={closeMobile}
                    >
                      {link.label}
                    </Link>
                  ))
                : null}
            </nav>
            {authReady && !isAuthenticated ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="inline-flex h-11 w-full items-center justify-center rounded-button border border-border bg-secondary text-sm font-semibold text-secondary-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobile}
                  className="inline-flex h-11 w-full items-center justify-center rounded-button border border-primary bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Sign up
                </Link>
              </div>
            ) : null}
            {authReady && isAuthenticated ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Link
                  href="/planner"
                  onClick={closeMobile}
                  className="inline-flex h-11 w-full items-center justify-center rounded-button border border-primary bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Open planner
                </Link>
                <button
                  type="button"
                  disabled={isSigningOut}
                  onClick={() => void handleSignOut()}
                  className="inline-flex h-11 w-full items-center justify-center rounded-button border border-border bg-secondary text-sm font-semibold text-secondary-foreground disabled:opacity-50"
                >
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
