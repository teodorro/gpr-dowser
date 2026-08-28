import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function CmpHalfwaveSlider() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpHalfwaveSliderInternal store={store} />;
}

function CmpHalfwaveSliderInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const cmpHalfwave = useStore(store, (s) => s.cmpHalfwave);
  const setCmpHalfwave = useStore(store, (s) => s.setCmpHalfwave);
  const dt = useStore(store, (s) => s.dt);

  const [cmpHalfwaveInternal, setCmpHalfwaveInternal] = useState(cmpHalfwave);

  return (
    <div className="flex flex-col my-2">
      <FieldLabel className="flex flex-1 ml-2 ">
        {t('CmpHalfWaveLength')}
      </FieldLabel>
      <div className="flex flex-1 flex-row items-center gap-2 m-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="cmp-halfwave">
          {cmpHalfwaveInternal}
        </FieldLabel>
        <Slider
          value={[cmpHalfwaveInternal]}
          min={dt}
          max={80}
          step={dt}
          onValueChange={(value) => {
            setCmpHalfwaveInternal(value[0]);
          }}
          onValueCommit={(value) => {
            setCmpHalfwave(value[0]);
            setCmpHalfwaveInternal(value[0]);
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
