"use client"

import { useEffect } from "react"
import { useProjectStore } from "@/stores/useProjectStore"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { NewProjectCard } from "@/components/dashboard/NewProjectCard"
import { ProjectCard } from "@/components/dashboard/ProjectCard"

export default function Dashboard() {
  const { projects, isLoading, loadProjects } = useProjectStore()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <DashboardHeader />

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NewProjectCard />

            {isLoading ? (
              // Skeleton loaders
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[240px] rounded-xl bg-bg-secondary/20 animate-pulse border border-glass-border" />
              ))
            ) : (
              projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
