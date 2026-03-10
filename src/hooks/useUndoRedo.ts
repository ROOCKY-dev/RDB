import { useCallback, useRef } from 'react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { Node, Edge } from '@xyflow/react';
import { Table, Relationship } from '@/lib/types';

const MAX_HISTORY = 50;

type HistoryState = {
  nodes: Node<Table>[];
  edges: Edge<Relationship>[];
};

export function useUndoRedo() {
  const historyRef = useRef<HistoryState[]>([]);
  const pointerRef = useRef<number>(-1);
  const isUndoRedoAction = useRef<boolean>(false);

  const takeSnapshot = useCallback(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    // We get the current state directly from store to avoid circular deps
    const state = useCanvasStore.getState();
    const currentNodes = JSON.parse(JSON.stringify(state.nodes));
    const currentEdges = JSON.parse(JSON.stringify(state.edges));

    // Remove any future states if we are not at the end of the history
    if (pointerRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    }

    historyRef.current.push({ nodes: currentNodes, edges: currentEdges });

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      pointerRef.current++;
    }
  }, []);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      isUndoRedoAction.current = true;
      pointerRef.current--;
      const prevState = historyRef.current[pointerRef.current];
      useCanvasStore.setState({
        nodes: JSON.parse(JSON.stringify(prevState.nodes)),
        edges: JSON.parse(JSON.stringify(prevState.edges))
      });
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      isUndoRedoAction.current = true;
      pointerRef.current++;
      const nextState = historyRef.current[pointerRef.current];
      useCanvasStore.setState({
        nodes: JSON.parse(JSON.stringify(nextState.nodes)),
        edges: JSON.parse(JSON.stringify(nextState.edges))
      });
    }
  }, []);

  return { takeSnapshot, undo, redo };
}
