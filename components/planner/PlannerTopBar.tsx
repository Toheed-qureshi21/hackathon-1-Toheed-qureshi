import { SiteNavbar } from "@/components/layout/SiteNavbar";
import Image from "next/image";

type PlannerTopBarProps = {
  className?: string;
  onOpenMobileNav?: () => void;
  mobileNavOpen?: boolean;
};

export function PlannerTopBar({
  className,
  onOpenMobileNav,
  mobileNavOpen = false,
}: PlannerTopBarProps) {
  return (
    <SiteNavbar
      className={className}
      containerClassName="md:pl-[calc(16rem+1rem)]"
      showPreviewBadge
      hideMobileMenu
      leftAddon={
        onOpenMobileNav ? (
          <button
            type="button"
            className="rounded-planner-md border border-border bg-surface-planner-elevated p-2.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring-planner/30 md:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="planner-mobile-nav"
            onClick={onOpenMobileNav}
          >
            <Image src="/icons/menu.svg" alt="" width={20} height={20} aria-hidden />
            <span className="sr-only">Open planner menu</span>
          </button>
        ) : undefined
      }
    />
  );
}
