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

type Box = { left: number; top: number; right: number; bottom: number };

const CROP_PADDING = 4;
const SHAPE_SELECTOR =
  'text, line, path, rect, circle, ellipse, polyline, polygon, image';

function unionBox(a: Box | null, b: Box): Box {
  if (!a) return b;
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

// Bounds of non-transparent pixels in CSS px relative to the canvas
function canvasContentBox(canvas: HTMLCanvasElement): Box | null {
  const { width, height } = canvas;
  if (!width || !height || !canvas.clientWidth || !canvas.clientHeight) {
    return null;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (data[row + x * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      maxY = y;
    }
  }
  if (maxX < 0) return null;

  const kx = canvas.clientWidth / width;
  const ky = canvas.clientHeight / height;
  return {
    left: minX * kx,
    top: minY * ky,
    right: (maxX + 1) * kx,
    bottom: (maxY + 1) * ky,
  };
}

// Paint that is invisible or merely masks content with the background color
function isBackgroundPaint(value: string, bgHex: string | undefined): boolean {
  if (!value || value === 'none') return true;
  if (value.startsWith('url(')) return false;
  const rgba = toRgba(value);
  if (!rgba) return false;
  return rgba.alpha === 0 || rgba.hex === bgHex;
}

// Bounds of overlay shapes that carry information, in viewport coordinates
function overlayContentBox(svg: SVGSVGElement, bgHex: string | undefined) {
  let box: Box | null = null;
  svg.querySelectorAll(SHAPE_SELECTOR).forEach((el) => {
    if (el.closest('defs, clipPath, mask, pattern')) return;
    const cs = getComputedStyle(el);
    if (
      cs.display === 'none' ||
      cs.visibility === 'hidden' ||
      parseFloat(cs.opacity) === 0
    ) {
      return;
    }
    if (
      el.tagName !== 'image' &&
      isBackgroundPaint(cs.fill, bgHex) &&
      isBackgroundPaint(cs.stroke, bgHex)
    ) {
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    box = unionBox(box, {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
    });
  });
  return box as Box | null;
}

// Region of the root (in root-local px) that holds the chart itself,
// without the empty space around it
function contentCropBox(root: HTMLElement, rootRect: DOMRect, bg: string) {
  const bgHex = toRgba(bg)?.hex;
  let box: Box | null = null;

  const canvas = root.querySelector('canvas');
  if (canvas) {
    const c = canvasContentBox(canvas);
    if (c) {
      const cr = canvas.getBoundingClientRect();
      box = unionBox(box, {
        left: c.left + cr.left - rootRect.left,
        top: c.top + cr.top - rootRect.top,
        right: c.right + cr.left - rootRect.left,
        bottom: c.bottom + cr.top - rootRect.top,
      });
    }
  }

  root.querySelectorAll('svg').forEach((svg) => {
    const o = overlayContentBox(svg, bgHex);
    if (!o) return;
    box = unionBox(box, {
      left: o.left - rootRect.left,
      top: o.top - rootRect.top,
      right: o.right - rootRect.left,
      bottom: o.bottom - rootRect.top,
    });
  });

  const full = { x: 0, y: 0, width: rootRect.width, height: rootRect.height };
  if (!box) return full;
  const b = box as Box;
  const left = Math.max(0, Math.floor(b.left - CROP_PADDING));
  const top = Math.max(0, Math.floor(b.top - CROP_PADDING));
  const right = Math.min(rootRect.width, Math.ceil(b.right + CROP_PADDING));
  const bottom = Math.min(rootRect.height, Math.ceil(b.bottom + CROP_PADDING));
  if (right <= left || bottom <= top) return full;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function exportChartToSvg(root: HTMLElement | null, name = 'bscan') {
  if (!root) return;

  const rect = root.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (width === 0 || height === 0) return;

  const bgColor = getComputedStyle(root).backgroundColor || '#000';
  const crop = contentCropBox(root, rect, bgColor);

  const out = document.createElementNS(SVG_NS, 'svg');
  out.setAttribute('xmlns', SVG_NS);
  out.setAttribute('xmlns:xlink', XLINK_NS);
  out.setAttribute('width', String(crop.width));
  out.setAttribute('height', String(crop.height));
  out.setAttribute(
    'viewBox',
    `${crop.x} ${crop.y} ${crop.width} ${crop.height}`,
  );

  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', String(crop.x));
  bg.setAttribute('y', String(crop.y));
  bg.setAttribute('width', String(crop.width));
  bg.setAttribute('height', String(crop.height));
  setColorAttr(bg, 'fill', bgColor, 1);
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
