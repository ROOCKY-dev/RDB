import { create } from 'zustand';
import { Project, Table, Column, Relationship } from '@/lib/types';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { Node, Edge, NodeChange } from '@xyflow/react';

interface CanvasState {
  project: Project | null;
  nodes: Node<Table>[];
  edges: Edge<Relationship>[];
  selectedTableId: string | null;
  selectedColumnId: string | null;
  isLoading: boolean;

  // Actions
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;

  // Table operations
  addTable: (position: { x: number; y: number }) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  duplicateTable: (id: string) => void;

  // Column operations
  addColumn: (tableId: string) => void;
  updateColumn: (tableId: string, columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (tableId: string, columnId: string) => void;
  reorderColumns: (_tableId: string, _startIndex: number, _endIndex: number) => void;

  // Selection
  setSelectedTable: (id: string | null) => void;
  setSelectedColumn: (id: string | null) => void;

  // Sync ReactFlow Nodes
  onNodesChange: (changes: NodeChange[]) => void;
}

const colors = [
  '#007AFF', // blue
  '#AF52DE', // purple
  '#34C759', // green
  '#FF3B30', // red
  '#FF9500', // orange
  '#FFCC00', // yellow
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  project: null,
  nodes: [],
  edges: [],
  selectedTableId: null,
  selectedColumnId: null,
  isLoading: true,

  loadProject: async (id: string) => {
    set({ isLoading: true });
    const project = await db.getProject(id);
    if (!project) {
      set({ project: null, isLoading: false });
      return;
    }

    const nodes: Node<Table>[] = project.tables.map(table => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: table,
    }));

    set({ project, nodes, edges: [], isLoading: false }); // Edges pending phase 5
  },

  saveProject: async () => {
    const { project, nodes } = get();
    if (!project) return;

    const tables = nodes.map(n => ({
      ...n.data,
      position: n.position,
    }));

    const updatedProject = { ...project, tables, updatedAt: new Date().toISOString() };
    await db.saveProject(updatedProject);
    set({ project: updatedProject });
  },

  addTable: (position: { x: number; y: number }) => {
    const { nodes, saveProject } = get();

    const newTable: Table = {
      id: nanoid(),
      name: `table_${nodes.length + 1}`,
      position,
      color: colors[nodes.length % colors.length],
      collapsed: false,
      columns: [
        {
          id: nanoid(),
          name: 'id',
          type: 'INT',
          length: null,
          precision: null,
          scale: null,
          isPrimaryKey: true,
          isForeignKey: false,
          isNotNull: true,
          isUnique: true,
          isAutoIncrement: true,
          isIndexed: false,
          defaultValue: null,
          comment: null,
          order: 0
        }
      ],
      comment: null,
    };

    const newNode: Node<Table> = {
      id: newTable.id,
      type: 'tableNode',
      position,
      data: newTable,
    };

    set({ nodes: [...nodes, newNode] });
    saveProject();
  },

  updateTable: (id: string, updates: Partial<Table>) => {
    const { nodes, saveProject } = get();
    set({
      nodes: nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
      )
    });
    saveProject();
  },

  deleteTable: (id: string) => {
    const { nodes, selectedTableId, saveProject } = get();
    set({
      nodes: nodes.filter(n => n.id !== id),
      selectedTableId: selectedTableId === id ? null : selectedTableId
    });
    saveProject();
  },

  duplicateTable: (id: string) => {
    const { nodes, saveProject } = get();
    const sourceNode = nodes.find(n => n.id === id);
    if (!sourceNode) return;

    const newTableId = nanoid();

    const newColumns = sourceNode.data.columns.map(c => ({
      ...c,
      id: nanoid(),
    }));

    const newTable: Table = {
      ...sourceNode.data,
      id: newTableId,
      name: `${sourceNode.data.name}_copy`,
      columns: newColumns,
      position: { x: sourceNode.position.x + 50, y: sourceNode.position.y + 50 }
    };

    const newNode: Node<Table> = {
      id: newTable.id,
      type: 'tableNode',
      position: newTable.position,
      data: newTable,
    };

    set({ nodes: [...nodes, newNode] });
    saveProject();
  },

  addColumn: (tableId: string) => {
    const { nodes, saveProject } = get();
    set({
      nodes: nodes.map(n => {
        if (n.id === tableId) {
          const newColumn: Column = {
             id: nanoid(),
             name: `column_${n.data.columns.length + 1}`,
             type: 'VARCHAR',
             length: 255,
             precision: null,
             scale: null,
             isPrimaryKey: false,
             isForeignKey: false,
             isNotNull: false,
             isUnique: false,
             isAutoIncrement: false,
             isIndexed: false,
             defaultValue: null,
             comment: null,
             order: n.data.columns.length
          };
          return { ...n, data: { ...n.data, columns: [...n.data.columns, newColumn] } };
        }
        return n;
      })
    });
    saveProject();
  },

  updateColumn: (tableId: string, columnId: string, updates: Partial<Column>) => {
    const { nodes, saveProject } = get();
    set({
      nodes: nodes.map(n => {
        if (n.id === tableId) {
          return {
            ...n,
            data: {
              ...n.data,
              columns: n.data.columns.map(c => c.id === columnId ? { ...c, ...updates } : c)
            }
          };
        }
        return n;
      })
    });
    saveProject();
  },

  deleteColumn: (tableId: string, columnId: string) => {
    const { nodes, selectedColumnId, saveProject } = get();
    set({
      nodes: nodes.map(n => {
        if (n.id === tableId) {
          return { ...n, data: { ...n.data, columns: n.data.columns.filter(c => c.id !== columnId) } };
        }
        return n;
      }),
      selectedColumnId: selectedColumnId === columnId ? null : selectedColumnId
    });
    saveProject();
  },

  reorderColumns: (_tableId: string, _startIndex: number, _endIndex: number) => {
     // Pending Drag & Drop implementation
  },

  setSelectedTable: (id: string | null) => set({ selectedTableId: id }),
  setSelectedColumn: (id: string | null) => set({ selectedColumnId: id }),

  onNodesChange: (changes: NodeChange[]) => {
    // Only process position changes for now, others handled by specific actions
    set((state) => {
      const updatedNodes = [...state.nodes];
      changes.forEach((change: NodeChange) => {
        if (change.type === 'position' && change.position) {
          const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position,
              // Update underlying table data position too
              data: { ...updatedNodes[nodeIndex].data, position: change.position }
            };
          }
        }
      });
      return { nodes: updatedNodes };
    });
  }
}));
