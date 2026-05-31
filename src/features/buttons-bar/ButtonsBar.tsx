import { Button } from "@/components/ui/button";
import { FolderOpenIcon } from "lucide-react";
import { loadFileHandler } from "../main-menu/shared-file";

export default function ButtonsBar() {
  return (
    <div
      className="flex flex-row gap-2 p-1"
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
  );
}
