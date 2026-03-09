import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "panel" | "card" | "button" | "input" | "modal"
}

const variantStyles = {
  panel: "rounded-2xl",
  card: "rounded-xl",
  button: "rounded-lg",
  input: "rounded-lg",
  modal: "rounded-2xl",
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "panel", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel text-text-primary",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassPanel.displayName = "GlassPanel"

export { GlassPanel }
