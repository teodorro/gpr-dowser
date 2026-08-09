import { FieldLabel } from '@/components/ui/field';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useTranslation } from 'react-i18next';
import useVisualStore from '@/stores/visual-store';

export default function CmpSemblanceLinesColor() {
  const { t } = useTranslation();
  const cmpSemblanceLinesColor = useVisualStore.use.cmpSemblanceLinesColor();
  const setCmpSemblanceLinesColor =
    useVisualStore.use.setCmpSemblanceLinesColor();

  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="cmpSemblanceLinesColor">
        {t('CmpSemblanceLines')}
      </FieldLabel>
      <ColorPicker
        value={cmpSemblanceLinesColor}
        onChange={setCmpSemblanceLinesColor}
      />
    </div>
  );
}
