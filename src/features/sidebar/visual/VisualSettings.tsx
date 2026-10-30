import useUiStore from '@/stores/ui-store';
import BScanCmpTransparency from './BScanCmpTransparency';
import BScanCurvesColor from './BScanCurvesColor';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpTransparency from './CmpTransparency';
import ShowDepthAxis from './ShowDepthAxis';
import { useTranslation } from 'react-i18next';
import ShowTotalLines from './ShowTotalLines';
import ShowIntervalLines from './ShowIntervalLines';
import PointAspectRatio from './PointAspectRatio';
import { Separator } from '@/components/ui/separator';

export default function VisualSettings() {
  const cmpMode = useUiStore.use.cmpMode();
  const hyperbolaMode = useUiStore.use.hyperbolaMode();
  const { t } = useTranslation();
  return (
    <div>
      <PointAspectRatio />
      <Separator />
      <ShowDepthAxis />
      {(cmpMode || hyperbolaMode) && <Separator />}
      {cmpMode && <ShowIntervalLines />}
      {cmpMode && <ShowTotalLines />}
      {cmpMode && <CmpSemblanceLinesColor />}
      {cmpMode && <CmpTransparency />}
      {cmpMode && <BScanCurvesColor label={t('CmpBscanLines')} />}
      {hyperbolaMode && <BScanCurvesColor label={t('Hyperbola')} />}
      {(cmpMode || hyperbolaMode) && <BScanCmpTransparency />}
    </div>
  );
}
