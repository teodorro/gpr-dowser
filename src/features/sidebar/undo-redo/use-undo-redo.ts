import type { DataStore } from '@/stores/data-slice-stores';

export function useUndoRedo(store: DataStore) {
  const replayTo = (target: number, operationType: 'undo' | 'redo') => {
    const { history, setBScan, undo, redo, bScanInitial } = store.getState();

    const operation = history.get(target);
    if (target === 0 && operationType === 'undo') {
      setBScan(bScanInitial);
      undo();
      return;
    }
    if (!operation) {
      return;
    }

    if (operationType === 'undo') {
      setBScan(operation.snapshot);
      undo();
    } else {
      setBScan(operation.snapshot);
      redo();
    }
  };

  return {
    handleUndo: () => replayTo(store.getState().position - 1, 'undo'),
    handleRedo: () => replayTo(store.getState().position + 1, 'redo'),
  };
}
