import { Label } from '@/components/ui/label';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ListMinusIcon } from 'lucide-react';
import { useState } from 'react';
import type Grid2D from '@/shared/grid2d';
import subtractAverage from './subtract-average';
import subtractMedian from './subtract-median';
import { useStore } from 'zustand';

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
  const [selectedOption, setSelectedOption] = useState<'median' | 'average'>(
    'median',
  );

  const handleSubtractAvgSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBScan(subtractAvg(bScan, selectedOption));
  };

  const subtractAvg = (bScan: Grid2D, option: 'median' | 'average'): Grid2D => {
    if (option === 'median') {
      return subtractMedian(bScan);
    } else {
      return subtractAverage(bScan);
    }
  };

  return (
    <form className="flex flex-row" onSubmit={handleSubtractAvgSubmit}>
      <Button variant="outline" size="icon" type="submit" className="mr-2">
        <ListMinusIcon />
      </Button>
      <Label className="flex-1 gap-2">{t('subtractAvg')}</Label>
      <RadioGroup
        value={selectedOption}
        onValueChange={(value) =>
          setSelectedOption(value as 'median' | 'average')
        }
        className="flex flex-col gap-2 max-w-25"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="median" id="median" />
          <Label htmlFor="median">{t('median')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="average" id="average" />
          <Label htmlFor="average">{t('average')}</Label>
        </div>
      </RadioGroup>
    </form>
  );
}
