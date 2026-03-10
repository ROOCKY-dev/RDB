import { toPng } from 'html-to-image';
import { Project } from '../types';

export async function exportToPng(project: Project, options: { transparent?: boolean } = {}) {
  const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (!flowElement) {
    throw new Error('Canvas not found');
  }

  // Find the exact bounds of the canvas content to crop the image
  const nodes = document.querySelectorAll('.react-flow__node');
  if (nodes.length === 0) {
    throw new Error('No tables to export');
  }

  // Temporarily add a watermark
  const watermark = document.createElement('div');
  watermark.innerHTML = 'Made with SchemaVision';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '-40px';
  watermark.style.right = '0px';
  watermark.style.fontFamily = 'monospace';
  watermark.style.color = '#888';
  watermark.style.fontSize = '12px';
  flowElement.appendChild(watermark);

  try {
    const dataUrl = await toPng(flowElement, {
      backgroundColor: options.transparent ? 'transparent' : '#0A0A0F', // fallback to dark theme bg
      pixelRatio: 2,
      style: {
        transform: 'translate(0, 0) scale(1)', // Reset zoom/pan for clear render
      },
      filter: (node: HTMLElement) => {
        // Filter out any UI controls if they were inside the viewport (they usually aren't, but just in case)
        if (node.classList?.contains('react-flow__minimap') || node.classList?.contains('react-flow__controls')) {
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
    // Cleanup watermark
    if (watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
  }
}
