import { COLOR_PROPS, STYLE_PROPS, SVG_NS, XLINK_NS } from './export-consts';

type Rgba = { hex: string; alpha: number };

const colorCache = new Map<string, Rgba | null>();
let colorCtx: CanvasRenderingContext2D | null = null;

function toRgba(color: string): Rgba | null {
  const cached = colorCache.get(color);
  if (cached !== undefined) return cached;

  if (!colorCtx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    colorCtx = c.getContext('2d', { willReadFrequently: true });
  }
  let result: Rgba | null = null;
  if (colorCtx && CSS.supports('color', color)) {
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = '#000';
    colorCtx.fillStyle = color;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
    const hex = (v: number) => v.toString(16).padStart(2, '0');
    result = {
      hex: `#${hex(r)}${hex(g)}${hex(b)}`,
      alpha: Math.round((a / 255) * 1000) / 1000,
    };
  }
  colorCache.set(color, result);
  return result;
}

function setColorAttr(
  target: Element,
  prop: string,
  value: string,
  opacity: number,
) {
  const opacityProp = COLOR_PROPS[prop];
  if (value === 'none' || value.startsWith('url(')) {
    target.setAttribute(
      prop,
      value.replace(/url\(["']?([^"')]+)["']?\)/, 'url($1)'),
    );
    if (opacityProp && opacity < 1)
      target.setAttribute(opacityProp, String(opacity));
    return;
  }
  const rgba = toRgba(value);
  if (!rgba) {
    target.setAttribute(prop, value);
    return;
  }
  if (rgba.alpha === 0) {
    target.setAttribute(prop, 'none');
    return;
  }
  target.setAttribute(prop, rgba.hex);
  const total = rgba.alpha * opacity;
  if (opacityProp && total < 1) target.setAttribute(opacityProp, String(total));
}

function inlineComputedStyles(src: Element, dst: Element) {
  const srcEls = [src, ...src.querySelectorAll('*')];
  const dstEls = [dst, ...dst.querySelectorAll('*')];
  for (let i = 0; i < srcEls.length; i++) {
    const cs = getComputedStyle(srcEls[i]);
    const target = dstEls[i];
    target.removeAttribute('style');
    target.removeAttribute('class');
    for (const prop of STYLE_PROPS) {
      const value = cs.getPropertyValue(prop).trim();
      if (!value) continue;
      if (prop in COLOR_PROPS) {
        const opacityProp = COLOR_PROPS[prop];
        const parsed = opacityProp
          ? parseFloat(cs.getPropertyValue(opacityProp))
          : NaN;
        const opacity = Number.isNaN(parsed) ? 1 : parsed;
        setColorAttr(target, prop, value, opacity);
      } else if (!(Object.values(COLOR_PROPS) as string[]).includes(prop)) {
        target.setAttribute(prop, value);
      }
    }
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
  setColorAttr(bg, 'fill', getComputedStyle(root).backgroundColor || '#000', 1);
  out.appendChild(bg);

  const canvas = root.querySelector('canvas');
  if (canvas) {
    const image = document.createElementNS(SVG_NS, 'image');
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', String(width));
    image.setAttribute('height', String(height));
    image.setAttribute('preserveAspectRatio', 'none');
    const dataUrl = canvas.toDataURL('image/png');
    image.setAttribute('href', dataUrl);
    image.setAttributeNS(XLINK_NS, 'xlink:href', dataUrl);
    out.appendChild(image);
  }

  const overlays = root.querySelectorAll('svg');
  overlays.forEach((svg) => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    inlineComputedStyles(svg, clone);
    const group = document.createElementNS(SVG_NS, 'g');
    const svgRect = svg.getBoundingClientRect();
    const dx = Math.round(svgRect.left - rect.left);
    const dy = Math.round(svgRect.top - rect.top);
    if (dx || dy) group.setAttribute('transform', `translate(${dx}, ${dy})`);
    while (clone.firstChild) group.appendChild(clone.firstChild);
    out.appendChild(group);
  });

  const xml = new XMLSerializer().serializeToString(out);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], {
    type: 'image/svg+xml;charset=utf-8',
  });
  triggerDownload(blob, sanitizeFileName(name));
}
