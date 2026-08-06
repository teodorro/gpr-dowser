import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/ui-store';

export default function CmpBscanLinesColor() {
  const { t } = useTranslation();
  const cmpBScanLinesColor = useUiStore.use.cmpBScanLinesColor();
  const setCmpBScanLinesColor = useUiStore.use.setCmpBScanLinesColor();

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpBscanLinesColor">
        {t('CmpBscanLinesColor')}
      </FieldLabel>
      <ColorPicker
        value={cmpBScanLinesColor}
        onChange={setCmpBScanLinesColor}
      />
    </div>
  );
}
