import NavItem from './NavItem';
import {
  CalculatorIcon,
  RecycleIcon,
  RulerDimensionLineIcon,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import UnitsMeasurement from './units-of-measurement/UnitsMeasurement';
import { useTranslation } from 'react-i18next';
import Processing from './processing/Processing';
import UndoRedo from './undo-redo/UndoRedo';

const Sidebar = () => {
  const { sideBarVisible } = useUiStore();
  const { t } = useTranslation();

  if (!sideBarVisible) return null;

  return (
    <div className="flex flex-col min-h-0 w-sm shrink-0 rounded-lg border border-border bg-sidebar text-sidebar-foreground">
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
      </nav>
    </div>
  );
};

export default Sidebar;
