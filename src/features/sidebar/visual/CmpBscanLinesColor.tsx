import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import useVisualStore from '@/stores/visual-store';

export default function CmpBscanLinesColor() {
  const { t } = useTranslation();
  const cmpBScanLinesColor = useVisualStore.use.cmpBScanLinesColor();
  const setCmpBScanLinesColor = useVisualStore.use.setCmpBScanLinesColor();

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpBscanLinesColor">
        {t('CmpBscanLines')}
      </FieldLabel>
      <ColorPicker
        value={cmpBScanLinesColor}
        onChange={setCmpBScanLinesColor}
      />
    </div>
  );
}
