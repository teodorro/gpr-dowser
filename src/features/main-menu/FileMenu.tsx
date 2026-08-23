import {
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { MenubarContent } from '@/components/ui/menubar';
import { useTranslation } from 'react-i18next';
import { exportChartToSvg } from '@/features/export/export-chart-to-svg';
import { dataSliceStores } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import {
  BSCAN_CHART_ROOT_ID,
  CMP_SEMBLANCE_CHART_ROOT_ID,
} from '../export/export-consts';

export default function FileMenu() {
  const { t } = useTranslation();

  const selectedFileId = useFileRegistryStore.use.selectedFileId();

  const handleExportBScan = () => {
    const root = document.getElementById(BSCAN_CHART_ROOT_ID);
    const name = selectedFileId
      ? dataSliceStores.get(selectedFileId)?.getState().name
      : undefined;
    exportChartToSvg(root, name || 'bscan');
  };

  const handleExportSemblanceAnalysis = () => {
    const root = document.getElementById(CMP_SEMBLANCE_CHART_ROOT_ID);
    const name = selectedFileId
      ? dataSliceStores.get(selectedFileId)?.getState().name
      : undefined;
    exportChartToSvg(root, name || 'cmp-semblance');
  };

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
            <MenubarItem onClick={handleExportBScan}>
              {t('ExportBScan')}
            </MenubarItem>
          </MenubarGroup>
          <MenubarGroup>
            <MenubarItem onClick={handleExportSemblanceAnalysis}>
              {t('ExportSemblanceAnalysis')}
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
