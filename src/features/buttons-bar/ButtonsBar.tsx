import { Button } from '@/components/ui/button';
import {
  ArrowUpWideNarrowIcon,
  FolderOpenIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  RedoIcon,
  UndoIcon,
  UnfoldHorizontalIcon,
} from 'lucide-react';
import { BScanMode } from '@/stores/ui-store';
import useUiStore from '@/stores/ui-store';
import useVisualStore from '@/stores/visual-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useEffect, useRef } from 'react';
import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { useStore } from 'zustand';
import type { UndoRedoMessage } from '../sidebar/undo-redo/undo-redo-worker';
import Grid2D from '@/shared/grid2d';

export default function ButtonsBar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <ButtonsBarInternal key={selectedFileId} store={store} />;
}

function ButtonsBarInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const {
    aScanVisible,
    cmpMode,
    sideBarVisible,
    splitBScanMode,
    inProgress,
    addProgress,
    clearProgress,
    setInProgress,
    setAScanVisible,
    setBScanMode,
    setSideBarVisible,
  } = useUiStore();
  const selectedPalette = useVisualStore.use.selectedPalette();
  const setSelectedPalette = useVisualStore.use.setSelectedPalette();

  const history = useStore(store, (state) => state.history);
  const position = useStore(store, (state) => state.position);
  const undo = useStore(store, (state) => state.undo);
  const redo = useStore(store, (state) => state.redo);
  const bScanInitial = useStore(store, (state) => state.bScanInitial);
  const setBScan = useStore(store, (state) => state.setBScan);

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
    undoRedoWorker.current = new Worker(
      new URL('../sidebar/undo-redo/undo-redo-worker.ts', import.meta.url),
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
    <div className="flex flex-row gap-1 p-1">
      <div
        className="flex flex-row gap-1"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <FolderOpenIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('OpenFile')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSideBarVisible(!sideBarVisible)}
          >
            <PanelLeftIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{sideBarVisible ? t('HideSideBar') : t('ShowSideBar')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAScanVisible(!aScanVisible)}
          >
            <PanelRightIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{aScanVisible ? t('HideAScan') : t('ShowAScan')}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPalette('greys')}
              >
                <PaletteIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('Palette')}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem
            className={selectedPalette === 'greys' ? 'border border-ring' : ''}
            onClick={() => setSelectedPalette('greys')}
          >
            {t('Greys')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={selectedPalette === 'turbo' ? 'border border-ring' : ''}
            onClick={() => setSelectedPalette('turbo')}
          >
            {t('Turbo')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'rainbow' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('rainbow')}
          >
            {t('Rainbow')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'sinebow' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('sinebow')}
          >
            {t('Sinebow')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'spectral' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('spectral')}
          >
            {t('Spectral')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'viridis' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('viridis')}
          >
            {t('Viridis')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={selectedPalette === 'magma' ? 'border border-ring' : ''}
            onClick={() => setSelectedPalette('magma')}
          >
            {t('Magma')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'cubehelix' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('cubehelix')}
          >
            {t('Cubehelix')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={position === 0 || inProgress}
          >
            <UndoIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Undo')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={position === history.size || inProgress}
          >
            <RedoIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Redo')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setBScanMode(splitBScanMode ? BScanMode.none : BScanMode.split)
            }
            disabled={inProgress}
            className={
              splitBScanMode
                ? 'border-primary border-2'
                : inProgress
                  ? 'opacity-50'
                  : ''
            }
          >
            <UnfoldHorizontalIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('SplitBScanMode')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setBScanMode(cmpMode ? BScanMode.none : BScanMode.cmp)
            }
            className={cmpMode ? 'border-primary border-2' : ''}
          >
            <ArrowUpWideNarrowIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('CmpMode')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
