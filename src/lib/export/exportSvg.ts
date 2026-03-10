import { toSvg } from 'html-to-image';
import { Project, Table } from '../types';
import { getNodesBounds, getViewportForBounds, Node } from '@xyflow/react';

export async function exportToSvg(project: Project, nodes: Node<Table>[], options: { transparent?: boolean } = {}) {
  const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (!flowElement) {
    throw new Error('Canvas not found');
  }

  if (nodes.length === 0) {
    throw new Error('No tables to export');
  }

  const imageWidth = 1920;
  const imageHeight = 1080;

  const nodesBounds = getNodesBounds(nodes);
  const viewport = getViewportForBounds(
    nodesBounds,
    imageWidth,
    imageHeight,
    0.5,
    2,
    0.2
  );

  try {
    const dataUrl = await toSvg(flowElement, {
      backgroundColor: options.transparent ? 'transparent' : '#0A0A0F',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
      filter: (node: HTMLElement) => {
        if (
          node.classList?.contains('react-flow__minimap') ||
          node.classList?.contains('react-flow__controls') ||
          node.classList?.contains('react-flow__panel')
        ) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `${project.name}-schema.svg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed in html-to-image toSvg', error);
    throw error;
  }
}
