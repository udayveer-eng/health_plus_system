import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Strictly meant for floating elements (dialogs, command palettes)
 * where the glassmorphism effect is desired.
 */
export function GlassPanel({ className, children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
