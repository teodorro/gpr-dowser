import { useUiStore } from '@/stores/ui-store';
import BScanCmpTransparency from './BScanCmpTransparency';
import CmpBscanLinesColor from './CmpBscanLinesColor';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpTransparency from './CmpTransparency';

export default function VisualSettings() {
  const cmpMode = useUiStore.use.cmpMode();
  return (
    <div>
      {cmpMode && (
        <>
          <CmpSemblanceLinesColor />
          <CmpBscanLinesColor />
          <CmpTransparency />
          <BScanCmpTransparency />
        </>
      )}
    </div>
  );
}
