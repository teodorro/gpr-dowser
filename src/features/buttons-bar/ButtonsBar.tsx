import { Button } from "@/components/ui/button";
import { FolderOpenIcon, PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { loadFileHandler } from "../main-menu/shared-handlers";
import { useUiStore } from "@/stores/ui-store";

export default function ButtonsBar() {
  const { sideBarVisible, setSideBarVisible, aScanVisible, setAScanVisible } =
    useUiStore();
  return (
    <div className="flex flex-row gap-1 p-1">
      <div
        className="flex flex-row gap-1"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          accept=".txt, .geo, .gem"
          onChange={(e) => loadFileHandler(e)}
        />
        <Button variant="ghost" size="icon">
          <FolderOpenIcon className="w-4 h-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSideBarVisible(!sideBarVisible)}
      >
        <PanelLeftIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAScanVisible(!aScanVisible)}
      >
        <PanelRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
