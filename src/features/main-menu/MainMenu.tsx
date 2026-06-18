import { Menubar } from '@/components/ui/menubar';
import SettingsMenu from './SettingsMenu';
import FileMenu from './FileMenu';
import ViewMenu from './ViewMenu';
import ImageMenu from './ImageMenu';

export default function MainMenu() {
  return (
    <Menubar className="border-none">
      <FileMenu />
      <ViewMenu />
      <ImageMenu />
      <SettingsMenu />
    </Menubar>
  );
}
