export type HistorySelection = {
  anchor: number;
  focus: number;
};

const EDGE_PX = 28;
const MIN_SCROLL_STEP = 3;
const MAX_SCROLL_STEP = 24;

export function selectionIncludes(
  selection: HistorySelection | null,
  key: number,
) {
  if (!selection) return false;
  const lo = Math.min(selection.anchor, selection.focus);
  const hi = Math.max(selection.anchor, selection.focus);
  return key >= lo && key <= hi;
}

export function historyKeyAtClientY(viewport: HTMLElement, clientY: number) {
  const viewportRect = viewport.getBoundingClientRect();
  const rows = viewport.querySelectorAll<HTMLElement>('[data-history-key]');
  let firstVisible: HTMLElement | null = null;
  let lastVisible: HTMLElement | null = null;
  let closest: HTMLElement | null = null;
  let closestDist = Infinity;

  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    const visible =
      rect.bottom > viewportRect.top && rect.top < viewportRect.bottom;
    if (!visible) continue;
    firstVisible ??= row;
    lastVisible = row;
    if (clientY >= rect.top && clientY <= rect.bottom) {
      return readKey(row);
    }
    const dist =
      clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
    if (dist < closestDist) {
      closestDist = dist;
      closest = row;
    }
  }

  if (clientY <= viewportRect.top) {
    return firstVisible ? readKey(firstVisible) : null;
  }
  if (clientY >= viewportRect.bottom) {
    return lastVisible ? readKey(lastVisible) : null;
  }
  return closest ? readKey(closest) : null;
}

export function scrollDeltaForEdge(viewport: HTMLElement, clientY: number) {
  const rect = viewport.getBoundingClientRect();
  if (clientY < rect.top + EDGE_PX) {
    const depth = rect.top + EDGE_PX - clientY;
    return -Math.min(MAX_SCROLL_STEP, Math.max(MIN_SCROLL_STEP, depth * 0.4));
  }
  if (clientY > rect.bottom - EDGE_PX) {
    const depth = clientY - (rect.bottom - EDGE_PX);
    return Math.min(MAX_SCROLL_STEP, Math.max(MIN_SCROLL_STEP, depth * 0.4));
  }
  return 0;
}

function readKey(row: HTMLElement) {
  const key = Number(row.dataset.historyKey);
  return Number.isInteger(key) ? key : null;
}
