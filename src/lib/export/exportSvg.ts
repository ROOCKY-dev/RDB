import { toSvg } from 'html-to-image';
import { Project } from '../types';

export async function exportToSvg(project: Project, options: { transparent?: boolean } = {}) {
  const flowElement = document.querySelector('.react-flow') as HTMLElement;

  if (!flowElement) {
    throw new Error('Canvas not found');
  }

  const nodes = document.querySelectorAll('.react-flow__node');
  if (nodes.length === 0) {
    throw new Error('No tables to export');
  }

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
    const dataUrl = await toSvg(flowElement, {
      backgroundColor: options.transparent ? 'transparent' : '#0A0A0F',
      width: flowElement.offsetWidth,
      height: flowElement.offsetHeight,
      filter: (node: HTMLElement) => {
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
    link.download = `${project.name}-schema.svg`;
    link.href = dataUrl;
    link.click();
  } finally {
    if (watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
  }
}
