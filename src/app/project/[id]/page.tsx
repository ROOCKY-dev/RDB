"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCanvasStore } from "@/stores/useCanvasStore"
import { Canvas } from "@/components/canvas/Canvas"
import { LeftPanel } from "@/components/panels/LeftPanel"
import { RightPanel } from "@/components/panels/RightPanel"
import { SqlModal } from "@/components/modals/SqlModal"
import { ExportModal } from "@/components/modals/ExportModal"
import { CommandPalette } from "@/components/command-palette/CommandPalette"
import { GlassButton } from "@/components/ui/GlassButton"
import { ArrowLeft, Code2, Download, Settings, Command } from "lucide-react"
import { ReactFlowProvider } from "@xyflow/react"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useUndoRedo } from "@/hooks/useUndoRedo"

export default function ProjectWorkspace() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { loadProject, project, isLoading, saveProject, nodes, edges } = useCanvasStore()
  const { undo, redo, takeSnapshot } = useUndoRedo()

  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState("")
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Initial load
  useEffect(() => {
    if (projectId) {
      loadProject(projectId).then(() => {
         const proj = useCanvasStore.getState().project;
         if(proj) {
           setEditName(proj.name);
           takeSnapshot(); // take initial snapshot
         }
      });
    }
  }, [projectId, loadProject, takeSnapshot]);

  // Track changes for history (simplified approach)
  useEffect(() => {
    if (!isLoading && project) {
      const timer = setTimeout(() => {
        takeSnapshot();
      }, 300); // debounce snapshot
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, isLoading, project, takeSnapshot]);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      combo: { key: 'k', metaKey: true },
      handler: () => setIsCommandPaletteOpen(prev => !prev)
    },
    {
      combo: { key: 'z', metaKey: true },
      handler: undo
    },
    {
      combo: { key: 'z', metaKey: true, shiftKey: true },
      handler: redo
    },
    {
      combo: { key: 's', metaKey: true },
      handler: () => { saveProject() }
    }
  ]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-text-secondary">Loading Workspace...</div>
  }

  if (!project) {
    return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-accent-red">Project not found</div>
  }

  const handleRename = () => {
    setIsRenaming(false);
    // Project rename logic would go here
  }

  return (
    <div className="h-screen w-full bg-bg-primary flex flex-col overflow-hidden relative">
      <header className="h-14 border-b border-glass-border bg-glass-bg flex items-center justify-between px-4 shrink-0 relative z-50 backdrop-blur-xl">
         <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-text-secondary hover:text-text-primary transition-colors flex items-center space-x-2"
            >
               <ArrowLeft className="w-4 h-4" />
               <span className="text-sm font-medium">Dashboard</span>
            </button>

            <div className="w-[1px] h-4 bg-glass-border" />

            <div className="flex items-center">
              {isRenaming ? (
                <input
                  autoFocus
                  className="bg-transparent border-b border-accent-blue px-1 outline-none font-bold text-text-primary"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
              ) : (
                <h1
                  className="font-bold cursor-pointer hover:bg-glass-hover px-2 py-1 rounded"
                  onClick={() => setIsRenaming(true)}
                >
                  {project.name}
                </h1>
              )}
            </div>
         </div>

         <div className="flex items-center space-x-2">
            <GlassButton
              variant="secondary"
              size="sm"
              className="space-x-2 hidden sm:flex"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Command className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs text-text-secondary">K</span>
            </GlassButton>

            <div className="w-[1px] h-4 bg-glass-border mx-2 hidden sm:block" />

            <GlassButton
              variant="primary"
              size="sm"
              className="space-x-1.5 shadow-none"
              onClick={() => setIsSqlModalOpen(true)}
            >
              <Code2 className="w-4 h-4" />
              <span>SQL</span>
            </GlassButton>

            <GlassButton
              variant="icon"
              size="sm"
              className="text-text-secondary"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="w-4 h-4" />
            </GlassButton>

            <GlassButton variant="icon" size="sm" className="text-text-secondary">
              <Settings className="w-4 h-4" />
            </GlassButton>
         </div>
      </header>

      <main className="flex-1 w-full h-full relative">
        <ReactFlowProvider>
          <Canvas />
          <LeftPanel />
          <RightPanel />
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        </ReactFlowProvider>
      </main>

      <SqlModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  )
}
