import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { OperationTypeList } from '@/stores/undo-redo.types';
import {
  ArrowRightIcon,
  ClipboardPasteIcon,
  RedoIcon,
  UndoIcon,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import subtractMean from '../processing/statistical-processing/subtract-avg/subtract-mean';
import subtractMedian from '../processing/statistical-processing/subtract-avg/subtract-median';
import dewow from '../processing/statistical-processing/dewow/dewow';
import { unreachable } from '@/shared/unreachable';
import { splitBscan } from '@/features/b-scan/splitBscan';
import { alignSignal } from '../сmp/align-signal';

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

  const viewportRef = useRef<HTMLDivElement>(null);

  const replayTo = (target: number) => {
    let bScan = bScanInitial.clone();
    for (let i = 1; i <= target; i++) {
      const operation = history.get(i);
      if (!operation) {
        continue;
      }
      switch (operation.type) {
        case OperationTypeList.SubtractMean:
          bScan = subtractMean(bScan);
          break;
        case OperationTypeList.SubtractMedian:
          bScan = subtractMedian(bScan);
          break;
        case OperationTypeList.Dewow:
          bScan = dewow(bScan, operation.windowSize);
          break;
        case OperationTypeList.SplitBscan:
          [bScan] = splitBscan(
            bScan,
            operation.splitIndex,
            operation.leftDataSliceId,
            operation.rightDataSliceId,
          );
          break;
        case OperationTypeList.CmpAlignSignal:
          bScan = alignSignal(bScan, operation.ampBreakpoint);
          break;
        default:
          unreachable(operation);
      }
    }
    return bScan;
  };

  const handleUndo = () => {
    const bScan = replayTo(position - 1);
    undo();
    setBScan(bScan);
  };

  const handleRedo = () => {
    const bScan = replayTo(position + 1);
    redo();
    setBScan(bScan);
  };

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [history.size, position]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={position === 0}
          onClick={handleUndo}
        >
          <UndoIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={position === history.size}
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
