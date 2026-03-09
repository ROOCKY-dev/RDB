"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon"
  size?: "sm" | "md" | "lg" | "icon"
}

const variantStyles = {
  primary: "bg-accent-blue text-white border-transparent hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20",
  secondary: "glass-panel glass-panel-hover",
  danger: "bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20",
  ghost: "bg-transparent border-transparent hover:glass-panel text-text-secondary hover:text-text-primary",
  icon: "glass-panel glass-panel-hover text-text-secondary hover:text-text-primary p-2",
}

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
  icon: "p-2 rounded-lg",
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:pointer-events-none",
          variant !== "icon" && sizeStyles[size],
          variant === "icon" && sizeStyles.icon,
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
