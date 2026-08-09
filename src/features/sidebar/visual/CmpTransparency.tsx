import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';

export default function CmpTransparency() {
  const { t } = useTranslation();

  const cmpTransparency = useVisualStore.use.cmpTransparency();
  const setCmpTransparency = useVisualStore.use.setCmpTransparency();

  return (
    <div className="flex flex-col gap-2 mx-1 my-2 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpTransparency">
        {t('CmpTransparency')}
      </FieldLabel>
      <div className="flex flex-row gap-2 mx-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="cmpTransparency">
          {cmpTransparency}
        </FieldLabel>
        <Slider
          value={[cmpTransparency]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => setCmpTransparency(value[0])}
        />
      </div>
    </div>
  );
}
