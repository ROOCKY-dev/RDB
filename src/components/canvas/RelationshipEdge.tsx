import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge
} from '@xyflow/react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Trash2 } from 'lucide-react';
import { Relationship } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  data,
  markerEnd,
}: EdgeProps) {
  const relData = data as Relationship | undefined;
  const { deleteRelationship, updateRelationship } = useCanvasStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const relType = relData?.type || '1:N';

  // Extract source table color from CSS variable passed via style or use default
  const edgeColor = (style as React.CSSProperties).stroke || 'var(--accent-blue)';

  // Create crow's foot notation paths
  const renderCrowsFoot = () => {
    // Basic notation for SVG markers based on type
    const sourceMarker = relType === '1:1' || relType === '1:N'
      ? <circle cx={sourceX} cy={sourceY} r="3" fill={edgeColor as string} />
      : <path d={`M ${sourceX+5} ${sourceY-5} L ${sourceX} ${sourceY} L ${sourceX+5} ${sourceY+5}`} fill="none" stroke={edgeColor as string} strokeWidth={2} />;

    const targetMarker = relType === '1:N' || relType === 'M:N'
      ? <path d={`M ${targetX-8} ${targetY-5} L ${targetX} ${targetY} L ${targetX-8} ${targetY+5}`} fill="none" stroke={edgeColor as string} strokeWidth={2} />
      : <path d={`M ${targetX-5} ${targetY-5} L ${targetX-5} ${targetY+5}`} fill="none" stroke={edgeColor as string} strokeWidth={2} />;

    return (
      <>
        {sourceMarker}
        {targetMarker}
      </>
    );
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          opacity: selected ? 1 : 0.6,
        }}
      />

      {/* Visual representation of cardinality (simplified) */}
      <g>
        {renderCrowsFoot()}
      </g>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: selected ? 20 : 10,
          }}
          className="relative group"
        >
          {/* Main label pill */}
          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all shadow-sm backdrop-blur-md border",
              selected
                ? "bg-bg-secondary border-accent-blue text-accent-blue shadow-accent-blue/20"
                : "bg-glass-bg border-glass-border text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {relType as string}
            {(relData?.label) ? <span className="ml-1 opacity-75 font-normal">{relData.label}</span> : null}
          </div>

          {/* Floating Edge Toolbar (appears on select or menu click) */}
          {(selected || isMenuOpen) && (
            <GlassPanel
              variant="card"
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col min-w-[120px] p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <div className="flex bg-glass-bg rounded-lg p-0.5 mb-1">
                {(['1:1', '1:N', 'M:N'] as const).map(t => (
                  <button
                    key={t}
                    className={cn(
                      "flex-1 text-[10px] py-1 px-2 font-bold rounded-md transition-colors",
                      relType === t ? "bg-accent-blue text-white" : "text-text-secondary hover:text-text-primary hover:bg-glass-hover"
                    )}
                    onClick={() => updateRelationship(id, { type: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center mt-1 px-1">
                <input
                  type="text"
                  placeholder="Label..."
                  value={relData?.label || ''}
                  onChange={(e) => updateRelationship(id, { label: e.target.value })}
                  className="flex-1 bg-transparent border-none text-[10px] outline-none text-text-primary placeholder:text-text-tertiary w-[80px]"
                />
                <button
                  className="p-1 text-accent-red hover:bg-accent-red/10 rounded ml-1 transition-colors"
                  onClick={() => deleteRelationship(id)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </GlassPanel>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
