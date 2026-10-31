import {
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { MenubarContent } from '@/components/ui/menubar';
import { useTranslation } from 'react-i18next';
import useFileRegistryStore from '@/stores/file-registry-store';
import useUiStore from '@/stores/ui-store';
import {
  exportBScanHandler,
  exportSemblanceAnalysisHandler,
} from './shared-handlers';

export default function FileMenu() {
  const { t } = useTranslation();

  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const cmpMode = useUiStore.use.cmpMode();

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger>{t('File')}</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {t('OpenFile')}
            </MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem onClick={() => exportBScanHandler(selectedFileId)}>
              {t('ExportBScan')}
            </MenubarItem>
          </MenubarGroup>
          <MenubarGroup>
            <MenubarItem
              onClick={() => exportSemblanceAnalysisHandler(selectedFileId)}
              disabled={!cmpMode}
              className={!cmpMode ? 'text-muted-foreground' : ''}
            >
              {t('ExportSemblanceAnalysis')}
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
