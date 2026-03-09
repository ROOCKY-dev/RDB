import { useReactFlow } from "@xyflow/react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { GlassButton } from "@/components/ui/GlassButton"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow()
  const zoom = Math.round(getViewport().zoom * 100)

  return (
    <GlassPanel
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 p-1 z-10 !rounded-full"
    >
      <GlassButton
        variant="icon"
        onClick={() => zoomOut({ duration: 300 })}
        className="!rounded-full hover:bg-glass-hover"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </GlassButton>

      <div className="px-3 text-xs font-mono font-medium min-w-[60px] text-center select-none text-text-secondary">
        {zoom}%
      </div>

      <GlassButton
        variant="icon"
        onClick={() => zoomIn({ duration: 300 })}
        className="!rounded-full hover:bg-glass-hover"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </GlassButton>

      <div className="w-[1px] h-4 bg-glass-border mx-1" />

      <GlassButton
        variant="icon"
        onClick={() => fitView({ duration: 500, padding: 0.2 })}
        className="!rounded-full hover:bg-glass-hover"
        title="Fit View"
      >
        <Maximize className="w-4 h-4" />
      </GlassButton>
    </GlassPanel>
  )
}
