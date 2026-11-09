import { useEffect, useRef } from 'react';
import Grid2D from '@/shared/grid2d';
import type { DataStore } from '@/stores/data-slice-stores';
import useUiStore from '@/stores/ui-store';
import type { DataContainer, UndoRedoMessage } from './undo-redo-worker';

export function useUndoRedo(store: DataStore) {
  const addProgress = useUiStore.use.addProgress();
  const clearProgress = useUiStore.use.clearProgress();
  const setInProgress = useUiStore.use.setInProgress();

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('./undo-redo-worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (e: MessageEvent<UndoRedoMessage>) => {
      const { history, setBScan, undo, redo } = store.getState();
      switch (e.data.type) {
        case 'progress':
          addProgress(e.data.progress);
          break;
        case 'complete':
          if (e.data.operationType === 'undo') {
            undo();
          } else {
            redo();
          }
          setBScan(
            new Grid2D(
              e.data.result.cols,
              e.data.result.rows,
              e.data.result.buf,
            ),
          );
          setInProgress(false);
          clearProgress();
          break;
        case 'split-bscan': {
          const [left] = new Grid2D(
            e.data.result.cols,
            e.data.result.rows,
            e.data.result.buf,
          ).split(e.data.operation.splitIndex);
          worker.postMessage({
            bScan: left,
            history,
            start: e.data.start + 1,
            target: e.data.target,
            operationType: e.data.operationType,
          });
          break;
        }
      }
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [store, addProgress, clearProgress, setInProgress]);

  const replayTo = (
    target: number,
    operationType: DataContainer['operationType'],
  ) => {
    const { bScanInitial, history } = store.getState();
    workerRef.current?.postMessage({
      bScan: bScanInitial,
      history,
      start: 1,
      target,
      operationType,
    });
  };

  return {
    handleUndo: () => replayTo(store.getState().position - 1, 'undo'),
    handleRedo: () => replayTo(store.getState().position + 1, 'redo'),
  };
}
