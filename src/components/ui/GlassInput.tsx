import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-glass-bg px-3 py-2 text-sm text-text-primary",
          "border-glass-border backdrop-blur-md shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-text-tertiary",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-blue/50 focus-visible:border-accent-blue",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-accent-red/50 focus-visible:ring-accent-red/50 focus-visible:border-accent-red",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassInput.displayName = "GlassInput"

export { GlassInput }
