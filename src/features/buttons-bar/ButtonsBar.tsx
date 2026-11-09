import { Button } from '@/components/ui/button';
import {
  ArrowUpWideNarrowIcon,
  DownloadIcon,
  DraftingCompassIcon,
  FolderOpenIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  RedoIcon,
  RollerCoasterIcon,
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
import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { useStore } from 'zustand';
import { useUndoRedo } from '../sidebar/undo-redo/use-undo-redo';
import { Separator } from '@/components/ui/separator';
import {
  exportBScanHandler,
  exportSemblanceAnalysisHandler,
} from '../main-menu/shared-handlers';

export default function ButtonsBar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store || !selectedFileId) {
    return null;
  }
  return (
    <ButtonsBarInternal
      key={selectedFileId}
      store={store}
      selectedFileId={selectedFileId}
    />
  );
}

function ButtonsBarInternal({
  store,
  selectedFileId,
}: {
  store: DataStore;
  selectedFileId: string;
}) {
  const { t } = useTranslation();
  const {
    aScanVisible,
    cmpMode,
    hyperbolaMode,
    reliefMode,
    selectMode,
    sideBarVisible,
    splitBScanMode,
    inProgress,
    setAScanVisible,
    setBScanMode,
    setSideBarVisible,
  } = useUiStore();
  const selectedPalette = useVisualStore.use.selectedPalette();
  const setSelectedPalette = useVisualStore.use.setSelectedPalette();

  const history = useStore(store, (state) => state.history);
  const position = useStore(store, (state) => state.position);
  const { handleUndo, handleRedo } = useUndoRedo(store);

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

      {cmpMode ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <DownloadIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Export')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => exportBScanHandler(selectedFileId)}
            >
              {t('ExportBScan')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportSemblanceAnalysisHandler(selectedFileId)}
            >
              {t('ExportSemblanceAnalysis')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => exportBScanHandler(selectedFileId)}
            >
              <DownloadIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('ExportBScan')}</p>
          </TooltipContent>
        </Tooltip>
      )}

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

      <Separator orientation="vertical" className="w-1" />

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

      <Separator orientation="vertical" className="w-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setBScanMode(selectMode ? BScanMode.none : BScanMode.select)
            }
            className={selectMode ? 'border-primary border-2' : ''}
          >
            <MousePointerClickIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('SelectMode')}</p>
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setBScanMode(hyperbolaMode ? BScanMode.none : BScanMode.hyperbola)
            }
            className={hyperbolaMode ? 'border-primary border-2' : ''}
          >
            <DraftingCompassIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('HyperbolaMode')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setBScanMode(reliefMode ? BScanMode.none : BScanMode.relief)
            }
            className={reliefMode ? 'border-primary border-2' : ''}
          >
            <RollerCoasterIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('ReliefMode')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
