"use client"

import { GlassButton } from "@/components/ui/GlassButton"
import { GlassInput } from "@/components/ui/GlassInput"
import { useTheme } from "next-themes"
import { Moon, Sun, Search, Upload } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { db } from "@/lib/db"
import { useProjectStore } from "@/stores/useProjectStore"
import { toast } from "sonner"
import { nanoid } from "nanoid"
import { Project } from "@/lib/types"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadProjects } = useProjectStore()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true)
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [])

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string
        const importedProject = JSON.parse(json) as Project

        if (!importedProject.tables || !importedProject.settings) {
          throw new Error("Invalid project structure")
        }

        // Give it a new ID to avoid collisions
        importedProject.id = nanoid()
        importedProject.name = `${importedProject.name} (Imported)`
        importedProject.updatedAt = new Date().toISOString()

        await db.saveProject(importedProject)
        await loadProjects()
        toast.success("Project imported successfully")
      } catch (err) {
        console.error(err)
        toast.error("Failed to import project. Invalid JSON format.")
      }
    }
    reader.readAsText(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />

        <GlassButton
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="space-x-2"
          title="Import JSON"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </GlassButton>

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
