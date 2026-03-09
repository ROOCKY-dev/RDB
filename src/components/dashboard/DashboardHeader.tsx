"use client"

import { GlassButton } from "@/components/ui/GlassButton"
import { GlassInput } from "@/components/ui/GlassInput"
import { useTheme } from "next-themes"
import { Moon, Sun, Search } from "lucide-react"
import { useState, useEffect } from "react"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true)
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [])

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue flex items-center justify-center">
          <div className="w-4 h-4 bg-accent-blue rounded-sm" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SchemaVision</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <GlassInput placeholder="Search projects..." className="pl-9 bg-bg-secondary/50" />
        </div>
        {mounted && (
          <GlassButton
            variant="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </GlassButton>
        )}
      </div>
    </header>
  )
}
