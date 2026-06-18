import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import useVisualStore from '@/stores/visual-store';
import { PaletteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ImageMenu() {
  const { t } = useTranslation();

  const selectedPalette = useVisualStore.use.selectedPalette();
  const setSelectedPalette = useVisualStore.use.setSelectedPalette();

  return (
    <MenubarMenu>
      <MenubarTrigger>{t('Image')}</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarSub>
            <MenubarSubTrigger>
              <PaletteIcon className="w-4 h-4" />
              {t('Palette')}
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                className={
                  selectedPalette === 'greys' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('greys')}
              >
                {t('Greys')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'viridis' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('viridis')}
              >
                {t('Viridis')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'turbo' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('turbo')}
              >
                {t('Turbo')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'spectral' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('spectral')}
              >
                {t('Spectral')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'cubehelix' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('cubehelix')}
              >
                {t('Cubehelix')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'magma' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('magma')}
              >
                {t('Magma')}
              </MenubarItem>
              <MenubarItem
                className={
                  selectedPalette === 'rainbow' ? 'border border-ring' : ''
                }
                onClick={() => setSelectedPalette('rainbow')}
              >
                {t('Rainbow')}
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  );
}
