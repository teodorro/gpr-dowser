import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import {
  ArrowRightIcon,
  ClipboardPasteIcon,
  RedoIcon,
  UndoIcon,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import useUiStore from '@/stores/ui-store';
import type { UndoRedoMessage } from './undo-redo-worker';
import Grid2D from '@/shared/grid2d';

export default function UndoRedo() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <UndoRedoInternal key={selectedFileId} store={store} />;
}

function UndoRedoInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const history = useStore(store, (state) => state.history);
  const position = useStore(store, (state) => state.position);
  const undo = useStore(store, (state) => state.undo);
  const redo = useStore(store, (state) => state.redo);

  const bScanInitial = useStore(store, (state) => state.bScanInitial);
  const setBScan = useStore(store, (state) => state.setBScan);

  const inProgress = useUiStore.use.inProgress();
  const addProgress = useUiStore.use.addProgress();
  const clearProgress = useUiStore.use.clearProgress();
  const setInProgress = useUiStore.use.setInProgress();

  const viewportRef = useRef<HTMLDivElement>(null);

  const undoRedoWorker = useRef<Worker | null>(null);

  const handleUndo = () => {
    undoRedoWorker.current?.postMessage({
      bScan: bScanInitial,
      history,
      target: position - 1,
      operationType: 'undo',
    });
  };

  const handleRedo = () => {
    undoRedoWorker.current?.postMessage({
      bScan: bScanInitial,
      history,
      target: position + 1,
      operationType: 'redo',
    });
  };

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [history.size, position]);

  useEffect(() => {
    undoRedoWorker.current = new Worker(
      new URL('./undo-redo-worker.ts', import.meta.url),
      { type: 'module' },
    );
    undoRedoWorker.current.onmessage = (e: MessageEvent<UndoRedoMessage>) => {
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
      }
    };
    return () => {
      undoRedoWorker.current?.terminate();
      undoRedoWorker.current = null;
    };
  }, [addProgress, clearProgress, setBScan, setInProgress, undo, redo]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={position === 0 || inProgress}
          onClick={handleUndo}
        >
          <UndoIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={position === history.size || inProgress}
          onClick={handleRedo}
        >
          <RedoIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <ClipboardPasteIcon className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea
        viewportRef={viewportRef}
        className="max-h-48 w-full rounded-md border"
      >
        <div className="p-4">
          {[...history.entries()].map(([key, operation]) => (
            <React.Fragment key={key}>
              <div className="flex flex-row gap-2">
                <div>
                  {key === position && <ArrowRightIcon className="w-4 h-4" />}
                </div>
                <div className="text-sm">
                  {t(`${operation.type.toString()}`)}
                </div>
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
