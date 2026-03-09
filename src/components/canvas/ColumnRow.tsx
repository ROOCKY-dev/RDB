import { Column } from "@/lib/types"
import { GripVertical, Key, Link as LinkIcon, CircleSlash, Hash, Zap } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { useCanvasStore } from "@/stores/useCanvasStore"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ColumnRowProps {
  tableId: string
  column: Column
  tableColor: string
}

export function ColumnRow({ tableId, column }: ColumnRowProps) {
  const { selectedColumnId, setSelectedColumn, updateColumn } = useCanvasStore()
  const isSelected = selectedColumnId === column.id

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleNameSave = () => {
    if (editName.trim() && editName !== column.name) {
      updateColumn(tableId, column.id, { name: editName.trim().replace(/\s+/g, '_') })
    } else {
      setEditName(column.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameSave()
    if (e.key === "Escape") {
      setEditName(column.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center h-[36px] px-2 text-[13px] border-b border-glass-border/50 bg-bg-secondary/40 hover:bg-glass-hover transition-colors group cursor-pointer",
        isSelected && "bg-accent-blue/5 border-l-2 border-l-accent-blue"
      )}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedColumn(column.id)
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${column.id}-left`}
        className="w-2 h-2 !bg-accent-green opacity-0 group-hover:opacity-100 transition-opacity !border-0"
        style={{ left: -4 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id={`${column.id}-right`}
        className="w-2 h-2 !bg-accent-blue opacity-0 group-hover:opacity-100 transition-opacity !border-0"
        style={{ right: -4 }}
      />

      <div className="flex items-center space-x-2 w-full">
        {/* Drag handle (visual only for now) */}
        <GripVertical className="w-3 h-3 text-text-tertiary cursor-grab shrink-0 opacity-50 hover:opacity-100" />

        {/* Name */}
        <div className="flex-1 font-medium truncate">
          {isEditing ? (
            <input
              autoFocus
              className="w-full bg-glass-bg border border-accent-blue/50 rounded px-1 outline-none font-mono text-[12px]"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            column.name
          )}
        </div>

        {/* Constraints Icons */}
        <div className="flex items-center space-x-1 shrink-0 px-1">
           {column.isPrimaryKey && <Key className="w-3 h-3 text-accent-yellow"  />}
           {column.isForeignKey && <LinkIcon className="w-3 h-3 text-accent-blue"  />}
           {column.isUnique && <Hash className="w-3 h-3 text-accent-purple"  />}
           {column.isNotNull && <CircleSlash className="w-3 h-3 text-accent-red"  />}
           {column.isIndexed && <Zap className="w-3 h-3 text-accent-orange"  />}
        </div>

        {/* Type Badge */}
        <div className="shrink-0 font-mono text-[11px] px-1.5 py-0.5 rounded-full bg-glass-bg border border-glass-border text-text-secondary">
          {column.type}{column.length ? `(${column.length})` : ''}
        </div>
      </div>
    </div>
  )
}
