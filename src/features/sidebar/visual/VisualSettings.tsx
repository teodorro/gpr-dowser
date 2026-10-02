import useUiStore from '@/stores/ui-store';
import BScanCmpTransparency from './BScanCmpTransparency';
import BScanCurvesColor from './BScanCurvesColor';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpTransparency from './CmpTransparency';
import ShowDepthAxis from './ShowDepthAxis';
import { useTranslation } from 'react-i18next';

export default function VisualSettings() {
  const cmpMode = useUiStore.use.cmpMode();
  const hyperbolaMode = useUiStore.use.hyperbolaMode();
  const { t } = useTranslation();
  return (
    <div>
      <ShowDepthAxis />
      {cmpMode && <CmpSemblanceLinesColor />}
      {cmpMode && <BScanCurvesColor label={t('CmpBscanLines')} />}
      {cmpMode && <CmpTransparency />}
      {hyperbolaMode && <BScanCurvesColor label={t('Hyperbola')} />}
      {(cmpMode || hyperbolaMode) && <BScanCmpTransparency />}
    </div>
  );
}
