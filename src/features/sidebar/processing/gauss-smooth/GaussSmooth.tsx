import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { AudioWaveformIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { gaussianSmooth } from './gaussian-smooth';
import { OperationTypeList } from '@/stores/undo-redo.types';
import { Slider } from '@/components/ui/slider';

export default function GaussSmooth() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <GaussSmoothInternal key={selectedFileId} store={store} />;
}

function GaussSmoothInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const [sigmaHorizontal, setSigmaHorizontal] = useState(0.6);
  const [sigmaVertical, setSigmaVertical] = useState(0.6);

  const handleGaussSmoothSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newBScan = gaussianSmooth(bScan, sigmaHorizontal, sigmaVertical);
    setBScan(newBScan);
    addOperation({
      type: OperationTypeList.GaussSmooth,
      sigmaHorizontal,
      sigmaVertical,
    });
  };

  return (
    <form
      className="flex flex-row justify-between mb-1"
      onSubmit={handleGaussSmoothSubmit}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center">
          <Button
            variant="outline"
            size="icon"
            type="submit"
            className="shrink-0"
          >
            <AudioWaveformIcon />
          </Button>
          <FieldLabel className="shrink-0 ml-2">{t('GaussSmooth')}</FieldLabel>
        </div>
        <div className="flex flex-row items-center">
          <FieldLabel className="shrink-0 w-32 ml-2">
            {t('SigmaHorizontal')}
          </FieldLabel>
          <div className="flex flex-col gap-2 mx-1">
            <FieldLabel
              className="shrink-0 ml-2"
              htmlFor="sg-horizontal-window"
            >
              {sigmaHorizontal}
            </FieldLabel>
            <Slider
              value={[sigmaHorizontal]}
              min={0}
              max={3}
              step={0.1}
              onValueChange={(value) => setSigmaHorizontal(value[0])}
              className="w-48"
            />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <FieldLabel className="shrink-0 w-32 ml-2">
            {t('SigmaVertical')}
          </FieldLabel>
          <div className="flex flex-col gap-2 mx-1">
            <FieldLabel className="shrink-0 ml-2" htmlFor="sg-vertical-window">
              {sigmaVertical}
            </FieldLabel>
            <Slider
              value={[sigmaVertical]}
              min={0}
              max={3}
              step={0.1}
              onValueChange={(value) => setSigmaVertical(value[0])}
              className="w-48"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
