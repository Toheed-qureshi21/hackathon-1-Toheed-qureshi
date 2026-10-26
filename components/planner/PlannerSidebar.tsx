import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/Button";
import type { PlannerConversation } from "@/schemas/plannerChat";
import { cn } from "@/lib/utils";
import Image from "next/image";

type PlannerSidebarProps = {
  conversations: PlannerConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewTrip: () => void;
  className?: string;
};

function SideNavLink({
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
        "flex items-center gap-2.5 rounded-[11px] px-3.5 py-3 text-sm",
        active && "bg-primary/10 text-primary",
        !active && "text-muted-foreground",
        disabled && "cursor-not-allowed opacity-60",
      )}
      aria-current={active ? "page" : undefined}
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
        "flex h-full flex-col gap-6 border-r border-border bg-[#0c111d] p-4 md:p-6",
        className,
      )}
    >
      <Logo className="shrink-0" />

      <Button variant="primary" fullWidth onClick={onNewTrip} type="button">
        <Image src="/icons/plus.svg" alt="" width={16} height={16} aria-hidden />
        New trip
      </Button>

      <nav className="flex flex-col gap-1" aria-label="Planner navigation">
        <SideNavLink
          icon="/icons/sparkles.svg"
          label="Trip Planner"
          active
        />
        <SideNavLink
          icon="/icons/bookmark.svg"
          label="Saved itineraries"
          disabled
        />
        <SideNavLink icon="/icons/settings.svg" label="Settings" disabled />
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Recent chats
        </p>
        <ul className="flex flex-col gap-1 overflow-y-auto">
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
                    "w-full rounded-[11px] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
                    conversation.id === activeConversationId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  )}
                >
                  <span className="line-clamp-2">{conversation.title}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="mt-auto px-2 text-[11px] text-muted-foreground">
          Chats are stored in this browser session only.
        </p>
      </div>

      <div className="flex items-center gap-2.5 border-t border-border pt-3">
        <div
          className="grid size-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-extrabold text-primary-foreground"
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
