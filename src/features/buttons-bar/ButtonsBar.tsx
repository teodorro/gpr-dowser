import { Button } from '@/components/ui/button';
import {
  ArrowUpWideNarrowIcon,
  FolderOpenIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  UnfoldHorizontalIcon,
} from 'lucide-react';
import { BScanMode, useUiStore } from '@/stores/ui-store';
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

export default function ButtonsBar() {
  const { t } = useTranslation();
  const {
    aScanVisible,
    cmpMode,
    sideBarVisible,
    splitBScanMode,
    setAScanVisible,
    setBScanMode,
    setSideBarVisible,
  } = useUiStore();
  const selectedPalette = useVisualStore.use.selectedPalette();
  const setSelectedPalette = useVisualStore.use.setSelectedPalette();

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
            onClick={() =>
              setBScanMode(splitBScanMode ? BScanMode.none : BScanMode.split)
            }
            className={splitBScanMode ? 'border-primary border-2' : ''}
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
