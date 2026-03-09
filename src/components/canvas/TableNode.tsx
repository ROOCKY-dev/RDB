import { memo, useState } from "react"
import { Table } from "@/lib/types"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { GlassButton } from "@/components/ui/GlassButton"
import { ColumnRow } from "./ColumnRow"
import { useCanvasStore } from "@/stores/useCanvasStore"
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Copy, Trash2, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableNodeProps {
  data: Table
  selected: boolean
}

export const TableNode = memo(({ data, selected }: TableNodeProps) => {
  const {
    setSelectedTable,
    updateTable,
    deleteTable,
    duplicateTable,
    addColumn
  } = useCanvasStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(data.name)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleNameSave = () => {
    if (editName.trim() && editName !== data.name) {
      updateTable(data.id, { name: editName.trim().replace(/\s+/g, '_') })
    } else {
      setEditName(data.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameSave()
    if (e.key === "Escape") {
      setEditName(data.name)
      setIsEditing(false)
    }
  }

  return (
    <GlassPanel
      variant="panel"
      className={cn(
        "min-w-[220px] max-w-[500px] bg-bg-secondary/80 backdrop-blur-md overflow-visible relative group !rounded-xl transition-shadow",
        selected && "ring-2 ring-accent-blue/50 shadow-xl shadow-accent-blue/10"
      )}
      onClick={() => setSelectedTable(data.id)}
    >
      {/* Top Accent Bar */}
      <div
        className="h-[3px] w-full rounded-t-xl absolute top-0 left-0 right-0 z-10"
        style={{ backgroundColor: data.color }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing select-none border-b border-glass-border pt-4"
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              updateTable(data.id, { collapsed: !data.collapsed })
            }}
            className="text-text-tertiary hover:text-text-primary p-0.5 rounded transition-colors shrink-0"
          >
            {data.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex-1 font-bold truncate tracking-tight flex items-center">
            {isEditing ? (
              <input
                autoFocus
                className="w-full bg-glass-bg border border-accent-blue/50 rounded px-1 outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
              />
            ) : (
              data.name
            )}
          </div>

          <div className="shrink-0 px-2 py-0.5 bg-glass-bg border border-glass-border rounded-full text-xs font-mono text-text-secondary">
            {data.columns.length}
          </div>
        </div>

        {/* Context Menu Trigger */}
        <div className="relative shrink-0">
          <GlassButton
            variant="icon"
            size="sm"
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity -mr-1 h-6 w-6 !p-0.5",
              isMenuOpen && "opacity-100 bg-glass-hover"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </GlassButton>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(false)
                }}
                onMouseDown={e => e.stopPropagation()}
              />
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-md shadow-lg bg-bg-secondary border border-glass-border ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                onMouseDown={e => e.stopPropagation()}
              >
                <div className="py-1">
                  <button
                    className="group flex items-center px-3 py-1.5 text-sm text-text-primary hover:bg-glass-hover w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateTable(data.id)
                      setIsMenuOpen(false)
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4 text-text-secondary group-hover:text-text-primary" />
                    Duplicate
                  </button>
                  <div className="px-3 py-1.5 text-sm text-text-secondary flex items-center border-t border-glass-border mt-1">
                    <Palette className="mr-2 h-4 w-4" /> Color
                  </div>
                  <div className="px-3 pb-2 flex gap-1 flex-wrap">
                    {['#007AFF', '#AF52DE', '#34C759', '#FF3B30', '#FF9500', '#FFCC00'].map(c => (
                      <button
                        key={c}
                        className="w-4 h-4 rounded-full border border-glass-border/50 transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTable(data.id, { color: c })
                          setIsMenuOpen(false)
                        }}
                      />
                    ))}
                  </div>
                  <div className="border-t border-glass-border">
                    <button
                      className="group flex items-center px-3 py-1.5 text-sm text-accent-red hover:bg-accent-red/10 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTable(data.id)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-accent-red" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Columns */}
      {!data.collapsed && (
        <div className="flex flex-col nowheel">
          {data.columns.map(col => (
            <ColumnRow
              key={col.id}
              tableId={data.id}
              column={col}
              tableColor={data.color}
            />
          ))}

          {/* Add Column Footer */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              addColumn(data.id)
            }}
            onMouseDown={e => e.stopPropagation()} // Prevent node drag on click
            className="flex items-center justify-center w-full h-[36px] text-[12px] font-medium text-text-tertiary hover:text-text-primary hover:bg-glass-hover border-t border-dashed border-glass-border/50 rounded-b-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Column
          </button>
        </div>
      )}
    </GlassPanel>
  )
})
TableNode.displayName = "TableNode"
