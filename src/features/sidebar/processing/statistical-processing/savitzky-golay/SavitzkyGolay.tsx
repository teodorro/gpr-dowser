import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { AudioWaveformIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { runOperation } from '@/features/operations/apply-operation';
import useUiStore from '@/stores/ui-store';
import { OperationTypeList } from '@/stores/undo-redo.types';

export default function SavitzkyGolay() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <SavitzkyGolayInternal key={selectedFileId} store={store} />;
}

function SavitzkyGolayInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const operationsBusy = useUiStore.use.operationsBusy();

  const [horizontalWindowSize, setHorizontalWindowSize] = useState<string>('7');
  const [verticalWindowSize, setVerticalWindowSize] = useState<string>('7');
  const horizontalPolynomialSize = 3;
  const verticalPolynomialSize = 3;

  const handleSmoothSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void runOperation(store, {
      type: OperationTypeList.SavitzkyGolay,
      horizontalWindowSize: Number(horizontalWindowSize),
      horizontalPolynomialSize: Number(horizontalPolynomialSize),
      verticalWindowSize: Number(verticalWindowSize),
      verticalPolynomialSize: Number(verticalPolynomialSize),
    });
  };

  return (
    <form
      className="flex flex-row justify-between"
      onSubmit={handleSmoothSubmit}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center">
          <Button
            variant="outline"
            size="icon"
            type="submit"
            disabled={operationsBusy}
            className="shrink-0"
          >
            <AudioWaveformIcon />
          </Button>
          <FieldLabel className="shrink-0 ml-2">
            {t('SavitzkyGolay')}
          </FieldLabel>
        </div>
        <div className="flex flex-row items-center">
          <FieldLabel className="shrink-0 w-32 ml-2">
            {t('Horizontal')}
          </FieldLabel>
          <div className="flex flex-col gap-2 mx-1">
            <FieldLabel
              className="shrink-0 ml-2"
              htmlFor="sg-horizontal-window"
            >
              {t('WindowSize')}
            </FieldLabel>
            <Input
              id="sg-horizontal-window"
              type="number"
              min={5}
              step={2}
              inputMode="numeric"
              value={horizontalWindowSize}
              onChange={(e) => {
                setHorizontalWindowSize(e.target.value);
              }}
              className="min-w-0 flex-1 max-w-24"
            />
          </div>
          {/* <div className="flex flex-col gap-2 mx-1">
            <FieldLabel
              className="shrink-0 ml-2"
              htmlFor="sg-horizontal-polynomial"
            >
              {t('PolynomialSize')}
            </FieldLabel>
            <Input
              id="sg-horizontal-polynomial"
              type="number"
              min={3}
              step={2}
              inputMode="numeric"
              value={horizontalPolynomialSize}
              onChange={(e) => {
                setHorizontalPolynomialSize(e.target.value);
              }}
              className="min-w-0 flex-1 max-w-24"
            />
          </div> */}
        </div>
        <div className="flex flex-row items-center">
          <FieldLabel className="shrink-0 w-32 ml-2">
            {t('Vertical')}
          </FieldLabel>
          <div className="flex flex-col gap-2 mx-1">
            <FieldLabel className="shrink-0 ml-2" htmlFor="sg-vertical-window">
              {t('WindowSize')}
            </FieldLabel>
            <Input
              id="sg-vertical-window"
              type="number"
              min={5}
              step={2}
              inputMode="numeric"
              value={verticalWindowSize}
              onChange={(e) => {
                setVerticalWindowSize(e.target.value);
              }}
              className="min-w-0 flex-1 max-w-24"
            />
          </div>
          {/* <div className="flex flex-col gap-2 mx-1">
            <FieldLabel
              className="shrink-0 ml-2"
              htmlFor="sg-vertical-polynomial"
            >
              {t('PolynomialSize')}
            </FieldLabel>
            <Input
              id="sg-vertical-polynomial"
              type="number"
              min={3}
              step={2}
              inputMode="numeric"
              value={verticalPolynomialSize}
              onChange={(e) => {
                setVerticalPolynomialSize(e.target.value);
              }}
              className="min-w-0 flex-1 max-w-24"
            />
          </div> */}
        </div>
      </div>
    </form>
  );
}
