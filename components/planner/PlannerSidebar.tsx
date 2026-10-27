import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/Button";
import {
  plannerNavItemClassName,
  plannerSectionLabelClassName,
} from "@/lib/plannerFieldStyles";
import type { PlannerConversation } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Plus } from "lucide-react";

type PlannerSidebarProps = {
  conversations: PlannerConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewTrip: () => void;
  className?: string;
};

function SideNavItem({
  icon,
  label,
  active = false,
  disabled = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        plannerNavItemClassName,
        active &&
          "bg-surface-planner-elevated text-primary",
        !active && !disabled && "text-muted-foreground hover:bg-surface-planner-panel hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
    >
      <Image src={icon} alt="" width={18} height={18} aria-hidden />
      {label}
    </span>
  );
}

export function PlannerSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewTrip,
  className,
}: PlannerSidebarProps) {
  const recent = [...conversations]
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col gap-5 border-r border-border bg-surface-planner-sidebar p-4 md:gap-6 md:p-5",
        className,
      )}
    >
      <Logo className="shrink-0 text-xl md:hidden" />

      <Button
        variant="primary"
        fullWidth
        onClick={onNewTrip}
        type="button"
        className="h-11 rounded-planner-md py-0 shadow-[0_0_20px_rgb(199_243_107_/_0.2)]"
      >
        <Plus  width={16} height={16} aria-hidden />
        Start New
      </Button>

      <div>
        <p className={cn(plannerSectionLabelClassName, "mb-2 px-2")}>
          Workspace
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Planner navigation">
          <SideNavItem
            icon="/icons/sparkles.svg"
            label="Trip Planner"
            active
          />
          <SideNavItem
            icon="/icons/bookmark.svg"
            label="Saved itineraries"
            disabled
          />
          <SideNavItem icon="/icons/settings.svg" label="Settings" disabled />
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p className={cn(plannerSectionLabelClassName, "px-2")}>Recent chats</p>
        <ul className="flex flex-col gap-0.5 overflow-y-auto">
          {recent.length === 0 ? (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              No conversations yet. Start with a new trip.
            </li>
          ) : (
            recent.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    plannerNavItemClassName,
                    "w-full text-left",
                    conversation.id === activeConversationId
                      ? "bg-surface-planner-elevated text-primary"
                      : "text-muted-foreground hover:bg-surface-planner-panel hover:text-foreground",
                  )}
                >
                  <span className="line-clamp-2">{conversation.title}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="mt-auto px-2 text-[11px] leading-relaxed text-muted-foreground">
          Chats are stored in this browser session only.
        </p>
      </div>

      <div className="flex items-center gap-2.5 border-t border-border pt-3">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-extrabold text-primary-foreground"
          aria-hidden
        >
          T
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            Traveler
          </p>
          <p className="text-xs text-muted-foreground">Preview account</p>
        </div>
      </div>
    </aside>
  );
}
