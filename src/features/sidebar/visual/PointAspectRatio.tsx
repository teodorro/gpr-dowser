import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';

export default function PointAspectRatio() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <PointAspectRatioInternal key={selectedFileId} store={store} />;
}

function PointAspectRatioInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const pointAspectRatio = useStore(store, (s) => s.pointAspectRatio);
  const setPointAspectRatio = useStore(store, (s) => s.setPointAspectRatio);

  return (
    <div className="flex flex-col gap-2 my-2">
      <FieldLabel className="shrink-0 ml-2" htmlFor="pointAspectRatioTitle">
        {t('PointAspectRatio')}
      </FieldLabel>
      <div className="flex flex-row gap-2 mx-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="pointAspectRatio">
          {pointAspectRatio}
        </FieldLabel>
        <Slider
          value={[pointAspectRatio]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => setPointAspectRatio(value[0])}
        />
      </div>
    </div>
  );
}
