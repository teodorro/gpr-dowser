import { Menubar } from "@/components/ui/menubar";
import SettingsMenu from "./SettingsMenu";
import FileMenu from "./FileMenu";
import ViewMenu from "./ViewMenu";

export default function MainMenu() {
  return (
    <Menubar className="border-none">
      <FileMenu />
      <ViewMenu />
      <SettingsMenu />
    </Menubar>
  );
}
