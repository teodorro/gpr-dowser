import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { AngleIcon, ChartBarDecreasingIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import addLozaShift from './add-loza-shift';
import { OperationTypeList } from '@/stores/undo-redo.types';

export default function AddLozaCmpShift() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <AddLozaCmpShiftInternal store={store} />;
}

function AddLozaCmpShiftInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const bScan = useStore(store, (s) => s.bScan);
  const dx = useStore(store, (s) => s.dx);
  const dt = useStore(store, (s) => s.dt);
  const lozaMode = useStore(store, (s) => s.lozaMode);

  const setLozaMode = useStore(store, (s) => s.setLozaMode);
  const setBScan = useStore(store, (s) => s.setBScan);
  const addOperation = useStore(store, (s) => s.addOperation);

  const handleAddShiftClick = () => {
    const newBScan = addLozaShift(bScan, dx, dt);
    setBScan(newBScan);
    addOperation({ type: OperationTypeList.AddLozaCmpShift, dx, dt });
  };

  return (
    <div className="flex flex-row gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              setLozaMode(!lozaMode);
            }}
            className={
              lozaMode ? 'border-2 border-primary dark:border-primary' : ''
            }
          >
            <AngleIcon className="w-4 h-4 rotate-135" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('LozaMode')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          {lozaMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                handleAddShiftClick();
              }}
            >
              <ChartBarDecreasingIcon className="w-4 h-4 rotate-90" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('AddLozaCmpShift')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
