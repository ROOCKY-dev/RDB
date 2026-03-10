import { toSvg } from 'html-to-image';
import { Project } from '../types';

export async function exportToSvg(project: Project, options: { transparent?: boolean } = {}) {
  const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (!flowElement) {
    throw new Error('Canvas not found');
  }

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
    const dataUrl = await toSvg(flowElement, {
      backgroundColor: options.transparent ? 'transparent' : '#0A0A0F',
      style: {
        transform: 'translate(0, 0) scale(1)', // Reset zoom/pan for clear render
      },
      filter: (node: HTMLElement) => {
        if (node.classList?.contains('react-flow__minimap') || node.classList?.contains('react-flow__controls')) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `${project.name}-schema.svg`;
    link.href = dataUrl;
    link.click();
  } finally {
    if (watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
  }
}
