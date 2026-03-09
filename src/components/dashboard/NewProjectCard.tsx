"use client"

import { Plus } from "lucide-react"
import { useProjectStore } from "@/stores/useProjectStore"
import { useRouter } from "next/navigation"

export function NewProjectCard() {
  const router = useRouter()
  const { createProject } = useProjectStore()

  const handleCreate = async () => {
    try {
      const id = await createProject("Untitled Project")
      router.push(`/project/${id}`)
    } catch (error) {
      console.error("Failed to create project", error)
      // We would use toast here in a real app, but omitting for brevity if sonner isn't fully setup yet
    }
  }

  return (
    <button
      onClick={handleCreate}
      className="h-[240px] rounded-xl border-2 border-dashed border-glass-border hover:border-accent-blue/50 hover:bg-glass-hover transition-all flex flex-col items-center justify-center space-y-4 group cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Plus className="w-6 h-6 text-accent-blue" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-text-primary">New Project</h3>
        <p className="text-sm text-text-secondary mt-1">Start from scratch</p>
      </div>
    </button>
  )
}
