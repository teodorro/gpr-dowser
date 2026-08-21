import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';

export default function DeltaToUpdateLayer() {
  const { t } = useTranslation();
  const deltaToUpdateLayer = useVisualStore.use.deltaToUpdateLayer();
  const setDeltaToUpdateLayer = useVisualStore.use.setDeltaToUpdateLayer();

  return (
    <div className="flex flex-col my-2">
      <FieldLabel className="flex flex-1 ml-2 ">
        {t('DeltaToUpdateLayer')}
      </FieldLabel>
      <div className="flex flex-1 flex-row items-center gap-2 m-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="delta-to-update-layer">
          {deltaToUpdateLayer}
        </FieldLabel>
        <Slider
          value={[deltaToUpdateLayer]}
          min={0}
          max={30}
          step={1}
          onValueChange={(value) => setDeltaToUpdateLayer(value[0])}
          className="w-full"
        />
      </div>
    </div>
  );
}
