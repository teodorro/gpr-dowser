import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CMP_COLUMNS_BREAKPOINT } from '@/shared/constants';
import { dataSliceStores } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { BScanMode } from '@/stores/ui-store';
import useUiStore from '@/stores/ui-store';
import { XIcon } from 'lucide-react';

type Props = {
  id: string;
  label: string;
};

export default function FileTab({ id, label }: Props) {
  const closeTab = useFileRegistryStore.use.removeFile();
  const selectedFileId = useFileRegistryStore.use.selectedFileId();

  const setBScanMode = useUiStore.use.setBScanMode();
  const cmpMode = useUiStore.use.cmpMode();

  const isSelected = id === selectedFileId;

  const getShortLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
  };

  const selectFile = useFileRegistryStore.use.selectFile();

  return (
    <div
      className={cn(
        'flex items-center rounded-md border border-ring',
        isSelected ? 'border-primary border-2' : 'bg-secondary',
      )}
    >
      <Button
        variant="ghost"
        className="border-0"
        onClick={() => {
          if (cmpMode) {
            const bScanCols =
              dataSliceStores.get(id)?.getState().bScan.cols ?? 0;
            if (bScanCols > CMP_COLUMNS_BREAKPOINT) {
              setBScanMode(BScanMode.none);
            }
          }
          selectFile(id);
        }}
      >
        <span className="truncate">{getShortLabel(label, 20)}</span>
      </Button>
      <Button
        variant="ghost"
        className="border-0"
        size="icon"
        onClick={() => {
          if (cmpMode) {
            setBScanMode(BScanMode.none);
          }
          closeTab(id);
        }}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
