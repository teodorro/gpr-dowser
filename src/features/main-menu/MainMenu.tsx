import { Menubar } from "@/components/ui/menubar";
import SettingsMenu from "./SettingsMenu";
import FileMenu from "./FileMenu";

export default function MainMenu() {
  return (
    <Menubar className="border-none">
      <FileMenu />
      <SettingsMenu />
    </Menubar>
  );
}
