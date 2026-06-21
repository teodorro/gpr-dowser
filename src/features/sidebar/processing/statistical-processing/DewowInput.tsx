import { useMemo, useState } from 'react';
import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { FieldError, FieldLabel } from '@/components/ui/field';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { WavesHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dewow } from './dewow';
import { useStore } from 'zustand';

const DEFAULT_WINDOW_SIZE = '11';

const isIntegerInput = (value: string): boolean => {
  return value === '' || /^\d+$/.test(value);
};

const isValidWindowSize = (value: string, ascanLength: number): boolean => {
  if (value === '') return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= 3 && n % 2 === 1 && n <= ascanLength;
};

export default function DewowInput() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <DewowInternal key={selectedFileId} store={store} />;
}

function DewowInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);

  const [internalWindowSize, setInternalWindowSize] =
    useState<string>(DEFAULT_WINDOW_SIZE);
  const [showError, setShowError] = useState(false);

  const isWindowSizeValid = useMemo(
    () => isValidWindowSize(internalWindowSize, bScan.rows),
    [internalWindowSize, bScan.rows],
  );

  const handleDewowSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isWindowSizeValid) {
      setShowError(true);
      return;
    }
    setBScan(dewow(bScan, Number(internalWindowSize)));
  };

  return (
    <form
      className="flex flex-row justify-between"
      onSubmit={handleDewowSubmit}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row">
          <Button variant="outline" disabled={!isWindowSizeValid} type="submit">
            <WavesHorizontalIcon />
          </Button>
          <FieldLabel className="shrink-0 w-24 ml-2" htmlFor="dewow">
            {t('Dewow')}
          </FieldLabel>
        </div>
        <div className="flex flex-row w-54">
          {showError && !isWindowSizeValid && (
            <FieldError>{t('DewowWindowSizeInvalid')}</FieldError>
          )}
        </div>
      </div>
      <Input
        id="dewow"
        type="number"
        min={3}
        step={2}
        inputMode="numeric"
        value={internalWindowSize}
        aria-invalid={showError && !isWindowSizeValid}
        onKeyDown={(e) => {
          if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text');
          if (!isIntegerInput(pasted)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const v = e.target.value;
          if (isIntegerInput(v)) {
            setInternalWindowSize(v);
            setShowError(false);
          }
        }}
        onBlur={() => {
          setShowError(true);
        }}
        className="min-w-0 flex-1 max-w-24"
      />
    </form>
  );
}
