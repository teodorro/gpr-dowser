import { FieldLabel } from '@/components/ui/field';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';

export default function ShowTotalLines() {
  const { t } = useTranslation();
  const showTotalLines = useVisualStore.use.showTotalLines();
  const setShowTotalLines = useVisualStore.use.setShowTotalLines();
  return (
    <div className="flex flex-row gap-2 mx-1 my-3 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="showTotalLines">
        {t('ShowTotalLines')}
      </FieldLabel>
      <Switch checked={showTotalLines} onCheckedChange={setShowTotalLines} />
    </div>
  );
}
