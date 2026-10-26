import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-[min(1160px,92%)]", className)}
      {...props}
    />
  );
}
