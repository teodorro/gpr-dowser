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
  const MAX_POINT_ASPECT_RATIO_LOG = Math.log2(36);
  const toSlider = (value: number) => Math.log2(value);
  const fromSlider = (position: number) => Number((2 ** position).toFixed(2));

  const { t } = useTranslation();
  const pointAspectRatioWidth = useStore(store, (s) => s.pointAspectRatioWidth);
  const setPointAspectRatioWidth = useStore(
    store,
    (s) => s.setPointAspectRatioWidth,
  );
  const pointAspectRatioHeight = useStore(
    store,
    (s) => s.pointAspectRatioHeight,
  );
  const setPointAspectRatioHeight = useStore(
    store,
    (s) => s.setPointAspectRatioHeight,
  );

  return (
    <div className="flex flex-col gap-2 mx-1 my-2">
      <FieldLabel className="shrink-0 ml-2" htmlFor="pointAspectRatioTitle">
        {t('PointAspectRatio')}
      </FieldLabel>
      <div className="flex flex-row gap-2 mx-1 justify-between">
        <FieldLabel className="shrink-0 ml-2" htmlFor="pointAspectRatioWidth">
          {t('PointWidth')}: {pointAspectRatioWidth}
        </FieldLabel>
        <Slider
          className="w-46"
          value={[toSlider(pointAspectRatioWidth)]}
          min={-MAX_POINT_ASPECT_RATIO_LOG}
          max={MAX_POINT_ASPECT_RATIO_LOG}
          step={0.01}
          onValueChange={(value) =>
            setPointAspectRatioWidth(fromSlider(value[0]))
          }
        />
      </div>
      <div className="flex flex-row gap-2 mx-1 justify-between">
        <FieldLabel className="shrink-0 ml-2" htmlFor="pointAspectRatioHeight">
          {t('PointHeight')}: {pointAspectRatioHeight}
        </FieldLabel>
        <Slider
          className="w-46"
          value={[toSlider(pointAspectRatioHeight)]}
          min={-MAX_POINT_ASPECT_RATIO_LOG}
          max={MAX_POINT_ASPECT_RATIO_LOG}
          step={0.01}
          onValueChange={(value) =>
            setPointAspectRatioHeight(fromSlider(value[0]))
          }
        />
      </div>
    </div>
  );
}
