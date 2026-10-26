export function DividerWithText({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-muted-foreground">
      <hr className="flex-1 border-border" />
      <span className="text-sm">{children}</span>
      <hr className="flex-1 border-border" />
    </div>
  );
}
