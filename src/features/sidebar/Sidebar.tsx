import NavItem from './NavItem';
import {
  BookIcon,
  BotIcon,
  RulerDimensionLineIcon,
  SettingsIcon,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import UnitsMeasurement from './units-of-measurement/UnitsMeasurement';
import { useTranslation } from 'react-i18next';
import Processing from './processing/Processing';

const Sidebar = () => {
  const { sideBarVisible } = useUiStore();
  const { t } = useTranslation();

  if (!sideBarVisible) return null;

  return (
    <div className="flex flex-col min-h-0 w-sm shrink-0 border-purple-500 border-solid border-2">
      <nav className="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
        <p className="text-xs text-muted-foreground px-3 pb-1">Processing</p>

        <NavItem
          icon={<RulerDimensionLineIcon />}
          label={t('UnitsOfMeasurement')}
        >
          <UnitsMeasurement />
        </NavItem>

        <NavItem icon={<BotIcon />} label="Processing">
          <Processing />
        </NavItem>
        <NavItem icon={<BookIcon />} label="Documentation">
          null
        </NavItem>
        <NavItem icon={<SettingsIcon />} label="Settings">
          <a href="#">History</a>
          <a href="#">Starred</a>
          <a href="#">Settings</a>
        </NavItem>
      </nav>
    </div>
  );
};

export default Sidebar;
