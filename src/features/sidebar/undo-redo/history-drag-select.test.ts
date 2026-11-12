// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  historyKeyAtClientY,
  scrollDeltaForEdge,
  selectionIncludes,
} from './history-drag-select';

function setRect(
  element: HTMLElement,
  top: number,
  height: number,
  left = 0,
  width = 100,
) {
  element.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      top,
      left,
      width,
      height,
      bottom: top + height,
      right: left + width,
      toJSON() {
        return {};
      },
    }) as DOMRect;
}

function mountRows(keys: number[]) {
  const viewport = document.createElement('div');
  const rows = keys.map((key) => {
    const row = document.createElement('div');
    row.dataset.historyKey = String(key);
    viewport.append(row);
    return row;
  });
  return { viewport, rows };
}

describe('selectionIncludes', () => {
  it('covers every key between the press and the pointer, in either direction', () => {
    expect(selectionIncludes(null, 1)).toBe(false);
    expect(selectionIncludes({ anchor: 2, focus: 4 }, 1)).toBe(false);
    expect(selectionIncludes({ anchor: 2, focus: 4 }, 2)).toBe(true);
    expect(selectionIncludes({ anchor: 2, focus: 4 }, 3)).toBe(true);
    expect(selectionIncludes({ anchor: 2, focus: 4 }, 4)).toBe(true);
    expect(selectionIncludes({ anchor: 4, focus: 2 }, 3)).toBe(true);
    expect(selectionIncludes({ anchor: 4, focus: 2 }, 5)).toBe(false);
  });
});

describe('historyKeyAtClientY', () => {
  it('returns the row under the pointer and ignores rows outside the viewport', () => {
    const { viewport, rows } = mountRows([1, 2, 3, 4]);
    setRect(viewport, 100, 100);
    setRect(rows[0], 40, 40);
    setRect(rows[1], 90, 40);
    setRect(rows[2], 130, 40);
    setRect(rows[3], 210, 40);

    expect(historyKeyAtClientY(viewport, 50)).toBe(2);
    expect(historyKeyAtClientY(viewport, 140)).toBe(3);
    expect(historyKeyAtClientY(viewport, 300)).toBe(3);
    expect(historyKeyAtClientY(viewport, 100)).toBe(2);
  });

  it('uses the nearest visible row when the pointer is in a gap', () => {
    const { viewport, rows } = mountRows([1, 2]);
    setRect(viewport, 0, 200);
    setRect(rows[0], 10, 20);
    setRect(rows[1], 50, 20);

    expect(historyKeyAtClientY(viewport, 32)).toBe(1);
    expect(historyKeyAtClientY(viewport, 48)).toBe(2);
  });
});

describe('scrollDeltaForEdge', () => {
  it('scrolls only while the pointer is in the edge zone', () => {
    const viewport = document.createElement('div');
    setRect(viewport, 0, 200);

    expect(scrollDeltaForEdge(viewport, 100)).toBe(0);
    expect(scrollDeltaForEdge(viewport, 0)).toBeLessThan(0);
    expect(scrollDeltaForEdge(viewport, 200)).toBeGreaterThan(0);
    expect(scrollDeltaForEdge(viewport, -100)).toBe(-24);
    expect(scrollDeltaForEdge(viewport, 400)).toBe(24);
  });
});
