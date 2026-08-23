import { STYLE_PROPS, SVG_NS, XLINK_NS } from './export-consts';

function inlineComputedStyles(src: Element, dst: Element) {
  const srcEls = [src, ...src.querySelectorAll('*')];
  const dstEls = [dst, ...dst.querySelectorAll('*')];
  for (let i = 0; i < srcEls.length; i++) {
    const cs = getComputedStyle(srcEls[i]);
    const target = dstEls[i];
    let style = '';
    for (const prop of STYLE_PROPS) {
      const value = cs.getPropertyValue(prop);
      if (value) style += `${prop}:${value};`;
    }
    target.setAttribute('style', style);
    target.removeAttribute('class');
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function sanitizeFileName(name: string): string {
  const base = name.trim().replace(/\.[^./\\]+$/, '') || 'bscan';
  return `${base.replace(/[^\w.-]+/g, '_')}.svg`;
}

export function exportChartToSvg(root: HTMLElement | null, name = 'bscan') {
  if (!root) return;

  const rect = root.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (width === 0 || height === 0) return;

  const out = document.createElementNS(SVG_NS, 'svg');
  out.setAttribute('xmlns', SVG_NS);
  out.setAttribute('xmlns:xlink', XLINK_NS);
  out.setAttribute('width', String(width));
  out.setAttribute('height', String(height));
  out.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('fill', getComputedStyle(root).backgroundColor || '#000');
  out.appendChild(bg);

  const canvas = root.querySelector('canvas');
  if (canvas) {
    const image = document.createElementNS(SVG_NS, 'image');
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', String(width));
    image.setAttribute('height', String(height));
    image.setAttribute('preserveAspectRatio', 'none');
    image.setAttributeNS(XLINK_NS, 'href', canvas.toDataURL('image/png'));
    out.appendChild(image);
  }

  const overlays = root.querySelectorAll('svg');
  overlays.forEach((svg) => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    inlineComputedStyles(svg, clone);
    const group = document.createElementNS(SVG_NS, 'g');
    while (clone.firstChild) group.appendChild(clone.firstChild);
    out.appendChild(group);
  });

  const xml = new XMLSerializer().serializeToString(out);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], {
    type: 'image/svg+xml;charset=utf-8',
  });
  triggerDownload(blob, sanitizeFileName(name));
}
