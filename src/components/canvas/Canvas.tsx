import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/stores/useCanvasStore';
import { TableNode } from './TableNode';
import { ZoomControls } from './ZoomControls';
import { useTheme } from 'next-themes';
import { Plus } from 'lucide-react';
import { Table } from '@/lib/types';

const nodeTypes = {
  tableNode: TableNode,
};

function Flow() {
  const { theme } = useTheme();
  const {
    project,
    nodes,
    edges,
    onNodesChange,
    setSelectedTable,
    setSelectedColumn,
    addTable
  } = useCanvasStore();

  const { screenToFlowPosition } = useReactFlow();

  const handlePaneClick = useCallback(() => {
    setSelectedTable(null);
    setSelectedColumn(null);
  }, [setSelectedTable, setSelectedColumn]);

  const handleAddTable = useCallback(() => {
    // Add table to the center of the current view
    const center = document.querySelector('.react-flow__pane')?.getBoundingClientRect();
    if (center) {
      const position = screenToFlowPosition({
        x: center.x + center.width / 2,
        y: center.y + center.height / 2,
      });
      addTable(position);
    } else {
      addTable({ x: 100, y: 100 });
    }
  }, [screenToFlowPosition, addTable]);

  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        elevateNodesOnSelect={true}
        className="bg-bg-primary"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          gap={project?.settings.gridSize || 20}
          size={1}
          variant={project?.settings.canvasBackground === 'lines' ? "lines" as BackgroundVariant : "dots" as BackgroundVariant}
        />

        <MiniMap
          className="!bg-bg-secondary !border !border-glass-border !rounded-xl !overflow-hidden !shadow-lg !bottom-6 !right-6"
          maskColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"}
          nodeColor={(node: Node<Table>) => node.data?.color || '#007AFF'}
        />

        {/* Custom Zoom Controls overlay */}
        <ZoomControls />

        <Panel position="top-left" className="m-4">
           <button
             onClick={handleAddTable}
             className="flex items-center space-x-2 bg-accent-blue text-white px-4 py-2 rounded-lg shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 transition-colors font-medium text-sm"
           >
             <Plus className="w-4 h-4" />
             <span>Add Table</span>
           </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return <Flow />;
}
