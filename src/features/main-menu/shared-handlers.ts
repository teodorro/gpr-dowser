import { loadDataFile } from '@/file-parsers/load-data-file';
import { exportChartToSvg } from '@/features/export/export-chart-to-svg';
import { dataSliceStores } from '@/stores/data-slice-stores';
import {
  BSCAN_CHART_ROOT_ID,
  CMP_SEMBLANCE_CHART_ROOT_ID,
} from '@/features/export/export-consts';

export const loadFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
  const input = event.target;
  if (input.files) {
    Array.from(input.files).forEach((file) => {
      loadDataFile(file);
    });
  }
  input.value = '';
};

const exportChart = (
  rootId: string,
  selectedFileId: string | undefined,
  fallbackName: string,
) => {
  const root = document.getElementById(rootId);
  const name = selectedFileId
    ? dataSliceStores.get(selectedFileId)?.getState().name
    : undefined;
  exportChartToSvg(root, name || fallbackName);
};

export const exportBScanHandler = (selectedFileId?: string) =>
  exportChart(BSCAN_CHART_ROOT_ID, selectedFileId, 'bscan');

export const exportSemblanceAnalysisHandler = (selectedFileId?: string) =>
  exportChart(CMP_SEMBLANCE_CHART_ROOT_ID, selectedFileId, 'cmp-semblance');
