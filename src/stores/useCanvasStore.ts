import { create } from 'zustand';
import { Project, Table, Column, Relationship } from '@/lib/types';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { Node, Edge, NodeChange, EdgeChange, Connection, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

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

  // Relationship (Edge) operations
  onConnect: (connection: Connection) => void;
  updateRelationship: (edgeId: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (edgeId: string) => void;

  // Selection
  setSelectedTable: (id: string | null) => void;
  setSelectedColumn: (id: string | null) => void;

  // Sync ReactFlow Nodes
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
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

    const edges: Edge<Relationship>[] = (project.relationships || []).map(rel => {
      const sourceTable = project.tables.find(t => t.id === rel.sourceTableId);
      return {
        id: rel.id,
        source: rel.sourceTableId,
        sourceHandle: `${rel.sourceColumnId}-right`,
        target: rel.targetTableId,
        targetHandle: `${rel.targetColumnId}-left`,
        type: 'relationshipEdge',
        data: rel,
        style: { stroke: sourceTable?.color || 'var(--accent-blue)' },
      }
    });

    set({ project, nodes, edges, isLoading: false });
  },

  saveProject: async () => {
    const { project, nodes, edges } = get();
    if (!project) return;

    const tables = nodes.map(n => ({
      ...n.data,
      position: n.position,
    }));

    const relationships = edges.map(e => e.data as Relationship);

    const updatedProject = { ...project, tables, relationships, updatedAt: new Date().toISOString() };
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
    const { nodes, edges, saveProject } = get();
    const newNodes = nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
    );

    // update edge colors if table color changed
    let newEdges = edges;
    if (updates.color) {
      newEdges = edges.map(e =>
        e.source === id ? { ...e, style: { ...e.style, stroke: updates.color } } : e
      );
    }

    set({ nodes: newNodes, edges: newEdges });
    saveProject();
  },

  deleteTable: (id: string) => {
    const { nodes, edges, selectedTableId, saveProject } = get();
    set({
      nodes: nodes.filter(n => n.id !== id),
      edges: edges.filter(e => e.source !== id && e.target !== id),
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
    const { nodes, edges, selectedColumnId, saveProject } = get();
    set({
      nodes: nodes.map(n => {
        if (n.id === tableId) {
          return { ...n, data: { ...n.data, columns: n.data.columns.filter(c => c.id !== columnId) } };
        }
        return n;
      }),
      // Remove any relationships attached to this column
      edges: edges.filter(e =>
        !(e.source === tableId && e.sourceHandle === `${columnId}-right`) &&
        !(e.target === tableId && e.targetHandle === `${columnId}-left`)
      ),
      selectedColumnId: selectedColumnId === columnId ? null : selectedColumnId
    });
    saveProject();
  },

  reorderColumns: (_tableId: string, _startIndex: number, _endIndex: number) => {
     // Pending Drag & Drop implementation
  },

  onConnect: (connection: Connection) => {
    const { nodes, edges, saveProject, updateColumn } = get();
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return;

    // sourceHandle is colId-right, targetHandle is colId-left
    const sourceColId = connection.sourceHandle.replace('-right', '');
    const targetColId = connection.targetHandle.replace('-left', '');

    // Prevent self-loops on same column or existing relationships
    if (sourceColId === targetColId) return;
    const exists = edges.find(e => e.sourceHandle === connection.sourceHandle && e.targetHandle === connection.targetHandle);
    if (exists) return;

    const newRel: Relationship = {
      id: nanoid(),
      sourceTableId: connection.source,
      sourceColumnId: sourceColId,
      targetTableId: connection.target,
      targetColumnId: targetColId,
      type: '1:N',
      label: null,
    };

    const sourceTable = nodes.find(n => n.id === connection.source);

    const newEdge: Edge<Relationship> = {
      id: newRel.id,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle,
      type: 'relationshipEdge',
      data: newRel,
      style: { stroke: sourceTable?.data?.color || 'var(--accent-blue)' },
    };

    set({ edges: [...edges, newEdge] });

    // Automatically set target column to foreign key
    updateColumn(connection.target, targetColId, { isForeignKey: true });

    saveProject();
  },

  updateRelationship: (edgeId: string, updates: Partial<Relationship>) => {
    const { edges, saveProject } = get();
    set({
      edges: edges.map(e =>
        e.id === edgeId ? { ...e, data: { ...e.data as Relationship, ...updates } } : e
      )
    });
    saveProject();
  },

  deleteRelationship: (edgeId: string) => {
    const { edges, saveProject } = get();
    set({ edges: edges.filter(e => e.id !== edgeId) });
    saveProject();
  },

  setSelectedTable: (id: string | null) => set({ selectedTableId: id }),
  setSelectedColumn: (id: string | null) => set({ selectedColumnId: id }),

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes) as Node<Table>[];
      // Sync underlying table data position
      const finalNodes = updatedNodes.map(n => ({
         ...n,
         data: { ...n.data, position: n.position }
      }));
      return { nodes: finalNodes };
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as Edge<Relationship>[],
    }));
  }
}));
