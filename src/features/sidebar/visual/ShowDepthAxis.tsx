import { FieldLabel } from '@/components/ui/field';
import useVisualStore from '@/stores/visual-store';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';

export default function ShowDepthAxis() {
  const { t } = useTranslation();
  const showDepthAxis = useVisualStore.use.showDepthAxis();
  const setShowDepthAxis = useVisualStore.use.setShowDepthAxis();
  return (
    <div className="flex flex-row gap-2 m-1 justify-between">
      <FieldLabel className="shrink-0 ml-2" htmlFor="showDepthAxis">
        {t('ShowDepthAxis')}
      </FieldLabel>
      <Switch checked={showDepthAxis} onCheckedChange={setShowDepthAxis} />
    </div>
  );
}
