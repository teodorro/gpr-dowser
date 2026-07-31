import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/ui-store';

export default function CmpSemblanceLinesColor() {
  const { t } = useTranslation();
  const cmpSemblanceLinesColor = useUiStore.use.cmpSemblanceLinesColor();
  const setCmpSemblanceLinesColor = useUiStore.use.setCmpSemblanceLinesColor();

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpSemblanceLinesColor">
        {t('CmpSemblanceLinesColor')}
      </FieldLabel>
      <ColorPicker
        value={cmpSemblanceLinesColor}
        onChange={setCmpSemblanceLinesColor}
      />
    </div>
  );
}
