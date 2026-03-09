"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Project } from "@/lib/types"
import { db } from "@/lib/db"

export default function ProjectWorkspace() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      const loadedProject = await db.getProject(projectId)
      if (loadedProject) {
        setProject(loadedProject)
      } else {
        // Project not found, back to dashboard
        router.push('/')
      }
      setIsLoading(false)
    }

    loadProject()
  }, [projectId, router])

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-bg-primary">Loading Workspace...</div>
  }

  return (
    <div className="h-screen w-full bg-bg-primary flex flex-col overflow-hidden">
      {/* Top Bar placeholder */}
      <div className="h-14 border-b border-glass-border bg-glass-bg flex items-center px-4 shrink-0">
         <button onClick={() => router.push('/')} className="mr-4 text-text-secondary hover:text-text-primary">
            &larr; Back
         </button>
         <h1 className="font-bold">{project?.name}</h1>
      </div>

      {/* Canvas Area Placeholder */}
      <div className="flex-1 flex items-center justify-center bg-bg-primary" style={{ backgroundImage: "radial-gradient(var(--glass-border) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        <p className="text-text-secondary">Canvas workspace implementation pending for {project?.name}</p>
      </div>
    </div>
  )
}
