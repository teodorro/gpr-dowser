import { Button } from '@/components/ui/button';
import {
  FolderOpenIcon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import useVisualStore from '@/stores/visual-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export default function ButtonsBar() {
  const { t } = useTranslation();
  const { sideBarVisible, setSideBarVisible, aScanVisible, setAScanVisible } =
    useUiStore();
  const selectedPalette = useVisualStore.use.selectedPalette();
  const setSelectedPalette = useVisualStore.use.setSelectedPalette();
  return (
    <div className="flex flex-row gap-1 p-1">
      <div
        className="flex flex-row gap-1"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Button variant="ghost" size="icon">
          <FolderOpenIcon className="w-4 h-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSideBarVisible(!sideBarVisible)}
      >
        <PanelLeftIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAScanVisible(!aScanVisible)}
      >
        <PanelRightIcon className="w-4 h-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPalette('greys')}
          >
            <PaletteIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className={selectedPalette === 'greys' ? 'border border-ring' : ''}
            onClick={() => setSelectedPalette('greys')}
          >
            {t('Greys')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              selectedPalette === 'cubehelix' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('cubehelix')}
          >
            {t('Cubehelix')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={selectedPalette === 'turbo' ? 'border border-ring' : ''}
            onClick={() => setSelectedPalette('turbo')}
          >
            {t('Turbo')}
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
              selectedPalette === 'sinebow' ? 'border border-ring' : ''
            }
            onClick={() => setSelectedPalette('sinebow')}
          >
            {t('Sinebow')}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
