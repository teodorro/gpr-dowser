import { FieldLabel } from '@/components/ui/field';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';

export default function ShowIntervalLines() {
  const { t } = useTranslation();
  const showIntervalLines = useVisualStore.use.showIntervalLines();
  const setShowIntervalLines = useVisualStore.use.setShowIntervalLines();
  return (
    <div className="flex flex-row gap-2 mx-1 my-3 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="showIntervalLines">
        {t('ShowIntervalLines')}
      </FieldLabel>
      <Switch
        checked={showIntervalLines}
        onCheckedChange={setShowIntervalLines}
      />
    </div>
  );
}
