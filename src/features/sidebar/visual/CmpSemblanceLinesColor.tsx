import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import useVisualStore from '@/stores/visual-store';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function CmpSemblanceLinesColor() {
  const { t } = useTranslation();
  const cmpSemblanceLinesColor = useVisualStore.use.cmpSemblanceLinesColor();
  const setCmpSemblanceLinesColor =
    useVisualStore.use.setCmpSemblanceLinesColor();
  const setCmpSemblanceLinesWidth =
    useVisualStore.use.setCmpSemblanceLinesWidth();
  const cmpSemblanceLinesWidth = useVisualStore.use.cmpSemblanceLinesWidth();

  const [internalSemblanceLinesWidth, setInternalSemblanceLinesWidth] =
    useState<string>(cmpSemblanceLinesWidth.toString());

  useEffect(() => {
    if (internalSemblanceLinesWidth !== '') {
      setCmpSemblanceLinesWidth(Number(internalSemblanceLinesWidth));
    }
  }, [internalSemblanceLinesWidth, setCmpSemblanceLinesWidth]);

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpSemblanceLinesColor">
        {t('CmpSemblanceLines')}
      </FieldLabel>

      <div className="flex flex-row gap-2">
        <ColorPicker
          value={cmpSemblanceLinesColor}
          onChange={setCmpSemblanceLinesColor}
        />
        <Input
          id="time-step"
          type="number"
          min={0}
          step="0.5"
          value={cmpSemblanceLinesWidth}
          onChange={(e) => {
            const w = e.target.value;
            if (w === '' || Number(w) >= 0) setInternalSemblanceLinesWidth(w);
          }}
          onBlur={() => {
            setInternalSemblanceLinesWidth(cmpSemblanceLinesWidth.toString());
          }}
          className="flex-1 max-w-16"
        />
      </div>
    </div>
  );
}
