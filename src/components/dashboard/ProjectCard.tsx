"use client"

import { useState } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { GlassButton } from "@/components/ui/GlassButton"
import { MoreVertical, Edit2, Copy, Trash2, Download } from "lucide-react"
import { Project } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useProjectStore } from "@/stores/useProjectStore"
import { useRouter } from "next/navigation"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const { deleteProject, duplicateProject, renameProject } = useProjectStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(project.name)

  const handleRename = async () => {
    if (newName.trim() && newName !== project.name) {
      await renameProject(project.id, newName.trim())
    }
    setIsRenaming(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(project.id)
    }
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await duplicateProject(project.id)
    setIsMenuOpen(false)
  }

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation()
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${project.name}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
    setIsMenuOpen(false)
  }

  return (
    <GlassPanel
      variant="card"
      className="h-[240px] flex flex-col group overflow-visible relative cursor-pointer"
      onClick={() => !isRenaming && router.push(`/project/${project.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

      <div className="flex-1 p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            {isRenaming ? (
              <input
                autoFocus
                className="w-full bg-glass-bg border border-accent-blue/50 rounded px-2 py-1 text-lg font-medium text-text-primary outline-none focus:ring-1 focus:ring-accent-blue"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") {
                    setNewName(project.name)
                    setIsRenaming(false)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-medium text-lg truncate">{project.name}</h3>
            )}
            <p className="text-sm text-text-secondary mt-1">
              {project.tables?.length || 0} tables • {project.relationships?.length || 0} relationships
            </p>
          </div>

          <div className="relative">
            <GlassButton
              variant="icon"
              size="sm"
              className={`opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 ${isMenuOpen ? 'opacity-100' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </GlassButton>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                  }}
                />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-bg-secondary border border-glass-border ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="group flex items-center px-4 py-2 text-sm text-text-primary hover:bg-glass-hover w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsRenaming(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Edit2 className="mr-3 h-4 w-4 text-text-secondary group-hover:text-text-primary" />
                      Rename
                    </button>
                    <button
                      className="group flex items-center px-4 py-2 text-sm text-text-primary hover:bg-glass-hover w-full text-left"
                      onClick={handleDuplicate}
                    >
                      <Copy className="mr-3 h-4 w-4 text-text-secondary group-hover:text-text-primary" />
                      Duplicate
                    </button>
                    <button
                      className="group flex items-center px-4 py-2 text-sm text-text-primary hover:bg-glass-hover w-full text-left"
                      onClick={handleExport}
                    >
                      <Download className="mr-3 h-4 w-4 text-text-secondary group-hover:text-text-primary" />
                      Export JSON
                    </button>
                    <button
                      className="group flex items-center px-4 py-2 text-sm text-accent-red hover:bg-accent-red/10 w-full text-left"
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-3 h-4 w-4 text-accent-red" />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mini Canvas Preview */}
        <div className="mt-6 h-24 rounded-lg bg-bg-secondary/50 border border-glass-border overflow-hidden relative flex items-center justify-center pointer-events-none">
           <div className="absolute w-full h-full opacity-50" style={{ backgroundImage: "radial-gradient(var(--glass-border) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

           {project.tables && project.tables.length > 0 ? (
             <div className="flex space-x-2 relative z-10 scale-75 origin-center">
                {project.tables.slice(0, 3).map((table, i) => (
                  <div
                    key={table.id}
                    className="rounded border backdrop-blur-sm"
                    style={{
                      width: '60px',
                      height: `${40 + Math.min(table.columns.length * 10, 60)}px`,
                      borderColor: `${table.color}40`,
                      backgroundColor: `${table.color}10`,
                      marginTop: i === 1 ? '20px' : '0'
                    }}
                  />
                ))}
             </div>
           ) : (
             <div className="text-xs text-text-tertiary relative z-10">Empty Canvas</div>
           )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-glass-border bg-glass-bg text-xs text-text-tertiary flex justify-between items-center relative z-10 pointer-events-none rounded-b-xl">
        <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
      </div>
    </GlassPanel>
  )
}
