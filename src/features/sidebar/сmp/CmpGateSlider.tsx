import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function CmpGateSlider() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpGateSliderInternal store={store} />;
}

function CmpGateSliderInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const cmpGate = useStore(store, (s) => s.cmpGate);
  const setCmpGate = useStore(store, (s) => s.setCmpGate);

  const handleValueChange = (value: number[]) => {
    setCmpGate((value[0] - 1) / 2);
  };

  return (
    <div className="flex flex-col my-2">
      <FieldLabel className="flex flex-1 ml-2 ">
        {t('CmpWaveletLength')}
      </FieldLabel>
      <div className="flex flex-1 flex-row items-center gap-2 m-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="cmp-gate">
          {cmpGate * 2 + 1}
        </FieldLabel>
        <Slider
          value={[cmpGate * 2 + 1]}
          min={1}
          max={30}
          step={2}
          onValueChange={handleValueChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
