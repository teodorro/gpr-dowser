// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import Grid2D from '@/shared/grid2d';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { OperationTypeList } from '@/stores/undo-redo.types';
import UndoRedo from './UndoRedo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const originalSetPointerCapture = HTMLElement.prototype.setPointerCapture;
const originalReleasePointerCapture =
  HTMLElement.prototype.releasePointerCapture;
const originalHasPointerCapture = HTMLElement.prototype.hasPointerCapture;

beforeAll(() => {
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.hasPointerCapture = () => false;
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

afterAll(() => {
  HTMLElement.prototype.setPointerCapture = originalSetPointerCapture;
  HTMLElement.prototype.releasePointerCapture = originalReleasePointerCapture;
  HTMLElement.prototype.hasPointerCapture = originalHasPointerCapture;
});

function setRect(
  element: HTMLElement,
  top: number,
  height: number,
  left = 0,
  width = 160,
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

function renderHistory() {
  const id = 'undo-redo-selection';
  const bScan = Grid2D.fromArray([
    [1, 2],
    [3, 4],
  ]);
  const store = createDataSliceStore(id, { bScanInitial: bScan, bScan });
  for (let count = 0; count < 3; count += 1) {
    store.getState().addOperation({
      type: OperationTypeList.TurnAroundBscan,
      snapshot: bScan,
    });
  }
  dataSliceStores.set(id, store);
  useFileRegistryStore.setState({ fileIds: [id], selectedFileId: id });
  render(<UndoRedo />);
  const viewport = document.querySelector(
    '[data-slot="scroll-area-viewport"]',
  ) as HTMLElement;
  const rows = [
    ...document.querySelectorAll<HTMLElement>('[data-history-key]'),
  ];
  return { viewport, rows };
}

function selectedKeys() {
  return [...document.querySelectorAll<HTMLElement>('[data-selected]')].map(
    (node) => Number(node.parentElement?.dataset.historyKey),
  );
}

function pointer(clientY: number, buttons = 1) {
  return { button: 0, buttons, pointerId: 1, clientY };
}

describe('UndoRedo history selection', () => {
  afterEach(() => {
    dataSliceStores.clear();
    useFileRegistryStore.setState({ fileIds: [], selectedFileId: undefined });
  });

  it('selects the range from the pressed row to the pointer until the button is released', () => {
    const { rows } = renderHistory();
    setRect(rows[0], 0, 40);
    setRect(rows[1], 40, 40);
    setRect(rows[2], 80, 40);
    const viewport = rows[0].closest(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    setRect(viewport, 0, 200);

    fireEvent.pointerDown(rows[0], pointer(10));
    expect(selectedKeys()).toEqual([1]);

    fireEvent.pointerMove(rows[2], pointer(90));
    expect(selectedKeys()).toEqual([1, 2, 3]);

    fireEvent.pointerUp(rows[2], pointer(90, 0));
    fireEvent.pointerMove(rows[0], pointer(10, 0));
    expect(selectedKeys()).toEqual([1, 2, 3]);

    fireEvent.pointerDown(rows[2], pointer(90));
    fireEvent.pointerMove(rows[0], pointer(10));
    expect(selectedKeys()).toEqual([1, 2, 3]);
  });

  it('extends the range when the list scrolls under the held pointer', () => {
    const { viewport, rows } = renderHistory();
    setRect(viewport, 0, 80);
    setRect(rows[0], 0, 40);
    setRect(rows[1], 40, 40);
    setRect(rows[2], 80, 40);

    fireEvent.pointerDown(rows[0], pointer(10));

    setRect(rows[0], -40, 40);
    setRect(rows[1], 0, 40);
    setRect(rows[2], 40, 40);
    act(() => {
      viewport.dispatchEvent(new Event('scroll'));
    });

    expect(selectedKeys()).toEqual([1, 2]);
  });

  it('clears the selection when the press is not on a row', () => {
    const { rows } = renderHistory();
    setRect(rows[0], 0, 40);
    const viewport = rows[0].closest(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    setRect(viewport, 0, 200);

    fireEvent.pointerDown(rows[0], pointer(10));
    fireEvent.pointerUp(rows[0], pointer(10, 0));
    fireEvent.pointerDown(rows[0].parentElement as HTMLElement, pointer(0));

    expect(selectedKeys()).toEqual([]);
  });
});
