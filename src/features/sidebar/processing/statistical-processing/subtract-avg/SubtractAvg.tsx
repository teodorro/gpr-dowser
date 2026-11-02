import { Label } from '@/components/ui/label';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ListMinusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type Grid2D from '@/shared/grid2d';
import subtractMean from './subtract-mean';
import subtractMedian from './subtract-median';
import { useStore } from 'zustand';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/ui/field';

const DEFAULT_WINDOW_SIZE = '25';

const isIntegerInput = (value: string): boolean => {
  return value === '' || /^\d+$/.test(value);
};

const isValidWindowSize = (value: string, bscanLength: number): boolean => {
  if (value === '') return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= bscanLength;
};

export default function SubtractAvg() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <SubtractAvgInternal key={selectedFileId} store={store} />;
}

function SubtractAvgInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const [selectedOption, setSelectedOption] = useState<'median' | 'mean'>(
    'median',
  );

  const [internalWindowSize, setInternalWindowSize] =
    useState<string>(DEFAULT_WINDOW_SIZE);
  const [showError, setShowError] = useState(false);

  const isWindowSizeValid = useMemo(
    () => isValidWindowSize(internalWindowSize, bScan.cols),
    [internalWindowSize, bScan.cols],
  );

  const windowSize = Number(internalWindowSize);
  const isOverMax = internalWindowSize !== '' && windowSize > bScan.cols;
  const windowSizeError = isOverMax
    ? t('subtractAvgWindowSizeTooLarge')
    : t('subtractAvgWindowSizeInvalid');

  const handleSubtractAvgSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isWindowSizeValid) {
      setShowError(true);
      return;
    }
    setBScan(subtractAvg(bScan, selectedOption));
    addOperation({
      type: `subtract_${selectedOption}`,
      windowSize: Number(internalWindowSize),
    });
  };

  const subtractAvg = (bScan: Grid2D, option: 'median' | 'mean'): Grid2D => {
    if (option === 'median') {
      return subtractMedian(bScan, Number(internalWindowSize));
    } else {
      return subtractMean(bScan, Number(internalWindowSize));
    }
  };

  return (
    <form
      className="flex flex-col gap-2"
      noValidate
      onSubmit={handleSubtractAvgSubmit}
    >
      <div className="flex flex-row">
        <Button variant="outline" size="icon" type="submit" className="mr-2">
          <ListMinusIcon />
        </Button>
        <Label className="flex-1 gap-2">{t('subtractAvg')}</Label>
        <RadioGroup
          value={selectedOption}
          onValueChange={(value) =>
            setSelectedOption(value as 'median' | 'mean')
          }
          className="flex flex-col gap-2 max-w-25"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="median" id="median" />
            <Label htmlFor="median">{t('median')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="mean" id="mean" />
            <Label htmlFor="mean">{t('mean')}</Label>
          </div>
        </RadioGroup>

        <Input
          id="subtract-avg"
          type="number"
          min={1}
          max={bScan.cols}
          step={1}
          inputMode="numeric"
          value={internalWindowSize}
          aria-invalid={showError && !isWindowSizeValid}
          aria-describedby={
            showError && !isWindowSizeValid ? 'subtract-avg-error' : undefined
          }
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
      </div>
      {showError && !isWindowSizeValid && (
        <FieldError id="subtract-avg-error">{windowSizeError}</FieldError>
      )}
    </form>
  );
}
