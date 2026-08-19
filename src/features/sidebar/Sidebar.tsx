import NavItem from './NavItem';
import {
  CalculatorIcon,
  ArrowUpWideNarrowIcon,
  RecycleIcon,
  RulerDimensionLineIcon,
  WallpaperIcon,
} from 'lucide-react';
import useUiStore from '@/stores/ui-store';
import UnitsMeasurement from './units-of-measurement/UnitsMeasurement';
import { useTranslation } from 'react-i18next';
import Processing from './processing/Processing';
import UndoRedo from './undo-redo/UndoRedo';
import CmpSettings from './сmp/CmpSettings';
import VisualSettings from './visual/VisualSettings';

const Sidebar = () => {
  const { sideBarVisible } = useUiStore();
  const { t } = useTranslation();
  const cmpMode = useUiStore.use.cmpMode();

  if (!sideBarVisible) return null;

  return (
    <div className="flex flex-col min-h-0 w-sm shrink-0 rounded-l-lg border border-border bg-sidebar text-sidebar-foreground">
      <nav className="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
        <NavItem
          icon={<RulerDimensionLineIcon />}
          label={t('UnitsOfMeasurement')}
        >
          <UnitsMeasurement />
        </NavItem>

        <NavItem icon={<CalculatorIcon />} label={t('Processing')}>
          <Processing />
        </NavItem>

        <NavItem icon={<RecycleIcon />} label={t('UndoRedo')}>
          <UndoRedo />
        </NavItem>

        <NavItem
          icon={<WallpaperIcon />}
          label={t('VisualSettings')}
          disabled={!cmpMode}
          expanded={cmpMode}
        >
          <VisualSettings />
        </NavItem>

        <NavItem
          icon={<ArrowUpWideNarrowIcon />}
          label={t('CMP')}
          disabled={!cmpMode}
          expanded={cmpMode}
        >
          <CmpSettings />
        </NavItem>
      </nav>
    </div>
  );
};

export default Sidebar;
