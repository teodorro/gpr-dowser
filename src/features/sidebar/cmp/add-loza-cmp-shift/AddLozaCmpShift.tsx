import { Button } from '@/components/ui/button';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { AngleIcon, ChartBarDecreasingIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { runOperation } from '@/features/operations/apply-operation';
import useUiStore from '@/stores/ui-store';
import { OperationTypeList } from '@/stores/undo-redo.types';
import { FieldLabel } from '@/components/ui/field';

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

  const dx = useStore(store, (s) => s.dx);
  const dt = useStore(store, (s) => s.dt);
  const lozaMode = useStore(store, (s) => s.lozaMode);

  const setLozaMode = useStore(store, (s) => s.setLozaMode);
  const operationsBusy = useUiStore.use.operationsBusy();

  const handleAddShiftClick = () => {
    void runOperation(store, {
      type: OperationTypeList.AddLozaCmpShift,
      dx,
      dt,
    });
  };

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex flex-row items-center">
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
        <FieldLabel className="shrink-0 w-48 ml-2" htmlFor="loza-mode">
          {t('LozaMode')}
        </FieldLabel>
      </div>

      {lozaMode && (
        <div className="flex flex-row items-center">
          <Button
            variant="outline"
            size="icon"
            disabled={operationsBusy}
            onClick={(e) => {
              e.preventDefault();
              handleAddShiftClick();
            }}
          >
            <ChartBarDecreasingIcon className="w-4 h-4 rotate-90" />
          </Button>
          <FieldLabel
            className="shrink-0 w-48 ml-2"
            htmlFor="add-loza-cmp-shift"
          >
            {t('AddLozaCmpShift')}
          </FieldLabel>
        </div>
      )}
    </div>
  );
}
