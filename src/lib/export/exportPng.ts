import { toPng } from 'html-to-image';
import { Project } from '../types';

export async function exportToPng(project: Project, options: { transparent?: boolean } = {}) {
  // Exporting the entire react-flow container preserves the layout and bounds better
  const flowElement = document.querySelector('.react-flow') as HTMLElement;

  if (!flowElement) {
    throw new Error('Canvas not found');
  }

  const nodes = document.querySelectorAll('.react-flow__node');
  if (nodes.length === 0) {
    throw new Error('No tables to export');
  }

  // Add watermark
  const watermark = document.createElement('div');
  watermark.innerHTML = 'Made with SchemaVision';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '20px';
  watermark.style.right = '20px';
  watermark.style.fontFamily = 'monospace';
  watermark.style.color = '#888';
  watermark.style.fontSize = '12px';
  watermark.style.zIndex = '1000';
  flowElement.appendChild(watermark);

  try {
    const dataUrl = await toPng(flowElement, {
      backgroundColor: options.transparent ? 'transparent' : '#0A0A0F',
      pixelRatio: 2,
      // Setting width/height explicitly ensures the canvas doesn't get clipped
      width: flowElement.offsetWidth,
      height: flowElement.offsetHeight,
      filter: (node: HTMLElement) => {
        // Exclude controls, panels, and our own UI overlays from the export
        const classList = node.classList;
        if (!classList) return true;

        if (
          classList.contains('react-flow__minimap') ||
          classList.contains('react-flow__controls') ||
          classList.contains('react-flow__panel')
        ) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `${project.name}-schema.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    if (watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
  }
}
