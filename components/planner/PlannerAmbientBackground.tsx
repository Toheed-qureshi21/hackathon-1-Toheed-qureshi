export function PlannerAmbientBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -top-24 left-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-10 right-1/4 size-80 rounded-full bg-violet/10 blur-3xl" />
    </div>
  );
}
