import { FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';

export default function BScanCmpTransparency() {
  const { t } = useTranslation();

  const bScanCmpTransparency = useVisualStore.use.bScanCmpTransparency();
  const setBScanCmpTransparency = useVisualStore.use.setBScanCmpTransparency();

  return (
    <div className="flex flex-col gap-2 mx-1 my-2 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpTransparency">
        {t('BScanCmpTransparency')}
      </FieldLabel>
      <div className="flex flex-row gap-2 mx-1">
        <FieldLabel className="shrink-0 ml-2" htmlFor="cmpTransparency">
          {bScanCmpTransparency}
        </FieldLabel>
        <Slider
          value={[bScanCmpTransparency]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => setBScanCmpTransparency(value[0])}
        />
      </div>
    </div>
  );
}
