import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import useUiStore from '@/stores/ui-store';
import type { Operation } from '@/stores/undo-redo.types';
import {
  ArrowRightIcon,
  ClipboardPasteIcon,
  RedoIcon,
  UndoIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import {
  historyKeyAtClientY,
  scrollDeltaForEdge,
  selectionIncludes,
  type HistorySelection,
} from './history-drag-select';
import { useUndoRedo } from './use-undo-redo';
import { transferOperations } from '@/features/operations/apply-operation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

type Drag = {
  pointerId: number;
  anchor: number;
  clientY: number;
};

function UndoRedoInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const history = useStore(store, (state) => state.history);
  const position = useStore(store, (state) => state.position);

  const inProgress = useUiStore.use.inProgress();
  const operationsBusy = useUiStore.use.operationsBusy();

  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const fileIds = useFileRegistryStore.use.fileIds();

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const autoScrollRef = useRef<number | null>(null);
  const syncSelectionRef = useRef<() => void>(() => {});
  const stepAutoScrollRef = useRef<() => void>(() => {});

  const [selection, setSelection] = useState<HistorySelection | null>(null);

  const selectedOperations = useMemo(() => {
    const selected = new Map<number, Operation>();
    if (!selection) return selected;
    const lo = Math.min(selection.anchor, selection.focus);
    const hi = Math.max(selection.anchor, selection.focus);
    for (let key = lo; key <= hi; key += 1) {
      const operation = history.get(key);
      if (operation) selected.set(key, operation);
    }
    return selected;
  }, [history, selection]);

  const { handleUndo, handleRedo } = useUndoRedo(store);

  const files = useMemo(() => {
    const vals = fileIds.map((id) => ({
      id,
      label: dataSliceStores.get(id)?.getState().name ?? '',
    }));
    return vals;
  }, [fileIds]);

  const stopAutoScroll = () => {
    if (autoScrollRef.current == null) return;
    cancelAnimationFrame(autoScrollRef.current);
    autoScrollRef.current = null;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    stopAutoScroll();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const row = rowFromEvent(event);
    if (!row) {
      setSelection(null);
      return;
    }
    const key = Number(row.dataset.historyKey);
    if (!Number.isInteger(key)) return;
    event.preventDefault();
    stopAutoScroll();
    dragRef.current = {
      pointerId: event.pointerId,
      anchor: key,
      clientY: event.clientY,
    };
    setSelection({ anchor: key, focus: key });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.buttons === 0) {
      endDrag(event);
      return;
    }
    drag.clientY = event.clientY;
    syncSelectionRef.current();
    const viewport = viewportRef.current;
    if (!viewport || scrollDeltaForEdge(viewport, event.clientY) === 0) return;
    if (autoScrollRef.current != null) return;
    autoScrollRef.current = requestAnimationFrame(() => {
      stepAutoScrollRef.current();
    });
  };

  const copyOperationsToAnotherRadargram = (fileId: string) => {
    const fileStore = dataSliceStores.get(fileId);
    if (!fileStore) return;

    const operations = [...selectedOperations.values()];
    transferOperations(fileStore, operations).then((applied) => {
      if (applied > 0) {
        toast.success(
          `${t('OperationsTransferred')}: ${applied} / ${operations.length}`,
        );
      }
    });
  };

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [history.size, position]);

  useEffect(() => {
    const extendToPointer = () => {
      const drag = dragRef.current;
      const viewport = viewportRef.current;
      if (!drag || !viewport) return;
      const key = historyKeyAtClientY(viewport, drag.clientY);
      if (key == null) return;
      setSelection((current) =>
        current && current.anchor === drag.anchor && current.focus === key
          ? current
          : { anchor: drag.anchor, focus: key },
      );
    };

    const stopAutoScroll = () => {
      if (autoScrollRef.current == null) return;
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    };

    stepAutoScrollRef.current = () => {
      const drag = dragRef.current;
      const viewport = viewportRef.current;
      if (!drag || !viewport) {
        autoScrollRef.current = null;
        return;
      }
      const delta = scrollDeltaForEdge(viewport, drag.clientY);
      const maxScroll = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight,
      );
      if (delta === 0 || maxScroll <= 0) {
        autoScrollRef.current = null;
        return;
      }
      const next = Math.min(maxScroll, Math.max(0, viewport.scrollTop + delta));
      if (next === viewport.scrollTop) {
        autoScrollRef.current = null;
        return;
      }
      viewport.scrollTop = next;
      extendToPointer();
      autoScrollRef.current = requestAnimationFrame(() => {
        stepAutoScrollRef.current();
      });
    };

    syncSelectionRef.current = extendToPointer;

    const viewport = viewportRef.current;
    const onScroll = () => {
      if (!dragRef.current) return;
      extendToPointer();
    };
    viewport?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      viewport?.removeEventListener('scroll', onScroll);
      stopAutoScroll();
      dragRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={position === 0 || inProgress || operationsBusy}
          onClick={handleUndo}
        >
          <UndoIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={position === history.size || inProgress || operationsBusy}
          onClick={handleRedo}
        >
          <RedoIcon className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={operationsBusy}>
                  <ClipboardPasteIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('CopyOperationsToAnotherRadargram')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            {files
              .filter((file) => file.id !== selectedFileId)
              .map((file) => (
                <DropdownMenuItem
                  key={file.id}
                  onClick={() => {
                    copyOperationsToAnotherRadargram(file.id);
                  }}
                >
                  <p>{file.label}</p>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea
        viewportRef={viewportRef}
        className="max-h-48 w-full rounded-md border"
      >
        <div
          className="min-h-full cursor-default touch-none p-4 select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {[...history.entries()].map(([key, operation]) => {
            const selected = selectionIncludes(selection, key);
            return (
              <div key={key} data-history-key={key}>
                <div
                  data-selected={selected || undefined}
                  className={cn(
                    'flex flex-row items-center gap-2 rounded-sm px-1 py-0.5',
                    selected && 'bg-accent text-accent-foreground',
                  )}
                >
                  <div className="w-4 shrink-0">
                    {key === position && <ArrowRightIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-sm">
                    {t(`${operation.type.toString()}`)}
                  </div>
                </div>
                <Separator className="my-2" />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function rowFromEvent(event: PointerEvent<HTMLDivElement>) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const row = target.closest<HTMLElement>('[data-history-key]');
  if (!row || !event.currentTarget.contains(row)) return null;
  return row;
}
