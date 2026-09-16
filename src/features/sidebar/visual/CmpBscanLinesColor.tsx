import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import useVisualStore from '@/stores/visual-store';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function CmpBscanLinesColor() {
  const { t } = useTranslation();
  const cmpBScanLinesColor = useVisualStore.use.bScanLinesColor();
  const setCmpBScanLinesColor = useVisualStore.use.setBScanLinesColor();
  const setBScanLinesWidth = useVisualStore.use.setBScanLinesWidth();
  const bScanLinesWidth = useVisualStore.use.bScanLinesWidth();

  const [internalBScanLinesWidth, setInternalBScanLinesWidth] =
    useState<string>(bScanLinesWidth.toString());

  useEffect(() => {
    if (internalBScanLinesWidth !== '') {
      setBScanLinesWidth(Number(internalBScanLinesWidth));
    }
  }, [internalBScanLinesWidth, setBScanLinesWidth]);

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpBscanLinesColor">
        {t('CmpBscanLines')}
      </FieldLabel>

      <div className="flex flex-row gap-2">
        <ColorPicker
          value={cmpBScanLinesColor}
          onChange={setCmpBScanLinesColor}
        />
        <Input
          id="time-step"
          type="number"
          min={0}
          step="0.5"
          value={bScanLinesWidth}
          onChange={(e) => {
            const w = e.target.value;
            if (w === '' || Number(w) >= 0) setInternalBScanLinesWidth(w);
          }}
          onBlur={() => {
            setInternalBScanLinesWidth(bScanLinesWidth.toString());
          }}
          className="flex-1 max-w-16"
        />
      </div>
    </div>
  );
}
