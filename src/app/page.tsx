"use client"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassInput } from "@/components/ui/GlassInput"
import { useTheme } from "next-themes"
import { Moon, Sun, Plus, MoreVertical, Search } from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true)
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue flex items-center justify-center">
              <div className="w-4 h-4 bg-accent-blue rounded-sm" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SchemaVision</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
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

        {/* Main Content */}
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Card */}
            <button className="h-[240px] rounded-xl border-2 border-dashed border-glass-border hover:border-accent-blue/50 hover:bg-glass-hover transition-all flex flex-col items-center justify-center space-y-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-text-primary">New Project</h3>
                <p className="text-sm text-text-secondary mt-1">Start from scratch</p>
              </div>
            </button>

            {/* Example Project Card */}
            <GlassPanel variant="card" className="h-[240px] flex flex-col group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex-1 p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg truncate pr-4">E-Commerce DB</h3>
                    <p className="text-sm text-text-secondary mt-1">12 tables • 4 relationships</p>
                  </div>
                  <GlassButton variant="icon" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                    <MoreVertical className="w-4 h-4" />
                  </GlassButton>
                </div>

                {/* Mini Canvas Preview (Mock) */}
                <div className="mt-6 h-24 rounded-lg bg-bg-secondary/50 border border-glass-border overflow-hidden relative flex items-center justify-center">
                   <div className="absolute w-full h-full" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
                   <div className="flex space-x-2 relative z-10">
                      <div className="w-16 h-10 rounded border border-accent-blue/30 bg-accent-blue/10 backdrop-blur-sm" />
                      <div className="w-12 h-14 rounded border border-accent-purple/30 bg-accent-purple/10 backdrop-blur-sm mt-4" />
                   </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-glass-border bg-glass-bg text-xs text-text-tertiary flex justify-between items-center relative z-10">
                <span>Updated 2 hours ago</span>
              </div>
            </GlassPanel>
          </div>
        </main>
      </div>
    </div>
  )
}
